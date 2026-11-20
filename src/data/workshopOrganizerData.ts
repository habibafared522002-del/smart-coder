import { JuniorAgeGroup } from '../types';

export type WorkshopCameraFocus =
  | 'overview'
  | 'workbench'
  | 'gears_cart'
  | 'electronics'
  | 'shelves'
  | 'assembly_bay';

export type WorkshopModelType =
  | 'wrench'
  | 'screwdriver'
  | 'pliers'
  | 'spur_gear'
  | 'rover_wheel'
  | 'axle_rod'
  | 'cpu_module'
  | 'sensor_sonar'
  | 'power_cable'
  | 'battery_pack'
  | 'servo_motor'
  | 'chassis_core';

export type WorkshopZoneKind =
  | 'tool_rack'
  | 'workbench_mat'
  | 'parts_box'
  | 'electronics_tray'
  | 'shelf_bottom'
  | 'shelf_middle'
  | 'shelf_top'
  | 'assembly_socket';

export interface WorkshopItemConfig {
  id: string;
  modelType: WorkshopModelType;
  label: { ar: string; en: string };
  category: 'tools' | 'mechanical' | 'electronics' | 'storage' | 'assembly';
  accentHex: string;
  scatterPos: [number, number, number];
  scatterRotY: number;
  targetZoneId: string;
}

export interface WorkshopZoneConfig {
  id: string;
  label: { ar: string; en: string };
  shortBadge: string;
  zoneKind: WorkshopZoneKind;
  worldPos: [number, number, number];
  acceptsItemIds: string[];
  accentHex: string;
}

export interface WorkshopAgeVariant {
  activeItemIds: string[];
  activeZoneIds: string[];
  showVisualGuides: boolean;
  hintNote: { ar: string; en: string };
}

export interface WorkshopMissionConfig {
  id: string;
  missionNumber: number;
  order: number;
  isPublished: boolean;
  title: { ar: string; en: string };
  objective: { ar: string; en: string };
  instruction: { ar: string; en: string };
  audioText: { ar: string; en: string };
  hint: { ar: string; en: string };
  successMessage: { ar: string; en: string };
  retryMessage: { ar: string; en: string };
  xpReward: number;
  cameraFocus: WorkshopCameraFocus;
  items: WorkshopItemConfig[];
  zones: WorkshopZoneConfig[];
  ageVariants: Record<JuniorAgeGroup, WorkshopAgeVariant>;
}

export interface WorkshopGameConfig {
  id: string;
  title: { ar: string; en: string };
  pathwayLabel: { ar: string; en: string };
  introStory: { ar: string; en: string };
  completionStory: { ar: string; en: string };
  missions: WorkshopMissionConfig[];
}

export const WORKSHOP_STORAGE_KEY = 'smartcoders_workshop_levels_v1';

export const defaultWorkshopConfig: WorkshopGameConfig = {
  id: 'smart-workshop-organizer',
  title: {
    ar: 'مهمة تنظيم معمل الروبوتات',
    en: 'SMART WORKSHOP ORGANIZER',
  },
  pathwayLabel: {
    ar: 'مسار صغار المبرمجين جونيور (3–6 سنوات)',
    en: 'SMART CODERS JUNIOR (Ages 3–6)',
  },
  introStory: {
    ar: 'أهلًا يا بطل! أنا محتاج مساعدتك النهارده. المعمل محتاج يتنظم قبل ما نبدأ مشروعنا الجديد. تعالى نرتب الأدوات والمكونات سوا!',
    en: "Hello! I need your help today. Our workshop needs to be organized before we start a new project. Let's put everything in its correct place!",
  },
  completionStory: {
    ar: 'مذهل يا مهندس سمارت كودرز! معمل الروبوتات الآن منظم وجاهز بالكامل لبدء مشروعنا الهندسي الجديد!',
    en: 'Incredible job, Smart Coders Engineer! Our robotics workshop is completely organized and powered up for our new project!',
  },
  missions: [
    {
      id: 'ws-mission-1',
      missionNumber: 1,
      order: 1,
      isPublished: true,
      title: {
        ar: 'المهمة 1 – ترتيب أدوات الورشة على المنضدة واللوحة',
        en: 'Mission 1 – Tool Rack & Workbench Sorting',
      },
      objective: {
        ar: 'تمييز أدوات الصيانة الهندسية ووضع كل أداة في مكانها المخصص.',
        en: 'Identify core workshop hand tools and place each tool on the tool rack or workbench pad.',
      },
      instruction: {
        ar: 'اسحب مفتاح الربط والمفك والكماشة المبعثرة على الأرض وضع كل أداة على لوحة الأدوات أو منضدة العمل.',
        en: 'Drag the scattered wrench, screwdriver, and pliers onto the matching hooks on the tool wall and workbench.',
      },
      audioText: {
        ar: 'أهلًا يا بطل! لنبدأ بترتيب أدوات الورشة: اسحب مفتاح الربط والمفك والكماشة إلى لوحة الأدوات.',
        en: 'Let us organize the tools first! Drag the wrench, screwdriver, and pliers to the tool rack.',
      },
      hint: {
        ar: 'ابحث عن الحلقات المضيئة أعلى منضدة العمل في الخلف.',
        en: 'Look for the glowing tool slots on the back pegboard wall and workbench mat.',
      },
      successMessage: {
        ar: 'ممتاز! أدوات الصيانة الآن معلقة ومرتبة بأمان!',
        en: 'Awesome work! All workshop tools are neatly mounted and organized!',
      },
      retryMessage: {
        ar: 'قربت جدًا! هذه الأداة لها مكان مختلف على اللوحة، جرب العلامة المطابقة لها.',
        en: 'Almost there! That tool belongs to another slot — match its glowing outline.',
      },
      xpReward: 15,
      cameraFocus: 'workbench',
      items: [
        {
          id: 'item-wrench',
          modelType: 'wrench',
          label: { ar: 'مفتاح الربط المعدني', en: 'Steel Wrench' },
          category: 'tools',
          accentHex: '#dc2626',
          scatterPos: [-1.45, 0.2, 0.88],
          scatterRotY: 0.4,
          targetZoneId: 'zone-wrench-hook',
        },
        {
          id: 'item-screwdriver',
          modelType: 'screwdriver',
          label: { ar: 'مفك البراغي الدقيق', en: 'Precision Screwdriver' },
          category: 'tools',
          accentHex: '#f59e0b',
          scatterPos: [-0.35, 0.2, 1.02],
          scatterRotY: -0.35,
          targetZoneId: 'zone-driver-hook',
        },
        {
          id: 'item-pliers',
          modelType: 'pliers',
          label: { ar: 'كماشة الفني', en: 'Technician Pliers' },
          category: 'tools',
          accentHex: '#0284c7',
          scatterPos: [0.85, 0.2, 0.9],
          scatterRotY: 0.65,
          targetZoneId: 'zone-pliers-mat',
        },
      ],
      zones: [
        {
          id: 'zone-wrench-hook',
          label: { ar: 'حامل مفتاح الربط', en: 'Wrench Rack Hook' },
          shortBadge: 'WRENCH',
          zoneKind: 'tool_rack',
          worldPos: [-1.45, 1.86, -2.54],
          acceptsItemIds: ['item-wrench'],
          accentHex: '#dc2626',
        },
        {
          id: 'zone-driver-hook',
          label: { ar: 'حامل المفك', en: 'Driver Rack Hook' },
          shortBadge: 'DRIVER',
          zoneKind: 'tool_rack',
          worldPos: [-0.55, 1.86, -2.54],
          acceptsItemIds: ['item-screwdriver'],
          accentHex: '#f59e0b',
        },
        {
          id: 'zone-pliers-mat',
          label: { ar: 'بساط منضدة الأدوات', en: 'Workbench Tool Pad' },
          shortBadge: 'BENCH',
          zoneKind: 'workbench_mat',
          worldPos: [0.38, 1.08, -1.96],
          acceptsItemIds: ['item-pliers'],
          accentHex: '#0284c7',
        },
      ],
      ageVariants: {
        '3-4': {
          activeItemIds: ['item-wrench', 'item-screwdriver'],
          activeZoneIds: ['zone-wrench-hook', 'zone-driver-hook'],
          showVisualGuides: true,
          hintNote: { ar: 'أداتان كبيرتان مع إضاءة واضحة للمكان', en: 'Two clear tools with glowing target guides' },
        },
        '4-5': {
          activeItemIds: ['item-wrench', 'item-screwdriver', 'item-pliers'],
          activeZoneIds: ['zone-wrench-hook', 'zone-driver-hook', 'zone-pliers-mat'],
          showVisualGuides: true,
          hintNote: { ar: 'ثلاث أدوات متنوعة على اللوحة والمنضدة', en: 'Three varied tools across pegboard & bench' },
        },
        '5-6': {
          activeItemIds: ['item-wrench', 'item-screwdriver', 'item-pliers'],
          activeZoneIds: ['zone-pliers-mat', 'zone-wrench-hook', 'zone-driver-hook'],
          showVisualGuides: false,
          hintNote: { ar: 'تحدي التطابق المكاني دون تلميح لوني قوي', en: 'Spatial tool classification without color hints' },
        },
      },
    },
    {
      id: 'ws-mission-2',
      missionNumber: 2,
      order: 2,
      isPublished: true,
      title: {
        ar: 'المهمة 2 – تصنيف التروس والعجلات الميكانيكية',
        en: 'Mission 2 – Mechanical Gears & Wheels Crate',
      },
      objective: {
        ar: 'تحديد المكونات الحركية الميكانيكية وتصنيفها داخل عربة القطع الميكانيكية.',
        en: 'Recognize mechanical drive parts and sort them into the mechanical workshop cart.',
      },
      instruction: {
        ar: 'اجمع الترس المسنن وعجلة الروبوت ومحور الدوران وضعها داخل الأماكن المخصصة على عربة الميكانيكا.',
        en: 'Collect the spur gear, rover wheel, and drive axle and organize them on the mechanical parts cart.',
      },
      audioText: {
        ar: 'عمل رائع! الآن لِنَفرِز التروس والعجلات الميكانيكية داخل عربة القطع الهندسية.',
        en: 'Great! Now let us sort the mechanical gears, wheel, and drive axle onto the engineering cart.',
      },
      hint: {
        ar: 'انظر إلى العربة المعدنية في الجهة اليمنى من المعمل.',
        en: 'Look at the mechanical rolling cart on the right side of the workshop.',
      },
      successMessage: {
        ar: 'رائع! التروس والعجلات مرتبة وجاهزة للحركة!',
        en: 'Fantastic! Mechanical gears and wheels are sorted cleanly!',
      },
      retryMessage: {
        ar: 'تحقق من شكل القطعة: الترس لصندوق التروس، والعجلة لحامل العجلات.',
        en: 'Check the mechanical part shape: gears in the gear crate, wheel on the wheel dock!',
      },
      xpReward: 15,
      cameraFocus: 'gears_cart',
      items: [
        {
          id: 'item-spur-gear',
          modelType: 'spur_gear',
          label: { ar: 'ترس الحركة المسنن', en: 'Spur Gear' },
          category: 'mechanical',
          accentHex: '#d97706',
          scatterPos: [-1.35, 0.22, 0.88],
          scatterRotY: 0.2,
          targetZoneId: 'zone-gears-box',
        },
        {
          id: 'item-rover-wheel',
          modelType: 'rover_wheel',
          label: { ar: 'عجلة الروبوت المطاطية', en: 'Rover Wheel' },
          category: 'mechanical',
          accentHex: '#10b981',
          scatterPos: [-0.25, 0.22, 1.02],
          scatterRotY: -0.5,
          targetZoneId: 'zone-wheel-dock',
        },
        {
          id: 'item-axle-rod',
          modelType: 'axle_rod',
          label: { ar: 'محور التوصيل المعدني', en: 'Drive Axle' },
          category: 'mechanical',
          accentHex: '#6366f1',
          scatterPos: [0.85, 0.22, 0.9],
          scatterRotY: 0.8,
          targetZoneId: 'zone-axle-tray',
        },
      ],
      zones: [
        {
          id: 'zone-gears-box',
          label: { ar: 'صندوق التروس', en: 'Gear Box' },
          shortBadge: 'GEARS',
          zoneKind: 'parts_box',
          worldPos: [2.1, 0.82, 0.55],
          acceptsItemIds: ['item-spur-gear'],
          accentHex: '#d97706',
        },
        {
          id: 'zone-wheel-dock',
          label: { ar: 'حامل العجلات', en: 'Wheel Dock' },
          shortBadge: 'WHEELS',
          zoneKind: 'parts_box',
          worldPos: [2.58, 0.82, 0.98],
          acceptsItemIds: ['item-rover-wheel'],
          accentHex: '#10b981',
        },
        {
          id: 'zone-axle-tray',
          label: { ar: 'صينية المحاور', en: 'Axle Tray' },
          shortBadge: 'AXLES',
          zoneKind: 'parts_box',
          worldPos: [2.05, 0.82, 1.25],
          acceptsItemIds: ['item-axle-rod'],
          accentHex: '#6366f1',
        },
      ],
      ageVariants: {
        '3-4': {
          activeItemIds: ['item-spur-gear', 'item-rover-wheel'],
          activeZoneIds: ['zone-gears-box', 'zone-wheel-dock'],
          showVisualGuides: true,
          hintNote: { ar: 'ترس وعجلة بحجم واضح على العربة', en: 'Spur gear and rover wheel onto clear cart docks' },
        },
        '4-5': {
          activeItemIds: ['item-spur-gear', 'item-rover-wheel', 'item-axle-rod'],
          activeZoneIds: ['zone-gears-box', 'zone-wheel-dock', 'zone-axle-tray'],
          showVisualGuides: true,
          hintNote: { ar: 'تصنيف 3 أجزاء ميكانيكية متكاملة', en: 'Classify all 3 mechanical components' },
        },
        '5-6': {
          activeItemIds: ['item-axle-rod', 'item-spur-gear', 'item-rover-wheel'],
          activeZoneIds: ['zone-wheel-dock', 'zone-axle-tray', 'zone-gears-box'],
          showVisualGuides: false,
          hintNote: { ar: 'تصنيف دقيق لمحطة الميكانيكا بدون ألوان مساعدة', en: 'Precision mechanical sorting without color hints' },
        },
      },
    },
    {
      id: 'ws-mission-3',
      missionNumber: 3,
      order: 3,
      isPublished: true,
      title: {
        ar: 'المهمة 3 – تنظيم محطة الإلكترونيات والكابلات',
        en: 'Mission 3 – Electronics & Cables Station',
      },
      objective: {
        ar: 'حماية الدوائر الإلكترونية والحساسات بوضعها على لوحة الحماية الآمنة.',
        en: 'Safely organize electronic circuit boards, sonar sensors, and power cables onto the ESD tray.',
      },
      instruction: {
        ar: 'ضع وحدة المعالج الذكية وحساس المسافة وكابل الطاقة على منصة الإلكترونيات الآمنة فوق المنضدة.',
        en: 'Place the CPU module, ultrasonic sensor, and coiled power cable onto the ESD electronics station.',
      },
      audioText: {
        ar: 'القطع الإلكترونية حساسة جداً! هيا نضع المعالج والحساسات والكابل على المنضدة الآمنة.',
        en: 'Electronics need careful handling! Let us place the CPU, sonar sensor, and power cable on the ESD mat.',
      },
      hint: {
        ar: 'محطة الإلكترونيات موجودة على منضدة العمل الرئيسية في المنتصف.',
        en: 'The green/cyan ESD pads are right on top of the main workbench.',
      },
      successMessage: {
        ar: 'أبدعت! الدوائر الإلكترونية والكابلات محفوظة بأمان!',
        en: 'Brilliant! Electronic boards and cables are protected and organized!',
      },
      retryMessage: {
        ar: 'حاول مطابقة القطعة الإلكترونية مع مكانها المضيء على المنضدة.',
        en: 'Try matching each electronic part with its lit pad on the workbench.',
      },
      xpReward: 20,
      cameraFocus: 'electronics',
      items: [
        {
          id: 'item-cpu-module',
          modelType: 'cpu_module',
          label: { ar: 'وحدة المعالج الذكية', en: 'Smart CPU Module' },
          category: 'electronics',
          accentHex: '#059669',
          scatterPos: [-1.4, 0.2, 0.9],
          scatterRotY: 0.15,
          targetZoneId: 'zone-cpu-esd',
        },
        {
          id: 'item-sonar-sensor',
          modelType: 'sensor_sonar',
          label: { ar: 'حساس المسافة', en: 'Ultrasonic Sensor' },
          category: 'electronics',
          accentHex: '#0ea5e9',
          scatterPos: [-0.25, 0.2, 1.02],
          scatterRotY: -0.25,
          targetZoneId: 'zone-sensor-esd',
        },
        {
          id: 'item-power-cable',
          modelType: 'power_cable',
          label: { ar: 'كابل الطاقة الملتف', en: 'Coiled Power Cable' },
          category: 'electronics',
          accentHex: '#ef4444',
          scatterPos: [0.85, 0.2, 0.9],
          scatterRotY: 0.55,
          targetZoneId: 'zone-cable-reel',
        },
      ],
      zones: [
        {
          id: 'zone-cpu-esd',
          label: { ar: 'منصة المعالج ESD', en: 'CPU ESD Pad' },
          shortBadge: 'CPU',
          zoneKind: 'electronics_tray',
          worldPos: [-1.45, 1.08, -1.96],
          acceptsItemIds: ['item-cpu-module'],
          accentHex: '#059669',
        },
        {
          id: 'zone-sensor-esd',
          label: { ar: 'منصة الحساسات', en: 'Sensor Dock' },
          shortBadge: 'SONAR',
          zoneKind: 'electronics_tray',
          worldPos: [-0.55, 1.08, -1.96],
          acceptsItemIds: ['item-sonar-sensor'],
          accentHex: '#0ea5e9',
        },
        {
          id: 'zone-cable-reel',
          label: { ar: 'حامل الكابلات', en: 'Cable Anchor' },
          shortBadge: 'CABLE',
          zoneKind: 'workbench_mat',
          worldPos: [0.42, 1.08, -1.96],
          acceptsItemIds: ['item-power-cable'],
          accentHex: '#ef4444',
        },
      ],
      ageVariants: {
        '3-4': {
          activeItemIds: ['item-cpu-module', 'item-sonar-sensor'],
          activeZoneIds: ['zone-cpu-esd', 'zone-sensor-esd'],
          showVisualGuides: true,
          hintNote: { ar: 'المعالج وحساس المسافة على المنضدة الخضراء', en: 'CPU board and sonar eye on the ESD pads' },
        },
        '4-5': {
          activeItemIds: ['item-cpu-module', 'item-sonar-sensor', 'item-power-cable'],
          activeZoneIds: ['zone-cpu-esd', 'zone-sensor-esd', 'zone-cable-reel'],
          showVisualGuides: true,
          hintNote: { ar: 'اللوحة + الحساس + الكابل الإلكتروني', en: 'All 3 electronics & cable stations' },
        },
        '5-6': {
          activeItemIds: ['item-power-cable', 'item-cpu-module', 'item-sonar-sensor'],
          activeZoneIds: ['zone-sensor-esd', 'zone-cable-reel', 'zone-cpu-esd'],
          showVisualGuides: false,
          hintNote: { ar: 'ترتيب محطة الإلكترونيات بدقة عالية', en: 'Unassisted electronics bench sorting' },
        },
      },
    },
    {
      id: 'ws-mission-4',
      missionNumber: 4,
      order: 4,
      isPublished: true,
      title: {
        ar: 'المهمة 4 – تنظيم أرفف التخزين الثلاثة حسب الارتفاع',
        en: 'Mission 4 – Multi-Tier Storage Shelf Organization',
      },
      objective: {
        ar: 'فهم الترتيب المكاني العمودي: الأشياء الثقيلة بالأسفل والمتوسطة في الوسط والخفيفة بالأعلى.',
        en: 'Master vertical spatial organization: heavy battery pack at Bottom Shelf, motor servo at Middle, light sensors at Top.',
      },
      instruction: {
        ar: 'رتب المكونات على وحدة الأرفف: البطارية الثقيلة في الرف السفلي، ومحرك السيرفو في الرف الأوسط، والحساسات في الرف العلوي.',
        en: 'Place the heavy Battery Pack on the Bottom Shelf, Servo Motor on the Middle Shelf, and Light Sensor Kit on the Top Shelf.',
      },
      audioText: {
        ar: 'الأشياء الثقيلة توضع في الرف السفلي للحفاظ على السلامة! رتب البطارية بالأسفل والمحرك بالوسط والحساس بالأعلى.',
        en: 'Heavy items stay safe on the bottom shelf! Put the battery at the bottom, motor in the middle, and sensor kit on top.',
      },
      hint: {
        ar: 'وحدة الأرفف الطويلة في أقصى يمين المعمل بثلاثة طوابق.',
        en: 'Check the 3-tier industrial rack on the back-right wall: Bottom, Middle, and Top shelves.',
      },
      successMessage: {
        ar: 'ذكي جداً! وحدة التخزين الآن متوازنة وآمنة تماماً!',
        en: 'Super smart! The 3-tier storage rack is balanced and safe!',
      },
      retryMessage: {
        ar: 'انتبه لارتفاع الرف: البطارية ثقيلة للرف السفلي والحساسات للرف العلوي!',
        en: 'Check shelf height: heavy Battery goes on Bottom Shelf, light Sensors on Top Shelf!',
      },
      xpReward: 20,
      cameraFocus: 'shelves',
      items: [
        {
          id: 'item-battery-heavy',
          modelType: 'battery_pack',
          label: { ar: 'حزمة البطاريات الثقيلة', en: 'Heavy Battery Pack' },
          category: 'storage',
          accentHex: '#dc2626',
          scatterPos: [-1.25, 0.22, 0.9],
          scatterRotY: 0.3,
          targetZoneId: 'zone-shelf-bottom',
        },
        {
          id: 'item-servo-mid',
          modelType: 'servo_motor',
          label: { ar: 'محرك السيرفو', en: 'Servo Motor Unit' },
          category: 'storage',
          accentHex: '#f59e0b',
          scatterPos: [-0.2, 0.22, 1.02],
          scatterRotY: -0.2,
          targetZoneId: 'zone-shelf-middle',
        },
        {
          id: 'item-sensor-top',
          modelType: 'sensor_sonar',
          label: { ar: 'عدة الحساسات الخفيفة', en: 'Light Sensor Kit' },
          category: 'storage',
          accentHex: '#0ea5e9',
          scatterPos: [0.9, 0.22, 0.9],
          scatterRotY: 0.45,
          targetZoneId: 'zone-shelf-top',
        },
      ],
      zones: [
        {
          id: 'zone-shelf-bottom',
          label: { ar: 'الرف السفلي (الثقيل)', en: 'Bottom Shelf (Heavy)' },
          shortBadge: 'BOTTOM',
          zoneKind: 'shelf_bottom',
          worldPos: [2.85, 0.46, -1.65],
          acceptsItemIds: ['item-battery-heavy'],
          accentHex: '#dc2626',
        },
        {
          id: 'zone-shelf-middle',
          label: { ar: 'الرف الأوسط (المحركات)', en: 'Middle Shelf (Motors)' },
          shortBadge: 'MIDDLE',
          zoneKind: 'shelf_middle',
          worldPos: [2.85, 1.24, -1.65],
          acceptsItemIds: ['item-servo-mid'],
          accentHex: '#f59e0b',
        },
        {
          id: 'zone-shelf-top',
          label: { ar: 'الرف العلوي (الحساسات)', en: 'Top Shelf (Light Kits)' },
          shortBadge: 'TOP',
          zoneKind: 'shelf_top',
          worldPos: [2.85, 2.02, -1.65],
          acceptsItemIds: ['item-sensor-top'],
          accentHex: '#0ea5e9',
        },
      ],
      ageVariants: {
        '3-4': {
          activeItemIds: ['item-battery-heavy', 'item-sensor-top'],
          activeZoneIds: ['zone-shelf-bottom', 'zone-shelf-top'],
          showVisualGuides: true,
          hintNote: { ar: 'التمييز بين الرف السفلي والرف العلوي', en: 'Bottom vs Top shelf spatial contrast' },
        },
        '4-5': {
          activeItemIds: ['item-battery-heavy', 'item-servo-mid', 'item-sensor-top'],
          activeZoneIds: ['zone-shelf-bottom', 'zone-shelf-middle', 'zone-shelf-top'],
          showVisualGuides: true,
          hintNote: { ar: 'تصنيف عبر الأرفف الثلاثة', en: 'All 3 vertical shelf tiers' },
        },
        '5-6': {
          activeItemIds: ['item-sensor-top', 'item-battery-heavy', 'item-servo-mid'],
          activeZoneIds: ['zone-shelf-top', 'zone-shelf-middle', 'zone-shelf-bottom'],
          showVisualGuides: false,
          hintNote: { ar: 'تصنيف مكاني بالاعتماد على الوزن والموضع', en: 'Weight & tier spatial reasoning without color clues' },
        },
      },
    },
    {
      id: 'ws-mission-5',
      missionNumber: 5,
      order: 5,
      isPublished: true,
      title: {
        ar: 'المهمة 5 – تجهيز محطة تجميع الروبوت وإطلاق المشروع',
        en: 'Mission 5 – Robot Assembly Station Readiness',
      },
      objective: {
        ar: 'تركيب الأجزاء الأساسية على منصة تجميع الروبوت لتشغيل المعمل بالكامل.',
        en: 'Install the Core CPU, Servo Gear, Rover Wheel, and Power Cable onto the central 3D Assembly Station!',
      },
      instruction: {
        ar: 'المعمل منظم تقريباً! ركّب المعالج المركزي وترس المحرك وعجلة الحركة وكابل الطاقة على منصة تجميع الروبوت في المنتصف!',
        en: 'Almost ready! Mount the Core CPU, Servo Gear, Rover Wheel, and Power Cable onto the central Robot Assembly Bay!',
      },
      audioText: {
        ar: 'الخطوة الأخيرة يا بطل! ركب قطع التجميع على منصة الروبوت المركزية لنبدأ مشروعنا!',
        en: 'Final step, engineer! Mount the four calibrated parts onto the Robot Assembly Station to power up!',
      },
      hint: {
        ar: 'المنصة الدائرية المضيئة في منتصف المعمل هي محطة تجميع الروبوت.',
        en: 'Look at the glowing turntable stand right in the middle of the workshop!',
      },
      successMessage: {
        ar: 'مبروك! معمل الروبوتات جاهز والروبوت يعمل بطاقة كاملة!',
        en: 'Mission Accomplished! The workshop and assembly bay are powered up!',
      },
      retryMessage: {
        ar: 'طابق كل قطعة بمكانها المخصص على هيكل الروبوت في المنصة.',
        en: 'Match each component to its dedicated mounting socket on the assembly stand.',
      },
      xpReward: 30,
      cameraFocus: 'assembly_bay',
      items: [
        {
          id: 'item-asm-cpu',
          modelType: 'chassis_core',
          label: { ar: 'وحدة النواة المركزية', en: 'Robot Core CPU' },
          category: 'assembly',
          accentHex: '#10b981',
          scatterPos: [-1.45, 0.22, 0.88],
          scatterRotY: 0.25,
          targetZoneId: 'zone-asm-core',
        },
        {
          id: 'item-asm-gear',
          modelType: 'spur_gear',
          label: { ar: 'ترس الكتف المسنن', en: 'Drive Spur Gear' },
          category: 'assembly',
          accentHex: '#f59e0b',
          scatterPos: [-0.5, 0.22, 1.02],
          scatterRotY: -0.4,
          targetZoneId: 'zone-asm-gear',
        },
        {
          id: 'item-asm-wheel',
          modelType: 'rover_wheel',
          label: { ar: 'عجلة المنصة الدافعة', en: 'Mobility Wheel' },
          category: 'assembly',
          accentHex: '#0284c7',
          scatterPos: [0.45, 0.22, 1.02],
          scatterRotY: 0.15,
          targetZoneId: 'zone-asm-wheel',
        },
        {
          id: 'item-asm-cable',
          modelType: 'power_cable',
          label: { ar: 'كابل التشغيل النهائي', en: 'Main Power Link' },
          category: 'assembly',
          accentHex: '#dc2626',
          scatterPos: [1.35, 0.22, 0.88],
          scatterRotY: -0.6,
          targetZoneId: 'zone-asm-cable',
        },
      ],
      zones: [
        {
          id: 'zone-asm-core',
          label: { ar: 'حجرة المعالج المركزي', en: 'Core CPU Socket' },
          shortBadge: 'CORE',
          zoneKind: 'assembly_socket',
          worldPos: [0.55, 0.96, -0.32],
          acceptsItemIds: ['item-asm-cpu'],
          accentHex: '#10b981',
        },
        {
          id: 'zone-asm-gear',
          label: { ar: 'محور الترس الجانبي', en: 'Gear Spindle' },
          shortBadge: 'GEAR',
          zoneKind: 'assembly_socket',
          worldPos: [0.05, 0.85, -0.32],
          acceptsItemIds: ['item-asm-gear'],
          accentHex: '#f59e0b',
        },
        {
          id: 'zone-asm-wheel',
          label: { ar: 'قاعدة العجلة', en: 'Wheel Hub' },
          shortBadge: 'WHEEL',
          zoneKind: 'assembly_socket',
          worldPos: [1.08, 0.48, -0.28],
          acceptsItemIds: ['item-asm-wheel'],
          accentHex: '#0284c7',
        },
        {
          id: 'zone-asm-cable',
          label: { ar: 'منفذ الطاقة الرئيسي', en: 'Power Port' },
          shortBadge: 'POWER',
          zoneKind: 'assembly_socket',
          worldPos: [0.55, 0.56, -0.08],
          acceptsItemIds: ['item-asm-cable'],
          accentHex: '#dc2626',
        },
      ],
      ageVariants: {
        '3-4': {
          activeItemIds: ['item-asm-cpu', 'item-asm-wheel'],
          activeZoneIds: ['zone-asm-core', 'zone-asm-wheel'],
          showVisualGuides: true,
          hintNote: { ar: 'تركيب القلب المركزي وعجلة الحركة', en: 'Install the core CPU and rover wheel' },
        },
        '4-5': {
          activeItemIds: ['item-asm-cpu', 'item-asm-gear', 'item-asm-wheel'],
          activeZoneIds: ['zone-asm-core', 'zone-asm-gear', 'zone-asm-wheel'],
          showVisualGuides: true,
          hintNote: { ar: 'تركيب 3 مكونات على هيكل التجميع', en: 'Mount 3 parts on the assembly stand' },
        },
        '5-6': {
          activeItemIds: ['item-asm-cpu', 'item-asm-gear', 'item-asm-wheel', 'item-asm-cable'],
          activeZoneIds: ['zone-asm-core', 'zone-asm-gear', 'zone-asm-wheel', 'zone-asm-cable'],
          showVisualGuides: false,
          hintNote: { ar: 'تجميع كامل الروبوت وتوصيل الطاقة', en: 'Full 4-part precision assembly integration' },
        },
      },
    },
  ],
};

export function loadWorkshopConfig(): WorkshopGameConfig {
  if (typeof window === 'undefined') return defaultWorkshopConfig;
  try {
    const raw = window.localStorage.getItem(WORKSHOP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkshopGameConfig;
      if (parsed && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
        return {
          ...defaultWorkshopConfig,
          ...parsed,
          missions: [...parsed.missions]
            .sort((a, b) => a.order - b.order)
            .map((m, idx) => ({ ...m, order: idx + 1, missionNumber: idx + 1 })),
        };
      }
    }
  } catch {
    // Fallback to defaults
  }
  return defaultWorkshopConfig;
}

export function saveWorkshopConfig(config: WorkshopGameConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized: WorkshopGameConfig = {
      ...config,
      missions: [...config.missions]
        .sort((a, b) => a.order - b.order)
        .map((m, idx) => ({ ...m, order: idx + 1, missionNumber: idx + 1 })),
    };
    window.localStorage.setItem(WORKSHOP_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('smartcoders:workshop-updated'));
  } catch {
    // Ignore storage quota issues
  }
}

export function resetWorkshopConfigToDefault(): WorkshopGameConfig {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(WORKSHOP_STORAGE_KEY);
    window.dispatchEvent(new Event('smartcoders:workshop-updated'));
  }
  return defaultWorkshopConfig;
}
