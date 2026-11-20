import React, { useState, useEffect, useMemo } from 'react';
import {
  MousePointer,
  Puzzle,
  Wrench,
  Star,
  Play,
  Flame,
  CheckCircle2,
  Users,
  Sparkles,
  Lock,
  Layers,
  Trophy,
  Palette,
  Home,
  BookOpen,
  Volume2,
  VolumeX,
  Compass,
  Award,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Language, StudentProgress } from '../types';
import { juniorChaptersData, JuniorChapter, JuniorLevel } from '../data/juniorCurriculumData';
import { getLocalIsoDate, recordDailyStreakActivity } from '../data/jigsawLevelsData';
import {
  AgeGameConfig,
  AgeGameId,
  ChildProfileRecord,
  StageAssessmentResult,
  getActiveChildId,
  loadAgeGamesConfig,
  loadChildProfiles,
  saveChildProfiles,
  setActiveChildId,
} from '../data/ageGamesData';
import {
  ChapterLibraryDefinition,
  ChildChapterLibraryProgress,
  loadChapterLibraries,
  loadChildChapterProgress,
} from '../data/chapterGameLibraryData';
import {
  AWARDABLE_BADGES,
  ChildWholePlatformState,
  CreativeProjectRecord,
  EducationalWorldDefinition,
  EducationalWorldId,
  PlacedOasisItem,
  SEVEN_EDUCATIONAL_WORLDS,
  WorldAssessmentRecord,
  WorldSpecializedModule,
  computeWorldMasteryPct,
  getSmartyContextualDialogue,
  loadChildPlatformState,
  recordWorldInteractionEvent,
  saveChildPlatformState,
  speakChildFriendly,
} from '../data/sevenWorldsPlatformData';
import { JuniorTaskRunner } from './JuniorTaskRunner';
import { MouseExplorerGamePlayer } from './MouseExplorerGamePlayer';
import { JigsawGameEngine } from './JigsawGameEngine';
import { WorkshopOrganizerGame } from './WorkshopOrganizerGame';
import { ColorShapeAdventureGame } from './ageGames/ColorShapeAdventureGame';
import { MouseMissionGame } from './ageGames/MouseMissionGame';
import { RobotCodingAdventureGame } from './ageGames/RobotCodingAdventureGame';
import { SmartyMascot3D } from './SmartyMascot3D';
import { ChapterGameLibraryEngine } from './ChapterGameLibraryEngine';
import { WorldSpecializedActivity } from './WorldSpecializedActivity';
import { WorldAssessmentQuiz } from './WorldAssessmentQuiz';
import { UnifiedChildHub, UnifiedHubTab } from './UnifiedChildHub';

interface JuniorCurriculumViewProps {
  language: Language;
  progress: StudentProgress;
  onUpdateProgress: (newProgress: StudentProgress) => void;
}

export const JuniorCurriculumView: React.FC<JuniorCurriculumViewProps> = ({
  language,
  progress,
  onUpdateProgress,
}) => {
  const isAr = language === 'ar';
  const [selectedChapter, setSelectedChapter] = useState<JuniorChapter | null>(null);
  const [activeLibraryChapterId, setActiveLibraryChapterId] = useState<number | null>(null);
  const [activeLevel, setActiveLevel] = useState<JuniorLevel | null>(null);
  const [showMouseExplorer12, setShowMouseExplorer12] = useState<boolean>(false);
  const [showJigsaw12, setShowJigsaw12] = useState<boolean>(false);
  const [showWorkshopOrganizer, setShowWorkshopOrganizer] = useState<boolean>(false);

  // Age-based games & multi-child state
  const [ageGames, setAgeGames] = useState<AgeGameConfig[]>(() => loadAgeGamesConfig());
  const [childProfiles, setChildProfiles] = useState<ChildProfileRecord[]>(() => loadChildProfiles());
  const [activeChildId, setActiveChildIdState] = useState<string>(() => getActiveChildId());
  const [activeAgeGameId, setActiveAgeGameId] = useState<AgeGameId | null>(null);

  // 8-Chapter Expanded Game Libraries (62 Games, 930 Progressive Levels)
  const [chapterLibraries, setChapterLibraries] = useState<ChapterLibraryDefinition[]>(() =>
    loadChapterLibraries()
  );
  const [childChapterProgress, setChildChapterProgress] = useState<ChildChapterLibraryProgress>(() =>
    loadChildChapterProgress(getActiveChildId())
  );

  // Whole-Child 7-World Platform State
  const [platformState, setPlatformState] = useState<ChildWholePlatformState>(() =>
    loadChildPlatformState(getActiveChildId())
  );
  const [selectedWorldId, setSelectedWorldId] = useState<EducationalWorldId | null>(null);
  const [activeSpecializedModule, setActiveSpecializedModule] =
    useState<WorldSpecializedModule | null>(null);
  const [activeAssessmentWorld, setActiveAssessmentWorld] =
    useState<EducationalWorldDefinition | null>(null);
  const [activeHubTab, setActiveHubTab] = useState<UnifiedHubTab | null>(null);

  // Dual-mode Smarty Companion & Global Mute Preference
  const [companionMode, setCompanionMode] = useState<'guide' | 'adventure'>('guide');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const syncGames = () => setAgeGames(loadAgeGamesConfig());
    const syncChildren = () => {
      const profiles = loadChildProfiles();
      const cid = getActiveChildId();
      setChildProfiles(profiles);
      setActiveChildIdState(cid);
      setChildChapterProgress(loadChildChapterProgress(cid));
      setPlatformState(loadChildPlatformState(cid));
    };
    const syncChapterLibraries = () => {
      setChapterLibraries(loadChapterLibraries());
      setChildChapterProgress(loadChildChapterProgress(getActiveChildId()));
    };
    const syncWholePlatform = () => {
      setPlatformState(loadChildPlatformState(getActiveChildId()));
    };

    window.addEventListener('smartcoders:age-games-updated', syncGames);
    window.addEventListener('smartcoders:children-updated', syncChildren);
    window.addEventListener('smartcoders:chapter-libraries-updated', syncChapterLibraries);
    window.addEventListener('smartcoders:chapter-progress-updated', syncChapterLibraries);
    window.addEventListener('smartcoders:whole-child-updated', syncWholePlatform);
    return () => {
      window.removeEventListener('smartcoders:age-games-updated', syncGames);
      window.removeEventListener('smartcoders:children-updated', syncChildren);
      window.removeEventListener('smartcoders:chapter-libraries-updated', syncChapterLibraries);
      window.removeEventListener('smartcoders:chapter-progress-updated', syncChapterLibraries);
      window.removeEventListener('smartcoders:whole-child-updated', syncWholePlatform);
    };
  }, []);

  const activeChild: ChildProfileRecord = useMemo(() => {
    return childProfiles.find((c) => c.id === activeChildId) || childProfiles[0];
  }, [childProfiles, activeChildId]);

  useEffect(() => {
    if (activeChild?.id) {
      setChildChapterProgress(loadChildChapterProgress(activeChild.id));
      setPlatformState(loadChildPlatformState(activeChild.id));
    }
  }, [activeChild?.id]);

  const showRewardToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Switch active child profile cleanly without mixing student data
  const handleSelectChild = (childId: string) => {
    const selected = setActiveChildId(childId);
    setActiveChildIdState(selected.id);
    setChildChapterProgress(loadChildChapterProgress(selected.id));
    setPlatformState(loadChildPlatformState(selected.id));
    onUpdateProgress(selected.progress);
  };

  const syncChildRewards = (xpDelta: number, starsDelta: number, newBadgeLabel?: string) => {
    if (xpDelta <= 0 && starsDelta <= 0 && !newBadgeLabel) return;
    const todayIso = getLocalIsoDate();
    const baseProgress = activeChild.progress;
    const nextBadges =
      newBadgeLabel && !baseProgress.badges.includes(newBadgeLabel)
        ? [...baseProgress.badges, newBadgeLabel]
        : baseProgress.badges;

    const updatedStudentProgress: StudentProgress = recordDailyStreakActivity(
      {
        ...baseProgress,
        starsEarned: baseProgress.starsEarned + starsDelta,
        xpEarned: (baseProgress.xpEarned ?? baseProgress.starsEarned * 10) + xpDelta,
        badges: nextBadges,
        lastActiveDate: todayIso,
      },
      todayIso
    );

    const updatedChild: ChildProfileRecord = {
      ...activeChild,
      progress: updatedStudentProgress,
    };

    const nextProfiles = childProfiles.map((c) =>
      c.id === updatedChild.id ? updatedChild : c
    );
    setChildProfiles(nextProfiles);
    saveChildProfiles(nextProfiles);
    onUpdateProgress(updatedStudentProgress);
  };

  // Sync Chapter Game Library level completion with active ChildProfileRecord and global StudentProgress
  const handleUpdateChapterLibraryProgress = (
    updatedChapterProg: ChildChapterLibraryProgress,
    xpDelta: number,
    starsDelta: number
  ) => {
    setChildChapterProgress(updatedChapterProg);
    syncChildRewards(xpDelta, starsDelta);
  };

  // Save stage completion for the active child profile + sync global StudentProgress
  const handleSaveAgeGameStage = (
    gameId: AgeGameId,
    stageId: string,
    xpReward: number,
    starsReward: number,
    assessment: StageAssessmentResult
  ) => {
    const gameCfg = ageGames.find((g) => g.id === gameId);
    const enabledStages = gameCfg ? gameCfg.stages.filter((s) => s.isEnabled) : [];
    const currentStageObj = gameCfg?.stages.find((s) => s.id === stageId);
    const currentStageNum = currentStageObj?.stageNumber ?? 1;

    const alreadyCompleted = activeChild.completedStageIds.includes(stageId);
    const nextCompletedStageIds = alreadyCompleted
      ? activeChild.completedStageIds
      : [...activeChild.completedStageIds, stageId];

    const currentMaxUnlocked = activeChild.unlockedStageByGame?.[gameId] ?? 1;
    const nextUnlockedStage = Math.max(
      currentMaxUnlocked,
      Math.min(enabledStages.length || 5, currentStageNum + 1)
    );

    const todayIso = getLocalIsoDate();
    const baseProgress = activeChild.progress;
    const updatedProgress: StudentProgress = recordDailyStreakActivity(
      {
        ...baseProgress,
        completedActivityIds: alreadyCompleted
          ? baseProgress.completedActivityIds
          : [...baseProgress.completedActivityIds, stageId],
        starsEarned: alreadyCompleted
          ? baseProgress.starsEarned
          : baseProgress.starsEarned + starsReward,
        xpEarned: alreadyCompleted
          ? baseProgress.xpEarned ?? baseProgress.starsEarned * 10
          : (baseProgress.xpEarned ?? baseProgress.starsEarned * 10) + xpReward,
        lastActiveDate: todayIso,
      },
      todayIso
    );

    const updatedChild: ChildProfileRecord = {
      ...activeChild,
      progress: updatedProgress,
      unlockedStageByGame: {
        ...activeChild.unlockedStageByGame,
        [gameId]: nextUnlockedStage,
      },
      completedStageIds: nextCompletedStageIds,
      stageAssessments: {
        ...activeChild.stageAssessments,
        [stageId]: assessment,
      },
    };

    const nextProfiles = childProfiles.map((c) =>
      c.id === updatedChild.id ? updatedChild : c
    );
    setChildProfiles(nextProfiles);
    saveChildProfiles(nextProfiles);
    onUpdateProgress(updatedProgress);
  };

  // Handle World Assessment Quiz Saving
  const handleSaveWorldAssessment = (record: WorldAssessmentRecord) => {
    const prevAssess = platformState.assessmentsByWorld[record.worldId];
    const nextAssessments = {
      ...platformState.assessmentsByWorld,
      [record.worldId]: record,
    };

    let worldXpDelta = prevAssess ? 0 : record.xpAwarded;
    let nextBadges = [...platformState.unlockedBadgeIds];
    let earnedBadgeTitle: string | undefined;

    if (record.worldId === 'world_coding' && record.scorePct >= 50 && !nextBadges.includes('badge_coding_champion')) {
      nextBadges.push('badge_coding_champion');
      const badgeDef = AWARDABLE_BADGES.find((b) => b.id === 'badge_coding_champion');
      if (badgeDef) {
        worldXpDelta += badgeDef.xpBonus;
        earnedBadgeTitle = badgeDef.title[language];
      }
    }

    const updatedPlatform: ChildWholePlatformState = {
      ...platformState,
      assessmentsByWorld: nextAssessments,
      unlockedBadgeIds: nextBadges,
      worldXpEarned: (platformState.worldXpEarned || 0) + worldXpDelta,
    };

    saveChildPlatformState(updatedPlatform);
    setPlatformState(updatedPlatform);

    if (worldXpDelta > 0) {
      syncChildRewards(worldXpDelta, prevAssess ? 0 : 2, earnedBadgeTitle);
      showRewardToast(
        isAr
          ? `تم حفظ نتيجة تقييم العالم (+${worldXpDelta} XP)!`
          : `World Assessment Saved (+${worldXpDelta} XP)!`
      );
    }
  };

  // Creative Studio save handler (awards badge_creative_builder once)
  const handleSaveCreativeProject = (project: CreativeProjectRecord) => {
    const existingIdx = platformState.creativeProjects.findIndex((p) => p.id === project.id);
    const nextProjects =
      existingIdx >= 0
        ? platformState.creativeProjects.map((p, idx) => (idx === existingIdx ? project : p))
        : [project, ...platformState.creativeProjects];

    const firstTimeProject = platformState.creativeProjects.length === 0;
    const { nextState, xpAwarded, newlyUnlockedBadge } = recordWorldInteractionEvent(
      { ...platformState, creativeProjects: nextProjects },
      'world_creative',
      {
        correctDelta: 1,
        completedModuleId: 'mod_creative_studio',
        xpReward: firstTimeProject ? 35 : 0,
        badgeId: 'badge_creative_builder',
      }
    );

    setPlatformState(nextState);
    if (xpAwarded > 0) {
      syncChildRewards(xpAwarded, 2, newlyUnlockedBadge?.title[language]);
      showRewardToast(
        newlyUnlockedBadge
          ? isAr
            ? `مبروك! وسام ${newlyUnlockedBadge.title.ar} (+${xpAwarded} XP)`
            : `Unlocked ${newlyUnlockedBadge.title.en} (+${xpAwarded} XP)!`
          : isAr
          ? `تم حفظ مشروعك وكسبت +${xpAwarded} XP!`
          : `Project saved (+${xpAwarded} XP)!`
      );
    }
  };

  const handleDeleteCreativeProject = (projectId: string) => {
    const nextState: ChildWholePlatformState = {
      ...platformState,
      creativeProjects: platformState.creativeProjects.filter((p) => p.id !== projectId),
    };
    saveChildPlatformState(nextState);
    setPlatformState(nextState);
  };

  const handleUpdateOasisItems = (items: PlacedOasisItem[]) => {
    const nextState: ChildWholePlatformState = {
      ...platformState,
      oasisItems: items,
    };
    saveChildPlatformState(nextState);
    setPlatformState(nextState);
  };

  const handleToggleUnpluggedComplete = (cardId: string) => {
    const exists = platformState.completedUnpluggedIds.includes(cardId);
    const nextIds = exists
      ? platformState.completedUnpluggedIds.filter((id) => id !== cardId)
      : [...platformState.completedUnpluggedIds, cardId];

    const nextState: ChildWholePlatformState = {
      ...platformState,
      completedUnpluggedIds: nextIds,
    };
    saveChildPlatformState(nextState);
    setPlatformState(nextState);

    if (!exists) {
      syncChildRewards(15, 1);
      showRewardToast(isAr ? 'أحسنت! +15 XP لإكمال النشاط المنزلي!' : 'Awesome! +15 XP for unplugged home activity!');
    }
  };

  // Automatically track today's consecutive daily activity when entering JuniorCurriculumView
  useEffect(() => {
    const todayIso = getLocalIsoDate();
    if (progress.lastStreakDate !== todayIso || !progress.dailyStreak) {
      const updated = recordDailyStreakActivity(progress, todayIso);
      onUpdateProgress(updated);
    }
  }, [progress.lastStreakDate, progress.dailyStreak]);

  const dailyStreak = Math.max(1, progress.dailyStreak ?? 1);

  const streakWeekDays = useMemo(() => {
    const dayLabelsAr = ['يوم 1', 'يوم 2', 'يوم 3', 'يوم 4', 'يوم 5', 'يوم 6', 'يوم 7'];
    const dayLabelsEn = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
    const cappedActive = Math.min(7, dailyStreak);
    return Array.from({ length: 7 }, (_, i) => ({
      dayNum: i + 1,
      label: isAr ? dayLabelsAr[i] : dayLabelsEn[i],
      completed: i + 1 <= cappedActive,
      isCurrent: i + 1 === cappedActive,
    }));
  }, [dailyStreak, isAr]);

  // Global stats across all 8 Chapter Libraries
  const libraryTotals = useMemo(() => {
    let totalGames = 0;
    let totalLevels = 0;
    let completedLevels = 0;

    chapterLibraries.forEach((ch) => {
      const enabled = ch.games.filter((g) => g.enabled);
      totalGames += enabled.length;
      enabled.forEach((g) => {
        totalLevels += g.levels.length;
        const gp = childChapterProgress.games[g.id];
        if (gp) {
          completedLevels += gp.completedLevels.length;
        }
      });
    });

    return { totalGames, totalLevels, completedLevels };
  }, [chapterLibraries, childChapterProgress]);

  // Helper to render any Chapter card consistently both inside Worlds & in Quick Access
  const renderChapterCard = (chapterLib: ChapterLibraryDefinition) => {
    const legacyChapter = juniorChaptersData.find(
      (c) => c.chapterNumber === chapterLib.chapterId
    );
    const enabledChGames = chapterLib.games.filter((g) => g.enabled);
    const totalChLevels = enabledChGames.reduce((sum, g) => sum + g.levels.length, 0);
    let completedChLevels = 0;
    let earnedChStars = 0;

    enabledChGames.forEach((g) => {
      const gp = childChapterProgress.games[g.id];
      if (gp) {
        completedChLevels += gp.completedLevels.length;
        Object.values(gp.starsByLevel).forEach((s) => {
          earnedChStars += s;
        });
      }
    });

    const chPct =
      totalChLevels > 0 ? Math.round((completedChLevels / totalChLevels) * 100) : 0;

    return (
      <div
        key={chapterLib.chapterId}
        data-testid={`chapter-card-${chapterLib.chapterId}`}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-2 border-slate-200 dark:border-slate-800 hover:border-red-500 transition-all flex flex-col justify-between group"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${chapterLib.themeGradient} text-white flex items-center justify-center font-black text-lg shadow-md`}
            >
              {chapterLib.chapterId}
            </div>
            <div className="flex flex-col items-end">
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-800 dark:text-slate-200">
                {enabledChGames.length} {isAr ? 'ألعاب' : 'Games'} • {totalChLevels}{' '}
                {isAr ? 'مرحلة' : 'Levels'}
              </span>
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {earnedChStars}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5">
            {chapterLib.title[language]}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 leading-relaxed line-clamp-2">
            {chapterLib.subtitle[language]}
          </p>

          <div className="space-y-1 mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">
              {isAr ? 'أبرز ألعاب الفصل:' : 'Featured Chapter Games:'}
            </div>
            {enabledChGames.slice(0, 4).map((g, i) => (
              <div
                key={g.id}
                className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate flex items-center justify-between"
              >
                <span className="truncate">
                  {i + 1}. {g.title[language]}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 ms-1">15L</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
              <span>{isAr ? 'التقدم في الفصل' : 'Chapter Progress'}</span>
              <span className="tabular-nums">
                {completedChLevels}/{totalChLevels} ({chPct}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${chapterLib.themeGradient} rounded-full transition-all duration-500`}
                style={{ width: `${chPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveLibraryChapterId(chapterLib.chapterId)}
              data-testid={`open-chapter-library-${chapterLib.chapterId}`}
              className={`flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r ${chapterLib.themeGradient} text-white font-black text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? 'دخول مكتبة الفصل' : 'Open Game Library'}</span>
            </button>

            {legacyChapter && (
              <button
                type="button"
                onClick={() => setSelectedChapter(legacyChapter)}
                data-testid={`quick-drawer-chapter-${chapterLib.chapterId}`}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black cursor-pointer"
                title={isAr ? 'عرض سريع' : 'Quick View'}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // FULL-SCREEN SUB-ENGINES & EXPERIENCES (PRESERVED + NEW WHOLE-CHILD VIEWS)
  // =========================================================================

  if (activeHubTab !== null) {
    return (
      <UnifiedChildHub
        language={language}
        childProfile={activeChild}
        platformState={platformState}
        initialTab={activeHubTab}
        soundMuted={soundMuted}
        onSaveCreativeProject={handleSaveCreativeProject}
        onDeleteCreativeProject={handleDeleteCreativeProject}
        onUpdateOasisItems={handleUpdateOasisItems}
        onToggleUnpluggedComplete={handleToggleUnpluggedComplete}
        onBack={() => setActiveHubTab(null)}
      />
    );
  }

  if (activeAssessmentWorld !== null) {
    return (
      <WorldAssessmentQuiz
        world={activeAssessmentWorld}
        language={language}
        ageGroup={activeChild.ageGroup}
        childName={activeChild.name[language]}
        soundMuted={soundMuted}
        previousRecord={platformState.assessmentsByWorld[activeAssessmentWorld.id]}
        onSaveAssessment={handleSaveWorldAssessment}
        onBack={() => setActiveAssessmentWorld(null)}
      />
    );
  }

  if (activeSpecializedModule !== null) {
    return (
      <WorldSpecializedActivity
        module={activeSpecializedModule}
        language={language}
        ageGroup={activeChild.ageGroup}
        adaptivePace={
          platformState.adaptiveByWorld[activeSpecializedModule.worldId]?.paceMode || 'steady'
        }
        childName={activeChild.name[language]}
        soundMuted={soundMuted}
        onAttemptRecord={(isCorrect, usedHint) => {
          const { nextState } = recordWorldInteractionEvent(
            platformState,
            activeSpecializedModule.worldId,
            {
              correctDelta: isCorrect ? 1 : 0,
              incorrectDelta: isCorrect ? 0 : 1,
              retryDelta: isCorrect ? 0 : 1,
              hintDelta: usedHint ? 1 : 0,
            }
          );
          setPlatformState(nextState);
        }}
        onCompleteModule={(xpReward, badgeId) => {
          const { nextState, xpAwarded, newlyUnlockedBadge } = recordWorldInteractionEvent(
            platformState,
            activeSpecializedModule.worldId,
            {
              correctDelta: 1,
              completedModuleId: activeSpecializedModule.id,
              xpReward,
              badgeId,
            }
          );
          setPlatformState(nextState);
          if (xpAwarded > 0) {
            syncChildRewards(xpAwarded, 2, newlyUnlockedBadge?.title[language]);
            showRewardToast(
              newlyUnlockedBadge
                ? isAr
                  ? `وسام جديد: ${newlyUnlockedBadge.title.ar} (+${xpAwarded} XP)`
                  : `New Badge: ${newlyUnlockedBadge.title.en} (+${xpAwarded} XP)`
                : isAr
                ? `تم إكمال النشاط بنجاح (+${xpAwarded} XP)!`
                : `Module Completed (+${xpAwarded} XP)!`
            );
          }
        }}
        onBack={() => setActiveSpecializedModule(null)}
      />
    );
  }

  if (activeLibraryChapterId !== null) {
    const activeChapterLib =
      chapterLibraries.find((c) => c.chapterId === activeLibraryChapterId) ||
      chapterLibraries[0];

    return (
      <ChapterGameLibraryEngine
        chapter={activeChapterLib}
        allChapters={chapterLibraries}
        onSelectChapter={(chId) => setActiveLibraryChapterId(chId)}
        language={language}
        activeChildId={activeChild.id}
        activeChildName={activeChild.name[language]}
        initialAgeGroup={activeChild.ageGroup}
        childProgress={childChapterProgress}
        onUpdateProgress={handleUpdateChapterLibraryProgress}
        onBackToCurriculum={() => setActiveLibraryChapterId(null)}
      />
    );
  }

  if (activeAgeGameId === 'explorers_color_shape') {
    const cfg = ageGames.find((g) => g.id === 'explorers_color_shape') || ageGames[0];
    return (
      <ColorShapeAdventureGame
        language={language}
        gameConfig={cfg}
        childProfile={activeChild}
        onSaveStageCompletion={(stageId, xp, stars, assessment) =>
          handleSaveAgeGameStage('explorers_color_shape', stageId, xp, stars, assessment)
        }
        onExit={() => setActiveAgeGameId(null)}
      />
    );
  }

  if (activeAgeGameId === 'discoverers_mouse_mission') {
    const cfg = ageGames.find((g) => g.id === 'discoverers_mouse_mission') || ageGames[1];
    return (
      <MouseMissionGame
        language={language}
        gameConfig={cfg}
        childProfile={activeChild}
        onSaveStageCompletion={(stageId, xp, stars, assessment) =>
          handleSaveAgeGameStage('discoverers_mouse_mission', stageId, xp, stars, assessment)
        }
        onExit={() => setActiveAgeGameId(null)}
      />
    );
  }

  if (activeAgeGameId === 'creators_robot_coding') {
    const cfg = ageGames.find((g) => g.id === 'creators_robot_coding') || ageGames[2];
    return (
      <RobotCodingAdventureGame
        language={language}
        gameConfig={cfg}
        childProfile={activeChild}
        onSaveStageCompletion={(stageId, xp, stars, assessment) =>
          handleSaveAgeGameStage('creators_robot_coding', stageId, xp, stars, assessment)
        }
        onExit={() => setActiveAgeGameId(null)}
      />
    );
  }

  if (showWorkshopOrganizer) {
    return (
      <WorkshopOrganizerGame
        language={language}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onExit={() => setShowWorkshopOrganizer(false)}
      />
    );
  }

  if (showMouseExplorer12) {
    return (
      <MouseExplorerGamePlayer
        language={language}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onExit={() => setShowMouseExplorer12(false)}
      />
    );
  }

  if (showJigsaw12) {
    return (
      <JigsawGameEngine
        language={language}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onExit={() => setShowJigsaw12(false)}
      />
    );
  }

  if (activeLevel) {
    return (
      <JuniorTaskRunner
        language={language}
        level={activeLevel}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onBackToMap={() => setActiveLevel(null)}
      />
    );
  }

  // =========================================================================
  // INSIDE SELECTED EDUCATIONAL WORLD HUB (NESTED CHAPTERS + MODULES + QUIZ)
  // =========================================================================
  if (selectedWorldId !== null) {
    const world =
      SEVEN_EDUCATIONAL_WORLDS.find((w) => w.id === selectedWorldId) ||
      SEVEN_EDUCATIONAL_WORLDS[0];
    const mastery = computeWorldMasteryPct(
      world,
      childChapterProgress,
      platformState,
      chapterLibraries
    );
    const assessRec = platformState.assessmentsByWorld[world.id];
    const nestedChapters = chapterLibraries.filter((ch) =>
      world.mappedChapterIds.includes(ch.chapterId)
    );

    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8"
        data-testid={`world-hub-${world.id}`}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              data-testid="back-to-seven-worlds-btn"
              onClick={() => setSelectedWorldId(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-black shadow-sm hover:border-red-500 cursor-pointer"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{isAr ? 'العودة لخريطة العوالم السبعة' : 'Back to Seven Worlds Map'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundMuted((m) => !m)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {soundMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                <span>{soundMuted ? (isAr ? 'صامت' : 'Muted') : isAr ? 'الصوت مفعّل' : 'Sound On'}</span>
              </button>
            </div>
          </div>

          {/* World Hero Banner */}
          <div
            className={`bg-gradient-to-r ${world.gradient} rounded-3xl p-7 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6`}
          >
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/15 p-1 flex items-center justify-center shrink-0">
                <SmartyMascot3D state="cheering" size="lg" language={language} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-white/20 text-xs font-black px-3 py-1 rounded-full">
                    {world.icon} {isAr ? `العالم ${world.worldNumber} من 7` : `World ${world.worldNumber} of 7`}
                  </span>
                  <span className="bg-black/25 text-xs font-black px-3 py-1 rounded-full tabular-nums">
                    {isAr ? `الإتقان: ${mastery.pct}%` : `Mastery: ${mastery.pct}%`}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mt-2">{world.title[language]}</h2>
                <p className="text-white/90 text-sm mt-1 max-w-2xl">
                  {getSmartyContextualDialogue({
                    mode: companionMode,
                    language,
                    ageGroup: activeChild.ageGroup,
                    worldId: world.id,
                    situation: 'unlock_world',
                    childName: activeChild.name[language],
                  })}
                </p>
              </div>
            </div>

            <button
              type="button"
              data-testid={`launch-world-quiz-${world.id}`}
              onClick={() => setActiveAssessmentWorld(world)}
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-5 h-5" />
              <span>
                {assessRec
                  ? isAr
                    ? `اختبار التقييم (${assessRec.scorePct}%)`
                    : `World Quiz (${assessRec.scorePct}%)`
                  : isAr
                  ? 'ابدأ تقييم العالم الذكي'
                  : 'Take World Mastery Quiz'}
              </span>
            </button>
          </div>

          {toastMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 font-black text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* 1. Specialized Whole-Child Modules inside this World */}
          {world.specializedModules.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-fuchsia-600" />
                <span>{isAr ? 'المختبرات والأنشطة التخصصية في هذا العالم' : 'Specialized Interactive Labs'}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {world.specializedModules.map((mod) => {
                  const isCompleted = platformState.adaptiveByWorld[world.id]?.completedModuleIds.includes(
                    mod.id
                  );
                  return (
                    <div
                      key={mod.id}
                      data-testid={`specialized-module-card-${mod.moduleKind}`}
                      className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 shadow-lg flex flex-col justify-between ${
                        isCompleted
                          ? 'border-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-3xl">{mod.icon}</span>
                          <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black tabular-nums">
                            +{mod.xpReward} XP {isCompleted ? '✓' : ''}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                          {mod.title[language]}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {mod.subtitle[language]}
                        </p>
                      </div>

                      <button
                        type="button"
                        data-testid={`launch-module-${mod.moduleKind}`}
                        onClick={() => {
                          if (mod.moduleKind === 'creative_studio') {
                            setActiveHubTab('studio');
                          } else {
                            setActiveSpecializedModule(mod);
                          }
                        }}
                        className="mt-5 w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isAr ? 'تشغيل النشاط الآن' : 'Launch Interactive Lab'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Nested Existing Chapters inside this World */}
          {nestedChapters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-600" />
                <span>
                  {isAr
                    ? `الفصول التعليمية ومكتبات الألعاب داخل ${world.title.ar}`
                    : `Nested Chapters Inside ${world.title.en}`}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nestedChapters.map((ch) => renderChapterCard(ch))}
              </div>
            </div>
          )}

          {/* 3. Mapped Standalone Games inside this World */}
          {world.mappedStandaloneGames.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>{isAr ? 'مغامرات وألعاب مستقلة مرتبطة بهذا العالم' : 'Mapped Adventure Games'}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {world.mappedStandaloneGames.includes('mouse_explorer_12') && (
                  <button
                    type="button"
                    onClick={() => setShowMouseExplorer12(true)}
                    className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <MousePointer className="w-4 h-4 text-red-500" />
                    <span>{isAr ? 'مستكشف الفأرة الكامل (12 مستوى)' : 'Mouse Explorer (12 Levels)'}</span>
                  </button>
                )}
                {world.mappedStandaloneGames.includes('jigsaw_12') && (
                  <button
                    type="button"
                    onClick={() => setShowJigsaw12(true)}
                    className="px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Puzzle className="w-4 h-4" />
                    <span>{isAr ? 'مغامرات تركيب الصور (12 مستوى)' : 'Jigsaw Adventures (12 Levels)'}</span>
                  </button>
                )}
                {world.mappedStandaloneGames.includes('workshop_3d') && (
                  <button
                    type="button"
                    onClick={() => setShowWorkshopOrganizer(true)}
                    className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>{isAr ? 'معمل الروبوتات ثلاثي الأبعاد 3D' : '3D Robot Workshop Organizer'}</span>
                  </button>
                )}
                {world.mappedStandaloneGames.includes('age_explorers') && (
                  <button
                    type="button"
                    onClick={() => setActiveAgeGameId('explorers_color_shape')}
                    className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isAr ? 'مغامرة الألوان والأشكال (3–4 سنوات)' : 'Color & Shape Adventure (3–4 yrs)'}</span>
                  </button>
                )}
                {world.mappedStandaloneGames.includes('age_discoverers') && (
                  <button
                    type="button"
                    onClick={() => setActiveAgeGameId('discoverers_mouse_mission')}
                    className="px-5 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isAr ? 'مهمة الفأرة الذكية (4–5 سنوات)' : 'Smart Mouse Mission (4–5 yrs)'}</span>
                  </button>
                )}
                {world.mappedStandaloneGames.includes('age_creators') && (
                  <button
                    type="button"
                    onClick={() => setActiveAgeGameId('creators_robot_coding')}
                    className="px-5 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isAr ? 'مغامرة برمجة الروبوت (5–6 سنوات)' : 'Robot Coding Adventure (5–6 yrs)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN STUDENT PORTAL VIEW: SEVEN EDUCATIONAL WORLDS MAP + CHILD HUB + CHAPTERS
  // =========================================================================
  const smartyWelcomeLine = getSmartyContextualDialogue({
    mode: companionMode,
    language,
    ageGroup: activeChild.ageGroup,
    situation: 'welcome',
    childName: activeChild.name[language],
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Junior Header + Dual-Mode Smarty Companion & Sound Control */}
        <div className="bg-gradient-to-r from-red-600 to-amber-500 rounded-3xl p-8 text-white shadow-2xl mb-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0 p-1">
                <SmartyMascot3D state="greeting" size="lg" language={language} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {isAr ? 'منصة سمارت كودرز جونيور المتكاملة (3-6 سنوات)' : 'SMART CODERS Junior Whole-Child Platform (Ages 3-6)'}
                  </span>
                  <button
                    type="button"
                    data-testid="smarty-companion-mode-toggle"
                    onClick={() =>
                      setCompanionMode((m) => (m === 'guide' ? 'adventure' : 'guide'))
                    }
                    className="bg-black/25 hover:bg-black/40 text-xs font-black px-3 py-1 rounded-full cursor-pointer transition-colors"
                  >
                    {companionMode === 'guide'
                      ? isAr
                        ? '🤖 الوضع: دليل التعلم'
                        : '🤖 Mode: Learning Guide'
                      : isAr
                      ? '🚀 الوضع: رفيق المغامرة'
                      : '🚀 Mode: Adventure Companion'}
                  </button>
                </div>
                <h2 className="text-3xl font-black mt-2">
                  {isAr ? 'خريطة العوالم التعليمية السبعة' : 'The Seven Educational Worlds Map'}
                </h2>
                <p className="text-white/95 text-sm mt-1">{smartyWelcomeLine}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sound Mute Toggle */}
              <button
                type="button"
                data-testid="global-sound-mute-toggle"
                onClick={() => setSoundMuted((m) => !m)}
                className="px-3.5 py-2.5 rounded-xl bg-black/25 hover:bg-black/40 text-white text-xs font-black flex items-center gap-1.5 border border-white/20 cursor-pointer"
              >
                {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{soundMuted ? (isAr ? 'كتم الصوت' : 'Muted') : isAr ? 'الصوت' : 'Audio'}</span>
              </button>

              {/* Daily Streak Counter Badge */}
              <div
                data-testid="junior-daily-streak-badge"
                className="flex items-center gap-2 px-4 py-2 bg-slate-950/90 text-white font-black rounded-xl shadow-lg border border-amber-300/50 tabular-nums"
              >
                <div className="relative flex items-center">
                  <Flame className="w-5 h-5 text-orange-400 fill-orange-500 animate-pulse" />
                  <Star className="w-3 h-3 text-amber-300 fill-amber-300 -ms-1.5 -mt-2" />
                </div>
                <span className="text-xl text-amber-300" data-testid="junior-daily-streak-count">
                  {dailyStreak}
                </span>
                <div className="flex flex-col leading-none text-start">
                  <span className="text-[10px] uppercase tracking-wider text-amber-200 font-bold">
                    {isAr ? 'الحماس اليومي' : 'Daily Streak'}
                  </span>
                  <span className="text-[11px] font-black text-white">
                    {isAr ? (dailyStreak === 1 ? 'يوم متتالي' : 'أيام متتالية') : dailyStreak === 1 ? 'Day Active' : 'Days in a Row'}
                  </span>
                </div>
              </div>

              <div
                data-testid="junior-active-xp"
                className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 font-black rounded-xl shadow-md tabular-nums"
              >
                <Star className="w-5 h-5 fill-current" />
                <span className="text-xl">
                  {activeChild.progress.xpEarned ?? progress.xpEarned ?? progress.starsEarned * 10}
                </span>
                <span className="text-xs">XP</span>
              </div>

              <button
                onClick={() => setShowWorkshopOrganizer(true)}
                data-testid="launch-workshop-btn"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl shadow-lg text-xs flex items-center gap-2 border border-white/25 whitespace-nowrap cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>{isAr ? 'معمل الروبوتات 3D' : '3D Workshop Organizer'}</span>
              </button>
              <button
                onClick={() => setShowMouseExplorer12(true)}
                data-testid="launch-mouse-explorer-btn"
                className="bg-slate-900 hover:bg-black text-white font-black px-4 py-2.5 rounded-xl shadow-lg text-xs flex items-center gap-2 border border-white/20 whitespace-nowrap cursor-pointer"
              >
                <MousePointer className="w-4 h-4 text-red-500" />
                <span>{isAr ? 'مستكشف الفأرة (12)' : 'Mouse Explorer (12L)'}</span>
              </button>
              <button
                onClick={() => setShowJigsaw12(true)}
                data-testid="launch-jigsaw-btn"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-xl shadow-lg text-xs flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Puzzle className="w-4 h-4" />
                <span>{isAr ? 'تركيب الصور (12)' : 'Jigsaw Adv (12L)'}</span>
              </button>
            </div>
          </div>

          {/* Unified Creative Hub Action Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              data-testid="open-creative-studio-hub-btn"
              onClick={() => setActiveHubTab('studio')}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-between gap-3 cursor-pointer transition-all text-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-600 flex items-center justify-center shrink-0 shadow">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">
                    {isAr ? 'الاستوديو الإبداعي والقصص 🎨' : 'Creative & Story Studio 🎨'}
                  </div>
                  <div className="text-[11px] text-white/85">
                    {isAr
                      ? `${platformState.creativeProjects.length} مشاريع محفوظة`
                      : `${platformState.creativeProjects.length} saved projects`}
                  </div>
                </div>
              </div>
              <Play className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              data-testid="open-oasis-hub-btn"
              onClick={() => setActiveHubTab('oasis')}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-between gap-3 cursor-pointer transition-all text-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">
                    {isAr ? 'واحة سمارتي الشخصية 🏡' : 'Personal Smarty Oasis 🏡'}
                  </div>
                  <div className="text-[11px] text-white/85">
                    {isAr
                      ? `${platformState.oasisItems.length} عناصر مزروعة بالنجوم`
                      : `${platformState.oasisItems.length} rewards placed`}
                  </div>
                </div>
              </div>
              <Play className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              data-testid="open-unplugged-hub-btn"
              onClick={() => setActiveHubTab('unplugged')}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-between gap-3 cursor-pointer transition-all text-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center shrink-0 shadow">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">
                    {isAr ? 'الأنشطة المنزلية اللاشاشية ✂️' : 'Printable Unplugged Cards ✂️'}
                  </div>
                  <div className="text-[11px] text-white/85">
                    {isAr
                      ? `${platformState.completedUnpluggedIds.length} أنشطة منجزة بالمنزل`
                      : `${platformState.completedUnpluggedIds.length} home activities done`}
                  </div>
                </div>
              </div>
              <Play className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* 7-Day Consecutive Streak Progress Bar */}
          <div
            data-testid="junior-streak-tracker-strip"
            className="bg-black/20 rounded-2xl px-4 py-3 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-sm shrink-0">
                <Flame className="w-5 h-5 fill-orange-600 text-orange-600" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>
                    {isAr
                      ? `سلسلة النشاط اليومي: ${dailyStreak} ${dailyStreak === 1 ? 'يوم' : 'أيام'} على التوالي!`
                      : `Daily Activity Streak: ${dailyStreak} ${dailyStreak === 1 ? 'Day' : 'Days'} in a Row!`}
                  </span>
                </div>
                <p className="text-[11px] text-white/85">
                  {isAr
                    ? 'ادخل والعب مهمة جديدة كل يوم للحفاظ على شعلة الحماس وزيادة نجومك!'
                    : 'Play a learning mission every day to keep your streak flame burning bright!'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {streakWeekDays.map((d) => (
                <div
                  key={d.dayNum}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 border transition-transform ${
                    d.completed
                      ? 'bg-amber-400 text-slate-950 border-white shadow-sm scale-105'
                      : 'bg-white/10 text-white/70 border-white/15'
                  }`}
                >
                  {d.completed ? (
                    <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-600 shrink-0" />
                  ) : (
                    <Star className="w-3 h-3 text-white/50 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{d.label}</span>
                  {d.isCurrent && <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {toastMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 font-black text-sm flex items-center gap-2">
            <Award className="w-5 h-5 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Multi-Child Profile Switcher */}
        <div
          data-testid="child-profile-switcher"
          className="mb-8 bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isAr
                  ? 'حساب الطفل النشط (كل طفل يُحفظ تقدمه ونقاطه بشكل مستقل):'
                  : 'Active Child Account (Independent Progress & XP per Child):'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'اختر حساب الطفل لفتح العوالم والمهام المناسبة لعمره بدون اختلاط البيانات.'
                  : 'Select a child profile to launch their age-matched worlds with isolated progress.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {childProfiles.map((child) => {
              const isSelected = child.id === activeChild.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  data-testid={`select-child-${child.id}`}
                  onClick={() => handleSelectChild(child.id)}
                  className={`px-4 py-2.5 rounded-2xl border-2 text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-red-600 text-white border-slate-900 dark:border-red-500 shadow-md scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-red-400'
                  }`}
                >
                  <span className="text-xl">{child.avatarEmoji}</span>
                  <div className="text-start">
                    <div>{child.name[language]}</div>
                    <div className="text-[10px] opacity-80 tabular-nums">
                      {child.progress.xpEarned ?? 0} XP · {child.completedStageIds.length}{' '}
                      {isAr ? 'مراحل' : 'stages'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            PRIMARY MAP: SEVEN EDUCATIONAL WORLDS (WITH NESTED CHAPTERS INSIDE)
            ==================================================================== */}
        <div className="mb-12" data-testid="seven-worlds-journey-map">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                {isAr
                  ? 'خريطة التعلم الشاملة • 7 عوالم متكاملة وبداخلها الفصول الثمانية'
                  : 'Whole-Child Journey Map • 7 Worlds Hosting All 8 Chapters'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {isAr
                  ? 'استكشف العوالم التعليمية السبعة'
                  : 'Explore the Seven Educational Worlds'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isAr
                  ? 'اختر عالماً لفتح الفصول المدمجة، مختبرات الرياضيات والعربية والعلوم STEM، وتقييم الإتقان الذكي.'
                  : 'Select any world to open its nested chapters, Math/Arabic/STEM labs, creative studio, and smart quiz.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEVEN_EDUCATIONAL_WORLDS.map((world) => {
              const mastery = computeWorldMasteryPct(
                world,
                childChapterProgress,
                platformState,
                chapterLibraries
              );
              const assessRec = platformState.assessmentsByWorld[world.id];

              return (
                <div
                  key={world.id}
                  data-testid={`world-card-${world.id}`}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`bg-gradient-to-r ${world.gradient} p-5 text-white`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-4xl">{world.icon}</span>
                        <div className="flex flex-col items-end">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tabular-nums">
                            {mastery.pct}% {isAr ? 'إتقان' : 'Mastery'}
                          </span>
                          {assessRec && (
                            <span className="text-[11px] font-bold text-amber-200 mt-1">
                              ✅ {isAr ? `اختبار: ${assessRec.scorePct}%` : `Quiz: ${assessRec.scorePct}%`}
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-xl font-black mt-3">{world.title[language]}</h4>
                      <p className="text-xs text-white/90 mt-0.5">{world.subtitle[language]}</p>
                    </div>

                    <div className="p-5 space-y-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {world.description[language]}
                      </p>

                      {/* Nested Contents Summary Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {world.mappedChapterIds.map((chId) => (
                          <span
                            key={chId}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-200"
                          >
                            📘 {isAr ? `الفصل ${chId}` : `Chapter ${chId}`}
                          </span>
                        ))}
                        {world.specializedModules.map((mod) => (
                          <span
                            key={mod.id}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-xs font-black text-indigo-700 dark:text-indigo-300"
                          >
                            {mod.icon} {mod.title[language]}
                          </span>
                        ))}
                      </div>

                      {/* Mastery Bar */}
                      <div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${world.gradient} rounded-full transition-all`}
                            style={{ width: `${mastery.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center gap-2">
                    <button
                      type="button"
                      data-testid={`enter-world-btn-${world.id}`}
                      onClick={() => {
                        speakChildFriendly(world.subtitle[language], language, soundMuted);
                        setSelectedWorldId(world.id);
                      }}
                      className={`flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r ${world.gradient} text-white font-black text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isAr ? 'دخول العالم والمهام' : 'Enter World Hub'}</span>
                    </button>

                    <button
                      type="button"
                      data-testid={`quick-quiz-btn-${world.id}`}
                      onClick={() => setActiveAssessmentWorld(world)}
                      title={isAr ? 'اختبار تقييم العالم' : 'World Assessment Quiz'}
                      className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 text-xs font-black cursor-pointer shrink-0"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            DIRECT ACCESS: ALL 8 CHAPTERS GAME LIBRARIES (PRESERVED!)
            ==================================================================== */}
        <div className="mb-12" data-testid="eight-chapters-library-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                {isAr
                  ? `الوصول السريع لمكتبة ألعاب الفصول الثمانية (${libraryTotals.totalGames} لعبة • ${libraryTotals.totalLevels} مرحلة)`
                  : `Direct Quick-Access: 8-Chapter Game Library (${libraryTotals.totalGames} Games • ${libraryTotals.totalLevels} Levels)`}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {isAr
                  ? 'خريطة الفصول التعليمية ومكتبة الألعاب التفاعلية'
                  : 'Progressive Chapters & Interactive Game Libraries'}
              </h3>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div className="text-xs">
                <div className="font-black text-slate-900 dark:text-white">
                  {isAr ? 'إجمالي تقدم مكتبة الفصول' : 'Total Chapter Library Progress'}
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-bold tabular-nums">
                  {libraryTotals.completedLevels} / {libraryTotals.totalLevels}{' '}
                  {isAr ? 'مرحلة مكتملة' : 'Levels Completed'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {chapterLibraries.map((chapterLib) => renderChapterCard(chapterLib))}
          </div>
        </div>

        {/* 3 Independent Age-Based Educational Games Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                {isAr ? 'مسارات الألعاب العمرية المستقلة' : 'AGE-BASED EDUCATIONAL GAMES'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {isAr
                  ? 'اختر اللعبة المخصصة لعمر طفلك (3 تجارب تعليمية مختلفة تماماً)'
                  : 'Choose Your Age-Matched Educational Adventure (3 Distinct Games)'}
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr
                ? `الحساب الحالي: ${activeChild.name.ar} — الفئة الموصى بها: ${activeChild.ageGroup} سنوات`
                : `Active Child: ${activeChild.name.en} — Recommended Tier: ${activeChild.ageGroup} yrs`}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ageGames.map((game) => {
              const enabledStages = game.stages.filter((s) => s.isEnabled);
              const completedCount = enabledStages.filter((s) =>
                activeChild.completedStageIds.includes(s.id)
              ).length;
              const isRecommended = activeChild.ageGroup === game.ageGroup;

              return (
                <div
                  key={game.id}
                  data-testid={`age-game-card-${game.id}`}
                  className={`bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-2 flex flex-col justify-between transition-all ${
                    !game.isEnabled
                      ? 'opacity-60 border-slate-200 dark:border-slate-800'
                      : isRecommended
                      ? 'border-red-600 ring-4 ring-red-500/15'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-900">
                      <img
                        src={game.heroImage}
                        alt={game.gameTitle[language]}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2">
                          <span className="bg-slate-900/90 text-white text-xs font-black px-3 py-1 rounded-xl border border-white/20">
                            {isAr ? `العمر: ${game.ageGroup} سنوات` : `Ages: ${game.ageGroup} yrs`}
                          </span>
                          {isRecommended && (
                            <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-xl shadow-md">
                              ⭐ {isAr ? 'مخصص لعمرك' : 'Matched for You'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <div className="text-[11px] font-bold text-amber-300">
                              {game.pathwayTitle[language]}
                            </div>
                            <h4 className="text-lg font-black text-white leading-snug">
                              {game.gameTitle[language]}
                            </h4>
                          </div>
                          <SmartyMascot3D
                            state={isRecommended ? 'cheering' : 'pointing'}
                            size="sm"
                            showBadge={false}
                            language={language}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {game.subtitle[language]}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                          <span>{isAr ? 'المراحل التعليمية:' : 'Learning Stages:'}</span>
                          <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                            {completedCount} / {enabledStages.length} {isAr ? 'مكتمل' : 'Done'}
                          </span>
                        </div>
                        {enabledStages.map((stg) => {
                          const done = activeChild.completedStageIds.includes(stg.id);
                          return (
                            <div
                              key={stg.id}
                              className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300"
                            >
                              <span className="truncate">
                                {done ? '✅ ' : '• '}
                                {stg.title[language]}
                              </span>
                              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0 ms-2">
                                +{stg.xpReward} XP
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    {game.isEnabled ? (
                      <button
                        type="button"
                        data-testid={`launch-age-game-${game.id}`}
                        onClick={() => setActiveAgeGameId(game.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 px-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isAr ? 'ادخل اللعبة الآن' : 'Launch Game Now'}</span>
                      </button>
                    ) : (
                      <div className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs">
                        <Lock className="w-4 h-4" />
                        <span>{isAr ? 'معطلة من لوحة الإدارة' : 'Disabled by Admin'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured 3D Robotics Experience Card */}
        <div className="mb-10 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 flex items-center justify-center shrink-0 p-1">
              <SmartyMascot3D state="pointing" size="md" language={language} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black">
                  {isAr ? 'جديد · تجربة ثلاثية الأبعاد 3D' : 'NEW · 3D INTERACTIVE STEM'}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? '5 مهام هندسية متدرجة (3–6 سنوات)' : '5 Progressive Engineering Missions (Ages 3–6)'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isAr
                  ? 'مهمة تنظيم معمل الروبوتات – SMART WORKSHOP ORGANIZER'
                  : 'SMART WORKSHOP ORGANIZER – 3D Robotics Lab'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
                {isAr
                  ? 'ساعد الروبوت سمارتي في تنظيم أدوات الورشة، التروس الميكانيكية، اللوحات الإلكترونية، أرفف التخزين، ومحطة التجميع قبل بدء المشروع الهندسي!'
                  : 'Help Smarty Robot sort hand tools, mechanical gears, electronic modules, storage shelves, and the robot assembly station inside a realistic 3D workshop!'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowWorkshopOrganizer(true)}
            data-testid="featured-launch-workshop-btn"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg text-sm flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isAr ? 'دخول المعمل ثلاثي الأبعاد' : 'Enter 3D Workshop'}</span>
          </button>
        </div>

        {/* Chapter Games Modal / Drawer (Preserved + Linked to Full Library) */}
        {selectedChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedChapter.title[language]}
                </h3>
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-900 to-cyan-900 text-white p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-sm">
                      {isAr
                        ? 'مكتبة ألعاب الفصل التفاعلية الكاملة (15 مرحلة لكل لعبة)'
                        : 'Full Interactive Chapter Game Library (15 Levels per Game)'}
                    </h4>
                    <p className="text-xs text-cyan-200 mt-0.5">
                      {isAr
                        ? 'افتح خريطة التقدم الكاملة بجميع الألعاب والمراحل والتحديات الخاصة'
                        : 'Open the full progress map with all games, levels, and special challenges'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const chNum = selectedChapter.chapterNumber;
                      setSelectedChapter(null);
                      setActiveLibraryChapterId(chNum);
                    }}
                    className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black py-2.5 px-5 rounded-xl text-xs shrink-0 cursor-pointer"
                  >
                    {isAr ? 'فتح المكتبة الشاملة' : 'Open Full Library'}
                  </button>
                </div>

                {selectedChapter.chapterNumber === 1 && (
                  <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-900 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-red-900 dark:text-red-200 text-sm">
                        {isAr ? 'تجربة مستكشف الفأرة الكاملة (12 مستوى)' : 'Complete Mouse Explorer (12 Levels)'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {isAr ? 'ابدأ رحلة المستكشف الكاملة من المستوى 1 إلى 12' : 'Start the complete explorer journey from level 1 to 12'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChapter(null);
                        setShowMouseExplorer12(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md cursor-pointer"
                    >
                      {isAr ? 'إطلاق اللعبة الكاملة' : 'Launch 12 Levels'}
                    </button>
                  </div>
                )}

                {selectedChapter.chapterNumber === 2 && (
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                        {isAr ? 'مغامرات تركيب الصور (12 مستوى جيسو)' : 'Jigsaw Adventures (12 Levels)'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {isAr ? 'ابدأ استوديو الألغاز والتركيب الكامل' : 'Start the complete jigsaw puzzle studio'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChapter(null);
                        setShowJigsaw12(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md cursor-pointer"
                    >
                      {isAr ? 'إطلاق مغامرات الجيسو' : 'Launch Jigsaw Adv'}
                    </button>
                  </div>
                )}

                {selectedChapter.games.map((game) => (
                  <div key={game.id} className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                      {game.title[language]}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      {game.description[language]}
                    </p>

                    <div className="space-y-3">
                      {game.levels.map((lvl) => (
                        <div key={lvl.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          <span className="font-bold text-sm text-slate-800 dark:text-white">
                            {lvl.title[language]}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedChapter(null);
                              setActiveLevel(lvl);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>{isAr ? 'ابدأ اللعب' : 'Play Level'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
