import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Palette,
  Sparkles,
  Home,
  Printer,
  Play,
  Save,
  Trash2,
  CheckCircle2,
  Star,
  Plus,
  Undo2,
  Eraser,
  BookOpen,
} from 'lucide-react';
import { Language } from '../types';
import { ChildProfileRecord } from '../data/ageGamesData';
import {
  ChildWholePlatformState,
  CreativeProjectRecord,
  OASIS_DECORATIONS,
  PlacedOasisItem,
  SEVEN_EDUCATIONAL_WORLDS,
  UNPLUGGED_ACTIVITY_CARDS,
  getSmartyContextualDialogue,
  speakChildFriendly,
} from '../data/sevenWorldsPlatformData';
import { SmartyMascot3D, SmartyGameplayState } from './SmartyMascot3D';
import { playSound } from '../utils/soundEffects';

export type UnifiedHubTab = 'studio' | 'oasis' | 'unplugged';

interface UnifiedChildHubProps {
  language: Language;
  childProfile: ChildProfileRecord;
  platformState: ChildWholePlatformState;
  initialTab?: UnifiedHubTab;
  soundMuted: boolean;
  onSaveCreativeProject: (project: CreativeProjectRecord) => void;
  onDeleteCreativeProject: (projectId: string) => void;
  onUpdateOasisItems: (items: PlacedOasisItem[]) => void;
  onToggleUnpluggedComplete: (cardId: string) => void;
  onBack: () => void;
}

const STUDIO_BACKGROUNDS: Record<
  CreativeProjectRecord['backgroundId'],
  { labelAr: string; labelEn: string; classes: string; icon: string }
> = {
  space: {
    labelAr: 'الفضاء النجمي',
    labelEn: 'Starry Space',
    classes: 'from-slate-900 via-indigo-950 to-purple-900 text-white',
    icon: '🌌',
  },
  garden: {
    labelAr: 'الحديقة المشمسة',
    labelEn: 'Sunny Garden',
    classes: 'from-sky-300 via-emerald-200 to-lime-200 text-slate-900',
    icon: '🌻',
  },
  lab: {
    labelAr: 'معمل الروبوت',
    labelEn: 'Robot Lab',
    classes: 'from-cyan-900 via-slate-900 to-blue-950 text-white',
    icon: '🔬',
  },
  stage: {
    labelAr: 'مسرح القصص',
    labelEn: 'Story Stage',
    classes: 'from-rose-200 via-amber-100 to-fuchsia-200 text-slate-900',
    icon: '🎪',
  },
};

const SPRITE_PALETTE = [
  { emoji: '⭐', labelAr: 'نجمة', labelEn: 'Star' },
  { emoji: '🚀', labelAr: 'صاروخ', labelEn: 'Rocket' },
  { emoji: '🦋', labelAr: 'فراشة', labelEn: 'Butterfly' },
  { emoji: '🌳', labelAr: 'شجرة', labelEn: 'Tree' },
  { emoji: '🎈', labelAr: 'بالون', labelEn: 'Balloon' },
  { emoji: '🌈', labelAr: 'قوس قزح', labelEn: 'Rainbow' },
  { emoji: '🐶', labelAr: 'جرو', labelEn: 'Puppy' },
  { emoji: '☀️', labelAr: 'شمس', labelEn: 'Sun' },
];

const BRUSH_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899'];

const COLOR_MIXES = [
  {
    id: 'mix-orange',
    c1: '#ef4444',
    c2: '#facc15',
    res: '#f97316',
    labelAr: 'أحمر + أصفر = برتقالي 🟠',
    labelEn: 'Red + Yellow = Orange 🟠',
  },
  {
    id: 'mix-green',
    c1: '#3b82f6',
    c2: '#facc15',
    res: '#22c55e',
    labelAr: 'أزرق + أصفر = أخضر 🟢',
    labelEn: 'Blue + Yellow = Green 🟢',
  },
  {
    id: 'mix-purple',
    c1: '#ef4444',
    c2: '#3b82f6',
    res: '#9333ea',
    labelAr: 'أحمر + أزرق = بنفسجي 🟣',
    labelEn: 'Red + Blue = Purple 🟣',
  },
];

const OASIS_ZONES: Array<{
  id: PlacedOasisItem['zone'];
  titleAr: string;
  titleEn: string;
  emoji: string;
  bgClasses: string;
}> = [
  {
    id: 'robot_home',
    titleAr: 'بيت الروبوت سمارتي',
    titleEn: 'Smarty Robot Home',
    emoji: '🏠',
    bgClasses: 'from-amber-100 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/50',
  },
  {
    id: 'learning_garden',
    titleAr: 'حديقة التعلم الخضراء',
    titleEn: 'Learning Garden',
    emoji: '🌿',
    bgClasses: 'from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/50',
  },
  {
    id: 'puzzle_lab',
    titleAr: 'مختبر الألغاز الذكية',
    titleEn: 'Puzzle Science Lab',
    emoji: '🔬',
    bgClasses: 'from-purple-100 to-indigo-100 dark:from-purple-950/60 dark:to-indigo-950/50',
  },
  {
    id: 'coding_city',
    titleAr: 'مدينة البرمجة المستقبلية',
    titleEn: 'Future Coding City',
    emoji: '🏙️',
    bgClasses: 'from-cyan-100 to-blue-100 dark:from-cyan-950/60 dark:to-blue-950/50',
  },
];

export const UnifiedChildHub: React.FC<UnifiedChildHubProps> = ({
  language,
  childProfile,
  platformState,
  initialTab = 'studio',
  soundMuted,
  onSaveCreativeProject,
  onDeleteCreativeProject,
  onUpdateOasisItems,
  onToggleUnpluggedComplete,
  onBack,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<UnifiedHubTab>(initialTab);

  // Creative Studio State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>(
    isAr ? 'مغامرة سمارتي الفضائية' : 'Smarty Space Story'
  );
  const [backgroundId, setBackgroundId] =
    useState<CreativeProjectRecord['backgroundId']>('space');
  const [elements, setElements] = useState<CreativeProjectRecord['elements']>([
    { id: 'el-init-1', emoji: '⭐', x: 22, y: 26, label: 'Star', color: '#facc15' },
    { id: 'el-init-2', emoji: '🚀', x: 74, y: 36, label: 'Rocket', color: '#3b82f6' },
  ]);
  const [strokes, setStrokes] = useState<CreativeProjectRecord['strokes']>([]);
  const [brushColor, setBrushColor] = useState<string>(BRUSH_COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [eventScript, setEventScript] = useState<CreativeProjectRecord['eventScript']>([
    { trigger: 'on_start', action: 'dance' },
  ]);
  const [isAnimatingScene, setIsAnimatingScene] = useState(false);
  const [activeAnimAction, setActiveAnimAction] = useState<
    'dance' | 'jump' | 'spin' | 'sparkle' | null
  >(null);
  const [mixedResultText, setMixedResultText] = useState<string | null>(null);
  const [studioStatusMsg, setStudioStatusMsg] = useState<string | null>(null);
  const svgCanvasRef = useRef<SVGSVGElement | null>(null);

  // Oasis State
  const [selectedOasisZone, setSelectedOasisZone] =
    useState<PlacedOasisItem['zone']>('robot_home');

  const starsEarned = childProfile.progress.starsEarned ?? 0;

  // Drawing handlers
  const getRelativePoint = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgCanvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 50, y: 50 };
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDrawing(true);
    const pt = getRelativePoint(e);
    setStrokes((prev) => [...prev, { color: brushColor, points: [pt] }]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const pt = getRelativePoint(e);
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy[copy.length - 1];
      copy[copy.length - 1] = {
        ...last,
        points: [...last.points, pt],
      };
      return copy;
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleAddSprite = (sprite: (typeof SPRITE_PALETTE)[number]) => {
    if (!soundMuted) playSound('click');
    const slotCount = elements.length;
    const x = 18 + ((slotCount * 19) % 66);
    const y = 24 + ((slotCount * 17) % 52);
    setElements((prev) => [
      ...prev,
      {
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        emoji: sprite.emoji,
        x,
        y,
        label: isAr ? sprite.labelAr : sprite.labelEn,
        color: brushColor,
      },
    ]);
  };

  const handlePlayScene = () => {
    if (!soundMuted) playSound('win');
    const mainAction = eventScript[0]?.action || 'dance';
    setActiveAnimAction(mainAction);
    setIsAnimatingScene(true);
    speakChildFriendly(
      isAr
        ? `رائع! بدأ عرض مشروعك الإبداعي: ${projectTitle}`
        : `Awesome! Playing your creative story: ${projectTitle}`,
      language,
      soundMuted
    );
    setTimeout(() => {
      setIsAnimatingScene(false);
      setActiveAnimAction(null);
    }, 2400);
  };

  const handleSaveProject = () => {
    if (!soundMuted) playSound('success');
    const record: CreativeProjectRecord = {
      id: editingId || `proj-${Date.now()}`,
      childId: childProfile.id,
      title: projectTitle.trim() || (isAr ? 'مشروعي الإبداعي' : 'My Creative Project'),
      backgroundId,
      elements,
      strokes,
      eventScript,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setEditingId(record.id);
    onSaveCreativeProject(record);
    setStudioStatusMsg(
      isAr ? `تم حفظ مشروع "${record.title}" في ملف ${childProfile.name.ar}!` : `Saved "${record.title}" to ${childProfile.name.en}'s portfolio!`
    );
    setTimeout(() => setStudioStatusMsg(null), 3500);
  };

  const handleLoadProject = (proj: CreativeProjectRecord) => {
    if (!soundMuted) playSound('click');
    setEditingId(proj.id);
    setProjectTitle(proj.title);
    setBackgroundId(proj.backgroundId);
    setElements(proj.elements);
    setStrokes(proj.strokes);
    setEventScript(proj.eventScript);
  };

  const handlePlaceOasisItem = (itemId: string) => {
    if (!soundMuted) playSound('success');
    const zoneItems = platformState.oasisItems.filter((i) => i.zone === selectedOasisZone);
    const occupiedSlots = new Set(zoneItems.map((i) => i.slotIndex));
    let nextSlot = 0;
    while (occupiedSlots.has(nextSlot) && nextSlot < 6) nextSlot++;
    if (nextSlot >= 6) {
      // Replace the oldest item in this zone
      const withoutFirst = platformState.oasisItems.filter(
        (it) => !(it.zone === selectedOasisZone && it.slotIndex === 0)
      );
      onUpdateOasisItems([
        ...withoutFirst,
        {
          instanceId: `oasis-${Date.now()}`,
          itemId,
          zone: selectedOasisZone,
          slotIndex: 0,
        },
      ]);
      return;
    }
    onUpdateOasisItems([
      ...platformState.oasisItems,
      {
        instanceId: `oasis-${Date.now()}`,
        itemId,
        zone: selectedOasisZone,
        slotIndex: nextSlot,
      },
    ]);
  };

  const handleRemoveOasisInstance = (instanceId: string) => {
    if (!soundMuted) playSound('click');
    onUpdateOasisItems(platformState.oasisItems.filter((i) => i.instanceId !== instanceId));
  };

  const robotOasisState: SmartyGameplayState =
    activeTab === 'oasis' ? 'cheering' : isAnimatingScene ? 'cheering' : 'greeting';

  const bgConfig = STUDIO_BACKGROUNDS[backgroundId];
  const zoneInfo = OASIS_ZONES.find((z) => z.id === selectedOasisZone) || OASIS_ZONES[0];
  const currentZonePlacedItems = platformState.oasisItems.filter(
    (i) => i.zone === selectedOasisZone
  );

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8"
      data-testid="unified-child-hub"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Bar (Hidden when printing unplugged sheet) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={onBack}
            data-testid="hub-back-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-black shadow-sm hover:border-red-500 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{isAr ? 'العودة لخريطة العوالم' : 'Back to Seven Worlds'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              data-testid="hub-tab-studio"
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-fuchsia-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{isAr ? 'الاستوديو الإبداعي والقصص' : 'Creative Studio & Stories'}</span>
            </button>

            <button
              type="button"
              data-testid="hub-tab-oasis"
              onClick={() => setActiveTab('oasis')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'oasis'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{isAr ? 'واحة سمارتي الشخصية' : 'Personal Smarty Oasis'}</span>
            </button>

            <button
              type="button"
              data-testid="hub-tab-unplugged"
              onClick={() => setActiveTab('unplugged')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === 'unplugged'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isAr ? 'بطاقات الأنشطة اللاشاشية للأهل' : 'Printable Unplugged Cards'}</span>
            </button>
          </div>
        </div>

        {/* ==============================================================
            TAB 1: CREATIVE PROJECT & STORY STUDIO
            ============================================================== */}
        {activeTab === 'studio' && (
          <div className="space-y-6" data-testid="creative-studio-panel">
            <div className="bg-gradient-to-r from-fuchsia-600 to-rose-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="bg-white/20 text-xs font-black px-3 py-1 rounded-full">
                  {isAr ? 'الطفل المبدع: ' + childProfile.name.ar : 'Young Creator: ' + childProfile.name.en}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">
                  {isAr
                    ? 'استوديو الرسم وخلط الألوان والقصص المتحركة 🎨'
                    : 'Drawing, Color Mixing & Event Story Studio 🎨'}
                </h2>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  {isAr
                    ? 'اختر الخلفية، ارسم بحرية، أضف الشخصيات وبرمج حركتها ثم احفظ مشروعك!'
                    : 'Choose a backdrop, draw freely, add characters, code event blocks, and save your creation!'}
                </p>
              </div>
              <div className="shrink-0 bg-white/15 rounded-2xl p-2">
                <SmartyMascot3D state={robotOasisState} size="md" language={language} />
              </div>
            </div>

            {studioStatusMsg && (
              <div
                data-testid="studio-save-toast"
                className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-black text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{studioStatusMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Controls: Backdrops, Color Mixer, Sprites & Event Blocks */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1.5">
                      {isAr ? 'اسم المشروع الإبداعي:' : 'Creative Project Title:'}
                    </label>
                    <input
                      type="text"
                      data-testid="studio-project-title-input"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                    />
                  </div>

                  {/* Backdrop Picker */}
                  <div>
                    <div className="text-xs font-black text-slate-600 dark:text-slate-300 mb-2">
                      {isAr ? '1. اختر خلفية المشهد:' : '1. Choose Scene Backdrop:'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        Object.keys(STUDIO_BACKGROUNDS) as CreativeProjectRecord['backgroundId'][]
                      ).map((bgKey) => {
                        const info = STUDIO_BACKGROUNDS[bgKey];
                        return (
                          <button
                            key={bgKey}
                            type="button"
                            onClick={() => setBackgroundId(bgKey)}
                            className={`p-2.5 rounded-xl border-2 text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                              backgroundId === bgKey
                                ? 'border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40'
                                : 'border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <span className="text-lg">{info.icon}</span>
                            <span>{isAr ? info.labelAr : info.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Mixer Mini-Lab */}
                  <div>
                    <div className="text-xs font-black text-slate-600 dark:text-slate-300 mb-2">
                      {isAr ? '2. مختبر خلط الألوان وقلم الرسم:' : '2. Color Mixing Lab & Brush:'}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {BRUSH_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setBrushColor(col)}
                          aria-label={`Brush ${col}`}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform ${
                            brushColor === col
                              ? 'scale-110 border-slate-900 dark:border-white ring-2 ring-fuchsia-400'
                              : 'border-white dark:border-slate-700'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setStrokes((prev) => prev.slice(0, -1))}
                        disabled={strokes.length === 0}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تراجع' : 'Undo'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStrokes([])}
                        disabled={strokes.length === 0}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>{isAr ? 'مسح الرسم' : 'Clear'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_MIXES.map((mix) => (
                        <button
                          key={mix.id}
                          type="button"
                          onClick={() => {
                            setBrushColor(mix.res);
                            setMixedResultText(isAr ? mix.labelAr : mix.labelEn);
                            if (!soundMuted) playSound('success');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: mix.c1 }} />
                          <span>+</span>
                          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: mix.c2 }} />
                          <span>=</span>
                          <span className="w-3.5 h-3.5 rounded-full inline-block border border-white" style={{ backgroundColor: mix.res }} />
                        </button>
                      ))}
                    </div>
                    {mixedResultText && (
                      <div className="mt-2 text-xs font-black text-fuchsia-600 dark:text-fuchsia-400">
                        ✨ {mixedResultText}
                      </div>
                    )}
                  </div>

                  {/* Sprites & Shapes */}
                  <div>
                    <div className="text-xs font-black text-slate-600 dark:text-slate-300 mb-2">
                      {isAr ? '3. أضف شخصيات وعناصر للقصة:' : '3. Add Characters & Stickers:'}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {SPRITE_PALETTE.map((sp) => (
                        <button
                          key={sp.emoji}
                          type="button"
                          onClick={() => handleAddSprite(sp)}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-fuchsia-500 text-center cursor-pointer transition-all"
                        >
                          <div className="text-xl">{sp.emoji}</div>
                          <div className="text-[10px] font-bold truncate">
                            {isAr ? sp.labelAr : sp.labelEn}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Blocks */}
                  <div>
                    <div className="text-xs font-black text-slate-600 dark:text-slate-300 mb-2">
                      {isAr ? '4. برمجة الأحداث والحركة:' : '4. Event & Animation Block:'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={eventScript[0]?.trigger || 'on_start'}
                        onChange={(e) =>
                          setEventScript([
                            {
                              trigger: e.target.value as CreativeProjectRecord['eventScript'][0]['trigger'],
                              action: eventScript[0]?.action || 'dance',
                            },
                          ])
                        }
                        className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-black"
                      >
                        <option value="on_start">{isAr ? '🚀 عند بدء التشغيل' : '🚀 When Started'}</option>
                        <option value="on_tap">{isAr ? '👆 عند النقر على المشهد' : '👆 When Scene Tapped'}</option>
                        <option value="on_sound">{isAr ? '🔊 عند التصفيق / الصوت' : '🔊 On Sound Trigger'}</option>
                      </select>

                      <select
                        value={eventScript[0]?.action || 'dance'}
                        onChange={(e) =>
                          setEventScript([
                            {
                              trigger: eventScript[0]?.trigger || 'on_start',
                              action: e.target.value as CreativeProjectRecord['eventScript'][0]['action'],
                            },
                          ])
                        }
                        className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-xs font-black"
                      >
                        <option value="dance">{isAr ? '💃 رقص مرح' : '💃 Happy Dance'}</option>
                        <option value="jump">{isAr ? '🦘 قفزة عالية' : '🦘 Big Jump'}</option>
                        <option value="spin">{isAr ? '🔄 دوران سحري' : '🔄 Magic Spin'}</option>
                        <option value="sparkle">{isAr ? '✨ بريق النجوم' : '✨ Star Sparkle'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Interactive Canvas Stage & Saved Portfolio */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                      {isAr
                        ? 'اسحب بالإصبع أو الفأرة للرسم مباشرة على اللوحة ✨'
                        : 'Draw freely directly on the story stage ✨'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid="studio-play-btn"
                        onClick={handlePlayScene}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'تشغيل القصة' : 'Play Story'}</span>
                      </button>

                      <button
                        type="button"
                        data-testid="studio-save-project-btn"
                        onClick={handleSaveProject}
                        className="px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-black flex items-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isAr ? 'حفظ مشروعي' : 'Save Project'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Stage Box */}
                  <div
                    className={`relative w-full h-80 sm:h-96 rounded-3xl bg-gradient-to-br ${bgConfig.classes} overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-inner select-none`}
                  >
                    {/* Freehand Drawing SVG */}
                    <svg
                      ref={svgCanvasRef}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                      className="absolute inset-0 w-full h-full touch-none cursor-crosshair z-10"
                    >
                      {strokes.map((st, idx) => {
                        if (st.points.length === 0) return null;
                        const d = st.points
                          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                          .join(' ');
                        return (
                          <path
                            key={idx}
                            d={d}
                            fill="none"
                            stroke={st.color}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      })}
                    </svg>

                    {/* Sprites */}
                    {elements.map((el) => (
                      <button
                        key={el.id}
                        type="button"
                        onClick={() =>
                          setElements((prev) => prev.filter((item) => item.id !== el.id))
                        }
                        title={isAr ? 'اضغط لإزالة العنصر' : 'Click to remove item'}
                        style={{ left: `${el.x}%`, top: `${el.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 text-4xl z-20 cursor-pointer transition-transform hover:scale-110 ${
                          isAnimatingScene
                            ? activeAnimAction === 'spin'
                              ? 'animate-spin'
                              : 'animate-bounce'
                            : ''
                        }`}
                      >
                        {el.emoji}
                      </button>
                    ))}

                    {/* Smarty Actor */}
                    <div
                      className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 transition-all ${
                        isAnimatingScene ? 'scale-110 animate-bounce' : ''
                      }`}
                    >
                      <SmartyMascot3D
                        state={isAnimatingScene ? 'cheering' : 'greeting'}
                        size="md"
                        language={language}
                      />
                    </div>
                  </div>
                </div>

                {/* Saved Projects Portfolio */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-600" />
                    <span>
                      {isAr
                        ? `مشاريع ${childProfile.name.ar} المحفوظة (${platformState.creativeProjects.length})`
                        : `${childProfile.name.en}'s Saved Projects (${platformState.creativeProjects.length})`}
                    </span>
                  </h3>

                  {platformState.creativeProjects.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr
                        ? 'لم تحفظ مشروعاً بعد — اضغط على "حفظ مشروعي" ليظهر هنا وتكسب وسام المبدع الفنان!'
                        : 'No saved projects yet — click "Save Project" to store your art and unlock the Creative Builder badge!'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {platformState.creativeProjects.map((proj) => (
                        <div
                          key={proj.id}
                          data-testid={`saved-project-${proj.id}`}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-black text-xs text-slate-900 dark:text-white truncate">
                              {STUDIO_BACKGROUNDS[proj.backgroundId].icon} {proj.title}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {proj.elements.length} {isAr ? 'عناصر' : 'items'} · {proj.updatedAt}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleLoadProject(proj)}
                              className="px-2.5 py-1.5 rounded-lg bg-fuchsia-600 text-white text-[11px] font-bold cursor-pointer"
                            >
                              {isAr ? 'فتح' : 'Load'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCreativeProject(proj.id)}
                              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 2: PERSONAL SMARTY ROBOT OASIS
            ============================================================== */}
        {activeTab === 'oasis' && (
          <div className="space-y-6" data-testid="personal-oasis-panel">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="bg-white/20 text-xs font-black px-3 py-1 rounded-full">
                  {isAr ? 'النجوم المكتسبة: ' + starsEarned + ' ⭐' : 'Earned Learning Stars: ' + starsEarned + ' ⭐'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">
                  {isAr ? 'واحة الروبوت سمارتي الشخصية 🏡' : 'Personal Smarty Robot Oasis 🏡'}
                </h2>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  {getSmartyContextualDialogue({
                    mode: 'adventure',
                    language,
                    ageGroup: childProfile.ageGroup,
                    situation: 'oasis',
                    childName: childProfile.name[language],
                  })}
                </p>
              </div>
              <div className="shrink-0 bg-white/15 rounded-2xl p-2">
                <SmartyMascot3D state="cheering" size="md" language={language} />
              </div>
            </div>

            {/* Zone Switcher */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {OASIS_ZONES.map((z) => {
                const zoneCount = platformState.oasisItems.filter((i) => i.zone === z.id).length;
                return (
                  <button
                    key={z.id}
                    type="button"
                    data-testid={`oasis-zone-${z.id}`}
                    onClick={() => setSelectedOasisZone(z.id)}
                    className={`p-4 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                      selectedOasisZone === z.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-2xl mb-1">{z.emoji}</div>
                    <div className="font-black text-sm text-slate-900 dark:text-white">
                      {isAr ? z.titleAr : z.titleEn}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {zoneCount} / 6 {isAr ? 'عناصر مزروعة' : 'items placed'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Zone Display + Decoration Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div
                className={`lg:col-span-7 rounded-3xl p-6 border-2 border-emerald-300 dark:border-emerald-800 bg-gradient-to-br ${zoneInfo.bgClasses} shadow-lg min-h-[340px] flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {zoneInfo.emoji} {isAr ? zoneInfo.titleAr : zoneInfo.titleEn}
                  </h3>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {isAr ? 'اضغط على العنصر الموضوع لإزالته' : 'Click a placed item to remove'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 my-6">
                  {Array.from({ length: 6 }, (_, slotIdx) => {
                    const placed = currentZonePlacedItems.find((i) => i.slotIndex === slotIdx);
                    const def = placed
                      ? OASIS_DECORATIONS.find((d) => d.id === placed.itemId)
                      : null;

                    return (
                      <div
                        key={slotIdx}
                        className="h-24 rounded-2xl bg-white/75 dark:bg-slate-900/75 border-2 border-dashed border-emerald-400/60 flex flex-col items-center justify-center p-2"
                      >
                        {placed && def ? (
                          <button
                            type="button"
                            data-testid={`placed-oasis-item-${def.id}`}
                            onClick={() => handleRemoveOasisInstance(placed.instanceId)}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                          >
                            <span className="text-4xl">{def.emoji}</span>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate max-w-full">
                              {def.title[language]}
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            {isAr ? 'مساحة جاهزة' : 'Open Spot'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'جوائز ومقتنيات سمارتي (تُفتح بالنجوم فقط)' : 'Smarty Rewards (Unlocked by Stars)'}
                </h3>
                <div className="space-y-2.5">
                  {OASIS_DECORATIONS.map((item) => {
                    const unlocked = starsEarned >= item.requiredStars;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                          unlocked
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-3xl">{item.emoji}</span>
                          <div className="min-w-0">
                            <div className="font-black text-xs text-slate-900 dark:text-white">
                              {item.title[language]}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.unlockConditionText[language]}
                            </div>
                          </div>
                        </div>

                        {unlocked ? (
                          <button
                            type="button"
                            data-testid={`place-oasis-${item.id}`}
                            onClick={() => handlePlaceOasisItem(item.id)}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isAr ? 'ضع في الواحة' : 'Place'}</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-black shrink-0 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {item.requiredStars}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 3: PRINTABLE HANDS-ON UNPLUGGED ACTIVITY CARDS
            ============================================================== */}
        {activeTab === 'unplugged' && (
          <div className="space-y-6" data-testid="unplugged-cards-panel">
            <div className="print:hidden bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  {isAr
                    ? 'بطاقات الأنشطة المنزلية اللاشاشية (للأهل والطفل) ✂️'
                    : 'Hands-On Unplugged Home Activity Cards ✂️'}
                </h2>
                <p className="text-white/90 text-xs sm:text-sm mt-1">
                  {isAr
                    ? 'أنشطة تطبيقية بعيداً عن الشاشة باستخدام أدوات المنزل لترسيخ مفاهيم العوالم الرقمية.'
                    : 'Screen-free real-world activities using everyday household items linked to digital concepts.'}
                </p>
              </div>
              <button
                type="button"
                data-testid="print-unplugged-btn"
                onClick={() => window.print()}
                className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs flex items-center gap-2 shadow-lg shrink-0 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة البطاقات للأهل' : 'Print Activity Sheet'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {UNPLUGGED_ACTIVITY_CARDS.map((card) => {
                const world = SEVEN_EDUCATIONAL_WORLDS.find((w) => w.id === card.worldId);
                const isDone = platformState.completedUnpluggedIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    data-testid={`unplugged-card-${card.id}`}
                    className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 shadow-lg flex flex-col justify-between transition-all ${
                      isDone
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black">
                          {world?.icon} {world?.title[language]}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {isAr ? `العمر: ${card.ageRange} سنوات` : `Ages: ${card.ageRange}`}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {card.title[language]}
                      </h3>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 text-xs space-y-1">
                        <div className="font-black text-indigo-600 dark:text-indigo-400">
                          🎯 {isAr ? 'ماذا يتعلم الطفل:' : 'Learning Objective:'}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">
                          {card.whatChildLearns[language]}
                        </p>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-black text-slate-800 dark:text-slate-200">
                          🧰 {isAr ? 'الأدوات المنزلية المطلوبة:' : 'Materials Needed:'}
                        </div>
                        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                          {card.materialsNeeded[language].map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-black text-slate-800 dark:text-slate-200">
                          👨‍👩‍👧 {isAr ? 'شرح سريع للأهل:' : 'Parent Guide:'}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          {card.parentExplanation[language]}
                        </p>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-black text-slate-800 dark:text-slate-200">
                          👣 {isAr ? 'خطوات الطفل:' : 'Steps for Child:'}
                        </div>
                        <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                          {card.stepsForChild[language].map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900 text-xs space-y-1">
                        <div className="font-black text-cyan-800 dark:text-cyan-300">
                          🔗 {card.digitalConnection[language]}
                        </div>
                        <div className="text-cyan-700 dark:text-cyan-400">
                          🌟 {isAr ? 'تحدي إضافي:' : 'Extension:'} {card.extensionChallenge[language]}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleUnpluggedComplete(card.id)}
                      className={`print:hidden mt-5 w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 dark:bg-amber-600 text-white hover:opacity-90'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isDone
                          ? isAr
                            ? 'تم تنفيذ النشاط في المنزل ✓'
                            : 'Completed at Home ✓'
                          : isAr
                          ? 'تسجيل إكمال النشاط اللاشاشي'
                          : 'Mark Unplugged Activity Done'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
