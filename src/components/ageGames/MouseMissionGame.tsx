import React, { useState, useMemo } from 'react';
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
  Play,
  Award,
  MousePointer,
} from 'lucide-react';
import { Language } from '../../types';
import {
  AgeGameConfig,
  AgeGameStageConfig,
  ChildProfileRecord,
  StageAssessmentResult,
} from '../../data/ageGamesData';
import {
  playPickupSfx,
  playSnapSfx,
  playRetrySfx,
  playSuccessFanfareSfx,
  speakInstruction,
  setAudioMuted,
  getAudioMuted,
} from '../../utils/soundEffects';
import { SmartyMascot3D, SmartyAction } from '../SmartyMascot3D';

interface MouseMissionGameProps {
  language: Language;
  gameConfig: AgeGameConfig;
  childProfile: ChildProfileRecord;
  onSaveStageCompletion: (
    stageId: string,
    xpReward: number,
    starsReward: number,
    assessment: StageAssessmentResult
  ) => void;
  onExit: () => void;
  adminPreviewMode?: boolean;
}

type GameShellState = 'TITLE_MENU' | 'PLAYING' | 'STAGE_VICTORY';
type MascotMood = 'idle' | 'happy' | 'hint' | 'celebrate';

const CLICK_TARGETS = [
  {
    id: 'battery',
    icon: '🔋',
    label: { ar: 'بطارية الطاقة الخضراء', en: 'Green Energy Battery' },
    color: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    id: 'cpu',
    icon: '🧠',
    label: { ar: 'المعالج الذكي', en: 'Smart Processor' },
    color: 'border-sky-400 bg-sky-50 dark:bg-sky-950/40',
  },
  {
    id: 'shield',
    icon: '🛡️',
    label: { ar: 'درع الحماية الرقمي', en: 'Digital Security Shield' },
    color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/40',
  },
  {
    id: 'satellite',
    icon: '📡',
    label: { ar: 'هوائي الإشارة الذكي', en: 'Smart Signal Dish' },
    color: 'border-purple-400 bg-purple-50 dark:bg-purple-950/40',
  },
  {
    id: 'gear',
    icon: '⚙️',
    label: { ar: 'ترس الميكانيكا', en: 'Mechanical Gear' },
    color: 'border-slate-400 bg-slate-100 dark:bg-slate-800',
  },
  {
    id: ' folder',
    icon: '📁',
    label: { ar: 'ملف البيانات', en: 'Data Folder' },
    color: 'border-orange-400 bg-orange-50 dark:bg-orange-950/40',
  },
];

const HARDWARE_PARTS = [
  {
    id: 'hw-battery',
    icon: '🔋',
    label: { ar: 'وحدة البطارية', en: 'Power Unit' },
    slotLabel: { ar: 'منفذ الطاقة الكهربائي', en: 'Power Socket' },
  },
  {
    id: 'hw-cpu',
    icon: '🎛️',
    label: { ar: 'شريحة المعالج', en: 'CPU Chip' },
    slotLabel: { ar: 'قاعدة المعالج المركزي', en: 'CPU Bay' },
  },
  {
    id: 'hw-sensor',
    icon: '👁️',
    label: { ar: 'عدسة الكاميرا الذكية', en: 'Smart Optical Sensor' },
    slotLabel: { ar: 'منفذ المستشعر البصري', en: 'Optical Port' },
  },
  {
    id: 'hw- cooling',
    icon: '❄️',
    label: { ar: 'مروحة التبريد', en: 'Cooling Fan' },
    slotLabel: { ar: 'منفذ التبريد الحراري', en: 'Cooling Vent' },
  },
];

const ROVER_PUZZLE_QUADRANTS = [
  {
    id: 'quad-tl',
    quadrant: 0,
    label: { ar: 'الجزء 1: هوائي الرادار العلوي', en: 'Part 1: Top-Left Radar Antenna' },
    slotLabel: { ar: 'أعلى يسار (1)', en: 'Top-Left (1)' },
  },
  {
    id: 'quad-tr',
    quadrant: 1,
    label: { ar: 'الجزء 2: الكاميرا الأمامية الذكية', en: 'Part 2: Top-Right Smart Camera' },
    slotLabel: { ar: 'أعلى يمين (2)', en: 'Top-Right (2)' },
  },
  {
    id: 'quad-bl',
    quadrant: 2,
    label: { ar: 'الجزء 3: المحرك والعجلة الخلفية', en: 'Part 3: Bottom-Left Rear Drive' },
    slotLabel: { ar: 'أسفل يسار (3)', en: 'Bottom-Left (3)' },
  },
  {
    id: 'quad-br',
    quadrant: 3,
    label: { ar: 'الجزء 4: الذراع والعجلة الأمامية', en: 'Part 4: Bottom-Right Front Arm' },
    slotLabel: { ar: 'أسفل يمين (4)', en: 'Bottom-Right (4)' },
  },
];

const RoverQuadrantSvg: React.FC<{ quadrant: number; faded?: boolean }> = ({
  quadrant,
  faded = false,
}) => (
  <svg
    viewBox="0 0 120 90"
    className={`w-full h-24 ${faded ? 'opacity-30 grayscale' : ''}`}
    aria-hidden="true"
  >
    <rect x="0" y="0" width="120" height="90" rx="8" fill="#0F172A" />
    {quadrant === 0 && (
      <>
        <line x1="65" y1="85" x2="65" y2="28" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
        <circle cx="65" cy="24" r="10" fill="#FACC15" />
        <path d="M45 24 A20 20 0 0 1 85 24" fill="none" stroke="#38BDF8" strokeWidth="3" />
        <rect x="45" y="65" width="75" height="25" rx="6" fill="#2563EB" />
      </>
    )}
    {quadrant === 1 && (
      <>
        <rect x="0" y="65" width="75" height="25" rx="6" fill="#2563EB" />
        <rect x="35" y="30" width="38" height="28" rx="8" fill="#38BDF8" />
        <circle cx="58" cy="44" r="8" fill="#0F172A" stroke="#FACC15" strokeWidth="3" />
        <line x1="54" y1="58" x2="54" y2="65" stroke="#94A3B8" strokeWidth="6" />
      </>
    )}
    {quadrant === 2 && (
      <>
        <rect x="45" y="0" width="75" height="35" rx="6" fill="#1D4ED8" />
        <circle cx="70" cy="52" r="24" fill="#334155" stroke="#E2E8F0" strokeWidth="5" />
        <circle cx="70" cy="52" r="9" fill="#FACC15" />
      </>
    )}
    {quadrant === 3 && (
      <>
        <rect x="0" y="0" width="75" height="35" rx="6" fill="#1D4ED8" />
        <line x1="68" y1="18" x2="104" y2="32" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
        <circle cx="106" cy="34" r="7" fill="#EF4444" />
        <circle cx="48" cy="52" r="24" fill="#334155" stroke="#E2E8F0" strokeWidth="5" />
        <circle cx="48" cy="52" r="9" fill="#38BDF8" />
      </>
    )}
  </svg>
);

export const MouseMissionGame: React.FC<MouseMissionGameProps> = ({
  language,
  gameConfig,
  childProfile,
  onSaveStageCompletion,
  onExit,
  adminPreviewMode = false,
}) => {
  const isAr = language === 'ar';
  const enabledStages = useMemo(
    () => gameConfig.stages.filter((s) => s.isEnabled || adminPreviewMode),
    [gameConfig.stages, adminPreviewMode]
  );

  const [shellState, setShellState] = useState<GameShellState>('TITLE_MENU');
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [feedback, setFeedback] = useState<{ ar: string; en: string } | null>(null);
  const [muted, setMuted] = useState<boolean>(getAudioMuted());

  // Metrics
  const [attempts, setAttempts] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [xpJustEarned, setXpJustEarned] = useState<number>(0);
  const [alreadyCompletedBefore, setAlreadyCompletedBefore] = useState<boolean>(false);

  // Stage 1: Hover path nodes
  const [hoveredNodes, setHoveredNodes] = useState<number[]>([]);

  // Stage 2: Click Challenge round
  const [clickRound, setClickRound] = useState<number>(0);

  // Stage 3: Drag & Drop parts
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [installedParts, setInstalledParts] = useState<Record<string, string>>({});

  // Stage 4: Puzzle Builder
  const [selectedQuadId, setSelectedQuadId] = useState<string | null>(null);
  const [placedQuads, setPlacedQuads] = useState<Record<string, string>>({});

  // Stage 5: Mission Complete 3-phase combo
  const [comboPhase, setComboPhase] = useState<1 | 2 | 3>(1);
  const [scannedSensors, setScannedSensors] = useState<number[]>([]);
  const [clickedSwitches, setClickedSwitches] = useState<number[]>([]);
  const [keycardSelected, setKeycardSelected] = useState<boolean>(false);

  const currentStage: AgeGameStageConfig = enabledStages[activeStageIdx] || enabledStages[0];
  const maxUnlockedStageNum =
    childProfile.unlockedStageByGame?.discoverers_mouse_mission ?? 1;

  const initStageState = (stage: AgeGameStageConfig) => {
    setAttempts(0);
    setMistakes(0);
    setHoveredNodes([]);
    setClickRound(0);
    setSelectedPartId(null);
    setInstalledParts({});
    setSelectedQuadId(null);
    setPlacedQuads({});
    setComboPhase(1);
    setScannedSensors([]);
    setClickedSwitches([]);
    setKeycardSelected(false);
    setMascotMood('idle');
    setFeedback(stage.instruction);
    speakInstruction(stage.audioPrompt[language], language);
  };

  const handleStartStage = (idx: number) => {
    const target = enabledStages[idx];
    if (!target) return;
    setActiveStageIdx(idx);
    setShellState('PLAYING');
    initStageState(target);
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
  };

  const completeCurrentStage = () => {
    playSuccessFanfareSfx();
    setMascotMood('celebrate');
    const totalTries = Math.max(1, attempts + 1);
    const acc = Math.max(45, Math.round(((totalTries - mistakes) / totalTries) * 100));
    const wasDone = childProfile.completedStageIds.includes(currentStage.id);
    setAlreadyCompletedBefore(wasDone);
    setXpJustEarned(wasDone ? 0 : currentStage.xpReward);

    const assessment: StageAssessmentResult = {
      stageId: currentStage.id,
      gameId: 'discoverers_mouse_mission',
      completedAt: new Date().toISOString(),
      attempts: totalTries,
      mistakes,
      accuracy: acc,
      starsEarned: currentStage.starsReward,
      xpAwarded: wasDone ? 0 : currentStage.xpReward,
    };

    onSaveStageCompletion(
      currentStage.id,
      currentStage.xpReward,
      currentStage.starsReward,
      assessment
    );

    speakInstruction(currentStage.successFeedback[language], language);
    setShellState('STAGE_VICTORY');
  };

  // Stage 1: Hover Path Logic
  const totalHoverNodes = Math.max(3, Math.min(6, currentStage?.challengesCount || 4));
  const handleNodeHoverOrTap = (nodeNum: number) => {
    if (hoveredNodes.includes(nodeNum)) return;
    const expectedNext = hoveredNodes.length + 1;
    setAttempts((a) => a + 1);
    if (nodeNum === expectedNext) {
      playSnapSfx();
      setMascotMood('happy');
      const nextList = [...hoveredNodes, nodeNum];
      setHoveredNodes(nextList);
      if (nextList.length >= totalHoverNodes) {
        completeCurrentStage();
      } else {
        setFeedback({
          ar: `ممتاز! تم شحن النقطة ${nodeNum} — حرّك المؤشر الآن إلى النقطة ${nodeNum + 1}!`,
          en: `Great! Node #${nodeNum} charged — now move your pointer to Node #${nodeNum + 1}!`,
        });
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const msg = {
        ar: `انتبه للترتيب! حرّك المؤشر إلى النقطة رقم ${expectedNext} أولاً.`,
        en: `Follow the sequence! Move your pointer to Node #${expectedNext} first.`,
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    }
  };

  // Stage 2: Click Challenge Logic
  const totalClickRounds = Math.max(3, Math.min(6, currentStage?.challengesCount || 4));
  const requiredClickTarget = CLICK_TARGETS[clickRound % 4];
  const handleTargetClick = (itemId: string) => {
    setAttempts((a) => a + 1);
    if (itemId === requiredClickTarget.id) {
      playSnapSfx();
      setMascotMood('happy');
      if (clickRound + 1 >= totalClickRounds) {
        completeCurrentStage();
      } else {
        const nextR = clickRound + 1;
        setClickRound(nextR);
        const nextT = CLICK_TARGETS[nextR % 4];
        const msg = {
          ar: `نقرة دقيقة! الآن اضغط على "${nextT.label.ar}" ${nextT.icon}`,
          en: `Accurate click! Now click on "${nextT.label.en}" ${nextT.icon}`,
        };
        setFeedback(msg);
        speakInstruction(msg[language], language);
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const msg = {
        ar: `ليس هذا العنصر! نحن نبحث عن "${requiredClickTarget.label.ar}" ${requiredClickTarget.icon}`,
        en: `Not that one! Click on "${requiredClickTarget.label.en}" ${requiredClickTarget.icon}`,
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    }
  };

  // Stage 3: Drag & Drop Hardware Logic
  const activeHardware = useMemo(() => {
    const count = Math.max(3, Math.min(4, currentStage?.challengesCount || 4));
    return HARDWARE_PARTS.slice(0, count);
  }, [currentStage]);

  const handleHardwareDrop = (partId: string, socketId: string) => {
    setAttempts((a) => a + 1);
    if (partId === socketId) {
      playSnapSfx();
      setMascotMood('happy');
      const next = { ...installedParts, [socketId]: partId };
      setInstalledParts(next);
      setSelectedPartId(null);
      if (Object.keys(next).length >= activeHardware.length) {
        completeCurrentStage();
      } else {
        setFeedback({
          ar: 'تم توصيل الوحدة بنجاح في اللوحة الأم! أكمل باقي الوحدات.',
          en: 'Module installed cleanly on the mainboard! Keep going.',
        });
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const msg = {
        ar: 'هذا المنفذ مخصص لوحدة أخرى! طابق الرمز مع المنفذ الصحيح.',
        en: 'This socket is for a different module! Match the icon with the right socket.',
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    }
  };

  // Stage 4: Puzzle Builder Logic
  const handleQuadDrop = (quadId: string, slotId: string) => {
    setAttempts((a) => a + 1);
    if (quadId === slotId) {
      playSnapSfx();
      setMascotMood('happy');
      const next = { ...placedQuads, [slotId]: quadId };
      setPlacedQuads(next);
      setSelectedQuadId(null);
      if (Object.keys(next).length >= ROVER_PUZZLE_QUADRANTS.length) {
        completeCurrentStage();
      } else {
        setFeedback({
          ar: 'رائع! تم تثبيت جزء المركبة في مكانه الهندسي الصحيح!',
          en: 'Great! Rover blueprint quadrant snapped into position!',
        });
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const msg = {
        ar: 'انظر إلى رقم الركن واتجاه الرسم الهندسي لتكوين المركبة بشكل صحيح.',
        en: 'Check the corner number and blueprint lines to align the Rover properly.',
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    }
  };

  // Stage 5: Mission Complete 3-Phase Combo Logic
  const handleSensorHover = (sensorNum: number) => {
    if (comboPhase !== 1 || scannedSensors.includes(sensorNum)) return;
    playSnapSfx();
    const next = [...scannedSensors, sensorNum];
    setScannedSensors(next);
    if (next.length >= 3) {
      setComboPhase(2);
      const msg = {
        ar: 'اكتمل المسح! الخطوة 2: انقر على أزرار الشفرة (1 ثم 2 ثم 3) بالترتيب!',
        en: 'Scan complete! Phase 2: Click code buttons (1, then 2, then 3) in order!',
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    }
  };

  const handleCodeSwitchClick = (btnNum: number) => {
    if (comboPhase !== 2 || clickedSwitches.includes(btnNum)) return;
    const expected = clickedSwitches.length + 1;
    setAttempts((a) => a + 1);
    if (btnNum === expected) {
      playSnapSfx();
      const next = [...clickedSwitches, btnNum];
      setClickedSwitches(next);
      if (next.length >= 3) {
        setComboPhase(3);
        const msg = {
          ar: 'تم تفعيل الشفرة! الخطوة 3 والأخيرة: اسحب بطاقة الطاقة الذهبية إلى منفذ الإطلاق!',
          en: 'Code activated! Final Phase 3: Drag the Golden Power Keycard into the Launch Slot!',
        };
        setFeedback(msg);
        speakInstruction(msg[language], language);
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setFeedback({
        ar: `اضغط الزر رقم ${expected} أولاً بالترتيب!`,
        en: `Click switch #${expected} first in order!`,
      });
    }
  };

  // 1. TITLE MENU
  if (shellState === 'TITLE_MENU') {
    return (
      <div
        data-testid="discoverers-game-shell"
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-sky-200 dark:border-slate-800 max-w-6xl mx-auto my-6 overflow-hidden"
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{childProfile.avatarEmoji}</span>
            <div>
              <div className="text-xs text-sky-300 font-bold">
                {gameConfig.pathwayTitle[language]} · {childProfile.name[language]}
              </div>
              <h2 className="text-lg font-black text-white">{gameConfig.gameTitle[language]}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              data-testid="discoverers-xp-display"
              className="bg-amber-400 text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-black tabular-nums flex items-center gap-1.5"
            >
              <Star className="w-4 h-4 fill-current" />
              <span>{childProfile.progress.xpEarned ?? 0} XP</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              type="button"
              data-testid="discoverers-exit-btn"
              onClick={onExit}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              {isAr ? 'خروج للخريطة' : 'Exit to Hub'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 items-center">
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-sky-200 dark:border-slate-800 shadow-lg bg-sky-50 min-h-[280px]">
            <img
              src={gameConfig.heroImage}
              alt={gameConfig.gameTitle[language]}
              referrerPolicy="no-referrer"
              className="w-full h-72 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-sky-300 mb-1 block">
                    {gameConfig.mascotName[language]} — {gameConfig.mascotRole[language]}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">
                    {gameConfig.gameTitle[language]}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 mt-2">
                    {gameConfig.subtitle[language]}
                  </p>
                </div>
                <SmartyMascot3D action="greeting" size="xl" lang={language} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isAr ? 'مراحل مهمة الماوس الخمس' : '5 Mouse Mission Stages'}
              </h3>
              <span className="text-xs font-bold text-slate-500 tabular-nums">
                {childProfile.completedStageIds.filter((id) => id.startsWith('dis-')).length} / {enabledStages.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {enabledStages.map((stg, idx) => {
                const isDone = childProfile.completedStageIds.includes(stg.id);
                const isUnlocked =
                  adminPreviewMode || stg.stageNumber <= maxUnlockedStageNum || isDone;
                return (
                  <button
                    key={stg.id}
                    type="button"
                    disabled={!isUnlocked}
                    data-testid={`discoverers-stage-card-${stg.stageNumber}`}
                    onClick={() => isUnlocked && handleStartStage(idx)}
                    className={`w-full text-start p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400'
                        : isUnlocked
                        ? 'bg-white dark:bg-slate-800 border-sky-300 dark:border-sky-700 hover:border-red-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isUnlocked
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : isUnlocked ? stg.stageNumber : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {stg.title[language]}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {stg.objective[language]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 tabular-nums">
                        +{stg.xpReward} XP
                      </span>
                      {isUnlocked && (
                        <span className="bg-sky-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                          {isAr ? 'ابدأ' : 'Play'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              data-testid="discoverers-start-primary-btn"
              onClick={() => {
                const nextIdx = enabledStages.findIndex(
                  (s) => !childProfile.completedStageIds.includes(s.id)
                );
                handleStartStage(nextIdx >= 0 ? nextIdx : 0);
              }}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isAr ? 'ابدأ مهمة الماوس الذكي الآن!' : 'Start Mouse Mission Now!'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. STAGE VICTORY MODAL
  if (shellState === 'STAGE_VICTORY') {
    const hasNextStage = activeStageIdx < enabledStages.length - 1;
    return (
      <div
        data-testid="discoverers-victory-modal"
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-emerald-400 max-w-3xl mx-auto my-10 p-8 text-center space-y-6"
      >
        <div className="flex items-center justify-center mx-auto">
          <SmartyMascot3D action="victory" size="xl" lang={language} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {currentStage.successFeedback[language]}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {alreadyCompletedBefore
            ? isAr
              ? 'أحسنت في إعادة المهمة! (تم احتساب نقاط XP مسبقاً).'
              : 'Great replay! (XP for this stage was already awarded).'
            : isAr
            ? `رائع! حصلت على +${xpJustEarned} XP وتم فتح المرحلة التالية!`
            : `Awesome! You earned +${xpJustEarned} XP and unlocked the next stage!`}
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              setShellState('PLAYING');
              initStageState(currentStage);
            }}
            className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة المرحلة' : 'Replay Stage'}</span>
          </button>

          {hasNextStage ? (
            <button
              type="button"
              data-testid="discoverers-next-stage-btn"
              onClick={() => handleStartStage(activeStageIdx + 1)}
              className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-base shadow-lg flex items-center gap-2"
            >
              <span>{isAr ? 'المرحلة التالية' : 'Next Stage'}</span>
              {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          ) : (
            <button
              type="button"
              data-testid="discoverers-finish-game-btn"
              onClick={() => setShellState('TITLE_MENU')}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              <span>{isAr ? 'العودة لخريطة المهمات' : 'Back to Mission Map'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. ACTIVE PLAYING SCREEN
  return (
    <div
      data-testid="discoverers-playing-screen"
      data-stage-number={currentStage.stageNumber}
      data-mechanic={currentStage.mechanicKey}
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-sky-200 dark:border-slate-800 max-w-6xl mx-auto my-6 overflow-hidden"
    >
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShellState('TITLE_MENU')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            {isAr ? '← المهمات' : '← Missions'}
          </button>
          <div>
            <div className="text-xs text-sky-300 font-bold">
              {isAr
                ? `المرحلة ${currentStage.stageNumber} من ${enabledStages.length} · ${childProfile.name.ar}`
                : `Stage ${currentStage.stageNumber} of ${enabledStages.length} · ${childProfile.name.en}`}
            </div>
            <h3 className="text-base font-black text-white">{currentStage.title[language]}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {enabledStages.map((stg, idx) => {
            const done = childProfile.completedStageIds.includes(stg.id);
            const unlocked = adminPreviewMode || stg.stageNumber <= maxUnlockedStageNum || done;
            const active = idx === activeStageIdx;
            return (
              <button
                key={stg.id}
                type="button"
                disabled={!unlocked}
                data-testid={`discoverers-stepper-${stg.stageNumber}`}
                onClick={() => unlocked && handleStartStage(idx)}
                className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                  active
                    ? 'bg-sky-500 text-white ring-2 ring-white'
                    : done
                    ? 'bg-emerald-500 text-white'
                    : unlocked
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                }`}
              >
                {done ? '✓' : unlocked ? stg.stageNumber : <Lock className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <div
            data-testid="discoverers-xp-counter"
            className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded-xl text-xs font-black tabular-nums flex items-center gap-1"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>{childProfile.progress.xpEarned ?? 0} XP</span>
          </div>
          <button
            type="button"
            onClick={() => speakInstruction(currentStage.instruction[language], language)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'استماع' : 'Listen'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMascotMood('hint');
              setFeedback(currentStage.hint);
              speakInstruction(currentStage.hint[language], language);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1"
          >
            <Lightbulb className="w-4 h-4" />
            <span>{isAr ? 'تلميح' : 'Hint'}</span>
          </button>
        </div>
      </div>

      {/* Smarty Robot Companion Banner */}
      <div className="bg-sky-50/70 dark:bg-slate-800/60 px-6 py-4 border-b border-sky-200 dark:border-slate-800 flex items-center gap-4">
        <div className="w-24 h-24 rounded-3xl bg-white/80 dark:bg-slate-900/80 border-2 border-sky-300 dark:border-sky-700 flex items-center justify-center shadow-md shrink-0 p-1">
          <SmartyMascot3D
            action={
              (mascotMood === 'celebrate' || mascotMood === 'happy'
                ? 'celebrating'
                : mascotMood === 'hint'
                ? mistakes > 0
                  ? 'encouraging'
                  : 'thinking'
                : 'pointing') as SmartyAction
            }
            size="lg"
            lang={language}
          />
        </div>
        <div>
          <div className="text-xs font-bold text-sky-700 dark:text-sky-300">
            {gameConfig.mascotName[language]} — {currentStage.objective[language]}
          </div>
          <p
            data-testid="discoverers-feedback-text"
            className="text-lg font-black text-slate-900 dark:text-white mt-0.5"
          >
            {feedback ? feedback[language] : currentStage.instruction[language]}
          </p>
        </div>
      </div>

      {/* Stage Playfield */}
      <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-center">
        {/* STAGE 1: MOUSE EXPLORER HOVER PATH */}
        {currentStage.mechanicKey === 'mouse_explorer_hover' && (
          <div className="space-y-6 text-center">
            <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {isAr
                ? `حرّك مؤشر الماوس (أو المس) فوق النقاط المضيئة بالترتيب من 1 إلى ${totalHoverNodes}:`
                : `Move your pointer over the glowing energy nodes in order from 1 to ${totalHoverNodes}:`}
            </div>
            <div className="bg-slate-900 rounded-3xl p-8 border-4 border-sky-500/40 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 min-h-[240px]">
              {Array.from({ length: totalHoverNodes }).map((_, i) => {
                const nodeNum = i + 1;
                const isCharged = hoveredNodes.includes(nodeNum);
                const isNext = hoveredNodes.length + 1 === nodeNum;
                return (
                  <React.Fragment key={nodeNum}>
                    <button
                      type="button"
                      data-testid={`hover-node-${nodeNum}`}
                      onPointerEnter={() => handleNodeHoverOrTap(nodeNum)}
                      onClick={() => handleNodeHoverOrTap(nodeNum)}
                      className={`w-24 h-24 rounded-full font-black text-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-4 ${
                        isCharged
                          ? 'bg-emerald-500 border-emerald-200 text-white scale-105 shadow-lg shadow-emerald-500/40'
                          : isNext
                          ? 'bg-sky-500 border-amber-300 text-white animate-pulse scale-110 shadow-xl'
                          : 'bg-slate-800 border-slate-600 text-slate-400'
                      }`}
                    >
                      <span>{isCharged ? '⚡' : nodeNum}</span>
                      <span className="text-[11px] font-bold mt-1">
                        {isCharged ? (isAr ? 'مشحون' : 'Charged') : `${isAr ? 'نقطة' : 'Node'} ${nodeNum}`}
                      </span>
                    </button>
                    {nodeNum < totalHoverNodes && (
                      <div
                        className={`h-2 w-8 rounded-full transition-colors ${
                          isCharged ? 'bg-emerald-400' : 'bg-slate-700'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* STAGE 2: CLICK CHALLENGE */}
        {currentStage.mechanicKey === 'click_challenge' && (
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-3 bg-sky-100 dark:bg-sky-950/60 border-2 border-sky-400 px-6 py-3 rounded-2xl">
              <span className="text-3xl">{requiredClickTarget.icon}</span>
              <div className="text-start">
                <div className="text-xs font-bold text-sky-700 dark:text-sky-300">
                  {isAr
                    ? `المهمة ${clickRound + 1} من ${totalClickRounds} — انقر على:`
                    : `Target ${clickRound + 1} of ${totalClickRounds} — Click on:`}
                </div>
                <div
                  data-testid="required-click-target"
                  data-target-id={requiredClickTarget.id}
                  className="text-lg font-black text-slate-900 dark:text-white"
                >
                  {requiredClickTarget.label[language]}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {CLICK_TARGETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`click-item-${item.id}`}
                  onClick={() => handleTargetClick(item.id)}
                  className={`p-6 rounded-3xl border-4 ${item.color} hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-2 shadow-md cursor-pointer`}
                >
                  <span className="text-5xl">{item.icon}</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">
                    {item.label[language]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: DRAG & DROP HARDWARE PARTS */}
        {currentStage.mechanicKey === 'drag_drop_parts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-4 text-center">
                {isAr ? 'وحدات الحاسوب (اسحب أو اضغط للنقل)' : 'Computer Modules (Drag or Tap)'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {activeHardware.map((part) => {
                  if (installedParts[part.id]) return null;
                  const isSel = selectedPartId === part.id;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      draggable
                      data-testid={`hw-part-${part.id}`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', part.id);
                        playPickupSfx();
                        setSelectedPartId(part.id);
                      }}
                      onClick={() => {
                        playPickupSfx();
                        setSelectedPartId(part.id);
                      }}
                      className={`p-4 rounded-2xl border-4 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 transition-all cursor-grab ${
                        isSel
                          ? 'border-sky-600 ring-4 ring-sky-500/30 scale-105'
                          : 'border-slate-200 dark:border-slate-700 hover:border-sky-400'
                      }`}
                    >
                      <span className="text-4xl">{part.icon}</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white">
                        {part.label[language]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border-4 border-sky-500/40">
              <h4 className="text-sm font-black text-sky-300 mb-4 text-center">
                {isAr ? 'منافذ اللوحة الأم الذكية' : 'Smart Motherboard Sockets'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {activeHardware.map((socket) => {
                  const isInstalled = Boolean(installedParts[socket.id]);
                  return (
                    <div
                      key={socket.id}
                      data-testid={`hw-socket-${socket.id}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData('text/plain') || selectedPartId;
                        if (id) handleHardwareDrop(id, socket.id);
                      }}
                      onClick={() => {
                        if (selectedPartId && !isInstalled) {
                          handleHardwareDrop(selectedPartId, socket.id);
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 min-h-[120px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isInstalled
                          ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                          : 'bg-slate-800/80 border-dashed border-sky-400/60 hover:border-amber-400 text-slate-300'
                      }`}
                    >
                      <span className={`text-3xl ${isInstalled ? '' : 'opacity-40'}`}>
                        {socket.icon}
                      </span>
                      <span className="text-xs font-bold mt-2 text-center">
                        {isInstalled ? socket.label[language] : socket.slotLabel[language]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: PUZZLE BUILDER (4-PIECE ROVER BLUEPRINT) */}
        {currentStage.mechanicKey === 'puzzle_builder' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-4 text-center">
                {isAr ? 'أجزاء مخطط المركبة الذكية' : 'Smart Rover Blueprint Pieces'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {ROVER_PUZZLE_QUADRANTS.map((q) => {
                  if (placedQuads[q.id]) return null;
                  const isSel = selectedQuadId === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      draggable
                      data-testid={`rover-piece-${q.id}`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', q.id);
                        playPickupSfx();
                        setSelectedQuadId(q.id);
                      }}
                      onClick={() => {
                        playPickupSfx();
                        setSelectedQuadId(q.id);
                      }}
                      className={`p-3 rounded-2xl border-4 bg-white dark:bg-slate-900 flex flex-col items-center gap-1.5 transition-all cursor-grab ${
                        isSel
                          ? 'border-sky-600 ring-4 ring-sky-500/30 scale-105'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <RoverQuadrantSvg quadrant={q.quadrant} />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center">
                        {q.label[language]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-7 bg-slate-900 p-6 rounded-3xl border-4 border-sky-500/40">
              <h4 className="text-sm font-black text-sky-300 mb-4 text-center">
                {isAr ? 'شبكة تجميع المخطط الهندسي (2×2)' : 'Blueprint Assembly Grid (2×2)'}
              </h4>
              <div
                dir="ltr"
                className="grid grid-cols-2 gap-2 max-w-md mx-auto bg-slate-950 p-3 rounded-2xl border border-sky-500/30"
              >
                {ROVER_PUZZLE_QUADRANTS.map((slot) => {
                  const isPlaced = Boolean(placedQuads[slot.id]);
                  return (
                    <div
                      key={slot.id}
                      data-testid={`rover-slot-${slot.id}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData('text/plain') || selectedQuadId;
                        if (id) handleQuadDrop(id, slot.id);
                      }}
                      onClick={() => {
                        if (selectedQuadId && !isPlaced) {
                          handleQuadDrop(selectedQuadId, slot.id);
                        }
                      }}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isPlaced
                          ? 'border-emerald-400 bg-slate-900'
                          : 'border-dashed border-slate-600 hover:border-sky-400 bg-slate-900/50'
                      }`}
                    >
                      <RoverQuadrantSvg quadrant={slot.quadrant} faded={!isPlaced} />
                      <span className="text-[11px] font-bold text-slate-300 mt-1">
                        {slot.slotLabel[language]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: MISSION COMPLETE 3-PHASE COMBO */}
        {currentStage.mechanicKey === 'mission_complete_combo' && (
          <div className="space-y-6 max-w-3xl mx-auto w-full">
            {/* Phase Stepper */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { p: 1, ar: '1. مسح الحساسات بالمؤشر', en: '1. Hover Scan Sensors' },
                { p: 2, ar: '2. نقر أزرار الشفرة', en: '2. Click Code Switches' },
                { p: 3, ar: '3. سحب بطاقة الإطلاق', en: '3. Drag Launch Keycard' },
              ].map((step) => (
                <div
                  key={step.p}
                  className={`p-3 rounded-2xl border-2 text-center text-xs font-black ${
                    comboPhase === step.p
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                      : comboPhase > step.p
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 border-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isAr ? step.ar : step.en}
                </div>
              ))}
            </div>

            {comboPhase === 1 && (
              <div className="bg-slate-900 p-8 rounded-3xl border-4 border-sky-500/40 text-center space-y-6">
                <h4 className="text-white font-black text-lg">
                  {isAr
                    ? 'الخطوة 1: مرّر المؤشر فوق حساسات الرادار الثلاثة لفحصها!'
                    : 'Phase 1: Move your pointer over all 3 radar sensors to scan them!'}
                </h4>
                <div className="flex justify-center gap-6">
                  {[1, 2, 3].map((sNum) => {
                    const done = scannedSensors.includes(sNum);
                    return (
                      <button
                        key={sNum}
                        type="button"
                        data-testid={`combo-sensor-${sNum}`}
                        onPointerEnter={() => handleSensorHover(sNum)}
                        onClick={() => handleSensorHover(sNum)}
                        className={`w-28 h-28 rounded-2xl border-4 font-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          done
                            ? 'bg-emerald-500 border-emerald-200 text-white'
                            : 'bg-slate-800 border-sky-400 text-sky-300 animate-pulse'
                        }`}
                      >
                        <span className="text-3xl">{done ? '✅' : '📡'}</span>
                        <span className="text-xs">
                          {isAr ? `حساس ${sNum}` : `Sensor ${sNum}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {comboPhase === 2 && (
              <div className="bg-slate-900 p-8 rounded-3xl border-4 border-amber-400/50 text-center space-y-6">
                <h4 className="text-white font-black text-lg">
                  {isAr
                    ? 'الخطوة 2: انقر على أزرار الشفرة الرقمية بالترتيب (1 ثم 2 ثم 3)!'
                    : 'Phase 2: Click the digital code switches in order (1, then 2, then 3)!'}
                </h4>
                <div className="flex justify-center gap-6">
                  {[1, 2, 3].map((bNum) => {
                    const done = clickedSwitches.includes(bNum);
                    return (
                      <button
                        key={bNum}
                        type="button"
                        data-testid={`combo-switch-${bNum}`}
                        onClick={() => handleCodeSwitchClick(bNum)}
                        className={`w-28 h-28 rounded-2xl border-4 font-black text-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          done
                            ? 'bg-emerald-500 border-emerald-200 text-white'
                            : 'bg-amber-400 hover:bg-amber-300 border-white text-slate-900'
                        }`}
                      >
                        <span>{done ? '🔓' : bNum}</span>
                        <span className="text-xs font-bold">
                          {isAr ? `مفتاح ${bNum}` : `Switch ${bNum}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {comboPhase === 3 && (
              <div className="bg-slate-900 p-8 rounded-3xl border-4 border-emerald-400/50 text-center space-y-6">
                <h4 className="text-white font-black text-lg">
                  {isAr
                    ? 'الخطوة 3: اسحب (أو اضغط) بطاقة الإطلاق الذهبية وضعها في منفذ القمر الصناعي!'
                    : 'Phase 3: Drag (or tap) the Golden Launch Keycard into the Satellite Slot!'}
                </h4>
                <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
                  <button
                    type="button"
                    draggable
                    data-testid="combo-keycard"
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', 'keycard');
                      playPickupSfx();
                      setKeycardSelected(true);
                    }}
                    onClick={() => {
                      playPickupSfx();
                      setKeycardSelected(true);
                    }}
                    className={`p-6 rounded-2xl border-4 bg-amber-400 text-slate-900 font-black flex flex-col items-center gap-2 cursor-grab ${
                      keycardSelected ? 'ring-4 ring-white scale-105' : 'border-amber-200'
                    }`}
                  >
                    <span className="text-4xl">💳</span>
                    <span className="text-xs">
                      {isAr ? 'بطاقة الإطلاق الذهبية' : 'Golden Launch Keycard'}
                    </span>
                  </button>

                  <div
                    data-testid="combo-launch-slot"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      completeCurrentStage();
                    }}
                    onClick={() => {
                      if (keycardSelected) completeCurrentStage();
                    }}
                    className="w-48 h-36 rounded-3xl border-4 border-dashed border-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 font-black flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="text-4xl">🚀</span>
                    <span className="text-xs">
                      {isAr ? 'منفذ إطلاق القمر الصناعي' : 'Satellite Launch Port'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
