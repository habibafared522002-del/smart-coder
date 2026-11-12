export interface JigsawPiece {
  id: string;
  label: { ar: string; en: string };
  emoji: string;
  color: string;
}

export interface JigsawLevelConfig {
  levelNumber: number;
  title: { ar: string; en: string };
  instruction: { ar: string; en: string };
  objective: { ar: string; en: string };
  pieces: JigsawPiece[];
  targets: JigsawPiece[];
  xpReward: number;
  hint: { ar: string; en: string };
}

export type JigsawLevel = JigsawLevelConfig;

export const jigsawLevelsData: JigsawLevelConfig[] = [
  {
    levelNumber: 1,
    title: { ar: 'المستوى 1 – مطابقة الأشكال الهندسية', en: 'Level 1 – Shape Matching' },
    instruction: { ar: 'اسحب أو اضغط على الأشكال وضع كل شكل في مكانه الصحيح.', en: 'Match each geometric shape to its correct slot.' },
    objective: { ar: 'مستوى أساسي بمطابقة شكلين.', en: 'Basic level with 2 shapes matching.' },
    pieces: [
      { id: 'shape-circle', label: { ar: 'دائرة زرقاء', en: 'Blue Circle' }, emoji: '🔵', color: 'bg-blue-500' },
      { id: 'shape-square', label: { ar: 'مربع أحمر', en: 'Red Square' }, emoji: '🟥', color: 'bg-red-500' }
    ],
    targets: [
      { id: 'shape-circle', label: { ar: 'مكان الدائرة', en: 'Circle Slot' }, emoji: '⭕', color: 'bg-blue-100 dark:bg-blue-950' },
      { id: 'shape-square', label: { ar: 'مكان المربع', en: 'Square Slot' }, emoji: '⏹️', color: 'bg-red-100 dark:bg-red-950' }
    ],
    xpReward: 5,
    hint: { ar: 'اختر الدائرة ثم ضعها في هدفها الدائري.', en: 'Select circle and place in its target.' }
  },
  {
    levelNumber: 2,
    title: { ar: 'المستوى 2 – مطابقة الظلال', en: 'Level 2 – Match the Shadows' },
    instruction: { ar: 'طابق كل عنصر مع ظله الصحيح في اليمين.', en: 'Match each object with its correct shadow on the right.' },
    objective: { ar: 'مطابقة الأجسام بظلالها (قطعتان).', en: 'Object-to-shadow matching (2 pieces).' },
    pieces: [
      { id: 'veh-car', label: { ar: 'سيارة حمراء', en: 'Red Car' }, emoji: '🚗', color: 'bg-red-600' },
      { id: 'ball-play', label: { ar: 'كرة قدم', en: 'Soccer Ball' }, emoji: '⚽', color: 'bg-emerald-600' }
    ],
    targets: [
      { id: 'ball-play', label: { ar: 'ظل الكرة', en: 'Ball Shadow' }, emoji: '⚫', color: 'bg-emerald-100 dark:bg-emerald-950' },
      { id: 'veh-car', label: { ar: 'ظل السيارة', en: 'Car Shadow' }, emoji: '🚙', color: 'bg-red-100 dark:bg-red-950' }
    ],
    xpReward: 5,
    hint: { ar: 'ابحث عن الظل المطابق لكل لعبة وسارة.', en: 'Find matching shadow for car and ball.' }
  },
  {
    levelNumber: 3,
    title: { ar: 'المستوى 3 – تركيب الروبوت الذكي', en: 'Level 3 – Build the Smart Robot' },
    instruction: { ar: 'ركب رأس الروبوت، والجسم، والأطراف في مكانها الصحيح.', en: 'Assemble the robot head, body, and limbs in their correct places.' },
    objective: { ar: 'لغز مركب من 3 أجزاء.', en: '3-piece composite puzzle.' },
    pieces: [
      { id: 'robot-head', label: { ar: 'رأس الروبوت', en: 'Robot Head' }, emoji: '🤖', color: 'bg-indigo-500' },
      { id: 'robot-body', label: { ar: 'جسم الروبوت', en: 'Robot Torso' }, emoji: '🦾', color: 'bg-blue-500' },
      { id: 'robot-legs', label: { ar: 'أرجل الروبوت', en: 'Robot Legs' }, emoji: '🦿', color: 'bg-slate-600' }
    ],
    targets: [
      { id: 'robot-head', label: { ar: 'مكان الرأس (علوي)', en: 'Head Slot' }, emoji: '👤', color: 'bg-indigo-100 dark:bg-indigo-950' },
      { id: 'robot-body', label: { ar: 'مكان الجسم (أوسط)', en: 'Torso Slot' }, emoji: '👕', color: 'bg-blue-100 dark:bg-blue-950' },
      { id: 'robot-legs', label: { ar: 'مكان الأرجل (سفلي)', en: 'Legs Slot' }, emoji: '👖', color: 'bg-slate-200 dark:bg-slate-800' }
    ],
    xpReward: 8,
    hint: { ar: 'رتب أجزاء الروبوت من الأعلى للأسفل.', en: 'Arrange robot parts from top to bottom.' }
  },
  {
    levelNumber: 4,
    title: { ar: 'المستوى 4 – تصنيف العناصر (فواكه وألعاب)', en: 'Level 4 – Sorting Objects' },
    instruction: { ar: 'ضع التفاحة في سلة الفواكه والدب في صندوق الألعاب.', en: 'Put the apple in fruit basket and teddy bear in toy box.' },
    objective: { ar: 'تصنيف العناصر إلى فئات مختلفة.', en: 'Sorting items into categories.' },
    pieces: [
      { id: 'fruit-apple', label: { ar: 'تفاحة حمراء', en: 'Red Apple' }, emoji: '🍎', color: 'bg-red-500' },
      { id: 'toy-bear', label: { ar: 'دبدوب لعبة', en: 'Teddy Bear' }, emoji: '🧸', color: 'bg-amber-600' }
    ],
    targets: [
      { id: 'fruit-apple', label: { ar: 'سلة الفواكه', en: 'Fruit Basket' }, emoji: '🧺', color: 'bg-red-100 dark:bg-red-950' },
      { id: 'toy-bear', label: { ar: 'صندوق الألعاب', en: 'Toy Box' }, emoji: '📦', color: 'bg-amber-100 dark:bg-amber-950' }
    ],
    xpReward: 8,
    hint: { ar: 'كل عنصر ينتمي إلى مكانه المخصص.', en: 'Each item belongs in its designated place.' }
  },
  {
    levelNumber: 5,
    title: { ar: 'المستوى 5 – إكمال الفراشة السحرية', en: 'Level 5 – Complete the Butterfly' },
    instruction: { ar: 'ركب نصفي الجناح الأيمن والأيسر لإكمال الفراشة.', en: 'Assemble left and right wing halves to complete the butterfly.' },
    objective: { ar: 'إكمال الأجزاء المتناظرة (قطعتان).', en: 'Symmetric parts completion.' },
    pieces: [
      { id: 'wing-left', label: { ar: 'الجناح الأيسر', en: 'Left Wing' }, emoji: '🦋', color: 'bg-pink-500' },
      { id: 'wing-right', label: { ar: 'الجناح الأيمن', en: 'Right Wing' }, emoji: '✨', color: 'bg-purple-500' }
    ],
    targets: [
      { id: 'wing-left', label: { ar: 'الجانب الأيسر', en: 'Left Side' }, emoji: '⬅️', color: 'bg-pink-100 dark:bg-pink-950' },
      { id: 'wing-right', label: { ar: 'الجانب الأيمن', en: 'Right Side' }, emoji: '➡️', color: 'bg-purple-100 dark:bg-purple-950' }
    ],
    xpReward: 10,
    hint: { ar: 'كل جناح في مكانه المناسب.', en: 'Place each wing in its correct side.' }
  },
  {
    levelNumber: 6,
    title: { ar: 'المستوى 6 – بناء حديقة الذكاء الاصطناعي', en: 'Level 6 – Build the Smart Garden' },
    instruction: { ar: 'رتب الزهرة والشمس وقطرة الماء في الحديقة.', en: 'Arrange flower, sun, and water drop in the garden.' },
    objective: { ar: 'تركيب 3 عناصر بيئية.', en: 'Assembling 3 environmental elements.' },
    pieces: [
      { id: 'garden-flower', label: { ar: 'زهرة متفتحة', en: 'Blooming Flower' }, emoji: '🌸', color: 'bg-rose-500' },
      { id: 'garden-sun', label: { ar: 'شمس ساطعة', en: 'Bright Sun' }, emoji: '☀️', color: 'bg-amber-400' },
      { id: 'garden-water', label: { ar: 'قطرة ماء', en: 'Water Drop' }, emoji: '💧', color: 'bg-blue-500' }
    ],
    targets: [
      { id: 'garden-flower', label: { ar: 'مكان الزهرة', en: 'Flower Spot' }, emoji: '🪴', color: 'bg-rose-100 dark:bg-rose-950' },
      { id: 'garden-sun', label: { ar: 'مكان الشمس', en: 'Sun Spot' }, emoji: '🌤️', color: 'bg-amber-100 dark:bg-amber-950' },
      { id: 'garden-water', label: { ar: 'مكان الماء', en: 'Water Spot' }, emoji: '🌱', color: 'bg-blue-100 dark:bg-blue-950' }
    ],
    xpReward: 10,
    hint: { ar: 'اجمع عناصر نمو النبات في الحديقة.', en: 'Combine plant growth elements in garden.' }
  },
  {
    levelNumber: 7,
    title: { ar: 'المستوى 7 – تركيب المنزل الذكي', en: 'Level 7 – Smart House Puzzle' },
    instruction: { ar: 'ركب سقف المنزل فوق قاعدته المنيعة.', en: 'Assemble the house roof over its solid base.' },
    objective: { ar: 'لغز هندسي من قطعتين.', en: 'Two-piece architectural puzzle.' },
    pieces: [
      { id: 'house-top', label: { ar: 'سقف المنزل الأحمر', en: 'House Roof' }, emoji: '🏠', color: 'bg-red-500' },
      { id: 'house-bot', label: { ar: 'قاعدة المنزل الحجرية', en: 'House Base' }, emoji: '🧱', color: 'bg-amber-600' }
    ],
    targets: [
      { id: 'house-top', label: { ar: 'مكان السقف (علوي)', en: 'Roof Target' }, emoji: '🔺', color: 'bg-red-100 dark:bg-red-950' },
      { id: 'house-bot', label: { ar: 'مكان القاعدة (سفلي)', en: 'Base Target' }, emoji: '🟩', color: 'bg-amber-100 dark:bg-amber-950' }
    ],
    xpReward: 12,
    hint: { ar: 'السقف فوق القاعدة دائماً.', en: 'Roof goes above base.' }
  },
  {
    levelNumber: 8,
    title: { ar: 'المستوى 8 – رحلة الفضاء (الصاروخ)', en: 'Level 8 – Space Rocket Assembly' },
    instruction: { ar: 'رتب أجزاء الصاروخ الثلاثة من الرأس إلى المحرك.', en: 'Arrange the three rocket parts from nose cone to engine.' },
    objective: { ar: 'تسلسل وترتيب رأسي (3 شرائح).', en: 'Vertical sequencing (3 strips).' },
    pieces: [
      { id: 'roc-1', label: { ar: 'رأس الصاروخ', en: 'Nose Cone' }, emoji: '🚀', color: 'bg-red-500' },
      { id: 'roc-2', label: { ar: 'جسم الصاروخ', en: 'Body Tube' }, emoji: '⬜', color: 'bg-slate-300' },
      { id: 'roc-3', label: { ar: 'محرك الدفع', en: 'Engine Nozzle' }, emoji: '🔥', color: 'bg-amber-500' }
    ],
    targets: [
      { id: 'roc-1', label: { ar: 'الهدف العلوي (1)', en: 'Top Slot' }, emoji: '1️⃣', color: 'bg-red-100 dark:bg-red-950' },
      { id: 'roc-2', label: { ar: 'الهدف الأوسط (2)', en: 'Middle Slot' }, emoji: '2️⃣', color: 'bg-slate-200 dark:bg-slate-800' },
      { id: 'roc-3', label: { ar: 'الهدف السفلي (3)', en: 'Bottom Slot' }, emoji: '3️⃣', color: 'bg-amber-100 dark:bg-amber-950' }
    ],
    xpReward: 12,
    hint: { ar: 'رتب أجزاء الصاروخ بالتسلسل.', en: 'Arrange rocket parts sequentially.' }
  },
  {
    levelNumber: 9,
    title: { ar: 'المستوى 9 – تركيب السمكة الملونة', en: 'Level 9 – Colorful Fish Puzzle' },
    instruction: { ar: 'ركب رأس السمكة وجسمها وذيلها في المحيط.', en: 'Assemble fish head, body, and tail in the ocean.' },
    objective: { ar: 'لغز تفصيلي من 3 قطع.', en: 'Detailed 3-piece puzzle.' },
    pieces: [
      { id: 'fish-head', label: { ar: 'رأس السمكة', en: 'Fish Head' }, emoji: '🐠', color: 'bg-amber-400' },
      { id: 'fish-body', label: { ar: 'جسم السمكة', en: 'Fish Body' }, emoji: '🐟', color: 'bg-orange-500' },
      { id: 'fish-tail', label: { ar: 'ذيل السمكة', en: 'Fish Tail' }, emoji: '🌊', color: 'bg-cyan-500' }
    ],
    targets: [
      { id: 'fish-head', label: { ar: 'مكان الرأس', en: 'Head Slot' }, emoji: '🐠', color: 'bg-amber-100 dark:bg-amber-950' },
      { id: 'fish-body', label: { ar: 'مكان الجسم', en: 'Body Slot' }, emoji: '🐟', color: 'bg-orange-100 dark:bg-orange-950' },
      { id: 'fish-tail', label: { ar: 'مكان الذيل', en: 'Tail Slot' }, emoji: '🌊', color: 'bg-cyan-100 dark:bg-cyan-950' }
    ],
    xpReward: 15,
    hint: { ar: 'صل الرأس بالجسم ثم الذيل.', en: 'Connect head to body then tail.' }
  },
  {
    levelNumber: 10,
    title: { ar: 'المستوى 10 – لغز الشجرة الكبيرة (4 قطع)', en: 'Level 10 – Giant Tree Puzzle' },
    instruction: { ar: 'ركب أجزاء الشجرة الأربعة (الأوراق والجذع).', en: 'Assemble the 4 tree parts (leaves and trunk).' },
    objective: { ar: 'لغز متقدم من 4 قطع.', en: 'Advanced 4-piece puzzle.' },
    pieces: [
      { id: 'tree-tl1', label: { ar: 'الفرع العلوي يسار', en: 'Top-Left Leaf' }, emoji: '🍃', color: 'bg-emerald-400' },
      { id: 'tree-tr1', label: { ar: 'الفرع العلوي يمين', en: 'Top-Right Leaf' }, emoji: '🍏', color: 'bg-emerald-500' },
      { id: 'tree-bl1', label: { ar: 'الجذع يسار', en: 'Trunk Left' }, emoji: '🟫', color: 'bg-amber-800' },
      { id: 'tree-br1', label: { ar: 'الجذع يمين', en: 'Trunk Right' }, emoji: '🪵', color: 'bg-amber-700' }
    ],
    targets: [
      { id: 'tree-tl1', label: { ar: 'هدف 1 (يسار علوي)', en: 'Slot 1' }, emoji: '🍃', color: 'bg-emerald-100 dark:bg-emerald-950' },
      { id: 'tree-tr1', label: { ar: 'هدف 2 (يمين علوي)', en: 'Slot 2' }, emoji: '🍏', color: 'bg-emerald-100 dark:bg-emerald-950' },
      { id: 'tree-bl1', label: { ar: 'هدف 3 (يسار سفلي)', en: 'Slot 3' }, emoji: '🟫', color: 'bg-amber-100 dark:bg-amber-950' },
      { id: 'tree-br1', label: { ar: 'هدف 4 (يمين سفلي)', en: 'Slot 4' }, emoji: '🪵', color: 'bg-amber-100 dark:bg-amber-950' }
    ],
    xpReward: 15,
    hint: { ar: 'رتب الأوراق أعلى الجذع بدقة.', en: 'Arrange leaves above trunk accurately.' }
  },
  {
    levelNumber: 11,
    title: { ar: 'المستوى 11 – تسلسل نمو النبتة الذكية', en: 'Level 11 – Plant Growth Sequence' },
    instruction: { ar: 'رتب مراحل نمو النبتة بالترتيب الصحيح (بذرة ثم ماء ثم نبتة).', en: 'Order plant growth stages correctly (seed, water, sprout).' },
    objective: { ar: 'ترتيب زمني وتسلسلي (3 خطوات).', en: 'Chronological sequence (3 steps).' },
    pieces: [
      { id: 'step-1', label: { ar: 'الخطوة 1: بذرة', en: 'Step 1: Seed' }, emoji: '🌰', color: 'bg-amber-600' },
      { id: 'step-2', label: { ar: 'الخطوة 2: سقي الماء', en: 'Step 2: Water' }, emoji: '💧', color: 'bg-blue-500' },
      { id: 'step-3', label: { ar: 'الخطوة 3: نمو نبتة', en: 'Step 3: Sprout' }, emoji: '🌱', color: 'bg-emerald-500' }
    ],
    targets: [
      { id: 'step-1', label: { ar: 'المرحلة الأولى (بذرة)', en: 'Stage 1 (Seed)' }, emoji: '1️⃣', color: 'bg-amber-100 dark:bg-amber-950' },
      { id: 'step-2', label: { ar: 'المرحلة الثانية (ماء)', en: 'Stage 2 (Water)' }, emoji: '2️⃣', color: 'bg-blue-100 dark:bg-blue-950' },
      { id: 'step-3', label: { ar: 'المرحلة الثالثة (نبتة)', en: 'Stage 3 (Sprout)' }, emoji: '3️⃣', color: 'bg-emerald-100 dark:bg-emerald-950' }
    ],
    xpReward: 18,
    hint: { ar: 'ابدأ بالبذرة ثم اسقها لكي تنمو.', en: 'Start with seed then water to grow.' }
  },
  {
    levelNumber: 12,
    title: { ar: 'المستوى 12 – معمل الروبوتات النهائي (تحدي الماستر)', en: 'Level 12 – Ultimate Robot Workshop Master' },
    instruction: { ar: 'أكمل لوحة التحكم والمعالج وروبوت الذكاء الاصطناعي بنجاح.', en: 'Complete the control panel, CPU, and AI robot successfully.' },
    objective: { ar: 'التحدي النهائي الشامل.', en: 'Ultimate comprehensive master challenge.' },
    pieces: [
      { id: 'lab-cpu', label: { ar: 'معالج الذكاء', en: 'AI CPU' }, emoji: '💻', color: 'bg-slate-700' },
      { id: 'lab-bot', label: { ar: 'روبوت سمارت', en: 'Smart Robot' }, emoji: '🤖', color: 'bg-red-600' },
      { id: 'lab-star', label: { ar: 'نجمة الماستر', en: 'Master Star' }, emoji: '⭐', color: 'bg-amber-400' }
    ],
    targets: [
      { id: 'lab-cpu', label: { ar: 'مكان المعالج', en: 'CPU Slot' }, emoji: '💻', color: 'bg-slate-200 dark:bg-slate-800' },
      { id: 'lab-bot', label: { ar: 'مكان الروبوت', en: 'Robot Slot' }, emoji: '🤖', color: 'bg-red-100 dark:bg-red-950' },
      { id: 'lab-star', label: { ar: 'مكان التكريم', en: 'Star Slot' }, emoji: '⭐', color: 'bg-amber-100 dark:bg-amber-950' }
    ],
    xpReward: 25,
    hint: { ar: 'ركب مكونات معمل سمارت كودرز الأخيرة.', en: 'Assemble final Smart Coders workshop components.' }
  }
];
