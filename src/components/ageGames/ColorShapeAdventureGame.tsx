import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Play,
  Award,
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

interface ColorShapeAdventureGameProps {
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

type GameShellState = 'TITLE_MENU' | 'PLAYING' | 'STAGE_VICTORY' | 'GAME_COMPLETE';
type MascotMood = 'idle' | 'happy' | 'hint' | 'celebrate';

interface ColorOption {
  id: string;
  name: { ar: string; en: string };
  example: { ar: string; en: string };
  hex: string;
  bgClass: string;
  borderClass: string;
}

interface ShapeItem {
  id: string;
  shapeType: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  colorHex: string;
  name: { ar: string; en: string };
  clue: { ar: string; en: string };
}

const COLOR_PALETTE: ColorOption[] = [
  {
    id: 'red',
    name: { ar: 'الأحمر', en: 'Red' },
    example: { ar: 'مثل التفاحة الجميلة', en: 'like a bright apple' },
    hex: '#EF4444',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-600',
  },
  {
    id: 'blue',
    name: { ar: 'الأزرق', en: 'Blue' },
    example: { ar: 'مثل السماء الصافية', en: 'like the clear sky' },
    hex: '#3B82F6',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-600',
  },
  {
    id: 'yellow',
    name: { ar: 'الأصفر', en: 'Yellow' },
    example: { ar: 'مثل الشمس المشرقة', en: 'like the shining sun' },
    hex: '#FACC15',
    bgClass: 'bg-amber-400',
    borderClass: 'border-amber-500',
  },
  {
    id: 'green',
    name: { ar: 'الأخضر', en: 'Green' },
    example: { ar: 'مثل أوراق الشجر', en: 'like tree leaves' },
    hex: '#22C55E',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-600',
  },
  {
    id: 'orange',
    name: { ar: 'البرتقالي', en: 'Orange' },
    example: { ar: 'مثل البرتقالة اللذيذة', en: 'like a juicy orange' },
    hex: '#F97316',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-600',
  },
  {
    id: 'purple',
    name: { ar: 'البنفسجي', en: 'Purple' },
    example: { ar: 'مثل زهرة البنفسج', en: 'like a violet flower' },
    hex: '#A855F7',
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-600',
  },
];

const SHAPE_CATALOG: ShapeItem[] = [
  {
    id: 'circle',
    shapeType: 'circle',
    colorHex: '#EF4444',
    name: { ar: 'الدائرة الحمراء', en: 'Red Circle' },
    clue: { ar: 'الدائرة المستديرة التي ليس لها زوايا!', en: 'The round Circle with no corners!' },
  },
  {
    id: 'square',
    shapeType: 'square',
    colorHex: '#3B82F6',
    name: { ar: 'المربع الأزرق', en: 'Blue Square' },
    clue: { ar: 'المربع الذي له أربعة أضلاع متساوية!', en: 'The Square with four equal sides!' },
  },
  {
    id: 'triangle',
    shapeType: 'triangle',
    colorHex: '#FACC15',
    name: { ar: 'المثلث الأصفر', en: 'Yellow Triangle' },
    clue: { ar: 'المثلث الذي له ثلاث زوايا مثل الجبل!', en: 'The Triangle with three sharp corners!' },
  },
  {
    id: 'star',
    shapeType: 'star',
    colorHex: '#F59E0B',
    name: { ar: 'النجمة الذهبية', en: 'Golden Star' },
    clue: { ar: 'النجمة المضيئة التي تلمع في السماء!', en: 'The shining Star that sparkles in the sky!' },
  },
  {
    id: 'heart',
    shapeType: 'heart',
    colorHex: '#EC4899',
    name: { ar: 'القلب الوردي', en: 'Pink Heart' },
    clue: { ar: 'شكل القلب الجميل!', en: 'The lovely Heart shape!' },
  },
];

interface CityPart {
  id: string;
  shapeType: 'circle' | 'square' | 'triangle' | 'star';
  colorHex: string;
  label: { ar: string; en: string };
  slotLabel: { ar: string; en: string };
}

const CITY_PARTS: CityPart[] = [
  {
    id: 'city-sun',
    shapeType: 'circle',
    colorHex: '#FACC15',
    label: { ar: 'شمس دائرية صفراء', en: 'Yellow Circle Sun' },
    slotLabel: { ar: 'مكان الشمس في السماء', en: 'Sun in the Sky' },
  },
  {
    id: 'city-roof',
    shapeType: 'triangle',
    colorHex: '#EF4444',
    label: { ar: 'سقف مثلث أحمر', en: 'Red Triangle Roof' },
    slotLabel: { ar: 'سقف المنزل المثلث', en: 'House Roof' },
  },
  {
    id: 'city-house',
    shapeType: 'square',
    colorHex: '#3B82F6',
    label: { ar: 'واجهة بيت مربعة زرقاء', en: 'Blue Square House' },
    slotLabel: { ar: 'جسم المنزل المربع', en: 'House Body' },
  },
  {
    id: 'city-tree',
    shapeType: 'circle',
    colorHex: '#22C55E',
    label: { ar: 'شجرة دائرية خضراء', en: 'Green Circle Tree' },
    slotLabel: { ar: 'تاج الشجرة الأخضر', en: 'Tree Crown' },
  },
  {
    id: 'city-star',
    shapeType: 'star',
    colorHex: '#F59E0B',
    label: { ar: 'نجمة البرج الذهبية', en: 'Golden Tower Star' },
    slotLabel: { ar: 'قمة البرج المضيئة', en: 'Tower Top Star' },
  },
];

export const ShapeSvg: React.FC<{
  shapeType: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  colorHex: string;
  outlineOnly?: boolean;
  className?: string;
}> = ({ shapeType, colorHex, outlineOnly = false, className = 'w-16 h-16' }) => {
  const fill = outlineOnly ? 'none' : colorHex;
  const stroke = outlineOnly ? '#64748B' : '#FFFFFF';
  const strokeDasharray = outlineOnly ? '6 4' : undefined;

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {shapeType === 'circle' && (
        <circle
          cx="50"
          cy="50"
          r="38"
          fill={fill}
          stroke={stroke}
          strokeWidth="5"
          strokeDasharray={strokeDasharray}
        />
      )}
      {shapeType === 'square' && (
        <rect
          x="16"
          y="16"
          width="68"
          height="68"
          rx="12"
          fill={fill}
          stroke={stroke}
          strokeWidth="5"
          strokeDasharray={strokeDasharray}
        />
      )}
      {shapeType === 'triangle' && (
        <polygon
          points="50,12 88,84 12,84"
          fill={fill}
          stroke={stroke}
          strokeWidth="5"
          strokeLinejoin="round"
          strokeDasharray={strokeDasharray}
        />
      )}
      {shapeType === 'star' && (
        <polygon
          points="50,10 61,36 89,38 67,56 74,84 50,68 26,84 33,56 11,38 39,36"
          fill={fill}
          stroke={stroke}
          strokeWidth="5"
          strokeLinejoin="round"
          strokeDasharray={strokeDasharray}
        />
      )}
      {shapeType === 'heart' && (
        <path
          d="M50 84 C50 84 14 60 14 34 C14 20 26 12 38 16 C45 18 50 26 50 26 C50 26 55 18 62 16 C74 12 86 20 86 34 C86 60 50 84 50 84 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="5"
          strokeLinejoin="round"
          strokeDasharray={strokeDasharray}
        />
      )}
    </svg>
  );
};

export const ColorShapeAdventureGame: React.FC<ColorShapeAdventureGameProps> = ({
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

  // Stage metrics
  const [attempts, setAttempts] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [xpJustEarned, setXpJustEarned] = useState<number>(0);
  const [alreadyCompletedBefore, setAlreadyCompletedBefore] = useState<boolean>(false);

  // Stage 1 (Discover Colors) & Stage 2 (Identify Shapes) round index
  const [roundIdx, setRoundIdx] = useState<number>(0);

  // Stage 3 (Match Twin Shape), Stage 4 (Collect Similar Shapes), Stage 5 (Shape City) state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [matchedTwins, setMatchedTwins] = useState<Record<string, string>>({});
  const [sortedBaskets, setSortedBaskets] = useState<Record<string, string[]>>({
    circle: [],
    square: [],
    star: [],
  });
  const [cityPlacements, setCityPlacements] = useState<Record<string, string>>({});

  const currentStage: AgeGameStageConfig = enabledStages[activeStageIdx] || enabledStages[0];
  const maxUnlockedStageNum =
    childProfile.unlockedStageByGame?.explorers_color_shape ?? 1;

  // Items for Stage 4 sorting
  const sortingItems = useMemo(() => {
    const count = Math.max(3, Math.min(6, currentStage?.challengesCount || 4));
    const base = [
      { id: 'sort-c1', shapeType: 'circle' as const, colorHex: '#EF4444', label: { ar: 'دائرة حمراء', en: 'Red Circle' } },
      { id: 'sort-s1', shapeType: 'square' as const, colorHex: '#3B82F6', label: { ar: 'مربع أزرق', en: 'Blue Square' } },
      { id: 'sort-st1', shapeType: 'star' as const, colorHex: '#FACC15', label: { ar: 'نجمة صفراء', en: 'Yellow Star' } },
      { id: 'sort-c2', shapeType: 'circle' as const, colorHex: '#22C55E', label: { ar: 'دائرة خضراء', en: 'Green Circle' } },
      { id: 'sort-s2', shapeType: 'square' as const, colorHex: '#F97316', label: { ar: 'مربع برتقالي', en: 'Orange Square' } },
      { id: 'sort-st2', shapeType: 'star' as const, colorHex: '#A855F7', label: { ar: 'نجمة بنفسجية', en: 'Purple Star' } },
    ];
    return base.slice(0, count);
  }, [currentStage]);

  // Reset stage state when switching stages
  const initStageState = (stage: AgeGameStageConfig) => {
    setRoundIdx(0);
    setAttempts(0);
    setMistakes(0);
    setSelectedItemId(null);
    setMatchedTwins({});
    setSortedBaskets({ circle: [], square: [], star: [] });
    setCityPlacements({});
    setMascotMood('idle');
    setFeedback({
      ar: stage.instruction.ar,
      en: stage.instruction.en,
    });
    speakInstruction(stage.audioPrompt[language], language);
  };

  const handleStartStage = (idx: number) => {
    const targetStage = enabledStages[idx];
    if (!targetStage) return;
    setActiveStageIdx(idx);
    setShellState('PLAYING');
    initStageState(targetStage);
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
  };

  const triggerStageWin = () => {
    playSuccessFanfareSfx();
    setMascotMood('celebrate');
    const totalTries = Math.max(1, attempts + 1);
    const acc = Math.max(40, Math.round(((totalTries - mistakes) / totalTries) * 100));
    const wasDone = childProfile.completedStageIds.includes(currentStage.id);
    setAlreadyCompletedBefore(wasDone);
    setXpJustEarned(wasDone ? 0 : currentStage.xpReward);

    const assessment: StageAssessmentResult = {
      stageId: currentStage.id,
      gameId: 'explorers_color_shape',
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

  // Stage 1: Discover Colors Handler
  const totalColorRounds = Math.max(2, Math.min(6, currentStage?.challengesCount || 3));
  const targetColor = COLOR_PALETTE[roundIdx % COLOR_PALETTE.length];
  const colorChoices = useMemo(() => {
    const count = currentStage?.difficulty === 'hard' ? 6 : currentStage?.difficulty === 'medium' ? 4 : 3;
    const pool = COLOR_PALETTE.slice(0, Math.max(count, (roundIdx % COLOR_PALETTE.length) + 1));
    if (!pool.some((c) => c.id === targetColor.id)) {
      pool[0] = targetColor;
    }
    return pool;
  }, [roundIdx, currentStage?.difficulty, targetColor]);

  const handleColorPick = (picked: ColorOption) => {
    setAttempts((a) => a + 1);
    if (picked.id === targetColor.id) {
      playSnapSfx();
      setMascotMood('happy');
      if (roundIdx + 1 >= totalColorRounds) {
        triggerStageWin();
      } else {
        const nextRound = roundIdx + 1;
        setRoundIdx(nextRound);
        const nextColor = COLOR_PALETTE[nextRound % COLOR_PALETTE.length];
        const msg = {
          ar: `أحسنت! هذا هو اللون ${picked.name.ar}. الآن ابحث عن اللون ${nextColor.name.ar}!`,
          en: `Great job! That is ${picked.name.en}. Now find ${nextColor.name.en}!`,
        };
        setFeedback(msg);
        speakInstruction(msg[language], language);
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const retryMsg = {
        ar: `هذا هو اللون ${picked.name.ar}. نحن نبحث عن اللون ${targetColor.name.ar} (${targetColor.example.ar})!`,
        en: `That is ${picked.name.en}. Let us look for ${targetColor.name.en} (${targetColor.example.en})!`,
      };
      setFeedback(retryMsg);
      speakInstruction(retryMsg[language], language);
    }
  };

  // Stage 2: Identify Shapes Handler
  const totalShapeRounds = Math.max(2, Math.min(5, currentStage?.challengesCount || 3));
  const targetShape = SHAPE_CATALOG[roundIdx % SHAPE_CATALOG.length];
  const shapeChoices = useMemo(() => {
    const count = currentStage?.difficulty === 'hard' ? 5 : 3;
    const subset = SHAPE_CATALOG.slice(0, count);
    if (!subset.some((s) => s.id === targetShape.id)) {
      subset[0] = targetShape;
    }
    return subset;
  }, [roundIdx, currentStage?.difficulty, targetShape]);

  const handleShapePick = (picked: ShapeItem) => {
    setAttempts((a) => a + 1);
    if (picked.id === targetShape.id) {
      playSnapSfx();
      setMascotMood('happy');
      if (roundIdx + 1 >= totalShapeRounds) {
        triggerStageWin();
      } else {
        const nextRound = roundIdx + 1;
        setRoundIdx(nextRound);
        const nextShape = SHAPE_CATALOG[nextRound % SHAPE_CATALOG.length];
        const msg = {
          ar: `رائع! اخترت ${picked.name.ar}. الآن ابحث عن ${nextShape.name.ar}!`,
          en: `Awesome! You found the ${picked.name.en}. Now tap the ${nextShape.name.en}!`,
        };
        setFeedback(msg);
        speakInstruction(msg[language], language);
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const retryMsg = {
        ar: `هذا ${picked.name.ar}. تلميح بيبو: نحن نريد ${targetShape.clue.ar}`,
        en: `That is ${picked.name.en}. Bibo's hint: Find ${targetShape.clue.en}`,
      };
      setFeedback(retryMsg);
      speakInstruction(retryMsg[language], language);
    }
  };

  // Stage 3: Match Twin Shape Handler (Supports both Drag-and-Drop and Tap-to-Match)
  const twinShapes = useMemo(() => {
    const count = Math.max(3, Math.min(5, currentStage?.challengesCount || 3));
    return SHAPE_CATALOG.slice(0, count);
  }, [currentStage]);

  const handleTwinPlacement = (shapeId: string, targetSlotId: string) => {
    setAttempts((a) => a + 1);
    if (shapeId === targetSlotId) {
      playSnapSfx();
      setMascotMood('happy');
      const updated = { ...matchedTwins, [targetSlotId]: shapeId };
      setMatchedTwins(updated);
      setSelectedItemId(null);
      if (Object.keys(updated).length >= twinShapes.length) {
        triggerStageWin();
      } else {
        setFeedback({
          ar: 'تطابق ممتاز! أكمل باقي الأشكال التوأم.',
          en: 'Perfect twin match! Match the remaining shapes.',
        });
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const retryMsg = {
        ar: 'انظر جيداً لشكل الإطار ولونه، وجرب وضعه فوق توأمه المشابه له تماماً!',
        en: 'Look closely at the outline shape and place it over its identical twin!',
      };
      setFeedback(retryMsg);
      speakInstruction(retryMsg[language], language);
    }
  };

  // Stage 4: Collect Similar Shapes Handler
  const placedSortIds = useMemo(() => {
    return new Set([
      ...sortedBaskets.circle,
      ...sortedBaskets.square,
      ...sortedBaskets.star,
    ]);
  }, [sortedBaskets]);

  const handleSortIntoBasket = (itemId: string, basketType: 'circle' | 'square' | 'star') => {
    const item = sortingItems.find((i) => i.id === itemId);
    if (!item) return;
    setAttempts((a) => a + 1);
    if (item.shapeType === basketType) {
      playSnapSfx();
      setMascotMood('happy');
      const nextBaskets = {
        ...sortedBaskets,
        [basketType]: [...sortedBaskets[basketType], item.id],
      };
      setSortedBaskets(nextBaskets);
      setSelectedItemId(null);
      const totalSorted =
        nextBaskets.circle.length + nextBaskets.square.length + nextBaskets.star.length;
      if (totalSorted >= sortingItems.length) {
        triggerStageWin();
      } else {
        setFeedback({
          ar: `أحسنت! وضعت ${item.label.ar} في السلة الصحيحة!`,
          en: `Well done! Placed ${item.label.en} in the right basket!`,
        });
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const msg = {
        ar: `انتبه يا بطل! "${item.label.ar}" يوضع في سلة ${
          item.shapeType === 'circle' ? 'الدوائر' : item.shapeType === 'square' ? 'المربعات' : 'النجوم'
        }!`,
        en: `Oops! "${item.label.en}" belongs in the ${item.shapeType} basket!`,
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    }
  };

  // Stage 5: Colorful Shape City Handler
  const handleCityPartPlace = (partId: string, slotId: string) => {
    setAttempts((a) => a + 1);
    if (partId === slotId) {
      playSnapSfx();
      setMascotMood('happy');
      const nextCity = { ...cityPlacements, [slotId]: partId };
      setCityPlacements(nextCity);
      setSelectedItemId(null);
      if (Object.keys(nextCity).length >= CITY_PARTS.length) {
        triggerStageWin();
      } else {
        const part = CITY_PARTS.find((p) => p.id === partId);
        setFeedback({
          ar: `رائع! تم تركيب "${part?.label.ar}" في مدينة الأشكال!`,
          en: `Awesome! Placed "${part?.label.en}" in Shape City!`,
        });
      }
    } else {
      playRetrySfx();
      setMistakes((m) => m + 1);
      setMascotMood('hint');
      const targetPart = CITY_PARTS.find((p) => p.id === slotId);
      const msg = {
        ar: `هذا المكان مخصص لـ "${targetPart?.label.ar}". جرب المكان المناسب!`,
        en: `This spot is for "${targetPart?.label.en}". Try the matching spot!`,
      };
      setFeedback(msg);
      speakInstruction(msg[language], language);
    }
  };

  // Render Official 3D SmartTech Robot Mascot with all 6 expression states
  const renderBiboMascot = () => {
    const resolvedAction: SmartyAction =
      mascotMood === 'celebrate'
        ? 'celebrating'
        : mascotMood === 'happy'
        ? 'celebrating'
        : mascotMood === 'hint'
        ? mistakes > 0
          ? 'encouraging'
          : 'thinking'
        : currentStage.stageNumber === 5
        ? 'pointing'
        : 'greeting';

    return (
      <div
        data-testid="bibo-mascot"
        data-mascot-mood={mascotMood}
        className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 shrink-0 transition-transform duration-200 p-1 ${
          mascotMood === 'celebrate' || mascotMood === 'happy'
            ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 scale-105'
            : mascotMood === 'hint'
            ? 'bg-amber-100 dark:bg-amber-950 border-amber-400'
            : 'bg-red-50 dark:bg-slate-800 border-red-200 dark:border-slate-700'
        }`}
      >
        <SmartyMascot3D action={resolvedAction} size="lg" lang={language} />
      </div>
    );
  };

  // 1. TITLE MENU SCREEN
  if (shellState === 'TITLE_MENU') {
    return (
      <div
        data-testid="explorers-game-shell"
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-slate-800 max-w-6xl mx-auto my-6 overflow-hidden"
      >
        {/* Top Perimeter Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{childProfile.avatarEmoji}</span>
            <div>
              <div className="text-xs text-amber-300 font-bold">
                {gameConfig.pathwayTitle[language]} · {childProfile.name[language]}
              </div>
              <h2 className="text-lg font-black text-white">{gameConfig.gameTitle[language]}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              data-testid="explorers-xp-display"
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
              data-testid="explorers-exit-btn"
              onClick={onExit}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              {isAr ? 'خروج للخريطة' : 'Exit to Hub'}
            </button>
          </div>
        </div>

        {/* Hero Title & Stage Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 items-center">
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-amber-200 dark:border-slate-800 shadow-lg bg-amber-50 min-h-[280px]">
            <img
              src={gameConfig.heroImage}
              alt={gameConfig.gameTitle[language]}
              referrerPolicy="no-referrer"
              className="w-full h-72 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-300 mb-1 block">
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
                {isAr ? 'مراحل المغامرة الخمس (تفتح بالتدرج)' : '5 Adventure Stages (Sequential Unlock)'}
              </h3>
              <span className="text-xs font-bold text-slate-500 tabular-nums">
                {childProfile.completedStageIds.filter((id) => id.startsWith('exp-')).length} / {enabledStages.length}
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
                    data-testid={`explorers-stage-card-${stg.stageNumber}`}
                    onClick={() => isUnlocked && handleStartStage(idx)}
                    className={`w-full text-start p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 hover:border-emerald-500'
                        : isUnlocked
                        ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700 hover:border-red-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isUnlocked
                            ? 'bg-amber-400 text-slate-900'
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
                        <span className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
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
              data-testid="explorers-start-primary-btn"
              onClick={() => {
                const nextIdx = enabledStages.findIndex(
                  (s) => !childProfile.completedStageIds.includes(s.id)
                );
                handleStartStage(nextIdx >= 0 ? nextIdx : 0);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base transition-transform active:scale-98"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isAr ? 'ابدأ مغامرة الألوان والأشكال الآن!' : 'Start Color & Shape Adventure Now!'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. STAGE VICTORY / GAME COMPLETE SCREEN
  if (shellState === 'STAGE_VICTORY' || shellState === 'GAME_COMPLETE') {
    const hasNextStage = activeStageIdx < enabledStages.length - 1;
    return (
      <div
        data-testid="explorers-victory-modal"
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
              ? 'أحسنت في إعادة المرحلة! (تم احتساب نقاط XP لهذه المرحلة مسبقاً).'
              : 'Great replay! (XP for this stage was already awarded).'
            : isAr
            ? `ممتاز! حصلت على +${xpJustEarned} XP و +${currentStage.starsReward} نجوم وتم فتح المرحلة التالية!`
            : `Awesome! You earned +${xpJustEarned} XP and +${currentStage.starsReward} stars, unlocking the next stage!`}
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 px-5 py-3 rounded-2xl">
            <div className="text-xs text-slate-500">{isAr ? 'النقاط المكتسبة' : 'XP Awarded'}</div>
            <div data-testid="victory-xp-awarded" className="text-xl font-black text-amber-600 tabular-nums">
              +{xpJustEarned} XP
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 px-5 py-3 rounded-2xl">
            <div className="text-xs text-slate-500">{isAr ? 'نسبة الدقة' : 'Accuracy'}</div>
            <div className="text-xl font-black text-emerald-600 tabular-nums">
              {Math.max(40, Math.round(((Math.max(1, attempts) - mistakes) / Math.max(1, attempts)) * 100))}%
            </div>
          </div>
        </div>

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
              data-testid="explorers-next-stage-btn"
              onClick={() => handleStartStage(activeStageIdx + 1)}
              className="px-8 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-lg flex items-center gap-2"
            >
              <span>{isAr ? 'المرحلة التالية' : 'Next Stage'}</span>
              {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          ) : (
            <button
              type="button"
              data-testid="explorers-finish-game-btn"
              onClick={() => setShellState('TITLE_MENU')}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-lg flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              <span>{isAr ? 'العودة لخريطة البطولة' : 'Back to Adventure Map'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. ACTIVE PLAYING SCREEN
  return (
    <div
      data-testid="explorers-playing-screen"
      data-stage-number={currentStage.stageNumber}
      data-mechanic={currentStage.mechanicKey}
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-slate-800 max-w-6xl mx-auto my-6 overflow-hidden"
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
            <div className="text-xs text-amber-300 font-bold">
              {isAr
                ? `المرحلة ${currentStage.stageNumber} من ${enabledStages.length} · ${childProfile.name.ar}`
                : `Stage ${currentStage.stageNumber} of ${enabledStages.length} · ${childProfile.name.en}`}
            </div>
            <h3 className="text-base font-black text-white">{currentStage.title[language]}</h3>
          </div>
        </div>

        {/* Stage Stepper Pills */}
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
                data-testid={`explorers-stepper-${stg.stageNumber}`}
                onClick={() => unlocked && handleStartStage(idx)}
                className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                  active
                    ? 'bg-red-600 text-white ring-2 ring-white'
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
            data-testid="explorers-xp-counter"
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
            <Volume2 className="w-4 h-4 text-amber-400" />
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

      {/* Mascot & Voice Instruction Header */}
      <div className="bg-amber-50/70 dark:bg-slate-800/60 px-6 py-4 border-b border-amber-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        {renderBiboMascot()}
        <div className="flex-1 text-center sm:text-start">
          <div className="text-xs font-bold text-red-600 dark:text-amber-400 mb-0.5">
            {gameConfig.mascotName[language]} {isAr ? 'يقول لك:' : 'says:'}
          </div>
          <p
            data-testid="explorers-feedback-text"
            className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug"
          >
            {feedback ? feedback[language] : currentStage.instruction[language]}
          </p>
        </div>
      </div>

      {/* Stage Playfield */}
      <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-center">
        {/* MECHANIC 1: DISCOVER COLORS */}
        {currentStage.mechanicKey === 'discover_colors' && (
          <div className="space-y-8 text-center">
            <div className="inline-flex flex-col items-center gap-2 bg-slate-100 dark:bg-slate-800 px-8 py-4 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500">
                {isAr
                  ? `التحدي ${roundIdx + 1} من ${totalColorRounds} — اضغط على اللون:`
                  : `Challenge ${roundIdx + 1} of ${totalColorRounds} — Tap the color:`}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-full border-4 border-white shadow-md inline-block"
                  style={{ backgroundColor: targetColor.hex }}
                />
                <span
                  data-testid="target-color-id"
                  data-target-color={targetColor.id}
                  className="text-2xl font-black text-slate-900 dark:text-white"
                >
                  {targetColor.name[language]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {colorChoices.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  data-testid={`color-choice-${col.id}`}
                  onClick={() => handleColorPick(col)}
                  className="group p-6 rounded-3xl border-4 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white bg-white dark:bg-slate-800 shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-3 cursor-pointer"
                >
                  <div
                    className="w-24 h-24 rounded-full shadow-inner border-4 border-white flex items-center justify-center text-white text-3xl"
                    style={{ backgroundColor: col.hex }}
                  >
                    🎈
                  </div>
                  <span className="text-base font-black text-slate-800 dark:text-white">
                    {col.name[language]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MECHANIC 2: IDENTIFY SHAPES */}
        {currentStage.mechanicKey === 'identify_shapes' && (
          <div className="space-y-8 text-center">
            <div className="inline-flex flex-col items-center gap-2 bg-slate-100 dark:bg-slate-800 px-8 py-4 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500">
                {isAr
                  ? `التحدي ${roundIdx + 1} من ${totalShapeRounds} — اختر الشكل المطلوب:`
                  : `Challenge ${roundIdx + 1} of ${totalShapeRounds} — Tap the shape:`}
              </span>
              <span
                data-testid="target-shape-id"
                data-target-shape={targetShape.id}
                className="text-2xl font-black text-slate-900 dark:text-white"
              >
                {targetShape.name[language]}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {targetShape.clue[language]}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {shapeChoices.map((sh) => (
                <button
                  key={sh.id}
                  type="button"
                  data-testid={`shape-choice-${sh.id}`}
                  onClick={() => handleShapePick(sh)}
                  className="p-6 rounded-3xl border-4 border-slate-200 dark:border-slate-700 hover:border-red-500 bg-white dark:bg-slate-800 shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-3 cursor-pointer"
                >
                  <ShapeSvg shapeType={sh.shapeType} colorHex={sh.colorHex} className="w-24 h-24" />
                  <span className="text-base font-black text-slate-800 dark:text-white">
                    {sh.name[language]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MECHANIC 3: MATCH TWIN SHAPE */}
        {currentStage.mechanicKey === 'match_twin_shape' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Draggable / Selectable Shapes Tray */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-4 text-center">
                {isAr ? 'الأشكال الملونة (اضغط أو اسحب الشكل)' : 'Colored Shapes (Tap or Drag Shape)'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {twinShapes.map((sh) => {
                  const isPlaced = Boolean(matchedTwins[sh.id]);
                  if (isPlaced) return null;
                  const isSelected = selectedItemId === sh.id;
                  return (
                    <button
                      key={sh.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', sh.id);
                        playPickupSfx();
                        setSelectedItemId(sh.id);
                      }}
                      data-testid={`twin-piece-${sh.id}`}
                      onClick={() => {
                        playPickupSfx();
                        setSelectedItemId(sh.id);
                      }}
                      className={`p-4 rounded-2xl border-4 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 transition-all cursor-grab ${
                        isSelected
                          ? 'border-red-600 ring-4 ring-red-500/30 scale-105'
                          : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <ShapeSvg shapeType={sh.shapeType} colorHex={sh.colorHex} className="w-20 h-20" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {sh.name[language]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Twin Slots */}
            <div className="bg-amber-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border-2 border-dashed border-amber-300 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-4 text-center">
                {isAr ? 'لوحة التوائم (ضع كل شكل فوق مثيله)' : 'Twin Board (Drop on Matching Twin)'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {twinShapes.map((slot) => {
                  const isMatched = Boolean(matchedTwins[slot.id]);
                  return (
                    <div
                      key={slot.id}
                      data-testid={`twin-slot-${slot.id}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain') || selectedItemId;
                        if (draggedId) handleTwinPlacement(draggedId, slot.id);
                      }}
                      onClick={() => {
                        if (selectedItemId && !isMatched) {
                          handleTwinPlacement(selectedItemId, slot.id);
                        }
                      }}
                      className={`p-4 rounded-2xl border-4 flex flex-col items-center justify-center min-h-[140px] transition-all cursor-pointer ${
                        isMatched
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                          : 'bg-white dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-600 hover:border-red-500'
                      }`}
                    >
                      <ShapeSvg
                        shapeType={slot.shapeType}
                        colorHex={slot.colorHex}
                        outlineOnly={!isMatched}
                        className="w-20 h-20"
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-2">
                        {slot.name[language]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MECHANIC 4: COLLECT SIMILAR SHAPES */}
        {currentStage.mechanicKey === 'collect_similar_shapes' && (
          <div className="space-y-8">
            {/* Unplaced shapes tray */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-3 text-center">
                {isAr
                  ? 'اختر أو اسحب الشكل ثم ضعه في السلة المشابهة له:'
                  : 'Tap or drag each shape into its matching basket:'}
              </h4>
              <div className="flex flex-wrap justify-center gap-4 min-h-[100px] items-center">
                {sortingItems
                  .filter((itm) => !placedSortIds.has(itm.id))
                  .map((itm) => {
                    const isSelected = selectedItemId === itm.id;
                    return (
                      <button
                        key={itm.id}
                        type="button"
                        draggable
                        data-testid={`sort-item-${itm.id}`}
                        data-shape-type={itm.shapeType}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', itm.id);
                          playPickupSfx();
                          setSelectedItemId(itm.id);
                        }}
                        onClick={() => {
                          playPickupSfx();
                          setSelectedItemId(itm.id);
                        }}
                        className={`p-3.5 rounded-2xl border-4 bg-white dark:bg-slate-900 flex flex-col items-center gap-1.5 transition-all cursor-grab ${
                          isSelected
                            ? 'border-red-600 ring-4 ring-red-500/30 scale-105'
                            : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        <ShapeSvg shapeType={itm.shapeType} colorHex={itm.colorHex} className="w-16 h-16" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {itm.label[language]}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 3 Shape Baskets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(
                [
                  { type: 'circle', title: { ar: 'سلة الدوائر ⭕', en: 'Circle Basket ⭕' }, color: '#EF4444' },
                  { type: 'square', title: { ar: 'سلة المربعات 🟦', en: 'Square Basket 🟦' }, color: '#3B82F6' },
                  { type: 'star', title: { ar: 'سلة النجوم ⭐', en: 'Star Basket ⭐' }, color: '#FACC15' },
                ] as const
              ).map((basket) => (
                <div
                  key={basket.type}
                  data-testid={`sort-basket-${basket.type}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData('text/plain') || selectedItemId;
                    if (draggedId) handleSortIntoBasket(draggedId, basket.type);
                  }}
                  onClick={() => {
                    if (selectedItemId) handleSortIntoBasket(selectedItemId, basket.type);
                  }}
                  className="p-5 rounded-3xl border-4 border-dashed border-amber-400 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800/40 hover:border-red-500 flex flex-col items-center justify-between min-h-[190px] cursor-pointer transition-all"
                >
                  <div className="flex flex-col items-center">
                    <ShapeSvg shapeType={basket.type} colorHex={basket.color} className="w-14 h-14" />
                    <span className="font-black text-base text-slate-900 dark:text-white mt-1">
                      {basket.title[language]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-amber-200 dark:border-slate-700 w-full min-h-[52px]">
                    {sortedBaskets[basket.type].map((placedId) => {
                      const itm = sortingItems.find((i) => i.id === placedId);
                      if (!itm) return null;
                      return (
                        <div
                          key={placedId}
                          className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-400"
                        >
                          <ShapeSvg shapeType={itm.shapeType} colorHex={itm.colorHex} className="w-8 h-8" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MECHANIC 5: FINAL CHALLENGE - COLORFUL SHAPE CITY */}
        {currentStage.mechanicKey === 'colorful_shape_city' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* City Parts Tray */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border-2 border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 text-center">
                {isAr ? 'أجزاء مدينة الأشكال الملونة' : 'Colorful Shape City Parts'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {CITY_PARTS.filter((part) => !cityPlacements[part.id]).map((part) => {
                  const isSelected = selectedItemId === part.id;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      draggable
                      data-testid={`city-part-${part.id}`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', part.id);
                        playPickupSfx();
                        setSelectedItemId(part.id);
                      }}
                      onClick={() => {
                        playPickupSfx();
                        setSelectedItemId(part.id);
                      }}
                      className={`p-3 rounded-2xl border-4 bg-white dark:bg-slate-900 flex flex-col items-center gap-1.5 transition-all cursor-grab ${
                        isSelected
                          ? 'border-red-600 ring-4 ring-red-500/30 scale-105'
                          : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <ShapeSvg shapeType={part.shapeType} colorHex={part.colorHex} className="w-16 h-16" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-center">
                        {part.label[language]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive City Scene Canvas */}
            <div className="lg:col-span-7 bg-gradient-to-b from-sky-100 to-emerald-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl border-4 border-sky-300 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-800 dark:text-white mb-4 text-center">
                {isAr ? 'مشهد مدينة الأشكال الملونة (اضغط أو أفلت كل شكل في مكانه)' : 'Colorful Shape City Blueprint'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CITY_PARTS.map((slot) => {
                  const placed = Boolean(cityPlacements[slot.id]);
                  return (
                    <div
                      key={slot.id}
                      data-testid={`city-slot-${slot.id}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain') || selectedItemId;
                        if (draggedId) handleCityPartPlace(draggedId, slot.id);
                      }}
                      onClick={() => {
                        if (selectedItemId && !placed) {
                          handleCityPartPlace(selectedItemId, slot.id);
                        }
                      }}
                      className={`p-4 rounded-2xl border-4 flex flex-col items-center justify-center min-h-[135px] transition-all cursor-pointer ${
                        placed
                          ? 'bg-white/95 dark:bg-slate-800 border-emerald-500 shadow-md'
                          : 'bg-white/70 dark:bg-slate-900/70 border-dashed border-slate-400 hover:border-red-500'
                      }`}
                    >
                      <ShapeSvg
                        shapeType={slot.shapeType}
                        colorHex={slot.colorHex}
                        outlineOnly={!placed}
                        className="w-16 h-16"
                      />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 mt-2 text-center">
                        {placed ? slot.label[language] : slot.slotLabel[language]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
