import { JuniorAgeGroup, StudentProgress } from '../types';

export type AgeGameId = 'explorers_color_shape' | 'discoverers_mouse_mission' | 'creators_robot_coding';
export type DifficultyTier = 'easy' | 'medium' | 'hard';

export interface AgeGameStageConfig {
  id: string;
  stageNumber: number;
  mechanicKey:
    | 'discover_colors'
    | 'identify_shapes'
    | 'match_twin_shape'
    | 'collect_similar_shapes'
    | 'colorful_shape_city'
    | 'mouse_explorer_hover'
    | 'click_challenge'
    | 'drag_drop_parts'
    | 'puzzle_builder'
    | 'mission_complete_combo'
    | 'direction_master'
    | 'command_builder'
    | 'robot_mission_path'
    | 'logic_puzzle_debug'
    | 'final_coding_challenge';
  title: { ar: string; en: string };
  objective: { ar: string; en: string };
  instruction: { ar: string; en: string };
  audioPrompt: { ar: string; en: string };
  hint: { ar: string; en: string };
  successFeedback: { ar: string; en: string };
  difficulty: DifficultyTier;
  challengesCount: number;
  xpReward: number;
  starsReward: number;
  isEnabled: boolean;
}

export interface AgeGameConfig {
  id: AgeGameId;
  ageGroup: JuniorAgeGroup;
  pathwayTitle: { ar: string; en: string };
  gameTitle: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  mascotName: { ar: string; en: string };
  mascotRole: { ar: string; en: string };
  heroImage: string;
  accentColor: string;
  isEnabled: boolean;
  stages: AgeGameStageConfig[];
}

export interface StageAssessmentResult {
  stageId: string;
  gameId: AgeGameId;
  completedAt: string;
  attempts: number;
  mistakes: number;
  accuracy: number; // 0..100
  starsEarned: number;
  xpAwarded: number;
}

export interface ChildProfileRecord {
  id: string;
  name: { ar: string; en: string };
  ageYears: number;
  ageGroup: JuniorAgeGroup;
  avatarEmoji: string;
  progress: StudentProgress;
  unlockedStageByGame: Record<AgeGameId, number>;
  completedStageIds: string[];
  stageAssessments: Record<string, StageAssessmentResult>;
}

export const AGE_GAMES_STORAGE_KEY = 'smartcoders_age_games_config_v1';
export const CHILD_PROFILES_STORAGE_KEY = 'smartcoders_child_profiles_v1';
export const ACTIVE_CHILD_ID_STORAGE_KEY = 'smartcoders_active_child_id_v1';

export const defaultAgeGamesConfig: AgeGameConfig[] = [
  {
    id: 'explorers_color_shape',
    ageGroup: '3-4',
    pathwayTitle: {
      ar: 'المستوى الأول: SMART CODERS EXPLORERS (3–4 سنوات)',
      en: 'Level 1: SMART CODERS EXPLORERS (Ages 3–4)',
    },
    gameTitle: {
      ar: 'مغامرة الألوان والأشكال (Color & Shape Adventure)',
      en: 'Color & Shape Adventure',
    },
    subtitle: {
      ar: 'رحلة ممتعة مع الروبوت اللطيف "بيبو" لاكتشاف الألوان والأشكال الهندسية وبناء مدينة الأشكال الملونة.',
      en: 'A joyful journey with Bibo the Robot to discover colors, geometric shapes, and build the Colorful Shape City.',
    },
    mascotName: { ar: 'الروبوت بيبو', en: 'Bibo the Friend' },
    mascotRole: { ar: 'مرشد المستكشفين الصغار', en: 'Little Explorers Guide' },
    heroImage: '/src/assets/images/explorers_color_shape_hero_1794728008940.jpg',
    accentColor: 'amber',
    isEnabled: true,
    stages: [
      {
        id: 'exp-stg-1',
        stageNumber: 1,
        mechanicKey: 'discover_colors',
        title: { ar: 'المرحلة 1: اكتشف الألوان', en: 'Stage 1: Discover Colors' },
        objective: {
          ar: 'التمييز البصري للألوان الأساسية (الأحمر، الأزرق، الأصفر، الأخضر) بالنقر المباشر.',
          en: 'Visual recognition of primary colors (Red, Blue, Yellow, Green) via simple tapping.',
        },
        instruction: {
          ar: 'استمع إلى بيبو واضغط على البالون أو العنصر الذي يحمل اللون المطلوب!',
          en: 'Listen to Bibo and tap the balloon or object with the requested color!',
        },
        audioPrompt: {
          ar: 'مرحباً يا صديقي! هيا نكتشف الألوان الجميلة معاً. اضغط على اللون الذي أطلبه منك!',
          en: 'Hello my friend! Let us discover bright colors together. Tap the color I ask for!',
        },
        hint: {
          ar: 'انظر إلى لون الإطار المضيء أعلى الشاشة وطابقه مع نفس اللون!',
          en: 'Look at the glowing color sample at the top and tap the matching color!',
        },
        successFeedback: {
          ar: 'يا سلام! أنت بطل رائع في معرفة الألوان!',
          en: 'Wonderful! You are a superstar at spotting colors!',
        },
        difficulty: 'easy',
        challengesCount: 3,
        xpReward: 15,
        starsReward: 3,
        isEnabled: true,
      },
      {
        id: 'exp-stg-2',
        stageNumber: 2,
        mechanicKey: 'identify_shapes',
        title: { ar: 'المرحلة 2: تعرف على الأشكال', en: 'Stage 2: Identify Shapes' },
        objective: {
          ar: 'التعرف على الأشكال الهندسية (الدائرة، المربع، المثلث، النجمة) من خلال خصائصها البصرية.',
          en: 'Identify geometric shapes (Circle, Square, Triangle, Star) by their visual traits.',
        },
        instruction: {
          ar: 'ابحث عن الشكل الهندسي الذي يصفه بيبو واضغط عليه!',
          en: 'Find the geometric shape that Bibo describes and tap it!',
        },
        audioPrompt: {
          ar: 'الآن سنتعرف على الأشكال الهندسية! استمع جيداً واختر الشكل الصحيح.',
          en: 'Now let us learn shapes! Listen carefully and choose the right shape.',
        },
        hint: {
          ar: 'تذكر: الدائرة مستديرة مثل الشمس، والمربع له أربعة أضلاع متساوية، والمثلث له ثلاث زوايا!',
          en: 'Remember: Circle is round like the sun, Square has 4 equal sides, Triangle has 3 corners!',
        },
        successFeedback: {
          ar: 'أحسنت يا ذكي! عرفت جميع الأشكال الهندسية بنجاح!',
          en: 'Great job! You identified all the geometric shapes!',
        },
        difficulty: 'easy',
        challengesCount: 3,
        xpReward: 20,
        starsReward: 3,
        isEnabled: true,
      },
      {
        id: 'exp-stg-3',
        stageNumber: 3,
        mechanicKey: 'match_twin_shape',
        title: { ar: 'المرحلة 3: طابق الشكل مع مثيله', en: 'Stage 3: Match the Twin Shape' },
        objective: {
          ar: 'مطابقة كل شكل ملون مع ظله وإطاره الهندسي المطابق بالسحب والإفلات أو اللمس.',
          en: 'Match each colored shape with its identical twin outline using drag-and-drop or tap.',
        },
        instruction: {
          ar: 'اسحب كل شكل ملون وضعه فوق توأمه المطابق له في اللوحة!',
          en: 'Drag each colored shape and drop it onto its matching twin on the board!',
        },
        audioPrompt: {
          ar: 'كل شكل يبحث عن صديقه التوأم! اسحب الشكل إلى المكان الذي يشبهه تماماً.',
          en: 'Every shape is looking for its twin! Drag each shape to the spot that looks just like it.',
        },
        hint: {
          ar: 'قارن بين حواف الشكل ولونه وبين الشكل المرسوم في اللوحة المقابلة.',
          en: 'Compare the shape edges and color with the outline on the board.',
        },
        successFeedback: {
          ar: 'ممتاز! كل شكل وجد مثيله الصحيح!',
          en: 'Awesome! Every shape found its exact twin!',
        },
        difficulty: 'easy',
        challengesCount: 3,
        xpReward: 20,
        starsReward: 3,
        isEnabled: true,
      },
      {
        id: 'exp-stg-4',
        stageNumber: 4,
        mechanicKey: 'collect_similar_shapes',
        title: { ar: 'المرحلة 4: اجمع الأشكال المتشابهة', en: 'Stage 4: Collect Similar Shapes' },
        objective: {
          ar: 'تصنيف وفرز مجموعة من الأشكال المتنوعة داخل السلال المخصصة لكل شكل.',
          en: 'Classify and sort multiple mixed shapes into their dedicated shape baskets.',
        },
        instruction: {
          ar: 'ضع كل شكل في السلة التي تحمل نفس علامته (سلة الدوائر، سلة المربعات، سلة النجوم)!',
          en: 'Place each shape into the basket with the matching emblem (Circles, Squares, Stars)!',
        },
        audioPrompt: {
          ar: 'هيا نرتب الأشكال المتشابهة معاً! ضع الدوائر في سلة الدوائر والمربعات في سلة المربعات.',
          en: 'Let us sort similar shapes together! Put circles in the circle basket and squares in the square basket.',
        },
        hint: {
          ar: 'انظر إلى العلامة المرسومة على السلة، ثم اختر الشكل الذي يطابقها.',
          en: 'Look at the icon on the basket, then pick the shape that matches it.',
        },
        successFeedback: {
          ar: 'ترتيب رائع! لقد جمعت كل الأشكال المتشابهة في سلالها!',
          en: 'Super sorting! You collected all similar shapes into their baskets!',
        },
        difficulty: 'medium',
        challengesCount: 4,
        xpReward: 25,
        starsReward: 3,
        isEnabled: true,
      },
      {
        id: 'exp-stg-5',
        stageNumber: 5,
        mechanicKey: 'colorful_shape_city',
        title: {
          ar: 'المرحلة 5: التحدي النهائي – مدينة الأشكال الملونة',
          en: 'Stage 5: Final Challenge – Colorful Shape City',
        },
        objective: {
          ar: 'توظيف الألوان والأشكال الهندسية لبناء مشهد مدينة الأشكال الملونة الكامل.',
          en: 'Combine colors and shapes to construct the complete Colorful Shape City scene.',
        },
        instruction: {
          ar: 'أكمل بناء مدينة الأشكال الملونة! ضع الشمس الدائرية الصفراء، والسقف المثلث الأحمر، والبيت المربع الأزرق، والشجرة الخضراء، ونجمة البرج في أماكنها!',
          en: 'Build the Colorful Shape City! Place the Yellow Circle Sun, Red Triangle Roof, Blue Square House, Green Tree, and Golden Star in their spots!',
        },
        audioPrompt: {
          ar: 'وصلنا إلى التحدي النهائي! هيا نبني مدينة الأشكال الملونة باستخدام كل الأشكال التي تعلمناها!',
          en: 'Welcome to the final challenge! Let us build the Colorful Shape City using all the shapes we learned!',
        },
        hint: {
          ar: 'الشمس الدائرية الصفراء مكانها في السماء، والسقف المثلث الأحمر فوق البيت المربع الأزرق!',
          en: 'The yellow circle sun goes in the sky, and the red triangle roof sits on top of the blue square house!',
        },
        successFeedback: {
          ar: 'مبروك يا بطل المستكشفين! لقد بنيت مدينة الأشكال الملونة بالكامل!',
          en: 'Congratulations Explorer Hero! You built the entire Colorful Shape City!',
        },
        difficulty: 'medium',
        challengesCount: 5,
        xpReward: 35,
        starsReward: 5,
        isEnabled: true,
      },
    ],
  },
  {
    id: 'discoverers_mouse_mission',
    ageGroup: '4-5',
    pathwayTitle: {
      ar: 'المستوى الثاني: SMART CODERS DISCOVERERS (4–5 سنوات)',
      en: 'Level 2: SMART CODERS DISCOVERERS (Ages 4–5)',
    },
    gameTitle: {
      ar: 'مهمة الماوس الذكي (Mouse Mission)',
      en: 'Mouse Mission',
    },
    subtitle: {
      ar: 'مغامرة تفاعلية مع "كابتن ديجي" لإتقان مهارات تحريك المؤشر، النقر الدقيق، السحب والإفلات، وبناء الألغاز التقنية.',
      en: 'An interactive adventure with Captain Digi to master pointer movement, clicking, drag-and-drop, and puzzle building.',
    },
    mascotName: { ar: 'كابتن ديجي', en: 'Captain Digi' },
    mascotRole: { ar: 'قائد مهمات الحاسوب والماوس', en: 'Computer & Mouse Mission Commander' },
    heroImage: '/src/assets/images/discoverers_mouse_mission_hero_1794728012080.jpg',
    accentColor: 'sky',
    isEnabled: true,
    stages: [
      {
        id: 'dis-stg-1',
        stageNumber: 1,
        mechanicKey: 'mouse_explorer_hover',
        title: {
          ar: 'المرحلة 1: Mouse Explorer – تحريك المؤشر واختيار العناصر',
          en: 'Stage 1: Mouse Explorer – Pointer Tracking & Selection',
        },
        objective: {
          ar: 'التحكم الدقيق في حركة مؤشر الماوس وتتبع نقاط الطاقة بالترتيب لتشغيل المنارة.',
          en: 'Precise pointer movement and tracking sequential energy nodes to power the beacon.',
        },
        instruction: {
          ar: 'حرّك مؤشر الماوس (أو إصبعك) فوق نقاط الطاقة المرقمة بالترتيب (1 ثم 2 ثم 3...) لتوصيل التيار الضوئي!',
          en: 'Move your mouse pointer over the numbered energy nodes in order (1, 2, 3...) to connect the light beam!',
        },
        audioPrompt: {
          ar: 'مهمتك الأولى يا مكتشف: حرّك مؤشر الماوس بهدوء فوق النجوم المرقمة بالترتيب لتشغيل المسار الضوئي!',
          en: 'First mission, Discoverer: move your pointer smoothly over the numbered stars in order to light up the path!',
        },
        hint: {
          ar: 'ابدأ من النقطة رقم 1 التي تومض باللون الأخضر ثم اتبع السهم إلى الرقم التالي.',
          en: 'Start at node #1 glowing green, then follow the path to the next number.',
        },
        successFeedback: {
          ar: 'تحكم مذهل بالمؤشر! تم توصيل مسار الطاقة بنجاح!',
          en: 'Amazing pointer control! The energy path is fully connected!',
        },
        difficulty: 'easy',
        challengesCount: 4,
        xpReward: 20,
        starsReward: 3,
        isEnabled: true,
      },
      {
        id: 'dis-stg-2',
        stageNumber: 2,
        mechanicKey: 'click_challenge',
        title: {
          ar: 'المرحلة 2: Click Challenge – الضغط على العنصر المطلوب',
          en: 'Stage 2: Click Challenge – Target Clicking',
        },
        objective: {
          ar: 'التمييز السريع والنقر الدقيق على العناصر المطلوبة مع تجنب العناصر الخادعة.',
          en: 'Accurate clicking on target items while avoiding decoy items.',
        },
        instruction: {
          ar: 'انقر بدقة على العنصر المطلوب في شاشة الرادار وتجنب الضغط على العناصر الأخرى!',
          en: 'Click accurately on the requested target item on the radar screen and avoid decoys!',
        },
        audioPrompt: {
          ar: 'تحدي النقر السريع! انظر إلى العنصر المطلوب أعلى اللوحة واضغط عليه بدقة.',
          en: 'Click Challenge! Look at the required item at the top and click all matching targets.',
        },
        hint: {
          ar: 'تأكد من شكل ولون العنصر المطلوب قبل الضغط، ولا تضغط على العناصر المختلفة.',
          en: 'Check the exact icon and color requested before clicking.',
        },
        successFeedback: {
          ar: 'نقرات دقيقة وسريعة! أنت محترف في استخدام زر الماوس!',
          en: 'Sharp and accurate clicks! You are a mouse button pro!',
        },
        difficulty: 'medium',
        challengesCount: 4,
        xpReward: 20,
        starsReward: 3,
        isEnabled: true,
      },
      {
        id: 'dis-stg-3',
        stageNumber: 3,
        mechanicKey: 'drag_drop_parts',
        title: {
          ar: 'المرحلة 3: Drag & Drop – سحب العناصر إلى أماكنها',
          en: 'Stage 3: Drag & Drop – Component Placement',
        },
        objective: {
          ar: 'الضغط المستمر والسحب والإفلات لتركيب وحدات الحاسوب الذكي في منافذها الصحيحة.',
          en: 'Press, hold, drag, and drop smart computer modules into their matching sockets.',
        },
        instruction: {
          ar: 'اسحب كل قطعة تقنية من درج الأدوات وأفلتها داخل المنفذ المطابق لها في اللوحة الأم!',
          en: 'Drag each tech module from the tray and drop it into its matching socket on the mainboard!',
        },
        audioPrompt: {
          ar: 'الآن حان وقت السحب والإفلات! اضغط مع الاستمرار على القطعة واسحبها إلى مكانها الصحيح.',
          en: 'Now it is time for Drag and Drop! Hold down on each part and drag it to its matching slot.',
        },
        hint: {
          ar: 'طابق رمز القطعة ولونها مع الرمز المرسوم داخل المنفذ.',
          en: 'Match the part icon and color with the symbol inside the socket.',
        },
        successFeedback: {
          ar: 'رائع! تم تركيب جميع وحدات الحاسوب بالسحب والإفلات بنجاح!',
          en: 'Awesome! All computer modules were dragged and installed cleanly!',
        },
        difficulty: 'medium',
        challengesCount: 4,
        xpReward: 25,
        starsReward: 3,
        isEnabled: true,
      },
      {
        id: 'dis-stg-4',
        stageNumber: 4,
        mechanicKey: 'puzzle_builder',
        title: {
          ar: 'المرحلة 4: Puzzle Builder – تركيب أجزاء الصور',
          en: 'Stage 4: Puzzle Builder – Blueprint Assembly',
        },
        objective: {
          ar: 'إعادة تجميع أجزاء مخطط مركبة الفضاء الذكية في شبكتها الهندسية الصحيحة.',
          en: 'Reconstruct the Smart Rover blueprint segments into their exact grid positions.',
        },
        instruction: {
          ar: 'اسحب قطع صورة المركبة الذكية وركبها في الخانات الأربع لتكتمل اللوحة الهندسية!',
          en: 'Drag the Smart Rover picture segments and snap them into the grid to complete the blueprint!',
        },
        audioPrompt: {
          ar: 'بناء اللغز الهندسي! ركب أجزاء الصورة معاً لنكشف مخطط مركبة سمارت كودرز.',
          en: 'Puzzle Builder! Assemble the picture pieces together to reveal the Smart Coders Rover blueprint.',
        },
        hint: {
          ar: 'لاحظ رقم الركن (أعلى يمين، أعلى يسار، أسفل يمين، أسفل يسار) وتكامل خطوط الرسم.',
          en: 'Check the corner position (top-left, top-right, bottom-left, bottom-right) and line continuity.',
        },
        successFeedback: {
          ar: 'إبداع هندسي! اكتملت صورة المركبة الذكية بنجاح!',
          en: 'Engineering brilliance! The Smart Rover blueprint is complete!',
        },
        difficulty: 'medium',
        challengesCount: 4,
        xpReward: 30,
        starsReward: 4,
        isEnabled: true,
      },
      {
        id: 'dis-stg-5',
        stageNumber: 5,
        mechanicKey: 'mission_complete_combo',
        title: {
          ar: 'المرحلة 5: Mission Complete – تنفيذ سلسلة من المهام',
          en: 'Stage 5: Mission Complete – Multi-Step Tech Operation',
        },
        objective: {
          ar: 'الجمع بين تحريك المؤشر، النقر على الأزرار، وسحب بطاقة التشغيل في مهمة متتابعة واحدة.',
          en: 'Combine pointer scanning, button clicking, and keycard drag-and-drop in one sequential mission.',
        },
        instruction: {
          ar: 'نفّذ المهمة الكاملة من 3 خطوات: (1) مرّر المؤشر لفحص الحساسات، (2) اضغط أزرار الشفرة بالترتيب، (3) اسحب بطاقة الطاقة لتشغيل القمر الصناعي!',
          en: 'Complete the 3-phase mission: (1) Hover to scan sensors, (2) Click code switches in order, (3) Drag the power keycard to launch!',
        },
        audioPrompt: {
          ar: 'المهمة النهائية الشاملة! استخدم كل مهارات الماوس التي تعلمتها لإطلاق القمر الصناعي الذكي!',
          en: 'Final integrated mission! Use all your mouse skills—hover, click, and drag—to launch the smart satellite!',
        },
        hint: {
          ar: 'اتبع مؤشر المرحلة النشطة أعلى لوحة التحكم خطوة بخطوة (المسح ← النقر ← السحب).',
          en: 'Follow the active step indicator at the top of the console (Scan -> Click -> Drag).',
        },
        successFeedback: {
          ar: 'مهمة مكتملة بنجاح باهر! أنت الآن قائد ماوس معتمد في سمارت كودرز!',
          en: 'Mission Complete! You are now a certified Smart Coders Mouse Commander!',
        },
        difficulty: 'hard',
        challengesCount: 3,
        xpReward: 40,
        starsReward: 5,
        isEnabled: true,
      },
    ],
  },
  {
    id: 'creators_robot_coding',
    ageGroup: '5-6',
    pathwayTitle: {
      ar: 'المستوى الثالث: SMART CODERS CREATORS (5–6 سنوات)',
      en: 'Level 3: SMART CODERS CREATORS (Ages 5–6)',
    },
    gameTitle: {
      ar: 'مغامرة برمجة الروبوت (Robot Coding Adventure)',
      en: 'Robot Coding Adventure',
    },
    subtitle: {
      ar: 'مغامرة برمجية لتعليم التفكير المنطقي، الاتجاهات، بناء خوارزميات الحركة، واكتشاف الأخطاء البرمجية مع الروبوت "سمارتي".',
      en: 'A coding adventure teaching logical thinking, directions, command sequencing, and debugging with Smarty the Robot.',
    },
    mascotName: { ar: 'المهندس سمارتي', en: 'Engineer Smarty' },
    mascotRole: { ar: 'مدرب الخوارزميات والبرمجة', en: 'Algorithms & Robotics Coach' },
    heroImage: '/src/assets/images/creators_robot_coding_hero_1794728012308.jpg',
    accentColor: 'emerald',
    isEnabled: true,
    stages: [
      {
        id: 'cre-stg-1',
        stageNumber: 1,
        mechanicKey: 'direction_master',
        title: {
          ar: 'المرحلة 1: Direction Master – تعلم الاتجاهات',
          en: 'Stage 1: Direction Master – Learn Directions',
        },
        objective: {
          ar: 'إتقان الاتجاهات الأربعة الأساسية (يمين، يسار، أعلى، أسفل) لتوجيه الروبوت نحو الهدف المباشر.',
          en: 'Master the 4 cardinal directions (Right, Left, Up, Down) to guide the robot to the target.',
        },
        instruction: {
          ar: 'أضف أسهم الاتجاهات الصحيحة إلى قائمة الأوامر ثم اضغط "تشغيل البرنامج" ليصل الروبوت إلى علم النهاية!',
          en: 'Add the correct direction arrows to the command list, then press "Run Program" to reach the goal flag!',
        },
        audioPrompt: {
          ar: 'أهلاً بك يا مبرمج المستقبل! اختر اتجاه الحركة الصحيح ثم شغّل البرنامج لنرى الروبوت يتحرك.',
          en: 'Welcome future coder! Choose the right direction commands and run your program to watch the robot move.',
        },
        hint: {
          ar: 'عدّ المربعات بين الروبوت والعلم، وأضف سهماً واحداً لكل خطوة في نفس الاتجاه.',
          en: 'Count the grid tiles between the robot and the flag, adding one arrow per tile.',
        },
        successFeedback: {
          ar: 'بداية برمجية ممتازة! لقد أتقنت توجيه الروبوت بالاتجاهات الصحيحة!',
          en: 'Excellent coding start! You mastered directional navigation!',
        },
        difficulty: 'easy',
        challengesCount: 3,
        xpReward: 25,
        starsReward: 3,
        isEnabled: true,
      },
      {
        id: 'cre-stg-2',
        stageNumber: 2,
        mechanicKey: 'command_builder',
        title: {
          ar: 'المرحلة 2: Command Builder – ترتيب الأوامر',
          en: 'Stage 2: Command Builder – Sequence Ordering',
        },
        objective: {
          ar: 'بناء وترتيب سلسلة أوامر متعددة الخطوات للالتفاف حول الزوايا والوصول للهدف.',
          en: 'Build and order a multi-step command sequence to turn corners and reach the goal.',
        },
        instruction: {
          ar: 'رتب سلسلة الأوامر خطوة بخطوة لتجاوز المنعطفات. يمكنك حذف أي أمر أو تغيير ترتيبه بالأسهم (↑ ↓)!',
          en: 'Build a step-by-step command sequence around corners. You can delete or reorder any command using (↑ ↓)!',
        },
        audioPrompt: {
          ar: 'في هذه المرحلة يحتاج الروبوت إلى التحرك في أكثر من اتجاه! رتب الأوامر بالتسلسل الصحيح ثم شغّل البرنامج.',
          en: 'Now the robot needs to turn corners! Arrange your commands in the exact order and run the code.',
        },
        hint: {
          ar: 'تخيل مسار الروبوت مربعاً بمربع: تحرك لليمين أولاً ثم انزل للأسفل نحو العلم.',
          en: 'Trace the robot path tile by tile: move horizontally first, then vertically toward the flag.',
        },
        successFeedback: {
          ar: 'خوارزمية متقنة! تسلسل الأوامر قاد الروبوت بدقة إلى الهدف!',
          en: 'Spot-on algorithm! Your command sequence guided the robot cleanly to the goal!',
        },
        difficulty: 'medium',
        challengesCount: 4,
        xpReward: 30,
        starsReward: 4,
        isEnabled: true,
      },
      {
        id: 'cre-stg-3',
        stageNumber: 3,
        mechanicKey: 'robot_mission_path',
        title: {
          ar: 'المرحلة 3: Robot Mission – توجيه الروبوت داخل مسار',
          en: 'Stage 3: Robot Mission – Path & Crystal Navigation',
        },
        objective: {
          ar: 'توجيه الروبوت داخل ممر آمن مع جمع جوهرة الطاقة وتجنب الحواجز.',
          en: 'Guide the robot through a safe corridor, collecting the energy crystal while avoiding obstacles.',
        },
        instruction: {
          ar: 'برمج الروبوت ليمر فوق جوهرة الطاقة الزرقاء (💎) ويتجنب الحواجز الحمراء (🚧) حتى يصل إلى بوابة النهاية!',
          en: 'Program the robot to collect the blue energy crystal (💎) and avoid red barriers (🚧) on the way to the portal!',
        },
        audioPrompt: {
          ar: 'احذر من الحواجز! يجب أن يجمع الروبوت جوهرة الطاقة في طريقه قبل الدخول إلى البوابة.',
          en: 'Watch out for barriers! The robot must collect the energy crystal before entering the goal portal.',
        },
        hint: {
          ar: 'وجه الروبوت نحو مربع الجوهرة أولاً، ثم أكمل الطريق بعيداً عن المربعات الحمراء.',
          en: 'Route the robot through the crystal tile first, steering clear of red obstacle tiles.',
        },
        successFeedback: {
          ar: 'مهمة ناجحة! جمعت الطاقة وتجاوزت جميع العوائق بذكاء!',
          en: 'Mission accomplished! You collected the crystal and navigated around every obstacle!',
        },
        difficulty: 'medium',
        challengesCount: 5,
        xpReward: 35,
        starsReward: 4,
        isEnabled: true,
      },
      {
        id: 'cre-stg-4',
        stageNumber: 4,
        mechanicKey: 'logic_puzzle_debug',
        title: {
          ar: 'المرحلة 4: Logic Puzzle – حل المشكلات واكتشاف الخطأ',
          en: 'Stage 4: Logic Puzzle – Debugging & Gate Switch',
        },
        objective: {
          ar: 'اكتشاف الخطأ المنطقي في برنامج مكتوب مسبقاً وإعادة ترتيب الأوامر لفتح البوابة بالمفتاح.',
          en: 'Debug a pre-loaded command sequence and reorder instructions to unlock the laser gate first.',
        },
        instruction: {
          ar: 'البرنامج الحالي به خطأ منطقي! عدّل ترتيب الأوامر أو أصلح الخطوة الخاطئة لكي يمر الروبوت على المفتاح الذهبي (🔑) لفتح البوابة (🚪) قبل التوجه للعلم!',
          en: 'The current program has a bug! Reorder or fix the commands so the robot steps on the Golden Key (🔑) to open the Laser Gate (🚪) before reaching the flag!',
        },
        audioPrompt: {
          ar: 'لغز منطقي! هناك خطأ في ترتيب الأوامر الحالية. اكتشف الخطأ وأعد ترتيب الأوامر ليفتح الروبوت البوابة أولاً!',
          en: 'Logic Puzzle! There is a bug in the starter code. Fix and reorder the commands so the robot unlocks the gate first!',
        },
        hint: {
          ar: 'اضغط "تشغيل البرنامج" لمشاهدة الخطوة التي يتوقف عندها الروبوت، ثم استخدم أزرار الترتيب (↑ ↓) أو الحذف لإصلاحها.',
          en: 'Press "Run Program" to see which step fails, then use the reorder (↑ ↓) or delete buttons to fix the sequence.',
        },
        successFeedback: {
          ar: 'تفكير منطقي عبقري! اكتشفت الخطأ البرمجي وأصلحته بنجاح!',
          en: 'Brilliant logical debugging! You found and fixed the bug in the code!',
        },
        difficulty: 'hard',
        challengesCount: 5,
        xpReward: 40,
        starsReward: 5,
        isEnabled: true,
      },
      {
        id: 'cre-stg-5',
        stageNumber: 5,
        mechanicKey: 'final_coding_challenge',
        title: {
          ar: 'المرحلة 5: Final Challenge – تنفيذ مهمة برمجية كاملة',
          en: 'Stage 5: Final Challenge – Full Robotics Mission',
        },
        objective: {
          ar: 'تخطيط وتنفيذ برنامج كامل يجمع جوهرتي البيانات ويفتح البوابة الأمنية ويصل إلى منصة إطلاق الصاروخ.',
          en: 'Plan and execute a complete program that collects 2 data crystals, unlocks the gate, and reaches the rocket pad.',
        },
        instruction: {
          ar: 'التحدي البرمجي الأكبر! اكتب البرنامج الكامل لجمع الجواهر (💎)، وتفعيل المفتاح (🔑)، والوصول إلى منصة الصاروخ (🚀)!',
          en: 'The Ultimate Coding Challenge! Write a complete program to collect crystals (💎), activate the key switch (🔑), and reach the Rocket Pad (🚀)!',
        },
        audioPrompt: {
          ar: 'وصلت إلى التحدي النهائي للمبدعين! صمّم برنامجك الكامل لإطلاق صاروخ سمارت كودرز!',
          en: 'Welcome to the Creators Final Challenge! Design your full program to launch the Smart Coders Rocket!',
        },
        hint: {
          ar: 'قسّم المهمة إلى 3 أجزاء: اجمع الجوهرة الأولى، ثم اتجه للمفتاح والجوهرة الثانية، ثم ادخل البوابة نحو الصاروخ.',
          en: 'Break the problem into 3 steps: collect the first crystal, hit the key switch and second crystal, then pass through the gate to the rocket.',
        },
        successFeedback: {
          ar: 'إنجاز أسطوري! أنت الآن مبرمج روبوتات محترف في SMART CODERS CREATORS!',
          en: 'Legendary achievement! You are now a certified SMART CODERS CREATORS Robot Programmer!',
        },
        difficulty: 'hard',
        challengesCount: 6,
        xpReward: 50,
        starsReward: 5,
        isEnabled: true,
      },
    ],
  },
];

function getRecentDateIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDefaultChildProfiles(): ChildProfileRecord[] {
  const yesterday = getRecentDateIso(1);
  const twoDaysAgo = getRecentDateIso(2);

  return [
    {
      id: 'child-explorer-3',
      name: { ar: 'ياسين أحمد (3–4 سنوات)', en: 'Yassin Ahmed (3–4 yrs)' },
      ageYears: 3,
      ageGroup: '3-4',
      avatarEmoji: '🐣',
      progress: {
        studentId: 'child-explorer-3',
        completedLessonIds: ['les-1'],
        completedActivityIds: ['act-1'],
        starsEarned: 6,
        badges: ['مستكشف الألوان الصغير'],
        lastActiveDate: yesterday,
        dailyStreak: 2,
        lastStreakDate: yesterday,
        activeDates: [twoDaysAgo, yesterday],
        xpEarned: 60,
        selectedAgeGroup: '3-4',
        unlockedJigsawByAge: { '3-4': 1, '4-5': 1, '5-6': 1 },
        unlockedWorkshopByAge: { '3-4': 1, '4-5': 1, '5-6': 1 },
        enjoymentRatings: {},
      },
      unlockedStageByGame: {
        explorers_color_shape: 1,
        discoverers_mouse_mission: 1,
        creators_robot_coding: 1,
      },
      completedStageIds: [],
      stageAssessments: {},
    },
    {
      id: 'child-discoverer-4',
      name: { ar: 'ليلى محمود (4–5 سنوات)', en: 'Laila Mahmoud (4–5 yrs)' },
      ageYears: 4,
      ageGroup: '4-5',
      avatarEmoji: '🦊',
      progress: {
        studentId: 'child-discoverer-4',
        completedLessonIds: ['les-1'],
        completedActivityIds: ['act-1'],
        starsEarned: 10,
        badges: ['مكتشفة الماوس الذكي'],
        lastActiveDate: yesterday,
        dailyStreak: 3,
        lastStreakDate: yesterday,
        activeDates: [getRecentDateIso(3), twoDaysAgo, yesterday],
        xpEarned: 100,
        selectedAgeGroup: '4-5',
        unlockedJigsawByAge: { '3-4': 2, '4-5': 1, '5-6': 1 },
        unlockedWorkshopByAge: { '3-4': 1, '4-5': 1, '5-6': 1 },
        enjoymentRatings: {},
      },
      unlockedStageByGame: {
        explorers_color_shape: 1,
        discoverers_mouse_mission: 1,
        creators_robot_coding: 1,
      },
      completedStageIds: [],
      stageAssessments: {},
    },
    {
      id: 'child-creator-6',
      name: { ar: 'عمر خالد (5–6 سنوات)', en: 'Omar Khaled (5–6 yrs)' },
      ageYears: 6,
      ageGroup: '5-6',
      avatarEmoji: '🚀',
      progress: {
        studentId: 'child-creator-6',
        completedLessonIds: ['les-1'],
        completedActivityIds: ['act-1'],
        starsEarned: 15,
        badges: ['مواطن رقمي ذكي', 'مبرمج الروبوت المبدع'],
        lastActiveDate: yesterday,
        dailyStreak: 2,
        lastStreakDate: yesterday,
        activeDates: [twoDaysAgo, yesterday],
        xpEarned: 150,
        selectedAgeGroup: '5-6',
        unlockedJigsawByAge: { '3-4': 2, '4-5': 2, '5-6': 1 },
        unlockedWorkshopByAge: { '3-4': 1, '4-5': 1, '5-6': 1 },
        enjoymentRatings: {},
      },
      unlockedStageByGame: {
        explorers_color_shape: 1,
        discoverers_mouse_mission: 1,
        creators_robot_coding: 1,
      },
      completedStageIds: [],
      stageAssessments: {},
    },
  ];
}

export function loadAgeGamesConfig(): AgeGameConfig[] {
  if (typeof window === 'undefined') return defaultAgeGamesConfig;
  try {
    const raw = window.localStorage.getItem(AGE_GAMES_STORAGE_KEY);
    if (!raw) return defaultAgeGamesConfig;
    const parsed = JSON.parse(raw) as AgeGameConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultAgeGamesConfig;
    return parsed;
  } catch {
    return defaultAgeGamesConfig;
  }
}

export function saveAgeGamesConfig(configs: AgeGameConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AGE_GAMES_STORAGE_KEY, JSON.stringify(configs));
    window.dispatchEvent(new CustomEvent('smartcoders:age-games-updated'));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetAgeGamesConfig(): AgeGameConfig[] {
  saveAgeGamesConfig(defaultAgeGamesConfig);
  return defaultAgeGamesConfig;
}

export function loadChildProfiles(): ChildProfileRecord[] {
  if (typeof window === 'undefined') return createDefaultChildProfiles();
  try {
    const raw = window.localStorage.getItem(CHILD_PROFILES_STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultChildProfiles();
      window.localStorage.setItem(CHILD_PROFILES_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw) as ChildProfileRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaults = createDefaultChildProfiles();
      window.localStorage.setItem(CHILD_PROFILES_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return parsed;
  } catch {
    return createDefaultChildProfiles();
  }
}

export function saveChildProfiles(profiles: ChildProfileRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CHILD_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
    window.dispatchEvent(new CustomEvent('smartcoders:children-updated'));
  } catch {
    // Ignore storage quota errors
  }
}

export function getActiveChildId(): string {
  if (typeof window === 'undefined') return 'child-explorer-3';
  const stored = window.localStorage.getItem(ACTIVE_CHILD_ID_STORAGE_KEY);
  const profiles = loadChildProfiles();
  if (stored && profiles.some((p) => p.id === stored)) {
    return stored;
  }
  return profiles[0].id;
}

export function setActiveChildId(childId: string): ChildProfileRecord {
  const profiles = loadChildProfiles();
  const found = profiles.find((p) => p.id === childId) || profiles[0];
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ACTIVE_CHILD_ID_STORAGE_KEY, found.id);
    window.dispatchEvent(new CustomEvent('smartcoders:children-updated'));
  }
  return found;
}
