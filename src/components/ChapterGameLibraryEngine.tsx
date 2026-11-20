import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Play,
  RotateCcw,
  Star,
  Trophy,
  Sparkles,
  CheckCircle2,
  Lock,
  HelpCircle,
  Zap,
  Compass,
  Puzzle,
  Bug,
  Repeat,
  MousePointerClick,
  Bot,
  Wand2,
  Eye,
  Volume2,
  Award,
  Flame,
  ChevronRight,
  ChevronLeft,
  Lightbulb
} from 'lucide-react';
import { Language } from '../types';
import { SmartyMascot3D, SmartyGameplayState } from './SmartyMascot3D';
import {
  ChapterLibraryDefinition,
  ChapterGameDefinition,
  ChapterGameLevel,
  ChildChapterLibraryProgress,
  DifficultyBand,
  DIFFICULTY_BAND_META,
  getAgeScaledLevelConfig,
  recordChapterLevelWin
} from '../data/chapterGameLibraryData';
import { playSound } from '../utils/soundEffects';

interface ChapterGameLibraryEngineProps {
  chapter: ChapterLibraryDefinition;
  allChapters?: ChapterLibraryDefinition[];
  onSelectChapter?: (chapterId: number) => void;
  language: Language;
  activeChildId: string;
  activeChildName: string;
  initialAgeGroup?: '3-4' | '4-5' | '5-6';
  childProgress: ChildChapterLibraryProgress;
  onUpdateProgress: (updated: ChildChapterLibraryProgress, xpDelta: number, starsDelta: number) => void;
  onBackToCurriculum: () => void;
}

type JourneyStep =
  | 'chapter_map'
  | 'game_intro'
  | 'demo_preview'
  | 'playing'
  | 'level_result';

interface GridCoord {
  x: number;
  y: number;
}

export const ChapterGameLibraryEngine: React.FC<ChapterGameLibraryEngineProps> = ({
  chapter,
  allChapters = [],
  onSelectChapter,
  language,
  activeChildId,
  activeChildName,
  initialAgeGroup = '4-5',
  childProgress,
  onUpdateProgress,
  onBackToCurriculum
}) => {
  const isRTL = language === 'ar';
  const enabledGames = useMemo(
    () => chapter.games.filter((g) => g.enabled).sort((a, b) => a.order - b.order),
    [chapter.games]
  );

  const [selectedGameId, setSelectedGameId] = useState<string>(enabledGames[0]?.id || '');
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(1);
  const [ageGroup, setAgeGroup] = useState<'3-4' | '4-5' | '5-6'>(initialAgeGroup);
  const [journeyStep, setJourneyStep] = useState<JourneyStep>('chapter_map');

  // Dynamic 3D Robot State & Sub-region controller
  const [robotState, setRobotState] = useState<SmartyGameplayState>('greeting');
  const [robotMessage, setRobotMessage] = useState<{ ar: string; en: string }>({
    ar: 'مرحباً يا بطل! اختر لعبة ومرحلة من خريطة الفصل لنبدأ المغامرة!',
    en: 'Hello Hero! Choose a game and level from the chapter map to start!'
  });
  const [showHintBanner, setShowHintBanner] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [lastAwardResult, setLastAwardResult] = useState<{
    xpDelta: number;
    starsEarned: number;
    alreadyCompleted: boolean;
  } | null>(null);

  // Sync selectedGameId when chapter changes
  useEffect(() => {
    const firstGame = enabledGames[0];
    if (firstGame) {
      setSelectedGameId(firstGame.id);
      const prog = childProgress.games[firstGame.id];
      setSelectedLevelNum(prog ? Math.min(prog.unlockedLevel, firstGame.levels.length) : 1);
      setJourneyStep('chapter_map');
      setRobotState('greeting');
    }
  }, [chapter.chapterId]);

  const activeGame: ChapterGameDefinition | undefined = useMemo(
    () => enabledGames.find((g) => g.id === selectedGameId) || enabledGames[0],
    [enabledGames, selectedGameId]
  );

  const activeLevel: ChapterGameLevel | undefined = useMemo(() => {
    if (!activeGame) return undefined;
    return (
      activeGame.levels.find((l) => l.levelNumber === selectedLevelNum) ||
      activeGame.levels[0]
    );
  }, [activeGame, selectedLevelNum]);

  const scaledConfig = useMemo(() => {
    if (!activeLevel) {
      return {
        effectiveItemsCount: 3,
        effectiveGridSize: 4,
        effectiveTargetSteps: 3,
        instructionAr: '',
        instructionEn: '',
        hintAr: '',
        hintEn: '',
        scaffoldingLevel: 'medium' as const
      };
    }
    return getAgeScaledLevelConfig(activeLevel, ageGroup);
  }, [activeLevel, ageGroup]);

  // ============================================================================
  // GAMEPLAY ENGINE STATES (Supports all 9 distinct engine kinds across 62 games)
  // ============================================================================

  // 1. Pointer Target & Bubble/Hover/Double-Tap/Path Tracer State
  const [completedTargets, setCompletedTargets] = useState<number[]>([]);
  const [targetTapCounts, setTargetTapCounts] = useState<Record<number, number>>({});

  // 2. Spatial Assembly / Shape / Missing Piece / Shadow / Sorting State
  const [placedItems, setPlacedItems] = useState<Record<number, number>>({});
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);

  // 3. Memory Challenge Grid State
  const [memoryCards, setMemoryCards] = useState<
    Array<{ id: number; symbol: string; labelAr: string; labelEn: string; matched: boolean }>
  >([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  // 4. Pattern & Sequence Builder State
  const [patternSlots, setPatternSlots] = useState<string[]>([]);

  // 5. Direction Compass & Arrow Signal State
  const [compassStepIndex, setCompassStepIndex] = useState<number>(0);

  // 6, 7, 8. Grid Navigator / Code Sequencer / Code Debugger State
  const [botPos, setBotPos] = useState<GridCoord>({ x: 0, y: 0 });
  const [commandQueue, setCommandQueue] = useState<string[]>([]);
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const [activeCommandIdx, setActiveCommandIdx] = useState<number | null>(null);
  const [bridgeActivated, setBridgeActivated] = useState(false);
  const [packagePickedUp, setPackagePickedUp] = useState(false);
  const [collectedStarCoords, setCollectedStarCoords] = useState<string[]>([]);
  const [loopMultiplier, setLoopMultiplier] = useState<number>(2);

  // 9. Event Sandbox & Interactive Creator State
  const [boundEvents, setBoundEvents] = useState<Record<number, string>>({});
  const [triggeredEvents, setTriggeredEvents] = useState<number[]>([]);
  const [sandboxActorStyle, setSandboxActorStyle] = useState<string>('idle');

  //Deterministic level layout generator based on game + level + ageGroup
  const levelBlueprint = useMemo(() => {
    if (!activeGame || !activeLevel) return null;
    const seed = activeLevel.levelNumber + activeGame.order * 17 + chapter.chapterId * 31;
    const count = scaledConfig.effectiveItemsCount;
    const gridN = scaledConfig.effectiveGridSize;

    // Icons & items pool per chapter theme
    const themePools: Record<
      number,
      Array<{ icon: string; nameAr: string; nameEn: string; color: string; category: string }>
    > = {
      1: [
        { icon: '🖱️', nameAr: 'فأرة ذكية', nameEn: 'Smart Mouse', color: '#06b6d4', category: 'input' },
        { icon: '🖥️', nameAr: 'شاشة عرض', nameEn: 'Monitor', color: '#3b82f6', category: 'output' },
        { icon: '⌨️', nameAr: 'لوحة مفاتيح', nameEn: 'Keyboard', color: '#8b5cf6', category: 'input' },
        { icon: '🔊', nameAr: 'مكبر صوت', nameEn: 'Speaker', color: '#10b981', category: 'output' },
        { icon: '📷', nameAr: 'كاميرا ويب', nameEn: 'Webcam', color: '#f59e0b', category: 'input' },
        { icon: '🖨️', nameAr: 'طابعة ثلاثية', nameEn: '3D Printer', color: '#ec4899', category: 'output' },
        { icon: '⚡', nameAr: 'خلية طاقة', nameEn: 'Power Cell', color: '#eab308', category: 'input' },
        { icon: '🛰️', nameAr: 'مستشعر ليزر', nameEn: 'Laser Sensor', color: '#14b8a6', category: 'output' }
      ],
      2: [
        { icon: '🔷', nameAr: 'معين أزرق', nameEn: 'Blue Diamond', color: '#3b82f6', category: 'polygon' },
        { icon: '🟣', nameAr: 'دائرة بنفسجية', nameEn: 'Purple Circle', color: '#8b5cf6', category: 'round' },
        { icon: '🟨', nameAr: 'مربع ذهبي', nameEn: 'Gold Square', color: '#eab308', category: 'polygon' },
        { icon: '🔺', nameAr: 'مثلث قرمزي', nameEn: 'Crimson Triangle', color: '#ef4444', category: 'polygon' },
        { icon: '⭐', nameAr: 'نجمة خماسية', nameEn: 'Five Star', color: '#f59e0b', category: 'round' },
        { icon: '⬢', nameAr: 'سداسي هندسي', nameEn: 'Hexagon Core', color: '#10b981', category: 'polygon' },
        { icon: '🟢', nameAr: 'قرص زمردي', nameEn: 'Emerald Disc', color: '#22c55e', category: 'round' },
        { icon: '🔶', nameAr: 'وحدة برتقالية', nameEn: 'Orange Module', color: '#f97316', category: 'polygon' }
      ]
    };

    const pool = themePools[chapter.chapterId] || themePools[2];

    // Direction sequences for Chapter 3, 4, 5, 6, 7
    const dirs: Array<'RIGHT' | 'UP' | 'LEFT' | 'DOWN'> = ['RIGHT', 'UP', 'RIGHT', 'DOWN', 'LEFT'];
    const targetStepsCount = Math.max(2, Math.min(7, scaledConfig.effectiveTargetSteps));

    // Construct a guaranteed-valid grid path from (0,0)
    const pathCoords: GridCoord[] = [{ x: 0, y: 0 }];
    const idealDirections: string[] = [];
    let cx = 0;
    let cy = 0;

    for (let s = 0; s < targetStepsCount; s++) {
      const preferRight = (s + seed) % 2 === 0;
      if (preferRight && cx < gridN - 1) {
        cx += 1;
        idealDirections.push('RIGHT');
      } else if (cy < gridN - 1) {
        cy += 1;
        idealDirections.push('DOWN');
      } else if (cx < gridN - 1) {
        cx += 1;
        idealDirections.push('RIGHT');
      } else if (cy > 0) {
        cy -= 1;
        idealDirections.push('UP');
      }
      pathCoords.push({ x: cx, y: cy });
    }

    const goalCoord: GridCoord = pathCoords[pathCoords.length - 1] || { x: gridN - 1, y: gridN - 1 };
    const midpointCoord: GridCoord =
      pathCoords[Math.floor(pathCoords.length / 2)] || { x: 1, y: 0 };

    // Obstacles not on pathCoords
    const obstacles: GridCoord[] = [];
    for (let y = 0; y < gridN; y++) {
      for (let x = 0; x < gridN; x++) {
        const onPath = pathCoords.some((p) => p.x === x && p.y === y);
        if (!onPath && (x + y * 3 + seed) % 4 === 0 && obstacles.length < Math.floor(gridN * 1.1)) {
          obstacles.push({ x, y });
        }
      }
    }

    // Buggy sequence for Chapter 6 (Debugging Mission)
    const buggyDirections = [...idealDirections];
    const bugIndex = Math.min(buggyDirections.length - 1, Math.floor(seed % buggyDirections.length));
    if (buggyDirections.length > 0) {
      buggyDirections[bugIndex] = buggyDirections[bugIndex] === 'RIGHT' ? 'UP' : 'LEFT';
    }

    // Pattern items for Pattern Detective / Loops
    const patternUnit = [
      pool[seed % pool.length].icon,
      pool[(seed + 1) % pool.length].icon,
      ...(activeLevel.difficulty === 'advanced' || activeLevel.difficulty === 'challenge'
        ? [pool[(seed + 2) % pool.length].icon]
        : [])
    ];
    const fullPattern: string[] = [];
    for (let i = 0; i < count + 2; i++) {
      fullPattern.push(patternUnit[i % patternUnit.length]);
    }

    return {
      seed,
      count,
      gridN,
      pool: pool.slice(0, Math.min(pool.length, Math.max(3, count))),
      idealDirections,
      buggyDirections,
      bugIndex,
      pathCoords,
      goalCoord,
      midpointCoord,
      obstacles,
      patternUnit,
      fullPattern,
      dirs
    };
  }, [activeGame, activeLevel, scaledConfig, chapter.chapterId]);

  // Reset level state when starting or restarting a level
  const initializeLevelPlay = () => {
    if (!levelBlueprint || !activeGame || !activeLevel) return;
    setMistakesCount(0);
    setShowHintBanner(false);
    setLastAwardResult(null);

    // Reset Pointer / Target
    setCompletedTargets([]);
    setTargetTapCounts({});

    // Reset Spatial Assembly
    setPlacedItems({});
    setSelectedPieceIndex(0);

    // Reset Memory Cards
    if (activeGame.engineKind === 'memory_grid') {
      const pairsCount = Math.max(2, Math.min(6, Math.ceil(levelBlueprint.count / 2) + 1));
      const chosen = levelBlueprint.pool.slice(0, pairsCount);
      const deck = [...chosen, ...chosen].map((item, idx) => ({
        id: idx,
        symbol: item.icon,
        labelAr: item.nameAr,
        labelEn: item.nameEn,
        matched: false
      }));
      // Deterministic shuffle
      deck.sort((a, b) => ((a.id * 7 + levelBlueprint.seed) % 13) - ((b.id * 7 + levelBlueprint.seed) % 13));
      setMemoryCards(deck);
      setFlippedIndices([]);
    }

    // Reset Pattern Slots
    if (activeGame.engineKind === 'pattern_sequence') {
      const initialSlots = levelBlueprint.fullPattern.map((icon, idx) =>
        idx >= levelBlueprint.fullPattern.length - Math.min(3, Math.ceil(levelBlueprint.count / 2))
          ? '?'
          : icon
      );
      setPatternSlots(initialSlots);
    }

    // Reset Compass
    setCompassStepIndex(0);

    // Reset Grid / Code / Debugger
    setBotPos({ x: 0, y: 0 });
    setIsExecutingCode(false);
    setActiveCommandIdx(null);
    setBridgeActivated(false);
    setPackagePickedUp(false);
    setCollectedStarCoords([]);
    setLoopMultiplier(Math.max(2, Math.min(4, levelBlueprint.idealDirections.length)));

    if (activeGame.engineKind === 'code_debugger') {
      setCommandQueue([...levelBlueprint.buggyDirections]);
    } else {
      setCommandQueue([]);
    }

    // Reset Event Sandbox
    setBoundEvents({});
    setTriggeredEvents([]);
    setSandboxActorStyle('idle');

    // Robot state starts with pointing to objective
    setRobotState('pointing');
    setRobotMessage({
      ar: scaledConfig.instructionAr,
      en: scaledConfig.instructionEn
    });
  };

  useEffect(() => {
    if (journeyStep === 'playing') {
      initializeLevelPlay();
    }
  }, [journeyStep, selectedGameId, selectedLevelNum, ageGroup]);

  // ============================================================================
  // LEVEL COMPLETION & MISTAKE HANDLERS (11-Step Journey Validation)
  // ============================================================================

  const handleTriggerMistake = (customAr?: string, customEn?: string) => {
    playSound('error');
    setMistakesCount((prev) => prev + 1);
    setRobotState('error');
    setShowHintBanner(true);
    setRobotMessage({
      ar: customAr || scaledConfig.hintAr,
      en: customEn || scaledConfig.hintEn
    });

    // After 1.8s, transition robot from 'error' to encouraging 'retry'
    setTimeout(() => {
      setRobotState((current) => (current === 'error' ? 'retry' : current));
    }, 1400);
  };

  const handleCompleteLevelSuccess = () => {
    if (!activeGame || !activeLevel) return;
    playSound('win');
    setRobotState('victory');
    setRobotMessage({
      ar: `أحسنت يا ${activeChildName}! لقد أنجزت المرحلة ${activeLevel.levelNumber} ببراعة!`,
      en: `Awesome job ${activeChildName}! You mastered Level ${activeLevel.levelNumber}!`
    });

    const starsEarned = mistakesCount === 0 ? 3 : mistakesCount <= 2 ? 2 : 1;
    const result = recordChapterLevelWin(
      childProgress,
      activeGame,
      activeLevel.levelNumber,
      starsEarned,
      activeLevel.xpReward
    );

    setLastAwardResult({
      xpDelta: result.xpDelta,
      starsEarned,
      alreadyCompleted: result.alreadyCompleted
    });

    onUpdateProgress(result.updatedProgress, result.xpDelta, result.starsDelta);

    setTimeout(() => {
      setJourneyStep('level_result');
    }, 650);
  };

  // ============================================================================
  // INTERACTIVE HANDLERS FOR EACH OF THE 9 ENGINE KINDS
  // ============================================================================

  // 1. POINTER TARGET HANDLER
  const handlePointerItemAction = (idx: number, actionType: 'click' | 'hover' | 'double') => {
    if (!activeGame || !levelBlueprint) return;
    if (completedTargets.includes(idx)) return;

    const subMode = activeGame.subMode;
    if (subMode === 'double_tap') {
      const nextCount = (targetTapCounts[idx] || 0) + 1;
      setTargetTapCounts((prev) => ({ ...prev, [idx]: nextCount }));
      if (nextCount < 2) {
        playSound('click');
        setRobotState('thinking');
        setRobotMessage({
          ar: 'نقرة ثانية سريعة لفتح كبسولة النجمة!',
          en: 'One more quick tap to open the star capsule!'
        });
        return;
      }
    } else if (subMode === 'path_tracer' || subMode === 'commander_combo') {
      // Must be clicked in sequential order!
      const expectedIdx = completedTargets.length;
      if (idx !== expectedIdx) {
        handleTriggerMistake(
          `اتبع الترتيب المتسلسل! اضغط على النقطة رقم ${expectedIdx + 1} أولاً.`,
          `Follow the sequence! Activate node #${expectedIdx + 1} first.`
        );
        return;
      }
    }

    playSound('success');
    const updated = [...completedTargets, idx];
    setCompletedTargets(updated);
    setRobotState('cheering');
    setRobotMessage({
      ar: `رائع! (${updated.length} / ${levelBlueprint.count})`,
      en: `Great! (${updated.length} / ${levelBlueprint.count})`
    });

    if (updated.length >= levelBlueprint.count) {
      handleCompleteLevelSuccess();
    }
  };

  // 2. SPATIAL ASSEMBLY / PUZZLE / SORTING HANDLER
  const handlePlacePieceInSlot = (slotIdx: number) => {
    if (!levelBlueprint) return;
    if (selectedPieceIndex === null) {
      handleTriggerMistake('اختر القطعة من الأسفل أولاً ثم ضعها في مكانها!', 'Select a piece below first, then place it in its matching slot!');
      return;
    }

    if (selectedPieceIndex === slotIdx) {
      playSound('drop');
      const nextPlaced = { ...placedItems, [slotIdx]: selectedPieceIndex };
      setPlacedItems(nextPlaced);
      setRobotState('cheering');
      setRobotMessage({
        ar: 'تطابق هندسي ممتاز! واصل التركيب.',
        en: 'Perfect geometric match! Keep assembling.'
      });

      // Auto-select next unplaced piece
      const total = levelBlueprint.pool.length;
      let nextSelection: number | null = null;
      for (let i = 0; i < total; i++) {
        if (nextPlaced[i] === undefined) {
          nextSelection = i;
          break;
        }
      }
      setSelectedPieceIndex(nextSelection);

      if (Object.keys(nextPlaced).length >= total) {
        handleCompleteLevelSuccess();
      }
    } else {
      handleTriggerMistake(
        'هذه القطعة لا تطابق هذا القالب! انظر إلى الشكل واللون بدقة.',
        'This piece does not match this slot! Check the shape and color carefully.'
      );
    }
  };

  // 3. MEMORY GRID CARD FLIP HANDLER
  const handleMemoryCardClick = (index: number) => {
    if (flippedIndices.includes(index) || memoryCards[index]?.matched || flippedIndices.length >= 2) {
      return;
    }
    playSound('click');
    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);
    setRobotState('thinking');

    if (nextFlipped.length === 2) {
      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = memoryCards[firstIdx];
      const secondCard = memoryCards[secondIdx];

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        playSound('success');
        const updatedCards = memoryCards.map((c, idx) =>
          idx === firstIdx || idx === secondIdx ? { ...c, matched: true } : c
        );
        setMemoryCards(updatedCards);
        setFlippedIndices([]);
        setRobotState('cheering');
        setRobotMessage({
          ar: `ذاكرة حديدية! وجدت زوج ${firstCard.labelAr}`,
          en: `Super memory! You matched ${firstCard.labelEn}`
        });

        if (updatedCards.every((c) => c.matched)) {
          handleCompleteLevelSuccess();
        }
      } else {
        setTimeout(() => {
          handleTriggerMistake(
            'ليستا متطابقتين! تذكر مكانهما وحاول مرة أخرى.',
            'Not a pair! Remember their positions and try again.'
          );
          setFlippedIndices([]);
        }, 700);
      }
    }
  };

  // 4. PATTERN & SEQUENCE HANDLER
  const handlePatternChoicePick = (chosenIcon: string) => {
    if (!levelBlueprint) return;
    const firstMissingIdx = patternSlots.findIndex((s) => s === '?');
    if (firstMissingIdx === -1) return;

    const expectedIcon = levelBlueprint.fullPattern[firstMissingIdx];
    if (chosenIcon === expectedIcon) {
      playSound('success');
      const nextSlots = [...patternSlots];
      nextSlots[firstMissingIdx] = chosenIcon;
      setPatternSlots(nextSlots);
      setRobotState('cheering');
      setRobotMessage({
        ar: 'نمط صحيح تماماً! أحسنت اكتشاف القاعدة.',
        en: 'Spot-on pattern! You discovered the sequence rule.'
      });

      if (!nextSlots.includes('?')) {
        handleCompleteLevelSuccess();
      }
    } else {
      handleTriggerMistake(
        `انظر إلى تكرار العناصر (${levelBlueprint.patternUnit.join(' ← ')}) واختر العنصر المكمل الصحيح!`,
        `Look at the repeating unit (${levelBlueprint.patternUnit.join(' → ')}) and pick the matching item!`
      );
    }
  };

  // 5. DIRECTION COMPASS HANDLER
  const handleCompassDirectionPick = (dir: string) => {
    if (!levelBlueprint) return;
    const expectedDir = levelBlueprint.idealDirections[compassStepIndex];
    if (dir === expectedDir) {
      playSound('move');
      const nextIdx = compassStepIndex + 1;
      setCompassStepIndex(nextIdx);
      setRobotState('cheering');
      setRobotMessage({
        ar: `اتجاه صحيح! (${nextIdx} / ${levelBlueprint.idealDirections.length})`,
        en: `Correct direction! (${nextIdx} / ${levelBlueprint.idealDirections.length})`
      });

      if (nextIdx >= levelBlueprint.idealDirections.length) {
        handleCompleteLevelSuccess();
      }
    } else {
      handleTriggerMistake(
        'اتجاه غير مطابق للسهم المضيء! انظر إلى إشارة البوصلة بعناية.',
        'Direction does not match the glowing arrow! Check the compass signal carefully.'
      );
    }
  };

  // 6. DIRECT GRID NAVIGATOR STEP HANDLER (Chapters 3 & 4 live control or queued)
  const handleLiveGridMove = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!levelBlueprint) return;
    let nx = botPos.x;
    let ny = botPos.y;
    if (dir === 'RIGHT') nx += 1;
    if (dir === 'LEFT') nx -= 1;
    if (dir === 'DOWN') ny += 1;
    if (dir === 'UP') ny -= 1;

    if (nx < 0 || ny < 0 || nx >= levelBlueprint.gridN || ny >= levelBlueprint.gridN) {
      handleTriggerMistake('احذر! لا تخرج خارج حدود الخريطة.', 'Careful! Stay inside the map boundaries.');
      return;
    }

    const hitObstacle = levelBlueprint.obstacles.some((o) => o.x === nx && o.y === ny);
    if (hitObstacle) {
      handleTriggerMistake('يوجد عائق في هذا المربع! اسلك طريقاً آمناً حوله.', 'Obstacle ahead! Take a safe path around it.');
      return;
    }

    playSound('move');
    setBotPos({ x: nx, y: ny });
    setRobotState('pointing');

    // Check midpoint sub-objectives (bridge switch, package, rescue, stars)
    if (nx === levelBlueprint.midpointCoord.x && ny === levelBlueprint.midpointCoord.y) {
      setBridgeActivated(true);
      setPackagePickedUp(true);
      const key = `${nx},${ny}`;
      if (!collectedStarCoords.includes(key)) {
        setCollectedStarCoords((prev) => [...prev, key]);
      }
      playSound('click');
      setRobotState('cheering');
      setRobotMessage({
        ar: 'رائع! لقد فعلت النقطة المساعدة، الآن اتجه نحو الهدف النهائي 🏁!',
        en: 'Awesome! Sub-goal completed, now head to the final goal 🏁!'
      });
    }

    // Check Goal reached
    if (nx === levelBlueprint.goalCoord.x && ny === levelBlueprint.goalCoord.y) {
      handleCompleteLevelSuccess();
    }
  };

  // 7 & 8. CODE SEQUENCER & CODE DEBUGGER EXECUTION
  const handleRunCommandQueue = () => {
    if (!levelBlueprint || isExecutingCode) return;

    // For Loop games in Chapter 7, if commandQueue has 1-2 blocks, we can either run as-is or compare
    if (commandQueue.length === 0) {
      handleTriggerMistake('أضف أوامر الحركة إلى مساحة البرمجة أولاً ثم اضغط تشغيل!', 'Add movement blocks to the workspace first, then press Run!');
      return;
    }

    setIsExecutingCode(true);
    setRobotState('thinking');
    setRobotMessage({
      ar: 'جاري تنفيذ الكود البرمجي خطوة بخطوة...',
      en: 'Executing your code sequence step by step...'
    });
    setBotPos({ x: 0, y: 0 });

    let cx = 0;
    let cy = 0;
    let step = 0;

    const timer = setInterval(() => {
      if (step >= commandQueue.length) {
        clearInterval(timer);
        setIsExecutingCode(false);
        setActiveCommandIdx(null);

        if (cx === levelBlueprint.goalCoord.x && cy === levelBlueprint.goalCoord.y) {
          handleCompleteLevelSuccess();
        } else {
          handleTriggerMistake(
            'لم يصل الروبوت إلى نقطة الهدف النهائية 🏁! راجع ترتيب أوامر الحركة وحاول مجدداً.',
            'Smarty did not reach the final goal 🏁! Check your command blocks and try again.'
          );
        }
        return;
      }

      setActiveCommandIdx(step);
      const cmd = commandQueue[step];
      if (cmd === 'RIGHT') cx += 1;
      if (cmd === 'LEFT') cx -= 1;
      if (cmd === 'DOWN') cy += 1;
      if (cmd === 'UP') cy -= 1;

      // Bounds & obstacle check
      const outOfBounds = cx < 0 || cy < 0 || cx >= levelBlueprint.gridN || cy >= levelBlueprint.gridN;
      const hitObs = levelBlueprint.obstacles.some((o) => o.x === cx && o.y === cy);

      if (outOfBounds || hitObs) {
        clearInterval(timer);
        setIsExecutingCode(false);
        setActiveCommandIdx(null);
        handleTriggerMistake(
          `توقف التنفيذ عند الخطوة رقم ${step + 1}! استبدل الأمر الخاطئ لتجنب العائق.`,
          `Execution stopped at step #${step + 1}! Replace the faulty block to avoid the obstacle.`
        );
        return;
      }

      playSound('move');
      setBotPos({ x: cx, y: cy });
      step += 1;
    }, 450);
  };

  // 9. EVENT SANDBOX HANDLER (Chapter 8)
  const eventDefinitions = useMemo(
    () => [
      {
        id: 0,
        triggerAr: 'عند الضغط على زر الانطلاق 🟢',
        triggerEn: 'When Green Start Clicked 🟢',
        actionAr: 'تحرك للأمام وشغل الأضواء ⚡',
        actionEn: 'Boost Forward & Lights ⚡',
        style: 'boost',
        robotState: 'cheering' as SmartyGameplayState
      },
      {
        id: 1,
        triggerAr: 'عند لمس مستشعر الصوت 🔊',
        triggerEn: 'When Sound Sensor Touched 🔊',
        actionAr: 'ارقص وأطلق نغمة الفوز 🎵',
        actionEn: 'Dance & Play Victory Tune 🎵',
        style: 'dance',
        robotState: 'victory' as SmartyGameplayState
      },
      {
        id: 2,
        triggerAr: 'عند اكتشاف نجمة الطاقة ⭐',
        triggerEn: 'When Star Detected ⭐',
        actionAr: 'افتح درع الحماية الذكي 🛡️',
        actionEn: 'Activate Smart Shield 🛡️',
        style: 'shield',
        robotState: 'pointing' as SmartyGameplayState
      },
      {
        id: 3,
        triggerAr: 'عند انتهاء العد التنازلي 🚀',
        triggerEn: 'When Countdown Ends 🚀',
        actionAr: 'انطلق في مهمة الفضاء 🌌',
        actionEn: 'Launch Space Mission 🌌',
        style: 'launch',
        robotState: 'victory' as SmartyGameplayState
      }
    ],
    []
  );

  const requiredEventsCount = useMemo(
    () => Math.max(2, Math.min(4, Math.ceil((scaledConfig.effectiveItemsCount + 1) / 2))),
    [scaledConfig.effectiveItemsCount]
  );

  const handleBindAndTriggerEvent = (eventId: number) => {
    const ev = eventDefinitions[eventId];
    if (!ev) return;

    playSound('success');
    const nextBound = { ...boundEvents, [eventId]: ev.style };
    setBoundEvents(nextBound);

    if (!triggeredEvents.includes(eventId)) {
      const nextTriggered = [...triggeredEvents, eventId];
      setTriggeredEvents(nextTriggered);
      setSandboxActorStyle(ev.style);
      setRobotState(ev.robotState);
      setRobotMessage({
        ar: `تم تفعيل الحدث: ${ev.triggerAr} ← ${ev.actionAr}`,
        en: `Event Fired: ${ev.triggerEn} → ${ev.actionEn}`
      });

      if (nextTriggered.length >= requiredEventsCount) {
        setTimeout(() => {
          handleCompleteLevelSuccess();
        }, 500);
      }
    }
  };

  // ============================================================================
  // CHAPTER PROGRESS CALCULATIONS
  // ============================================================================
  const chapterStats = useMemo(() => {
    const totalGames = enabledGames.length;
    const totalLevels = enabledGames.reduce((acc, g) => acc + g.levels.length, 0);
    let completedLevelsCount = 0;
    let earnedStarsCount = 0;
    let earnedXpCount = 0;

    enabledGames.forEach((g) => {
      const gp = childProgress.games[g.id];
      if (gp) {
        completedLevelsCount += gp.completedLevels.length;
        earnedXpCount += gp.earnedXp;
        Object.values(gp.starsByLevel).forEach((s) => {
          earnedStarsCount += s;
        });
      }
    });

    const pct = totalLevels > 0 ? Math.round((completedLevelsCount / totalLevels) * 100) : 0;
    return {
      totalGames,
      totalLevels,
      completedLevelsCount,
      earnedStarsCount,
      earnedXpCount,
      pct
    };
  }, [enabledGames, childProgress]);

  if (!activeGame || !activeLevel || !levelBlueprint) {
    return null;
  }

  const activeGameProgress = childProgress.games[activeGame.id] || {
    gameId: activeGame.id,
    unlockedLevel: 1,
    completedLevels: [],
    starsByLevel: {},
    earnedXp: 0,
    attemptsByLevel: {}
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#070B19] text-white pb-20 selection:bg-cyan-500 selection:text-white"
      data-testid="chapter-game-library-engine"
    >
      {/* Top Navigation & Chapter Progress Bar */}
      <div className="sticky top-0 z-40 bg-[#0B1228]/95 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (journeyStep === 'chapter_map') {
                  onBackToCurriculum();
                } else {
                  setJourneyStep('chapter_map');
                  setRobotState('greeting');
                }
              }}
              data-testid="chapter-back-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-black transition-all cursor-pointer"
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>
                {journeyStep === 'chapter_map'
                  ? isRTL
                    ? 'العودة للفصول'
                    : 'Back to Chapters'
                  : isRTL
                  ? 'خريطة ألعاب الفصل'
                  : 'Chapter Games Map'}
              </span>
            </button>

            <div className="flex items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r ${chapter.themeGradient} text-white shadow`}
              >
                {isRTL ? `الفصل ${chapter.chapterId}` : `Chapter ${chapter.chapterId}`}
              </span>
              <h1 className="text-base sm:text-xl font-black text-white">
                {isRTL ? chapter.title.ar : chapter.title.en}
              </h1>
            </div>
          </div>

          {/* Quick Chapter Switcher + Age Tier Selector + Stats */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Age Adaptation Selector (3-4, 4-5, 5-6) */}
            <div
              className="flex items-center bg-slate-900/90 border border-white/10 rounded-xl p-1"
              data-testid="chapter-age-selector"
            >
              {(['3-4', '4-5', '5-6'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setAgeGroup(tier)}
                  data-testid={`age-tier-btn-${tier}`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    ageGroup === tier
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isRTL ? `${tier} سنوات` : `Age ${tier}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-400/30 px-3.5 py-1.5 rounded-2xl">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-amber-300" data-testid="chapter-stars-counter">
                {chapterStats.earnedStarsCount}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-cyan-500/15 border border-cyan-400/30 px-3.5 py-1.5 rounded-2xl">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black text-cyan-300" data-testid="chapter-xp-counter">
                {chapterStats.earnedXpCount} XP
              </span>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1.5 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-300" data-testid="chapter-levels-counter">
                {chapterStats.completedLevelsCount} / {chapterStats.totalLevels}{' '}
                {isRTL ? 'مرحلة' : 'Levels'} ({chapterStats.pct}%)
              </span>
            </div>
          </div>
        </div>

        {/* All 8 Chapters Quick Bar */}
        {allChapters.length > 1 && onSelectChapter && journeyStep === 'chapter_map' && (
          <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {allChapters.map((ch) => {
              const isCurrent = ch.chapterId === chapter.chapterId;
              return (
                <button
                  key={ch.chapterId}
                  onClick={() => onSelectChapter(ch.chapterId)}
                  data-testid={`switch-chapter-tab-${ch.chapterId}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCurrent
                      ? `bg-gradient-to-r ${ch.themeGradient} text-white shadow-lg scale-[1.02]`
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <span>{isRTL ? `فصل ${ch.chapterId}:` : `Ch ${ch.chapterId}:`}</span>
                  <span>{isRTL ? ch.title.ar : ch.title.en}</span>
                  <span className="opacity-75 text-[10px]">({ch.games.filter((g) => g.enabled).length})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        {/* Persistent 3D Smarty Robot Companion Banner with Dynamic State & Sub-Region Mapping */}
        <div
          className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900/95 via-indigo-950/90 to-slate-900/95 border border-cyan-500/30 p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4"
          data-testid="smarty-companion-banner"
        >
          <div className="flex items-center gap-4">
            <SmartyMascot3D
              state={robotState}
              subRegionFocus="auto"
              size="md"
              showStateBadge={true}
              language={language}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {isRTL ? 'المدرب الذكي ثلاثي الأبعاد SMARTY' : '3D Smarty Robot Coach'}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-300"
                  data-testid="robot-active-state-pill"
                >
                  {isRTL ? `الحالة التفاعلية: ${robotState}` : `Robot State: ${robotState}`}
                </span>
              </div>
              <p className="text-base sm:text-lg font-black text-white leading-snug" data-testid="robot-speech-text">
                {isRTL ? robotMessage.ar : robotMessage.en}
              </p>
              {showHintBanner && (
                <div
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold"
                  data-testid="level-hint-banner"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isRTL ? scaledConfig.hintAr : scaledConfig.hintEn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Robot State Preview Switcher (Allows testing & inspecting all 3D robot states) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-2 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 px-1.5">
              {isRTL ? 'حالات الروبوت:' : '3D States:'}
            </span>
            {(['thinking', 'cheering', 'pointing', 'error', 'retry'] as SmartyGameplayState[]).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setRobotState(st)}
                  data-testid={`trigger-robot-state-${st}`}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    robotState === st
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300'
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>

        {/* ========================================================================
            VIEW 1: INTERACTIVE CHAPTER PROGRESS MAP (All Games + 15 Levels Path)
            ======================================================================== */}
        {journeyStep === 'chapter_map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="chapter-progress-map-view">
            {/* Left Sidebar: All Games in this Chapter (7 to 8 Distinct Games) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>
                    {isRTL
                      ? `مكتبة ألعاب الفصل (${enabledGames.length} ألعاب تفاعلية)`
                      : `Chapter Game Library (${enabledGames.length} Games)`}
                  </span>
                </h2>
              </div>

              {enabledGames.map((game, idx) => {
                const gp = childProgress.games[game.id] || {
                  unlockedLevel: 1,
                  completedLevels: [],
                  starsByLevel: {},
                  earnedXp: 0
                };
                const isSelected = game.id === activeGame.id;
                const completedCount = gp.completedLevels.length;
                const totalLevels = game.levels.length;
                const pct = Math.round((completedCount / totalLevels) * 100);

                return (
                  <button
                    key={game.id}
                    onClick={() => {
                      playSound('click');
                      setSelectedGameId(game.id);
                      setSelectedLevelNum(Math.min(gp.unlockedLevel || 1, totalLevels));
                      setRobotState('pointing');
                      setRobotMessage({
                        ar: `${game.title.ar}: ${game.description.ar}`,
                        en: `${game.title.en}: ${game.description.en}`
                      });
                    }}
                    data-testid={`select-chapter-game-${idx + 1}`}
                    className={`w-full text-start p-4 rounded-3xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-900/90 via-slate-900 to-cyan-950/80 border-cyan-400 shadow-xl shadow-cyan-500/10 scale-[1.01]'
                        : 'bg-slate-900/75 hover:bg-slate-900 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base text-white shrink-0 shadow-md"
                          style={{ backgroundColor: game.accentColor }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-black text-base text-white">
                            {isRTL ? game.title.ar : game.title.en}
                          </h3>
                          <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                            {isRTL ? game.skillTargeted.ar : game.skillTargeted.en}
                          </p>
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 text-xs font-black text-cyan-300">
                          {completedCount}/{totalLevels}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar inside game card */}
                    <div className="mt-3">
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Panel: Selected Game Details & 15-Level Progressive Adventure Map */}
            <div className="lg:col-span-7 bg-slate-900/85 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    {isRTL ? activeGame.skillTargeted.ar : activeGame.skillTargeted.en}
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1" data-testid="selected-game-heading">
                    {isRTL ? activeGame.title.ar : activeGame.title.en}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    {isRTL ? activeGame.description.ar : activeGame.description.en}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setJourneyStep('game_intro');
                    setRobotState('greeting');
                  }}
                  data-testid="launch-selected-game-btn"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {isRTL
                      ? `ابدأ المرحلة ${selectedLevelNum}`
                      : `Play Level ${selectedLevelNum}`}
                  </span>
                </button>
              </div>

              {/* 5 Difficulty Tiers (15 Levels Total: 1-3 Beginner, 4-6 Easy, 7-9 Intermediate, 10-12 Advanced, 13-15 Challenge) */}
              <div className="mt-5 space-y-5" data-testid="game-15-levels-roadmap">
                {(['beginner', 'easy', 'intermediate', 'advanced', 'challenge'] as DifficultyBand[]).map(
                  (band) => {
                    const meta = DIFFICULTY_BAND_META[band];
                    const bandLevels = activeGame.levels.filter((l) => l.difficulty === band);
                    return (
                      <div
                        key={band}
                        className="p-4 rounded-2xl bg-black/30 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-xl text-xs font-black ${meta.badgeClass}`}>
                            {isRTL ? meta.ar : meta.en} ({meta.levelsRange})
                          </span>
                          {band === 'challenge' && (
                            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5" />
                              {isRTL ? 'تحديات الأبطال الخاصة' : 'Special Hero Challenges'}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {bandLevels.map((lvl) => {
                            const isCompleted = activeGameProgress.completedLevels.includes(
                              lvl.levelNumber
                            );
                            const isUnlocked =
                              lvl.levelNumber <= (activeGameProgress.unlockedLevel || 1) ||
                              isCompleted;
                            const isCurrentSelected = selectedLevelNum === lvl.levelNumber;
                            const stars = activeGameProgress.starsByLevel[lvl.levelNumber] || 0;

                            return (
                              <button
                                key={lvl.id}
                                onClick={() => {
                                  if (!isUnlocked) {
                                    playSound('error');
                                    setRobotState('pointing');
                                    setRobotMessage({
                                      ar: `أكمل المرحلة ${lvl.levelNumber - 1} أولاً لفتح المرحلة ${lvl.levelNumber}!`,
                                      en: `Complete Level ${lvl.levelNumber - 1} first to unlock Level ${lvl.levelNumber}!`
                                    });
                                    return;
                                  }
                                  playSound('click');
                                  setSelectedLevelNum(lvl.levelNumber);
                                  setJourneyStep('game_intro');
                                }}
                                data-testid={`level-node-${lvl.levelNumber}`}
                                className={`relative p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                                  isCurrentSelected
                                    ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                                    : isCompleted
                                    ? 'bg-emerald-500/15 border-emerald-500/40 hover:bg-emerald-500/25'
                                    : isUnlocked
                                    ? 'bg-white/5 border-white/15 hover:bg-white/10'
                                    : 'bg-white/[0.02] border-white/5 opacity-60'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-black text-white">
                                    {isRTL ? `مرحلة ${lvl.levelNumber}` : `Level ${lvl.levelNumber}`}
                                  </span>
                                  {!isUnlocked ? (
                                    <Lock className="w-4 h-4 text-slate-500" />
                                  ) : isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                                  )}
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-3.5 h-3.5 ${
                                          s <= stars
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[11px] font-bold text-cyan-300">
                                    +{lvl.xpReward} XP
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================
            VIEW 2: STEP 1-4 OF PLAYER JOURNEY (Game Intro + Objective + Interactive Example)
            ======================================================================== */}
        {journeyStep === 'game_intro' && (
          <div
            className="max-w-3xl mx-auto bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
            data-testid="game-intro-screen"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-black mb-4">
              <span>{isRTL ? activeGame.title.ar : activeGame.title.en}</span>
              <span>•</span>
              <span>{isRTL ? activeLevel.title.ar : activeLevel.title.en}</span>
            </div>

            <div className="flex justify-center my-4">
              <SmartyMascot3D
                state="pointing"
                subRegionFocus="waving_upper"
                size="lg"
                showStateBadge={true}
                language={language}
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {isRTL ? 'مهمة اليوم مع الروبوت سمارتي' : "Today's Mission with Smarty"}
            </h2>
            <p className="text-base sm:text-lg text-slate-200 mt-3 max-w-xl mx-auto font-bold">
              {isRTL ? scaledConfig.instructionAr : scaledConfig.instructionEn}
            </p>

            {/* Interactive Example / Demo Preview Box */}
            <div className="mt-6 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-400/30 text-start">
              <div className="flex items-center gap-2 text-xs font-black text-indigo-300 uppercase mb-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>{isRTL ? 'مثال توضيحي تفاعلي قبل البدء:' : 'Quick Interactive Example:'}</span>
              </div>
              <p className="text-sm text-slate-200 font-medium">
                {isRTL ? scaledConfig.hintAr : scaledConfig.hintEn}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-cyan-300">
                <span className="px-3 py-1 rounded-xl bg-white/10">
                  {isRTL ? `الفئة العمرية: ${ageGroup} سنوات` : `Age Tier: ${ageGroup} yrs`}
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10">
                  {isRTL
                    ? `عدد التحديات في المرحلة: ${scaledConfig.effectiveItemsCount}`
                    : `Challenge Targets: ${scaledConfig.effectiveItemsCount}`}
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300">
                  +{activeLevel.xpReward} XP
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  playSound('click');
                  setJourneyStep('chapter_map');
                }}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-sm font-black text-slate-200 cursor-pointer"
              >
                {isRTL ? 'تغيير المرحلة' : 'Change Level'}
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setJourneyStep('playing');
                }}
                data-testid="start-level-play-btn"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>
                  {isRTL
                    ? `انطلق في المرحلة ${activeLevel.levelNumber}!`
                    : `Start Level ${activeLevel.levelNumber}!`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================
            VIEW 3: STEP 5-8 OF PLAYER JOURNEY (Active Gameplay Stage for All 9 Engines)
            ======================================================================== */}
        {journeyStep === 'playing' && (
          <div
            className="bg-slate-900/90 border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl"
            data-testid="active-gameplay-stage"
          >
            {/* Stage Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-black">
                    {isRTL ? `المرحلة ${activeLevel.levelNumber} من 15` : `Level ${activeLevel.levelNumber} of 15`}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black ${
                      DIFFICULTY_BAND_META[activeLevel.difficulty].badgeClass
                    }`}
                  >
                    {isRTL
                      ? DIFFICULTY_BAND_META[activeLevel.difficulty].ar
                      : DIFFICULTY_BAND_META[activeLevel.difficulty].en}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1.5">
                  {isRTL ? activeGame.title.ar : activeGame.title.en} —{' '}
                  {isRTL ? activeLevel.title.ar : activeLevel.title.en}
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    playSound('click');
                    setShowHintBanner(true);
                    setRobotState('pointing');
                    setRobotMessage({
                      ar: scaledConfig.hintAr,
                      en: scaledConfig.hintEn
                    });
                  }}
                  data-testid="request-hint-btn"
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{isRTL ? 'مساعدة سمارتي' : 'Smarty Hint'}</span>
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    initializeLevelPlay();
                  }}
                  data-testid="restart-level-btn"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isRTL ? 'إعادة المحاولة' : 'Reset'}</span>
                </button>
              </div>
            </div>

            {/* ====================================================================
                ENGINE 1: POINTER TARGET (Hover Safari, Bubble Clicker, Double-Tap, Laser Path, Precision, Commander)
                ==================================================================== */}
            {activeGame.engineKind === 'pointer_target' && (
              <div className="space-y-6" data-testid="engine-pointer-target">
                <div className="flex items-center justify-between bg-black/30 px-4 py-3 rounded-2xl border border-white/10">
                  <span className="text-sm font-bold text-slate-200">
                    {activeGame.subMode === 'double_tap'
                      ? isRTL
                        ? 'انقر نقراً مزدوجاً (مرتين) على كل كبسولة لتفعيلها!'
                        : 'Double-tap (click twice) on each capsule to activate it!'
                      : activeGame.subMode === 'path_tracer' || activeGame.subMode === 'commander_combo'
                      ? isRTL
                        ? 'اضغط على نقاط الطاقة بالترتيب المتسلسل (1 ← 2 ← 3...)!'
                        : 'Click the energy nodes in sequential order (1 → 2 → 3...)!'
                      : isRTL
                      ? 'مرر المؤشر أو اضغط على جميع الأهداف المضيئة في المعمل!'
                      : 'Hover or click all glowing targets in the lab!'}
                  </span>
                  <span className="text-sm font-black text-cyan-400">
                    {completedTargets.length} / {levelBlueprint.count}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: levelBlueprint.count }).map((_, idx) => {
                    const item = levelBlueprint.pool[idx % levelBlueprint.pool.length];
                    const isDone = completedTargets.includes(idx);
                    const taps = targetTapCounts[idx] || 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => handlePointerItemAction(idx, 'click')}
                        onMouseEnter={() => {
                          if (activeGame.subMode === 'hover_safari' && !isDone) {
                            handlePointerItemAction(idx, 'hover');
                          }
                        }}
                        data-testid={`pointer-target-item-${idx}`}
                        className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500/20 border-emerald-400 scale-95'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-cyan-500/40 hover:border-cyan-400 hover:scale-105 shadow-lg'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-cyan-300">
                          #{idx + 1}
                        </div>
                        <span className="text-4xl select-none">{item.icon}</span>
                        <span className="text-xs font-black text-white">
                          {isRTL ? item.nameAr : item.nameEn}
                        </span>
                        {activeGame.subMode === 'double_tap' && !isDone && (
                          <span className="text-[11px] font-bold text-amber-300">
                            {isRTL ? `النقرات: ${taps}/2` : `Taps: ${taps}/2`}
                          </span>
                        )}
                        {isDone && (
                          <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {isRTL ? 'مكتمل!' : 'Active!'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ====================================================================
                ENGINE 2: SPATIAL ASSEMBLY (Shape Builder, Picture Puzzle, Missing Piece, Shadow Matching, Shape Sorting, Bridge, Hardware Sorter)
                ==================================================================== */}
            {activeGame.engineKind === 'spatial_assembly' && (
              <div className="space-y-6" data-testid="engine-spatial-assembly">
                {/* Target Blueprint Slots */}
                <div>
                  <h3 className="text-sm font-black text-cyan-300 mb-3">
                    {isRTL
                      ? '1. قوالب التركيب والتصنيف (اضغط على القالب المناسب لوضع القطعة المختارة):'
                      : '1. Blueprint Target Slots (Click the matching slot to place the selected piece):'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {levelBlueprint.pool.map((slotItem, slotIdx) => {
                      const isFilled = placedItems[slotIdx] !== undefined;
                      return (
                        <button
                          key={slotIdx}
                          onClick={() => handlePlacePieceInSlot(slotIdx)}
                          data-testid={`assembly-slot-${slotIdx}`}
                          className={`p-5 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            isFilled
                              ? 'bg-emerald-500/20 border-emerald-400 border-solid'
                              : 'bg-slate-950/70 hover:bg-slate-900 border-white/25 hover:border-cyan-400'
                          }`}
                        >
                          <span
                            className={`text-4xl transition-all ${
                              isFilled
                                ? 'opacity-100 scale-110'
                                : activeGame.subMode === 'shadow_matching'
                                ? 'brightness-0 invert opacity-35'
                                : 'opacity-30'
                            }`}
                          >
                            {slotItem.icon}
                          </span>
                          <span className="text-xs font-black text-slate-200">
                            {isRTL ? slotItem.nameAr : slotItem.nameEn}
                          </span>
                          <span className="text-[11px] font-bold text-cyan-400">
                            {isFilled
                              ? isRTL
                                ? 'تم التركيب بنجاح ✓'
                                : 'Placed ✓'
                              : isRTL
                              ? 'اضغط للوضع هنا'
                              : 'Click to Place'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Draggable / Selectable Pieces Tray */}
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-black text-amber-300 mb-3">
                    {isRTL ? '2. القطع المتاحة في ورشة سمارتي:' : '2. Available Workshop Pieces:'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {levelBlueprint.pool.map((piece, pieceIdx) => {
                      const alreadyPlaced = Object.values(placedItems).includes(pieceIdx);
                      const isSelected = selectedPieceIndex === pieceIdx;
                      return (
                        <button
                          key={pieceIdx}
                          disabled={alreadyPlaced}
                          onClick={() => {
                            playSound('click');
                            setSelectedPieceIndex(pieceIdx);
                          }}
                          data-testid={`assembly-piece-${pieceIdx}`}
                          className={`px-5 py-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer ${
                            alreadyPlaced
                              ? 'opacity-30 bg-slate-900 border-white/5 cursor-not-allowed'
                              : isSelected
                              ? 'bg-cyan-500/25 border-cyan-400 scale-105 shadow-lg'
                              : 'bg-slate-800 border-white/15 hover:border-white/40'
                          }`}
                        >
                          <span className="text-2xl">{piece.icon}</span>
                          <span className="text-xs font-black text-white">
                            {isRTL ? piece.nameAr : piece.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================================
                ENGINE 3: MEMORY CHALLENGE GRID
                ==================================================================== */}
            {activeGame.engineKind === 'memory_grid' && (
              <div className="space-y-5" data-testid="engine-memory-grid">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {memoryCards.map((card, idx) => {
                    const isFlipped = flippedIndices.includes(idx) || card.matched;
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleMemoryCardClick(idx)}
                        data-testid={`memory-card-${idx}`}
                        data-symbol={card.symbol}
                        className={`h-28 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                          card.matched
                            ? 'bg-emerald-500/20 border-emerald-400'
                            : isFlipped
                            ? 'bg-indigo-900/90 border-cyan-400'
                            : 'bg-slate-800 hover:bg-slate-700 border-white/15'
                        }`}
                      >
                        {isFlipped ? (
                          <>
                            <span className="text-4xl">{card.symbol}</span>
                            <span className="text-[11px] font-black text-slate-200">
                              {isRTL ? card.labelAr : card.labelEn}
                            </span>
                          </>
                        ) : (
                          <>
                            <Bot className="w-8 h-8 text-cyan-400" />
                            <span className="text-xs font-black text-slate-400">SMARTY</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ====================================================================
                ENGINE 4: PATTERN & SEQUENCE STUDIO (Pattern Detective, Pattern Builder, Repeat Dance, Smart Sequence)
                ==================================================================== */}
            {activeGame.engineKind === 'pattern_sequence' && (
              <div className="space-y-6" data-testid="engine-pattern-sequence">
                <div className="p-5 rounded-3xl bg-black/40 border border-white/10">
                  <p className="text-xs font-black text-cyan-300 uppercase mb-3">
                    {isRTL ? 'شريط النمط المتكرر:' : 'Repeating Pattern Strip:'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {patternSlots.map((slotSymbol, idx) => (
                      <div
                        key={idx}
                        data-testid={`pattern-slot-${idx}`}
                        className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-black ${
                          slotSymbol === '?'
                            ? 'bg-amber-500/20 border-amber-400 border-dashed text-amber-300 animate-pulse'
                            : 'bg-slate-800 border-white/15 text-white'
                        }`}
                      >
                        {slotSymbol}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-black text-slate-200 mb-3">
                    {isRTL
                      ? 'اختر العنصر الصحيح لملء علامة الاستفهام (?) بالترتيب:'
                      : 'Pick the correct item to fill the next question mark (?):'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {levelBlueprint.patternUnit.map((unitIcon, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePatternChoicePick(unitIcon)}
                        data-testid={`pattern-option-${idx}`}
                        data-icon={unitIcon}
                        className="w-20 h-20 rounded-3xl bg-slate-800 hover:bg-cyan-500/25 border-2 border-cyan-400/50 hover:border-cyan-400 text-4xl flex items-center justify-center shadow-lg transition-all cursor-pointer"
                      >
                        {unitIcon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================================
                ENGINE 5: DIRECTION COMPASS (Follow the Arrow, Find the Direction, Follow the Path)
                ==================================================================== */}
            {activeGame.engineKind === 'direction_compass' && (
              <div className="space-y-6 text-center" data-testid="engine-direction-compass">
                <div className="p-6 rounded-3xl bg-indigo-950/60 border border-cyan-500/30 max-w-xl mx-auto">
                  <p className="text-xs font-black text-cyan-300 uppercase mb-3">
                    {isRTL
                      ? `إشارة البوصلة الحالية (${compassStepIndex + 1} من ${levelBlueprint.idealDirections.length})`
                      : `Active Compass Signal (${compassStepIndex + 1} of ${levelBlueprint.idealDirections.length})`}
                  </p>
                  <div className="flex items-center justify-center gap-3 my-4">
                    {levelBlueprint.idealDirections.map((d, idx) => {
                      const isDone = idx < compassStepIndex;
                      const isCurrent = idx === compassStepIndex;
                      const arrowLabel =
                        d === 'RIGHT' ? '➡️' : d === 'LEFT' ? '⬅️' : d === 'UP' ? '⬆️' : '⬇️';
                      return (
                        <div
                          key={idx}
                          data-testid={`compass-signal-${idx}`}
                          data-direction={d}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${
                            isDone
                              ? 'bg-emerald-500/20 border-emerald-400 opacity-60'
                              : isCurrent
                              ? 'bg-cyan-500/30 border-cyan-300 scale-115 shadow-lg'
                              : 'bg-slate-900 border-white/10 opacity-40'
                          }`}
                        >
                          {arrowLabel}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  {(
                    [
                      { dir: 'UP', labelAr: 'أعلى ⬆️', labelEn: 'UP ⬆️' },
                      { dir: 'RIGHT', labelAr: 'يمين ➡️', labelEn: 'RIGHT ➡️' },
                      { dir: 'DOWN', labelAr: 'أسفل ⬇️', labelEn: 'DOWN ⬇️' },
                      { dir: 'LEFT', labelAr: 'يسار ⬅️', labelEn: 'LEFT ⬅️' }
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.dir}
                      onClick={() => handleCompassDirectionPick(btn.dir)}
                      data-testid={`compass-btn-${btn.dir}`}
                      className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-cyan-500/25 border-2 border-cyan-500/40 hover:border-cyan-400 font-black text-base text-white shadow-lg cursor-pointer transition-all"
                    >
                      {isRTL ? btn.labelAr : btn.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ====================================================================
                ENGINE 6, 7, 8: 2D ROBOTICS MAP GRID + CODE SEQUENCER + CODE DEBUGGER
                (Used across Chapters 3, 4, 5, 6, 7)
                ==================================================================== */}
            {(activeGame.engineKind === 'grid_navigator' ||
              activeGame.engineKind === 'code_sequencer' ||
              activeGame.engineKind === 'code_debugger') && (
              <div
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                data-testid="engine-grid-and-code"
              >
                {/* Left Column: Interactive 2D Robotics Map Grid */}
                <div className="lg:col-span-6 bg-slate-950/90 border border-white/15 rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-cyan-400">
                      {isRTL
                        ? `خريطة المهمة (${levelBlueprint.gridN}×${levelBlueprint.gridN})`
                        : `Mission Grid (${levelBlueprint.gridN}×${levelBlueprint.gridN})`}
                    </span>
                    <span
                      className="text-xs font-bold text-emerald-300"
                      data-testid="grid-ideal-path-hint"
                      data-ideal-path={levelBlueprint.idealDirections.join(',')}
                    >
                      {isRTL
                        ? `الموقع: (${botPos.x}, ${botPos.y}) ← الهدف: (${levelBlueprint.goalCoord.x}, ${levelBlueprint.goalCoord.y})`
                        : `Pos: (${botPos.x}, ${botPos.y}) → Goal: (${levelBlueprint.goalCoord.x}, ${levelBlueprint.goalCoord.y})`}
                    </span>
                  </div>

                  <div
                    className="grid gap-2 mx-auto max-w-md"
                    style={{
                      gridTemplateColumns: `repeat(${levelBlueprint.gridN}, minmax(0, 1fr))`
                    }}
                  >
                    {Array.from({ length: levelBlueprint.gridN * levelBlueprint.gridN }).map(
                      (_, cellIdx) => {
                        const x = cellIdx % levelBlueprint.gridN;
                        const y = Math.floor(cellIdx / levelBlueprint.gridN);
                        const isBotHere = botPos.x === x && botPos.y === y;
                        const isGoal =
                          levelBlueprint.goalCoord.x === x && levelBlueprint.goalCoord.y === y;
                        const isMidpoint =
                          levelBlueprint.midpointCoord.x === x &&
                          levelBlueprint.midpointCoord.y === y &&
                          !isGoal &&
                          !(x === 0 && y === 0);
                        const isObstacle = levelBlueprint.obstacles.some(
                          (o) => o.x === x && o.y === y
                        );
                        const isIdealPath = levelBlueprint.pathCoords.some(
                          (p) => p.x === x && p.y === y
                        );

                        return (
                          <div
                            key={`${x}-${y}`}
                            data-testid={`grid-cell-${x}-${y}`}
                            className={`aspect-square rounded-2xl border-2 flex items-center justify-center relative transition-all ${
                              isBotHere
                                ? 'bg-cyan-500/30 border-cyan-300 shadow-lg shadow-cyan-500/30'
                                : isGoal
                                ? 'bg-emerald-500/25 border-emerald-400'
                                : isObstacle
                                ? 'bg-rose-950/70 border-rose-500/40'
                                : isIdealPath && scaledConfig.scaffoldingLevel !== 'minimal'
                                ? 'bg-indigo-950/60 border-indigo-400/30'
                                : 'bg-slate-900 border-white/10'
                            }`}
                          >
                            {isObstacle && <span className="text-2xl">🚧</span>}
                            {isMidpoint && !isBotHere && (
                              <span className="text-xl">
                                {activeGame.subMode === 'deliver_package'
                                  ? packagePickedUp
                                    ? '✅'
                                    : '📦'
                                  : activeGame.subMode === 'cross_bridge'
                                  ? bridgeActivated
                                    ? '🌉'
                                    : '🔘'
                                  : activeGame.subMode === 'robot_rescue'
                                  ? '🤖'
                                  : '⭐'}
                              </span>
                            )}
                            {isGoal && !isBotHere && <span className="text-2xl">🏁</span>}
                            {isBotHere && (
                              <div className="w-11 h-11">
                                <SmartyMascot3D
                                  state={robotState}
                                  subRegionFocus="head_visor"
                                  size="sm"
                                  language={language}
                                />
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Right Column: Controls (Direct D-Pad for grid_navigator OR Block IDE for code_sequencer / code_debugger) */}
                <div className="lg:col-span-6 space-y-4">
                  {activeGame.engineKind === 'grid_navigator' ? (
                    <div className="bg-slate-950/80 border border-white/15 rounded-3xl p-6 text-center">
                      <h3 className="text-base font-black text-white mb-2">
                        {isRTL
                          ? 'وحدة التحكم المباشر بالروبوت سمارتي'
                          : 'Smarty Live Navigation Controller'}
                      </h3>
                      <p className="text-xs text-slate-300 mb-4">
                        {isRTL
                          ? `المسار المقترح: ${levelBlueprint.idealDirections
                              .map((d) =>
                                d === 'RIGHT' ? 'يمين' : d === 'DOWN' ? 'أسفل' : d === 'UP' ? 'أعلى' : 'يسار'
                              )
                              .join(' ← ')}`
                          : `Suggested Route: ${levelBlueprint.idealDirections.join(' → ')}`}
                      </p>

                      <div className="inline-grid grid-cols-3 gap-3 max-w-xs mx-auto">
                        <div />
                        <button
                          onClick={() => handleLiveGridMove('UP')}
                          data-testid="dpad-UP"
                          className="p-4 rounded-2xl bg-slate-800 hover:bg-cyan-500/30 border border-cyan-400/40 flex flex-col items-center justify-center cursor-pointer"
                        >
                          <ArrowUp className="w-6 h-6 text-cyan-300" />
                          <span className="text-[10px] font-black mt-1">{isRTL ? 'أعلى' : 'UP'}</span>
                        </button>
                        <div />

                        <button
                          onClick={() => handleLiveGridMove('LEFT')}
                          data-testid="dpad-LEFT"
                          className="p-4 rounded-2xl bg-slate-800 hover:bg-cyan-500/30 border border-cyan-400/40 flex flex-col items-center justify-center cursor-pointer"
                        >
                          <ArrowLeft className="w-6 h-6 text-cyan-300" />
                          <span className="text-[10px] font-black mt-1">{isRTL ? 'يسار' : 'LEFT'}</span>
                        </button>
                        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <Compass className="w-6 h-6 text-cyan-400" />
                        </div>
                        <button
                          onClick={() => handleLiveGridMove('RIGHT')}
                          data-testid="dpad-RIGHT"
                          className="p-4 rounded-2xl bg-slate-800 hover:bg-cyan-500/30 border border-cyan-400/40 flex flex-col items-center justify-center cursor-pointer"
                        >
                          <ArrowRight className="w-6 h-6 text-cyan-300" />
                          <span className="text-[10px] font-black mt-1">{isRTL ? 'يمين' : 'RIGHT'}</span>
                        </button>

                        <div />
                        <button
                          onClick={() => handleLiveGridMove('DOWN')}
                          data-testid="dpad-DOWN"
                          className="p-4 rounded-2xl bg-slate-800 hover:bg-cyan-500/30 border border-cyan-400/40 flex flex-col items-center justify-center cursor-pointer"
                        >
                          <ArrowDown className="w-6 h-6 text-cyan-300" />
                          <span className="text-[10px] font-black mt-1">{isRTL ? 'أسفل' : 'DOWN'}</span>
                        </button>
                        <div />
                      </div>
                    </div>
                  ) : (
                    /* CODE SEQUENCER & CODE DEBUGGER WORKSPACE */
                    <div className="bg-slate-950/85 border border-white/15 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-cyan-300">
                          {activeGame.engineKind === 'code_debugger'
                            ? isRTL
                              ? 'مختبر اكتشاف وإصلاح الأخطاء البرمجية (Debugging)'
                              : 'Code Debugging & Repair Workspace'
                            : isRTL
                            ? 'لوحة تركيب الأوامر البرمجية (Code Blocks)'
                            : 'Visual Block Coding Palette'}
                        </h3>

                        {activeGame.engineKind === 'code_debugger' && (
                          <button
                            onClick={() => {
                              playSound('click');
                              setCommandQueue([...levelBlueprint.idealDirections]);
                              setRobotState('cheering');
                              setRobotMessage({
                                ar: 'تم إصلاح التسلسل البرمجي! اضغط الآن على زر تشغيل الكود.',
                                en: 'Sequence repaired! Now press Run Code to verify.'
                              });
                            }}
                            data-testid="auto-fix-bug-btn"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-black cursor-pointer"
                          >
                            {isRTL ? 'إصلاح الخطأ المكتشف 🔧' : 'Repair Buggy Step 🔧'}
                          </button>
                        )}
                      </div>

                      {/* Command Palette Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {(['RIGHT', 'DOWN', 'UP', 'LEFT'] as const).map((cmd) => (
                          <button
                            key={cmd}
                            onClick={() => {
                              playSound('click');
                              setCommandQueue((prev) => [...prev, cmd]);
                            }}
                            data-testid={`add-code-block-${cmd}`}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-xs font-black text-white cursor-pointer"
                          >
                            + {cmd}
                          </button>
                        ))}

                        {/* Quick Repeat Loop Block for Chapter 7 */}
                        {chapter.chapterId === 7 && (
                          <button
                            onClick={() => {
                              playSound('click');
                              setCommandQueue([...levelBlueprint.idealDirections]);
                            }}
                            data-testid="apply-repeat-loop-btn"
                            className="px-3.5 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/40 text-xs font-black text-amber-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            <span>{isRTL ? `حلقة تكرار ذكية (${loopMultiplier}x)` : `Smart Repeat Loop (${loopMultiplier}x)`}</span>
                          </button>
                        )}
                      </div>

                      {/* Queued Program Steps */}
                      <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 min-h-[110px]">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mb-2">
                          <span>
                            {isRTL
                              ? `البرنامج الحالي (${commandQueue.length} خطوات):`
                              : `Queued Program (${commandQueue.length} blocks):`}
                          </span>
                          <button
                            onClick={() => setCommandQueue([])}
                            className="text-rose-400 hover:underline cursor-pointer"
                          >
                            {isRTL ? 'مسح الكل' : 'Clear All'}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {commandQueue.map((cmd, idx) => {
                            const isBugStep =
                              activeGame.engineKind === 'code_debugger' &&
                              cmd !== levelBlueprint.idealDirections[idx];
                            return (
                              <div
                                key={idx}
                                data-testid={`queued-block-${idx}`}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 ${
                                  activeCommandIdx === idx
                                    ? 'bg-cyan-500 text-slate-950 border-white scale-105'
                                    : isBugStep
                                    ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                                    : 'bg-slate-800 border-white/15 text-white'
                                }`}
                              >
                                <span>
                                  {idx + 1}. {cmd}
                                </span>
                                <button
                                  onClick={() =>
                                    setCommandQueue((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  className="text-slate-400 hover:text-rose-400 cursor-pointer"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={handleRunCommandQueue}
                        disabled={isExecutingCode}
                        data-testid="run-code-queue-btn"
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          {isExecutingCode
                            ? isRTL
                              ? 'جاري التنفيذ...'
                              : 'Running...'
                            : isRTL
                            ? 'تشغيل الكود البرمجي الآن'
                            : 'Run Program Sequence'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ====================================================================
                ENGINE 9: EVENT SANDBOX & INTERACTIVE CREATOR STUDIO (Chapter 8)
                ==================================================================== */}
            {activeGame.engineKind === 'event_sandbox' && (
              <div
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                data-testid="engine-event-sandbox"
              >
                {/* Live Interactive 3D Robot Stage */}
                <div className="lg:col-span-5 bg-gradient-to-b from-indigo-950/90 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 text-center">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black">
                    {isRTL ? 'مسرح الأحداث التفاعلي المباشر' : 'Live Event-Driven Stage'}
                  </span>

                  <div className="my-6 flex justify-center">
                    <SmartyMascot3D
                      state={robotState}
                      subRegionFocus="full_hero"
                      size="lg"
                      showStateBadge={true}
                      language={language}
                    />
                  </div>

                  <p className="text-xs font-black text-emerald-300">
                    {isRTL
                      ? `الأحداث المفعّلة: ${triggeredEvents.length} / ${requiredEventsCount}`
                      : `Events Triggered: ${triggeredEvents.length} / ${requiredEventsCount}`}
                  </p>
                </div>

                {/* Event Triggers & Action Blocks */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-sm font-black text-amber-300 mb-2">
                    {isRTL
                      ? `برمج وشغّل ${requiredEventsCount} من بطاقات الأحداث الذكية لإتمام المشروع:`
                      : `Bind and trigger ${requiredEventsCount} Smart Event Cards to complete your project:`}
                  </h3>

                  {eventDefinitions.slice(0, requiredEventsCount).map((ev) => {
                    const isFired = triggeredEvents.includes(ev.id);
                    return (
                      <div
                        key={ev.id}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-wrap items-center justify-between gap-3 ${
                          isFired
                            ? 'bg-emerald-500/15 border-emerald-400'
                            : 'bg-slate-800/80 border-white/15'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-black text-amber-300">
                            {isRTL ? ev.triggerAr : ev.triggerEn}
                          </div>
                          <div className="text-sm font-black text-white mt-0.5">
                            ➔ {isRTL ? ev.actionAr : ev.actionEn}
                          </div>
                        </div>

                        <button
                          onClick={() => handleBindAndTriggerEvent(ev.id)}
                          data-testid={`trigger-event-card-${ev.id}`}
                          className={`px-4 py-2.5 rounded-xl font-black text-xs cursor-pointer transition-all ${
                            isFired
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                          }`}
                        >
                          {isFired
                            ? isRTL
                              ? 'تم التفعيل ✓'
                              : 'Triggered ✓'
                            : isRTL
                            ? 'ربط وتشغيل الحدث ⚡'
                            : 'Bind & Trigger ⚡'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================
            VIEW 4: STEP 9-11 OF PLAYER JOURNEY (Level Result, XP/Stars Award, Unlock Next Level)
            ======================================================================== */}
        {journeyStep === 'level_result' && (
          <div
            className="max-w-2xl mx-auto bg-slate-900/95 border-2 border-emerald-400/50 rounded-3xl p-8 text-center shadow-2xl"
            data-testid="level-result-screen"
          >
            <div className="flex justify-center mb-4">
              <SmartyMascot3D
                state="victory"
                subRegionFocus="full_hero"
                size="lg"
                showStateBadge={true}
                language={language}
              />
            </div>

            <span className="px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black">
              {isRTL ? 'اكتملت المهمة بنجاح!' : 'Mission Accomplished!'}
            </span>

            <h2 className="text-3xl font-black text-white mt-2">
              {isRTL
                ? `بطل رائع يا ${activeChildName}!`
                : `Fantastic Job, ${activeChildName}!`}
            </h2>

            {/* Stars Display */}
            <div className="flex items-center justify-center gap-3 my-5">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-10 h-10 ${
                    s <= (lastAwardResult?.starsEarned || 3)
                      ? 'text-amber-400 fill-amber-400 drop-shadow'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* XP Reward Badge */}
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 mb-6"
              data-testid="level-result-xp-badge"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-black text-cyan-200">
                {lastAwardResult?.alreadyCompleted
                  ? isRTL
                    ? 'تمت مراجعة المرحلة بنجاح (تم احتساب نقاط XP مسبقاً)'
                    : 'Level replayed! (XP already claimed previously)'
                  : isRTL
                  ? `ربحت +${lastAwardResult?.xpDelta || activeLevel.xpReward} نقطة خبرة (XP)!`
                  : `You earned +${lastAwardResult?.xpDelta || activeLevel.xpReward} XP!`}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  playSound('click');
                  setJourneyStep('chapter_map');
                }}
                data-testid="return-to-map-btn"
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-sm font-black text-white cursor-pointer"
              >
                {isRTL ? 'خريطة مراحل الفصل' : 'Chapter Progress Map'}
              </button>

              {selectedLevelNum < activeGame.levels.length && (
                <button
                  onClick={() => {
                    playSound('click');
                    setSelectedLevelNum((prev) => Math.min(activeGame.levels.length, prev + 1));
                    setJourneyStep('playing');
                  }}
                  data-testid="next-level-btn"
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {isRTL
                      ? `المرحلة التالية (${selectedLevelNum + 1})`
                      : `Next Level (${selectedLevelNum + 1})`}
                  </span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
