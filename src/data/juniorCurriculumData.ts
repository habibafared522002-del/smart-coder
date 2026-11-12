export interface JuniorTask {
  id: string;
  title: { ar: string; en: string };
  instruction: { ar: string; en: string };
  type: 'mouse_click' | 'drag_drop' | 'puzzle' | 'direction' | 'robot_map' | 'code_builder' | 'debug' | 'loop' | 'event';
  xpReward: number;
  correctMessage: { ar: string; en: string };
  retryMessage: { ar: string; en: string };
  hintMessage: { ar: string; en: string };
}

export interface JuniorLevel {
  id: string;
  levelNumber: number;
  title: { ar: string; en: string };
  tasks: JuniorTask[];
}

export interface JuniorGame {
  id: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string;
  levels: JuniorLevel[];
}

export interface JuniorChapter {
  id: string;
  chapterNumber: number;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string;
  games: JuniorGame[];
}

export const juniorChaptersData: JuniorChapter[] = [
  {
    id: 'ch-1',
    chapterNumber: 1,
    title: { ar: 'الفصل 1: التفاعل مع الفأرة والكمبيوتر', en: 'Chapter 1: Mouse & Computer Interaction' },
    description: { ar: 'تعلم التحكم بالمؤشر، النقر السليم، والسحب والإفلات.', en: 'Learn pointer control, proper clicking, and drag & drop.' },
    icon: 'MousePointer',
    games: [
      {
        id: 'game-mouse-explorer',
        title: { ar: 'لعبة مستكشف الفأرة', en: 'Mouse Explorer Game' },
        description: { ar: 'تطوير مهارات تحريك المؤشر والنقر على الأهداف بدقة', en: 'Develop pointer movement and clicking accuracy' },
        icon: 'MousePointer',
        levels: [
          {
            id: 'lvl-m1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: تحريك المؤشر نحو الهدف', en: 'Level 1: Move Pointer to Target' },
            tasks: [
              {
                id: 'task-m1-1',
                title: { ar: 'مهمة 1: اضغط النجمة الذهبية', en: 'Task 1: Click the Golden Star' },
                instruction: { ar: 'حرّك المؤشر واضغط على النجمة الذهبية الظاهرة على الشاشة!', en: 'Move pointer and click the golden star on screen!' },
                type: 'mouse_click',
                xpReward: 5,
                correctMessage: { ar: 'برافو عليك! تم النقر بنجاح!', en: 'Excellent work! Clicked successfully!' },
                retryMessage: { ar: 'قربت جدًا! حاول النقر على النجمة بدقة.', en: 'Almost there! Try clicking the star accurately.' },
                hintMessage: { ar: 'انظر إلى النجمة الذهبية الكبيرة في أعلى الصندوق.', en: 'Look at the big golden star at top.' }
              }
            ]
          }
        ]
      },
      {
        id: 'game-drag-drop',
        title: { ar: 'لعبة السحب والإفلات', en: 'Drag and Drop Game' },
        description: { ar: 'سحب الأشكال والأصناف إلى أماكنها المخصصة', en: 'Drag shapes and items into their designated slots' },
        icon: 'Sparkles',
        levels: [
          {
            id: 'lvl-dd1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: سحب الشكل للمكان المطابق', en: 'Level 1: Match Shape to Slot' },
            tasks: [
              {
                id: 'task-dd1-1',
                title: { ar: 'مهمة 1: ركب الدائرة الحمراء', en: 'Task 1: Place Red Circle' },
                instruction: { ar: 'اسحب الدائرة الحمراء وضعها في الإطار الفارغ المطابق.', en: 'Drag red circle into the matching empty outline.' },
                type: 'drag_drop',
                xpReward: 5,
                correctMessage: { ar: 'ممتاز! قدرت تعملها!', en: 'Great job! You did it!' },
                retryMessage: { ar: 'مفيش مشكلة، تعالى نجرب مكان الإطار تاني.', en: 'Let us try placing in the outline again.' },
                hintMessage: { ar: 'اسحب الشكل ببطء نحو الإطار المتقطع.', en: 'Drag the shape slowly towards the dashed frame.' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ch-2',
    chapterNumber: 2,
    title: { ar: 'الفصل 2: استوديو الألغاز (Puzzle Studio)', en: 'Chapter 2: Puzzle Studio' },
    description: { ar: 'تطوير الوعي المكاني والمطابقة البصرية لقطع الصور.', en: 'Develop spatial awareness and visual matching of picture pieces.' },
    icon: 'Puzzle',
    games: [
      {
        id: 'game-my-first-puzzle',
        title: { ar: 'لغزي الأول', en: 'My First Puzzle' },
        description: { ar: 'تركيب قطع الصور البسيطة لتكوين صورة الروبوت سمارتي', en: 'Assemble simple picture pieces to form Smarty robot' },
        icon: 'Puzzle',
        levels: [
          {
            id: 'lvl-p1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: لغز قطعتين', en: 'Level 1: Two-Piece Puzzle' },
            tasks: [
              {
                id: 'task-p1-1',
                title: { ar: 'مهمة 1: ركب قطعتي الروبوت', en: 'Task 1: Assemble Robot Pieces' },
                instruction: { ar: 'اسحب القطع المبعثرة لإكمال صورة الروبوت.', en: 'Drag scattered pieces to complete the robot picture.' },
                type: 'puzzle',
                xpReward: 5,
                correctMessage: { ar: 'أحسنت! الصورة اكتملت!', en: 'You completed the picture!' },
                retryMessage: { ar: 'بص على مكان القطعة وجرب تاني.', en: 'Look at the piece location and try again.' },
                hintMessage: { ar: 'ضع القطعة الأولى في اليمين والقطعة الثانية في اليسار.', en: 'Place first piece on right and second on left.' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ch-3',
    chapterNumber: 3,
    title: { ar: 'الفصل 3: مستكشف الاتجاهات (Direction Explorer)', en: 'Chapter 3: Direction Explorer' },
    description: { ar: 'التعرف على اتجاهات اليمين، اليسار، للأمام والخلف.', en: 'Recognize right, left, forward and backward directions.' },
    icon: 'Compass',
    games: [
      {
        id: 'game-arrow-discovery',
        title: { ar: 'اكتشاف الأسهم واتجاهات الحركة', en: 'Arrow Discovery & Movement' },
        description: { ar: 'مطابقة الأسهم الاتجاهية بالحركة الصحيحة', en: 'Match directional arrows with correct movement' },
        icon: 'Compass',
        levels: [
          {
            id: 'lvl-dir1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: اتجاه اليمين واليسار', en: 'Level 1: Right and Left Directions' },
            tasks: [
              {
                id: 'task-dir1-1',
                title: { ar: 'مهمة 1: اختر السهم المتجه لليمين', en: 'Task 1: Choose Right Arrow' },
                instruction: { ar: 'الكنز موجود في جهة اليمين! أي سهم تختار؟', en: 'The treasure is to the right! Which arrow do you choose?' },
                type: 'direction',
                xpReward: 5,
                correctMessage: { ar: 'رائع! اختيار اتجاه اليمين صحيح!', en: 'Awesome! Right direction selected correctly!' },
                retryMessage: { ar: 'قربت جدًا، اتجاه الكنز هو اليمين.', en: 'Almost there, treasure is to the right.' },
                hintMessage: { ar: 'ابحث عن السهم الذي يشير لجهة اليمين ➡️.', en: 'Look for arrow pointing right ➡️.' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ch-4',
    chapterNumber: 4,
    title: { ar: 'الفصل 4: مغامرات خريطة الروبوت', en: 'Chapter 4: Robot Map Adventures' },
    description: { ar: 'توجيه الروبوت عبر شبكة الخريطة للوصول للهدف.', en: 'Guide the robot across a map grid to reach the goal.' },
    icon: 'Map',
    games: [
      {
        id: 'game-robot-map',
        title: { ar: 'مغامرة شبكة الخريطة', en: 'Robot Map Grid Adventure' },
        description: { ar: 'استخدام أوامر الحركة للوصول للنجمة الذهبية', en: 'Use movement commands to reach golden star' },
        icon: 'Map',
        levels: [
          {
            id: 'lvl-map1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: خطوتان للوصول للهدف', en: 'Level 1: Two Steps to Target' },
            tasks: [
              {
                id: 'task-map1-1',
                title: { ar: 'مهمة 1: وجّه سمارتي للنجمة', en: 'Task 1: Guide Smarty to Star' },
                instruction: { ar: 'اختر أوامر الحركة المناسبة لتحريك سمارتي نحو النجمة.', en: 'Choose correct movement commands to move Smarty to star.' },
                type: 'robot_map',
                xpReward: 5,
                correctMessage: { ar: 'أنت مبدع! وصل الروبوت لهدفه بنجاح!', en: 'You are creative! Robot reached goal successfully!' },
                retryMessage: { ar: 'لم يصل الروبوت بعد، حاول تعديل الأوامر.', en: 'Robot not there yet, try adjusting commands.' },
                hintMessage: { ar: 'تحرك خطوتين للأمام ثم انعطف يمينًا.', en: 'Move forward twice then turn right.' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ch-5',
    chapterNumber: 5,
    title: { ar: 'الفصل 5: بناء الشفرة (Code Builder)', en: 'Chapter 5: Code Builder' },
    description: { ar: 'ترتيب الأوامر البرمجية في تسلسل صحيح.', en: 'Arrange coding commands in correct sequence.' },
    icon: 'Cpu',
    games: [
      {
        id: 'game-code-builder',
        title: { ar: 'مبني الأكواد والبرامج', en: 'Code Builder Adventure' },
        description: { ar: 'سحب وترتيب أوامر البرمجة وتنفيذها خطوة بخطوة', en: 'Drag and order programming commands and execute step by step' },
        icon: 'Cpu',
        levels: [
          {
            id: 'lvl-cb1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: تسلسل من أمرين', en: 'Level 1: Two-Command Sequence' },
            tasks: [
              {
                id: 'task-cb1-1',
                title: { ar: 'مهمة 1: رتب أوامر التحرك', en: 'Task 1: Order Movement Commands' },
                instruction: { ar: 'اسحب أمرين للأمام لكي يصل الروبوت للهدف.', en: 'Drag two forward commands for robot to reach goal.' },
                type: 'code_builder',
                xpReward: 5,
                correctMessage: { ar: 'برنامجك يعمل بذكاء مذهل!', en: 'Your program runs with amazing smarts!' },
                retryMessage: { ar: 'تحقق من ترتيب الأوامر وحاول مجدداً.', en: 'Check command order and try again.' },
                hintMessage: { ar: 'أضف أمرين من نوع تحرك للأمام.', en: 'Add two move forward commands.' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ch-6',
    chapterNumber: 6,
    title: { ar: 'الفصل 6: مهمة تصحيح الأخطاء (Debug Mission)', en: 'Chapter 6: Debug Mission' },
    description: { ar: 'اكتشاف الأخطاء البرمجية وإصلاحها.', en: 'Discovering coding mistakes and fixing them.' },
    icon: 'Wrench',
    games: [
      {
        id: 'game-debug',
        title: { ar: 'مهمة الطبيب المصلح للبرامج', en: 'Program Debugging Mission' },
        description: { ar: 'إصلاح الخطأ البرمجي في مسار الروبوت', en: 'Fix the coding bug in robot path' },
        icon: 'Wrench',
        levels: [
          {
            id: 'lvl-db1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: إصلاح خطأ واحد', en: 'Level 1: Fix One Bug' },
            tasks: [
              {
                id: 'task-db1-1',
                title: { ar: 'مهمة 1: استبدل السهم الخاطئ', en: 'Task 1: Replace Wrong Arrow' },
                instruction: { ar: 'الروبوت أخطأ واتجه لليسار! استبدله بالسهم الصحيح لليمين.', en: 'Robot turned left by mistake! Replace with correct right arrow.' },
                type: 'debug',
                xpReward: 5,
                correctMessage: { ar: 'طبيب برمجيات ممتاز! تم تصحيح الخطأ.', en: 'Excellent programmer doctor! Bug fixed.' },
                retryMessage: { ar: 'تحقق من اتجاه السهم الذي يحتاج إصلاحاً.', en: 'Check direction of arrow needing fix.' },
                hintMessage: { ar: 'استبدل السهم الأخير بالسهم المعاكس.', en: 'Replace last arrow with opposite one.' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ch-7',
    chapterNumber: 7,
    title: { ar: 'الفصل 7: الحلقات والأنماط (Loops & Patterns)', en: 'Chapter 7: Loops & Patterns' },
    description: { ar: 'فهم التكرار واختصار الخطوات باستخدام الحلقات.', en: 'Understand repetition and shorten steps using loops.' },
    icon: 'Repeat',
    games: [
      {
        id: 'game-loops',
        title: { ar: 'مغامرة التكرار والحلقات', en: 'Loop Adventure & Patterns' },
        description: { ar: 'استخدام بلوك التكرار لجمع الكنوز', en: 'Use repeat block to collect treasures' },
        icon: 'Repeat',
        levels: [
          {
            id: 'lvl-lp1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: استخدام أمر التكرار', en: 'Level 1: Using Repeat Loop' },
            tasks: [
              {
                id: 'task-lp1-1',
                title: { ar: 'مهمة 1: كرر الحركة 3 مرات', en: 'Task 1: Repeat Movement 3 Times' },
                instruction: { ar: 'استخدم بلوك التكرار لتتحرك 3 خطوات للأمام بضربة واحدة.', en: 'Use repeat block to move 3 steps forward in one go.' },
                type: 'loop',
                xpReward: 5,
                correctMessage: { ar: 'رائع جداً! التكرار يختصر الوقت والجهد.', en: 'Awesome! Loops save time and effort.' },
                retryMessage: { ar: 'جرب استخدام رقم 3 مع أمر التحرك للأمام.', en: 'Try using number 3 with move forward.' },
                hintMessage: { ar: 'ضع أمر التحرك داخل صندوق التكرار واختر الرقم 3.', en: 'Put move command inside loop box and choose 3.' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ch-8',
    chapterNumber: 8,
    title: { ar: 'الفصل 8: الأحداث والمشاريع الإبداعية', en: 'Chapter 8: Events & Creative Projects' },
    description: { ar: 'التحكم بالأحداث، صناعة القصص، والمشروع الختامي.', en: 'Event control, story creation, and final project.' },
    icon: 'Sparkles',
    games: [
      {
        id: 'game-events',
        title: { ar: 'صانع القصص والمشاريع التفاعلية', en: 'Story Creator & Final Project' },
        description: { ar: 'ربط الأزرار بالأحداث وتصميم قصة الروبوت الذكي', en: 'Connect buttons to events and design smart robot story' },
        icon: 'Sparkles',
        levels: [
          {
            id: 'lvl-ev1',
            levelNumber: 1,
            title: { ar: 'المستوى 1: معمل الأحداث والتحكم', en: 'Level 1: Event Controller' },
            tasks: [
              {
                id: 'task-ev1-1',
                title: { ar: 'مهمة 1: اضغط زر التحية للروبوت', en: 'Task 1: Press Robot Greeting Button' },
                instruction: { ar: 'اضغط على الزر الأحمر لجعل الروبوت يلوح بيده ويقول مرحباً!', en: 'Press the red button to make robot wave and say hello!' },
                type: 'event',
                xpReward: 10,
                correctMessage: { ar: 'ألف مبروك! أتممت مسار صغار المبرمجين بنجاح.', en: 'Congratulations! You completed Junior pathway successfully.' },
                retryMessage: { ar: 'اضغط على الزر الأحمر الظاهر على الشاشة.', en: 'Click the red button displayed on screen.' },
                hintMessage: { ar: 'انقر زر التحية الأحمر لتوليد الحدث.', en: 'Click the red greeting button to trigger event.' }
              }
            ]
          }
        ]
      }
    ]
  }
];
