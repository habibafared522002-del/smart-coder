import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Layers,
  Star,
  Zap,
  CheckCircle2,
  Users,
  Sparkles
} from 'lucide-react';
import { Language } from '../types';
import {
  ChapterLibraryDefinition,
  ChapterGameDefinition,
  ChapterGameLevel,
  DifficultyBand,
  DIFFICULTY_BAND_META,
  loadChapterLibraries,
  saveChapterLibraries,
  resetChapterLibraries,
  loadChildChapterProgress
} from '../data/chapterGameLibraryData';
import { ChildProfileRecord, loadChildProfiles } from '../data/ageGamesData';

interface AdminChapterLibraryTabProps {
  language: Language;
  onShowToast: (msg: string) => void;
}

export const AdminChapterLibraryTab: React.FC<AdminChapterLibraryTabProps> = ({
  language,
  onShowToast
}) => {
  const isAr = language === 'ar';
  const [chapters, setChapters] = useState<ChapterLibraryDefinition[]>(() => loadChapterLibraries());
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [selectedGameId, setSelectedGameId] = useState<string>(
    () => loadChapterLibraries()[0]?.games[0]?.id || ''
  );
  const [editingGame, setEditingGame] = useState<ChapterGameDefinition | null>(null);
  const [editingLevel, setEditingLevel] = useState<ChapterGameLevel | null>(null);
  const [childProfiles] = useState<ChildProfileRecord[]>(() => loadChildProfiles());

  const activeChapter = useMemo(
    () => chapters.find((c) => c.chapterId === selectedChapterId) || chapters[0],
    [chapters, selectedChapterId]
  );

  const activeGame = useMemo(
    () =>
      activeChapter.games.find((g) => g.id === selectedGameId) ||
      activeChapter.games[0],
    [activeChapter, selectedGameId]
  );

  const persistUpdate = (nextChapters: ChapterLibraryDefinition[], toastMsg: string) => {
    setChapters(nextChapters);
    saveChapterLibraries(nextChapters);
    onShowToast(toastMsg);
  };

  // Toggle Enable/Disable Game
  const handleToggleGameEnabled = (gameId: string) => {
    const updated = chapters.map((ch) => {
      if (ch.chapterId !== activeChapter.chapterId) return ch;
      return {
        ...ch,
        games: ch.games.map((g) => (g.id === gameId ? { ...g, enabled: !g.enabled } : g))
      };
    });
    const target = activeChapter.games.find((g) => g.id === gameId);
    persistUpdate(
      updated,
      target?.enabled
        ? isAr
          ? `تم إيقاف لعبة "${target.title.ar}" مؤقتاً.`
          : `Disabled game "${target.title.en}".`
        : isAr
        ? `تم تفعيل لعبة "${target?.title.ar}" للأطفال.`
        : `Enabled game "${target?.title.en}".`
    );
  };

  // Reorder games inside the chapter
  const handleMoveGameOrder = (index: number, direction: -1 | 1) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= activeChapter.games.length) return;
    const copy = [...activeChapter.games];
    const tmp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = tmp;
    const normalized = copy.map((g, i) => ({ ...g, order: i + 1 }));

    const updated = chapters.map((ch) =>
      ch.chapterId === activeChapter.chapterId ? { ...ch, games: normalized } : ch
    );
    persistUpdate(
      updated,
      isAr ? 'تمت إعادة ترتيب ألعاب الفصل وحفظ التغيير.' : 'Chapter games reordered and saved.'
    );
  };

  // Add a brand-new game with 15 progressive levels to the active chapter
  const handleAddNewGameToChapter = () => {
    const nextOrder = activeChapter.games.length + 1;
    const newGameId = `ch${activeChapter.chapterId}_g${nextOrder}_${Date.now()}`;
    const defaultEngine = activeChapter.games[0]?.engineKind || 'pointer_target';
    const defaultSubMode = activeChapter.games[0]?.subMode || 'hover_safari';

    const newLevels: ChapterGameLevel[] = Array.from({ length: 15 }, (_, idx) => {
      const levelNumber = idx + 1;
      const difficulty: DifficultyBand =
        levelNumber <= 3
          ? 'beginner'
          : levelNumber <= 6
          ? 'easy'
          : levelNumber <= 9
          ? 'intermediate'
          : levelNumber <= 12
          ? 'advanced'
          : 'challenge';

      return {
        id: `${newGameId}_lvl_${levelNumber}`,
        levelNumber,
        difficulty,
        title: {
          ar: `المرحلة ${levelNumber}`,
          en: `Level ${levelNumber}`
        },
        instruction: {
          ar: `المرحلة ${levelNumber}: أنجز التحدي التفاعلي مع الروبوت سمارتي!`,
          en: `Level ${levelNumber}: Complete the interactive challenge with Smarty!`
        },
        hint: {
          ar: 'اتبع إرشادات الروبوت سمارتي المضيئة على الشاشة.',
          en: 'Follow Smarty Robot glowing hints on screen.'
        },
        xpReward: 15 + idx * 3,
        starsMax: 3,
        itemsCount: Math.min(8, 2 + Math.floor(idx / 2)),
        gridSize: levelNumber <= 3 ? 3 : levelNumber <= 9 ? 4 : 5,
        targetSteps: Math.min(8, 2 + Math.floor(idx / 2)),
        specialChallenge: levelNumber >= 13,
        ruleModifier: levelNumber >= 13 ? 'challenge_master' : 'standard'
      };
    });

    const newGame: ChapterGameDefinition = {
      id: newGameId,
      chapterId: activeChapter.chapterId,
      order: nextOrder,
      enabled: true,
      engineKind: defaultEngine,
      subMode: defaultSubMode,
      iconName: 'Sparkles',
      accentColor: '#06b6d4',
      title: {
        ar: `${nextOrder}. لعبة تفاعلية جديدة`,
        en: `${nextOrder}. New Interactive Game`
      },
      description: {
        ar: 'لعبة تعليمية متدرجة مكونة من 15 مرحلة لتنمية مهارات التفكير والبرمجة.',
        en: 'Progressive 15-level educational game for computational thinking.'
      },
      skillTargeted: {
        ar: 'التفكير المنطقي وحل المشكلات',
        en: 'Logical Thinking & Problem Solving'
      },
      xpBonusCompletion: 100,
      levels: newLevels
    };

    const updated = chapters.map((ch) =>
      ch.chapterId === activeChapter.chapterId
        ? { ...ch, games: [...ch.games, newGame] }
        : ch
    );

    persistUpdate(
      updated,
      isAr
        ? `تمت إضافة لعبة جديدة بـ 15 مرحلة إلى الفصل ${activeChapter.chapterId}.`
        : `Added new 15-level game to Chapter ${activeChapter.chapterId}.`
    );
    setSelectedGameId(newGameId);
    setEditingGame(newGame);
  };

  // Save edited game metadata
  const handleSaveEditedGame = () => {
    if (!editingGame) return;
    const updated = chapters.map((ch) => {
      if (ch.chapterId !== editingGame.chapterId) return ch;
      return {
        ...ch,
        games: ch.games.map((g) => (g.id === editingGame.id ? editingGame : g))
      };
    });
    persistUpdate(
      updated,
      isAr
        ? `تم حفظ تعديلات اللعبة "${editingGame.title.ar}".`
        : `Saved changes to "${editingGame.title.en}".`
    );
    setEditingGame(null);
  };

  // Add a new level to the active game
  const handleAddLevelToGame = () => {
    if (!activeGame) return;
    const nextNum = activeGame.levels.length + 1;
    const newLvl: ChapterGameLevel = {
      id: `${activeGame.id}_lvl_${nextNum}`,
      levelNumber: nextNum,
      difficulty: 'challenge',
      title: {
        ar: `المرحلة ${nextNum} — تحدي إضافي`,
        en: `Level ${nextNum} — Bonus Challenge`
      },
      instruction: {
        ar: `المرحلة ${nextNum}: أنجز التحدي المتقدم مع الروبوت سمارتي!`,
        en: `Level ${nextNum}: Complete the bonus challenge with Smarty!`
      },
      hint: {
        ar: 'ركز في التسلسل واستخدم تلميحات سمارتي الذكية.',
        en: 'Focus on the sequence and use Smarty hints.'
      },
      xpReward: 60,
      starsMax: 3,
      itemsCount: 7,
      gridSize: 5,
      targetSteps: 6,
      specialChallenge: true,
      ruleModifier: 'challenge_master'
    };

    const updated = chapters.map((ch) => {
      if (ch.chapterId !== activeChapter.chapterId) return ch;
      return {
        ...ch,
        games: ch.games.map((g) =>
          g.id === activeGame.id ? { ...g, levels: [...g.levels, newLvl] } : g
        )
      };
    });

    persistUpdate(
      updated,
      isAr
        ? `تمت إضافة المرحلة ${nextNum} إلى لعبة "${activeGame.title.ar}".`
        : `Added Level ${nextNum} to "${activeGame.title.en}".`
    );
  };

  // Save edited level
  const handleSaveEditedLevel = () => {
    if (!editingLevel || !activeGame) return;
    const updated = chapters.map((ch) => {
      if (ch.chapterId !== activeChapter.chapterId) return ch;
      return {
        ...ch,
        games: ch.games.map((g) => {
          if (g.id !== activeGame.id) return g;
          return {
            ...g,
            levels: g.levels.map((l) => (l.id === editingLevel.id ? editingLevel : l))
          };
        })
      };
    });

    persistUpdate(
      updated,
      isAr
        ? `تم حفظ تعديلات المرحلة ${editingLevel.levelNumber}.`
        : `Saved changes to Level ${editingLevel.levelNumber}.`
    );
    setEditingLevel(null);
  };

  const handleResetAllChapterLibraries = () => {
    const defaults = resetChapterLibraries();
    setChapters(defaults);
    setSelectedChapterId(1);
    setSelectedGameId(defaults[0]?.games[0]?.id || '');
    setEditingGame(null);
    setEditingLevel(null);
    onShowToast(
      isAr
        ? 'تمت استعادة الإعدادات الافتراضية لجميع الفصول الـ 8 (62 لعبة و930 مرحلة).'
        : 'Restored default 8-chapter game libraries (62 games, 930 levels).'
    );
  };

  return (
    <div className="space-y-8" data-testid="admin-chapter-library-panel">
      {/* Header & Global Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase">
            <Layers className="w-4 h-4" />
            {isAr
              ? 'إدارة مكتبة ألعاب الفصول الثمانية (62 لعبة • 930 مرحلة)'
              : '8-Chapter Interactive Game Library Studio (62 Games • 930 Levels)'}
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {isAr
              ? 'التحكم الشامل في الفصول، الألعاب، المراحل الـ 15، الصعوبة، ونقاط XP'
              : 'Full CRUD Control for Chapters, Games, 15-Level Roadmaps, Difficulty & XP'}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddNewGameToChapter}
            data-testid="admin-add-chapter-game-btn"
            className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة لعبة جديدة للفصل' : 'Add Game to Chapter'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetAllChapterLibraries}
            data-testid="admin-reset-chapter-library-btn"
            className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
          </button>
        </div>
      </div>

      {/* Chapter Selector Strip (Chapters 1 to 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {chapters.map((ch) => {
          const isSelected = ch.chapterId === activeChapter.chapterId;
          const totalLevels = ch.games.reduce((acc, g) => acc + g.levels.length, 0);
          return (
            <button
              key={ch.chapterId}
              type="button"
              onClick={() => {
                setSelectedChapterId(ch.chapterId);
                setSelectedGameId(ch.games[0]?.id || '');
                setEditingGame(null);
                setEditingLevel(null);
              }}
              data-testid={`admin-select-chapter-${ch.chapterId}`}
              className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                isSelected
                  ? `bg-gradient-to-br ${ch.themeGradient} text-white border-transparent shadow-lg`
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-cyan-500'
              }`}
            >
              <div className="text-xs font-black opacity-85">
                {isAr ? `الفصل ${ch.chapterId}` : `Chapter ${ch.chapterId}`}
              </div>
              <div className="text-xs font-black truncate mt-0.5">{ch.title[language]}</div>
              <div className="text-[10px] font-bold opacity-80 mt-1">
                {ch.games.length} {isAr ? 'ألعاب' : 'games'} · {totalLevels}L
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Editor: Games List on Left, 15 Levels & Metadata Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Games in Active Chapter */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {isAr
                ? `ألعاب ${activeChapter.title.ar} (${activeChapter.games.length})`
                : `${activeChapter.title.en} Games (${activeChapter.games.length})`}
            </h4>
          </div>

          {activeChapter.games.map((g, idx) => {
            const isSelected = g.id === activeGame?.id;
            return (
              <div
                key={g.id}
                data-testid={`admin-chapter-game-row-${idx + 1}`}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-500 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGameId(g.id);
                      setEditingGame(null);
                      setEditingLevel(null);
                    }}
                    className="text-start flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[11px] font-black">
                        #{g.order}
                      </span>
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {g.title[language]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {g.skillTargeted[language]} • {g.levels.length}{' '}
                      {isAr ? 'مرحلة' : 'Levels'}
                    </p>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveGameOrder(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                      title={isAr ? 'لأعلى' : 'Move Up'}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveGameOrder(idx, 1)}
                      disabled={idx === activeChapter.games.length - 1}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                      title={isAr ? 'لأسفل' : 'Move Down'}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGame(g)}
                      data-testid={`admin-edit-game-btn-${idx + 1}`}
                      className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 cursor-pointer"
                      title={isAr ? 'تعديل اللعبة' : 'Edit Game'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleGameEnabled(g.id)}
                      data-testid={`admin-toggle-game-btn-${idx + 1}`}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        g.enabled
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {g.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Game Metadata Editor + 15 Levels Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Modal/Inline Editor for Game Title & Description */}
          {editingGame && (
            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-amber-400 shadow-xl space-y-4"
              data-testid="admin-game-edit-form"
            >
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {isAr ? 'تعديل بيانات اللعبة وإعداداتها' : 'Edit Game Title, Description & XP'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'اسم اللعبة (عربي)' : 'Game Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={editingGame.title.ar}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        title: { ...editingGame.title, ar: e.target.value }
                      })
                    }
                    data-testid="admin-game-title-ar-input"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'اسم اللعبة (إنجليزي)' : 'Game Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={editingGame.title.en}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        title: { ...editingGame.title, en: e.target.value }
                      })
                    }
                    data-testid="admin-game-title-en-input"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'وصف اللعبة (عربي)' : 'Description (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={editingGame.description.ar}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        description: { ...editingGame.description, ar: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'مكافأة إتمام اللعبة الكاملة (XP)' : 'Full Game Completion Bonus XP'}
                  </label>
                  <input
                    type="number"
                    value={editingGame.xpBonusCompletion}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        xpBonusCompletion: Number(e.target.value) || 50
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGame(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedGame}
                  data-testid="admin-save-game-btn"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ اللعبة' : 'Save Game'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Level Editor Form */}
          {editingLevel && (
            <div
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-cyan-500 shadow-xl space-y-4"
              data-testid="admin-level-edit-form"
            >
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {isAr
                  ? `تعديل المرحلة ${editingLevel.levelNumber} — ${activeGame?.title.ar}`
                  : `Edit Level ${editingLevel.levelNumber} — ${activeGame?.title.en}`}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'مستوى الصعوبة' : 'Difficulty Band'}
                  </label>
                  <select
                    value={editingLevel.difficulty}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        difficulty: e.target.value as DifficultyBand
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="beginner">Beginner (1-3)</option>
                    <option value="easy">Easy (4-6)</option>
                    <option value="intermediate">Intermediate (7-9)</option>
                    <option value="advanced">Advanced (10-12)</option>
                    <option value="challenge">Challenge (13-15)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'نقاط الخبرة (XP)' : 'XP Reward'}
                  </label>
                  <input
                    type="number"
                    value={editingLevel.xpReward}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        xpReward: Number(e.target.value) || 15
                      })
                    }
                    data-testid="admin-level-xp-input"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'عدد عناصر التحدي' : 'Challenge Items Count'}
                  </label>
                  <input
                    type="number"
                    value={editingLevel.itemsCount}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        itemsCount: Math.max(2, Math.min(10, Number(e.target.value) || 3))
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'تعليمات المرحلة (عربي)' : 'Instruction (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={editingLevel.instruction.ar}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        instruction: { ...editingLevel.instruction, ar: e.target.value }
                      })
                    }
                    data-testid="admin-level-instruction-ar-input"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {isAr ? 'تعليمات المرحلة (إنجليزي)' : 'Instruction (English)'}
                  </label>
                  <input
                    type="text"
                    value={editingLevel.instruction.en}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        instruction: { ...editingLevel.instruction, en: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLevel(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedLevel}
                  data-testid="admin-save-level-btn"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حفظ المرحلة' : 'Save Level'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 15 Levels List for Selected Game */}
          {activeGame && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {activeGame.title[language]} — ({activeGame.levels.length}{' '}
                    {isAr ? 'مرحلة متدرجة' : 'Progressive Levels'})
                  </h4>
                  <p className="text-xs text-slate-500">
                    {activeGame.description[language]}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddLevelToGame}
                  data-testid="admin-add-level-to-game-btn"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إضافة مرحلة جديدة' : 'Add Level'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {activeGame.levels.map((lvl) => (
                  <div
                    key={lvl.id}
                    data-testid={`admin-game-level-card-${lvl.levelNumber}`}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {isAr ? `مرحلة ${lvl.levelNumber}` : `Level ${lvl.levelNumber}`}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                          {lvl.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {lvl.instruction[language]}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                        +{lvl.xpReward} XP · {lvl.itemsCount} {isAr ? 'عناصر' : 'items'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingLevel(lvl)}
                        data-testid={`admin-edit-level-${lvl.levelNumber}`}
                        className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Child Progress Overview Across the 8 Chapter Libraries */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-cyan-500" />
          <h4 className="text-base font-black text-slate-900 dark:text-white">
            {isAr
              ? 'متابعة تقدم الأطفال داخل مكتبة ألعاب الفصول الثمانية'
              : 'Children Progress Across the 8-Chapter Game Libraries'}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {childProfiles.map((child) => {
            const cProg = loadChildChapterProgress(child.id);
            const completedLevelsTotal = Object.values(cProg.games).reduce(
              (acc, g) => acc + g.completedLevels.length,
              0
            );
            const earnedXpTotal = Object.values(cProg.games).reduce(
              (acc, g) => acc + g.earnedXp,
              0
            );
            return (
              <div
                key={child.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{child.avatarEmoji}</span>
                  <div>
                    <div className="font-black text-sm text-slate-900 dark:text-white">
                      {child.name[language]} ({child.ageGroup})
                    </div>
                    <div className="text-xs text-slate-500">
                      {completedLevelsTotal} {isAr ? 'مرحلة مكتملة في الفصول' : 'chapter levels done'} ·{' '}
                      +{earnedXpTotal} XP
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
