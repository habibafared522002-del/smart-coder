import { JuniorAgeGroup, StudentProgress } from '../types';

export type AgeTier = JuniorAgeGroup;
export type ValidationMode = 'slot_match' | 'category_bin' | 'strict_sequence';
export type LayoutMode =
  | 'free_slots'
  | 'robot_blueprint'
  | 'sorting_bins'
  | 'butterfly_triptych'
  | 'plant_vertical'
  | 'split_2_vertical'
  | 'split_3_strips'
  | 'split_3_horizontal'
  | 'grid_2x2'
  | 'sequence_track'
  | 'lab_scene';

export interface JigsawPiece {
  id: string;
  label: { ar: string; en: string };
  artworkKey: string;
  color: string;
  category?: string;
  sequenceOrder?: number;
}

export interface JigsawTarget {
  id: string;
  label: { ar: string; en: string };
  artworkKey: string;
  acceptsPieceIds: string[];
  acceptsCategory?: string;
  sequenceIndex?: number;
  positionSlot: string;
  color: string;
}

export interface AgeVariantConfig {
  activePieceIds: string[];
  activeTargetIds: string[];
  showGhostHints: boolean;
  strictOrder: boolean;
  cognitiveNote: { ar: string; en: string };
  instructionOverride?: { ar: string; en: string };
}

export interface JigsawLevelConfig {
  id: string;
  levelNumber: number;
  order: number;
  isPublished: boolean;
  title: { ar: string; en: string };
  objective: { ar: string; en: string };
  instruction: { ar: string; en: string };
  audioText: { ar: string; en: string };
  hint: { ar: string; en: string };
  xpReward: number;
  validationMode: ValidationMode;
  layoutMode: LayoutMode;
  sceneKey: string;
  pieces: JigsawPiece[];
  targets: JigsawTarget[];
  ageVariants: Record<AgeTier, AgeVariantConfig>;
}

export type JigsawLevel = JigsawLevelConfig;

const LEVELS_STORAGE_KEY = 'smartcoders_jigsaw_levels_v2';
const PROGRESS_STORAGE_KEY = 'smartcoders_student_progress_v2';

export const defaultJigsawLevelsData: JigsawLevelConfig[] = [
  {
    id: 'lvl-1',
    levelNumber: 1,
    order: 1,
    isPublished: true,
    title: { ar: 'المستوى 1 – وضع الأشكال الهندسية', en: 'Level 1 – Shape Placement' },
    objective: { ar: 'التعرف على الأشكال الهندسية ومهارة السحب والإفلات.', en: 'Geometric shape recognition and foundational drag-and-drop control.' },
    instruction: { ar: 'اسحب كل شكل هندسي وضعه داخل إطاره المطابق في اللوحة.', en: 'Drag each geometric shape into its matching frame on the board.' },
    audioText: { ar: 'اسحب كل شكل هندسي وضعه في مكانه الصحيح.', en: 'Drag each geometric shape into its matching frame.' },
    hint: { ar: 'انظر إلى حواف الشكل ثم طابقه مع الشكل المتقطع.', en: 'Look at the shape outline and match it with the dashed frame.' },
    xpReward: 10,
    validationMode: 'slot_match',
    layoutMode: 'free_slots',
    sceneKey: 'shapes',
    pieces: [
      { id: 'shape-circle', label: { ar: 'دائرة زرقاء', en: 'Blue Circle' }, artworkKey: 'shape-circle', color: 'bg-blue-50 dark:bg-blue-950/50' },
      { id: 'shape-square', label: { ar: 'مربع أحمر', en: 'Red Square' }, artworkKey: 'shape-square', color: 'bg-red-50 dark:bg-red-950/50' },
      { id: 'shape-triangle', label: { ar: 'مثلث أخضر', en: 'Green Triangle' }, artworkKey: 'shape-triangle', color: 'bg-emerald-50 dark:bg-emerald-950/50' },
      { id: 'shape-star', label: { ar: 'نجمة ذهبية', en: 'Gold Star' }, artworkKey: 'shape-star', color: 'bg-amber-50 dark:bg-amber-950/50' },
    ],
    targets: [
      { id: 't-circle', label: { ar: 'إطار الدائرة', en: 'Circle Slot' }, artworkKey: 'shape-circle', acceptsPieceIds: ['shape-circle'], positionSlot: 'slot-1', color: 'border-blue-400' },
      { id: 't-square', label: { ar: 'إطار المربع', en: 'Square Slot' }, artworkKey: 'shape-square', acceptsPieceIds: ['shape-square'], positionSlot: 'slot-2', color: 'border-red-400' },
      { id: 't-triangle', label: { ar: 'إطار المثلث', en: 'Triangle Slot' }, artworkKey: 'shape-triangle', acceptsPieceIds: ['shape-triangle'], positionSlot: 'slot-3', color: 'border-emerald-400' },
      { id: 't-star', label: { ar: 'إطار النجمة', en: 'Star Slot' }, artworkKey: 'shape-star', acceptsPieceIds: ['shape-star'], positionSlot: 'slot-4', color: 'border-amber-400' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['shape-circle', 'shape-square'],
        activeTargetIds: ['t-circle', 't-square'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'شكلان كبيران وواضحان مع تلميحات بصرية', en: 'Two large obvious shapes with ghost guides' },
      },
      '4-5': {
        activePieceIds: ['shape-circle', 'shape-square', 'shape-triangle'],
        activeTargetIds: ['t-square', 't-triangle', 't-circle'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'ثلاثة أشكال بترتيب مختلف للتحدي البصري', en: 'Three shapes in shuffled target order' },
      },
      '5-6': {
        activePieceIds: ['shape-circle', 'shape-square', 'shape-triangle', 'shape-star'],
        activeTargetIds: ['t-star', 't-triangle', 't-circle', 't-square'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'أربعة أشكال بدون تلميح لوني', en: 'All four shapes without color-matched guides' },
      },
    },
  },
  {
    id: 'lvl-2',
    levelNumber: 2,
    order: 2,
    isPublished: true,
    title: { ar: 'المستوى 2 – مطابقة الظل', en: 'Level 2 – Match the Shadow' },
    objective: { ar: 'تنمية التمييز البصري ومطابقة الشكل الخارجي بالظل.', en: 'Develop visual discrimination by matching objects to silhouettes.' },
    instruction: { ar: 'اسحب كل صورة ملونة وضعها فوق الظل المطابق لها.', en: 'Drag each colorful object onto its matching dark shadow.' },
    audioText: { ar: 'طابق كل لعبة أو مركبة مع ظلها الصحيح.', en: 'Match each object with its correct dark shadow.' },
    hint: { ar: 'ركز على شكل الحواف الخارجية للظل الداكن.', en: 'Focus on the outer silhouette shape of each shadow.' },
    xpReward: 10,
    validationMode: 'slot_match',
    layoutMode: 'free_slots',
    sceneKey: 'shadows',
    pieces: [
      { id: 'obj-car', label: { ar: 'سيارة سمارت', en: 'Smart Car' }, artworkKey: 'obj-car', color: 'bg-red-50 dark:bg-red-950/40' },
      { id: 'obj-ball', label: { ar: 'كرة قدم', en: 'Soccer Ball' }, artworkKey: 'obj-ball', color: 'bg-slate-100 dark:bg-slate-800' },
      { id: 'obj-plane', label: { ar: 'طائرة', en: 'Airplane' }, artworkKey: 'obj-plane', color: 'bg-sky-50 dark:bg-sky-950/40' },
      { id: 'obj-duck', label: { ar: 'بطة صفراء', en: 'Rubber Duck' }, artworkKey: 'obj-duck', color: 'bg-amber-50 dark:bg-amber-950/40' },
    ],
    targets: [
      { id: 's-ball', label: { ar: 'ظل 1', en: 'Shadow 1' }, artworkKey: 'obj-ball', acceptsPieceIds: ['obj-ball'], positionSlot: 'slot-1', color: 'border-slate-400' },
      { id: 's-car', label: { ar: 'ظل 2', en: 'Shadow 2' }, artworkKey: 'obj-car', acceptsPieceIds: ['obj-car'], positionSlot: 'slot-2', color: 'border-slate-400' },
      { id: 's-plane', label: { ar: 'ظل 3', en: 'Shadow 3' }, artworkKey: 'obj-plane', acceptsPieceIds: ['obj-plane'], positionSlot: 'slot-3', color: 'border-slate-400' },
      { id: 's-duck', label: { ar: 'ظل 4', en: 'Shadow 4' }, artworkKey: 'obj-duck', acceptsPieceIds: ['obj-duck'], positionSlot: 'slot-4', color: 'border-slate-400' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['obj-car', 'obj-ball'],
        activeTargetIds: ['s-ball', 's-car'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'ظلان متباينان بوضوح (سيارة وكرة)', en: 'Two distinct silhouettes (car and ball)' },
      },
      '4-5': {
        activePieceIds: ['obj-car', 'obj-ball', 'obj-plane'],
        activeTargetIds: ['s-plane', 's-car', 's-ball'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'ثلاث مركبات وأدوات بظلال معكوسة', en: 'Three objects with shuffled shadow slots' },
      },
      '5-6': {
        activePieceIds: ['obj-car', 'obj-ball', 'obj-plane', 'obj-duck'],
        activeTargetIds: ['s-duck', 's-plane', 's-ball', 's-car'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'أربع ظلال كاملة بدون مساعدة نصية', en: 'Four full silhouettes without name hints' },
      },
    },
  },
  {
    id: 'lvl-3',
    levelNumber: 3,
    order: 3,
    isPublished: true,
    title: { ar: 'المستوى 3 – بناء الروبوت الذكي', en: 'Level 3 – Build the Robot' },
    objective: { ar: 'تحديد أجزاء الروبوت الهيكلية وتركيبها في المواضع التشريحية الصحيحة.', en: 'Identify robot anatomy and assemble head, torso, arms, and legs in place.' },
    instruction: { ar: 'ركّب الرأس والجسم والذراعين والأرجل لبناء روبوت سمارت تك الكامل.', en: 'Assemble the head, body, both arms, and legs to build the complete SmartTech robot.' },
    audioText: { ar: 'ركب رأس وجسم وأطراف الروبوت في أماكنها الصحيحة.', en: 'Assemble the robot head, body, arms, and legs into position.' },
    hint: { ar: 'ابدأ بالرأس في الأعلى، ثم الجسم في الوسط، والأطراف على الجانبين والأسفل.', en: 'Place head on top, torso in center, arms on sides, and legs below.' },
    xpReward: 15,
    validationMode: 'slot_match',
    layoutMode: 'robot_blueprint',
    sceneKey: 'robot',
    pieces: [
      { id: 'robot-head', label: { ar: 'رأس الروبوت', en: 'Robot Head' }, artworkKey: 'robot-head', color: 'bg-slate-100 dark:bg-slate-800' },
      { id: 'robot-body', label: { ar: 'جسم الروبوت', en: 'Robot Body' }, artworkKey: 'robot-body', color: 'bg-red-50 dark:bg-red-950/40' },
      { id: 'robot-arm-l', label: { ar: 'الذراع الأيسر', en: 'Left Arm' }, artworkKey: 'robot-arm-l', color: 'bg-slate-100 dark:bg-slate-800' },
      { id: 'robot-arm-r', label: { ar: 'الذراع الأيمن', en: 'Right Arm' }, artworkKey: 'robot-arm-r', color: 'bg-slate-100 dark:bg-slate-800' },
      { id: 'robot-legs', label: { ar: 'أرجل الروبوت', en: 'Robot Legs' }, artworkKey: 'robot-legs', color: 'bg-slate-100 dark:bg-slate-800' },
    ],
    targets: [
      { id: 'rt-head', label: { ar: 'الرأس', en: 'Head' }, artworkKey: 'robot-head', acceptsPieceIds: ['robot-head'], positionSlot: 'head', color: 'border-indigo-400' },
      { id: 'rt-arm-l', label: { ar: 'الذراع الأيسر', en: 'Left Arm' }, artworkKey: 'robot-arm-l', acceptsPieceIds: ['robot-arm-l'], positionSlot: 'arm-l', color: 'border-slate-400' },
      { id: 'rt-body', label: { ar: 'الجسم', en: 'Body' }, artworkKey: 'robot-body', acceptsPieceIds: ['robot-body'], positionSlot: 'body', color: 'border-red-400' },
      { id: 'rt-arm-r', label: { ar: 'الذراع الأيمن', en: 'Right Arm' }, artworkKey: 'robot-arm-r', acceptsPieceIds: ['robot-arm-r'], positionSlot: 'arm-r', color: 'border-slate-400' },
      { id: 'rt-legs', label: { ar: 'الأرجل', en: 'Legs' }, artworkKey: 'robot-legs', acceptsPieceIds: ['robot-legs'], positionSlot: 'legs', color: 'border-slate-400' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['robot-head', 'robot-body'],
        activeTargetIds: ['rt-head', 'rt-body'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب جزأين أساسيين (الرأس والجسم)', en: 'Assemble two primary core parts (head & body)' },
        instructionOverride: { ar: 'ركّب رأس الروبوت وجسمه في مكانهما الصحيح.', en: 'Place the robot head and body in their slots.' },
      },
      '4-5': {
        activePieceIds: ['robot-head', 'robot-body', 'robot-legs'],
        activeTargetIds: ['rt-head', 'rt-body', 'rt-legs'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب الرأس والجسم والأرجل عمودياً', en: 'Assemble head, body, and legs vertically' },
      },
      '5-6': {
        activePieceIds: ['robot-head', 'robot-body', 'robot-arm-l', 'robot-arm-r', 'robot-legs'],
        activeTargetIds: ['rt-head', 'rt-arm-l', 'rt-body', 'rt-arm-r', 'rt-legs'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'بناء الهيكل الكامل من 5 أجزاء مع تمييز اليمين واليسار', en: 'Full 5-part robot anatomy including left/right arm orientation' },
      },
    },
  },
  {
    id: 'lvl-4',
    levelNumber: 4,
    order: 4,
    isPublished: true,
    title: { ar: 'المستوى 4 – تصنيف الفواكه والألعاب', en: 'Level 4 – Sort Fruits and Toys' },
    objective: { ar: 'التصنيف المنطقي للعناصر المتعددة إلى سلة الفواكه وصندوق الألعاب.', en: 'Logical categorization of multiple objects into Fruit Basket and Toy Box bins.' },
    instruction: { ar: 'صنّف جميع العناصر: اسحب كل الفواكه إلى السلة وكل الألعاب إلى الصندوق.', en: 'Classify all items: drag every fruit into the basket and every toy into the toy box.' },
    audioText: { ar: 'ضع الفواكه في السلة والألعاب في الصندوق.', en: 'Put all fruits in the basket and all toys in the box.' },
    hint: { ar: 'فكّر هل هذا الشيء يؤكل كفاكهة أم نلعب به؟', en: 'Ask yourself: is this a fruit you eat or a toy you play with?' },
    xpReward: 15,
    validationMode: 'category_bin',
    layoutMode: 'sorting_bins',
    sceneKey: 'sorting',
    pieces: [
      { id: 'f-apple', label: { ar: 'تفاحة', en: 'Apple' }, artworkKey: 'fruit-apple', category: 'fruit', color: 'bg-red-50 dark:bg-red-950/40' },
      { id: 'f-banana', label: { ar: 'موزة', en: 'Banana' }, artworkKey: 'fruit-banana', category: 'fruit', color: 'bg-amber-50 dark:bg-amber-950/40' },
      { id: 'f-grapes', label: { ar: 'عنب', en: 'Grapes' }, artworkKey: 'fruit-grapes', category: 'fruit', color: 'bg-purple-50 dark:bg-purple-950/40' },
      { id: 't-bear', label: { ar: 'دبدوب', en: 'Teddy Bear' }, artworkKey: 'toy-bear', category: 'toy', color: 'bg-amber-50 dark:bg-amber-950/40' },
      { id: 't-blocks', label: { ar: 'مكعبات', en: 'Blocks' }, artworkKey: 'toy-blocks', category: 'toy', color: 'bg-blue-50 dark:bg-blue-950/40' },
      { id: 't-drum', label: { ar: 'طبلة لعبة', en: 'Toy Drum' }, artworkKey: 'toy-drum', category: 'toy', color: 'bg-rose-50 dark:bg-rose-950/40' },
    ],
    targets: [
      { id: 'bin-fruit', label: { ar: 'سلة الفواكه', en: 'Fruit Basket' }, artworkKey: 'bin-basket', acceptsPieceIds: ['f-apple', 'f-banana', 'f-grapes'], acceptsCategory: 'fruit', positionSlot: 'left-bin', color: 'border-emerald-500' },
      { id: 'bin-toy', label: { ar: 'صندوق الألعاب', en: 'Toy Box' }, artworkKey: 'bin-toybox', acceptsPieceIds: ['t-bear', 't-blocks', 't-drum'], acceptsCategory: 'toy', positionSlot: 'right-bin', color: 'border-blue-500' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['f-apple', 't-bear'],
        activeTargetIds: ['bin-fruit', 'bin-toy'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'عنصر واحد لكل فئة (تفاحة ودبدوب)', en: 'One clear item per category (apple & bear)' },
      },
      '4-5': {
        activePieceIds: ['f-apple', 'f-banana', 't-bear', 't-blocks'],
        activeTargetIds: ['bin-fruit', 'bin-toy'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تصنيف 4 عناصر (فاكهتان ولعبتان)', en: 'Classify 4 objects (2 fruits and 2 toys)' },
      },
      '5-6': {
        activePieceIds: ['f-apple', 't-bear', 'f-banana', 't-blocks', 'f-grapes', 't-drum'],
        activeTargetIds: ['bin-fruit', 'bin-toy'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'تصنيف 6 عناصر مختلطة بين الفواكه والألعاب', en: 'Classify all 6 mixed fruits and toys accurately' },
      },
    },
  },
  {
    id: 'lvl-5',
    levelNumber: 5,
    order: 5,
    isPublished: true,
    title: { ar: 'المستوى 5 – إكمال الفراشة', en: 'Level 5 – Complete the Butterfly' },
    objective: { ar: 'إدراك التناظر المكاني وتجميع الأجزاء المتكاملة لصورة واحدة.', en: 'Understand bilateral symmetry by assembling left wing, body, and right wing.' },
    instruction: { ar: 'أكمل صورة الفراشة بتركيب الجناح الأيسر والجسم والجناح الأيمن في مكانهم.', en: 'Complete the butterfly by placing the left wing, center body, and right wing.' },
    audioText: { ar: 'أكمل صورة الفراشة بوضع الجناح الأيسر والجسم والجناح الأيمن.', en: 'Complete the butterfly picture with its left wing, body, and right wing.' },
    hint: { ar: 'الجسم في المنتصف، والجناحان يميناً ويساراً.', en: 'Place the body in the center, flanked by left and right wings.' },
    xpReward: 15,
    validationMode: 'slot_match',
    layoutMode: 'butterfly_triptych',
    sceneKey: 'butterfly',
    pieces: [
      { id: 'bf-left', label: { ar: 'الجناح الأيسر', en: 'Left Wing' }, artworkKey: 'butterfly-wing-l', color: 'bg-pink-50 dark:bg-pink-950/40' },
      { id: 'bf-body', label: { ar: 'جسم الفراشة', en: 'Butterfly Body' }, artworkKey: 'butterfly-body', color: 'bg-purple-50 dark:bg-purple-950/40' },
      { id: 'bf-right', label: { ar: 'الجناح الأيمن', en: 'Right Wing' }, artworkKey: 'butterfly-wing-r', color: 'bg-pink-50 dark:bg-pink-950/40' },
    ],
    targets: [
      { id: 'bt-left', label: { ar: 'يسار', en: 'Left Wing Slot' }, artworkKey: 'butterfly-wing-l', acceptsPieceIds: ['bf-left'], positionSlot: 'left', color: 'border-pink-400' },
      { id: 'bt-body', label: { ar: 'الوسط', en: 'Body Slot' }, artworkKey: 'butterfly-body', acceptsPieceIds: ['bf-body'], positionSlot: 'center', color: 'border-purple-400' },
      { id: 'bt-right', label: { ar: 'يمين', en: 'Right Wing Slot' }, artworkKey: 'butterfly-wing-r', acceptsPieceIds: ['bf-right'], positionSlot: 'right', color: 'border-pink-400' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['bf-left', 'bf-right'],
        activeTargetIds: ['bt-left', 'bt-right'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب الجناحين حول جسم جاهز مسبقاً', en: 'Attach both wings around pre-placed body' },
        instructionOverride: { ar: 'اسحب الجناحين الأيسر والأيمن لإكمال الفراشة.', en: 'Drag the left and right wings to complete the butterfly.' },
      },
      '4-5': {
        activePieceIds: ['bf-left', 'bf-body', 'bf-right'],
        activeTargetIds: ['bt-left', 'bt-body', 'bt-right'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب الأجزاء الثلاثة مع إرشاد بصري', en: 'Assemble all 3 butterfly sections with guides' },
      },
      '5-6': {
        activePieceIds: ['bf-right', 'bf-left', 'bf-body'],
        activeTargetIds: ['bt-left', 'bt-body', 'bt-right'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب متكامل بثلاث قطع بدون تلميحات لونية', en: 'Full 3-part assembly without visual outline crutches' },
      },
    },
  },
  {
    id: 'lvl-6',
    levelNumber: 6,
    order: 6,
    isPublished: true,
    title: { ar: 'المستوى 6 – بناء الحديقة (تركيب النبات)', en: 'Level 6 – Build the Garden' },
    objective: { ar: 'فهم البنية العمودية للنبات وترتيب أجزائه من الأصيص إلى الزهرة.', en: 'Understand vertical plant structure from pot and soil up to stem, leaves, and flower.' },
    instruction: { ar: 'رتب أجزاء النبات في أماكنها من الأسفل إلى الأعلى: الأصيص، التربة، الساق، الأوراق، والزهرة.', en: 'Assemble the garden plant from bottom to top: pot, soil, stem, leaves, and flower.' },
    audioText: { ar: 'رتب أجزاء النبات بالترتيب من الأصيص في الأسفل حتى الزهرة في الأعلى.', en: 'Assemble the plant layers in order from the pot at the bottom up to the flower.' },
    hint: { ar: 'نبدأ بالأصيص والتربة في الأسفل لتنمو الساق والأوراق ثم الزهرة.', en: 'Start with pot and soil at the base, then build stem, leaves, and flower upward.' },
    xpReward: 15,
    validationMode: 'strict_sequence',
    layoutMode: 'plant_vertical',
    sceneKey: 'garden',
    pieces: [
      { id: 'gp-flower', label: { ar: 'الزهرة', en: 'Flower' }, artworkKey: 'garden-flower', sequenceOrder: 5, color: 'bg-rose-50 dark:bg-rose-950/40' },
      { id: 'gp-leaves', label: { ar: 'الأوراق', en: 'Leaves' }, artworkKey: 'garden-leaves', sequenceOrder: 4, color: 'bg-emerald-50 dark:bg-emerald-950/40' },
      { id: 'gp-stem', label: { ar: 'الساق', en: 'Stem' }, artworkKey: 'garden-stem', sequenceOrder: 3, color: 'bg-green-50 dark:bg-green-950/40' },
      { id: 'gp-soil', label: { ar: 'التربة', en: 'Soil' }, artworkKey: 'garden-soil', sequenceOrder: 2, color: 'bg-amber-50 dark:bg-amber-950/40' },
      { id: 'gp-pot', label: { ar: 'الأصيص', en: 'Pot' }, artworkKey: 'garden-pot', sequenceOrder: 1, color: 'bg-orange-50 dark:bg-orange-950/40' },
    ],
    targets: [
      { id: 'gt-flower', label: { ar: '5. الزهرة (أعلى)', en: '5. Flower (Top)' }, artworkKey: 'garden-flower', acceptsPieceIds: ['gp-flower'], sequenceIndex: 5, positionSlot: 'row-1', color: 'border-rose-400' },
      { id: 'gt-leaves', label: { ar: '4. الأوراق', en: '4. Leaves' }, artworkKey: 'garden-leaves', acceptsPieceIds: ['gp-leaves'], sequenceIndex: 4, positionSlot: 'row-2', color: 'border-emerald-400' },
      { id: 'gt-stem', label: { ar: '3. الساق', en: '3. Stem' }, artworkKey: 'garden-stem', acceptsPieceIds: ['gp-stem'], sequenceIndex: 3, positionSlot: 'row-3', color: 'border-green-500' },
      { id: 'gt-soil', label: { ar: '2. التربة', en: '2. Soil' }, artworkKey: 'garden-soil', acceptsPieceIds: ['gp-soil'], sequenceIndex: 2, positionSlot: 'row-4', color: 'border-amber-600' },
      { id: 'gt-pot', label: { ar: '1. الأصيص (أسفل)', en: '1. Pot (Base)' }, artworkKey: 'garden-pot', acceptsPieceIds: ['gp-pot'], sequenceIndex: 1, positionSlot: 'row-5', color: 'border-orange-500' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['gp-pot', 'gp-flower'],
        activeTargetIds: ['gt-flower', 'gt-pot'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب الأصيص والزهرة بشكل مباشر', en: 'Place pot at bottom and flower at top' },
      },
      '4-5': {
        activePieceIds: ['gp-pot', 'gp-stem', 'gp-flower'],
        activeTargetIds: ['gt-flower', 'gt-stem', 'gt-pot'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب 3 طبقات: الأصيص، الساق، والزهرة', en: 'Build 3 layers: pot, stem, and flower' },
      },
      '5-6': {
        activePieceIds: ['gp-flower', 'gp-stem', 'gp-pot', 'gp-leaves', 'gp-soil'],
        activeTargetIds: ['gt-flower', 'gt-leaves', 'gt-stem', 'gt-soil', 'gt-pot'],
        showGhostHints: true,
        strictOrder: true,
        cognitiveNote: { ar: 'تركيب جميع العناصر الـ 5 بالترتيب المنطقي من القاعدة للقمة', en: 'Assemble all 5 layers strictly bottom-to-top in natural order' },
      },
    },
  },
  {
    id: 'lvl-7',
    levelNumber: 7,
    order: 7,
    isPublished: true,
    title: { ar: 'المستوى 7 – لغز المنزل من قطعتين', en: 'Level 7 – Two-Piece House Puzzle' },
    objective: { ar: 'دمج قطعتين متكاملتين لتكوين صورة منزل واحد مترابط.', en: 'Reconstruct one complete cohesive house image from top and bottom halves.' },
    instruction: { ar: 'ركّب سقف المنزل فوق قاعدته لتكوين صورة المنزل الكاملة بدون فجوات.', en: 'Assemble the roof top above the house base to form one seamless cottage.' },
    audioText: { ar: 'ركب قطعتي المنزل لتكوين الصورة الكاملة.', en: 'Join the two house puzzle pieces to rebuild the complete house.' },
    hint: { ar: 'المثلث الأحمر والسماء في الأعلى، والباب والنوافذ في الأسفل.', en: 'Roof and sky belong on top; door and windows belong below.' },
    xpReward: 15,
    validationMode: 'slot_match',
    layoutMode: 'split_2_vertical',
    sceneKey: 'house',
    pieces: [
      { id: 'hp-top', label: { ar: 'النصف العلوي (السقف)', en: 'Top Half (Roof)' }, artworkKey: 'house-top', color: 'bg-sky-50 dark:bg-sky-950/40' },
      { id: 'hp-bot', label: { ar: 'النصف السفلي (القاعدة)', en: 'Bottom Half (Base)' }, artworkKey: 'house-bot', color: 'bg-amber-50 dark:bg-amber-950/40' },
    ],
    targets: [
      { id: 'ht-top', label: { ar: 'النصف العلوي', en: 'Top Half' }, artworkKey: 'house-top', acceptsPieceIds: ['hp-top'], positionSlot: 'top', color: 'border-red-400' },
      { id: 'ht-bot', label: { ar: 'النصف السفلي', en: 'Bottom Half' }, artworkKey: 'house-bot', acceptsPieceIds: ['hp-bot'], positionSlot: 'bottom', color: 'border-amber-400' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['hp-top', 'hp-bot'],
        activeTargetIds: ['ht-top', 'ht-bot'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'قطعتان كبيرتان مع دليل خطي للمنزل', en: 'Two large halves with clear outline guide' },
      },
      '4-5': {
        activePieceIds: ['hp-bot', 'hp-top'],
        activeTargetIds: ['ht-top', 'ht-bot'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'قطعتان بترتيب معكوس في الصندوق', en: 'Shuffled two-piece cottage reconstruction' },
      },
      '5-6': {
        activePieceIds: ['hp-bot', 'hp-top'],
        activeTargetIds: ['ht-top', 'ht-bot'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب الصورة الكاملة بدون خلفية مساعدة', en: 'Assemble seamless house without background clue' },
      },
    },
  },
  {
    id: 'lvl-8',
    levelNumber: 8,
    order: 8,
    isPublished: true,
    title: { ar: 'المستوى 8 – شرائح صورة الصاروخ', en: 'Level 8 – Rocket Picture Strips' },
    objective: { ar: 'تجميع 3 شرائح أفقية متصلة لإعادة بناء صورة صاروخ فضائي واحد.', en: 'Align 3 seamless horizontal image strips vertically to rebuild one space rocket.' },
    instruction: { ar: 'رتب الشرائح الثلاث بالترتيب الصحيح لتكوين صاروخ الفضاء كاملاً.', en: 'Arrange the three picture strips to reconstruct one complete space rocket.' },
    audioText: { ar: 'رتب شرائح الصاروخ الثلاث لتكوين الصورة الكاملة.', en: 'Arrange the three rocket strips from top to bottom.' },
    hint: { ar: 'المقدمة المدببة في الأعلى، النافذة في الوسط، واللهب في الأسفل.', en: 'Nose cone on top, cabin window in middle, flame booster at bottom.' },
    xpReward: 15,
    validationMode: 'slot_match',
    layoutMode: 'split_3_strips',
    sceneKey: 'rocket',
    pieces: [
      { id: 'rs-2', label: { ar: 'جسم الصاروخ والنافذة', en: 'Cabin Strip' }, artworkKey: 'rocket-strip-2', color: 'bg-slate-800' },
      { id: 'rs-1', label: { ar: 'مقدمة الصاروخ', en: 'Nose Cone Strip' }, artworkKey: 'rocket-strip-1', color: 'bg-slate-800' },
      { id: 'rs-3', label: { ar: 'المحرك واللهب', en: 'Booster Strip' }, artworkKey: 'rocket-strip-3', color: 'bg-slate-800' },
    ],
    targets: [
      { id: 'rt-1', label: { ar: 'الشريحة العلوية (1)', en: 'Top Strip (1)' }, artworkKey: 'rocket-strip-1', acceptsPieceIds: ['rs-1'], positionSlot: 'strip-1', color: 'border-red-400' },
      { id: 'rt-2', label: { ar: 'الشريحة الوسطى (2)', en: 'Middle Strip (2)' }, artworkKey: 'rocket-strip-2', acceptsPieceIds: ['rs-2'], positionSlot: 'strip-2', color: 'border-sky-400' },
      { id: 'rt-3', label: { ar: 'الشريحة السفلية (3)', en: 'Bottom Strip (3)' }, artworkKey: 'rocket-strip-3', acceptsPieceIds: ['rs-3'], positionSlot: 'strip-3', color: 'border-amber-400' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['rs-1', 'rs-3'],
        activeTargetIds: ['rt-1', 'rt-3'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'إكمال المقدمة والمحرك حول شريحة الوسط', en: 'Attach top nose and bottom engine with center shown' },
      },
      '4-5': {
        activePieceIds: ['rs-2', 'rs-1', 'rs-3'],
        activeTargetIds: ['rt-1', 'rt-2', 'rt-3'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تجميع الشرائح الثلاث بالاستعانة بالظل', en: 'Assemble all 3 strips with visual silhouettes' },
      },
      '5-6': {
        activePieceIds: ['rs-3', 'rs-1', 'rs-2'],
        activeTargetIds: ['rt-1', 'rt-2', 'rt-3'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'تجميع مستقل بدون تلميحات على اللوحة', en: 'Independent 3-strip rocket assembly without outline hints' },
      },
    },
  },
  {
    id: 'lvl-9',
    levelNumber: 9,
    order: 9,
    isPublished: true,
    title: { ar: 'المستوى 9 – لغز السمكة من 3 قطع', en: 'Level 9 – Three-Piece Fish Puzzle' },
    objective: { ar: 'ربط أجزاء الكائن الحي أفقياً لتكوين سمكة متصلة.', en: 'Connect tail, striped torso, and smiling head horizontally into one fish.' },
    instruction: { ar: 'ركّب الذيل والجسم والرأس بجانب بعضهم لتكوين سمكة البحر الكاملة.', en: 'Connect the tail, body, and head horizontally to form the complete fish.' },
    audioText: { ar: 'ركب ذيل السمكة وجسمها ورأسها لتسبح في البحر.', en: 'Connect the fish tail, body, and head to make one swimming fish.' },
    hint: { ar: 'الذيل في اليسار، الجسم المخطط في الوسط، والوجه المبتسم في اليمين.', en: 'Tail goes on the left, striped torso in middle, and face on the right.' },
    xpReward: 15,
    validationMode: 'slot_match',
    layoutMode: 'split_3_horizontal',
    sceneKey: 'fish',
    pieces: [
      { id: 'fp-head', label: { ar: 'رأس السمكة', en: 'Fish Head' }, artworkKey: 'fish-head', color: 'bg-cyan-50 dark:bg-cyan-950/40' },
      { id: 'fp-tail', label: { ar: 'ذيل السمكة', en: 'Fish Tail' }, artworkKey: 'fish-tail', color: 'bg-cyan-50 dark:bg-cyan-950/40' },
      { id: 'fp-body', label: { ar: 'جسم السمكة', en: 'Fish Body' }, artworkKey: 'fish-body', color: 'bg-cyan-50 dark:bg-cyan-950/40' },
    ],
    targets: [
      { id: 'ft-tail', label: { ar: 'الذيل (يسار)', en: 'Tail (Left)' }, artworkKey: 'fish-tail', acceptsPieceIds: ['fp-tail'], positionSlot: 'col-1', color: 'border-cyan-400' },
      { id: 'ft-body', label: { ar: 'الجسم (وسط)', en: 'Body (Center)' }, artworkKey: 'fish-body', acceptsPieceIds: ['fp-body'], positionSlot: 'col-2', color: 'border-amber-400' },
      { id: 'ft-head', label: { ar: 'الرأس (يمين)', en: 'Head (Right)' }, artworkKey: 'fish-head', acceptsPieceIds: ['fp-head'], positionSlot: 'col-3', color: 'border-orange-400' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['fp-tail', 'fp-head'],
        activeTargetIds: ['ft-tail', 'ft-head'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب الذيل والرأس حول الجسم المثبت', en: 'Match head and tail around pre-placed torso' },
      },
      '4-5': {
        activePieceIds: ['fp-head', 'fp-tail', 'fp-body'],
        activeTargetIds: ['ft-tail', 'ft-body', 'ft-head'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'ربط القطع الثلاث بالترتيب الأفقي', en: 'Join all 3 horizontal parts with guides' },
      },
      '5-6': {
        activePieceIds: ['fp-body', 'fp-head', 'fp-tail'],
        activeTargetIds: ['ft-tail', 'ft-body', 'ft-head'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'إعادة بناء السمكة كاملة دون مساعدة بصرية', en: 'Complete unguided 3-piece horizontal fish puzzle' },
      },
    },
  },
  {
    id: 'lvl-10',
    levelNumber: 10,
    order: 10,
    isPublished: true,
    title: { ar: 'المستوى 10 – لغز الشجرة من 4 قطع', en: 'Level 10 – Four-Piece Tree Puzzle' },
    objective: { ar: 'حل شبكة ثنائية الأبعاد (2×2) لإعادة تكوين شجرة تفاح كاملة متناسقة.', en: 'Solve a 2x2 geometric quadrant grid to reconstruct one unified apple tree.' },
    instruction: { ar: 'ركّب الأرباع الأربعة في الشبكة لتكوين صورة الشجرة الكاملة بدون أي فواصل.', en: 'Place the four matching quadrant pieces into the 2x2 grid to complete the apple tree.' },
    audioText: { ar: 'ركب الأجزاء الأربعة لتكوين صورة الشجرة الكاملة.', en: 'Assemble all four quadrant pieces into one complete tree picture.' },
    hint: { ar: 'أوراق الشجرة والتفاح في الصف العلوي، والجذع والعشب في الصف السفلي.', en: 'Green canopy belongs in the top row; trunk and grass belong in the bottom row.' },
    xpReward: 20,
    validationMode: 'slot_match',
    layoutMode: 'grid_2x2',
    sceneKey: 'tree',
    pieces: [
      { id: 'tp-br', label: { ar: 'أسفل يمين (جذع)', en: 'Bottom-Right' }, artworkKey: 'tree-br', color: 'bg-emerald-50 dark:bg-emerald-950/40' },
      { id: 'tp-tl', label: { ar: 'أعلى يسار (أوراق)', en: 'Top-Left' }, artworkKey: 'tree-tl', color: 'bg-emerald-50 dark:bg-emerald-950/40' },
      { id: 'tp-bl', label: { ar: 'أسفل يسار (جذع)', en: 'Bottom-Left' }, artworkKey: 'tree-bl', color: 'bg-emerald-50 dark:bg-emerald-950/40' },
      { id: 'tp-tr', label: { ar: 'أعلى يمين (أوراق)', en: 'Top-Right' }, artworkKey: 'tree-tr', color: 'bg-emerald-50 dark:bg-emerald-950/40' },
    ],
    targets: [
      { id: 'tt-tl', label: { ar: 'أعلى يسار', en: 'Top-Left' }, artworkKey: 'tree-tl', acceptsPieceIds: ['tp-tl'], positionSlot: 'q-tl', color: 'border-emerald-500' },
      { id: 'tt-tr', label: { ar: 'أعلى يمين', en: 'Top-Right' }, artworkKey: 'tree-tr', acceptsPieceIds: ['tp-tr'], positionSlot: 'q-tr', color: 'border-emerald-500' },
      { id: 'tt-bl', label: { ar: 'أسفل يسار', en: 'Bottom-Left' }, artworkKey: 'tree-bl', acceptsPieceIds: ['tp-bl'], positionSlot: 'q-bl', color: 'border-amber-600' },
      { id: 'tt-br', label: { ar: 'أسفل يمين', en: 'Bottom-Right' }, artworkKey: 'tree-br', acceptsPieceIds: ['tp-br'], positionSlot: 'q-br', color: 'border-amber-600' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['tp-tl', 'tp-tr'],
        activeTargetIds: ['tt-tl', 'tt-tr'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب قمة الشجرة المكونة من قطعتين', en: 'Complete top 2 canopy quadrants while trunk stays mounted' },
      },
      '4-5': {
        activePieceIds: ['tp-tl', 'tp-tr', 'tp-bl', 'tp-br'],
        activeTargetIds: ['tt-tl', 'tt-tr', 'tt-bl', 'tt-br'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'حل الشبكة الرباعية مع تلميحات المربعات', en: 'Solve 2x2 tree grid with quadrant guides' },
      },
      '5-6': {
        activePieceIds: ['tp-br', 'tp-tl', 'tp-bl', 'tp-tr'],
        activeTargetIds: ['tt-tl', 'tt-tr', 'tt-bl', 'tt-br'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب الشبكة الرباعية بالاعتماد على الاستنتاج المكاني فقط', en: 'Full 2x2 grid assembly via spatial continuity alone' },
      },
    },
  },
  {
    id: 'lvl-11',
    levelNumber: 11,
    order: 11,
    isPublished: true,
    title: { ar: 'المستوى 11 – ترتيب خطوات الزراعة', en: 'Level 11 – Order Planting Steps' },
    objective: { ar: 'التفكير التسلسلي المنطقي والتحقق الصارم من ترتيب الخطوات الزمنية.', en: 'Sequential computational thinking with strict chronological step validation.' },
    instruction: { ar: 'رتّب خطوات الزراعة بالترتيب الصحيح خطوة بخطوة: 1) وضع البذرة، 2) سقي الماء، 3) نمو النبتة.', en: 'Order planting steps strictly in sequence: Step 1 (Seed), Step 2 (Water), Step 3 (Sprout).' },
    audioText: { ar: 'رتب خطوات الزراعة بالتسلسل الصحيح: البذرة أولاً، ثم الماء، ثم النبتة.', en: 'Place the planting steps in strict order: seed first, then water, then sprout.' },
    hint: { ar: 'لا يمكننا سقي النبتة قبل وضع البذرة أولاً في الخطوة 1!', en: 'Remember: you must plant the seed in Step 1 before watering in Step 2!' },
    xpReward: 20,
    validationMode: 'strict_sequence',
    layoutMode: 'sequence_track',
    sceneKey: 'sequence',
    pieces: [
      { id: 'sq-sprout', label: { ar: 'نمو النبتة', en: 'Sprout Blooms' }, artworkKey: 'seq-sprout', sequenceOrder: 3, color: 'bg-emerald-50 dark:bg-emerald-950/40' },
      { id: 'sq-seed', label: { ar: 'وضع البذرة', en: 'Plant Seed' }, artworkKey: 'seq-seed', sequenceOrder: 1, color: 'bg-amber-50 dark:bg-amber-950/40' },
      { id: 'sq-water', label: { ar: 'سقي الماء', en: 'Water Soil' }, artworkKey: 'seq-water', sequenceOrder: 2, color: 'bg-sky-50 dark:bg-sky-950/40' },
    ],
    targets: [
      { id: 'st-1', label: { ar: 'الخطوة 1', en: 'Step 1' }, artworkKey: 'seq-seed', acceptsPieceIds: ['sq-seed'], sequenceIndex: 1, positionSlot: 'step-1', color: 'border-amber-500' },
      { id: 'st-2', label: { ar: 'الخطوة 2', en: 'Step 2' }, artworkKey: 'seq-water', acceptsPieceIds: ['sq-water'], sequenceIndex: 2, positionSlot: 'step-2', color: 'border-sky-500' },
      { id: 'st-3', label: { ar: 'الخطوة 3', en: 'Step 3' }, artworkKey: 'seq-sprout', acceptsPieceIds: ['sq-sprout'], sequenceIndex: 3, positionSlot: 'step-3', color: 'border-emerald-500' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['sq-seed', 'sq-sprout'],
        activeTargetIds: ['st-1', 'st-3'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'مقارنة البداية والنهاية (بذرة ثم نبتة)', en: 'Compare start and end states (seed to sprout)' },
      },
      '4-5': {
        activePieceIds: ['sq-water', 'sq-seed', 'sq-sprout'],
        activeTargetIds: ['st-1', 'st-2', 'st-3'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'ترتيب 3 خطوات مع تلميحات مرقمة', en: 'Place all 3 stages with visual numbered hints' },
      },
      '5-6': {
        activePieceIds: ['sq-sprout', 'sq-water', 'sq-seed'],
        activeTargetIds: ['st-1', 'st-2', 'st-3'],
        showGhostHints: false,
        strictOrder: true,
        cognitiveNote: { ar: 'تنفيذ تسلسلي صارم: يجب إكمال الخطوة 1 قبل 2 قبل 3', en: 'Strict chronological lock: Step 1 must complete before Step 2 and Step 3' },
      },
    },
  },
  {
    id: 'lvl-12',
    levelNumber: 12,
    order: 12,
    isPublished: true,
    title: { ar: 'المستوى 12 – التجميع النهائي لمعمل سمارت تك', en: 'Level 12 – SmartTech Lab Master Assembly' },
    objective: { ar: 'تطبيق كل مهارات التصنيف والتركيب لإعداد معمل الروبوتات المتكامل.', en: 'Apply spatial assembly and logic to equip the complete SmartTech Robotics Laboratory.' },
    instruction: { ar: 'ركّب وحدة المعالج، ولوحة الدوائر، وروبوت سمارت، ونجمة التفوق لتجهيز معمل سمارت تك!', en: 'Dock the AI Processor, Circuit Board, SmartTech Robot, and Gold Badge to complete the workshop!' },
    audioText: { ar: 'أحسنت وصولك للتحدي النهائي! جهز معمل سمارت تك بكل مكوناته.', en: 'Welcome to the Master Challenge! Assemble all components of the SmartTech Lab.' },
    hint: { ar: 'طابق كل جهاز في محطته المخصصة على طاولة المعمل الذكية.', en: 'Dock each robotics component into its labeled lab workbench station.' },
    xpReward: 30,
    validationMode: 'slot_match',
    layoutMode: 'lab_scene',
    sceneKey: 'lab',
    pieces: [
      { id: 'lab-cpu', label: { ar: 'وحدة المعالج', en: 'AI Core CPU' }, artworkKey: 'lab-cpu', color: 'bg-slate-100 dark:bg-slate-800' },
      { id: 'lab-robot', label: { ar: 'روبوت سمارت', en: 'Smart Robot' }, artworkKey: 'lab-robot', color: 'bg-red-50 dark:bg-red-950/40' },
      { id: 'lab-circuit', label: { ar: 'لوحة الدوائر', en: 'Circuit Board' }, artworkKey: 'lab-circuit', color: 'bg-emerald-50 dark:bg-emerald-950/40' },
      { id: 'lab-star', label: { ar: 'وسام الماستر', en: 'Master Star' }, artworkKey: 'lab-star', color: 'bg-amber-50 dark:bg-amber-950/40' },
    ],
    targets: [
      { id: 'lt-cpu', label: { ar: 'محطة المعالج', en: 'CPU Station' }, artworkKey: 'lab-cpu', acceptsPieceIds: ['lab-cpu'], positionSlot: 'station-1', color: 'border-sky-500' },
      { id: 'lt-robot', label: { ar: 'منصة الروبوت', en: 'Robot Dock' }, artworkKey: 'lab-robot', acceptsPieceIds: ['lab-robot'], positionSlot: 'station-2', color: 'border-red-500' },
      { id: 'lt-circuit', label: { ar: 'لوحة المستشعرات', en: 'Sensor Bench' }, artworkKey: 'lab-circuit', acceptsPieceIds: ['lab-circuit'], positionSlot: 'station-3', color: 'border-emerald-500' },
      { id: 'lt-star', label: { ar: 'حامل الوسام', en: 'Badge Trophy' }, artworkKey: 'lab-star', acceptsPieceIds: ['lab-star'], positionSlot: 'station-4', color: 'border-amber-500' },
    ],
    ageVariants: {
      '3-4': {
        activePieceIds: ['lab-robot', 'lab-star'],
        activeTargetIds: ['lt-robot', 'lt-star'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تركيب الروبوت والوسام الذهبي في المعمل', en: 'Dock Smart Robot and Gold Star into the lab' },
      },
      '4-5': {
        activePieceIds: ['lab-cpu', 'lab-robot', 'lab-star'],
        activeTargetIds: ['lt-cpu', 'lt-robot', 'lt-star'],
        showGhostHints: true,
        strictOrder: false,
        cognitiveNote: { ar: 'تجهيز 3 محطات رئيسية داخل المعمل', en: 'Equip 3 core lab stations with silhouettes' },
      },
      '5-6': {
        activePieceIds: ['lab-circuit', 'lab-star', 'lab-cpu', 'lab-robot'],
        activeTargetIds: ['lt-cpu', 'lt-robot', 'lt-circuit', 'lt-star'],
        showGhostHints: false,
        strictOrder: false,
        cognitiveNote: { ar: 'إعداد المعمل الهندسي الكامل من 4 مكونات متقدمة', en: 'Full 4-station robotics laboratory integration challenge' },
      },
    },
  },
];

export const jigsawLevelsData: JigsawLevelConfig[] = defaultJigsawLevelsData;

export function loadJigsawLevels(): JigsawLevelConfig[] {
  if (typeof window === 'undefined') return defaultJigsawLevelsData;
  try {
    const raw = window.localStorage.getItem(LEVELS_STORAGE_KEY);
    if (!raw) return defaultJigsawLevelsData;
    const parsed = JSON.parse(raw) as JigsawLevelConfig[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return [...parsed].sort((a, b) => a.order - b.order);
    }
  } catch {
    // Fallback to defaults if malformed
  }
  return defaultJigsawLevelsData;
}

export function saveJigsawLevels(levels: JigsawLevelConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = [...levels]
      .sort((a, b) => a.order - b.order)
      .map((lvl, idx) => ({ ...lvl, order: idx + 1, levelNumber: idx + 1 }));
    window.localStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('smartcoders:levels-updated'));
  } catch {
    // Ignore storage quota issues
  }
}

export function resetJigsawLevelsToDefault(): JigsawLevelConfig[] {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LEVELS_STORAGE_KEY);
    window.dispatchEvent(new Event('smartcoders:levels-updated'));
  }
  return defaultJigsawLevelsData;
}

export function loadStudentProgress(fallback: StudentProgress): StudentProgress {
  const defaultUnlocked: Record<JuniorAgeGroup, number> = {
    '3-4': 1,
    '4-5': 1,
    '5-6': 1,
  };
  if (typeof window === 'undefined') {
    return {
      ...fallback,
      xpEarned: fallback.xpEarned ?? fallback.starsEarned * 10,
      selectedAgeGroup: fallback.selectedAgeGroup ?? '4-5',
      unlockedJigsawByAge: fallback.unlockedJigsawByAge ?? defaultUnlocked,
      enjoymentRatings: fallback.enjoymentRatings ?? {},
    };
  }
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StudentProgress;
      return {
        ...fallback,
        ...parsed,
        xpEarned: parsed.xpEarned ?? (parsed.starsEarned || 0) * 10,
        selectedAgeGroup: parsed.selectedAgeGroup ?? '4-5',
        unlockedJigsawByAge: { ...defaultUnlocked, ...(parsed.unlockedJigsawByAge || {}) },
        enjoymentRatings: parsed.enjoymentRatings ?? {},
      };
    }
  } catch {
    // Fallback
  }
  return {
    ...fallback,
    xpEarned: fallback.xpEarned ?? fallback.starsEarned * 10,
    selectedAgeGroup: fallback.selectedAgeGroup ?? '4-5',
    unlockedJigsawByAge: fallback.unlockedJigsawByAge ?? defaultUnlocked,
    enjoymentRatings: fallback.enjoymentRatings ?? {},
  };
}

export function saveStudentProgress(progress: StudentProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota issues
  }
}
