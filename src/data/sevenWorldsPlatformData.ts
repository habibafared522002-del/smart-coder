import { JuniorAgeGroup, Language } from '../types';
import { ChildChapterLibraryProgress } from './chapterGameLibraryData';
import { ChildProfileRecord } from './ageGamesData';

export type EducationalWorldId =
  | 'world_digital'
  | 'world_brain'
  | 'world_math_lang'
  | 'world_creative'
  | 'world_stem'
  | 'world_coding'
  | 'world_lifeskills';

export type AdaptivePaceMode = 'simplify' | 'steady' | 'challenge_boost';

export interface WorldSpecializedModule {
  id: string;
  worldId: EducationalWorldId;
  moduleKind:
    | 'math_numbers'
    | 'arabic_letters'
    | 'digital_safety'
    | 'stem_balance'
    | 'stem_bridge'
    | 'stem_weather'
    | 'creative_studio'
    | 'life_skills_story';
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  learningObjective: { ar: string; en: string };
  recommendedAges: JuniorAgeGroup[];
  icon: string;
  xpReward: number;
  badgeId?: string;
}

export interface EducationalWorldDefinition {
  id: EducationalWorldId;
  worldNumber: number;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string;
  gradient: string;
  accentHex: string;
  /** Existing chapters 1..8 mapped directly inside this World without duplicating or deleting them */
  mappedChapterIds: number[];
  /** Existing standalone games mapped inside this World */
  mappedStandaloneGames: Array<'mouse_explorer_12' | 'jigsaw_12' | 'workshop_3d' | 'age_explorers' | 'age_discoverers' | 'age_creators'>;
  /** New specialized whole-child modules hosted in this World */
  specializedModules: WorldSpecializedModule[];
  skillsTargeted: { ar: string[]; en: string[] };
  prerequisiteWorldIds: EducationalWorldId[];
}

export interface WorldAssessmentQuestion {
  id: string;
  worldId: EducationalWorldId;
  minAgeGroup: JuniorAgeGroup;
  format: 'image_choice' | 'audio_listening' | 'sequence_logic' | 'matching';
  prompt: { ar: string; en: string };
  audioScript: { ar: string; en: string };
  visualCue: string;
  options: Array<{
    id: string;
    label: { ar: string; en: string };
    icon: string;
  }>;
  correctOptionId: string;
  hint: { ar: string; en: string };
  skillTag: { ar: string; en: string };
}

export interface WorldAssessmentRecord {
  worldId: EducationalWorldId;
  completedAt: string;
  scorePct: number;
  correctCount: number;
  totalQuestions: number;
  xpAwarded: number;
  masteryStatus: 'developing' | 'proficient' | 'mastered';
}

export interface CreativeProjectRecord {
  id: string;
  childId: string;
  title: string;
  backgroundId: 'space' | 'garden' | 'lab' | 'stage';
  elements: Array<{
    id: string;
    emoji: string;
    x: number;
    y: number;
    label: string;
    color: string;
  }>;
  strokes: Array<{
    color: string;
    points: Array<{ x: number; y: number }>;
  }>;
  eventScript: Array<{
    trigger: 'on_start' | 'on_tap' | 'on_sound';
    action: 'dance' | 'jump' | 'spin' | 'sparkle';
  }>;
  updatedAt: string;
}

export interface PlacedOasisItem {
  instanceId: string;
  itemId: string;
  zone: 'robot_home' | 'learning_garden' | 'puzzle_lab' | 'coding_city';
  slotIndex: number;
}

export interface AdaptivePerformanceRecord {
  correctAttempts: number;
  incorrectAttempts: number;
  retries: number;
  hintsUsed: number;
  completedModuleIds: string[];
  paceMode: AdaptivePaceMode;
}

export interface ChildWholePlatformState {
  childId: string;
  version: number;
  adaptiveByWorld: Record<EducationalWorldId, AdaptivePerformanceRecord>;
  assessmentsByWorld: Partial<Record<EducationalWorldId, WorldAssessmentRecord>>;
  unlockedBadgeIds: string[];
  creativeProjects: CreativeProjectRecord[];
  oasisItems: PlacedOasisItem[];
  completedUnpluggedIds: string[];
  worldXpEarned: number;
}

export interface BadgeDefinition {
  id: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string;
  xpBonus: number;
}

export interface UnpluggedActivityCard {
  id: string;
  worldId: EducationalWorldId;
  title: { ar: string; en: string };
  whatChildLearns: { ar: string; en: string };
  materialsNeeded: { ar: string[]; en: string[] };
  parentExplanation: { ar: string; en: string };
  stepsForChild: { ar: string[]; en: string[] };
  digitalConnection: { ar: string; en: string };
  extensionChallenge: { ar: string; en: string };
  ageRange: string;
}

export interface OasisItemDefinition {
  id: string;
  title: { ar: string; en: string };
  emoji: string;
  requiredStars: number;
  unlockConditionText: { ar: string; en: string };
}

export const PLATFORM_STATE_STORAGE_PREFIX = 'smartcoders_whole_child_state_v1_';

export const AWARDABLE_BADGES: BadgeDefinition[] = [
  {
    id: 'badge_first_discovery',
    title: { ar: 'المستكشف الأول', en: 'First Discovery' },
    description: { ar: 'أكمل أول نشاط أو مرحلة بنجاح', en: 'Completed first learning activity' },
    icon: '🌟',
    xpBonus: 15,
  },
  {
    id: 'badge_digital_hero',
    title: { ar: 'بطل العالم الرقمي', en: 'Digital Hero' },
    description: { ar: 'أظهر إتقاناً في مهارات الفأرة والأمان الرقمي', en: 'Mastered mouse skills and digital safety' },
    icon: '🖱️',
    xpBonus: 25,
  },
  {
    id: 'badge_pattern_detective',
    title: { ar: 'محقق الأنماط والألغاز', en: 'Pattern Detective' },
    description: { ar: 'أنجز تحديات عالم التفكير والألغاز', en: 'Solved Brain World puzzles and patterns' },
    icon: '🧩',
    xpBonus: 25,
  },
  {
    id: 'badge_math_arabic_star',
    title: { ar: 'نجم الحساب واللغة العربية', en: 'Math & Arabic Star' },
    description: { ar: 'أتم تحديات الأرقام والحروف العربية بنجاح', en: 'Completed Arabic letters & math counting' },
    icon: '🔢',
    xpBonus: 25,
  },
  {
    id: 'badge_creative_builder',
    title: { ar: 'المبدع الفنان', en: 'Creative Builder' },
    description: { ar: 'صمّم وحفظ مشروعاً إبداعياً في الاستوديو', en: 'Created and saved a project in Creative Studio' },
    icon: '🎨',
    xpBonus: 30,
  },
  {
    id: 'badge_science_explorer',
    title: { ar: 'عالم STEM الصغير', en: 'Science Explorer' },
    description: { ar: 'أجرى تجارب الميزان والجسر والطقس بنجاح', en: 'Completed STEM balance, bridge, and weather labs' },
    icon: '🔬',
    xpBonus: 30,
  },
  {
    id: 'badge_coding_champion',
    title: { ar: 'مهندس البرمجة', en: 'Coding Champion' },
    description: { ar: 'اجتاز تقييم عالم البرمجة والخوارزميات', en: 'Passed Coding World logic & robotics assessment' },
    icon: '🤖',
    xpBonus: 35,
  },
  {
    id: 'badge_helpful_friend',
    title: { ar: 'الصديق المتعاون', en: 'Helpful Friend' },
    description: { ar: 'أتم قصص المهارات الحياتية والذكاء العاطفي', en: 'Completed Life Skills social-emotional stories' },
    icon: '💛',
    xpBonus: 25,
  },
];

export const SEVEN_EDUCATIONAL_WORLDS: EducationalWorldDefinition[] = [
  {
    id: 'world_digital',
    worldNumber: 1,
    title: { ar: '1. العالم الرقمي (Digital World)', en: '1. Digital World' },
    subtitle: { ar: 'التحكم بالفأرة، التعرف على الأجهزة، والأمان الرقمي', en: 'Mouse Mastery, Device Discovery & Digital Safety' },
    description: {
      ar: 'يبدأ الطفل رحلته بالتعرف على مكونات الكمبيوتر، إتقان النقر والسحب والإفلات، واتباع قواعد الأمان الرقمي.',
      en: 'Children begin by learning device components, mouse clicking/dragging precision, and safe digital habits.',
    },
    icon: '💻',
    gradient: 'from-cyan-600 to-blue-700',
    accentHex: '#06b6d4',
    mappedChapterIds: [1],
    mappedStandaloneGames: ['mouse_explorer_12', 'age_discoverers'],
    specializedModules: [
      {
        id: 'mod_digital_safety',
        worldId: 'world_digital',
        moduleKind: 'digital_safety',
        title: { ar: 'قصة الأمان الرقمي والأجهزة الذكية', en: 'Digital Safety & Device Discovery' },
        subtitle: { ar: 'ميّز الأجهزة الآمنة وتعلّم الاستخدام المتوازن للشاشات', en: 'Identify digital devices and practice safe screen habits' },
        learningObjective: { ar: 'الوعي بالأجهزة الرقمية وقواعد السلامة الأولية', en: 'Device recognition and early digital safety habits' },
        recommendedAges: ['3-4', '4-5', '5-6'],
        icon: '🛡️',
        xpReward: 25,
        badgeId: 'badge_digital_hero',
      },
    ],
    skillsTargeted: {
      ar: ['تحريك المؤشر', 'النقر الفردي والمزدوج', 'السحب والإفلات', 'التمييز البصري للأيقونات', 'الأمان الرقمي'],
      en: ['Pointer Control', 'Single/Double Click', 'Drag & Drop', 'Icon Recognition', 'Digital Safety'],
    },
    prerequisiteWorldIds: [],
  },
  {
    id: 'world_brain',
    worldNumber: 2,
    title: { ar: '2. عالم التفكير والذكاء (Brain World)', en: '2. Brain World' },
    subtitle: { ar: 'الذاكرة البصرية، الأنماط، التصنيف، والألغاز الذكية', en: 'Visual Memory, Patterns, Sorting & Smart Puzzles' },
    description: {
      ar: 'ينمي قدرات الانتباه، اكتشاف العنصر المختلف، الذاكرة المكانية، وتركيب الصور والأشكال الهندسية.',
      en: 'Builds visual attention, odd-one-out logic, spatial memory, and geometric shape construction.',
    },
    icon: '🧠',
    gradient: 'from-purple-600 to-indigo-700',
    accentHex: '#8b5cf6',
    mappedChapterIds: [2],
    mappedStandaloneGames: ['jigsaw_12', 'age_explorers'],
    specializedModules: [],
    skillsTargeted: {
      ar: ['الذاكرة قصيرة المدى', 'الأنماط المتكررة', 'مطابقة الظلال', 'اكتشاف الجزء المفقود', 'الاستدلال المكاني'],
      en: ['Working Memory', 'Pattern Detection', 'Shadow Matching', 'Missing Piece Logic', 'Spatial Reasoning'],
    },
    prerequisiteWorldIds: [],
  },
  {
    id: 'world_math_lang',
    worldNumber: 3,
    title: { ar: '3. عالم الرياضيات واللغة العربية (Math & Language)', en: '3. Math & Arabic Language World' },
    subtitle: { ar: 'العد والجمع البسيط، الأرقام، الحروف العربية والأصوات', en: 'Counting, Simple Arithmetic, Arabic Letters & Phonics' },
    description: {
      ar: 'رحلة مرحة لربط الأرقام بالكميات والجمع البصري مع تعلم الحروف العربية وأصوات الكلمات من خلال اللعب.',
      en: 'Playful exploration connecting numbers to quantities, visual addition, Arabic alphabet letters, and beginning sounds.',
    },
    icon: '📚',
    gradient: 'from-amber-500 to-orange-600',
    accentHex: '#f59e0b',
    mappedChapterIds: [],
    mappedStandaloneGames: [],
    specializedModules: [
      {
        id: 'mod_math_lab',
        worldId: 'world_math_lang',
        moduleKind: 'math_numbers',
        title: { ar: 'مختبر الأرقام والعد والجمع البصري', en: 'Visual Counting & Arithmetic Lab' },
        subtitle: { ar: 'عدّ النجوم، طابق الكميات، وحل تحديات الجمع والمقارنة', en: 'Count items, match quantities, and solve visual addition puzzles' },
        learningObjective: { ar: 'ربط العدد بالكمية ومقارنة الأحجام والجمع البسيط', en: 'Number-to-quantity correspondence and early addition' },
        recommendedAges: ['3-4', '4-5', '5-6'],
        icon: '🔢',
        xpReward: 30,
        badgeId: 'badge_math_arabic_star',
      },
      {
        id: 'mod_arabic_lab',
        worldId: 'world_math_lang',
        moduleKind: 'arabic_letters',
        title: { ar: 'مغامرة الحروف العربية والأصوات', en: 'Arabic Letters & Beginning Sounds' },
        subtitle: { ar: 'طابق الحرف العربي بالصورة واستمع لنطقه الواضح', en: 'Match Arabic letters with pictures and listen to clear pronunciation' },
        learningObjective: { ar: 'الوعي الصوتي وبداية القراءة العربية وتكوين الكلمات', en: 'Phonemic awareness, letter recognition, and early words' },
        recommendedAges: ['3-4', '4-5', '5-6'],
        icon: 'أ',
        xpReward: 30,
        badgeId: 'badge_math_arabic_star',
      },
    ],
    skillsTargeted: {
      ar: ['تمييز الأرقام والكميات', 'الجمع البسيط', 'الحروف العربية', 'الأصوات الأولى للكلمات', 'ترتيب الجمل'],
      en: ['Number & Quantity', 'Simple Addition', 'Arabic Letters', 'Beginning Sounds', 'Word Formation'],
    },
    prerequisiteWorldIds: ['world_brain'],
  },
  {
    id: 'world_coding',
    worldNumber: 4,
    title: { ar: '4. عالم البرمجة والخوارزميات (Coding World)', en: '4. Coding World' },
    subtitle: { ar: 'الاتجاهات، برمجة الروبوت، تصحيح الأخطاء، والحلقات', en: 'Directions, Block Coding, Debugging & Loops' },
    description: {
      ar: 'يجمع خمسة فصول متكاملة لتعليم التفكير الحاسوبي من الأسهم البسيطة حتى بناء الخوارزميات واكتشاف الأخطاء والتكرار.',
      en: 'Unifies five coding chapters teaching directional thinking, block sequencing, debugging, and repeat loops.',
    },
    icon: '🤖',
    gradient: 'from-blue-600 to-violet-700',
    accentHex: '#3b82f6',
    mappedChapterIds: [3, 4, 5, 6, 7],
    mappedStandaloneGames: ['age_creators'],
    specializedModules: [],
    skillsTargeted: {
      ar: ['الاتجاهات المكانية', 'التسلسل الخوارزمي', 'اكتشاف الأخطاء (Debugging)', 'حلقات التكرار', 'التفكير الشرطي'],
      en: ['Directional Logic', 'Sequencing', 'Debugging', 'Repeat Loops', 'Conditionals'],
    },
    prerequisiteWorldIds: ['world_digital'],
  },
  {
    id: 'world_creative',
    worldNumber: 5,
    title: { ar: '5. العالم الإبداعي (Creative World)', en: '5. Creative World' },
    subtitle: { ar: 'استوديو الرسم، خلط الألوان، القصص والأحداث التفاعلية', en: 'Drawing Studio, Color Mixing, Stories & Events' },
    description: {
      ar: 'مساحة حرة وآمنة للطفل للرسم وخلط الألوان وتأليف القصص المتحركة وربط الأحداث بالبرمجة المرئية.',
      en: 'A safe creative sandbox for freehand drawing, color mixing, interactive storytelling, and event-based coding.',
    },
    icon: '🎨',
    gradient: 'from-fuchsia-600 to-rose-600',
    accentHex: '#ec4899',
    mappedChapterIds: [8],
    mappedStandaloneGames: [],
    specializedModules: [
      {
        id: 'mod_creative_studio',
        worldId: 'world_creative',
        moduleKind: 'creative_studio',
        title: { ar: 'استوديو المشاريع الإبداعية والقصص التفاعلية', en: 'Creative Project & Story Studio' },
        subtitle: { ar: 'ارسم، امزج الألوان، أضف شخصيات، وبرمج حركتها واحفظ مشروعك!', en: 'Draw, mix colors, place sprites, program events, and save your project!' },
        learningObjective: { ar: 'التعبير الفني والبرمجة المبنية على الأحداث في مشاريع شخصية', en: 'Artistic expression and event-driven animation projects' },
        recommendedAges: ['3-4', '4-5', '5-6'],
        icon: '🖌️',
        xpReward: 35,
        badgeId: 'badge_creative_builder',
      },
    ],
    skillsTargeted: {
      ar: ['الرسم الحر', 'نظريات خلط الألوان', 'السرد القصصي', 'برمجة الأحداث', 'تصميم المشاريع'],
      en: ['Freehand Drawing', 'Color Mixing', 'Storytelling', 'Event Coding', 'Project Creation'],
    },
    prerequisiteWorldIds: ['world_brain'],
  },
  {
    id: 'world_stem',
    worldNumber: 6,
    title: { ar: '6. عالم العلوم والهندسة (STEM World)', en: '6. STEM Science & Engineering World' },
    subtitle: { ar: 'تجارب التوازن، بناء الجسور، الطقس والفضاء، ومعمل 3D', en: 'Balance Experiments, Bridge Engineering, Weather & 3D Lab' },
    description: {
      ar: 'تفاعل مع تجارب فيزيائية وهندسية ممتعة تشرح السبب والنتيجة بالإضافة إلى معمل تنظيم الروبوتات ثلاثي الأبعاد.',
      en: 'Hands-on physics and engineering simulations explaining cause-and-effect alongside the 3D Workshop Organizer.',
    },
    icon: '🔬',
    gradient: 'from-emerald-600 to-teal-700',
    accentHex: '#10b981',
    mappedChapterIds: [],
    mappedStandaloneGames: ['workshop_3d'],
    specializedModules: [
      {
        id: 'mod_stem_balance',
        worldId: 'world_stem',
        moduleKind: 'stem_balance',
        title: { ar: 'مختبر توازن الكتل والسبب والنتيجة', en: 'Balance Scale & Cause-Effect Lab' },
        subtitle: { ar: 'وازن الأوزان على كفتي الميزان لاكتشاف قانون التوازن الهندسي', en: 'Balance weights across both arms to discover equilibrium' },
        learningObjective: { ar: 'فهم التوازن والسبب والنتيجة والتفكير العلمي التجريبي', en: 'Equilibrium, cause-and-effect, and hypothesis testing' },
        recommendedAges: ['3-4', '4-5', '5-6'],
        icon: '⚖️',
        xpReward: 30,
        badgeId: 'badge_science_explorer',
      },
      {
        id: 'mod_stem_bridge',
        worldId: 'world_stem',
        moduleKind: 'stem_bridge',
        title: { ar: 'مهمة بناء الجسر والبرج المتين', en: 'Bridge & Tower Structural Builder' },
        subtitle: { ar: 'اختر المواد الهندسية الصحيحة ليعبر الروبوت سمارتي الجسر بأمان', en: 'Select sturdy structural blocks so Smarty can cross safely' },
        learningObjective: { ar: 'مبادئ البناء والهندسة واختبار المتانة', en: 'Structural stability and basic engineering design' },
        recommendedAges: ['4-5', '5-6'],
        icon: '🌉',
        xpReward: 30,
        badgeId: 'badge_science_explorer',
      },
      {
        id: 'mod_stem_weather',
        worldId: 'world_stem',
        moduleKind: 'stem_weather',
        title: { ar: 'مختبر دورة الماء والطقس والفضاء', en: 'Weather, Water Cycle & Space Discovery' },
        subtitle: { ar: 'تحكم في حرارة الشمس والغيوم وشاهد تشكل المطر ونمو النبات', en: 'Control sunlight and clouds to observe evaporation, rain, and plant growth' },
        learningObjective: { ar: 'استكشاف الطبيعة والطقس والعلاقة بين الشمس والماء والنبات', en: 'Nature cycles, weather observation, and cause-effect' },
        recommendedAges: ['3-4', '4-5', '5-6'],
        icon: '🌦️',
        xpReward: 30,
        badgeId: 'badge_science_explorer',
      },
    ],
    skillsTargeted: {
      ar: ['التفكير الهندسي', 'الملاحظة العلمية', 'التوازن والقياس', 'دورة الطبيعة', 'حل المشكلات العملية'],
      en: ['Engineering Design', 'Scientific Observation', 'Balance & Measurement', 'Nature Cycles', 'Applied Problem Solving'],
    },
    prerequisiteWorldIds: ['world_math_lang'],
  },
  {
    id: 'world_lifeskills',
    worldNumber: 7,
    title: { ar: '7. عالم المهارات الحياتية (Life Skills World)', en: '7. Life Skills World' },
    subtitle: { ar: 'الروتين اليومي، المشاعر، المشاركة، والعادات الصحية', en: 'Daily Routines, Emotions, Sharing & Healthy Habits' },
    description: {
      ar: 'مواقف وقصص حياتية دافئة تساعد الطفل على فهم المشاعر، التعاون، التنظيم، والمسؤولية اليومية دون أحكام سلبية.',
      en: 'Warm, non-judgmental everyday stories cultivating emotional literacy, cooperation, healthy routines, and responsibility.',
    },
    icon: '🌱',
    gradient: 'from-rose-500 to-amber-500',
    accentHex: '#f43f5e',
    mappedChapterIds: [],
    mappedStandaloneGames: [],
    specializedModules: [
      {
        id: 'mod_life_skills_stories',
        worldId: 'world_lifeskills',
        moduleKind: 'life_skills_story',
        title: { ar: 'قصص سمارتي للمشاعر والروتين اليومي', en: 'Smarty Feelings, Sharing & Daily Routine Stories' },
        subtitle: { ar: 'ساعد أصدقاء سمارتي في اختيار التصرف اللطيف والروتين الصحي', en: 'Help Smarty friends choose kind, helpful, and healthy everyday actions' },
        learningObjective: { ar: 'التعاطف، تسمية المشاعر، المشاركة، والعادات الصحية والنظام', en: 'Empathy, emotion recognition, cooperation, and responsibility' },
        recommendedAges: ['3-4', '4-5', '5-6'],
        icon: '💛',
        xpReward: 30,
        badgeId: 'badge_helpful_friend',
      },
    ],
    skillsTargeted: {
      ar: ['الوعي بالمشاعر', 'المشاركة والتعاون', 'ترتيب الروتين اليومي', 'العادات الصحية', 'اتخاذ قرارات لطيفة'],
      en: ['Emotion Awareness', 'Sharing & Teamwork', 'Daily Routine Ordering', 'Healthy Habits', 'Kind Choices'],
    },
    prerequisiteWorldIds: [],
  },
];

export const WORLD_ASSESSMENT_QUESTIONS: WorldAssessmentQuestion[] = [
  // World 1: Digital World
  {
    id: 'q-dig-1',
    worldId: 'world_digital',
    minAgeGroup: '3-4',
    format: 'image_choice',
    prompt: { ar: 'أي جهاز نستخدمه لتحريك المؤشر والنقر على الشاشة؟', en: 'Which device do we use to move the cursor and click on screen?' },
    audioScript: { ar: 'اختر صورة الفأرة الذكية التي تحرك المؤشر على الشاشة.', en: 'Choose the mouse picture that moves the cursor.' },
    visualCue: '🖱️',
    options: [
      { id: 'mouse', label: { ar: 'الفأرة (Mouse)', en: 'Computer Mouse' }, icon: '🖱️' },
      { id: 'apple', label: { ar: 'تفاحة', en: 'Apple' }, icon: '🍎' },
      { id: 'ball', label: { ar: 'كرة', en: 'Ball' }, icon: '⚽' },
    ],
    correctOptionId: 'mouse',
    hint: { ar: 'ابحث عن الأداة التقنية التي تشبه الفأرة وتساعدنا على الضغط!', en: 'Look for the tech tool used to point and click!' },
    skillTag: { ar: 'التعرف على الأجهزة', en: 'Device Recognition' },
  },
  {
    id: 'q-dig-2',
    worldId: 'world_digital',
    minAgeGroup: '4-5',
    format: 'image_choice',
    prompt: { ar: 'عندما تظهر رسالة غير معروفة على الشاشة، ما التصرف الآمن؟', en: 'When an unknown pop-up appears on screen, what is the safe action?' },
    audioScript: { ar: 'ما التصرف الآمن عند ظهور رسالة غريبة على الجهاز؟', en: 'What is the safe thing to do if a strange message appears?' },
    visualCue: '🛡️',
    options: [
      { id: 'ask_parent', label: { ar: 'أسأل والدي أو معلمي فوراً', en: 'Ask my parent or teacher right away' }, icon: '👨‍👩‍👧' },
      { id: 'click_fast', label: { ar: 'أضغط بسرعة دون تفكير', en: 'Click quickly without asking' }, icon: '⚠️' },
    ],
    correctOptionId: 'ask_parent',
    hint: { ar: 'دائماً نستشير الكبار عندما نرى شيئاً غير مألوف على الجهاز.', en: 'Always check with a trusted adult when unsure.' },
    skillTag: { ar: 'الأمان الرقمي', en: 'Digital Safety' },
  },
  // World 2: Brain World
  {
    id: 'q-brn-1',
    worldId: 'world_brain',
    minAgeGroup: '3-4',
    format: 'sequence_logic',
    prompt: { ar: 'أكمل النمط التالي: 🔴 🔵 🔴 🔵 🔴 ...؟', en: 'Complete the pattern: 🔴 🔵 🔴 🔵 🔴 ...?' },
    audioScript: { ar: 'انظر للألوان: أحمر، أزرق، أحمر، أزرق، أحمر.. ماذا يأتي الآن؟', en: 'Look at the pattern: Red, Blue, Red, Blue, Red... what comes next?' },
    visualCue: '🔴 🔵 🔴 🔵 🔴 ❓',
    options: [
      { id: 'blue', label: { ar: 'دائرة زرقاء 🔵', en: 'Blue Circle 🔵' }, icon: '🔵' },
      { id: 'yellow', label: { ar: 'نجمة صفراء ⭐', en: 'Yellow Star ⭐' }, icon: '⭐' },
      { id: 'green', label: { ar: 'مربع أخضر 🟩', en: 'Green Square 🟩' }, icon: '🟩' },
    ],
    correctOptionId: 'blue',
    hint: { ar: 'اللونان يتبادلان بالترتيب: بعد الأحمر يأتي الأزرق.', en: 'The two colors alternate: Blue follows Red.' },
    skillTag: { ar: 'إدراك الأنماط', en: 'Pattern Recognition' },
  },
  {
    id: 'q-brn-2',
    worldId: 'world_brain',
    minAgeGroup: '4-5',
    format: 'image_choice',
    prompt: { ar: 'أي عنصر مختلف عن بقية المجموعة (Odd One Out)؟', en: 'Which item does NOT belong in the group (Odd One Out)?' },
    audioScript: { ar: 'لدينا ثلاث فواكه وعنصر واحد مختلف. أيها المختلف؟', en: 'There are three fruits and one different object. Which is odd?' },
    visualCue: '🍎 🍌 🍇 🚀',
    options: [
      { id: 'rocket', label: { ar: 'الصاروخ 🚀', en: 'Rocket 🚀' }, icon: '🚀' },
      { id: 'apple', label: { ar: 'التفاحة 🍎', en: 'Apple 🍎' }, icon: '🍎' },
      { id: 'banana', label: { ar: 'الموزة 🍌', en: 'Banana 🍌' }, icon: '🍌' },
    ],
    correctOptionId: 'rocket',
    hint: { ar: 'التفاحة والموزة والعنب كلها فواكه، لكن الصاروخ مركبة فضائية!', en: 'Fruits go together; the spacecraft is the odd one out!' },
    skillTag: { ar: 'التصنيف والانتباه', en: 'Classification & Attention' },
  },
  // World 3: Math & Language World
  {
    id: 'q-ml-1',
    worldId: 'world_math_lang',
    minAgeGroup: '3-4',
    format: 'image_choice',
    prompt: { ar: 'عدّ النجوم الذهبية: ⭐⭐⭐ + ⭐⭐ = كم نجمة لدينا الآن؟', en: 'Count the stars: ⭐⭐⭐ + ⭐⭐ = How many stars in total?' },
    audioScript: { ar: 'لدينا ثلاث نجوم، أضفنا إليها نجمتين. كم أصبح المجموع؟', en: 'We have three stars and add two more. How many altogether?' },
    visualCue: '⭐⭐⭐ + ⭐⭐',
    options: [
      { id: '5', label: { ar: '5 نجوم', en: '5 Stars' }, icon: '5️⃣' },
      { id: '3', label: { ar: '3 نجوم', en: '3 Stars' }, icon: '3️⃣' },
      { id: '2', label: { ar: 'نجمتان 2', en: '2 Stars' }, icon: '2️⃣' },
    ],
    correctOptionId: '5',
    hint: { ar: 'عدّ جميع النجوم معاً: 1، 2، 3، 4، 5!', en: 'Count all stars together: 1, 2, 3, 4, 5!' },
    skillTag: { ar: 'العد والجمع البسيط', en: 'Counting & Addition' },
  },
  {
    id: 'q-ml-2',
    worldId: 'world_math_lang',
    minAgeGroup: '3-4',
    format: 'audio_listening',
    prompt: { ar: 'ما الكلمة التي تبدأ بحرف الألف (أ)؟', en: 'Which picture begins with the Arabic letter Alif (أ)?' },
    audioScript: { ar: 'استمع جيداً: حرف الألف... أ أ أسد! اضغط على صورة الأسد.', en: 'Listen carefully: Alif as in Asad (Lion)!' },
    visualCue: 'أ',
    options: [
      { id: 'asad', label: { ar: 'أسد 🦁', en: 'Lion (أسد)' }, icon: '🦁' },
      { id: 'batta', label: { ar: 'بطة 🦆', en: 'Duck (بطة)' }, icon: '🦆' },
      { id: 'samaka', label: { ar: 'سمكة 🐟', en: 'Fish (سمكة)' }, icon: '🐟' },
    ],
    correctOptionId: 'asad',
    hint: { ar: 'كلمة أَسَد تبدأ بصوت الحرف أ.', en: 'Asad starts with the sound أ.' },
    skillTag: { ar: 'الحروف والأصوات العربية', en: 'Arabic Letters & Phonics' },
  },
  // World 4: Coding World
  {
    id: 'q-cod-1',
    worldId: 'world_coding',
    minAgeGroup: '3-4',
    format: 'sequence_logic',
    prompt: { ar: 'الروبوت يريد التحرك خطوتين إلى اليمين ليصل إلى النجمة. أي أوامر يختار؟', en: 'Smarty needs 2 steps right to reach the star. Which commands work?' },
    audioScript: { ar: 'سمارتي يقف عند البداية والنجمة على يمينه بخطوتين. اختر الأوامر الصحيحة.', en: 'The star is two steps to the right. Pick the right sequence.' },
    visualCue: '🤖 ➡️ ➡️ ⭐',
    options: [
      { id: 'rr', label: { ar: 'يمين ➡️ ثم يمين ➡️', en: 'Right ➡️ then Right ➡️' }, icon: '➡️' },
      { id: 'uu', label: { ar: 'أعلى ⬆️ ثم أعلى ⬆️', en: 'Up ⬆️ then Up ⬆️' }, icon: '⬆️' },
      { id: 'll', label: { ar: 'يسار ⬅️ ثم يسار ⬅️', en: 'Left ⬅️ then Left ⬅️' }, icon: '⬅️' },
    ],
    correctOptionId: 'rr',
    hint: { ar: 'اتبع اتجاه السهم نحو اليمين مرتين.', en: 'Follow the arrow pointing right twice.' },
    skillTag: { ar: 'التسلسل والاتجاهات', en: 'Sequencing & Directions' },
  },
  {
    id: 'q-cod-2',
    worldId: 'world_coding',
    minAgeGroup: '4-5',
    format: 'sequence_logic',
    prompt: { ar: 'إذا تكررت خطوة (تحرك للأمام) 4 مرات، ما الأمر المختصر الأذكى؟', en: 'If Move Forward happens 4 times, what smart block shortens the code?' },
    audioScript: { ar: 'بدلاً من كتابة الأمر أربع مرات، كيف نختصره؟', en: 'Instead of writing Move Forward four times, how can we loop it?' },
    visualCue: '🔁 4x [⬆️]',
    options: [
      { id: 'loop4', label: { ar: 'حلقة التكرار 4 مرات 🔁', en: 'Repeat 4 Times Loop 🔁' }, icon: '🔁' },
      { id: 'stop', label: { ar: 'إيقاف كامل 🛑', en: 'Stop Completely 🛑' }, icon: '🛑' },
    ],
    correctOptionId: 'loop4',
    hint: { ar: 'نستخدم حلقة التكرار (Loop) لتكرار الأوامر المتشابهة بذكاء!', en: 'Loops repeat identical actions cleanly!' },
    skillTag: { ar: 'حلقات التكرار', en: 'Repeat Loops' },
  },
  // World 5: Creative World
  {
    id: 'q-cre-1',
    worldId: 'world_creative',
    minAgeGroup: '3-4',
    format: 'image_choice',
    prompt: { ar: 'عند مزج اللون الأحمر مع اللون الأصفر في الاستوديو، ماذا ينتج؟', en: 'When mixing Red and Yellow paint together, what new color appears?' },
    audioScript: { ar: 'جرب في خيالك مزج الأحمر مع الأصفر، ما اللون الجديد؟', en: 'Mix red and yellow together—which color do you get?' },
    visualCue: '🔴 + 🟡 = ❓',
    options: [
      { id: 'orange', label: { ar: 'برتقالي 🟠', en: 'Orange 🟠' }, icon: '🟠' },
      { id: 'purple', label: { ar: 'بنفسجي 🟣', en: 'Purple 🟣' }, icon: '🟣' },
      { id: 'green', label: { ar: 'أخضر 🟢', en: 'Green 🟢' }, icon: '🟢' },
    ],
    correctOptionId: 'orange',
    hint: { ar: 'الأحمر الدافئ + الأصفر المشرق يعطي لون البرتقالة!', en: 'Warm red + bright yellow creates the color of an orange!' },
    skillTag: { ar: 'الإبداع وخلط الألوان', en: 'Color Mixing Creativity' },
  },
  // World 6: STEM World
  {
    id: 'q-stm-1',
    worldId: 'world_stem',
    minAgeGroup: '3-4',
    format: 'image_choice',
    prompt: { ar: 'في تجربة الميزان: إذا وضعنا مكعبين في الكفة اليمنى، ماذا نضع في الكفة اليسرى لتتوازن؟', en: 'Balance Scale: If 2 blocks sit on the right arm, how many balance the left arm?' },
    audioScript: { ar: 'لكي تتساوى كفتا الميزان، كم مكعباً نحتاج في الجهة الثانية؟', en: 'To make both arms level, how many blocks go on the other side?' },
    visualCue: '⚖️ 🧱🧱 = ❓',
    options: [
      { id: 'two', label: { ar: 'مكعبان (2) ليتساوى الوزن', en: '2 Equal Blocks to Balance' }, icon: '⚖️' },
      { id: 'zero', label: { ar: 'صفر مكعبات (فارغة)', en: '0 Blocks (Empty)' }, icon: '⭕' },
    ],
    correctOptionId: 'two',
    hint: { ar: 'الميزان يتوازن عندما تكون الكفتان متساويتين في الوزن.', en: 'Both sides need equal weight to stay level.' },
    skillTag: { ar: 'التوازن والقياس الهندسي', en: 'Balance & Equilibrium' },
  },
  {
    id: 'q-stm-2',
    worldId: 'world_stem',
    minAgeGroup: '3-4',
    format: 'image_choice',
    prompt: { ar: 'ماذا تحتاج البذرة الصغيرة لتنمو وتصبح نبتة خضراء قوية؟', en: 'What does a tiny seed need to grow into a strong green plant?' },
    audioScript: { ar: 'اختر العناصر الطبيعية التي تساعد النبات على النمو.', en: 'Pick what helps a seed grow.' },
    visualCue: '🌱 ☀️ 💧',
    options: [
      { id: 'sun_water', label: { ar: 'ضوء الشمس والماء والتربة', en: 'Sunlight, Water & Soil' }, icon: '☀️' },
      { id: 'dark_box', label: { ar: 'صندوق مظلم بدون ماء', en: 'Dark box without water' }, icon: '📦' },
    ],
    correctOptionId: 'sun_water',
    hint: { ar: 'النباتات كائنات حية تحتاج إلى الماء والشمس لتكبر.', en: 'Plants are living things needing sunlight and water.' },
    skillTag: { ar: 'استكشاف الطبيعة والنبات', en: 'Plant Science Exploration' },
  },
  // World 7: Life Skills World
  {
    id: 'q-lif-1',
    worldId: 'world_lifeskills',
    minAgeGroup: '3-4',
    format: 'image_choice',
    prompt: { ar: 'بعد الانتهاء من اللعب بالألعاب في الغرفة، ما التصرف اللطيف والمسؤول؟', en: 'After finishing playtime with toys, what is the helpful & responsible choice?' },
    audioScript: { ar: 'ساعد صديقنا سمارتي في اختيار التصرف الصحيح بعد اللعب.', en: 'Help Smarty choose the helpful action after playtime.' },
    visualCue: '🧸 🧹',
    options: [
      { id: 'organize', label: { ar: 'أرتب ألعابي في صندوقها المخصص', en: 'Put my toys neatly back in their bin' }, icon: '🧺' },
      { id: 'leave', label: { ar: 'أتركها مبعثرة في الممر', en: 'Leave them scattered on the floor' }, icon: '💨' },
    ],
    correctOptionId: 'organize',
    hint: { ar: 'الطفل المنظم يعيد أدواته إلى مكانها حتى يجدها بسهولة ويحافظ على سلامة الجميع!', en: 'Putting toys away keeps everyone safe and tidy!' },
    skillTag: { ar: 'النظام والمسؤولية', en: 'Responsibility & Organization' },
  },
];

export const UNPLUGGED_ACTIVITY_CARDS: UnpluggedActivityCard[] = [
  {
    id: 'unplugged_cards_sequence',
    worldId: 'world_coding',
    title: { ar: 'بطاقات أوامر الخطوات على السجادة (البرمجة الحركية)', en: 'Floor Carpet Command Cards (Physical Sequencing)' },
    whatChildLearns: { ar: 'التسلسل المكاني والاتجاهات الأربعة وتنفيذ الخوارزميات بالجسم', en: 'Spatial sequencing, directions, and physical algorithm execution' },
    materialsNeeded: {
      ar: ['4 أوراق مرسوم عليها أسهم (أمام، خلف، يمين، يسار)', 'وسادة أو دمية كهدف نهائي'],
      en: ['4 paper cards with drawn arrows (Up, Down, Left, Right)', 'A cushion or plush toy as the finish goal'],
    },
    parentExplanation: {
      ar: 'اشرح للطفل أن كل بطاقة سهم تمثل أمراً برمجياً للروبوت، وسيمشي الطفل خطوة واحدة مقابل كل بطاقة بالترتيب.',
      en: 'Explain that each arrow card is a robot instruction, and the child steps once per card in exact sequence.',
    },
    stepsForChild: {
      ar: ['رتّب 4 بطاقات أسهم على الأرض للوصول إلى اللعبة', 'اقرأ البطاقات بصوت عالٍ بالترتيب', 'تحرك خطوة خطوة مثل الروبوت سمارتي للوصول للهدف!'],
      en: ['Line up 4 arrow cards leading to your toy', 'Read the cards aloud from start to finish', 'Step like Smarty Robot to reach the toy!'],
    },
    digitalConnection: { ar: 'يرتبط مباشرة مع الفصل 3 و 4 (مستكشف الاتجاهات ومغامرات خريطة الروبوت)', en: 'Directly connects to Chapters 3 & 4 (Direction Explorer & Robot Map)' },
    extensionChallenge: { ar: 'ضع عائقاً (وسادة أخرى) في الطريق واطلب من الطفل تعديل البطاقات (Debugging) لتجاوزه!', en: 'Place an obstacle pillow and challenge your child to debug and reroute the cards!' },
    ageRange: '3–6',
  },
  {
    id: 'unplugged_color_patterns',
    worldId: 'world_brain',
    title: { ar: 'مصنع الأنماط بالمكعبات أو الملاعق الملونة', en: 'Colored Spoon & Block Pattern Factory' },
    whatChildLearns: { ar: 'تمييز الأنماط المتكررة والتصنيف المنطقي والعد', en: 'Repeating pattern recognition, sorting logic, and counting' },
    materialsNeeded: {
      ar: ['مكعبات ليجو أو ملاعق بلاستيكية بلونين أو ثلاثة ألوان'],
      en: ['Building blocks or colored spoons in 2–3 colors'],
    },
    parentExplanation: {
      ar: 'ضع نمطاً متكرراً (أحمر - أزرق - أحمر - ...) واترك فراغاً للطفل ليكتشف القطعة الناقصة.',
      en: 'Lay out a repeating sequence (Red - Blue - Red - ...) and leave an empty spot for your child to complete.',
    },
    stepsForChild: {
      ar: ['افحص صف المكعبات بتركيز', 'تنبأ باللون التالي في النمط', 'أنشئ نمطاً سرياً جديداً واطلب من والديك إكماله!'],
      en: ['Inspect the row of blocks carefully', 'Place the next matching color', 'Invent your own pattern for a parent to solve!'],
    },
    digitalConnection: { ar: 'يرتبط مع الفصل 2 (محقق الأنماط) والفصل 7 (الحلقات والأنماط)', en: 'Connects to Chapter 2 (Pattern Detective) & Chapter 7 (Loops & Patterns)' },
    extensionChallenge: { ar: 'اصنع نمطاً ثلاثياً (أحمر - أصفر - أخضر) واطلب عدّ إجمالي القطع المستخدمة.', en: 'Build a 3-color cycle (Red-Yellow-Green) and count total pieces.' },
    ageRange: '3–6',
  },
  {
    id: 'unplugged_cup_tower',
    worldId: 'world_stem',
    title: { ar: 'تحدي المهندس الصغير: برج الأكواب المتوازن', en: 'Junior Engineer: Balanced Cup Tower Challenge' },
    whatChildLearns: { ar: 'مبادئ التوازن الهندسي، قاعدة البناء العريضة، وحل المشكلات عند السقوط', en: 'Structural balance, wide-base geometry, and iterative engineering' },
    materialsNeeded: {
      ar: ['6 إلى 10 أكواب ورقية أو بلاستيكية آمنة', 'ورقة مقوى كجسر بين الأكواب'],
      en: ['6–10 paper or safe plastic cups', 'One sheet of cardboard for a bridge span'],
    },
    parentExplanation: {
      ar: 'شجّع الطفل على التجربة: لماذا تثبت القاعدة العريضة أكثر من القاعدة الضيقة؟',
      en: 'Encourage experimenting: why is a wide base stronger than a narrow single column?',
    },
    stepsForChild: {
      ar: ['ضع 3 أكواب في القاعدة على الطاولة', 'وازن فوقها ورقة المقوى كجسر، ثم ضع كوبين في الطابق الثاني', 'اختبر وضع لعبة خفيفة فوق البرج دون أن يسقط!'],
      en: ['Place 3 cups as a sturdy base', 'Rest the cardboard deck on top and stack 2 more cups', 'Test placing a light toy gently on top!'],
    },
    digitalConnection: { ar: 'يرتبط مع عالم STEM (مختبر التوازن وبناء الجسر ومعمل الروبوتات 3D)', en: 'Connects to STEM World (Balance Scale, Bridge Builder & 3D Workshop)' },
    extensionChallenge: { ar: 'ارسم تصميم البرج أولاً على ورقة ثم قارن الرسم بالبناء الفعلي!', en: 'Sketch your blueprint on paper first, then compare with your real tower!' },
    ageRange: '4–6',
  },
  {
    id: 'unplugged_story_cards',
    worldId: 'world_math_lang',
    title: { ar: 'مخبر الكلمات والحروف بالبطاقات المصورة', en: 'Picture-Card Storytelling & Arabic Letters' },
    whatChildLearns: { ar: 'تمييز الأصوات الأولى للحروف العربية وترتيب أحداث القصة', en: 'Arabic beginning phonics and narrative event sequencing' },
    materialsNeeded: {
      ar: ['3 إلى 5 أشياء من المنزل (تفاحة، كوب، كتاب، ملعقة) أو بطاقات مرسومة'],
      en: ['3–5 everyday home objects (apple, cup, book, spoon) or drawn cards'],
    },
    parentExplanation: {
      ar: 'انطق الحرف الأول لكل غرض واطلب من الطفل ربط الأشياء في قصة قصيرة من البداية والوسط والنهاية.',
      en: 'Say the beginning sound of each item and invite your child to weave them into a 3-part story.',
    },
    stepsForChild: {
      ar: ['التقط كل غرض وانطق اسمه وحرفه الأول بوضوح', 'رتب الأغراض في 3 محطات: ماذا حدث أولاً؟ ثم ماذا؟ وكيف انتهت القصة؟', 'احكِ القصة لأفراد العائلة!'],
      en: ['Pick up each object and pronounce its starting sound', 'Order 3 scenes: Beginning, Middle, and Ending', 'Tell your creative story aloud!'],
    },
    digitalConnection: { ar: 'يرتبط مع عالم الرياضيات واللغة والعالم الإبداعي (القصة التفاعلية)', en: 'Connects to Math & Language World and Creative Story Studio' },
    extensionChallenge: { ar: 'عدّ حروف كلمة من اختيارك واكتب أول حرف منها بإصبعك في الهواء.', en: 'Count the letters in one chosen word and trace the first letter in the air.' },
    ageRange: '3–6',
  },
];

export const OASIS_DECORATIONS: OasisItemDefinition[] = [
  {
    id: 'oasis_plant',
    title: { ar: 'نبتة الطاقة الخضراء', en: 'Green Energy Sprout' },
    emoji: '🪴',
    requiredStars: 0,
    unlockConditionText: { ar: 'متاحة مجاناً عند بدء الرحلة', en: 'Unlocked from Day 1' },
  },
  {
    id: 'oasis_trophy',
    title: { ar: 'كأس سمارتي الذهبي', en: 'Smarty Golden Trophy' },
    emoji: '🏆',
    requiredStars: 3,
    unlockConditionText: { ar: 'يُفتح عند كسب 3 نجوم من التعلم', en: 'Unlocks at 3 earned stars' },
  },
  {
    id: 'oasis_rocket',
    title: { ar: 'نموذج صاروخ الفضاء', en: 'Space Explorer Rocket' },
    emoji: '🚀',
    requiredStars: 6,
    unlockConditionText: { ar: 'يُفتح عند كسب 6 نجوم من الألغاز', en: 'Unlocks at 6 earned stars' },
  },
  {
    id: 'oasis_telescope',
    title: { ar: 'تلسكوب النجوم العلمي', en: 'Science Star Telescope' },
    emoji: '🔭',
    requiredStars: 9,
    unlockConditionText: { ar: 'يُفتح عند كسب 9 نجوم في STEM', en: 'Unlocks at 9 earned stars' },
  },
  {
    id: 'oasis_easel',
    title: { ar: 'لوحة الفنان المبدع', en: 'Artist Painting Easel' },
    emoji: '🎨',
    requiredStars: 12,
    unlockConditionText: { ar: 'يُفتح عند كسب 12 نجمة إبداعية', en: 'Unlocks at 12 earned stars' },
  },
  {
    id: 'oasis_crown',
    title: { ar: 'شعار بطل البرمجة', en: 'Coding Hero Crown' },
    emoji: '👑',
    requiredStars: 15,
    unlockConditionText: { ar: 'يُفتح عند كسب 15 نجمة إنجاز', en: 'Unlocks at 15 earned stars' },
  },
];

function createDefaultAdaptiveRecord(): AdaptivePerformanceRecord {
  return {
    correctAttempts: 0,
    incorrectAttempts: 0,
    retries: 0,
    hintsUsed: 0,
    completedModuleIds: [],
    paceMode: 'steady',
  };
}

export function createDefaultChildPlatformState(childId: string): ChildWholePlatformState {
  return {
    childId,
    version: 1,
    adaptiveByWorld: {
      world_digital: createDefaultAdaptiveRecord(),
      world_brain: createDefaultAdaptiveRecord(),
      world_math_lang: createDefaultAdaptiveRecord(),
      world_creative: createDefaultAdaptiveRecord(),
      world_stem: createDefaultAdaptiveRecord(),
      world_coding: createDefaultAdaptiveRecord(),
      world_lifeskills: createDefaultAdaptiveRecord(),
    },
    assessmentsByWorld: {},
    unlockedBadgeIds: ['badge_first_discovery'],
    creativeProjects: [],
    oasisItems: [
      {
        instanceId: 'init-sprout',
        itemId: 'oasis_plant',
        zone: 'learning_garden',
        slotIndex: 0,
      },
    ],
    completedUnpluggedIds: [],
    worldXpEarned: 0,
  };
}

export function loadChildPlatformState(childId: string): ChildWholePlatformState {
  if (typeof window === 'undefined') return createDefaultChildPlatformState(childId);
  try {
    const raw = window.localStorage.getItem(`${PLATFORM_STATE_STORAGE_PREFIX}${childId}`);
    if (!raw) return createDefaultChildPlatformState(childId);
    const parsed = JSON.parse(raw) as ChildWholePlatformState;
    const base = createDefaultChildPlatformState(childId);
    return {
      ...base,
      ...parsed,
      adaptiveByWorld: {
        ...base.adaptiveByWorld,
        ...(parsed.adaptiveByWorld || {}),
      },
      assessmentsByWorld: parsed.assessmentsByWorld || {},
      unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds)
        ? parsed.unlockedBadgeIds
        : base.unlockedBadgeIds,
      creativeProjects: Array.isArray(parsed.creativeProjects) ? parsed.creativeProjects : [],
      oasisItems: Array.isArray(parsed.oasisItems) ? parsed.oasisItems : base.oasisItems,
      completedUnpluggedIds: Array.isArray(parsed.completedUnpluggedIds)
        ? parsed.completedUnpluggedIds
        : [],
    };
  } catch {
    return createDefaultChildPlatformState(childId);
  }
}

export function saveChildPlatformState(state: ChildWholePlatformState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      `${PLATFORM_STATE_STORAGE_PREFIX}${state.childId}`,
      JSON.stringify(state)
    );
    window.dispatchEvent(new Event('smartcoders:whole-child-updated'));
  } catch (e) {
    console.error('Failed to save child platform state:', e);
  }
}

/**
 * Rule-Based Adaptive Engine: Adjusts pace mode based on real accuracy and retries without shaming the child.
 */
export function computeAdaptivePace(rec: AdaptivePerformanceRecord): AdaptivePaceMode {
  const total = rec.correctAttempts + rec.incorrectAttempts;
  if (total < 3) return 'steady';
  const accuracy = rec.correctAttempts / total;
  if (accuracy >= 0.85 && rec.retries <= 1) return 'challenge_boost';
  if (accuracy < 0.6 || rec.retries >= 3) return 'simplify';
  return 'steady';
}

export function recordWorldInteractionEvent(
  state: ChildWholePlatformState,
  worldId: EducationalWorldId,
  event: {
    correctDelta?: number;
    incorrectDelta?: number;
    retryDelta?: number;
    hintDelta?: number;
    completedModuleId?: string;
    xpReward?: number;
    badgeId?: string;
  }
): {
  nextState: ChildWholePlatformState;
  xpAwarded: number;
  newlyUnlockedBadge: BadgeDefinition | null;
} {
  const current = state.adaptiveByWorld[worldId] || createDefaultAdaptiveRecord();
  const alreadyCompletedModule =
    event.completedModuleId && current.completedModuleIds.includes(event.completedModuleId);

  const nextCompletedModules =
    event.completedModuleId && !alreadyCompletedModule
      ? [...current.completedModuleIds, event.completedModuleId]
      : current.completedModuleIds;

  const updatedRec: AdaptivePerformanceRecord = {
    correctAttempts: current.correctAttempts + (event.correctDelta || 0),
    incorrectAttempts: current.incorrectAttempts + (event.incorrectDelta || 0),
    retries: current.retries + (event.retryDelta || 0),
    hintsUsed: current.hintsUsed + (event.hintDelta || 0),
    completedModuleIds: nextCompletedModules,
    paceMode: 'steady',
  };
  updatedRec.paceMode = computeAdaptivePace(updatedRec);

  // Prevent duplicate XP farming when replaying an already completed module
  let xpAwarded = !alreadyCompletedModule && event.xpReward ? event.xpReward : 0;

  let nextBadges = [...state.unlockedBadgeIds];
  let newlyUnlockedBadge: BadgeDefinition | null = null;
  if (event.badgeId && !nextBadges.includes(event.badgeId)) {
    nextBadges.push(event.badgeId);
    const badgeDef = AWARDABLE_BADGES.find((b) => b.id === event.badgeId) || null;
    if (badgeDef) {
      newlyUnlockedBadge = badgeDef;
      xpAwarded += badgeDef.xpBonus;
    }
  }

  const nextState: ChildWholePlatformState = {
    ...state,
    adaptiveByWorld: {
      ...state.adaptiveByWorld,
      [worldId]: updatedRec,
    },
    unlockedBadgeIds: nextBadges,
    worldXpEarned: (state.worldXpEarned || 0) + xpAwarded,
  };

  saveChildPlatformState(nextState);
  return { nextState, xpAwarded, newlyUnlockedBadge };
}

/**
 * Computes holistic mastery percentage (0..100) for a given World combining:
 * - Completed levels inside mapped chapters
 * - Specialized modules completed
 * - World assessment quiz score
 */
export function computeWorldMasteryPct(
  world: EducationalWorldDefinition,
  chapterProgress: ChildChapterLibraryProgress,
  platformState: ChildWholePlatformState,
  chapterLibraries: Array<{ chapterId: number; games: Array<{ id: string; levels: Array<{ id: string }> }> }>
): {
  pct: number;
  completedChaptersLevels: number;
  totalChaptersLevels: number;
  completedModulesCount: number;
  totalModulesCount: number;
  assessmentScore: number | null;
  paceMode: AdaptivePaceMode;
} {
  let completedChaptersLevels = 0;
  let totalChaptersLevels = 0;

  world.mappedChapterIds.forEach((chId) => {
    const ch = chapterLibraries.find((c) => c.chapterId === chId);
    if (ch) {
      ch.games.forEach((g) => {
        totalChaptersLevels += g.levels.length;
        const gp = chapterProgress.games[g.id];
        if (gp) {
          completedChaptersLevels += gp.completedLevels.length;
        }
      });
    }
  });

  const rec = platformState.adaptiveByWorld[world.id] || createDefaultAdaptiveRecord();
  const totalModulesCount = world.specializedModules.length;
  const completedModulesCount = world.specializedModules.filter((m) =>
    rec.completedModuleIds.includes(m.id)
  ).length;

  const assess = platformState.assessmentsByWorld[world.id];
  const assessmentScore = assess ? assess.scorePct : null;

  // Weighted mastery computation
  let signals = 0;
  let scoreSum = 0;

  if (totalChaptersLevels > 0) {
    // At early engagement, scale gracefully so finishing a few levels registers real progress
    const chapterPct = Math.min(100, Math.round((completedChaptersLevels / Math.max(1, Math.min(12, totalChaptersLevels))) * 100));
    scoreSum += chapterPct;
    signals += 1;
  }

  if (totalModulesCount > 0) {
    const modPct = Math.round((completedModulesCount / totalModulesCount) * 100);
    scoreSum += modPct;
    signals += 1;
  }

  if (assessmentScore !== null) {
    scoreSum += assessmentScore;
    signals += 1;
  }

  const pct = signals > 0 ? Math.min(100, Math.round(scoreSum / signals)) : 0;

  return {
    pct,
    completedChaptersLevels,
    totalChaptersLevels,
    completedModulesCount,
    totalModulesCount,
    assessmentScore,
    paceMode: rec.paceMode,
  };
}

/**
 * Dual-mode Smarty Robot Companion dialogue generator (Mode A: Learning Guide | Mode B: Adventure Companion)
 */
export function getSmartyContextualDialogue(params: {
  mode: 'guide' | 'adventure';
  language: Language;
  ageGroup: JuniorAgeGroup;
  worldId?: EducationalWorldId;
  situation: 'welcome' | 'hint' | 'encourage_retry' | 'celebrate' | 'unlock_world' | 'oasis';
  childName?: string;
}): string {
  const { mode, language, ageGroup, worldId, situation, childName = '' } = params;
  const isAr = language === 'ar';
  const nameTag = childName ? (isAr ? ` يا ${childName}` : ` ${childName}`) : '';

  if (mode === 'adventure') {
    if (situation === 'oasis') {
      return isAr
        ? `مرحباً${nameTag} في واحة سمارتي الشخصية! كل نجمة علمية تكسبها تزيّن عالمك الجميل بأدوات ذكية!`
        : `Welcome${nameTag} to your Personal Smarty Oasis! Every star you earn unlocks new decorations!`;
    }
    if (situation === 'unlock_world') {
      return isAr
        ? `انطلاقة رائعة${nameTag}! سمارتي مستعد لمرافقتك في استكشاف تحديات هذا العالم الجديد!`
        : `Awesome launch${nameTag}! Smarty is ready to explore this world adventure with you!`;
    }
    if (situation === 'celebrate') {
      return isAr
        ? `يا بطل${nameTag}! إنجازك اليوم أنار لوحة الطاقة في معمل سمارتي!`
        : `Heroic work${nameTag}! Today's achievement powered up Smarty's lab beacon!`;
    }
  }

  if (situation === 'hint') {
    return ageGroup === '3-4'
      ? isAr
        ? 'انظر جيداً إلى الألوان والأشكال الكبيرة المضيئة، وجرّب خطوة واحدة بهدوء!'
        : 'Look at the big bright colors and shapes, and try one calm step!'
      : isAr
      ? 'فكّر في الخطوة الأولى أولاً وتأكد من الترتيب قبل الاختيار!'
      : 'Think about the very first step and verify the order before choosing!';
  }

  if (situation === 'encourage_retry') {
    return isAr
      ? `محاولة شجاعة${nameTag}! الأخطاء تساعد عقولنا على النمو، هيا نجرب معاً بطريقة أسهل!`
      : `Brave try${nameTag}! Mistakes help our brains grow—let's try together!`;
  }

  if (situation === 'celebrate') {
    return isAr
      ? `ممتاز${nameTag}! لقد حققت الهدف المطلوب بإتقان وذكاء!`
      : `Excellent${nameTag}! You achieved the learning goal brilliantly!`;
  }

  const worldGreetingAr: Record<EducationalWorldId, string> = {
    world_digital: `هيا نتعرف معاً على أسرار الكمبيوتر والفأرة والأمان الرقمي${nameTag}!`,
    world_brain: `أهلاً بك في عالم التفكير${nameTag}! لنشغل ذاكرتنا ونحل الألغاز الذكية.`,
    world_math_lang: `مرحباً${nameTag} في مختبر الأرقام والحروف العربية الممتع!`,
    world_coding: `استعد لبرمجة خطوات سمارتي واكتشاف الأخطاء والحلقات${nameTag}!`,
    world_creative: `أطلق خيالك${nameTag}! ارسم واصنع قصتك وألعابك المتحركة هنا.`,
    world_stem: `أهلاً بالعالم الصغير${nameTag}! هيا نجرب التوازن والهندسة والطبيعة.`,
    world_lifeskills: `هيا نتعلم معاً اللطف والمشاركة وترتيب يومنا بسعادة${nameTag}!`,
  };

  const worldGreetingEn: Record<EducationalWorldId, string> = {
    world_digital: `Let's discover mouse control and digital safety together${nameTag}!`,
    world_brain: `Welcome to Brain World${nameTag}! Let's sharpen memory and pattern logic.`,
    world_math_lang: `Welcome${nameTag} to the Math Counting & Arabic Language Lab!`,
    world_coding: `Ready to code Smarty's path, debug bugs, and build loops${nameTag}!`,
    world_creative: `Unleash your imagination${nameTag}! Draw, mix colors, and animate stories.`,
    world_stem: `Welcome Junior Scientist${nameTag}! Let's test balance, bridges, and weather.`,
    world_lifeskills: `Let's practice kindness, sharing, and healthy daily routines${nameTag}!`,
  };

  if (worldId) {
    return isAr ? worldGreetingAr[worldId] : worldGreetingEn[worldId];
  }

  return isAr
    ? `أهلاً بك${nameTag} في خريطة العوالم السبعة! اختر عالماً لنبدأ مغامرة التعلم اليوم.`
    : `Welcome${nameTag} to the Seven Worlds Map! Pick a world to start today's adventure.`;
}

/**
 * Synthesizes clear Arabic or English speech without throwing in headless browsers
 */
export function speakChildFriendly(text: string, language: Language, muted = false): void {
  if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  } catch {
    // Headless safe fallback
  }
}

export function getSummarizedChildMastery(child: ChildProfileRecord): {
  overallPct: number;
  strengths: Array<{ ar: string; en: string }>;
  needsPractice: Array<{ ar: string; en: string }>;
  completedModulesCount: number;
  creativeProjectsCount: number;
  assessmentsCount: number;
  badgesCount: number;
} {
  const pState = loadChildPlatformState(child.id);
  const strengths: Array<{ ar: string; en: string }> = [];
  const needsPractice: Array<{ ar: string; en: string }> = [];

  let completedModulesCount = 0;
  let totalScoreSum = 0;
  let scoredWorlds = 0;

  SEVEN_EDUCATIONAL_WORLDS.forEach((w) => {
    const rec = pState.adaptiveByWorld[w.id];
    const assess = pState.assessmentsByWorld[w.id];
    completedModulesCount += rec.completedModuleIds.length;
    const totalAttempts = rec.correctAttempts + rec.incorrectAttempts;

    if (assess) {
      totalScoreSum += assess.scorePct;
      scoredWorlds += 1;
      if (assess.scorePct >= 70) {
        strengths.push(w.title);
      } else {
        needsPractice.push(w.title);
      }
    } else if (totalAttempts > 0) {
      const acc = Math.round((rec.correctAttempts / totalAttempts) * 100);
      totalScoreSum += acc;
      scoredWorlds += 1;
      if (acc >= 75) strengths.push(w.title);
      else if (acc < 60) needsPractice.push(w.title);
    }
  });

  // Include chapter levels completed as baseline engagement signal
  const stageEngagement = Math.min(100, child.completedStageIds.length * 12);
  const overallPct =
    scoredWorlds > 0
      ? Math.round((totalScoreSum / scoredWorlds + stageEngagement) / 2)
      : stageEngagement;

  return {
    overallPct,
    strengths,
    needsPractice,
    completedModulesCount,
    creativeProjectsCount: pState.creativeProjects.length,
    assessmentsCount: Object.keys(pState.assessmentsByWorld).length,
    badgesCount: pState.unlockedBadgeIds.length,
  };
}
