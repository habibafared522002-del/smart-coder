import React, { useState, useMemo, useRef } from 'react';
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
  ArrowUp,
  ArrowDown,
  Play,
  Trash2,
  Award,
  Cpu,
  AlertTriangle,
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
import { SmartyMascot3D } from '../SmartyMascot3D';

interface RobotCodingAdventureGameProps {
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
export type CommandDir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface GridCoord {
  x: number;
  y: number;
}

interface CodingMapSpec {
  gridSize: number;
  start: GridCoord;
  goal: GridCoord;
  goalIcon: string;
  obstacles: GridCoord[];
  crystals: GridCoord[];
  keySwitch?: GridCoord;
  laserGate?: GridCoord;
  initialCommands: CommandDir[];
  solutionHint: CommandDir[];
}

const STAGE_MAPS: Record<string, CodingMapSpec> = {
  direction_master: {
    gridSize: 4,
    start: { x: 0, y: 1 },
    goal: { x: 3, y: 1 },
    goalIcon: '🏁',
    obstacles: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    crystals: [],
    initialCommands: [],
    solutionHint: ['RIGHT', 'RIGHT', 'RIGHT'],
  },
  command_builder: {
    gridSize: 4,
    start: { x: 0, y: 0 },
    goal: { x: 2, y: 2 },
    goalIcon: '🏁',
    obstacles: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 3, y: 1 },
    ],
    crystals: [],
    initialCommands: [],
    solutionHint: ['RIGHT', 'RIGHT', 'DOWN', 'DOWN'],
  },
  robot_mission_path: {
    gridSize: 4,
    start: { x: 0, y: 0 },
    goal: { x: 2, y: 3 },
    goalIcon: '🏁',
    obstacles: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
    ],
    crystals: [{ x: 2, y: 1 }],
    initialCommands: [],
    solutionHint: ['RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'DOWN'],
  },
  logic_puzzle_debug: {
    gridSize: 4,
    start: { x: 0, y: 1 },
    goal: { x: 3, y: 1 },
    goalIcon: '🏁',
    obstacles: [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 0 },
    ],
    crystals: [],
    keySwitch: { x: 1, y: 0 },
    laserGate: { x: 2, y: 1 },
    // Pre-loaded buggy sequence: Step 4 goes DOWN into obstacle (1,2) instead of RIGHT, RIGHT through the unlocked gate
    initialCommands: ['UP', 'RIGHT', 'DOWN', 'DOWN', 'RIGHT'],
    solutionHint: ['UP', 'RIGHT', 'DOWN', 'RIGHT', 'RIGHT'],
  },
  final_coding_challenge: {
    gridSize: 5,
    start: { x: 0, y: 0 },
    goal: { x: 4, y: 2 },
    goalIcon: '🚀',
    obstacles: [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
    ],
    crystals: [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
    ],
    keySwitch: { x: 2, y: 2 },
    laserGate: { x: 3, y: 2 },
    initialCommands: [],
    solutionHint: ['RIGHT', 'RIGHT', 'DOWN', 'DOWN', 'RIGHT', 'RIGHT'],
  },
};

const COMMAND_META: Record<
  CommandDir,
  { ar: string; en: string; symbol: string; bg: string }
> = {
  RIGHT: {
    ar: 'تحرك يميناً',
    en: 'Move Right',
    symbol: '➡️',
    bg: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
  LEFT: {
    ar: 'تحرك يساراً',
    en: 'Move Left',
    symbol: '⬅️',
    bg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  UP: {
    ar: 'تحرك للأعلى',
    en: 'Move Up',
    symbol: '⬆️',
    bg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  DOWN: {
    ar: 'تحرك للأسفل',
    en: 'Move Down',
    symbol: '⬇️',
    bg: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
  },
};

function sameCell(a: GridCoord, b?: GridCoord): boolean {
  return Boolean(b && a.x === b.x && a.y === b.y);
}

export const RobotCodingAdventureGame: React.FC<RobotCodingAdventureGameProps> = ({
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
  const [muted, setMuted] = useState<boolean>(getAudioMuted());

  const currentStage: AgeGameStageConfig = enabledStages[activeStageIdx] || enabledStages[0];
  const currentMap: CodingMapSpec =
    STAGE_MAPS[currentStage?.mechanicKey] || STAGE_MAPS.direction_master;
  const maxUnlockedStageNum =
    childProfile.unlockedStageByGame?.creators_robot_coding ?? 1;

  // Simulation & Queue State
  const [commands, setCommands] = useState<CommandDir[]>(currentMap.initialCommands);
  const [robotPos, setRobotPos] = useState<GridCoord>(currentMap.start);
  const [collectedCrystals, setCollectedCrystals] = useState<string[]>([]);
  const [gateUnlocked, setGateUnlocked] = useState<boolean>(!currentMap.laserGate);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);
  const [failedStepIdx, setFailedStepIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ ar: string; en: string } | null>(null);

  // Metrics
  const [attempts, setAttempts] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [xpJustEarned, setXpJustEarned] = useState<number>(0);
  const [alreadyCompletedBefore, setAlreadyCompletedBefore] = useState<boolean>(false);

  const runAbortRef = useRef<number>(0);

  const initStageWorkspace = (stage: AgeGameStageConfig, preserveCommands = false) => {
    runAbortRef.current += 1;
    const spec = STAGE_MAPS[stage.mechanicKey] || STAGE_MAPS.direction_master;
    if (!preserveCommands) {
      setCommands([...spec.initialCommands]);
    }
    setRobotPos({ ...spec.start });
    setCollectedCrystals([]);
    setGateUnlocked(!spec.laserGate);
    setIsRunning(false);
    setActiveStepIdx(null);
    setFailedStepIdx(null);
    setFeedback(stage.instruction);
  };

  const handleStartStage = (idx: number) => {
    const target = enabledStages[idx];
    if (!target) return;
    setActiveStageIdx(idx);
    setAttempts(0);
    setMistakes(0);
    setShellState('PLAYING');
    initStageWorkspace(target, false);
    speakInstruction(target.audioPrompt[language], language);
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
  };

  // Command Queue Operations: Add, Delete, Reorder
  const handleAddCommand = (dir: CommandDir) => {
    if (isRunning || commands.length >= 10) return;
    playPickupSfx();
    setFailedStepIdx(null);
    setCommands((prev) => [...prev, dir]);
  };

  const handleDeleteCommand = (idx: number) => {
    if (isRunning) return;
    playPickupSfx();
    setFailedStepIdx(null);
    setCommands((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveCommand = (idx: number, delta: -1 | 1) => {
    if (isRunning) return;
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= commands.length) return;
    playPickupSfx();
    setFailedStepIdx(null);
    setCommands((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleResetRobotOnly = () => {
    initStageWorkspace(currentStage, true);
  };

  const handleClearAllCommands = () => {
    if (isRunning) return;
    setCommands([]);
    initStageWorkspace(currentStage, true);
  };

  // Execute Program Step-by-Step
  const handleRunProgram = async () => {
    if (isRunning || commands.length === 0) return;
    const runId = ++runAbortRef.current;
    setIsRunning(true);
    setFailedStepIdx(null);
    setActiveStepIdx(null);
    setAttempts((a) => a + 1);

    let pos: GridCoord = { ...currentMap.start };
    let unlocked = !currentMap.laserGate;
    const crystalsSet = new Set<string>();

    setRobotPos(pos);
    setGateUnlocked(unlocked);
    setCollectedCrystals([]);

    for (let i = 0; i < commands.length; i++) {
      if (runAbortRef.current !== runId) return;
      setActiveStepIdx(i);
      await new Promise((r) => setTimeout(r, 380));
      if (runAbortRef.current !== runId) return;

      const cmd = commands[i];
      const nextPos: GridCoord = { ...pos };
      if (cmd === 'RIGHT') nextPos.x += 1;
      if (cmd === 'LEFT') nextPos.x -= 1;
      if (cmd === 'UP') nextPos.y -= 1;
      if (cmd === 'DOWN') nextPos.y += 1;

      // 1. Check grid bounds
      if (
        nextPos.x < 0 ||
        nextPos.x >= currentMap.gridSize ||
        nextPos.y < 0 ||
        nextPos.y >= currentMap.gridSize
      ) {
        playRetrySfx();
        setMistakes((m) => m + 1);
        setFailedStepIdx(i);
        setIsRunning(false);
        const msg = {
          ar: `خطأ في الخطوة رقم ${i + 1}: حاول الروبوت الخروج خارج حدود الشبكة! عدّل هذه الخطوة أو احذفها.`,
          en: `Bug at Step #${i + 1}: The robot tried to move outside the grid! Edit or delete this step.`,
        };
        setFeedback(msg);
        speakInstruction(msg[language], language);
        return;
      }

      // 2. Check obstacle collision
      if (currentMap.obstacles.some((obs) => sameCell(nextPos, obs))) {
        playRetrySfx();
        setMistakes((m) => m + 1);
        setFailedStepIdx(i);
        setIsRunning(false);
        const msg = {
          ar: `اصطدام في الخطوة رقم ${i + 1}: يوجد حاجز أحمر (🚧) في هذا المربع! غيّر اتجاه أو ترتيب هذه الخطوة.`,
          en: `Collision at Step #${i + 1}: There is a red barrier (🚧) on that tile! Change or reorder this command.`,
        };
        setFeedback(msg);
        speakInstruction(msg[language], language);
        return;
      }

      // 3. Check locked laser gate
      if (currentMap.laserGate && sameCell(nextPos, currentMap.laserGate) && !unlocked) {
        playRetrySfx();
        setMistakes((m) => m + 1);
        setFailedStepIdx(i);
        setIsRunning(false);
        const msg = {
          ar: `البوابة الليزرية مغلقة في الخطوة رقم ${i + 1}! يجب أن يمر الروبوت فوق المفتاح الذهبي (🔑) أولاً لفتح البوابة.`,
          en: `Laser Gate locked at Step #${i + 1}! Guide the robot onto the Golden Key (🔑) first to unlock the gate.`,
        };
        setFeedback(msg);
        speakInstruction(msg[language], language);
        return;
      }

      // Valid move!
      pos = nextPos;
      setRobotPos(pos);
      playPickupSfx();

      // Check key switch activation
      if (currentMap.keySwitch && sameCell(pos, currentMap.keySwitch) && !unlocked) {
        unlocked = true;
        setGateUnlocked(true);
        playSnapSfx();
      }

      // Check crystal pickup
      if (currentMap.crystals.some((c) => sameCell(pos, c))) {
        crystalsSet.add(`${pos.x},${pos.y}`);
        setCollectedCrystals(Array.from(crystalsSet));
        playSnapSfx();
      }
    }

    await new Promise((r) => setTimeout(r, 250));
    if (runAbortRef.current !== runId) return;
    setIsRunning(false);
    setActiveStepIdx(null);

    // Check Goal & Objectives
    const reachedGoal = sameCell(pos, currentMap.goal);
    const collectedAllCrystals = crystalsSet.size >= currentMap.crystals.length;

    if (reachedGoal && collectedAllCrystals) {
      playSuccessFanfareSfx();
      const totalTries = Math.max(1, attempts);
      const acc = Math.max(45, Math.round(((totalTries - mistakes) / totalTries) * 100));
      const wasDone = childProfile.completedStageIds.includes(currentStage.id);
      setAlreadyCompletedBefore(wasDone);
      setXpJustEarned(wasDone ? 0 : currentStage.xpReward);

      const assessment: StageAssessmentResult = {
        stageId: currentStage.id,
        gameId: 'creators_robot_coding',
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
    } else if (reachedGoal && !collectedAllCrystals) {
      playRetrySfx();
      setMistakes((m) => m + 1);
      const msg = {
        ar: 'وصل الروبوت إلى النهاية لكنه لم يجمع كل جواهر الطاقة (💎)! عدّل مسارك ليمر فوق الجواهر أولاً.',
        en: 'The robot reached the goal but missed an energy crystal (💎)! Route through all crystals first.',
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setFailedStepIdx(commands.length - 1);
      const msg = {
        ar: 'انتهت الأوامر قبل أن يصل الروبوت إلى الهدف! أضف المزيد من الأوامر أو عدّل ترتيبها.',
        en: 'Program finished before the robot reached the goal! Add more commands or adjust their order.',
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    }
  };

  // 1. TITLE MENU
  if (shellState === 'TITLE_MENU') {
    return (
      <div
        data-testid="creators-game-shell"
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-slate-800 max-w-6xl mx-auto my-6 overflow-hidden"
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{childProfile.avatarEmoji}</span>
            <div>
              <div className="text-xs text-emerald-300 font-bold">
                {gameConfig.pathwayTitle[language]} · {childProfile.name[language]}
              </div>
              <h2 className="text-lg font-black text-white">{gameConfig.gameTitle[language]}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              data-testid="creators-xp-display"
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
              data-testid="creators-exit-btn"
              onClick={onExit}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              {isAr ? 'خروج للخريطة' : 'Exit to Hub'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 items-center">
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-emerald-200 dark:border-slate-800 shadow-lg bg-emerald-50 min-h-[280px]">
            <img
              src={gameConfig.heroImage}
              alt={gameConfig.gameTitle[language]}
              referrerPolicy="no-referrer"
              className="w-full h-72 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-300 mb-1 block">
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
                {isAr ? 'مراحل برمجة الروبوت الخمس' : '5 Robot Coding Stages'}
              </h3>
              <span className="text-xs font-bold text-slate-500 tabular-nums">
                {childProfile.completedStageIds.filter((id) => id.startsWith('cre-')).length} / {enabledStages.length}
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
                    data-testid={`creators-stage-card-${stg.stageNumber}`}
                    onClick={() => isUnlocked && handleStartStage(idx)}
                    className={`w-full text-start p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400'
                        : isUnlocked
                        ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 hover:border-red-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isUnlocked
                            ? 'bg-emerald-600 text-white'
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
                        <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                          {isAr ? 'ابدأ' : 'Code'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              data-testid="creators-start-primary-btn"
              onClick={() => {
                const nextIdx = enabledStages.findIndex(
                  (s) => !childProfile.completedStageIds.includes(s.id)
                );
                handleStartStage(nextIdx >= 0 ? nextIdx : 0);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isAr ? 'ابدأ مغامرة برمجة الروبوت الآن!' : 'Start Robot Coding Adventure Now!'}</span>
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
        data-testid="creators-victory-modal"
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
              ? 'أحسنت في إعادة برمجة المهمة! (تم احتساب نقاط XP مسبقاً).'
              : 'Great replay! (XP for this stage was already awarded).'
            : isAr
            ? `رائع! حصلت على +${xpJustEarned} XP وتم فتح المرحلة البرمجية التالية!`
            : `Awesome! You earned +${xpJustEarned} XP and unlocked the next coding stage!`}
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              setShellState('PLAYING');
              initStageWorkspace(currentStage, false);
            }}
            className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة المرحلة' : 'Replay Stage'}</span>
          </button>

          {hasNextStage ? (
            <button
              type="button"
              data-testid="creators-next-stage-btn"
              onClick={() => handleStartStage(activeStageIdx + 1)}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg flex items-center gap-2"
            >
              <span>{isAr ? 'المرحلة التالية' : 'Next Stage'}</span>
              {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          ) : (
            <button
              type="button"
              data-testid="creators-finish-game-btn"
              onClick={() => setShellState('TITLE_MENU')}
              className="px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-lg flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              <span>{isAr ? 'العودة لخريطة البرمجة' : 'Back to Coding Map'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. ACTIVE PLAYING IDE & GRID SIMULATOR
  return (
    <div
      data-testid="creators-playing-screen"
      data-stage-number={currentStage.stageNumber}
      data-mechanic={currentStage.mechanicKey}
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-slate-800 max-w-6xl mx-auto my-6 overflow-hidden"
    >
      {/* Top Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShellState('TITLE_MENU')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            {isAr ? '← المراحل' : '← Stages'}
          </button>
          <div>
            <div className="text-xs text-emerald-300 font-bold">
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
                data-testid={`creators-stepper-${stg.stageNumber}`}
                onClick={() => unlocked && handleStartStage(idx)}
                className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                  active
                    ? 'bg-emerald-500 text-white ring-2 ring-white'
                    : done
                    ? 'bg-emerald-700 text-white'
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
            data-testid="creators-xp-counter"
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
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'استماع' : 'Listen'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
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

      {/* Engineer Smarty Instruction & Diagnostic Banner */}
      <div
        className={`px-6 py-4 border-b flex items-center gap-4 ${
          failedStepIdx !== null
            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800'
            : 'bg-emerald-50/60 dark:bg-slate-800/60 border-emerald-200 dark:border-slate-800'
        }`}
      >
        <div
          className={`w-24 h-24 rounded-3xl flex items-center justify-center shrink-0 p-1 shadow-md border-2 ${
            failedStepIdx !== null
              ? 'bg-amber-100 dark:bg-amber-950 border-amber-400'
              : 'bg-white dark:bg-slate-900 border-emerald-400'
          }`}
        >
          <SmartyMascot3D
            action={
              failedStepIdx !== null
                ? 'encouraging'
                : isRunning
                ? 'pointing'
                : currentStage.stageNumber >= 4
                ? 'thinking'
                : 'greeting'
            }
            size="lg"
            lang={language}
          />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {gameConfig.mascotName[language]} — {currentStage.objective[language]}
          </div>
          <p
            data-testid="creators-feedback-text"
            className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5"
          >
            {feedback ? feedback[language] : currentStage.instruction[language]}
          </p>
        </div>
      </div>

      {/* Main Split: Grid World + Visual Command IDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 items-start">
        {/* Left: Interactive Grid World */}
        <div className="lg:col-span-6 flex flex-col items-center bg-slate-900 p-6 rounded-3xl border-4 border-emerald-500/30">
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-300 mb-4">
            <span>
              {isAr ? 'خريطة المهمة البرمجية' : 'Robotics Mission Grid'} ({currentMap.gridSize}×{currentMap.gridSize})
            </span>
            {currentMap.crystals.length > 0 && (
              <span className="text-sky-300 tabular-nums">
                💎 {collectedCrystals.length} / {currentMap.crystals.length}
              </span>
            )}
            {currentMap.laserGate && (
              <span className={gateUnlocked ? 'text-emerald-400' : 'text-amber-400'}>
                {gateUnlocked
                  ? isAr
                    ? '🔓 البوابة مفتوحة'
                    : '🔓 Gate Unlocked'
                  : isAr
                  ? '🔒 البوابة مغلقة (تحتاج 🔑)'
                  : '🔒 Gate Locked (Needs 🔑)'}
              </span>
            )}
          </div>

          <div
            dir="ltr"
            data-testid="coding-grid-board"
            className="grid gap-2 w-full max-w-[360px] aspect-square bg-slate-950 p-3 rounded-2xl border-2 border-slate-800"
            style={{
              gridTemplateColumns: `repeat(${currentMap.gridSize}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: currentMap.gridSize * currentMap.gridSize }).map((_, idx) => {
              const x = idx % currentMap.gridSize;
              const y = Math.floor(idx / currentMap.gridSize);
              const cell: GridCoord = { x, y };

              const isRobot = sameCell(cell, robotPos);
              const isGoal = sameCell(cell, currentMap.goal);
              const isObstacle = currentMap.obstacles.some((o) => sameCell(cell, o));
              const isKey = sameCell(cell, currentMap.keySwitch);
              const isGate = sameCell(cell, currentMap.laserGate);
              const isCrystal =
                currentMap.crystals.some((c) => sameCell(cell, c)) &&
                !collectedCrystals.includes(`${x},${y}`);

              return (
                <div
                  key={`${x}-${y}`}
                  data-grid-cell={`${x},${y}`}
                  className={`relative rounded-xl border-2 flex items-center justify-center text-2xl sm:text-3xl select-none transition-all duration-200 ${
                    isRobot
                      ? 'bg-emerald-500 border-white shadow-lg shadow-emerald-500/40 scale-105 z-10'
                      : isObstacle
                      ? 'bg-red-950/80 border-red-500/60'
                      : isGate && !gateUnlocked
                      ? 'bg-amber-950/80 border-amber-500'
                      : isGoal
                      ? 'bg-indigo-950/90 border-indigo-400 animate-pulse'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {isRobot && (
                    <span data-testid="robot-avatar" className="w-full h-full flex items-center justify-center p-0.5">
                      <SmartyMascot3D
                        action={isRunning ? 'pointing' : 'greeting'}
                        size="sm"
                        showBadge={false}
                        lang={language}
                      />
                    </span>
                  )}
                  {!isRobot && isObstacle && <span title="Obstacle">🚧</span>}
                  {!isRobot && isKey && (
                    <span className={gateUnlocked ? 'opacity-30' : 'animate-bounce'}>🔑</span>
                  )}
                  {!isRobot && isGate && <span>{gateUnlocked ? '🟢' : '🚪'}</span>}
                  {!isRobot && isCrystal && <span className="animate-pulse">💎</span>}
                  {!isRobot && isGoal && <span>{currentMap.goalIcon}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Visual Command Builder & Sequence Queue */}
        <div className="lg:col-span-6 space-y-5">
          {/* Direction Command Palette */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-3">
              {isAr ? '1. أضف أوامر الحركة إلى البرنامج:' : '1. Add Movement Commands to Program:'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['RIGHT', 'LEFT', 'UP', 'DOWN'] as CommandDir[]).map((dir) => {
                const meta = COMMAND_META[dir];
                return (
                  <button
                    key={dir}
                    type="button"
                    disabled={isRunning || commands.length >= 10}
                    data-testid={`add-cmd-${dir}`}
                    onClick={() => handleAddCommand(dir)}
                    className={`p-3.5 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 disabled:opacity-40 cursor-pointer ${meta.bg}`}
                  >
                    <span className="text-2xl">{meta.symbol}</span>
                    <span>{isAr ? meta.ar : meta.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordered Command Queue with Reorder (↑ ↓) and Delete (✕) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-slate-600 dark:text-slate-300">
                {isAr
                  ? `2. تسلسل البرنامج (${commands.length}/10 أوامر) — يمكنك الترتيب أو الحذف:`
                  : `2. Program Sequence (${commands.length}/10 steps) — Reorder or Delete:`}
              </h4>
              <button
                type="button"
                disabled={isRunning || commands.length === 0}
                data-testid="clear-all-cmds-btn"
                onClick={handleClearAllCommands}
                className="text-xs font-bold text-red-600 hover:underline disabled:opacity-40 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'مسح الكل' : 'Clear All'}</span>
              </button>
            </div>

            <div
              data-testid="command-queue-list"
              className="space-y-2 min-h-[170px] max-h-[260px] overflow-y-auto pr-1"
            >
              {commands.length === 0 ? (
                <div className="h-36 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                  {isAr
                    ? 'قائمة البرنامج فارغة — اضغط على أزرار الاتجاهات بالأعلى لإضافة الأوامر!'
                    : 'Program queue is empty — tap direction buttons above to add commands!'}
                </div>
              ) : (
                commands.map((cmd, idx) => {
                  const meta = COMMAND_META[cmd];
                  const isCurrentStep = activeStepIdx === idx;
                  const isBugStep = failedStepIdx === idx;

                  return (
                    <div
                      key={`${idx}-${cmd}`}
                      data-testid={`cmd-step-${idx}`}
                      data-cmd-dir={cmd}
                      className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                        isBugStep
                          ? 'bg-red-50 dark:bg-red-950/60 border-red-500 ring-2 ring-red-400'
                          : isCurrentStep
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 scale-[1.01]'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="text-xl">{meta.symbol}</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white">
                          {isAr ? meta.ar : meta.en}
                        </span>
                        {isBugStep && (
                          <span className="text-[11px] font-black text-red-600 dark:text-red-400">
                            {isAr ? '⚠️ خطأ هنا!' : '⚠️ Bug here!'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isRunning || idx === 0}
                          data-testid={`move-up-${idx}`}
                          onClick={() => handleMoveCommand(idx, -1)}
                          title={isAr ? 'تحريك للأعلى' : 'Move Up'}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 text-slate-700 dark:text-slate-200"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isRunning || idx === commands.length - 1}
                          data-testid={`move-down-${idx}`}
                          onClick={() => handleMoveCommand(idx, 1)}
                          title={isAr ? 'تحريك للأسفل' : 'Move Down'}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-30 text-slate-700 dark:text-slate-200"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isRunning}
                          data-testid={`delete-cmd-${idx}`}
                          onClick={() => handleDeleteCommand(idx)}
                          title={isAr ? 'حذف الأمر' : 'Delete Command'}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Execution Controls */}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isRunning || commands.length === 0}
              data-testid="run-program-btn"
              onClick={handleRunProgram}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isAr ? 'تشغيل البرنامج (Run)' : 'Run Program'}</span>
            </button>
            <button
              type="button"
              disabled={isRunning}
              data-testid="reset-robot-btn"
              onClick={handleResetRobotOnly}
              className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold py-4 px-5 rounded-2xl flex items-center gap-2 text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? 'إعادة الروبوت' : 'Reset Position'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
