import { JuniorAgeGroup } from '../types';

export type ChapterLevelBand =
  | 'beginner'      // Levels 1–3
  | 'easy'          // Levels 4–6
  | 'intermediate'  // Levels 7–9
  | 'advanced'      // Levels 10–12
  | 'challenge';    // Levels 13–15

export type ChapterEngineKind =
  | 'pointer_target'     // Aiming, hovering, clicking, tracking, precision targets
  | 'spatial_assembly'   // Shape builder, picture puzzle, missing piece, shadow match, sorting
  | 'memory_grid'        // Flip & remember pairs / spatial locations
  | 'pattern_sequence'   // Odd-one-out, pattern completion, repeat dance, loop builder
  | 'direction_compass'  // Arrow tracking, compass navigation, treasure directions
  | 'grid_navigator'     // Maze escape, package delivery, bridge crossing, star collection
  | 'code_sequencer'     // Block sequencing, loop blocks, algorithmic steps
  | 'code_debugger'      // Spot the bug, replace wrong arrow, insert missing command
  | 'event_sandbox';     // Event triggers, interactive story, animation builder, creator lab

export type DifficultyBand = ChapterLevelBand;

export interface ChapterLevelSpec {
  id: string;
  levelNumber: number; // 1..15
  band?: ChapterLevelBand;
  difficulty: ChapterLevelBand;
  title: { ar: string; en: string };
  objective?: { ar: string; en: string };
  instruction: { ar: string; en: string };
  hint: { ar: string; en: string };
  demoCaption?: { ar: string; en: string };
  xpReward: number;
  starsReward?: number;
  starsMax?: number;
  /** Number of items / steps / targets in this level (scales 1..15) */
  itemsCount: number;
  /** Grid size or complexity parameter */
  gridSize: number;
  targetSteps?: number;
  specialChallenge?: boolean;
  /** Whether hints are automatically highlighted */
  autoHint?: boolean;
  /** Optional custom rule modifier for higher bands */
  ruleModifier: string;
  /** Age-group pedagogical adaptation */
  ageAdaptation?: Record<
    JuniorAgeGroup,
    {
      stepReduction: number;
      showVisualGuide: boolean;
      promptPrefix: { ar: string; en: string };
    }
  >;
}

export type ChapterGameLevel = ChapterLevelSpec;

export interface ChapterLibraryGame {
  id: string;
  chapterId: number;
  chapterNumber?: number;
  order: number;
  title: { ar: string; en: string };
  categoryLabel?: { ar: string; en: string };
  skillTargeted: { ar: string; en: string };
  description: { ar: string; en: string };
  icon?: string;
  iconName?: string;
  accentColor: string;
  engineKind: ChapterEngineKind;
  subMode: string;
  isEnabled?: boolean;
  enabled: boolean;
  completionBonusXp?: number;
  xpBonusCompletion: number;
  levels: ChapterLevelSpec[];
}

export type ChapterGameDefinition = ChapterLibraryGame;

export interface ChapterLibraryDefinition {
  id: string;
  chapterId: number;
  chapterNumber: number;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string;
  accentColor: string;
  themeGradient: string;
  targetSkills: { ar: string[]; en: string[] };
  games: ChapterLibraryGame[];
}

export interface ChildChapterSingleGameProgress {
  gameId: string;
  unlockedLevel: number;
  completedLevels: number[];
  starsByLevel: Record<number, number>;
  earnedXp: number;
  attemptsByLevel: Record<number, number>;
}

export interface ChildChapterLibraryProgress {
  childId: string;
  games: Record<string, ChildChapterSingleGameProgress>;
}

export interface ChildChapterGameRecord {
  completedLevelNumbers: number[];
  unlockedLevelNumber: number;
  attemptsByLevel: Record<number, number>;
  bestAccuracyByLevel: Record<number, number>;
  bestStarsByLevel: Record<number, number>;
  gameCompletionBonusClaimed?: boolean;
}

export type ChildChapterProgressMap = Record<
  string, // childId
  Record<string, ChildChapterGameRecord> // gameId -> record
>;

export const CHAPTER_LIBRARY_STORAGE_KEY = 'smartcoders_chapter_library_v1';
export const CHAPTER_CHILD_PROGRESS_KEY = 'smartcoders_chapter_child_progress_v1';

export const DIFFICULTY_BAND_META: Record<
  ChapterLevelBand,
  { ar: string; en: string; levelsRange: string; badgeClass: string; baseXp: number }
> = {
  beginner: {
    ar: 'مبتدئ',
    en: 'Beginner',
    levelsRange: '1–3',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    baseXp: 15,
  },
  easy: {
    ar: 'سهل',
    en: 'Easy',
    levelsRange: '4–6',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    baseXp: 20,
  },
  intermediate: {
    ar: 'متوسط',
    en: 'Intermediate',
    levelsRange: '7–9',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    baseXp: 25,
  },
  advanced: {
    ar: 'متقدم',
    en: 'Advanced',
    levelsRange: '10–12',
    badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    baseXp: 35,
  },
  challenge: {
    ar: 'تحدي الأبطال',
    en: 'Challenge',
    levelsRange: '13–15',
    badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    baseXp: 50,
  },
};

const BAND_META: Record<
  ChapterLevelBand,
  { ar: string; en: string; baseXp: number; autoHint: boolean; rule: string }
> = {
  beginner: { ar: 'مبتدئ (Beginner)', en: 'Beginner', baseXp: 15, autoHint: true, rule: 'none' },
  easy: { ar: 'سهل (Easy)', en: 'Easy', baseXp: 20, autoHint: true, rule: 'obstacles' },
  intermediate: { ar: 'متوسط (Intermediate)', en: 'Intermediate', baseXp: 25, autoHint: false, rule: 'key_gate' },
  advanced: { ar: 'متقدم (Advanced)', en: 'Advanced', baseXp: 35, autoHint: false, rule: 'multi_goal' },
  challenge: { ar: 'تحدي الأبطال (Challenge)', en: 'Challenge', baseXp: 50, autoHint: false, rule: 'master_boss' },
};

export function getBandForLevelNumber(levelNumber: number): ChapterLevelBand {
  if (levelNumber <= 3) return 'beginner';
  if (levelNumber <= 6) return 'easy';
  if (levelNumber <= 9) return 'intermediate';
  if (levelNumber <= 12) return 'advanced';
  return 'challenge';
}

/**
 * Generates 15 progressively challenging, pedagogically structured levels for a game.
 */
export function build15LevelsForGame(
  gameId: string,
  gameTitle: { ar: string; en: string },
  skill: { ar: string; en: string },
  engineKind: ChapterEngineKind,
  subMode: string
): ChapterLevelSpec[] {
  return Array.from({ length: 15 }, (_, idx) => {
    const levelNumber = idx + 1;
    const band = getBandForLevelNumber(levelNumber);
    const meta = BAND_META[band];

    const itemsCount =
      band === 'beginner'
        ? 2 + (idx % 2)
        : band === 'easy'
        ? 3 + (idx % 2)
        : band === 'intermediate'
        ? 4 + (idx % 2)
        : band === 'advanced'
        ? 5 + (idx % 2)
        : 6 + (idx % 2);

    const gridSize =
      band === 'beginner'
        ? 3
        : band === 'easy'
        ? 4
        : band === 'intermediate'
        ? 4
        : band === 'advanced'
        ? 5
        : 5;

    const ruleDescAr =
      meta.rule === 'none'
        ? 'خطوات مباشرة مع إرشاد بصري واضح'
        : meta.rule === 'obstacles'
        ? 'تجنب العوائق الإضافية أثناء الحل'
        : meta.rule === 'key_gate'
        ? 'تفعيل المفتاح الذكي قبل الوصول للهدف'
        : meta.rule === 'multi_goal'
        ? 'تحقيق هدفين مترابطين في نفس المستوى'
        : 'تحدي شامل بدون تلميحات تلقائية وبأقل عدد خطوات';

    const ruleDescEn =
      meta.rule === 'none'
        ? 'Direct steps with clear visual guidance'
        : meta.rule === 'obstacles'
        ? 'Avoid additional obstacles while solving'
        : meta.rule === 'key_gate'
        ? 'Activate the smart switch before reaching the goal'
        : meta.rule === 'multi_goal'
        ? 'Complete two linked objectives in the same level'
        : 'Master challenge with minimal hints and optimal steps';

    return {
      id: `${gameId}-lvl-${levelNumber}`,
      levelNumber,
      band,
      difficulty: band,
      title: {
        ar: `المستوى ${levelNumber} (${meta.ar}): ${gameTitle.ar}`,
        en: `Level ${levelNumber} (${meta.en}): ${gameTitle.en}`,
      },
      objective: {
        ar: `${skill.ar} — ${ruleDescAr} (${itemsCount} عناصر/خطوات).`,
        en: `${skill.en} — ${ruleDescEn} (${itemsCount} items/steps).`,
      },
      instruction: {
        ar:
          engineKind === 'pointer_target'
            ? `المستوى ${levelNumber}: تفاعل بدقة مع ${itemsCount} أهداف ذكية لإتمام التحدي!`
            : engineKind === 'spatial_assembly'
            ? `المستوى ${levelNumber}: طابق وركّب ${itemsCount} قطع هندسية في أماكنها الصحيحة!`
            : engineKind === 'memory_grid'
            ? `المستوى ${levelNumber}: احفظ مواقع البطاقات واكشف جميع الأزواج المتطابقة!`
            : engineKind === 'pattern_sequence'
            ? `المستوى ${levelNumber}: اكتشف قاعدة النمط وأكمل السلسلة المكونة من ${itemsCount} عناصر!`
            : engineKind === 'direction_compass'
            ? `المستوى ${levelNumber}: اتبع البوصلة والأسهم لتوجيه الروبوت في ${itemsCount} خطوات اتجاهية!`
            : engineKind === 'grid_navigator'
            ? `المستوى ${levelNumber}: قُد الروبوت سمارتي عبر الخريطة (${gridSize}×${gridSize}) نحو الهدف!`
            : engineKind === 'code_sequencer'
            ? `المستوى ${levelNumber}: ابنِ تسلسلاً برمجياً من ${itemsCount} أوامر لتنفيذ المهمة!`
            : engineKind === 'code_debugger'
            ? `المستوى ${levelNumber}: افحص الكود البرمجي، اكتشف الخطأ في التسلسل، وقم بإصلاحه!`
            : `المستوى ${levelNumber}: اربط الأزرار بالأحداث التفاعلية وشغّل مشروعك الإبداعي!`,
        en:
          engineKind === 'pointer_target'
            ? `Level ${levelNumber}: Interact accurately with ${itemsCount} smart targets to complete the mission!`
            : engineKind === 'spatial_assembly'
            ? `Level ${levelNumber}: Match and assemble ${itemsCount} spatial pieces into their slots!`
            : engineKind === 'memory_grid'
            ? `Level ${levelNumber}: Memorize card positions and reveal all matching pairs!`
            : engineKind === 'pattern_sequence'
            ? `Level ${levelNumber}: Spot the pattern rule and complete the ${itemsCount}-item sequence!`
            : engineKind === 'direction_compass'
            ? `Level ${levelNumber}: Follow the compass arrows to guide the robot across ${itemsCount} directional steps!`
            : engineKind === 'grid_navigator'
            ? `Level ${levelNumber}: Navigate Smarty Robot across the (${gridSize}×${gridSize}) map to the goal!`
            : engineKind === 'code_sequencer'
            ? `Level ${levelNumber}: Build a ${itemsCount}-command program sequence to complete the mission!`
            : engineKind === 'code_debugger'
            ? `Level ${levelNumber}: Inspect the broken code sequence, find the bug, and fix it!`
            : `Level ${levelNumber}: Connect buttons to interactive events and run your creative project!`,
      },
      hint: {
        ar: `تلميح سمارتي (المستوى ${levelNumber}): ركّز على الهدف الأول ثم انتقل خطوة بخطوة (${ruleDescAr}).`,
        en: `Smarty Hint (Level ${levelNumber}): Focus on the first step and proceed one by one (${ruleDescEn}).`,
      },
      demoCaption: {
        ar: `شاهد كيف يحل الروبوت سمارتي خطوة البداية في "${gameTitle.ar}" (${subMode}).`,
        en: `Watch how Smarty Robot solves the opening step in "${gameTitle.en}" (${subMode}).`,
      },
      xpReward: meta.baseXp,
      starsReward: band === 'challenge' ? 3 : band === 'advanced' ? 3 : 2,
      starsMax: 3,
      itemsCount,
      gridSize,
      targetSteps: itemsCount,
      specialChallenge: band === 'challenge',
      autoHint: meta.autoHint,
      ruleModifier: meta.rule,
      ageAdaptation: {
        '3-4': {
          stepReduction: 1,
          showVisualGuide: true,
          promptPrefix: { ar: 'للمستكشف الصغير (3-4): ', en: 'Little Explorer (3-4): ' },
        },
        '4-5': {
          stepReduction: 0,
          showVisualGuide: levelNumber <= 9,
          promptPrefix: { ar: 'للمكتشف الذكي (4-5): ', en: 'Smart Discoverer (4-5): ' },
        },
        '5-6': {
          stepReduction: 0,
          showVisualGuide: levelNumber <= 3,
          promptPrefix: { ar: 'للمبدع المبرمج (5-6): ', en: 'Creator Coder (5-6): ' },
        },
      },
    };
  });
}

const ACCENT_HEX_MAP: Record<string, string> = {
  red: '#ef4444',
  amber: '#f59e0b',
  emerald: '#10b981',
  sky: '#06b6d4',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  rose: '#f43f5e',
  teal: '#14b8a6',
};

function makeGame(
  _chapterIdStr: string,
  chapterNumber: number,
  order: number,
  id: string,
  titleAr: string,
  titleEn: string,
  catAr: string,
  catEn: string,
  skillAr: string,
  skillEn: string,
  descAr: string,
  descEn: string,
  icon: string,
  accentColor: string,
  engineKind: ChapterEngineKind,
  subMode: string
): ChapterLibraryGame {
  return {
    id,
    chapterId: chapterNumber,
    chapterNumber,
    order,
    title: { ar: titleAr, en: titleEn },
    categoryLabel: { ar: catAr, en: catEn },
    skillTargeted: { ar: skillAr, en: skillEn },
    description: { ar: descAr, en: descEn },
    icon,
    iconName: icon,
    accentColor: ACCENT_HEX_MAP[accentColor] || accentColor,
    engineKind,
    subMode,
    isEnabled: true,
    enabled: true,
    completionBonusXp: 100,
    xpBonusCompletion: 100,
    levels: build15LevelsForGame(
      id,
      { ar: titleAr, en: titleEn },
      { ar: skillAr, en: skillEn },
      engineKind,
      subMode
    ),
  };
}

const RAW_CHAPTER_LIBRARIES: Array<
  Omit<ChapterLibraryDefinition, 'chapterId' | 'themeGradient'> & {
    chapterId?: number;
    themeGradient?: string;
  }
> = [
  // =========================================================================
  // CHAPTER 1: Mouse & Computer Interaction (8 Distinct Games × 15 Levels)
  // =========================================================================
  {
    id: 'ch-1',
    chapterNumber: 1,
    title: { ar: 'الفصل 1: التفاعل مع الفأرة والكمبيوتر', en: 'Chapter 1: Mouse & Computer Interaction' },
    subtitle: { ar: '8 ألعاب تفاعلية · 120 مستوى متدرج', en: '8 Interactive Games · 120 Progressive Levels' },
    description: {
      ar: 'مكتبة متكاملة لتعليم التحكم الدقيق بالمؤشر، النقر الفردي والمزدوج، التتبع، والسحب والإفلات.',
      en: 'Complete game library for pointer control, single/double clicking, path tracking, and drag & drop.',
    },
    icon: 'MousePointer',
    accentColor: 'red',
    targetSkills: {
      ar: ['تحريك المؤشر', 'النقر الدقيق', 'النقر المزدوج', 'السحب والإفلات', 'التآزر البصري الحركي'],
      en: ['Pointer Control', 'Precision Clicking', 'Double Clicking', 'Drag & Drop', 'Hand-Eye Coordination'],
    },
    games: [
      makeGame('ch-1', 1, 1, 'ch1-pointer-safari', 'سفاري المؤشر الذكي (Pointer Safari)', 'Pointer Safari', 'تتبع واستكشاف', 'Hover & Track', 'تحريك المؤشر فوق الأهداف المضيئة', 'Hovering pointer over glowing targets', 'حرّك الفأرة فوق عناصر الطاقة المضيئة لشحنها بالترتيب.', 'Move the pointer over glowing energy nodes to charge them in order.', 'Compass', 'red', 'pointer_target', 'hover_safari'),
      makeGame('ch-1', 1, 2, 'ch1-bubble-clicker', 'فقاعات النقر السريع (Bubble Clicker)', 'Bubble Clicker', 'تحدي النقر', 'Click Challenge', 'النقر المباشر السريع والدقيق', 'Fast & accurate single clicking', 'انقر على الفقاعات الرقمية المطلوبة قبل اختفائها.', 'Click the requested digital bubbles accurately.', 'Sparkles', 'sky', 'pointer_target', 'bubble_click'),
      makeGame('ch-1', 1, 3, 'ch1-double-tap-stars', 'نجوم النقر المزدوج (Double-Tap Stars)', 'Double-Tap Stars', 'مهارة متقدمة', 'Double Click', 'إتقان النقر المزدوج لفتح الصناديق', 'Master double-clicking to unlock star chests', 'افتح كبسولات النجوم بالنقر السريع المتتالي.', 'Open star capsules with rapid activation clicks.', 'Star', 'amber', 'pointer_target', 'double_tap'),
      makeGame('ch-1', 1, 4, 'ch1-drag-drop-bridge', 'جسر السحب والإفلات (Drag & Drop Bridge)', 'Drag & Drop Bridge', 'سحب وإفلات', 'Drag & Drop', 'سحب القطع الهندسية لبناء الجسر', 'Drag structural blocks to build the bridge', 'اسحب القطع المفقودة وضعها في مكانها ليعبر الروبوت سمارتي.', 'Drag missing bridge blocks into place so Smarty can cross.', 'Wrench', 'emerald', 'spatial_assembly', 'bridge_builder'),
      makeGame('ch-1', 1, 5, 'ch1-laser-path-tracer', 'مسار الليزر الضوئي (Laser Path Tracer)', 'Laser Path Tracer', 'تتبع المسار', 'Path Tracing', 'تتبع المسارات المنحنية والهندسية بالماوس', 'Trace curved and geometric laser paths', 'تتبع نقاط المسار الضوئي نقطة تلو الأخرى دون الخروج عن الخط.', 'Trace the glowing laser path nodes one by one without going off-track.', 'Zap', 'indigo', 'pointer_target', 'path_tracer'),
      makeGame('ch-1', 1, 6, 'ch1-hardware-sorter', 'فرز أجزاء الكمبيوتر (Hardware Sorter)', 'Hardware Sorter', 'تصنيف ومطابقة', 'Classification', 'التعرف على وحدات الإدخال والإخراج', 'Identify input and output computer parts', 'صنّف الفأرة، لوحة المفاتيح، الشاشة، والمعالج في أماكنها الصحيحة.', 'Sort mouse, keyboard, screen, and CPU into their proper bays.', 'Cpu', 'purple', 'spatial_assembly', 'hardware_sort'),
      makeGame('ch-1', 1, 7, 'ch1-precision-archer', 'قناص الأهداف الدقيقة (Precision Target)', 'Precision Target', 'دقة التصويب', 'Precision Aim', 'التحكم الدقيق في الأهداف الصغيرة والمتحركة', 'Fine motor control on precision targets', 'صوّب المؤشر نحو الهدف المركزي المحدد في كل جولة.', 'Aim the pointer at the exact target emblem in each round.', 'Target', 'rose', 'pointer_target', 'precision_aim'),
      makeGame('ch-1', 1, 8, 'ch1-mouse-commander', 'القائد الرقمي للماوس (Mouse Commander)', 'Mouse Commander', 'مهمة شاملة', 'Master Mission', 'دمج التمرير والنقر والسحب في مهمة واحدة', 'Combine hover, click, and drag in one mission', 'مهمة متكاملة تجمع كل مهارات الفأرة لتشغيل مركز القيادة!', 'Complete multi-step mission combining hover, click, and drag!', 'Award', 'teal', 'pointer_target', 'commander_combo'),
    ],
  },

  // =========================================================================
  // CHAPTER 2: Puzzle Studio (Exact 8 Games Requested × 15 Levels = 120 Levels)
  // =========================================================================
  {
    id: 'ch-2',
    chapterNumber: 2,
    title: { ar: 'الفصل 2: استوديو الألغاز (Puzzle Studio)', en: 'Chapter 2: Puzzle Studio' },
    subtitle: { ar: '8 ألعاب ألغاز متنوعة · 120 مستوى متدرج', en: '8 Distinct Puzzle Games · 120 Progressive Levels' },
    description: {
      ar: 'مكتبة ألغاز متكاملة تشمل تركيب الأشكال، تجميع الصور، الجزء الناقص، الظلال، الأنماط، الذاكرة، التصنيف، ومغامرة الألغاز.',
      en: 'Complete puzzle library featuring Shape Builder, Picture Puzzle, Missing Piece, Shadow Matching, Pattern Detective, Memory Challenge, Shape Sorting, and Puzzle Adventure.',
    },
    icon: 'Puzzle',
    accentColor: 'indigo',
    targetSkills: {
      ar: ['التركيب المكاني', 'تجميع الصور', 'استنتاج الجزء الناقص', 'مطابقة الظلال', 'الذاكرة البصرية', 'تصنيف الأشكال'],
      en: ['Spatial Construction', 'Picture Assembly', 'Missing Piece Deduction', 'Shadow Matching', 'Visual Memory', 'Shape Sorting'],
    },
    games: [
      makeGame('ch-2', 2, 1, 'ch2-shape-builder', '1. باني الأشكال (Shape Builder)', '1. Shape Builder', 'تركيب هندسي', 'Creative Building', 'تركيب الأشكال الهندسية لتكوين مجسمات', 'Combine geometric shapes to construct objects', 'ركّب المربعات والمثلثات والدوائر لبناء مركبات ومباني ذكية.', 'Assemble squares, triangles, and circles to build smart vehicles and structures.', 'Shapes', 'amber', 'spatial_assembly', 'shape_builder'),
      makeGame('ch-2', 2, 2, 'ch2-picture-puzzle', '2. لغز الصور المقطعة (Picture Puzzle)', '2. Picture Puzzle', 'تجميع الصور', 'Picture Jigsaw', 'تجميع أجزاء الصورة المقطعة في شبكة متكاملة', 'Assemble sliced picture tiles into a complete scene', 'رتّب أجزاء الصورة المبعثرة لإعادة تكوين مشهد معمل الروبوتات.', 'Place sliced image tiles into the grid to reconstruct the robotics scene.', 'Puzzle', 'indigo', 'spatial_assembly', 'picture_puzzle'),
      makeGame('ch-2', 2, 3, 'ch2-missing-piece', '3. الجزء الناقص (Missing Piece)', '3. Missing Piece', 'استنتاج بصري', 'Visual Deduction', 'اكتشاف القطعة المفقودة التي تكمل الرسم', 'Identify the missing piece that completes the blueprint', 'افحص المخطط الهندسي واختر القطعة الدقيقة التي تكمل الفراغ.', 'Inspect the blueprint and select the exact piece that fills the missing gap.', 'Search', 'rose', 'spatial_assembly', 'missing_piece'),
      makeGame('ch-2', 2, 4, 'ch2-shadow-matching', '4. مطابقة الظلال (Shadow Matching)', '4. Shadow Matching', 'تمييز بصري', 'Shadow Match', 'مطابقة المجسمات مع ظلالها السوداء المطابقة', 'Match 3D-styled objects with their exact silhouettes', 'طابق كل روبوت وأداة هندسية مع الظل المطابق لها في الشكل والحجم.', 'Match each robot and engineering tool with its exact shadow silhouette.', 'Eye', 'purple', 'spatial_assembly', 'shadow_matching'),
      makeGame('ch-2', 2, 5, 'ch2-pattern-detective', '5. محقق الأنماط (Pattern Detective)', '5. Pattern Detective', 'اكتشاف الأنماط', 'Pattern Recognition', 'اكتشاف العنصر المختلف أو المكمل للنمط', 'Detect the odd element or complete the visual pattern', 'شغّل عدسة المحقق الذكي لاكتشاف الشكل الذي يكسر قاعدة النمط أو يكمله!', 'Use your detective lens to spot the odd shape out or complete the pattern rule!', 'Sparkles', 'emerald', 'pattern_sequence', 'pattern_detective'),
      makeGame('ch-2', 2, 6, 'ch2-memory-challenge', '6. تحدي الذاكرة (Memory Challenge)', '6. Memory Challenge', 'الذاكرة البصرية', 'Memory Game', 'تذكر أماكن العناصر المتماثلة ومطابقتها', 'Remember card locations and match identical pairs', 'اقلب البطاقات، احفظ أماكن رموز الروبوتات، وطابق كل زوجين متشابهين!', 'Flip cards, memorize robot symbol locations, and match every identical pair!', 'Brain', 'sky', 'memory_grid', 'memory_challenge'),
      makeGame('ch-2', 2, 7, 'ch2-shape-sorting', '7. تصنيف الأشكال (Shape Sorting)', '7. Shape Sorting', 'تصنيف منطقي', 'Sorting & Logic', 'فرز وتصنيف الأشكال حسب اللون والنوع والحجم', 'Sort and classify shapes by color, type, and rule', 'صنّف العناصر الهندسية داخل الحاويات الذكية وفق القاعدة المطلوبة.', 'Sort geometric items into the smart containers according to the active rule.', 'Layers', 'teal', 'spatial_assembly', 'shape_sorting'),
      makeGame('ch-2', 2, 8, 'ch2-puzzle-adventure', '8. مغامرة الألغاز (Puzzle Adventure)', '8. Puzzle Adventure', 'مغامرة متتابعة', 'Adventure Game', 'حل ألغاز متتابعة لفتح الأبواب والوصول للهدف', 'Solve sequential puzzles to unlock gates and reach the goal', 'رحلة مغامرة متكاملة: حل اللغز البصري لفتح بوابة الجسر والوصول إلى الكنز!', 'Adventure quest: solve sequential visual locks to open the bridge gate and reach the treasure!', 'Compass', 'red', 'grid_navigator', 'puzzle_adventure'),
    ],
  },

  // =========================================================================
  // CHAPTER 3: Direction Explorer (Exact 8 Games Requested × 15 Levels = 120 Levels)
  // =========================================================================
  {
    id: 'ch-3',
    chapterNumber: 3,
    title: { ar: 'الفصل 3: مستكشف الاتجاهات (Direction Explorer)', en: 'Chapter 3: Direction Explorer' },
    subtitle: { ar: '8 ألعاب اتجاهات وحركة · 120 مستوى متدرج', en: '8 Direction & Movement Games · 120 Progressive Levels' },
    description: {
      ar: 'تعلم الاتجاهات (يمين، يسار، أعلى، أسفل) من خلال الحركة والاستكشاف والمتاهات والبحث عن الكنز.',
      en: 'Learn directions (Right, Left, Up, Down) through active movement, exploration, mazes, and treasure hunts.',
    },
    icon: 'Compass',
    accentColor: 'sky',
    targetSkills: {
      ar: ['الاتجاهات الأربعة', 'تتبع الأسهم', 'التنقل داخل الشبكة', 'حل المتاهات الاتجاهية', 'التوجيه المكاني'],
      en: ['Four Cardinal Directions', 'Arrow Following', 'Grid Navigation', 'Directional Mazes', 'Spatial Orientation'],
    },
    games: [
      makeGame('ch-3', 3, 1, 'ch3-follow-the-arrow', '1. اتبع السهم (Follow the Arrow)', '1. Follow the Arrow', 'استجابة اتجاهية', 'Direction Action', 'تتبع سلسلة الأسهم الضوئية وتنفيذ حركتها', 'Follow glowing arrow signals and execute their movement', 'شاهد إشارة السهم المضيء وحرّك الروبوت سمارتي في نفس الاتجاه فوراً!', 'Watch the glowing arrow signal and move Smarty Robot in that exact direction!', 'ArrowRight', 'sky', 'direction_compass', 'follow_arrow'),
      makeGame('ch-3', 3, 2, 'ch3-find-the-direction', '2. اكتشف الاتجاه (Find the Direction)', '2. Find the Direction', 'تحديد الموقع', 'Spatial Compass', 'تحديد الاتجاه الصحيح للوصول إلى الهدف مقارنة بموقع الروبوت', 'Determine the exact direction from the robot to the target', 'انظر إلى موقع النجمة الذهبية مقارنة بسمارتي وحدد السهم الذي يشير إليها!', 'Check where the golden star is relative to Smarty and pick the pointing arrow!', 'Compass', 'amber', 'direction_compass', 'find_direction'),
      makeGame('ch-3', 3, 3, 'ch3-move-the-character', '3. حرّك الشخصية (Move the Character)', '3. Move the Character', 'تحكم حي مباشر', 'Live Control', 'تحريك الروبوت خطوة بخطوة عبر لوحة الاتجاهات التفاعلية', 'Control the robot step-by-step using the live direction pad', 'استخدم أزرار الاتجاهات لتحريك سمارتي خطوة بخطوة وجمع بطاريات الطاقة!', 'Use the live direction controller to move Smarty step-by-step and collect batteries!', 'Gamepad2', 'emerald', 'grid_navigator', 'move_character'),
      makeGame('ch-3', 3, 4, 'ch3-direction-maze', '4. متاهة الاتجاهات (Direction Maze)', '4. Direction Maze', 'متاهة تفاعلية', 'Maze Game', 'الخروج من المتاهة باختيار المنعطفات الصحيحة', 'Navigate through maze corridors by choosing right turns', 'اختر الاتجاه الصحيح عند كل تقاطع داخل المتاهة للوصول إلى المخرج الآمن.', 'Choose the right direction at every maze junction to reach the safe exit.', 'Map', 'indigo', 'grid_navigator', 'direction_maze'),
      makeGame('ch-3', 3, 5, 'ch3-treasure-hunt', '5. البحث عن الكنز (Treasure Hunt)', '5. Treasure Hunt', 'مغامرة استكشاف', 'Adventure Hunt', 'اتباع خريطة البوصلة للعثور على صندوق الكنز المخفي', 'Follow compass clues across the island grid to find hidden treasure', 'اتبع إرشادات خريطة الكنز خطوة بخطوة للوصول إلى الصندوق الذهبي!', 'Follow the treasure map direction clues step-by-step to uncover the golden chest!', 'Sparkles', 'rose', 'grid_navigator', 'treasure_hunt'),
      makeGame('ch-3', 3, 6, 'ch3-follow-the-path', '6. اتبع المسار (Follow the Path)', '6. Follow the Path', 'تسلسل المسار', 'Path Sequence', 'ترتيب أسهم الاتجاهات لمطابقة المسار المرسوم على الأرضية', 'Build the arrow sequence that matches the glowing floor trail', 'انظر إلى المسار المضيء على الأرضية ورتّب الأسهم التي تسير عليه بالضبط.', 'Look at the glowing floor trail and arrange the arrows that trace it accurately.', 'Route', 'teal', 'direction_compass', 'follow_path'),
      makeGame('ch-3', 3, 7, 'ch3-grid-explorer', '7. مستكشف الشبكة (Grid Explorer)', '7. Grid Explorer', 'مسح الشبكة', 'Grid Exploration', 'استكشاف المربعات وزيارة نقاط الفحص بالترتيب', 'Explore grid coordinates and visit checkpoints in order', 'قد الروبوت لزيارة جميع محطات الاستكشاف المرقمة على الشبكة.', 'Guide the robot to visit all numbered exploration stations across the grid.', 'Grid', 'purple', 'grid_navigator', 'grid_explorer'),
      makeGame('ch-3', 3, 8, 'ch3-direction-challenge', '8. تحدي الاتجاهات الكبير (Direction Challenge)', '8. Direction Challenge', 'تحدي شامل', 'Master Challenge', 'التنقل السريع مع الحواجز والبوابات في مسار متكامل', 'Advanced directional navigation with gates and obstacles', 'الاختبار النهائي لمستكشف الاتجاهات: افتح البوابة وتجاوز الحواجز نحو الراية!', 'Ultimate Direction Explorer challenge: unlock the gate and bypass obstacles to the flag!', 'Award', 'red', 'grid_navigator', 'direction_challenge'),
    ],
  },

  // =========================================================================
  // CHAPTER 4: Robot Map Adventures (Exact 8 Games Requested × 15 Levels = 120 Levels)
  // =========================================================================
  {
    id: 'ch-4',
    chapterNumber: 4,
    title: { ar: 'الفصل 4: مغامرات خريطة الروبوت (Robot Map Adventures)', en: 'Chapter 4: Robot Map Adventures' },
    subtitle: { ar: '8 مغامرات خرائط متنوعة · 120 مستوى متدرج', en: '8 Map Adventure Games · 120 Progressive Levels' },
    description: {
      ar: 'مغامرات شيقة لتوجيه الروبوت سمارتي عبر الخرائط، الجسور، المتاهات، مهام الإنقاذ، وتوصيل الطرود.',
      en: 'Exciting map missions guiding Smarty Robot across bridges, mazes, rescue quests, package deliveries, and star collection.',
    },
    icon: 'Map',
    accentColor: 'emerald',
    targetSkills: {
      ar: ['تخطيط المسار', 'تجاوز العقبات', 'فتح الجسور والبوابات', 'جمع الأهداف المتعددة', 'التفكير الخوارزمي المبكر'],
      en: ['Path Planning', 'Obstacle Avoidance', 'Bridge & Gate Activation', 'Multi-Goal Collection', 'Early Algorithmic Thinking'],
    },
    games: [
      makeGame('ch-4', 4, 1, 'ch4-help-the-robot', '1. ساعد الروبوت (Help the Robot)', '1. Help the Robot', 'مهمة توجيه', 'Robot Guidance', 'مساعدة الروبوت للوصول إلى محطة الشحن الطاقة', 'Help the robot reach its energy charging station', 'بطارية سمارتي منخفضة! ارسم له أقصر طريق آمن نحو محطة الشحن الخضراء.', 'Smarty battery is low! Program the safest route to the green charging dock.', 'BatteryCharging', 'emerald', 'grid_navigator', 'help_robot'),
      makeGame('ch-4', 4, 2, 'ch4-find-the-treasure', '2. اعثر على الكنز (Find the Treasure)', '2. Find the Treasure', 'استكشاف الخرائط', 'Map Quest', 'التنقل عبر خريطة الجزيرة للوصول إلى جوهرة المعمل', 'Navigate the island map to reach the lab crystal', 'تجاوز الصخور المدارية واجمع المفتاح للوصول إلى صندوق الجواهر.', 'Bypass tropical rocks and grab the key to reach the crystal chest.', 'Gem', 'amber', 'grid_navigator', 'find_treasure'),
      makeGame('ch-4', 4, 3, 'ch4-escape-the-maze', '3. الهروب من المتاهة (Escape the Maze)', '3. Escape the Maze', 'متاهة هندسية', 'Maze Escape', 'قراءة الخريطة والعثور على المخرج الوحيد المفتوح', 'Read the map layout and find the open escape corridor', 'ابحث عن الممر المفتوح بين الجدران الليزرية وقُد الروبوت نحو بوابة الخروج.', 'Find the open corridor between laser walls and guide the robot to the exit gate.', 'Compass', 'indigo', 'grid_navigator', 'escape_maze'),
      makeGame('ch-4', 4, 4, 'ch4-deliver-the-package', '4. توصيل الطرد الذكي (Deliver the Package)', '4. Deliver the Package', 'مهمة لوجستية', 'Delivery Mission', 'التقاط الطرد الهندسي أولاً ثم توصيله إلى محطة الاستلام', 'Pick up the engineering package first, then deliver it to the station', 'مرّ فوق صندوق المعدات لالتقاطه أولاً ثم اتجه نحو منصة التسليم!', 'Pass over the equipment crate to pick it up first, then head to the delivery pad!', 'Package', 'sky', 'grid_navigator', 'deliver_package'),
      makeGame('ch-4', 4, 5, 'ch4-cross-the-bridge', '5. عبور الجسر (Cross the Bridge)', '5. Cross the Bridge', 'مفاتيح وجسور', 'Bridge Logic', 'تفعيل زر الجسر الهيدروليكي لعبور النهر بأمان', 'Activate the hydraulic bridge switch to cross the river safely', 'الجسر مرفوع! وجّه سمارتي للضغط على المفتاح الذهبي لإنزال الجسر ثم اعبر للضفة الأخرى.', 'The bridge is raised! Guide Smarty onto the golden switch to lower the bridge and cross.', 'Wrench', 'teal', 'grid_navigator', 'cross_bridge'),
      makeGame('ch-4', 4, 6, 'ch4-robot-rescue', '6. إنقاذ الروبوت الصغير (Robot Rescue)', '6. Robot Rescue', 'مهمة إنقاذ', 'Rescue Mission', 'الوصول إلى الروبوت الصغير العالق وإعادته للمعمل', 'Reach the stranded mini-bot and escort it safely', 'صديقنا الروبوت الصغير عالق خلف الحواجز! خطّط مسار الإنقاذ للوصول إليه.', 'Our mini-bot friend is stuck behind barriers! Plan a rescue route to reach it.', 'Heart', 'rose', 'grid_navigator', 'robot_rescue'),
      makeGame('ch-4', 4, 7, 'ch4-collect-the-stars', '7. اجمع النجوم المضيئة (Collect the Stars)', '7. Collect the Stars', 'جمع متعدد', 'Star Collector', 'المرور على جميع النجوم الذهبية في الخريطة قبل خط النهاية', 'Pass through every golden star on the map before the finish line', 'خطّط مساراً ذكياً يجمع كل النجوم المضيئة في الخريطة قبل الوصول للراية!', 'Plan a smart route that collects every glowing star on the map before reaching the flag!', 'Star', 'purple', 'grid_navigator', 'collect_stars'),
      makeGame('ch-4', 4, 8, 'ch4-the-big-mission', '8. المهمة الكبرى (The Big Mission)', '8. The Big Mission', 'مغامرة ختامية', 'Grand Adventure', 'مهمة شاملة تجمع المفاتيح والجواهر وتجاوز العقبات', 'Grand finale mission combining keys, crystals, and obstacles', 'المهمة الكبرى للفصل الرابع: افتح البوابة الليزرية، اجمع الطاقة، وانطلق بالصاروخ!', 'Chapter 4 Grand Mission: unlock the laser gate, gather energy crystals, and launch!', 'Rocket', 'red', 'grid_navigator', 'big_mission'),
    ],
  },

  // =========================================================================
  // CHAPTER 5: Code Builder (8 Games × 15 Levels = 120 Levels)
  // =========================================================================
  {
    id: 'ch-5',
    chapterNumber: 5,
    title: { ar: 'الفصل 5: بناء الشفرة (Code Builder)', en: 'Chapter 5: Code Builder' },
    subtitle: { ar: '8 ألعاب بناء الأكواد · 120 مستوى متدرج', en: '8 Code Building Games · 120 Progressive Levels' },
    description: {
      ar: 'تعلم تركيب البلوكات البرمجية، ترتيب الخوارزميات، وبناء البرامج المتسلسلة خطوة بخطوة.',
      en: 'Learn block coding, algorithmic sequencing, and building step-by-step programs.',
    },
    icon: 'Cpu',
    accentColor: 'amber',
    targetSkills: {
      ar: ['تسلسل الأوامر', 'تركيب البلوكات البرمجية', 'التفكير المنطقي', 'تنفيذ البرامج (Run)', 'تحسين عدد الخطوات'],
      en: ['Command Sequencing', 'Block Assembly', 'Logical Thinking', 'Program Execution', 'Step Optimization'],
    },
    games: [
      makeGame('ch-5', 5, 1, 'ch5-block-snap-studio', '1. استوديو البلوكات (Block Snap Studio)', '1. Block Snap Studio', 'بناء البلوكات', 'Block Coding', 'تركيب بلوكات الحركة في قائمة البرنامج', 'Snap movement blocks into the program queue', 'اسحب بلوكات الحركة ورتبها في التسلسل الصحيح لتشغيل الروبوت.', 'Snap movement blocks into the right sequence to run the robot.', 'Cpu', 'amber', 'code_sequencer', 'block_snap'),
      makeGame('ch-5', 5, 2, 'ch5-step-by-step-coder', '2. المبرمج خطوة بخطوة (Step-by-Step Coder)', '2. Step-by-Step Coder', 'تسلسل منطقي', 'Sequencing', 'التفكير في كل خطوة قبل الضغط على زر التشغيل', 'Plan each step ahead before pressing Run', 'خطّط مسار الروبوت الكامل في قائمة الأوامر ثم اضغط تشغيل (Run) دفعة واحدة!', 'Plan the full robot route in the command queue then press Run!', 'Play', 'emerald', 'code_sequencer', 'step_coder'),
      makeGame('ch-5', 5, 3, 'ch5-algorithm-kitchen', '3. مطبخ الخوارزميات (Algorithm Builder)', '3. Algorithm Builder', 'ترتيب الخطوات', 'Algorithmic Order', 'ترتيب الخطوات المنطقية لتنفيذ مهمة مركبة', 'Arrange logical steps in strict order to complete a task', 'رتّب خطوات الخوارزمية بالترتيب المنطقي الصحيح من البداية حتى النهاية.', 'Order the algorithm steps in the exact logical sequence from start to finish.', 'Layers', 'sky', 'pattern_sequence', 'algorithm_order'),
      makeGame('ch-5', 5, 4, 'ch5-smart-arm-coder', '4. برمجة الذراع الآلي (Smart Arm Coder)', '4. Smart Arm Coder', 'تحكم صناعي', 'Robotic Arm', 'برمجة الذراع الآلي لالتقاط القطع ووضعها في مكانها', 'Program the robotic arm to pick and place parts', 'برمج الذراع الآلي للتحرك نحو القطعة، التقاطها، ثم وضعها في منصة التجميع.', 'Program the robotic arm to move to the part, grab it, and place it on the assembly pad.', 'Wrench', 'indigo', 'code_sequencer', 'arm_coder'),
      makeGame('ch-5', 5, 5, 'ch5-crystal-collector-code', '5. شيفرة جامع الجواهر (Crystal Collector Code)', '5. Crystal Collector Code', 'برمجة المهام', 'Multi-Target Code', 'كتابة برنامج يمر بجميع جواهر الطاقة قبل خط النهاية', 'Write a program that collects all energy crystals before the goal', 'اكتب تسلسلاً برمجياً يجمع كل جواهر الطاقة المضيئة في طريقه للهدف.', 'Write a command sequence that gathers every glowing energy crystal on the way to the goal.', 'Sparkles', 'purple', 'code_sequencer', 'crystal_code'),
      makeGame('ch-5', 5, 6, 'ch5-gate-unlock-code', '6. شيفرة البوابات الذكية (Gate Unlock Code)', '6. Gate Unlock Code', 'شروط ومفاتيح', 'Switch & Gate Code', 'برمجة الروبوت لتفعيل المفتاح قبل العبور من البوابة', 'Program the robot to trigger the switch before passing the gate', 'تذكّر في برنامجك زيارة مربع المفتاح الذهبي أولاً قبل التوجه لبوابة الليزر!', 'Make sure your program visits the golden key tile first before heading to the laser gate!', 'Lock', 'rose', 'code_sequencer', 'gate_code'),
      makeGame('ch-5', 5, 7, 'ch5-shortest-code-challenge', '7. تحدي أقصر شيفرة (Shortest Code)', '7. Shortest Code', 'كفاءة البرمجة', 'Code Efficiency', 'الوصول للهدف بأقل عدد ممكن من البلوكات البرمجية', 'Reach the goal using the minimum number of coding blocks', 'اختر الطريق الأذكى والأقصر للوصول إلى الهدف دون خطوات زائدة.', 'Choose the smartest, shortest route to reach the goal without wasted steps.', 'Zap', 'teal', 'code_sequencer', 'shortest_code'),
      makeGame('ch-5', 5, 8, 'ch5-master-code-architect', '8. مهندس البرمجيات الصغير (Code Architect)', '8. Code Architect', 'مشروع برمجي', 'Master Coding', 'بناء برنامج متكامل يجتاز الخريطة المتقدمة بنجاح', 'Build a complete program that clears the advanced robotics map', 'تحدي التخرج من الفصل الخامس: اكتب البرنامج الكامل لقيادة سمارتي نحو منصة الإطلاق!', 'Chapter 5 Finale: write the complete program to guide Smarty to the launchpad!', 'Award', 'red', 'code_sequencer', 'master_architect'),
    ],
  },

  // =========================================================================
  // CHAPTER 6: Debugging Mission (Exact 7 Games Requested × 15 Levels = 105 Levels)
  // =========================================================================
  {
    id: 'ch-6',
    chapterNumber: 6,
    title: { ar: 'الفصل 6: مهمة تصحيح الأخطاء (Debugging Mission)', en: 'Chapter 6: Debugging Mission' },
    subtitle: { ar: '7 ألعاب اكتشاف وإصلاح الأخطاء · 105 مستوى متدرج', en: '7 Debugging Games · 105 Progressive Levels' },
    description: {
      ar: 'تعلم مهارة اكتشاف الأخطاء البرمجية (Bugs) بنفسك، تحديد الأمر الخاطئ أو الناقص، وإصلاح البرنامج ليعمل بنجاح.',
      en: 'Learn how to spot coding bugs yourself, identify wrong or missing commands, and repair the program.',
    },
    icon: 'Wrench',
    accentColor: 'rose',
    targetSkills: {
      ar: ['اكتشاف الخطأ (Bug Detection)', 'تصحيح التسلسل', 'إضافة الأمر الناقص', 'تعديل الاتجاه الخاطئ', 'التفكير التحليلي'],
      en: ['Bug Detection', 'Sequence Repair', 'Missing Command Insertion', 'Wrong Direction Fix', 'Analytical Debugging'],
    },
    games: [
      makeGame('ch-6', 6, 1, 'ch6-find-the-mistake', '1. اكتشف الخطأ (Find the Mistake)', '1. Find the Mistake', 'فحص الكود', 'Bug Spotting', 'تشغيل البرنامج وملاحظة الخطوة التي تسبب الاصطدام ثم إصلاحها', 'Run the code, observe which step causes a collision, and fix it', 'شغّل البرنامج الموجود، شاهد أين يخطئ الروبوت سمارتي، وصحّح الخطوة الخاطئة!', 'Run the pre-loaded program, see where Smarty goes wrong, and fix the buggy step!', 'AlertTriangle', 'rose', 'code_debugger', 'find_mistake'),
      makeGame('ch-6', 6, 2, 'ch6-fix-broken-sequence', '2. أصلح التسلسل المعطل (Fix the Broken Sequence)', '2. Fix the Broken Sequence', 'إعادة ترتيب', 'Sequence Repair', 'إعادة ترتيب الأوامر المبعثرة في البرنامج المعطل', 'Reorder scrambled commands in the broken program', 'الأوامر البرمجية صحيحة ولكن ترتيبها معكوس! أعد ترتيبها بالسهمين (↑ ↓) لتعمل.', 'The commands are right but their order is scrambled! Reorder them with (↑ ↓) to fix the bug.', 'Wrench', 'amber', 'code_debugger', 'fix_sequence'),
      makeGame('ch-6', 6, 3, 'ch6-missing-command', '3. الأمر المفقود (Missing Command)', '3. Missing Command', 'إكمال الشيفرة', 'Missing Step', 'اكتشاف الخطوة الناقصة في البرنامج وإضافتها في المكان الصحيح', 'Identify the missing step in the program and insert it', 'البرنامج يتوقف قبل الوصول للهدف بخطوة! اكتشف الأمر الناقص وأضفه للقائمة.', 'The program stops short of the goal! Discover the missing command and add it.', 'PlusCircle', 'emerald', 'code_debugger', 'missing_command'),
      makeGame('ch-6', 6, 4, 'ch6-wrong-direction', '4. الاتجاه الخاطئ (Wrong Direction)', '4. Wrong Direction', 'تصحيح الاتجاه', 'Direction Fix', 'تحديد السهم المتجه بالاتجاه المعاكس واستبداله بالسهم الصحيح', 'Find the arrow pointing the wrong way and replace it', 'أحد الأسهم في البرنامج يجعل الروبوت ينعطف نحو الحاجز! احذفه وضع الاتجاه الصحيح.', 'One arrow in the program turns the robot into a barrier! Replace it with the right direction.', 'Compass', 'sky', 'code_debugger', 'wrong_direction'),
      makeGame('ch-6', 6, 5, 'ch6-repair-the-robot', '5. إصلاح الروبوت (Repair the Robot)', '5. Repair the Robot', 'صيانة ذكية', 'Robot Diagnostics', 'فحص دوائر الروبوت وإصلاح القطعة المعطلة في النظام', 'Diagnose robot circuits and repair the faulty module', 'افحص لوحة تحكم سمارتي، استبدل الشريحة التالفة، ثم شغّل كود الاختبار!', 'Inspect Smarty control board, replace the faulty module, and run the diagnostic code!', 'Cpu', 'indigo', 'code_debugger', 'repair_robot'),
      makeGame('ch-6', 6, 6, 'ch6-code-detective', '6. محقق الأكواد (Code Detective)', '6. Code Detective', 'تحقيق برمجي', 'Code Detective', 'تتبع الكود خطوة بخطوة لاكتشاف الخطأ الخفي قبل التشغيل', 'Trace code step-by-step to spot the hidden bug', 'استخدم مهارات المحقق الذكي لتتبع مسار الأوامر على الشبكة وإزالة البلوكات الزائدة.', 'Use your detective skills to trace the command path on the grid and remove extra buggy blocks.', 'Search', 'purple', 'code_debugger', 'code_detective'),
      makeGame('ch-6', 6, 7, 'ch6-fix-the-mission', '7. أنقذ المهمة (Fix the Mission)', '7. Fix the Mission', 'تحدي التصحيح النهائي', 'Master Debugger', 'إصلاح برنامج متكامل يحتوي على مفاتيح وبوابات وأخطاء مركبة', 'Repair a full mission program with keys, gates, and multiple bugs', 'التحدي الختامي لتصحيح الأخطاء: أصلح مسار المهمة المعقدة ليفتح سمارتي البوابة ويصل للهدف!', 'Final Debugging Mission: repair the complex mission script so Smarty unlocks the gate and wins!', 'Award', 'red', 'code_debugger', 'fix_mission'),
    ],
  },

  // =========================================================================
  // CHAPTER 7: Loops & Patterns (Exact 8 Games Requested × 15 Levels = 120 Levels)
  // =========================================================================
  {
    id: 'ch-7',
    chapterNumber: 7,
    title: { ar: 'الفصل 7: الحلقات والأنماط (Loops & Patterns)', en: 'Chapter 7: Loops & Patterns' },
    subtitle: { ar: '8 ألعاب تكرار وأنماط · 120 مستوى متدرج', en: '8 Loop & Pattern Games · 120 Progressive Levels' },
    description: {
      ar: 'اكتشاف فكرة التكرار (Loops) والأنماط البصرية والحركية لاختصار الخطوات البرمجية بذكاء.',
      en: 'Discover repetition (Loops) and visual/movement patterns to shorten coding steps smartly.',
    },
    icon: 'Repeat',
    accentColor: 'purple',
    targetSkills: {
      ar: ['بناء الأنماط', 'التكرار البصري والحركي', 'حلقات التكرار (Repeat Loops)', 'اختصار الأكواد المتكررة', 'تصميم أنماط إبداعية'],
      en: ['Pattern Building', 'Visual & Motion Repetition', 'Repeat Loops', 'Loop Optimization', 'Creative Pattern Design'],
    },
    games: [
      makeGame('ch-7', 7, 1, 'ch7-pattern-builder', '1. باني الأنماط (Pattern Builder)', '1. Pattern Builder', 'بناء الأنماط', 'Pattern Creation', 'تركيب سلسلة عناصر تتبع قاعدة تكرار منتظمة (ABAB / ABC)', 'Build item sequences following regular repeat rules (ABAB / ABC)', 'رتّب الأشكال والألوان المضيئة لتكوين نمط متكرر منتظم.', 'Arrange glowing shapes and colors to form a regular repeating pattern.', 'Layers', 'purple', 'pattern_sequence', 'pattern_builder'),
      makeGame('ch-7', 7, 2, 'ch7-repeat-the-dance', '2. كرّر الرقصة (Repeat the Dance)', '2. Repeat the Dance', 'تكرار حركي', 'Motion Loop', 'برمجة حركات الروبوت الراقصة المتكررة بإيقاع ممتع', 'Program repeating robot dance moves in rhythm', 'اختر حركات احتفال سمارتي وكرّرها في حلقة إيقاعية مبهجة!', 'Select Smarty celebration moves and repeat them in a joyful rhythm loop!', 'Sparkles', 'rose', 'pattern_sequence', 'repeat_dance'),
      makeGame('ch-7', 7, 3, 'ch7-robot-loop', '3. حلقة الروبوت (Robot Loop)', '3. Robot Loop', 'حلقات برمجية', 'Coding Loops', 'استخدام تكرار الأوامر لتحريك الروبوت مسافات طويلة بسهولة', 'Use repeating commands to move the robot across long paths', 'بدلاً من الفوضى، كرّر نمط الحركة المنتظم ليصل سمارتي إلى نهاية الممر!', 'Repeat the regular movement pattern so Smarty reaches the end of the corridor!', 'Repeat', 'emerald', 'code_sequencer', 'robot_loop'),
      makeGame('ch-7', 7, 4, 'ch7-complete-the-pattern', '4. أكمل النمط (Complete the Pattern)', '4. Complete the Pattern', 'استنتاج النمط', 'Pattern Logic', 'اكتشاف العناصر المفقودة في نهاية أو وسط النمط المتكرر', 'Find the missing items in a repeating visual sequence', 'انظر إلى الدورة المتكررة واختر العنصر الصحيح الذي يكمل الفراغ!', 'Look at the repeating cycle and pick the exact item that completes the gap!', 'CheckCircle2', 'amber', 'pattern_sequence', 'complete_pattern'),
      makeGame('ch-7', 7, 5, 'ch7-repeat-the-journey', '5. كرّر الرحلة (Repeat the Journey)', '5. Repeat the Journey', 'مسار متكرر', 'Staircase Loop', 'توجيه الروبوت في مسار متعرج متكرر (يمين ثم أسفل × N)', 'Guide the robot along a repeating zig-zag journey', 'لاحظ كيف تتكرر خطوات الدرج (يمين ثم أسفل)! طبّق نفس النمط حتى تصل للهدف.', 'Notice how the staircase steps repeat (Right then Down)! Apply the pattern to the goal.', 'Route', 'sky', 'code_sequencer', 'repeat_journey'),
      makeGame('ch-7', 7, 6, 'ch7-loop-challenge', '6. تحدي الحلقات (Loop Challenge)', '6. Loop Challenge', 'تحدي متقدم', 'Loop Mastery', 'جمع كل جواهر الطاقة عبر مسارات دائرية ومتكررة', 'Collect all energy crystals across looping tracks', 'اجمع كل الجواهر الموزعة بنمط هندسي متكرر على الشبكة!', 'Collect all crystals arranged in a geometric repeating pattern on the grid!', 'Zap', 'indigo', 'code_sequencer', 'loop_challenge'),
      makeGame('ch-7', 7, 7, 'ch7-smart-sequence', '7. التسلسل الذكي (Smart Sequence)', '7. Smart Sequence', 'ذكاء منطقي', 'Smart Sequence', 'تحليل الأنماط الرقمية والرمزية المتقدمة وإكمالها', 'Analyze and complete advanced symbol and number patterns', 'اكتشف القاعدة الذكية التي تربط الرموز وأكمل التسلسل بنجاح.', 'Discover the smart rule connecting the symbols and complete the sequence.', 'Brain', 'teal', 'pattern_sequence', 'smart_sequence'),
      makeGame('ch-7', 7, 8, 'ch7-build-your-own-pattern', '8. اصنع نمطك الخاص (Build Your Own Pattern)', '8. Build Your Own Pattern', 'إبداع حر + تحقق', 'Creative Pattern', 'تصميم وحدة نمط وتكرارها لتوليد لوحة فنية وتشغيلها', 'Design a pattern unit and repeat it to generate an interactive sequence', 'صمّم وحدة النمط الخاصة بك وكرّرها لإضاءة مسرح الروبوت سمارتي!', 'Design your pattern unit and repeat it to light up Smarty Robot stage!', 'Award', 'red', 'pattern_sequence', 'build_own_pattern'),
    ],
  },

  // =========================================================================
  // CHAPTER 8: Events & Projects (Exact 7 Games Requested × 15 Levels = 105 Levels)
  // =========================================================================
  {
    id: 'ch-8',
    chapterNumber: 8,
    title: { ar: 'الفصل 8: الأحداث والمشاريع الإبداعية (Events & Projects)', en: 'Chapter 8: Events & Projects' },
    subtitle: { ar: '7 ألعاب أحداث ومشاريع إبداعية · 105 مستوى متدرج', en: '7 Event & Creative Project Games · 105 Progressive Levels' },
    description: {
      ar: 'تعلم ربط الأزرار بالأحداث (When Clicked -> Do Action)، بناء القصص التفاعلية، وتصميم المشاريع الإبداعية.',
      en: 'Learn event-driven programming (When Clicked -> Do Action), interactive storytelling, and building creative projects.',
    },
    icon: 'Sparkles',
    accentColor: 'teal',
    targetSkills: {
      ar: ['الأحداث (Events)', 'الاستجابة للنقر', 'القصص التفاعلية', 'تحريك الشخصيات', 'تصميم مشروع متكامل'],
      en: ['Events & Triggers', 'Click Reactions', 'Interactive Storytelling', 'Character Animation', 'Full Project Creation'],
    },
    games: [
      makeGame('ch-8', 8, 1, 'ch8-make-it-move', '1. اجعله يتحرك (Make It Move)', '1. Make It Move', 'أحداث الحركة', 'Motion Events', 'ربط حدث النقر أو الزر بحركة الروبوت الفورية', 'Connect button click events to instant robot movement', 'اربط كل زر حدث (عند الضغط) بحركة الروبوت المناسبة ثم جرب تشغيله!', 'Connect each event trigger (When Pressed) to the right robot action and test it!', 'Play', 'teal', 'event_sandbox', 'make_it_move'),
      makeGame('ch-8', 8, 2, 'ch8-click-and-create', '2. انقر واصنع (Click and Create)', '2. Click and Create', 'تفاعل إبداعي', 'Interactive Creation', 'إضافة عناصر وأضواء وأصوات للمشهد عند النقر على الأزرار', 'Spawn lights, stars, and effects into the scene on click events', 'برمج أزرار التحكم لتوليد النجوم والأضواء في معمل سمارتي عند النقر عليها!', 'Program control buttons to spawn stars and lights in Smarty lab when clicked!', 'Sparkles', 'amber', 'event_sandbox', 'click_and_create'),
      makeGame('ch-8', 8, 3, 'ch8-interactive-story', '3. القصة التفاعلية (Interactive Story)', '3. Interactive Story', 'سرد قصصي', 'Story Builder', 'بناء مشاهد قصة الروبوت سمارتي وربطها بأفعال الطفل', 'Build Smarty Robot story scenes triggered by user interactions', 'رتّب أحداث القصة التفاعلية بحيث يتحدث سمارتي ويتحرك عند كل حدث!', 'Arrange interactive story events so Smarty speaks and acts on every trigger!', 'BookOpen', 'indigo', 'event_sandbox', 'interactive_story'),
      makeGame('ch-8', 8, 4, 'ch8-robot-reactions', '4. ردود فعل الروبوت (Robot Reactions)', '4. Robot Reactions', 'استجابة ذكية', 'Smart Reactions', 'برمجة تعبيرات وحركات الروبوت 3D عند استقبال إشارات مختلفة', 'Program 3D robot expressions and reactions to different signals', 'اربط كل إشارة حساسة برد فعل الروبوت المناسب (ترحيب، تفكير، احتفال، انتصار)!', 'Link each sensor signal to the matching 3D robot reaction (Greet, Think, Cheer, Victory)!', 'Cpu', 'rose', 'event_sandbox', 'robot_reactions'),
      makeGame('ch-8', 8, 5, 'ch8-build-your-animation', '5. اصنع رسومك المتحركة (Build Your Animation)', '5. Build Your Animation', 'تحريك متتابع', 'Animation Studio', 'تجميع إطارات الحركة والمؤثرات لصناعة عرض متحرك للروبوت', 'Combine motion frames and effects to create a robot animation show', 'صمّم تسلسل الحركات المتتابعة وشغّل العرض الكرتوني للروبوت سمارتي!', 'Design the frame-by-frame motion sequence and play Smarty animation show!', 'Video', 'purple', 'event_sandbox', 'build_animation'),
      makeGame('ch-8', 8, 6, 'ch8-create-your-mission', '6. صمّم مهمتك الخاصة (Create Your Mission)', '6. Create Your Mission', 'تصميم المراحل', 'Mission Creator', 'تحديد الهدف والأحداث وقيادة الروبوت لإنجاز المهمة المبتكرة', 'Configure mission events and guide the robot to complete your custom quest', 'اضبط قواعد المهمة والأحداث التفاعلية ثم قُد الروبوت لإتمامها بنجاح!', 'Configure mission event rules and guide the robot to complete it!', 'Map', 'emerald', 'event_sandbox', 'create_mission'),
      makeGame('ch-8', 8, 7, 'ch8-smart-creator-challenge', '7. تحدي المبدع الذكي (Smart Creator Challenge)', '7. Smart Creator Challenge', 'مشروع التخرج', 'Graduation Project', 'دمج الأحداث والحركة والتكرار في مشروع تخرج متكامل', 'Combine events, movement, and sequences in a final graduation project', 'مشروع التخرج الختامي: برمج الأحداث، شغّل استعراض الروبوت، واحصل على وسام المبدع الذكي!', 'Final Graduation Project: program the events, launch the robot showcase, and earn the Smart Creator badge!', 'Award', 'red', 'event_sandbox', 'smart_creator'),
    ],
  },
];

const CHAPTER_GRADIENTS: Record<number, string> = {
  1: 'from-cyan-500 to-blue-600',
  2: 'from-purple-500 to-indigo-600',
  3: 'from-amber-500 to-orange-600',
  4: 'from-emerald-500 to-teal-600',
  5: 'from-blue-600 to-violet-600',
  6: 'from-rose-500 to-red-600',
  7: 'from-fuchsia-500 to-purple-600',
  8: 'from-teal-500 to-cyan-600',
};

function normalizeChapterLibraries(
  rawList: Array<
    Omit<ChapterLibraryDefinition, 'chapterId' | 'themeGradient'> & {
      chapterId?: number;
      themeGradient?: string;
    }
  >
): ChapterLibraryDefinition[] {
  return rawList.map((ch, idx) => {
    const num = ch.chapterId || ch.chapterNumber || idx + 1;
    return {
      ...ch,
      chapterId: num,
      chapterNumber: num,
      themeGradient: ch.themeGradient || CHAPTER_GRADIENTS[num] || 'from-cyan-500 to-blue-600',
      games: (ch.games || []).map((g, gIdx) => ({
        ...g,
        chapterId: num,
        chapterNumber: num,
        order: g.order || gIdx + 1,
        enabled: g.enabled !== undefined ? g.enabled : g.isEnabled !== undefined ? g.isEnabled : true,
        isEnabled: g.enabled !== undefined ? g.enabled : g.isEnabled !== undefined ? g.isEnabled : true,
        xpBonusCompletion: g.xpBonusCompletion ?? g.completionBonusXp ?? 100,
        completionBonusXp: g.xpBonusCompletion ?? g.completionBonusXp ?? 100,
        levels: (g.levels || []).map((lvl) => ({
          ...lvl,
          difficulty: lvl.difficulty || lvl.band || getBandForLevelNumber(lvl.levelNumber),
          band: lvl.band || lvl.difficulty || getBandForLevelNumber(lvl.levelNumber),
          targetSteps: lvl.targetSteps ?? lvl.itemsCount ?? 3,
          starsMax: lvl.starsMax ?? 3,
          specialChallenge: lvl.specialChallenge ?? lvl.levelNumber >= 13,
        })),
      })),
    };
  });
}

export const DEFAULT_CHAPTER_LIBRARIES: ChapterLibraryDefinition[] =
  normalizeChapterLibraries(RAW_CHAPTER_LIBRARIES);

export function loadChapterLibraries(): ChapterLibraryDefinition[] {
  if (typeof window === 'undefined') return normalizeChapterLibraries(DEFAULT_CHAPTER_LIBRARIES);
  try {
    const raw = window.localStorage.getItem(CHAPTER_LIBRARY_STORAGE_KEY);
    if (!raw) return normalizeChapterLibraries(DEFAULT_CHAPTER_LIBRARIES);
    const parsed = JSON.parse(raw) as ChapterLibraryDefinition[];
    if (!Array.isArray(parsed) || parsed.length < 8) {
      return normalizeChapterLibraries(DEFAULT_CHAPTER_LIBRARIES);
    }
    return normalizeChapterLibraries(parsed);
  } catch {
    return normalizeChapterLibraries(DEFAULT_CHAPTER_LIBRARIES);
  }
}

export function saveChapterLibraries(chapters: ChapterLibraryDefinition[]): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = normalizeChapterLibraries(chapters);
    window.localStorage.setItem(CHAPTER_LIBRARY_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('smartcoders:chapter-libraries-updated'));
    window.dispatchEvent(new Event('smartcoders:chapter-library-updated'));
  } catch (e) {
    console.error('Failed to save chapter libraries:', e);
  }
}

export function resetChapterLibraries(): ChapterLibraryDefinition[] {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(CHAPTER_LIBRARY_STORAGE_KEY);
    window.dispatchEvent(new Event('smartcoders:chapter-libraries-updated'));
    window.dispatchEvent(new Event('smartcoders:chapter-library-updated'));
  }
  return normalizeChapterLibraries(DEFAULT_CHAPTER_LIBRARIES);
}

export const resetChapterLibrariesToDefault = resetChapterLibraries;

export function loadChildChapterProgress(childId: string = 'child-discoverer'): ChildChapterLibraryProgress {
  const storageKey = `${CHAPTER_CHILD_PROGRESS_KEY}_${childId}`;
  if (typeof window === 'undefined') {
    return { childId, games: {} };
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { childId, games: {} };
    const parsed = JSON.parse(raw) as ChildChapterLibraryProgress;
    if (!parsed || typeof parsed !== 'object' || !parsed.games) {
      return { childId, games: {} };
    }
    return parsed;
  } catch {
    return { childId, games: {} };
  }
}

export function saveChildChapterProgress(progress: ChildChapterLibraryProgress): void {
  if (typeof window === 'undefined') return;
  try {
    const storageKey = `${CHAPTER_CHILD_PROGRESS_KEY}_${progress.childId}`;
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
    window.dispatchEvent(new Event('smartcoders:chapter-progress-updated'));
  } catch (e) {
    console.error('Failed to save child chapter progress:', e);
  }
}

export function getAgeScaledLevelConfig(
  level: ChapterLevelSpec,
  ageGroup: JuniorAgeGroup
): {
  effectiveItemsCount: number;
  effectiveGridSize: number;
  effectiveTargetSteps: number;
  instructionAr: string;
  instructionEn: string;
  hintAr: string;
  hintEn: string;
  scaffoldingLevel: 'high' | 'medium' | 'minimal';
} {
  const delta = ageGroup === '3-4' ? -1 : ageGroup === '5-6' ? 1 : 0;
  const effectiveItemsCount = Math.max(2, Math.min(9, level.itemsCount + delta));
  const effectiveGridSize = Math.max(
    3,
    Math.min(6, level.gridSize + (ageGroup === '3-4' ? -1 : ageGroup === '5-6' ? 1 : 0))
  );
  const effectiveTargetSteps = Math.max(
    2,
    Math.min(8, (level.targetSteps ?? level.itemsCount) + delta)
  );

  const prefixAr =
    ageGroup === '3-4'
      ? '🌟 للمستكشف الصغير (3-4 سنوات): '
      : ageGroup === '4-5'
      ? '🚀 للمفكر الذكي (4-5 سنوات): '
      : '🏆 للمبرمج المبدع (5-6 سنوات): ';

  const prefixEn =
    ageGroup === '3-4'
      ? '🌟 Explorer (Ages 3-4): '
      : ageGroup === '4-5'
      ? '🚀 Discoverer (Ages 4-5): '
      : '🏆 Creator (Ages 5-6): ';

  return {
    effectiveItemsCount,
    effectiveGridSize,
    effectiveTargetSteps,
    instructionAr: `${prefixAr}${level.instruction.ar}`,
    instructionEn: `${prefixEn}${level.instruction.en}`,
    hintAr: level.hint.ar,
    hintEn: level.hint.en,
    scaffoldingLevel: ageGroup === '3-4' ? 'high' : ageGroup === '4-5' ? 'medium' : 'minimal',
  };
}

export function recordChapterLevelWin(
  currentProgress: ChildChapterLibraryProgress,
  game: ChapterLibraryGame,
  levelNumber: number,
  starsEarned: number,
  xpReward: number
): {
  updatedProgress: ChildChapterLibraryProgress;
  xpDelta: number;
  starsDelta: number;
  alreadyCompleted: boolean;
} {
  const existing = currentProgress.games[game.id] || {
    gameId: game.id,
    unlockedLevel: 1,
    completedLevels: [],
    starsByLevel: {},
    earnedXp: 0,
    attemptsByLevel: {},
  };

  const alreadyCompleted = existing.completedLevels.includes(levelNumber);
  const prevStars = existing.starsByLevel[levelNumber] || 0;
  const nextStars = Math.max(prevStars, starsEarned);
  const starsDelta = Math.max(0, nextStars - prevStars);

  const nextCompleted = alreadyCompleted
    ? existing.completedLevels
    : [...existing.completedLevels, levelNumber].sort((a, b) => a - b);

  const justCompletedAll15 =
    !alreadyCompleted && nextCompleted.length >= game.levels.length;
  const xpDelta = alreadyCompleted
    ? 0
    : xpReward + (justCompletedAll15 ? game.xpBonusCompletion : 0);

  const nextUnlocked = Math.max(
    existing.unlockedLevel,
    Math.min(game.levels.length, levelNumber + 1)
  );

  const updatedGameProg: ChildChapterSingleGameProgress = {
    ...existing,
    unlockedLevel: nextUnlocked,
    completedLevels: nextCompleted,
    starsByLevel: {
      ...existing.starsByLevel,
      [levelNumber]: nextStars,
    },
    earnedXp: existing.earnedXp + xpDelta,
    attemptsByLevel: {
      ...existing.attemptsByLevel,
      [levelNumber]: (existing.attemptsByLevel[levelNumber] || 0) + 1,
    },
  };

  const updatedProgress: ChildChapterLibraryProgress = {
    ...currentProgress,
    games: {
      ...currentProgress.games,
      [game.id]: updatedGameProg,
    },
  };

  saveChildChapterProgress(updatedProgress);

  return {
    updatedProgress,
    xpDelta,
    starsDelta,
    alreadyCompleted,
  };
}

