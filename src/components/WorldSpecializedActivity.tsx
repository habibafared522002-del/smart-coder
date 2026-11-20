import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Lightbulb,
  RotateCcw,
  Star,
  Sparkles,
  Sun,
  CloudRain,
  Scale,
  Play,
  Heart,
} from 'lucide-react';
import { JuniorAgeGroup, Language } from '../types';
import {
  AdaptivePaceMode,
  WorldSpecializedModule,
  getSmartyContextualDialogue,
  speakChildFriendly,
} from '../data/sevenWorldsPlatformData';
import { SmartyMascot3D, SmartyGameplayState } from './SmartyMascot3D';
import { playSound } from '../utils/soundEffects';

interface WorldSpecializedActivityProps {
  module: WorldSpecializedModule;
  language: Language;
  ageGroup: JuniorAgeGroup;
  adaptivePace: AdaptivePaceMode;
  childName: string;
  soundMuted: boolean;
  onAttemptRecord: (isCorrect: boolean, usedHint?: boolean) => void;
  onCompleteModule: (xpReward: number, badgeId?: string) => void;
  onBack: () => void;
}

export const WorldSpecializedActivity: React.FC<WorldSpecializedActivityProps> = ({
  module,
  language,
  ageGroup,
  adaptivePace,
  childName,
  soundMuted,
  onAttemptRecord,
  onCompleteModule,
  onBack,
}) => {
  const isAr = language === 'ar';
  const [robotState, setRobotState] = useState<SmartyGameplayState>('greeting');
  const [robotSpeech, setRobotSpeech] = useState<string>(() =>
    getSmartyContextualDialogue({
      mode: 'guide',
      language,
      ageGroup,
      worldId: module.worldId,
      situation: 'welcome',
      childName,
    })
  );
  const [showHint, setShowHint] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedDone, setCompletedDone] = useState(false);

  // Math Lab State
  const mathChallenges = useMemo(() => {
    const base = [
      { id: 'm1', items: ['⭐', '⭐', '⭐'], addItems: [], target: 3, choices: [2, 3, 4], promptAr: 'عدّ النجوم المضيئة واختر الرقم الصحيح!', promptEn: 'Count the bright stars and pick the matching number!' },
      { id: 'm2', items: ['🍎', '🍎', '🍎', '🍎'], addItems: [], target: 4, choices: [3, 4, 5], promptAr: 'كم تفاحة حمراء أمامك في السلة؟', promptEn: 'How many red apples are in the basket?' },
      { id: 'm3', items: ['🤖', '🤖'], addItems: ['🤖'], target: 3, choices: [2, 3, 5], promptAr: 'لدينا روبوتان وأضفنا روبوتاً واحداً (2 + 1). كم المجموع؟', promptEn: '2 robots plus 1 more robot (2 + 1). How many total?' },
      { id: 'm4', items: ['🔷', '🔷', '🔷'], addItems: ['🔷', '🔷'], target: 5, choices: [4, 5, 6], promptAr: 'اجمع المعينات الزرقاء (3 + 2) واختر الناتج!', promptEn: 'Add the blue diamonds (3 + 2) and pick the answer!' },
    ];
    return adaptivePace === 'simplify' || ageGroup === '3-4' ? base.slice(0, 3) : base;
  }, [adaptivePace, ageGroup]);

  // Arabic Letters State
  const arabicChallenges = useMemo(() => {
    const items = [
      {
        letter: 'أ',
        wordAr: 'أَسَد',
        wordEn: 'Lion (Asad)',
        icon: '🦁',
        audioAr: 'حرف الألف، أ، أَسَد',
        options: [
          { id: 'lion', label: 'أَسَد', icon: '🦁' },
          { id: 'fish', label: 'سَمَكَة', icon: '🐟' },
          { id: 'moon', label: 'قَمَر', icon: '🌙' },
        ],
        correctId: 'lion',
      },
      {
        letter: 'ب',
        wordAr: 'بَطَّة',
        wordEn: 'Duck (Batta)',
        icon: '🦆',
        audioAr: 'حرف الباء، ب، بَطَّة',
        options: [
          { id: 'duck', label: 'بَطَّة', icon: '🦆' },
          { id: 'apple', label: 'تُفَّاحَة', icon: '🍎' },
          { id: 'sun', label: 'شَمْس', icon: '☀️' },
        ],
        correctId: 'duck',
      },
      {
        letter: 'ت',
        wordAr: 'تُفَّاحَة',
        wordEn: 'Apple (Tuffaha)',
        icon: '🍎',
        audioAr: 'حرف التاء، ت، تُفَّاحَة',
        options: [
          { id: 'apple', label: 'تُفَّاحَة', icon: '🍎' },
          { id: 'lion', label: 'أَسَد', icon: '🦁' },
          { id: 'duck', label: 'بَطَّة', icon: '🦆' },
        ],
        correctId: 'apple',
      },
      {
        letter: 'س',
        wordAr: 'سَمَكَة',
        wordEn: 'Fish (Samaka)',
        icon: '🐟',
        audioAr: 'حرف السين، س، سَمَكَة',
        options: [
          { id: 'fish', label: 'سَمَكَة', icon: '🐟' },
          { id: 'moon', label: 'قَمَر', icon: '🌙' },
          { id: 'apple', label: 'تُفَّاحَة', icon: '🍎' },
        ],
        correctId: 'fish',
      },
    ];
    return ageGroup === '3-4' ? items.slice(0, 3) : items;
  }, [ageGroup]);

  // Digital Safety State
  const safetyScenarios = useMemo(
    () => [
      {
        id: 'ds1',
        cue: '⌨️ + 🖱️',
        promptAr: 'أي جزء نستخدمه لكتابة الحروف والأرقام على الحاسوب؟',
        promptEn: 'Which part do we use to type letters and numbers on a computer?',
        options: [
          { id: 'kb', ar: 'لوحة المفاتيح ⌨️', en: 'Keyboard ⌨️' },
          { id: 'speaker', ar: 'السماعة 🔊', en: 'Speaker 🔊' },
        ],
        correctId: 'kb',
      },
      {
        id: 'ds2',
        cue: '⏰ + 👀',
        promptAr: 'لعبنا على الجهاز لفترة طويلة وعيوننا تعبت. ما التصرف الصحي؟',
        promptEn: 'We played on screen for a while and feel tired. What is healthy?',
        options: [
          { id: 'break', ar: 'أستريح وألعب بألعابي بعيداً عن الشاشة ⚽', en: 'Take a break & play offline ⚽' },
          { id: 'more', ar: 'أقترب جداً من الشاشة ساعات إضافية 😣', en: 'Sit closer for hours 😣' },
        ],
        correctId: 'break',
      },
      {
        id: 'ds3',
        cue: '🔒',
        promptAr: 'هل نشارك اسمنا الكامل أو صورتنا مع شخص غريب على الإنترنت؟',
        promptEn: 'Should we share our private info with strangers online?',
        options: [
          { id: 'never', ar: 'لا، نحافظ على خصوصيتنا ونسأل والدينا 🛡️', en: 'No, stay private & ask parents 🛡️' },
          { id: 'yes', ar: 'نعم، نرسلها لأي شخص 😟', en: 'Yes, send to anyone 😟' },
        ],
        correctId: 'never',
      },
    ],
    []
  );

  // STEM Balance Scale State
  const [leftWeights, setLeftWeights] = useState<number>(3);
  const [rightWeights, setRightWeights] = useState<number>(1);
  const balanceTarget = ageGroup === '5-6' ? 4 : 3;

  // STEM Bridge State
  const [selectedFoundation, setSelectedFoundation] = useState<'none' | 'pillars' | 'deck' | 'complete'>('none');
  const [bridgeTested, setBridgeTested] = useState(false);

  // STEM Weather Lab State
  const [sunHeat, setSunHeat] = useState<number>(1);
  const [cloudMoisture, setCloudMoisture] = useState<number>(1);

  // Life Skills Stories State
  const lifeScenarios = useMemo(
    () => [
      {
        id: 'ls1',
        cue: '🧱 👦👧',
        storyAr: 'صديقك يريد اللعب معك بمكعبات الليجو، لكنها معك كلها. ماذا تفعل؟',
        storyEn: 'Your friend wants to build with blocks together. What is a kind action?',
        options: [
          { id: 'share', ar: 'أشاركه بعض المكعبات ونبني برجاً معاً! 🤝', en: 'Share blocks and build together! 🤝' },
          { id: 'hide', ar: 'أخفي المكعبات كلها وحدي 🙁', en: 'Hide all the blocks alone 🙁' },
        ],
        correctId: 'share',
      },
      {
        id: 'ls2',
        cue: '🌅 🪥 🎒',
        storyAr: 'استيقظ سمارتي في الصباح، غسل وجهه وفرّش أسنانه. ما خطوة الاستعداد الصحية التالية؟',
        storyEn: 'Smarty woke up, washed up, and brushed teeth. What healthy step comes next?',
        options: [
          { id: 'breakfast', ar: 'يتناول فطوره الصحي ويرتب حقيبته 🍎🎒', en: 'Eat healthy breakfast & pack bag 🍎🎒' },
          { id: 'sleep', ar: 'يرمي الأدوات على الأرض 💨', en: 'Throw items on the floor 💨' },
        ],
        correctId: 'breakfast',
      },
      {
        id: 'ls3',
        cue: '😢 ❤️',
        storyAr: 'سقط برج صديقك بالخطأ وشعر بالحزن. كيف تساعده كصديق لطيف؟',
        storyEn: 'Your friend tower fell accidentally and they feel sad. How can you help?',
        options: [
          { id: 'comfort', ar: 'أبتسم وأساعده في إعادة بنائه معاً 💛', en: 'Encourage them & rebuild together 💛' },
          { id: 'laugh', ar: 'أتركه حزيناً وأبتعد 😕', en: 'Walk away without helping 😕' },
        ],
        correctId: 'comfort',
      },
    ],
    []
  );

  const handleCorrectStep = (totalSteps: number) => {
    playSound('success');
    onAttemptRecord(true, showHint);
    setRobotState('cheering');
    const msg = getSmartyContextualDialogue({
      mode: 'guide',
      language,
      ageGroup,
      worldId: module.worldId,
      situation: 'celebrate',
      childName,
    });
    setRobotSpeech(msg);
    if (!soundMuted) speakChildFriendly(msg, language, soundMuted);

    if (stepIndex + 1 >= totalSteps) {
      finishModuleSuccess();
    } else {
      setTimeout(() => {
        setStepIndex((s) => s + 1);
        setShowHint(false);
        setRobotState('pointing');
      }, 650);
    }
  };

  const handleWrongStep = () => {
    playSound('error');
    onAttemptRecord(false, showHint);
    setRobotState('error');
    setShowHint(true);
    const msg = getSmartyContextualDialogue({
      mode: 'guide',
      language,
      ageGroup,
      worldId: module.worldId,
      situation: 'encourage_retry',
      childName,
    });
    setRobotSpeech(msg);
    setTimeout(() => setRobotState('retry'), 1100);
  };

  const finishModuleSuccess = () => {
    playSound('win');
    setRobotState('victory');
    setCompletedDone(true);
    onCompleteModule(module.xpReward, module.badgeId);
  };

  const speakCurrentPrompt = (text: string) => {
    speakChildFriendly(text, language, soundMuted);
  };

  if (completedDone) {
    return (
      <div
        data-testid="specialized-module-complete"
        className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-emerald-400 shadow-2xl text-center my-8"
      >
        <div className="flex justify-center mb-4">
          <SmartyMascot3D state="victory" size="lg" language={language} />
        </div>
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
          <CheckCircle2 className="w-4 h-4" />
          {isAr ? 'أحسنت! اكتمل النشاط التفاعلي' : 'Awesome! Activity Mastered'}
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
          {module.title[language]}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
          {isAr
            ? `رائع يا ${childName}! كسبت +${module.xpReward} نقطة خبرة وتقدّم مستواك في هذا العالم.`
            : `Great work ${childName}! Earned +${module.xpReward} XP toward world mastery.`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onBack}
            data-testid="specialized-module-back-btn"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-black text-sm shadow-lg cursor-pointer"
          >
            {isAr ? 'العودة إلى خريطة العالم' : 'Back to World Hub'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      data-testid={`specialized-module-${module.moduleKind}`}
      className="max-w-5xl mx-auto py-6 px-4"
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          data-testid="module-exit-btn"
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة للعالم' : 'Back to World'}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400">
            {isAr ? `الهدف: ${module.learningObjective.ar}` : `Objective: ${module.learningObjective.en}`}
          </span>
          <button
            type="button"
            onClick={() => speakCurrentPrompt(robotSpeech)}
            className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isAr ? 'استمع' : 'Listen'}</span>
          </button>
        </div>
      </div>

      {/* Robot Coach Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-5 mb-6 border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-center gap-4">
        <SmartyMascot3D state={robotState} subRegionFocus="auto" size="md" language={language} />
        <div className="flex-1 text-center sm:text-start">
          <h2 className="text-xl font-black">{module.title[language]}</h2>
          <p className="text-sm text-cyan-200 font-bold mt-1">{robotSpeech}</p>
          {showHint && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 text-xs font-bold">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>
                {getSmartyContextualDialogue({
                  mode: 'guide',
                  language,
                  ageGroup,
                  situation: 'hint',
                })}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black shrink-0 cursor-pointer"
        >
          {isAr ? 'تلميح سمارتي 💡' : 'Smarty Hint 💡'}
        </button>
      </div>

      {/* MODULE 1: MATH COUNTING & ADDITION */}
      {module.moduleKind === 'math_numbers' && (() => {
        const ch = mathChallenges[stepIndex] || mathChallenges[0];
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="text-xs font-black text-amber-600 dark:text-amber-400">
              {isAr ? `التحدي ${stepIndex + 1} من ${mathChallenges.length}` : `Challenge ${stepIndex + 1} of ${mathChallenges.length}`}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? ch.promptAr : ch.promptEn}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 py-6 px-4 rounded-3xl bg-amber-50 dark:bg-slate-800/70 border border-amber-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-5xl">
                {ch.items.map((icon, i) => <span key={i}>{icon}</span>)}
              </div>
              {ch.addItems.length > 0 && (
                <>
                  <span className="text-4xl font-black text-red-600">+</span>
                  <div className="flex items-center gap-2 text-5xl">
                    {ch.addItems.map((icon, i) => <span key={i}>{icon}</span>)}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {ch.choices.map((num) => (
                <button
                  key={num}
                  type="button"
                  data-testid={`math-choice-${num}`}
                  onClick={() => (num === ch.target ? handleCorrectStep(mathChallenges.length) : handleWrongStep())}
                  className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 border-2 border-slate-300 dark:border-slate-700 text-4xl font-black transition-all cursor-pointer shadow-md"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* MODULE 2: ARABIC LETTERS & PHONICS */}
      {module.moduleKind === 'arabic_letters' && (() => {
        const ch = arabicChallenges[stepIndex] || arabicChallenges[0];
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="text-xs font-black text-orange-600 dark:text-orange-400">
              {isAr ? `الحرف ${stepIndex + 1} من ${arabicChallenges.length}` : `Letter ${stepIndex + 1} of ${arabicChallenges.length}`}
            </div>
            <div className="inline-flex flex-col items-center justify-center w-36 h-36 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl">
              <span className="text-7xl font-black leading-none">{ch.letter}</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => speakChildFriendly(ch.audioAr, 'ar', soundMuted)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-sm font-black text-slate-800 dark:text-white inline-flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-orange-500" />
                <span>{isAr ? `استمع لصوت الحرف (${ch.letter})` : `Hear Letter Sound (${ch.letter})`}</span>
              </button>
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-slate-200">
              {isAr ? `اختر الصورة والكلمة التي تبدأ بحرف (${ch.letter}):` : `Pick the picture that begins with Arabic letter (${ch.letter}):`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {ch.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`arabic-option-${opt.id}`}
                  onClick={() => (opt.id === ch.correctId ? handleCorrectStep(arabicChallenges.length) : handleWrongStep())}
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-all flex flex-col items-center gap-2 cursor-pointer shadow-md"
                >
                  <span className="text-5xl">{opt.icon}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* MODULE 3: DIGITAL SAFETY */}
      {module.moduleKind === 'digital_safety' && (() => {
        const sc = safetyScenarios[stepIndex] || safetyScenarios[0];
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="text-5xl">{sc.cue}</div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? sc.promptAr : sc.promptEn}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {sc.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`safety-option-${opt.id}`}
                  onClick={() => (opt.id === sc.correctId ? handleCorrectStep(safetyScenarios.length) : handleWrongStep())}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 hover:border-cyan-500 border-2 border-slate-200 dark:border-slate-700 font-black text-base text-slate-900 dark:text-white cursor-pointer transition-all"
                >
                  {isAr ? opt.ar : opt.en}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* MODULE 4: STEM BALANCE SCALE LAB */}
      {module.moduleKind === 'stem_balance' && (() => {
        const diff = leftWeights - rightWeights;
        const tiltDeg = Math.max(-18, Math.min(18, diff * -6));
        const isBalanced = leftWeights === balanceTarget && rightWeights === balanceTarget;
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr
                ? `مختبر التوازن: اجعل كلتا الكفتين تحملان (${balanceTarget}) مكعبات متساوية ليتوازن الميزان!`
                : `Equilibrium Lab: Balance both arms with (${balanceTarget}) equal blocks so the scale stays level!`}
            </h3>

            {/* Interactive SVG / CSS Seesaw Beam */}
            <div className="py-8 flex flex-col items-center justify-center">
              <div
                className="w-full max-w-md h-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-full transition-transform duration-300 relative flex items-center justify-between px-4"
                style={{ transform: `rotate(${tiltDeg}deg)` }}
              >
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl -mt-12 text-xs font-black shadow">
                  {leftWeights} 🧱
                </div>
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl -mt-12 text-xs font-black shadow">
                  {rightWeights} 🧱
                </div>
              </div>
              <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[28px] border-l-transparent border-r-transparent border-b-slate-700 dark:border-b-slate-300 mt-1" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-black text-slate-500">{isAr ? 'الكفة اليسرى' : 'Left Arm'}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLeftWeights((w) => Math.max(0, w - 1))}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 font-black text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xl font-black w-10">{leftWeights}</span>
                  <button
                    type="button"
                    data-testid="balance-left-plus"
                    onClick={() => setLeftWeights((w) => Math.min(6, w + 1))}
                    className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-black text-slate-500">{isAr ? 'الكفة اليمنى' : 'Right Arm'}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRightWeights((w) => Math.max(0, w - 1))}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 font-black text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xl font-black w-10">{rightWeights}</span>
                  <button
                    type="button"
                    data-testid="balance-right-plus"
                    onClick={() => setRightWeights((w) => Math.min(6, w + 1))}
                    className="w-10 h-10 rounded-xl bg-cyan-500 text-white font-black text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              data-testid="balance-check-btn"
              onClick={() => {
                if (isBalanced) {
                  finishModuleSuccess();
                } else {
                  handleWrongStep();
                }
              }}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg cursor-pointer"
            >
              {isAr ? 'اختبار توازن الميزان ⚖️' : 'Test Scale Equilibrium ⚖️'}
            </button>
          </div>
        );
      })()}

      {/* MODULE 5: STEM BRIDGE ENGINEERING */}
      {module.moduleKind === 'stem_bridge' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {isAr ? 'اختر أجزاء الجسر الهندسي بالترتيب: 1. الأعمدة المتينة ← 2. لوح العبور' : 'Assemble the Bridge in order: 1. Support Pillars → 2. Bridge Deck'}
          </h3>

          <div className="p-6 rounded-3xl bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 max-w-xl mx-auto">
            <div className="flex items-end justify-between h-32 px-6 border-b-4 border-sky-500">
              <div className="text-center">
                <div className="text-3xl">{bridgeTested ? '🏁' : '🤖'}</div>
                <div className="w-16 h-12 bg-emerald-600 rounded-t-xl mt-1" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-end pb-1">
                {(selectedFoundation === 'deck' || selectedFoundation === 'complete') && (
                  <div className="w-full h-4 bg-amber-500 rounded-full mb-1 shadow" />
                )}
                {(selectedFoundation === 'pillars' || selectedFoundation === 'deck' || selectedFoundation === 'complete') && (
                  <div className="flex justify-around w-full">
                    <div className="w-5 h-10 bg-slate-600 rounded-t" />
                    <div className="w-5 h-10 bg-slate-600 rounded-t" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl">{bridgeTested ? '🤖' : '⭐'}</div>
                <div className="w-16 h-12 bg-emerald-600 rounded-t-xl mt-1" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              data-testid="bridge-add-pillars"
              onClick={() => {
                playSound('click');
                setSelectedFoundation('pillars');
              }}
              className="px-5 py-3 rounded-2xl bg-slate-800 text-white font-black text-xs cursor-pointer"
            >
              1. {isAr ? 'تثبيت الأعمدة المتينة 🏗️' : 'Install Support Pillars 🏗️'}
            </button>
            <button
              type="button"
              data-testid="bridge-add-deck"
              onClick={() => {
                if (selectedFoundation === 'none') {
                  handleWrongStep();
                  return;
                }
                playSound('drop');
                setSelectedFoundation('deck');
              }}
              className="px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              2. {isAr ? 'تركيب سطح الجسر 🌉' : 'Place Bridge Deck 🌉'}
            </button>
            <button
              type="button"
              data-testid="bridge-test-btn"
              onClick={() => {
                if (selectedFoundation !== 'deck') {
                  handleWrongStep();
                  return;
                }
                setBridgeTested(true);
                setTimeout(finishModuleSuccess, 600);
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs shadow-lg cursor-pointer"
            >
              3. {isAr ? 'اختبار عبور الروبوت ✅' : 'Test Smarty Crossing ✅'}
            </button>
          </div>
        </div>
      )}

      {/* MODULE 6: STEM WEATHER & WATER CYCLE LAB */}
      {module.moduleKind === 'stem_weather' && (() => {
        const rainReady = sunHeat >= 2 && cloudMoisture >= 2;
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isAr ? 'مختبر دورة الماء: ارفع حرارة الشمس ☀️ ثم زِد الغيوم ☁️ لتنمو الزهرة بالمطر!' : 'Water Cycle Lab: Increase Sunlight ☀️ and Cloud Moisture ☁️ to grow the flower!'}
            </h3>

            <div className="p-8 rounded-3xl bg-gradient-to-b from-sky-900 to-emerald-950 text-white max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-around text-5xl">
                <span className={sunHeat >= 2 ? 'scale-125 transition-transform' : ''}>☀️</span>
                <span>{rainReady ? '🌧️' : '☁️'}</span>
              </div>
              <div className="text-sm font-bold text-cyan-200">
                {rainReady
                  ? isAr
                    ? 'هطل المطر المنعش! البذرة أصبحت زهرة جميلة!'
                    : 'Gentle rain fell! The seed bloomed into a flower!'
                  : isAr
                  ? 'اضبط الشمس والغيوم لتشاهد تكوّن السحب والمطر'
                  : 'Adjust sun and clouds to trigger condensation & rain'}
              </div>
              <div className="text-5xl">{rainReady ? '🌸' : '🌱'}</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                data-testid="weather-sun-btn"
                onClick={() => {
                  playSound('click');
                  setSunHeat(2);
                }}
                className="px-5 py-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer"
              >
                <Sun className="w-4 h-4" />
                <span>{isAr ? 'تفعيل أشعة الشمس الدافئة' : 'Activate Warm Sunlight'}</span>
              </button>
              <button
                type="button"
                data-testid="weather-cloud-btn"
                onClick={() => {
                  playSound('click');
                  setCloudMoisture(2);
                }}
                className="px-5 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer"
              >
                <CloudRain className="w-4 h-4" />
                <span>{isAr ? 'تجميع غيوم المطر' : 'Gather Rain Clouds'}</span>
              </button>
              <button
                type="button"
                data-testid="weather-complete-btn"
                onClick={() => (rainReady ? finishModuleSuccess() : handleWrongStep())}
                className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs shadow-lg cursor-pointer"
              >
                {isAr ? 'سجل النتيجة العلمية 🔬' : 'Record Discovery 🔬'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* MODULE 7: LIFE SKILLS FRIENDLY STORIES */}
      {module.moduleKind === 'life_skills_story' && (() => {
        const sc = lifeScenarios[stepIndex] || lifeScenarios[0];
        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="text-xs font-black text-rose-600 dark:text-rose-400">
              {isAr ? `موقف ${stepIndex + 1} من ${lifeScenarios.length}` : `Story ${stepIndex + 1} of ${lifeScenarios.length}`}
            </div>
            <div className="text-5xl">{sc.cue}</div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white max-w-2xl mx-auto">
              {isAr ? sc.storyAr : sc.storyEn}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {sc.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`lifeskills-option-${opt.id}`}
                  onClick={() => (opt.id === sc.correctId ? handleCorrectStep(lifeScenarios.length) : handleWrongStep())}
                  className="p-5 rounded-3xl bg-rose-50/70 dark:bg-slate-800 hover:border-rose-500 border-2 border-slate-200 dark:border-slate-700 font-black text-base text-slate-900 dark:text-white cursor-pointer transition-all"
                >
                  {isAr ? opt.ar : opt.en}
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
