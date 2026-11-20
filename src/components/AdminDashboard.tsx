import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Video,
  Image as ImageIcon,
  Download,
  Gamepad2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  CheckCircle2,
  Save,
  Wrench,
} from 'lucide-react';
import { Language, Program, EducationalMaterial, MaterialType, StudentProgress } from '../types';
import { translations } from '../locales/translations';
import {
  JigsawLevelConfig,
  ValidationMode,
  loadJigsawLevels,
  saveJigsawLevels,
  resetJigsawLevelsToDefault,
} from '../data/jigsawLevelsData';
import {
  WorkshopCameraFocus,
  WorkshopGameConfig,
  WorkshopMissionConfig,
  loadWorkshopConfig,
  saveWorkshopConfig,
  resetWorkshopConfigToDefault,
} from '../data/workshopOrganizerData';
import { JigsawGameEngine } from './JigsawGameEngine';
import { WorkshopOrganizerGame } from './WorkshopOrganizerGame';
import { PuzzleArtwork } from './PuzzleArtwork';
import {
  AgeGameConfig,
  DifficultyTier,
  AgeGameId,
  AgeGameStageConfig,
  ChildProfileRecord,
  loadAgeGamesConfig,
  saveAgeGamesConfig,
  resetAgeGamesConfig,
  loadChildProfiles,
} from '../data/ageGamesData';
import { AdminChapterLibraryTab } from './AdminChapterLibraryTab';
import { AdminSevenWorldsTab } from './AdminSevenWorldsTab';
import { Globe2 } from 'lucide-react';

interface AdminDashboardProps {
  language: Language;
  programs: Program[];
  materials: EducationalMaterial[];
  onAddMaterial: (mat: EducationalMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  progress?: StudentProgress;
  onUpdateProgress?: (p: StudentProgress) => void;
}

const ARTWORK_OPTIONS = [
  'shape-circle',
  'shape-square',
  'shape-triangle',
  'shape-star',
  'obj-car',
  'obj-ball',
  'obj-plane',
  'obj-duck',
  'robot-head',
  'robot-body',
  'robot-arm-l',
  'robot-arm-r',
  'robot-legs',
  'fruit-apple',
  'fruit-banana',
  'fruit-grapes',
  'toy-bear',
  'toy-blocks',
  'toy-drum',
  'bin-basket',
  'bin-toybox',
  'butterfly-wing-l',
  'butterfly-body',
  'butterfly-wing-r',
  'garden-pot',
  'garden-soil',
  'garden-stem',
  'garden-leaves',
  'garden-flower',
  'house-top',
  'house-bot',
  'rocket-strip-1',
  'rocket-strip-2',
  'rocket-strip-3',
  'fish-tail',
  'fish-body',
  'fish-head',
  'tree-tl',
  'tree-tr',
  'tree-bl',
  'tree-br',
  'seq-seed',
  'seq-water',
  'seq-sprout',
  'lab-cpu',
  'lab-robot',
  'lab-circuit',
  'lab-star',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  programs,
  materials,
  onAddMaterial,
  onDeleteMaterial,
  progress,
  onUpdateProgress,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<
    | 'chapter_library'
    | 'worlds_overview'
    | 'age_games'
    | 'jigsaw'
    | 'workshop'
    | 'curriculum'
    | 'materials'
    | 'teachers'
  >('chapter_library');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Materials modal state
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newDescAr, setNewDescAr] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newType, setNewType] = useState<MaterialType>('pdf');
  const [newFileName, setNewFileName] = useState('sample_file.pdf');

  // Age-Based Games & Child Profiles Studio State
  const [ageGames, setAgeGames] = useState<AgeGameConfig[]>(() => loadAgeGamesConfig());
  const [selectedAgeGameId, setSelectedAgeGameId] = useState<AgeGameId>('explorers_color_shape');
  const [editingAgeStage, setEditingAgeStage] = useState<AgeGameStageConfig | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfileRecord[]>(() => loadChildProfiles());

  // Junior Jigsaw Studio State
  const [jigsawLevels, setJigsawLevels] = useState<JigsawLevelConfig[]>(() => loadJigsawLevels());
  const [editingLevel, setEditingLevel] = useState<JigsawLevelConfig | null>(null);
  const [previewLevelNumber, setPreviewLevelNumber] = useState<number | null>(null);

  // 3D Workshop Organizer Studio State
  const [workshopConfig, setWorkshopConfig] = useState<WorkshopGameConfig>(() => loadWorkshopConfig());
  const [editingMission, setEditingMission] = useState<WorkshopMissionConfig | null>(null);
  const [previewWorkshopMission, setPreviewWorkshopMission] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const persistLevels = (updated: JigsawLevelConfig[], toast: string) => {
    const normalized = updated.map((l, i) => ({
      ...l,
      order: i + 1,
      levelNumber: i + 1,
    }));
    setJigsawLevels(normalized);
    saveJigsawLevels(normalized);
    showToast(toast);
  };

  const handleTogglePublish = (levelId: string) => {
    const updated = jigsawLevels.map((l) =>
      l.id === levelId ? { ...l, isPublished: !l.isPublished } : l
    );
    const target = updated.find((l) => l.id === levelId);
    persistLevels(
      updated,
      target?.isPublished
        ? isAr ? `تم نشر "${target.title.ar}" للطلاب.` : `Published "${target.title.en}" to students.`
        : isAr ? `تم تحويل "${target?.title.ar}" إلى مسودة مخفية.` : `Unpublished "${target?.title.en}" (hidden from students).`
    );
  };

  const handleMoveLevel = (index: number, direction: -1 | 1) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= jigsawLevels.length) return;
    const copy = [...jigsawLevels];
    const temp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = temp;
    persistLevels(
      copy,
      isAr ? 'تمت إعادة ترتيب المستويات وحفظ التعديل مباشرة.' : 'Levels reordered and published.'
    );
  };

  const handleAddNewLevel = () => {
    const nextNum = jigsawLevels.length + 1;
    const p1Id = `custom-p1-${Date.now()}`;
    const p2Id = `custom-p2-${Date.now()}`;
    const t1Id = `custom-t1-${Date.now()}`;
    const t2Id = `custom-t2-${Date.now()}`;

    const newLevel: JigsawLevelConfig = {
      id: `lvl-custom-${Date.now()}`,
      levelNumber: nextNum,
      order: nextNum,
      isPublished: false,
      title: {
        ar: `المستوى ${nextNum} – مهمة جديدة مخصصة`,
        en: `Level ${nextNum} – Custom Task`,
      },
      objective: {
        ar: 'مهمة مطابقة وتركيب مخصصة من لوحة الإدارة.',
        en: 'Custom matching and assembly task created in Admin Studio.',
      },
      instruction: {
        ar: 'اسحب كل شكل أو قطعة وضعها في مكانها الصحيح.',
        en: 'Drag each custom item into its matching slot.',
      },
      audioText: {
        ar: 'اسحب العناصر إلى أماكنها الصحيحة.',
        en: 'Drag each item into its correct spot.',
      },
      hint: {
        ar: 'طابق الشكل والاسم معاً.',
        en: 'Match each shape and label together.',
      },
      xpReward: 15,
      validationMode: 'slot_match',
      layoutMode: 'free_slots',
      sceneKey: 'custom',
      pieces: [
        { id: p1Id, label: { ar: 'نجمة ذهبية', en: 'Gold Star' }, artworkKey: 'shape-star', color: 'bg-amber-50 dark:bg-amber-950/40' },
        { id: p2Id, label: { ar: 'روبوت سمارت', en: 'Smart Robot' }, artworkKey: 'lab-robot', color: 'bg-red-50 dark:bg-red-950/40' },
      ],
      targets: [
        { id: t1Id, label: { ar: 'مكان النجمة', en: 'Star Slot' }, artworkKey: 'shape-star', acceptsPieceIds: [p1Id], positionSlot: 'slot-1', color: 'border-amber-400' },
        { id: t2Id, label: { ar: 'مكان الروبوت', en: 'Robot Slot' }, artworkKey: 'lab-robot', acceptsPieceIds: [p2Id], positionSlot: 'slot-2', color: 'border-red-400' },
      ],
      ageVariants: {
        '3-4': {
          activePieceIds: [p1Id, p2Id],
          activeTargetIds: [t1Id, t2Id],
          showGhostHints: true,
          strictOrder: false,
          cognitiveNote: { ar: 'مهمة مخصصة (3-4)', en: 'Custom task (3-4)' },
        },
        '4-5': {
          activePieceIds: [p1Id, p2Id],
          activeTargetIds: [t1Id, t2Id],
          showGhostHints: true,
          strictOrder: false,
          cognitiveNote: { ar: 'مهمة مخصصة (4-5)', en: 'Custom task (4-5)' },
        },
        '5-6': {
          activePieceIds: [p1Id, p2Id],
          activeTargetIds: [t1Id, t2Id],
          showGhostHints: false,
          strictOrder: false,
          cognitiveNote: { ar: 'مهمة مخصصة (5-6)', en: 'Custom task (5-6)' },
        },
      },
    };
    const updated = [...jigsawLevels, newLevel];
    persistLevels(updated, isAr ? 'تمت إضافة مستوى جديد كمسودة.' : 'Added new level as draft.');
    setEditingLevel(newLevel);
  };

  const handleSaveEditedLevel = (publishAfterSave: boolean) => {
    if (!editingLevel) return;
    const finalized: JigsawLevelConfig = {
      ...editingLevel,
      isPublished: publishAfterSave,
    };
    const updated = jigsawLevels.map((l) => (l.id === finalized.id ? finalized : l));
    persistLevels(
      updated,
      publishAfterSave
        ? isAr ? `تم حفظ ونشر التعديلات على "${finalized.title.ar}".` : `Saved & published "${finalized.title.en}".`
        : isAr ? `تم حفظ التعديلات كمسودة.` : `Saved changes as draft.`
    );
    setEditingLevel(null);
  };

  const handleAddPieceToEditing = () => {
    if (!editingLevel) return;
    const suffix = Date.now();
    const pieceId = `piece-${suffix}`;
    const targetId = `target-${suffix}`;
    const updated: JigsawLevelConfig = {
      ...editingLevel,
      pieces: [
        ...editingLevel.pieces,
        {
          id: pieceId,
          label: { ar: 'عنصر جديد', en: 'New Object' },
          artworkKey: 'shape-star',
          color: 'bg-slate-100 dark:bg-slate-800',
        },
      ],
      targets: [
        ...editingLevel.targets,
        {
          id: targetId,
          label: { ar: 'هدف جديد', en: 'New Target' },
          artworkKey: 'shape-star',
          acceptsPieceIds: [pieceId],
          positionSlot: `slot-${editingLevel.targets.length + 1}`,
          color: 'border-red-400',
        },
      ],
      ageVariants: {
        '3-4': {
          ...editingLevel.ageVariants['3-4'],
          activePieceIds: [...editingLevel.ageVariants['3-4'].activePieceIds, pieceId],
          activeTargetIds: [...editingLevel.ageVariants['3-4'].activeTargetIds, targetId],
        },
        '4-5': {
          ...editingLevel.ageVariants['4-5'],
          activePieceIds: [...editingLevel.ageVariants['4-5'].activePieceIds, pieceId],
          activeTargetIds: [...editingLevel.ageVariants['4-5'].activeTargetIds, targetId],
        },
        '5-6': {
          ...editingLevel.ageVariants['5-6'],
          activePieceIds: [...editingLevel.ageVariants['5-6'].activePieceIds, pieceId],
          activeTargetIds: [...editingLevel.ageVariants['5-6'].activeTargetIds, targetId],
        },
      },
    };
    setEditingLevel(updated);
  };

  const handleResetDefaults = () => {
    const defaults = resetJigsawLevelsToDefault();
    setJigsawLevels(defaults);
    setEditingLevel(null);
    showToast(isAr ? 'تمت استعادة الإعدادات الافتراضية لجميع المستويات الـ 12.' : 'Restored default 12 levels.');
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAr || !newTitleEn) return;

    const mat: EducationalMaterial = {
      id: `mat-${Date.now()}`,
      title: { ar: newTitleAr, en: newTitleEn },
      description: { ar: newDescAr || 'مصدر تعليمي جديد', en: newDescEn || 'New educational material' },
      type: newType,
      ageGroup: '4-6 Years (KG1 & KG2)',
      programId: 'prog-1',
      levelId: 'lvl-kg1',
      unitId: 'unit-1',
      lessonIds: ['les-1'],
      language: 'bilingual',
      fileName: newFileName,
      fileSize: '2.1 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      isPublished: true,
    };

    onAddMaterial(mat);
    setNewTitleAr('');
    setNewTitleEn('');
    setNewDescAr('');
    setNewDescEn('');
    setShowAddMaterialModal(false);
    showToast(isAr ? 'تمت إضافة المصدر التعليمي بنجاح.' : 'Educational material added.');
  };

  // Workshop Admin Helpers
  const persistWorkshop = (nextConfig: WorkshopGameConfig, toast: string) => {
    const normalized: WorkshopGameConfig = {
      ...nextConfig,
      missions: nextConfig.missions.map((m, idx) => ({
        ...m,
        order: idx + 1,
        missionNumber: idx + 1,
      })),
    };
    setWorkshopConfig(normalized);
    saveWorkshopConfig(normalized);
    showToast(toast);
  };

  const handleToggleWorkshopPublish = (missionId: string) => {
    const updated = {
      ...workshopConfig,
      missions: workshopConfig.missions.map((m) =>
        m.id === missionId ? { ...m, isPublished: !m.isPublished } : m
      ),
    };
    const target = updated.missions.find((m) => m.id === missionId);
    persistWorkshop(
      updated,
      target?.isPublished
        ? isAr ? `تم نشر "${target.title.ar}" للطلاب.` : `Published "${target.title.en}" to students.`
        : isAr ? `تم تحويل "${target?.title.ar}" إلى مسودة.` : `Unpublished "${target?.title.en}".`
    );
  };

  const handleMoveWorkshopMission = (index: number, direction: -1 | 1) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= workshopConfig.missions.length) return;
    const copy = [...workshopConfig.missions];
    const tmp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = tmp;
    persistWorkshop(
      { ...workshopConfig, missions: copy },
      isAr ? 'تمت إعادة ترتيب مهام المعمل وحفظ التغيير.' : 'Workshop missions reordered and saved.'
    );
  };

  const handleSaveWorkshopMission = (publishAfterSave: boolean) => {
    if (!editingMission) return;
    const finalized: WorkshopMissionConfig = { ...editingMission, isPublished: publishAfterSave };
    const updated = {
      ...workshopConfig,
      missions: workshopConfig.missions.map((m) => (m.id === finalized.id ? finalized : m)),
    };
    persistWorkshop(
      updated,
      publishAfterSave
        ? isAr ? `تم حفظ ونشر "${finalized.title.ar}".` : `Saved & published "${finalized.title.en}".`
        : isAr ? 'تم حفظ التعديلات كمسودة.' : 'Saved mission draft.'
    );
    setEditingMission(null);
  };

  const handleResetWorkshopDefaults = () => {
    const defaults = resetWorkshopConfigToDefault();
    setWorkshopConfig(defaults);
    setEditingMission(null);
    showToast(isAr ? 'تمت استعادة الإعدادات الافتراضية لمعمل الروبوتات 3D.' : 'Restored 3D Workshop Organizer defaults.');
  };

  // Age Games Studio Helpers
  const persistAgeGames = (updated: AgeGameConfig[], toast: string) => {
    const normalized = updated.map((g) => ({
      ...g,
      stages: g.stages.map((st, idx) => ({
        ...st,
        order: idx + 1,
        stageNumber: idx + 1,
      })),
    }));
    setAgeGames(normalized);
    saveAgeGamesConfig(normalized);
    showToast(toast);
  };

  const handleToggleAgeGameEnabled = (gameId: AgeGameId) => {
    const updated = ageGames.map((g) =>
      g.id === gameId ? { ...g, isEnabled: !g.isEnabled } : g
    );
    const target = updated.find((g) => g.id === gameId);
    persistAgeGames(
      updated,
      target?.isEnabled
        ? isAr ? `تم تفعيل لعبة "${target.gameTitle.ar}" للفئة العمرية (${target.ageGroup}).` : `Enabled "${target.gameTitle.en}" for age (${target.ageGroup}).`
        : isAr ? `تم إيقاف لعبة "${target?.gameTitle.ar}" مؤقتاً.` : `Disabled "${target?.gameTitle.en}".`
    );
  };

  const handleMoveAgeStage = (gameId: AgeGameId, index: number, direction: -1 | 1) => {
    const game = ageGames.find((g) => g.id === gameId);
    if (!game) return;
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= game.stages.length) return;
    const copyStages = [...game.stages];
    const tmp = copyStages[index];
    copyStages[index] = copyStages[nextIdx];
    copyStages[nextIdx] = tmp;

    const updated = ageGames.map((g) =>
      g.id === gameId ? { ...g, stages: copyStages } : g
    );
    persistAgeGames(
      updated,
      isAr ? 'تمت إعادة ترتيب المراحل وحفظ التعديلات فوراً.' : 'Reordered stages and saved changes.'
    );
  };

  const handleToggleAgeStageEnabled = (gameId: AgeGameId, stageId: string) => {
    const updated = ageGames.map((g) => {
      if (g.id !== gameId) return g;
      return {
        ...g,
        stages: g.stages.map((st) =>
          st.id === stageId ? { ...st, isEnabled: !st.isEnabled } : st
        ),
      };
    });
    persistAgeGames(
      updated,
      isAr ? 'تم تحديث حالة تفعيل المرحلة.' : 'Updated stage enabled status.'
    );
  };

  const handleSaveEditedAgeStage = () => {
    if (!editingAgeStage) return;
    const updated = ageGames.map((g) => {
      if (g.id !== selectedAgeGameId) return g;
      return {
        ...g,
        stages: g.stages.map((st) =>
          st.id === editingAgeStage.id ? editingAgeStage : st
        ),
      };
    });
    persistAgeGames(
      updated,
      isAr ? `تم حفظ تعديلات المرحلة "${editingAgeStage.title.ar}" وتطبيقها للطفل.` : `Saved stage "${editingAgeStage.title.en}".`
    );
    setEditingAgeStage(null);
  };

  const handleResetAgeGamesDefaults = () => {
    const defaults = resetAgeGamesConfig();
    setAgeGames(defaults);
    setEditingAgeStage(null);
    showToast(
      isAr
        ? 'تمت استعادة الإعدادات الافتراضية للألعاب الثلاث (15 مرحلة).'
        : 'Restored default settings for all 3 age games (15 stages).'
    );
  };

  // Admin Preview Mode inside Live 3D Workshop Game Engine
  if (previewWorkshopMission !== null) {
    const fallbackProgress: StudentProgress = progress || {
      studentId: 'admin-preview',
      completedLessonIds: [],
      completedActivityIds: [],
      starsEarned: 0,
      xpEarned: 0,
      badges: [],
      lastActiveDate: new Date().toISOString().split('T')[0],
      selectedAgeGroup: '4-5',
      unlockedJigsawByAge: { '3-4': 12, '4-5': 12, '5-6': 12 },
      unlockedWorkshopByAge: { '3-4': 5, '4-5': 5, '5-6': 5 },
    };
    return (
      <WorkshopOrganizerGame
        language={language}
        progress={fallbackProgress}
        onUpdateProgress={onUpdateProgress || (() => {})}
        onExit={() => setPreviewWorkshopMission(null)}
        initialMissionNumber={previewWorkshopMission}
        adminPreviewMode
        configOverride={workshopConfig}
      />
    );
  }

  // Admin Preview Mode inside Live Game Engine
  if (previewLevelNumber !== null) {
    const fallbackProgress: StudentProgress = progress || {
      studentId: 'admin-preview',
      completedLessonIds: [],
      completedActivityIds: [],
      starsEarned: 0,
      xpEarned: 0,
      badges: [],
      lastActiveDate: new Date().toISOString().split('T')[0],
      selectedAgeGroup: '4-5',
      unlockedJigsawByAge: { '3-4': 12, '4-5': 12, '5-6': 12 },
    };
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-4">
        <JigsawGameEngine
          language={language}
          progress={fallbackProgress}
          onUpdateProgress={onUpdateProgress || (() => {})}
          onExit={() => setPreviewLevelNumber(null)}
          initialLevelNumber={previewLevelNumber}
          adminPreviewMode
          levelsOverride={jigsawLevels}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="bg-slate-900 rounded-3xl p-7 text-white shadow-xl border border-slate-800 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-red-400">
              {t.adminPanel.title} · {isAr ? 'مركز سمارت تك للتدريب' : 'SmartTech Training Center'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              {isAr ? 'إدارة المنصة وألعاب سمارت كودرز' : 'Smart Coders Administration Studio'}
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {isAr
                ? 'تحكم كامل في مستويات الألعاب، التعليمات، الأصوات، الأهداف، النقاط، والنشر الفوري للأطفال.'
                : 'Complete control over game levels, instructions, audio scripts, targets, XP, ordering, and publishing.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shrink-0">
            <button
              type="button"
              data-admin-tab="chapter_library"
              onClick={() => setActiveTab('chapter_library')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'chapter_library' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{isAr ? 'مكتبة ألعاب الفصول (62 لعبة)' : 'Chapter Game Library (62 Games)'}</span>
            </button>
            <button
              type="button"
              data-admin-tab="worlds_overview"
              onClick={() => setActiveTab('worlds_overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'worlds_overview' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span>{isAr ? 'العوالم السبعة والتقييمات' : '7 Worlds & Assessments'}</span>
            </button>
            <button
              type="button"
              data-admin-tab="age_games"
              onClick={() => {
                setActiveTab('age_games');
                setChildProfiles(loadChildProfiles());
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'age_games' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{isAr ? 'ألعاب الفئات العمرية وتقدم الأطفال' : 'Age Games & Child Progress'}</span>
            </button>
            <button
              type="button"
              data-admin-tab="jigsaw"
              onClick={() => setActiveTab('jigsaw')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'jigsaw' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{isAr ? 'استوديو ألعاب جونيور' : 'Junior Game Studio'}</span>
            </button>
            <button
              type="button"
              data-admin-tab="workshop"
              onClick={() => setActiveTab('workshop')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'workshop' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{isAr ? 'معمل الروبوتات 3D' : '3D Workshop Studio'}</span>
            </button>
            <button
              type="button"
              data-admin-tab="curriculum"
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'curriculum' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t.adminPanel.programsTab}
            </button>
            <button
              type="button"
              data-admin-tab="materials"
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'materials' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t.adminPanel.materialsTab}
            </button>
            <button
              type="button"
              data-admin-tab="teachers"
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'teachers' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t.adminPanel.teachersTab}
            </button>
          </div>
        </div>

        {/* Inline Status Toast */}
        {statusMessage && (
          <div
            data-testid="admin-status-toast"
            className="mb-6 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Tab -1: 8-Chapter Interactive Game Library (62 Games, 930 Levels) */}
        {activeTab === 'chapter_library' && (
          <AdminChapterLibraryTab language={language} onShowToast={showToast} />
        )}

        {/* Tab -0.5: Seven Worlds, Assessments & Badges Overview */}
        {activeTab === 'worlds_overview' && <AdminSevenWorldsTab language={language} />}

        {/* Tab 0: Age-Based Educational Games & Child Profiles */}
        {activeTab === 'age_games' && (
          <div className="space-y-8" data-testid="admin-age-games-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'إدارة الألعاب المستقلة حسب العمر (3–4، 4–5، 5–6 سنوات)'
                    : 'Age-Based Educational Games & Stage Controls'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? 'تحكم في الألعاب المتاحة لكل عمر، ترتيب المراحل، مستوى الصعوبة، عدد التحديات، نقاط XP، وتفعيل أو إيقاف أي مرحلة.'
                    : 'Manage available games per age group, stage ordering, difficulty, challenge count, XP rewards, and stage activation.'}
                </p>
              </div>
              <button
                type="button"
                data-testid="admin-reset-age-games-btn"
                onClick={handleResetAgeGamesDefaults}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-slate-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'استعادة الافتراضي (15 مرحلة)' : 'Reset 15 Stages Defaults'}</span>
              </button>
            </div>

            {/* 3 Age Games Cards Selector & Enable/Disable Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ageGames.map((game) => {
                const isSelected = selectedAgeGameId === game.id;
                return (
                  <div
                    key={game.id}
                    data-testid={`admin-age-game-card-${game.id}`}
                    className={`rounded-2xl p-5 border-2 transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-black">
                        {game.pathwayTitle[language]}
                      </span>
                      <button
                        type="button"
                        data-testid={`admin-toggle-age-game-${game.id}`}
                        onClick={() => handleToggleAgeGameEnabled(game.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                          game.isEnabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {game.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{game.isEnabled ? (isAr ? 'مفعّلة' : 'Enabled') : (isAr ? 'متوقفة' : 'Disabled')}</span>
                      </button>
                    </div>
                    <h4 className="font-black text-base text-slate-900 dark:text-white">
                      {game.gameTitle[language]}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {game.subtitle[language]}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {game.stages.filter((s) => s.isEnabled).length} / {game.stages.length}{' '}
                        {isAr ? 'مراحل مفعّلة' : 'Active Stages'}
                      </span>
                      <button
                        type="button"
                        data-testid={`admin-select-age-game-${game.id}`}
                        onClick={() => {
                          setSelectedAgeGameId(game.id);
                          setEditingAgeStage(null);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {isAr ? 'إدارة المراحل' : 'Manage Stages'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stages List + Stage Editor for Selected Age Game */}
            {(() => {
              const currentGame = ageGames.find((g) => g.id === selectedAgeGameId) || ageGames[0];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    {currentGame.stages.map((st, idx) => (
                      <div
                        key={st.id}
                        data-testid={`admin-age-stage-row-${st.id}`}
                        className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          editingAgeStage?.id === st.id
                            ? 'border-indigo-500 ring-1 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              #{st.stageNumber}
                            </span>
                            <span>·</span>
                            <span className={st.isEnabled ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                              {st.isEnabled ? (isAr ? 'مفعّلة' : 'Enabled') : (isAr ? 'معطّلة' : 'Disabled')}
                            </span>
                            <span>·</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                              {st.difficulty}
                            </span>
                            <span>·</span>
                            <span className="tabular-nums">
                              {st.challengesCount} {isAr ? 'تحديات' : 'challenges'}
                            </span>
                            <span>·</span>
                            <span className="tabular-nums font-bold text-amber-600">{st.xpReward} XP</span>
                          </div>
                          <h5 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                            {st.title[language]}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {st.instruction[language]}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            data-testid={`admin-age-stage-up-${st.id}`}
                            onClick={() => handleMoveAgeStage(currentGame.id, idx, -1)}
                            disabled={idx === 0}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            data-testid={`admin-age-stage-down-${st.id}`}
                            onClick={() => handleMoveAgeStage(currentGame.id, idx, 1)}
                            disabled={idx === currentGame.stages.length - 1}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            data-testid={`admin-age-stage-toggle-${st.id}`}
                            onClick={() => handleToggleAgeStageEnabled(currentGame.id, st.id)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                          >
                            {st.isEnabled ? (
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                            )}
                          </button>
                          <button
                            type="button"
                            data-testid={`admin-age-stage-edit-${st.id}`}
                            onClick={() => setEditingAgeStage(JSON.parse(JSON.stringify(st)))}
                            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>{isAr ? 'تعديل' : 'Edit'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stage Editor Panel */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 sticky top-24">
                    {!editingAgeStage ? (
                      <div className="text-center py-10 space-y-3">
                        <Gamepad2 className="w-10 h-10 text-indigo-500 mx-auto" />
                        <h4 className="font-bold text-slate-800 dark:text-white">
                          {isAr ? 'اختر مرحلة لتعديل إعداداتها' : 'Select a Stage to Configure'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isAr
                            ? 'يمكنك تعديل الصعوبة، عدد التحديات، نقاط XP، النجوم، والتعليمات الصوتية.'
                            : 'Configure difficulty level, number of challenges, XP/stars reward, and voice instructions.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4" data-testid="admin-age-stage-editor">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                          <h4 className="font-black text-base text-slate-900 dark:text-white">
                            {isAr
                              ? `تعديل المرحلة #${editingAgeStage.stageNumber}`
                              : `Edit Stage #${editingAgeStage.stageNumber}`}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setEditingAgeStage(null)}
                            className="text-xs font-bold text-slate-500"
                          >
                            {t.cancel}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              {isAr ? 'عنوان المرحلة (عربي)' : 'Stage Title (AR)'}
                            </label>
                            <input
                              type="text"
                              data-testid="admin-age-stage-title-ar"
                              value={editingAgeStage.title.ar}
                              onChange={(e) =>
                                setEditingAgeStage({
                                  ...editingAgeStage,
                                  title: { ...editingAgeStage.title, ar: e.target.value },
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              {isAr ? 'عنوان المرحلة (إنجليزي)' : 'Stage Title (EN)'}
                            </label>
                            <input
                              type="text"
                              value={editingAgeStage.title.en}
                              onChange={(e) =>
                                setEditingAgeStage({
                                  ...editingAgeStage,
                                  title: { ...editingAgeStage.title, en: e.target.value },
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {isAr ? 'التعليمات (عربي)' : 'Instruction (AR)'}
                          </label>
                          <textarea
                            rows={2}
                            data-testid="admin-age-stage-instruction-ar"
                            value={editingAgeStage.instruction.ar}
                            onChange={(e) =>
                              setEditingAgeStage({
                                ...editingAgeStage,
                                instruction: { ...editingAgeStage.instruction, ar: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              {isAr ? 'مستوى الصعوبة' : 'Difficulty'}
                            </label>
                            <select
                              data-testid="admin-age-stage-difficulty"
                              value={editingAgeStage.difficulty}
                              onChange={(e) =>
                                setEditingAgeStage({
                                  ...editingAgeStage,
                                  difficulty: e.target.value as DifficultyTier,
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <option value="easy">{isAr ? 'سهل (Easy)' : 'Easy'}</option>
                              <option value="medium">{isAr ? 'متوسط (Medium)' : 'Medium'}</option>
                              <option value="hard">{isAr ? 'متقدم (Hard)' : 'Hard'}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              {isAr ? 'عدد التحديات' : 'Challenges'}
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              data-testid="admin-age-stage-challenges"
                              value={editingAgeStage.challengesCount}
                              onChange={(e) =>
                                setEditingAgeStage({
                                  ...editingAgeStage,
                                  challengesCount: Math.max(1, Number(e.target.value) || 1),
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              {isAr ? 'مكافأة XP' : 'XP Reward'}
                            </label>
                            <input
                              type="number"
                              min={5}
                              max={150}
                              data-testid="admin-age-stage-xp"
                              value={editingAgeStage.xpReward}
                              onChange={(e) =>
                                setEditingAgeStage({
                                  ...editingAgeStage,
                                  xpReward: Math.max(5, Number(e.target.value) || 10),
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs tabular-nums"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          data-testid="admin-age-stage-save-btn"
                          onClick={handleSaveEditedAgeStage}
                          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isAr ? 'حفظ وتطبيق على تجربة الطفل فوراً' : 'Save & Apply to Child Experience'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Independent Children Progress & Assessment Results Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg text-slate-900 dark:text-white">
                    {isAr
                      ? 'تقدم الأطفال ونتائج التقييم المستقلة (بدون خلط للبيانات)'
                      : 'Independent Child Profiles & Assessment Results'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'يتم حفظ تقدم كل طفل، نقاط XP، والمراحل المكتملة ودقة الإجابة بشكل منفصل تماماً.'
                      : 'Each child profile stores independent XP, stars, unlocked stages, and stage accuracy.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setChildProfiles(loadChildProfiles())}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  {isAr ? 'تحديث النتائج' : 'Refresh Results'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {childProfiles.map((child) => {
                  const assessmentsList = Object.values(child.stageAssessments || {});
                  return (
                    <div
                      key={child.id}
                      data-testid={`admin-child-report-${child.id}`}
                      className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{child.avatarEmoji}</span>
                          <div>
                            <h5 className="font-black text-sm text-slate-900 dark:text-white">
                              {child.name[language]}
                            </h5>
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                              {isAr ? `الفئة العمرية: ${child.ageGroup} سنوات` : `Age Group: ${child.ageGroup} yrs`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            data-testid={`admin-child-xp-${child.id}`}
                            className="block text-sm font-black text-amber-600 tabular-nums"
                          >
                            {child.progress.xpEarned} XP
                          </span>
                          <span className="block text-[11px] font-bold text-slate-500 tabular-nums">
                            ⭐ {child.progress.starsEarned} · 🔥 {child.progress.dailyStreak || 1}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 border-t border-slate-200 dark:border-slate-700 pt-2">
                        <div className="flex justify-between">
                          <span>{isAr ? 'المراحل المكتملة:' : 'Completed Stages:'}</span>
                          <span className="font-black tabular-nums">{child.completedStageIds.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isAr ? 'مغامرة الألوان (3-4):' : 'Color & Shape (3-4):'}</span>
                          <span className="font-mono font-bold">
                            Stage {child.unlockedStageByGame.explorers_color_shape}/5
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isAr ? 'مهمة الماوس (4-5):' : 'Mouse Mission (4-5):'}</span>
                          <span className="font-mono font-bold">
                            Stage {child.unlockedStageByGame.discoverers_mouse_mission}/5
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isAr ? 'برمجة الروبوت (5-6):' : 'Robot Coding (5-6):'}</span>
                          <span className="font-mono font-bold">
                            Stage {child.unlockedStageByGame.creators_robot_coding}/5
                          </span>
                        </div>
                      </div>

                      {assessmentsList.length > 0 && (
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1">
                          <span className="text-[11px] font-black text-slate-500 block">
                            {isAr ? 'آخر نتائج التقييم:' : 'Latest Assessments:'}
                          </span>
                          {assessmentsList.slice(-3).map((asmt) => (
                            <div
                              key={asmt.stageId}
                              className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg"
                            >
                              <span className="font-mono truncate max-w-[130px]">{asmt.stageId}</span>
                              <span className="font-bold text-emerald-600 tabular-nums">
                                {asmt.accuracy}% ({asmt.starsEarned}⭐)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Junior Jigsaw Game Studio */}
        {activeTab === 'jigsaw' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {isAr ? `مستويات مغامرات التركيب (${jigsawLevels.length})` : `Jigsaw Adventure Levels (${jigsawLevels.length})`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? 'أي تعديل تنشره يظهر فوراً في بوابة الطالب.'
                    : 'Published updates synchronize immediately to the child experience.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-slate-400"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
                </button>
                <button
                  type="button"
                  data-testid="admin-add-level-btn"
                  onClick={handleAddNewLevel}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة مستوى / مهمة' : 'Add Level / Task'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Levels List */}
              <div className="lg:col-span-7 space-y-3">
                {jigsawLevels.map((lvl, idx) => (
                  <div
                    key={lvl.id}
                    data-admin-level-row={lvl.levelNumber}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      editingLevel?.id === lvl.id
                        ? 'border-red-500 ring-1 ring-red-500/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                          #{lvl.levelNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={lvl.isPublished ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          {lvl.isPublished ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{lvl.xpReward} XP</span>
                        <span aria-hidden="true">·</span>
                        <span>{lvl.validationMode}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1 truncate">
                        {lvl.title[language]}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {lvl.instruction[language]}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveLevel(idx, -1)}
                        disabled={idx === 0}
                        aria-label={isAr ? 'تحريك لأعلى' : 'Move Up'}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveLevel(idx, 1)}
                        disabled={idx === jigsawLevels.length - 1}
                        aria-label={isAr ? 'تحريك لأسفل' : 'Move Down'}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        data-admin-publish-btn={lvl.levelNumber}
                        onClick={() => handleTogglePublish(lvl.id)}
                        aria-label={lvl.isPublished ? (isAr ? 'إلغاء النشر' : 'Unpublish') : (isAr ? 'نشر' : 'Publish')}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        {lvl.isPublished ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                      <button
                        type="button"
                        data-admin-preview-btn={lvl.levelNumber}
                        onClick={() => setPreviewLevelNumber(lvl.levelNumber)}
                        className="px-2.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 hover:bg-black"
                      >
                        <Play className="w-3 h-3" />
                        <span>{isAr ? 'معاينة' : 'Preview'}</span>
                      </button>
                      <button
                        type="button"
                        data-admin-edit-btn={lvl.levelNumber}
                        onClick={() => setEditingLevel(JSON.parse(JSON.stringify(lvl)))}
                        className="px-2.5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-red-700"
                      >
                        <Edit className="w-3 h-3" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Level Inspector & Editor Panel */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 sticky top-24">
                {!editingLevel ? (
                  <div className="text-center py-12 space-y-3">
                    <Gamepad2 className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      {isAr ? 'اختر مستوى للتعديل والضبط' : 'Select a Level to Edit'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr
                        ? 'يمكنك تعديل التعليمات، الصوت، القطع والصور، قواعد التحقق، ونقاط XP ثم المعاينة أو النشر.'
                        : 'Modify instructions, audio scripts, objects, targets, validation rules, XP, then preview or publish.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1" data-testid="admin-level-editor">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        {isAr ? `تعديل المستوى #${editingLevel.levelNumber}` : `Edit Level #${editingLevel.levelNumber}`}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingLevel(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      >
                        {t.cancel}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'العنوان (عربي)' : 'Title (AR)'}
                        </label>
                        <input
                          type="text"
                          value={editingLevel.title.ar}
                          onChange={(e) =>
                            setEditingLevel({ ...editingLevel, title: { ...editingLevel.title, ar: e.target.value } })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'العنوان (إنجليزي)' : 'Title (EN)'}
                        </label>
                        <input
                          type="text"
                          value={editingLevel.title.en}
                          onChange={(e) =>
                            setEditingLevel({ ...editingLevel, title: { ...editingLevel.title, en: e.target.value } })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isAr ? 'التعليمات للطفل (عربي)' : 'Child Instruction (AR)'}
                      </label>
                      <textarea
                        rows={2}
                        data-testid="admin-input-instruction-ar"
                        value={editingLevel.instruction.ar}
                        onChange={(e) =>
                          setEditingLevel({
                            ...editingLevel,
                            instruction: { ...editingLevel.instruction, ar: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isAr ? 'التعليمات للطفل (إنجليزي)' : 'Child Instruction (EN)'}
                      </label>
                      <textarea
                        rows={2}
                        data-testid="admin-input-instruction-en"
                        value={editingLevel.instruction.en}
                        onChange={(e) =>
                          setEditingLevel({
                            ...editingLevel,
                            instruction: { ...editingLevel.instruction, en: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'النص الصوتي (عربي)' : 'Audio Narration (AR)'}
                        </label>
                        <input
                          type="text"
                          value={editingLevel.audioText.ar}
                          onChange={(e) =>
                            setEditingLevel({
                              ...editingLevel,
                              audioText: { ...editingLevel.audioText, ar: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'النص الصوتي (إنجليزي)' : 'Audio Narration (EN)'}
                        </label>
                        <input
                          type="text"
                          value={editingLevel.audioText.en}
                          onChange={(e) =>
                            setEditingLevel({
                              ...editingLevel,
                              audioText: { ...editingLevel.audioText, en: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'نقاط XP' : 'XP Reward'}
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={100}
                          data-testid="admin-input-xp"
                          value={editingLevel.xpReward}
                          onChange={(e) =>
                            setEditingLevel({ ...editingLevel, xpReward: Number(e.target.value) || 5 })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'قاعدة التحقق' : 'Validation Rule'}
                        </label>
                        <select
                          value={editingLevel.validationMode}
                          onChange={(e) =>
                            setEditingLevel({
                              ...editingLevel,
                              validationMode: e.target.value as ValidationMode,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <option value="slot_match">Slot Match (1:1)</option>
                          <option value="category_bin">Category Bins</option>
                          <option value="strict_sequence">Strict Sequence</option>
                        </select>
                      </div>
                    </div>

                    {/* Objects & Artwork Editor */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {isAr ? `القطع والصور (${editingLevel.pieces.length})` : `Objects & Artworks (${editingLevel.pieces.length})`}
                        </span>
                        <button
                          type="button"
                          onClick={handleAddPieceToEditing}
                          className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAr ? 'إضافة عنصر' : 'Add Object'}</span>
                        </button>
                      </div>
                      {editingLevel.pieces.map((p, pIdx) => (
                        <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                          <PuzzleArtwork artworkKey={p.artworkKey} className="w-8 h-8 shrink-0" />
                          <div className="flex-1 grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={p.label.ar}
                              onChange={(e) => {
                                const next = [...editingLevel.pieces];
                                next[pIdx] = { ...p, label: { ...p.label, ar: e.target.value } };
                                setEditingLevel({ ...editingLevel, pieces: next });
                              }}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]"
                            />
                            <select
                              value={p.artworkKey}
                              onChange={(e) => {
                                const next = [...editingLevel.pieces];
                                next[pIdx] = { ...p, artworkKey: e.target.value };
                                setEditingLevel({ ...editingLevel, pieces: next });
                              }}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]"
                            >
                              {ARTWORK_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Targets & Positions Editor */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {isAr ? `مناطق الأهداف (${editingLevel.targets.length})` : `Target Positions (${editingLevel.targets.length})`}
                      </span>
                      {editingLevel.targets.map((tgt, tIdx) => (
                        <div key={tgt.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={tgt.label[language]}
                            onChange={(e) => {
                              const next = [...editingLevel.targets];
                              next[tIdx] = {
                                ...tgt,
                                label: { ...tgt.label, [language]: e.target.value },
                              };
                              setEditingLevel({ ...editingLevel, targets: next });
                            }}
                            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]"
                          />
                          <input
                            type="text"
                            value={tgt.positionSlot}
                            onChange={(e) => {
                              const next = [...editingLevel.targets];
                              next[tIdx] = { ...tgt, positionSlot: e.target.value };
                              setEditingLevel({ ...editingLevel, targets: next });
                            }}
                            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        data-testid="admin-save-draft-btn"
                        onClick={() => handleSaveEditedLevel(false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
                      >
                        {isAr ? 'حفظ كمسودة' : 'Save Draft'}
                      </button>
                      <button
                        type="button"
                        data-testid="admin-save-publish-btn"
                        onClick={() => handleSaveEditedLevel(true)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isAr ? 'حفظ ونشر للطلاب' : 'Save & Publish'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1B: 3D Smart Workshop Organizer Studio */}
        {activeTab === 'workshop' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {isAr
                    ? `استوديو معمل الروبوتات 3D (${workshopConfig.missions.length} مهام)`
                    : `3D Smart Workshop Organizer (${workshopConfig.missions.length} Missions)`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr
                    ? 'تعديل قصة البداية، مهام التنظيم ثلاثية الأبعاد، نقاط XP، وزوايا الكاميرا والنشر للطلاب.'
                    : 'Customize workshop intro dialogue, 3D sorting missions, XP rewards, camera focus, and publish state.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetWorkshopDefaults}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:border-slate-400"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'استعادة افتراضي المعمل' : 'Reset Workshop Defaults'}</span>
              </button>
            </div>

            {/* Global Intro Story Editor */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isAr ? 'قصة الترحيب من الروبوت سمارتي' : 'Smarty Robot Opening Story'}
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    persistWorkshop(
                      workshopConfig,
                      isAr ? 'تم حفظ قصة الترحيب.' : 'Saved opening story.'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ القصة' : 'Save Story'}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {isAr ? 'النص العربي' : 'Arabic Intro Story'}
                  </label>
                  <textarea
                    rows={2}
                    value={workshopConfig.introStory.ar}
                    onChange={(e) =>
                      setWorkshopConfig({
                        ...workshopConfig,
                        introStory: { ...workshopConfig.introStory, ar: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {isAr ? 'النص الإنجليزي' : 'English Intro Story'}
                  </label>
                  <textarea
                    rows={2}
                    value={workshopConfig.introStory.en}
                    onChange={(e) =>
                      setWorkshopConfig({
                        ...workshopConfig,
                        introStory: { ...workshopConfig.introStory, en: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
                {workshopConfig.missions.map((mission, idx) => (
                  <div
                    key={mission.id}
                    data-admin-workshop-row={mission.missionNumber}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      editingMission?.id === mission.id
                        ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          #{mission.missionNumber}
                        </span>
                        <span>·</span>
                        <span className={mission.isPublished ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          {mission.isPublished ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
                        </span>
                        <span>·</span>
                        <span className="tabular-nums">{mission.xpReward} XP</span>
                        <span>·</span>
                        <span>{mission.cameraFocus}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1 truncate">
                        {mission.title[language]}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {mission.instruction[language]}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveWorkshopMission(idx, -1)}
                        disabled={idx === 0}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveWorkshopMission(idx, 1)}
                        disabled={idx === workshopConfig.missions.length - 1}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleWorkshopPublish(mission.id)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                      >
                        {mission.isPublished ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        data-admin-workshop-preview={mission.missionNumber}
                        onClick={() => setPreviewWorkshopMission(mission.missionNumber)}
                        className="px-2.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>{isAr ? 'معاينة 3D' : '3D Preview'}</span>
                      </button>
                      <button
                        type="button"
                        data-admin-workshop-edit={mission.missionNumber}
                        onClick={() => setEditingMission(JSON.parse(JSON.stringify(mission)))}
                        className="px-2.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 sticky top-24">
                {!editingMission ? (
                  <div className="text-center py-12 space-y-3">
                    <Wrench className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      {isAr ? 'اختر مهمة للتعديل أو المعاينة' : 'Select a Workshop Mission to Edit'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr
                        ? 'عدّل التعليمات، النصوص الصوتية، زاوية الكاميرا، ونقاط XP ثم انشر مباشرة للأطفال.'
                        : 'Edit mission instructions, voice narration, camera preset, and XP rewards, then publish.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1" data-testid="admin-workshop-editor">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        {isAr ? `تعديل المهمة #${editingMission.missionNumber}` : `Edit Mission #${editingMission.missionNumber}`}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingMission(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        {t.cancel}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'العنوان (عربي)' : 'Title (AR)'}
                        </label>
                        <input
                          type="text"
                          value={editingMission.title.ar}
                          onChange={(e) =>
                            setEditingMission({ ...editingMission, title: { ...editingMission.title, ar: e.target.value } })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'العنوان (إنجليزي)' : 'Title (EN)'}
                        </label>
                        <input
                          type="text"
                          value={editingMission.title.en}
                          onChange={(e) =>
                            setEditingMission({ ...editingMission, title: { ...editingMission.title, en: e.target.value } })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isAr ? 'التعليمات (عربي)' : 'Instruction (AR)'}
                      </label>
                      <textarea
                        rows={2}
                        value={editingMission.instruction.ar}
                        onChange={(e) =>
                          setEditingMission({
                            ...editingMission,
                            instruction: { ...editingMission.instruction, ar: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isAr ? 'التعليمات (إنجليزي)' : 'Instruction (EN)'}
                      </label>
                      <textarea
                        rows={2}
                        value={editingMission.instruction.en}
                        onChange={(e) =>
                          setEditingMission({
                            ...editingMission,
                            instruction: { ...editingMission.instruction, en: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'نقاط XP' : 'XP Reward'}
                        </label>
                        <input
                          type="number"
                          min={5}
                          max={100}
                          value={editingMission.xpReward}
                          onChange={(e) =>
                            setEditingMission({ ...editingMission, xpReward: Number(e.target.value) || 10 })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {isAr ? 'تركيز الكاميرا' : 'Camera Focus'}
                        </label>
                        <select
                          value={editingMission.cameraFocus}
                          onChange={(e) =>
                            setEditingMission({
                              ...editingMission,
                              cameraFocus: e.target.value as WorkshopCameraFocus,
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <option value="overview">Overview</option>
                          <option value="workbench">Workbench</option>
                          <option value="gears_cart">Gears Cart</option>
                          <option value="electronics">Electronics</option>
                          <option value="shelves">Shelves</option>
                          <option value="assembly_bay">Assembly Bay</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleSaveWorkshopMission(false)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
                      >
                        {isAr ? 'حفظ كمسودة' : 'Save Draft'}
                      </button>
                      <button
                        type="button"
                        data-testid="admin-workshop-save-publish"
                        onClick={() => handleSaveWorkshopMission(true)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isAr ? 'حفظ ونشر للطلاب' : 'Save & Publish'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Curriculum Management */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {isAr ? 'البرامج والمناهج التعليمية' : 'Curriculum Programs'}
              </h3>
              <button
                type="button"
                onClick={() =>
                  showToast(
                    isAr
                      ? 'يمكنك إضافة برامج ووحدات جديدة من استوديو ألعاب جونيور ومكتبة المصادر.'
                      : 'Manage interactive game units via Junior Game Studio and Materials Library.'
                  )
                }
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.adminPanel.addProgram}</span>
              </button>
            </div>

            {programs.map((prog) => (
              <div key={prog.id} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">
                      {prog.targetAge}
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {prog.title[language]}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {prog.description[language]}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {prog.levels.map((lvl) => (
                    <div key={lvl.id} className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-800 dark:text-white text-lg">
                          {lvl.name[language]} ({lvl.ageRange})
                        </h5>
                        <button
                          type="button"
                          onClick={() => setActiveTab('jigsaw')}
                          className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-500"
                        >
                          {isAr ? 'فتح استوديو المهام' : 'Open Game Studio'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {lvl.units.map((unit) => (
                          <div key={unit.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between items-start mb-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-red-600">{unit.code}</span>
                              <span>
                                {unit.lessons.length} {isAr ? 'دروس' : 'Lessons'}
                              </span>
                            </div>
                            <h6 className="font-bold text-slate-800 dark:text-white text-sm mb-1">
                              {unit.title[language]}
                            </h6>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {unit.description[language]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Educational Materials Library */}
        {activeTab === 'materials' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {t.materialsLibrary}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  {isAr ? 'إدارة وتصنيف ملفات PDF، أوراق العمل، الفيديوهات ومستندات المعلم' : 'Manage and categorize PDF files, worksheets, videos, and teacher documents'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMaterialModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t.adminPanel.addMaterial}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((mat) => (
                <div key={mat.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="p-3 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                        {mat.type === 'pdf' && <FileText className="w-6 h-6" />}
                        {mat.type === 'video' && <Video className="w-6 h-6" />}
                        {mat.type === 'image' && <ImageIcon className="w-6 h-6" />}
                        {mat.type === 'worksheet' && <FileText className="w-6 h-6" />}
                      </span>
                      <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {mat.type}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {mat.title[language]}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      {mat.description[language]}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-4">
                      <p>{mat.fileName} ({mat.fileSize})</p>
                      <p>{mat.uploadDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          isAr ? `تمت معاينة الملف: ${mat.fileName}` : `Previewed material: ${mat.fileName}`
                        )
                      }
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t.preview}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMaterial(mat.id)}
                      className="bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 py-2.5 px-3 rounded-xl text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Teachers */}
        {activeTab === 'teachers' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
              {isAr ? 'إدارة المعلمين والفصول' : 'Manage Teachers & Classes'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              {isAr ? 'مركز سمارت تك للتدريب - قائمة المدربين المعتمدين لصغار المبرمجين.' : 'SmartTech Training Center - Certified instructors for Smart Coders.'}
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">أستاذة سارة أحمد (Sarah Ahmed)</h4>
                  <p className="text-xs text-slate-500">sarah.smarttech@example.com · KG1 Instructor</p>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  {isAr ? 'نشط' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Add Material Modal */}
        {showAddMaterialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                {t.adminPanel.addMaterial}
              </h3>
              <form onSubmit={handleCreateMaterial} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'العنوان بالعربية' : 'Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitleAr}
                    onChange={(e) => setNewTitleAr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-red-500"
                    placeholder="مثال: ورقة عمل أساسيات الكمبيوتر"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'العنوان بالإنجليزية' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-red-500"
                    placeholder="e.g. Computer Basics Worksheet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'نوع المصدر التعليمي' : 'Material Type'}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MaterialType)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-red-500"
                  >
                    <option value="pdf">PDF Worksheet</option>
                    <option value="video">Educational Video</option>
                    <option value="image">Flashcard Image</option>
                    <option value="worksheet">Printable Activity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'اسم الملف' : 'File Name'}
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
                  >
                    {t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMaterialModal(false)}
                    className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
