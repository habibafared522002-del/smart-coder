import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Star,
  Lock,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Undo2,
  ShieldCheck,
} from 'lucide-react';
import { JuniorAgeGroup, Language, StudentProgress } from '../types';
import {
  JigsawLevelConfig,
  JigsawPiece,
  JigsawTarget,
  loadJigsawLevels,
} from '../data/jigsawLevelsData';
import { PuzzleArtwork } from './PuzzleArtwork';
import {
  playPickupSfx,
  playSnapSfx,
  playRetrySfx,
  playSuccessFanfareSfx,
  speakInstruction,
  setAudioMuted,
  getAudioMuted,
} from '../utils/soundEffects';
import { SmartyMascot3D } from './SmartyMascot3D';

interface JigsawGameEngineProps {
  language: Language;
  progress: StudentProgress;
  onUpdateProgress: (newProgress: StudentProgress) => void;
  onExit: () => void;
  initialLevelNumber?: number;
  adminPreviewMode?: boolean;
  levelsOverride?: JigsawLevelConfig[];
}

interface DragState {
  piece: JigsawPiece;
  sourceTargetId: string | null;
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  hasMoved: boolean;
}

type RobotMood = 'idle' | 'dragging' | 'hint' | 'retry' | 'success';

export const JigsawGameEngine: React.FC<JigsawGameEngineProps> = ({
  language,
  progress,
  onUpdateProgress,
  onExit,
  initialLevelNumber = 1,
  adminPreviewMode = false,
  levelsOverride,
}) => {
  const isAr = language === 'ar';

  // Load live published levels (or all levels in Admin Preview mode)
  const [allLevels, setAllLevels] = useState<JigsawLevelConfig[]>(() => {
    const base = levelsOverride || loadJigsawLevels();
    return adminPreviewMode ? base : base.filter((l) => l.isPublished);
  });

  useEffect(() => {
    if (levelsOverride) {
      setAllLevels(adminPreviewMode ? levelsOverride : levelsOverride.filter((l) => l.isPublished));
      return;
    }
    const refresh = () => {
      const fresh = loadJigsawLevels();
      setAllLevels(adminPreviewMode ? fresh : fresh.filter((l) => l.isPublished));
    };
    window.addEventListener('smartcoders:levels-updated', refresh);
    return () => window.removeEventListener('smartcoders:levels-updated', refresh);
  }, [levelsOverride, adminPreviewMode]);

  const safeLevels = allLevels.length > 0 ? allLevels : loadJigsawLevels();

  const [ageGroup, setAgeGroup] = useState<JuniorAgeGroup>(progress.selectedAgeGroup || '4-5');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(initialLevelNumber);

  useEffect(() => {
    setCurrentLevelNumber(initialLevelNumber);
  }, [initialLevelNumber]);

  const currentLevel = useMemo(() => {
    return (
      safeLevels.find((l) => l.levelNumber === currentLevelNumber) ||
      safeLevels[0]
    );
  }, [safeLevels, currentLevelNumber]);

  const currentIndex = safeLevels.findIndex((l) => l.id === currentLevel.id);

  // Active cognitive variant for selected age tier
  const variant = currentLevel.ageVariants?.[ageGroup] || {
    activePieceIds: currentLevel.pieces.map((p) => p.id),
    activeTargetIds: currentLevel.targets.map((t) => t.id),
    showGhostHints: true,
    strictOrder: currentLevel.validationMode === 'strict_sequence',
    cognitiveNote: { ar: '', en: '' },
  };

  const activePieces = useMemo(
    () => currentLevel.pieces.filter((p) => variant.activePieceIds.includes(p.id)),
    [currentLevel, variant.activePieceIds]
  );

  const activeTargets = useMemo(
    () => currentLevel.targets.filter((t) => variant.activeTargetIds.includes(t.id)),
    [currentLevel, variant.activeTargetIds]
  );

  // Pre-placed contextual scaffold pieces (e.g. Level 5 body at 3-4, Level 10 trunk at 3-4)
  const scaffoldTargetIds = useMemo(
    () =>
      currentLevel.targets
        .filter((t) => !variant.activeTargetIds.includes(t.id))
        .map((t) => t.id),
    [currentLevel, variant.activeTargetIds]
  );

  // Workspace state
  const [placements, setPlacements] = useState<Record<string, string[]>>({});
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [robotMood, setRobotMood] = useState<RobotMood>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<{ ar: string; en: string } | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [xpNotice, setXpNotice] = useState<'awarded' | 'already_earned' | null>(null);
  const [muted, setMuted] = useState<boolean>(getAudioMuted());
  const [attemptCount, setAttemptCount] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);

  const activityKey = `jigsaw-lvl-${currentLevel.levelNumber}-${ageGroup}`;
  const isAlreadyEarned = progress.completedActivityIds.includes(activityKey);
  const maxUnlocked = progress.unlockedJigsawByAge?.[ageGroup] ?? 1;

  // Reset board cleanly whenever level or age changes
  useEffect(() => {
    setPlacements({});
    setSelectedPieceId(null);
    setDragState(null);
    setHoveredTargetId(null);
    setRobotMood('idle');
    setFeedbackMsg(null);
    setIsLevelComplete(false);
    setXpNotice(null);
    setAttemptCount(0);
  }, [currentLevel.id, ageGroup]);

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
  };

  const handleAgeChange = (nextAge: JuniorAgeGroup) => {
    setAgeGroup(nextAge);
    onUpdateProgress({
      ...progress,
      selectedAgeGroup: nextAge,
    });
  };

  const handleResetWorkspace = () => {
    setPlacements({});
    setSelectedPieceId(null);
    setHoveredTargetId(null);
    setRobotMood('idle');
    setFeedbackMsg({
      ar: 'تمت إعادة ضبط اللوحة! اسحب القطع من جديد.',
      en: 'Board reset! Drag the pieces into place.',
    });
    setIsLevelComplete(false);
    setXpNotice(null);
  };

  const placedPieceIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(placements).forEach((arr: string[]) => {
      arr.forEach((id) => ids.add(id));
    });
    return ids;
  }, [placements]);

  const unplacedPieces = useMemo(
    () => activePieces.filter((p) => !placedPieceIds.has(p.id)),
    [activePieces, placedPieceIds]
  );

  // Evaluate placement validation
  const validateDrop = (
    piece: JigsawPiece,
    target: JigsawTarget,
    currentPlacements: Record<string, string[]>
  ): { valid: boolean; reason?: { ar: string; en: string } } => {
    // Mode 1: Category Bin (e.g. Level 4 Sorting)
    if (currentLevel.validationMode === 'category_bin') {
      if (target.acceptsCategory && piece.category === target.acceptsCategory) {
        return { valid: true };
      }
      return {
        valid: false,
        reason: {
          ar: `انتبه! "${piece.label.ar}" لا ينتمي إلى "${target.label.ar}". جرب السلة أو الصندوق الآخر.`,
          en: `Oops! "${piece.label.en}" does not belong in "${target.label.en}". Try the other container.`,
        },
      };
    }

    // Check target compatibility first
    const accepts = target.acceptsPieceIds.includes(piece.id);
    if (!accepts) {
      return {
        valid: false,
        reason: {
          ar: `هذا المكان مخصص لـ "${target.label.ar}". ابحث عن المكان المناسب لـ "${piece.label.ar}".`,
          en: `This spot is for "${target.label.en}". Find the right spot for "${piece.label.en}".`,
        },
      };
    }

    // Mode 2: Strict Sequence Validation (Level 6 & Level 11 at 5-6 or whenever strictOrder is enabled)
    if (currentLevel.validationMode === 'strict_sequence' && variant.strictOrder) {
      const targetSeq = target.sequenceIndex ?? 1;
      const precedingTargets = activeTargets.filter(
        (t) => (t.sequenceIndex ?? 0) < targetSeq
      );
      const missingEarlier = precedingTargets.some(
        (t) => !(currentPlacements[t.id] && currentPlacements[t.id].length > 0)
      );
      if (missingEarlier) {
        const nextExpected = precedingTargets
          .sort((a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0))
          .find((t) => !(currentPlacements[t.id] && currentPlacements[t.id].length > 0));
        return {
          valid: false,
          reason: {
            ar: `الترتيب مهم! أكمل "${nextExpected?.label.ar}" أولاً قبل هذه الخطوة.`,
            en: `Order matters! Complete "${nextExpected?.label.en}" before this step.`,
          },
        };
      }
    }

    return { valid: true };
  };

  const applyPlacement = (
    piece: JigsawPiece,
    target: JigsawTarget,
    sourceTargetId: string | null
  ) => {
    // Remove from previous target if moving an already placed piece
    const cleaned: Record<string, string[]> = {};
    for (const [k, list] of Object.entries(placements) as [string, string[]][]) {
      cleaned[k] = list.filter((id) => id !== piece.id);
    }

    const result = validateDrop(piece, target, cleaned);
    setAttemptCount((c) => c + 1);

    if (!result.valid) {
      playRetrySfx();
      setRobotMood('retry');
      const msg = result.reason || {
        ar: 'حاول مرة أخرى وضع القطعة في مكانها الصحيح.',
        en: 'Try placing this piece in its matching spot.',
      };
      setFeedbackMsg(msg);
      speakInstruction(msg[language], language);
      setSelectedPieceId(null);
      return;
    }

    // Valid placement!
    const updatedPlacements = { ...cleaned };
    if (currentLevel.validationMode === 'category_bin') {
      updatedPlacements[target.id] = [...(updatedPlacements[target.id] || []), piece.id];
    } else {
      updatedPlacements[target.id] = [piece.id];
    }

    setPlacements(updatedPlacements);
    setSelectedPieceId(null);
    playSnapSfx();

    // Check if ALL active pieces are correctly placed
    const totalPlacedCount = Object.values(updatedPlacements).reduce(
      (sum: number, arr: string[]) => sum + arr.length,
      0
    );

    if (totalPlacedCount >= activePieces.length) {
      setIsLevelComplete(true);
      setRobotMood('success');
      playSuccessFanfareSfx();

      const alreadyCompleted = progress.completedActivityIds.includes(activityKey);
      const nextUnlock = Math.max(
        progress.unlockedJigsawByAge?.[ageGroup] ?? 1,
        Math.min(safeLevels.length, currentLevel.levelNumber + 1)
      );

      if (!alreadyCompleted) {
        setXpNotice('awarded');
        const nextProgress: StudentProgress = {
          ...progress,
          selectedAgeGroup: ageGroup,
          completedActivityIds: [...progress.completedActivityIds, activityKey],
          starsEarned: progress.starsEarned + 1,
          xpEarned: (progress.xpEarned ?? progress.starsEarned * 10) + currentLevel.xpReward,
          lastActiveDate: new Date().toISOString().split('T')[0],
          unlockedJigsawByAge: {
            '3-4': progress.unlockedJigsawByAge?.['3-4'] ?? 1,
            '4-5': progress.unlockedJigsawByAge?.['4-5'] ?? 1,
            '5-6': progress.unlockedJigsawByAge?.['5-6'] ?? 1,
            [ageGroup]: nextUnlock,
          },
        };
        onUpdateProgress(nextProgress);
        const winText = isAr
          ? `رائع يا بطل! أكملت ${currentLevel.title.ar} وحصلت على ${currentLevel.xpReward} نقطة XP!`
          : `Awesome job! You completed ${currentLevel.title.en} and earned ${currentLevel.xpReward} XP!`;
        setFeedbackMsg({ ar: winText, en: winText });
        speakInstruction(winText, language);
      } else {
        setXpNotice('already_earned');
        const nextProgress: StudentProgress = {
          ...progress,
          selectedAgeGroup: ageGroup,
          unlockedJigsawByAge: {
            '3-4': progress.unlockedJigsawByAge?.['3-4'] ?? 1,
            '4-5': progress.unlockedJigsawByAge?.['4-5'] ?? 1,
            '5-6': progress.unlockedJigsawByAge?.['5-6'] ?? 1,
            [ageGroup]: nextUnlock,
          },
        };
        onUpdateProgress(nextProgress);
        setFeedbackMsg({
          ar: 'أحسنت! أعدت تركيب اللغز بنجاح تام (تم احتساب نقاط XP مسبقاً).',
          en: 'Great replay! Puzzle solved accurately (XP already awarded for this tier).',
        });
        speakInstruction(
          isAr ? 'أحسنت! أعدت تركيب اللغز بنجاح!' : 'Great job completing the puzzle again!',
          language
        );
      }
    } else {
      setRobotMood('idle');
      setFeedbackMsg({
        ar: sourceTargetId
          ? `تم نقل "${piece.label.ar}" بنجاح!`
          : `أحسنت! تم تثبيت "${piece.label.ar}" — أكمل باقي القطع.`,
        en: sourceTargetId
          ? `Moved "${piece.label.en}" cleanly!`
          : `Great! "${piece.label.en}" snapped in — keep going!`,
      });
    }
  };

  const handleDetachPiece = (pieceId: string) => {
    if (isLevelComplete) return;
    const updated: Record<string, string[]> = {};
    for (const [k, list] of Object.entries(placements) as [string, string[]][]) {
      updated[k] = list.filter((id) => id !== pieceId);
    }
    setPlacements(updated);
    setRobotMood('idle');
    setFeedbackMsg({
      ar: 'تمت إعادة القطعة إلى الصندوق ليمكنك تحريكها.',
      en: 'Piece returned to tray so you can move it freely.',
    });
  };

  // Hit-test target slot DOM nodes against pointer / dragged rect
  const findHitTargetId = (clientX: number, clientY: number, dragRect?: DOMRect): string | null => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-jigsaw-target-id]');
    // 1. Direct pointer point hit check first
    for (const el of Array.from(nodes)) {
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return el.dataset.jigsawTargetId || null;
      }
    }
    // 2. Bounding-box intersection overlap check
    if (dragRect) {
      let bestId: string | null = null;
      let bestArea = 0;
      for (const el of Array.from(nodes)) {
        const r = el.getBoundingClientRect();
        const xOverlap = Math.max(0, Math.min(dragRect.right, r.right) - Math.max(dragRect.left, r.left));
        const yOverlap = Math.max(0, Math.min(dragRect.bottom, r.bottom) - Math.max(dragRect.top, r.top));
        const area = xOverlap * yOverlap;
        if (area > bestArea) {
          bestArea = area;
          bestId = el.dataset.jigsawTargetId || null;
        }
      }
      if (bestArea > 120) return bestId;
    }
    return null;
  };

  const handlePiecePointerDown = (
    e: React.PointerEvent<HTMLElement>,
    piece: JigsawPiece,
    sourceTargetId: string | null = null
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback for synthetic events
    }
    playPickupSfx();
    setRobotMood('dragging');
    setDragState({
      piece,
      sourceTargetId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      offsetX: rect.left - e.clientX,
      offsetY: rect.top - e.clientY,
      width: rect.width,
      height: rect.height,
      hasMoved: false,
    });
  };

  const handlePiecePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const moved = dragState.hasMoved || Math.hypot(dx, dy) > 5;

    const floatingRect = new DOMRect(
      e.clientX + dragState.offsetX,
      e.clientY + dragState.offsetY,
      dragState.width,
      dragState.height
    );
    const hitId = moved ? findHitTargetId(e.clientX, e.clientY, floatingRect) : null;
    setHoveredTargetId(hitId);
    setDragState((prev) =>
      prev
        ? {
            ...prev,
            currentX: e.clientX,
            currentY: e.clientY,
            hasMoved: moved,
          }
        : null
    );
  };

  const handlePiecePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const currentDrag = dragState;
    setDragState(null);
    setHoveredTargetId(null);

    if (!currentDrag.hasMoved) {
      // Tap/Click fallback selection
      setRobotMood('idle');
      if (currentDrag.sourceTargetId) {
        handleDetachPiece(currentDrag.piece.id);
      } else {
        setSelectedPieceId((prev) =>
          prev === currentDrag.piece.id ? null : currentDrag.piece.id
        );
      }
      return;
    }

    const floatingRect = new DOMRect(
      e.clientX + currentDrag.offsetX,
      e.clientY + currentDrag.offsetY,
      currentDrag.width,
      currentDrag.height
    );
    const hitTargetId = findHitTargetId(e.clientX, e.clientY, floatingRect);

    if (hitTargetId) {
      const target = activeTargets.find((t) => t.id === hitTargetId);
      if (target) {
        applyPlacement(currentDrag.piece, target, currentDrag.sourceTargetId);
        return;
      }
    }

    // If dragged out of an existing target into open tray space -> return piece to tray
    if (currentDrag.sourceTargetId) {
      handleDetachPiece(currentDrag.piece.id);
      return;
    }

    // Dropped outside any valid slot
    setRobotMood('idle');
    setFeedbackMsg({
      ar: 'أفلت القطعة فوق أحد أهداف اللوحة في الجهة المقابلة.',
      en: 'Drop the piece directly over one of the target zones on the board.',
    });
  };

  const handlePiecePointerCancel = () => {
    setDragState(null);
    setHoveredTargetId(null);
    setRobotMood('idle');
  };

  const handleTargetClick = (target: JigsawTarget) => {
    if (!selectedPieceId) return;
    const piece = activePieces.find((p) => p.id === selectedPieceId);
    if (piece) {
      applyPlacement(piece, target, null);
    }
  };

  const handleEnjoyment = (mood: 'loved' | 'okay') => {
    const nextProgress: StudentProgress = {
      ...progress,
      enjoymentRatings: {
        ...(progress.enjoymentRatings || {}),
        [activityKey]: mood,
      },
    };
    onUpdateProgress(nextProgress);
  };

  const handleNextLevel = () => {
    if (currentIndex < safeLevels.length - 1) {
      setCurrentLevelNumber(safeLevels[currentIndex + 1].levelNumber);
    } else {
      onExit();
    }
  };

  const instructionText =
    variant.instructionOverride?.[language] || currentLevel.instruction[language];

  // Helper to render a single target drop zone cleanly
  const renderTargetSlot = (
    target: JigsawTarget,
    extraClasses = '',
    seamlessMode = false
  ) => {
    const placedIds = placements[target.id] || [];
    const placedItems = placedIds
      .map((id) => currentLevel.pieces.find((p) => p.id === id))
      .filter(Boolean) as JigsawPiece[];
    const isHovered = hoveredTargetId === target.id;
    const isScaffold = scaffoldTargetIds.includes(target.id);
    const hasPlacement = placedItems.length > 0;

    if (isScaffold) {
      // Pre-mounted contextual scaffold for Ages 3-4
      return (
        <div
          key={target.id}
          className={`relative flex items-center justify-center overflow-hidden ${
            seamlessMode
              ? 'bg-transparent'
              : 'rounded-xl border border-emerald-400/60 bg-emerald-50/40 dark:bg-emerald-950/30 p-2'
          } ${extraClasses}`}
        >
          <PuzzleArtwork
            artworkKey={target.artworkKey}
            className={seamlessMode ? 'w-full h-full' : 'w-16 h-16'}
          />
        </div>
      );
    }

    if (currentLevel.validationMode === 'category_bin') {
      return (
        <div
          key={target.id}
          data-jigsaw-target-id={target.id}
          onClick={() => handleTargetClick(target)}
          className={`relative rounded-2xl border-2 border-dashed p-4 transition-all flex flex-col items-center justify-between min-h-[210px] cursor-pointer ${
            isHovered
              ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 scale-[1.02]'
              : `${target.color} bg-white dark:bg-slate-900`
          } ${extraClasses}`}
        >
          <div className="flex flex-col items-center">
            <PuzzleArtwork artworkKey={target.artworkKey} className="w-24 h-20" />
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {target.label[language]}
            </span>
          </div>

          <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 justify-center min-h-[54px]">
            {placedItems.length === 0 ? (
              <span className="text-xs text-slate-400">
                {isAr ? 'اسحب العناصر المناسبة هنا' : 'Drop matching items here'}
              </span>
            ) : (
              placedItems.map((item) => (
                <div
                  key={item.id}
                  data-placed-piece-id={item.id}
                  onPointerDown={(e) => handlePiecePointerDown(e, item, target.id)}
                  onPointerMove={handlePiecePointerMove}
                  onPointerUp={handlePiecePointerUp}
                  onPointerCancel={handlePiecePointerCancel}
                  className="touch-none select-none flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 cursor-grab active:cursor-grabbing animate-snap"
                  title={isAr ? 'اسحب للنقل أو اضغط للإعادة' : 'Drag to move or tap to remove'}
                >
                  <PuzzleArtwork artworkKey={item.artworkKey} className="w-7 h-7" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    {item.label[language]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={target.id}
        data-jigsaw-target-id={target.id}
        onClick={() => handleTargetClick(target)}
        className={`relative flex flex-col items-center justify-center transition-all select-none ${
          seamlessMode
            ? `overflow-hidden ${
                hasPlacement
                  ? 'border-0'
                  : isHovered
                  ? 'ring-2 ring-inset ring-red-600 bg-red-50/60 dark:bg-red-950/40'
                  : 'border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40'
              }`
            : `rounded-2xl p-3 border-2 ${
                hasPlacement
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm'
                  : isHovered
                  ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 scale-[1.02]'
                  : `border-dashed ${target.color} bg-white dark:bg-slate-900 hover:border-red-400`
              }`
        } ${selectedPieceId && !hasPlacement ? 'cursor-pointer ring-2 ring-red-400/50' : ''} ${extraClasses}`}
      >
        {hasPlacement ? (
          <div
            data-placed-piece-id={placedItems[0].id}
            onPointerDown={(e) => handlePiecePointerDown(e, placedItems[0], target.id)}
            onPointerMove={handlePiecePointerMove}
            onPointerUp={handlePiecePointerUp}
            onPointerCancel={handlePiecePointerCancel}
            className={`touch-none select-none w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing animate-snap ${
              dragState?.piece.id === placedItems[0].id ? 'opacity-30' : ''
            }`}
          >
            <PuzzleArtwork
              artworkKey={placedItems[0].artworkKey}
              className={seamlessMode ? 'w-full h-full' : 'w-16 h-16'}
            />
            {!seamlessMode && (
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-1 whitespace-nowrap">
                {placedItems[0].label[language]}
              </span>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none">
            {variant.showGhostHints ? (
              <PuzzleArtwork
                artworkKey={target.artworkKey}
                silhouette
                className={seamlessMode ? 'w-full h-full opacity-55' : 'w-14 h-14 opacity-60'}
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400">
                ?
              </div>
            )}
            {!seamlessMode && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 text-center">
                {target.label[language]}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Dedicated Scene Board Layouts so complete pictures assemble seamlessly
  const renderTargetBoard = () => {
    const mode = currentLevel.layoutMode;

    if (mode === 'sorting_bins') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {activeTargets.map((t) => renderTargetSlot(t))}
        </div>
      );
    }

    if (mode === 'robot_blueprint') {
      const findT = (slot: string) =>
        currentLevel.targets.find((t) => t.positionSlot === slot);
      const tHead = findT('head');
      const tArmL = findT('arm-l');
      const tBody = findT('body');
      const tArmR = findT('arm-r');
      const tLegs = findT('legs');

      return (
        <div dir="ltr" className="flex flex-col items-center gap-2 max-w-[340px] mx-auto">
          {tHead && renderTargetSlot(tHead, 'w-28 h-24')}
          <div className="flex items-center justify-center gap-2">
            {tArmL && variant.activeTargetIds.includes(tArmL.id) && renderTargetSlot(tArmL, 'w-20 h-28')}
            {tBody && renderTargetSlot(tBody, 'w-32 h-28')}
            {tArmR && variant.activeTargetIds.includes(tArmR.id) && renderTargetSlot(tArmR, 'w-20 h-28')}
          </div>
          {tLegs && variant.activeTargetIds.includes(tLegs.id) && renderTargetSlot(tLegs, 'w-32 h-24')}
        </div>
      );
    }

    if (mode === 'butterfly_triptych') {
      const left = currentLevel.targets.find((t) => t.positionSlot === 'left');
      const center = currentLevel.targets.find((t) => t.positionSlot === 'center');
      const right = currentLevel.targets.find((t) => t.positionSlot === 'right');
      return (
        <div
          dir="ltr"
          className={`mx-auto w-[300px] h-[270px] rounded-2xl overflow-hidden border-2 transition-all grid grid-cols-[84fr_32fr_84fr] ${
            isLevelComplete
              ? 'border-emerald-500 shadow-lg'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          {left && renderTargetSlot(left, 'w-full h-full', true)}
          {center && renderTargetSlot(center, 'w-full h-full', true)}
          {right && renderTargetSlot(right, 'w-full h-full', true)}
        </div>
      );
    }

    if (mode === 'plant_vertical') {
      return (
        <div
          className={`flex flex-col items-center w-[220px] mx-auto rounded-2xl overflow-hidden border-2 transition-all p-2 ${
            isLevelComplete
              ? 'border-emerald-500 bg-sky-50/70 dark:bg-slate-900 shadow-lg'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
          }`}
        >
          {activeTargets.map((t) => renderTargetSlot(t, 'w-full h-[58px] !p-0.5', true))}
        </div>
      );
    }

    if (mode === 'split_2_vertical') {
      return (
        <div
          dir="ltr"
          className={`mx-auto w-[260px] h-[260px] rounded-2xl overflow-hidden border-2 transition-all grid grid-rows-2 ${
            isLevelComplete
              ? 'border-emerald-500 shadow-lg'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          {currentLevel.targets.map((t) => renderTargetSlot(t, 'w-full h-full', true))}
        </div>
      );
    }

    if (mode === 'split_3_strips') {
      return (
        <div
          dir="ltr"
          className={`mx-auto w-[210px] h-[315px] rounded-2xl overflow-hidden border-2 transition-all grid grid-rows-3 ${
            isLevelComplete
              ? 'border-emerald-500 shadow-lg'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          {currentLevel.targets.map((t) => renderTargetSlot(t, 'w-full h-full', true))}
        </div>
      );
    }

    if (mode === 'split_3_horizontal') {
      return (
        <div
          dir="ltr"
          className={`mx-auto w-[330px] h-[195px] rounded-2xl overflow-hidden border-2 transition-all grid grid-cols-3 ${
            isLevelComplete
              ? 'border-emerald-500 shadow-lg'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          {currentLevel.targets.map((t) => renderTargetSlot(t, 'w-full h-full', true))}
        </div>
      );
    }

    if (mode === 'grid_2x2') {
      return (
        <div
          dir="ltr"
          className={`mx-auto w-[280px] h-[280px] rounded-2xl overflow-hidden border-2 transition-all grid grid-cols-2 grid-rows-2 ${
            isLevelComplete
              ? 'border-emerald-500 shadow-lg'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          {currentLevel.targets.map((t) => renderTargetSlot(t, 'w-full h-full', true))}
        </div>
      );
    }

    if (mode === 'sequence_track') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          {activeTargets.map((t, idx) => (
            <React.Fragment key={t.id}>
              {renderTargetSlot(t, 'w-36 h-36')}
              {idx < activeTargets.length - 1 && (
                <span className="text-slate-400 font-bold text-lg" aria-hidden="true">
                  {isAr ? '←' : '→'}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (mode === 'lab_scene') {
      return (
        <div className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 text-center">
            {isAr ? 'منصة معمل سمارت تك للروبوتات' : 'SmartTech Robotics Lab Workbench'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {activeTargets.map((t) => renderTargetSlot(t, 'min-h-[126px]'))}
          </div>
        </div>
      );
    }

    // Default free_slots (L1 shapes, L2 shadows, or admin custom levels)
    return (
      <div className="grid grid-cols-2 gap-4 w-full">
        {activeTargets.map((t) => renderTargetSlot(t, 'min-h-[132px]'))}
      </div>
    );
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-6xl mx-auto my-6 overflow-hidden text-slate-900 dark:text-slate-100"
      data-testid="jigsaw-game-engine"
      data-level-number={currentLevel.levelNumber}
      data-age-group={ageGroup}
    >
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-white p-1.5 rounded-lg shrink-0">
            <img
              src="/assets/aistudio/Asset_2_4787d13f.png"
              alt="SmartTech"
              className="h-6 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{isAr ? 'مسار جونيور' : 'Junior Track'}</span>
              <span aria-hidden="true">·</span>
              <span>
                {isAr
                  ? `المستوى ${currentLevel.levelNumber} من ${safeLevels.length}`
                  : `Level ${currentLevel.levelNumber} of ${safeLevels.length}`}
              </span>
              {adminPreviewMode && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isAr ? 'معاينة الإدارة' : 'Admin Preview'}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-base font-bold text-white truncate">
              {currentLevel.title[language]}
            </h2>
          </div>
        </div>

        {/* Age Group Segmented Selector + XP + Audio + Exit */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700"
            role="group"
            aria-label={isAr ? 'الفئة العمرية' : 'Age Group'}
          >
            {(['3-4', '4-5', '5-6'] as JuniorAgeGroup[]).map((tier) => (
              <button
                key={tier}
                type="button"
                data-age-btn={tier}
                onClick={() => handleAgeChange(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                  ageGroup === tier
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {isAr ? `${tier} سنوات` : `${tier} yrs`}
              </button>
            ))}
          </div>

          <div
            data-testid="xp-counter"
            className="flex items-center gap-1.5 bg-amber-400 text-slate-900 px-3 py-1.5 rounded-xl text-xs font-black tabular-nums whitespace-nowrap shrink-0"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>{progress.xpEarned ?? progress.starsEarned * 10} XP</span>
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={muted ? (isAr ? 'تشغيل الصوت' : 'Unmute audio') : (isAr ? 'كتم الصوت' : 'Mute audio')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={onExit}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0"
          >
            {isAr ? 'خروج' : 'Exit'}
          </button>
        </div>
      </div>

      {/* 12-Level Stepper Bar */}
      <div className="bg-slate-100 dark:bg-slate-950/60 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        {safeLevels.map((lvl) => {
          const lvlKey = `jigsaw-lvl-${lvl.levelNumber}-${ageGroup}`;
          const completed = progress.completedActivityIds.includes(lvlKey);
          const unlocked = adminPreviewMode || lvl.levelNumber <= maxUnlocked || completed;
          const active = lvl.levelNumber === currentLevel.levelNumber;

          return (
            <button
              key={lvl.id}
              type="button"
              disabled={!unlocked}
              data-level-nav={lvl.levelNumber}
              onClick={() => unlocked && setCurrentLevelNumber(lvl.levelNumber)}
              title={lvl.title[language]}
              className={`min-w-[40px] h-10 px-2.5 rounded-xl text-xs font-bold tabular-nums flex items-center justify-center gap-1 whitespace-nowrap shrink-0 transition-all ${
                active
                  ? 'bg-red-600 text-white shadow-sm'
                  : completed
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                  : unlocked
                  ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-red-400'
                  : 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>{lvl.levelNumber}</span>
              {completed && <CheckCircle2 className="w-3.5 h-3.5" />}
              {!unlocked && <Lock className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      {/* Instruction & SmartTech Robot Companion Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Interactive 3D SmartTech Robot Companion Expression */}
          <div
            data-testid="robot-companion"
            data-robot-mood={robotMood}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center border shrink-0 transition-colors p-1 ${
              robotMood === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400'
                : robotMood === 'retry'
                ? 'bg-amber-100 dark:bg-amber-950 border-amber-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <SmartyMascot3D
              action={
                robotMood === 'success'
                  ? 'celebrating'
                  : robotMood === 'retry'
                  ? 'encouraging'
                  : robotMood === 'hint'
                  ? 'thinking'
                  : robotMood === 'dragging'
                  ? 'pointing'
                  : 'greeting'
              }
              size="md"
              lang={language}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{currentLevel.objective[language]}</span>
              {variant.cognitiveNote?.[language] && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {variant.cognitiveNote[language]}
                  </span>
                </>
              )}
            </div>
            <h3 data-testid="level-instruction" className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {instructionText}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => speakInstruction(currentLevel.audioText[language] || instructionText, language)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-4 h-4 text-red-600" />
            <span>{isAr ? 'استماع' : 'Listen'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRobotMood('hint');
              setFeedbackMsg(currentLevel.hint);
              speakInstruction(currentLevel.hint[language], language);
            }}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'تلميح' : 'Hint'}</span>
          </button>

          <button
            type="button"
            data-testid="reset-level-btn"
            onClick={handleResetWorkspace}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner (explicit icon + text, never hue-only) */}
      {feedbackMsg && !isLevelComplete && (
        <div
          data-testid="feedback-banner"
          data-feedback-mood={robotMood}
          className={`mx-6 mt-5 px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold ${
            robotMood === 'retry'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
          }`}
        >
          <span>{feedbackMsg[language]}</span>
          {attemptCount > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
              {isAr ? `المحاولة ${attemptCount}` : `Attempt ${attemptCount}`}
            </span>
          )}
        </div>
      )}

      {/* Main Two-Zone Interactive Stage */}
      <div ref={boardRef} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Draggable Pieces Tray */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'قطع التحدي (اسحب وأفلت)' : 'Puzzle Pieces (Drag & Drop)'}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {unplacedPieces.length} / {activePieces.length}
              </span>
            </div>

            {unplacedPieces.length === 0 ? (
              <div className="min-h-[180px] flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  {isAr ? 'تم وضع جميع القطع على اللوحة!' : 'All pieces placed on the board!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 min-h-[180px]">
                {unplacedPieces.map((piece) => {
                  const isBeingDragged = dragState?.piece.id === piece.id && dragState.hasMoved;
                  const isSelected = selectedPieceId === piece.id;
                  return (
                    <div
                      key={piece.id}
                      role="button"
                      tabIndex={0}
                      data-jigsaw-piece-id={piece.id}
                      onPointerDown={(e) => handlePiecePointerDown(e, piece, null)}
                      onPointerMove={handlePiecePointerMove}
                      onPointerUp={handlePiecePointerUp}
                      onPointerCancel={handlePiecePointerCancel}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPieceId((prev) => (prev === piece.id ? null : piece.id));
                        }
                      }}
                      className={`touch-none select-none cursor-grab active:cursor-grabbing rounded-2xl p-3 border-2 flex flex-col items-center justify-center gap-2 transition-transform duration-150 ${piece.color} ${
                        isSelected
                          ? 'border-red-600 ring-2 ring-red-500/40 scale-[1.03]'
                          : 'border-slate-200 dark:border-slate-700 hover:border-red-400 hover:-translate-y-0.5'
                      } ${isBeingDragged ? 'opacity-25' : 'opacity-100'}`}
                    >
                      <div className="pointer-events-none flex items-center justify-center w-20 h-16">
                        <PuzzleArtwork artworkKey={piece.artworkKey} className="w-full h-full max-w-[76px] max-h-[64px]" />
                      </div>
                      <span className="pointer-events-none text-xs font-bold text-slate-900 dark:text-slate-100 text-center">
                        {piece.label[language]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {Object.keys(placements).some((k) => (placements[k]?.length ?? 0) > 0) && !isLevelComplete && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 flex items-center gap-1.5">
                <Undo2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isAr
                    ? 'يمكنك سحب أو لمس أي قطعة موضوعة لإعادتها أو تغيير مكانها.'
                    : 'Drag or tap any placed piece on the board to move or return it.'}
                </span>
              </p>
            )}
          </div>

          {/* Target Puzzle / Scene Canvas */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
            <div className="w-full flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'لوحة التركيب والأهداف' : 'Assembly & Target Canvas'}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {isAr
                  ? `المكتمل: ${placedPieceIds.size} / ${activePieces.length}`
                  : `Placed: ${placedPieceIds.size} / ${activePieces.length}`}
              </span>
            </div>

            {renderTargetBoard()}
          </div>
        </div>

        {/* Level Completion & Enjoyment Reaction Card */}
        {isLevelComplete && (
          <div
            data-testid="level-complete-panel"
            className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-snap"
          >
            <div className="flex items-center gap-4">
              <SmartyMascot3D action="victory" size="lg" lang={language} />
              <div className="space-y-2 text-center md:text-start">
                <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-700 dark:text-emerald-300 font-black text-xl">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>
                    {isAr
                      ? 'عمل ممتاز! تم تجميع الصورة وإتمام المستوى!'
                      : 'Excellent Work! Puzzle Reconstructed & Completed!'}
                  </span>
                </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {xpNotice === 'awarded'
                  ? isAr
                    ? `حصلت على +${currentLevel.xpReward} XP وتم حفظ تقدمك وفتح المستوى التالي.`
                    : `Earned +${currentLevel.xpReward} XP! Progress saved and next level unlocked.`
                  : isAr
                  ? 'تم التحقق من الإجابة! (نقاط XP لهذا المستوى احتُسبت مسبقاً).'
                  : 'Verified completion! (XP for this level & age tier was already awarded).'}
              </p>

              {/* Optional Enjoyment Feedback */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {isAr ? 'ما رأيك في هذا التحدي؟' : 'How was this puzzle?'}
                </span>
                <button
                  type="button"
                  onClick={() => handleEnjoyment('loved')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    progress.enjoymentRatings?.[activityKey] === 'loved'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  😍 {isAr ? 'ممتعة جداً' : 'Loved it!'}
                </button>
                <button
                  type="button"
                  onClick={() => handleEnjoyment('okay')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    progress.enjoymentRatings?.[activityKey] === 'okay'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  🙂 {isAr ? 'جيدة' : 'It was okay'}
                </button>
              </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetWorkspace}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap"
              >
                {isAr ? 'إعادة اللعب' : 'Replay'}
              </button>
              <button
                type="button"
                data-testid="next-level-btn"
                onClick={handleNextLevel}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <span>
                  {currentIndex < safeLevels.length - 1
                    ? isAr
                      ? 'المستوى التالي'
                      : 'Next Level'
                    : isAr
                    ? 'إنهاء المسار بنجاح'
                    : 'Finish Adventure'}
                </span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Portal-Style Drag Ghost (pointer-events: none so drop targets receive hits) */}
      {dragState && dragState.hasMoved && (
        <div
          style={{
            position: 'fixed',
            left: dragState.currentX + dragState.offsetX,
            top: dragState.currentY + dragState.offsetY,
            width: Math.max(dragState.width, 96),
            height: Math.max(dragState.height, 96),
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="rounded-2xl bg-white/95 dark:bg-slate-800/95 border-2 border-red-600 shadow-2xl p-2 flex flex-col items-center justify-center scale-105"
        >
          <PuzzleArtwork artworkKey={dragState.piece.artworkKey} className="w-16 h-14" />
          <span className="text-[11px] font-bold text-slate-900 dark:text-white mt-1 truncate max-w-full">
            {dragState.piece.label[language]}
          </span>
        </div>
      )}
    </div>
  );
};
