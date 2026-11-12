import { Program, EducationalMaterial, StudentProgress } from '../types';

export const initialPrograms: Program[] = [
  {
    id: 'prog-1',
    title: {
      ar: 'سمارت كودرز – مسار صغار المبرمجين (Course A)',
      en: 'Smart Coders – Course A Curriculum',
    },
    subtitle: {
      ar: 'المناهج الأساسية المعتمدة للأطفال (4-6 سنوات)',
      en: 'Foundational Curriculum for Children (Ages 4-6)',
    },
    description: {
      ar: 'منهج تعليمي تفاعلي مستوحى من أحدث معايير علوم الحاسب، مصمم خصيصاً بقصص وشخصيات سمارت تك الأصلية لتطوير التفكير المنطقي والبرمجي.',
      en: 'An interactive educational curriculum inspired by modern computer science standards, specially crafted with original SmartTech stories and characters to develop logical and coding thinking.',
    },
    targetAge: '4-6 Years (KG1 & KG2)',
    icon: 'Bot',
    levels: [
      {
        id: 'lvl-course-a',
        programId: 'prog-1',
        name: { ar: 'المستوى التمهيدي - مسار Course A', en: 'Foundation Level - Course A' },
        ageRange: '4-6 Years',
        description: {
          ar: '13 درساً تفاعلياً شاملاً يغطي المواطنة الرقمية، التسلسل، الحلقات، والأحداث.',
          en: '13 comprehensive interactive lessons covering digital citizenship, sequencing, loops, and events.',
        },
        units: [
          {
            id: 'unit-1',
            levelId: 'lvl-course-a',
            code: 'U1',
            title: { ar: 'الوحدة 1: المواطنة الرقمية والمهارات الأساسية', en: 'Unit 1: Digital Citizenship & Basic Skills' },
            description: { ar: 'التعرف على الأمان الرقمي ومهارات التفاعل مع الحاسوب', en: 'Discovering digital safety and computer interaction skills' },
            icon: 'ShieldCheck',
            lessons: [
              {
                id: 'les-1',
                unitId: 'unit-1',
                title: { ar: 'الدرس 1: عالمي الرقمي الآمن', en: 'Lesson 1: My Safe Digital World' },
                summary: { ar: 'فهم الأمان الرقمي واختيار السلوكيات الآمنة', en: 'Understand simple digital safety and safe online choices' },
                objectives: {
                  ar: ['فهم الأمان الرقمي البسيط', 'التمييز بين المواقف الآمنة وغير الآمنة على الإنترنت', 'اكتساب عادات تكنولوجية مسؤولة'],
                  en: ['Understand simple digital safety', 'Recognize safe and unsafe online situations', 'Learn responsible technology habits']
                },
                explanation: {
                  ar: 'مرحباً بك يا صديقي الصغير في عالمنا الرقمي الجميل! عندما نستخدم الكمبيوتر أو الأجهزة الذكية، نحتاج لأن نكون أبطالاً أذكياء ونحافظ على أماننا وخصوصيتنا.',
                  en: 'Welcome little friend to our wonderful digital world! When using computers and smart devices, we need to be smart heroes keeping ourselves safe and secure.'
                },
                materialIds: ['mat-1'],
                activities: [
                  {
                    id: 'act-1',
                    title: { ar: 'لعبة الاختيارات الرقمية الآمنة', en: 'Safe Choices Interactive Game' },
                    type: 'safe_choices'
                  }
                ],
                durationMinutes: 15,
                starsReward: 3,
                isPublished: true,
              },
              {
                id: 'les-2',
                unitId: 'unit-1',
                title: { ar: 'الدرس 2: مستكشف الفأرة والتحكم', en: 'Lesson 2: Mouse Explorer & Control' },
                summary: { ar: 'تطوير مهارات استخدام الفأرة والنقر والسحب', en: 'Develop mouse control and practice clicking & pointing' },
                objectives: {
                  ar: ['تطوير التحكم بالفأرة أو الشاشة اللمسية', 'ممارسة النقر والسحب بدقة', 'تحديد الأهداف البصرية'],
                  en: ['Develop mouse control', 'Practice clicking and pointing', 'Select and move objects accurately']
                },
                explanation: {
                  ar: 'الفأرة أو إصبعك على الشاشة هما يدك السحرية في عالم الكمبيوتر! دعنا نحرك المؤشر ونضغط على الأهداف.',
                  en: 'The mouse or your finger on the screen is your magical hand in the computer world! Let us move the pointer and click targets.'
                },
                materialIds: ['mat-2'],
                activities: [
                  {
                    id: 'act-2',
                    title: { ar: 'لعبة مستكشف الفأرة', en: 'Mouse Explorer Game' },
                    type: 'mouse_explorer'
                  }
                ],
                durationMinutes: 15,
                starsReward: 4,
                isPublished: true,
              }
            ]
          },
          {
            id: 'unit-2',
            levelId: 'lvl-course-a',
            code: 'U2',
            title: { ar: 'الوحدة 2: التسلسل المنطقي', en: 'Unit 2: Sequencing' },
            description: { ar: 'تعلم الاتجاهات، بناء الشفرات البرمجية، وحل مغامرات الروبوت', en: 'Learning directions, building code sequences, and solving robot adventures' },
            icon: 'Compass',
            lessons: [
              {
                id: 'les-3',
                unitId: 'unit-2',
                title: { ar: 'الدرس 3: استوديو الألغاز البصرية', en: 'Lesson 3: Puzzle Studio' },
                summary: { ar: 'التعرف على الأشكال ومطابقة قطع الصور', en: 'Visual matching, shape recognition, and spatial awareness' },
                objectives: {
                  ar: ['المطابقة البصرية والتعرف على الأشكال', 'تنمية الوعي المكاني', 'فهم تكوين الصورة الكاملة'],
                  en: ['Visual matching', 'Shape recognition', 'Spatial awareness']
                },
                explanation: {
                  ar: 'قطع الصور المبعثرة تنتظر يدك الذكية لتتجمع وتصنع لوحة فنية مذهلة!',
                  en: 'Scattered puzzle pieces await your smart hand to assemble into a wonderful picture!'
                },
                materialIds: ['mat-3'],
                activities: [
                  {
                    id: 'act-3',
                    title: { ar: 'لعبة استوديو الألغاز', en: 'Puzzle Studio Game' },
                    type: 'puzzle_studio'
                  }
                ],
                durationMinutes: 20,
                starsReward: 5,
                isPublished: true,
              },
              {
                id: 'les-4',
                unitId: 'unit-2',
                title: { ar: 'الدرس 4: ابنِ شفرتك الأولى', en: 'Lesson 4: Build Your First Code' },
                summary: { ar: 'سحب أوامر الحركة وبناء تسلسل تشغيل ناجح', en: 'Drag visual command blocks into sequence and press Run' },
                objectives: {
                  ar: ['فهم تسلسل الأوامر البرمجية', 'ترتيب الأوامر بالترتيب الصحيح', 'توجيه الشخصية للهدف'],
                  en: ['Understand command sequences', 'Arrange instructions in correct order', 'Guide character to target']
                },
                explanation: {
                  ar: 'حان وقت البرمجة الحقيقية! رتب الأوامر البرمجية في القائمة ثم اضغط زر التشغيل (Run) وشاهد الإبداع.',
                  en: 'Time for real programming! Arrange command blocks in order, press Run, and watch the magic.'
                },
                materialIds: [],
                activities: [
                  {
                    id: 'act-4',
                    title: { ar: 'متاهة الروبوت البرمجية', en: 'Visual Robot Maze Adventure' },
                    type: 'robot_maze'
                  }
                ],
                durationMinutes: 20,
                starsReward: 5,
                isPublished: true,
              },
              {
                id: 'les-5',
                unitId: 'unit-2',
                title: { ar: 'الدرس 5: مغامرات البرمجة الذكية', en: 'Lesson 5: Smart Coding Adventures' },
                summary: { ar: 'بناء متواليات أطول مع عقبات وتحديات', en: 'Build longer instruction sequences with obstacles' },
                objectives: {
                  ar: ['بناء تسلسلات أطول', 'تجاوز العقبات في المتاهة', 'استخدام التنفيذ خطوة بخطوة (Debugging)'],
                  en: ['Build longer instruction sequences', 'Overcome obstacles', 'Introduce step-by-step debugging']
                },
                explanation: {
                  ar: 'المتاهة أصبحت أكبر ووجدنا بعض الصخور! لنفكر بذكاء ونرتب الأوامر بعناية.',
                  en: 'The maze is bigger and there are rocks! Let us think smartly and arrange commands carefully.'
                },
                materialIds: [],
                activities: [
                  {
                    id: 'act-5',
                    title: { ar: 'متاهة العقبات الكبرى', en: 'Great Obstacle Maze' },
                    type: 'robot_maze'
                  }
                ],
                durationMinutes: 20,
                starsReward: 5,
                isPublished: true,
              },
              {
                id: 'les-6',
                unitId: 'unit-2',
                title: { ar: 'الدرس 6: مهام الروبوت المتقدمة', en: 'Lesson 6: Advanced Robot Missions' },
                summary: { ar: 'حل مسارات معقدة ذات وجهات متعددة', en: 'Solve complex paths with multiple destinations' },
                objectives: {
                  ar: ['تطبيق التسلسل على مسارات معقدة', 'التخطيط لعدة خطوات حركة', 'تنمية الصبر والتفكير المنطقي'],
                  en: ['Apply sequencing to complex routes', 'Plan multiple movement instructions', 'Develop persistence and logical thinking']
                },
                explanation: {
                  ar: 'أنت الآن مبرمج محترف! فلنساعد سمارتي في جمع النجوم الذهبية عبر مسارات متعددة.',
                  en: 'You are now a pro coder! Let us help Smarty collect golden stars across multiple paths.'
                },
                materialIds: [],
                activities: [
                  {
                    id: 'act-6',
                    title: { ar: 'مهمة النجوم الذهبية', en: 'Golden Stars Mission' },
                    type: 'robot_maze'
                  }
                ],
                durationMinutes: 25,
                starsReward: 6,
                isPublished: true,
              }
            ]
          },
          {
            id: 'unit-3',
            levelId: 'lvl-course-a',
            code: 'U3',
            title: { ar: 'الوحدة 3: التكرار (الحلقات)', en: 'Unit 3: Loops' },
            description: { ar: 'اكتشاف تكرار الحركات، استخدام أمر التكرار، وجمع الكنوز', en: 'Discovering movement repetition, using repeat blocks, and collecting treasure' },
            icon: 'Repeat',
            lessons: [
              {
                id: 'les-7',
                unitId: 'unit-3',
                title: { ar: 'الدرس 7: اكتشاف التكرار', en: 'Lesson 7: Discover Repetition' },
                summary: { ar: 'التعرف على الأنماط المتكررة في الحركة', en: 'Understand repeating actions and repeated movement patterns' },
                objectives: {
                  ar: ['فهم معنى تكرار الأفعال', 'التعرف على الأنماط المتشابهة', 'توفير الجهد والخطوات'],
                  en: ['Understand repetition', 'Discover repeated movement patterns', 'Recognize when instructions repeat']
                },
                explanation: {
                  ar: 'لماذا نقفز خطوة خطوة متصلة بينما يمكننا تكرار القفز بذكاء؟',
                  en: 'Why jump step by step when we can repeat jumps smartly?'
                },
                materialIds: [],
                activities: [],
                durationMinutes: 20,
                starsReward: 5,
                isPublished: true,
              },
              {
                id: 'les-8',
                unitId: 'unit-3',
                title: { ar: 'الدرس 8: كرر أوامرك بذكاء', en: 'Lesson 8: Repeat Your Commands' },
                summary: { ar: 'استخدام بلوك التكرار لاختصار الأوامر', en: 'Use Repeat block to replace repeated commands' },
                objectives: {
                  ar: ['فهم بلوك التكرار (Repeat)', 'استبدال الأوامر المكررة ببلوك واحد', 'حل تحديات الحركة بالتكرار'],
                  en: ['Understand Repeat block', 'Replace repeated commands with loop', 'Use loops to solve challenges']
                },
                explanation: {
                  ar: 'أمر التكرار هو صديقنا المفضل! يختصر علينا كتابة الخطوات الطويلة.',
                  en: 'The repeat command is our best friend! It shortens long steps.'
                },
                materialIds: [],
                activities: [
                  {
                    id: 'act-8',
                    title: { ar: 'متاهة التكرار الذكية', en: 'Smart Loop Maze' },
                    type: 'robot_maze'
                  }
                ],
                durationMinutes: 20,
                starsReward: 5,
                isPublished: true,
              },
              {
                id: 'les-9',
                unitId: 'unit-3',
                title: { ar: 'الدرس 9: جامع الكنوز', en: 'Lesson 9: Treasure Collector' },
                summary: { ar: 'استخدام الحلقات لجمع عدة كنوز في الكهف', en: 'Use loops to collect multiple objects in cave layouts' },
                objectives: {
                  ar: ['استخدام الحلقات لجمع الكنوز', 'التعرف على الأنماط في الكهوف', 'تقليل الأوامر الزائدة'],
                  en: ['Use loops to collect multiple objects', 'Recognize repeated patterns', 'Reduce unnecessary commands']
                },
                explanation: {
                  ar: 'مرحباً بك في كهف الكنوز! استخدم بلوك التكرار لجمع الألماس والنجوم بسرعة فائقة.',
                  en: 'Welcome to the Treasure Cave! Use repeat blocks to collect diamonds and stars lightning fast.'
                },
                materialIds: [],
                activities: [],
                durationMinutes: 25,
                starsReward: 6,
                isPublished: true,
              },
              {
                id: 'les-10',
                unitId: 'unit-3',
                title: { ar: 'الدرس 10: الرسم الإبداعي بالحلقات', en: 'Lesson 10: Creative Drawing with Loops' },
                summary: { ar: 'استخدام الأوامر المتكررة لرسم أشكال ملونة', en: 'Use repeated instructions and shapes to create artwork' },
                objectives: {
                  ar: ['فهم التكرار من خلال الأنماط البصرية', 'استخدام الأوامر المتكررة للرسم', 'ابتكار أعمال فنية بالأكواد'],
                  en: ['Understand repetition through visual patterns', 'Use repeated instructions to draw', 'Create original artwork through code']
                },
                explanation: {
                  ar: 'ارسم أجمل الأشكال والزهور من خلال تكرار خطوات الرسام الآلي!',
                  en: 'Draw wonderful shapes and flowers by repeating the robotic painter steps!'
                },
                materialIds: [],
                activities: [],
                durationMinutes: 25,
                starsReward: 7,
                isPublished: true,
              }
            ]
          },
          {
            id: 'unit-4',
            levelId: 'lvl-course-a',
            code: 'U4',
            title: { ar: 'الوحدة 4: الأحداث والمشاريع الإبداعية', en: 'Unit 4: Events & Creative Projects' },
            description: { ar: 'تعلم الأحداث، بناء القصص التفاعلية، والمشروع الختامي', en: 'Learning events, building interactive stories, and final project' },
            icon: 'Sparkles',
            lessons: [
              {
                id: 'les-11',
                unitId: 'unit-4',
                title: { ar: 'الدرس 11: عندما يحدث شيء ما!', en: 'Lesson 11: When Something Happens!' },
                summary: { ar: 'فهم مفهوم الأحداث وردود الأفعال للأزرار', en: 'Understand events, button interactions, and reactions' },
                objectives: {
                  ar: ['فهم مفهوم الأحداث (Events)', 'معرفة أن الضغط يولد استجابة', 'التفاعل مع الأزرار والمؤثرات'],
                  en: ['Understand the concept of events', 'Learn action triggers response', 'Recognize button interactions']
                },
                explanation: {
                  ar: 'عندما تضغط على زر الزهور.. تزهر الحديقة فوراً! هذا هو مفهوم الحدث.',
                  en: 'When you press the flower button, the garden blooms instantly! That is an event.'
                },
                materialIds: [],
                activities: [],
                durationMinutes: 20,
                starsReward: 5,
                isPublished: true,
              },
              {
                id: 'les-12',
                unitId: 'unit-4',
                title: { ar: 'الدرس 12: اصنع قصتك التفاعلية', en: 'Lesson 12: Create Your Interactive Story' },
                summary: { ar: 'تحريك الشخصيات وتصميم قصة رقمية مصغرة', en: 'Move characters, trigger simple animations, and create interactive stories' },
                objectives: {
                  ar: ['استخدام الأحداث والحركة معاً', 'تحريك شخصيات سمارت تك', 'ابتكار قصة تفاعلية قصيرة'],
                  en: ['Understand basic events', 'Move characters and trigger animations', 'Create an interactive story']
                },
                explanation: {
                  ar: 'أنت الآن مؤلف وقاص مبرمج! اصنع قصة صديقنا الروبوت وهو يستكشف الكواكب.',
                  en: 'You are now a coder storyteller! Make a story of our robot exploring planets.'
                },
                materialIds: [],
                activities: [],
                durationMinutes: 25,
                starsReward: 8,
                isPublished: true,
              },
              {
                id: 'les-13',
                unitId: 'unit-4',
                title: { ar: 'الدرس 13: المشروع الختامي لسمارت كودرز', en: 'Lesson 13: SMART CODERS FINAL PROJECT' },
                summary: { ar: 'تطبيق التسلسل والتكرار في مشروعك البرمجي المستقل', en: 'Apply sequencing, repetition, and create your original final project' },
                objectives: {
                  ar: ['تطبيق كل ما تعلمته من تسلسل وتكرار وأحداث', 'إنجاز مشروع برمجي متكامل', 'الحصول على شهادة إتمام المسار'],
                  en: ['Apply sequencing and repetition', 'Create simple original visual project', 'Receive completion celebration']
                },
                explanation: {
                  ar: 'تهانينا! لقد أتممت مسار Course A بنجاح وأصبحت مبرمجاً معتمداً من مركز سمارت تك للتدريب!',
                  en: 'Congratulations! You successfully completed Course A and became a certified SmartTech coder!'
                },
                materialIds: [],
                activities: [
                  {
                    id: 'act-13',
                    title: { ar: 'احتفال المشروع النهائي', en: 'Final Project Celebration' },
                    type: 'robot_maze'
                  }
                ],
                durationMinutes: 30,
                starsReward: 15,
                isPublished: true,
              }
            ]
          }
        ]
      }
    ]
  }
];

export const initialMaterials: EducationalMaterial[] = [
  {
    id: 'mat-1',
    title: { ar: 'دليل السلامة الرقمية للأطفال', en: 'Digital Safety Guide for Kids' },
    description: { ar: 'بطاقات ملونة توضح قواعد الأمان والاستخدام المسؤول للتكنولوجيا', en: 'Colorful flashcards explaining safety and responsible tech use' },
    type: 'pdf',
    ageGroup: '4-6 Years (KG1 & KG2)',
    programId: 'prog-1',
    levelId: 'lvl-course-a',
    unitId: 'unit-1',
    lessonIds: ['les-1'],
    language: 'bilingual',
    fileName: 'digital_safety_guide.pdf',
    fileSize: '3.1 MB',
    uploadDate: '2026-02-01',
    isPublished: true,
  },
  {
    id: 'mat-2',
    title: { ar: 'ورقة عمل السحب والإفلات وتنسيق الأشكال', en: 'Drag and Drop Shape Worksheet' },
    description: { ar: 'نشاط مطبوع لتطوير مهارات الإمساك والتنسيق البصري', en: 'Printable activity sheet to develop coordination' },
    type: 'worksheet',
    ageGroup: '4-6 Years (KG1 & KG2)',
    programId: 'prog-1',
    levelId: 'lvl-course-a',
    unitId: 'unit-1',
    lessonIds: ['les-2'],
    language: 'bilingual',
    fileName: 'drag_drop_shapes.pdf',
    fileSize: '1.4 MB',
    uploadDate: '2026-02-03',
    isPublished: true,
  },
  {
    id: 'mat-3',
    title: { ar: 'بطاقات الاتجاهات الأرضية (يمين، يسار، أمام، خلف)', en: 'Floor Direction Cards (Unplugged Activity)' },
    description: { ar: 'بطاقات كبيرة للأنشطة غير الموصلة بالحاسوب في الفصل الدراسي', en: 'Large flashcards for unplugged classroom floor activities' },
    type: 'pdf',
    ageGroup: '4-6 Years (KG1 & KG2)',
    programId: 'prog-1',
    levelId: 'lvl-course-a',
    unitId: 'unit-2',
    lessonIds: ['les-3'],
    language: 'bilingual',
    fileName: 'floor_directions_cards.pdf',
    fileSize: '5.2 MB',
    uploadDate: '2026-02-05',
    isPublished: true,
  }
];

export const initialProgress: StudentProgress = {
  studentId: 'child-01',
  completedLessonIds: ['les-1'],
  completedActivityIds: ['act-1'],
  starsEarned: 15,
  badges: ['مواطن رقمي ذكي', 'بطل سمارت تك'],
  lastActiveDate: '2026-11-12',
};
