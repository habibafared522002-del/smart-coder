import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Lightbulb,
  Award,
  Star,
  RotateCcw,
} from 'lucide-react';
import { JuniorAgeGroup, Language } from '../types';
import {
  EducationalWorldDefinition,
  WORLD_ASSESSMENT_QUESTIONS,
  WorldAssessmentRecord,
  getSmartyContextualDialogue,
  speakChildFriendly,
} from '../data/sevenWorldsPlatformData';
import { SmartyMascot3D, SmartyGameplayState } from './SmartyMascot3D';
import { playSound } from '../utils/soundEffects';

interface WorldAssessmentQuizProps {
  world: EducationalWorldDefinition;
  language: Language;
  ageGroup: JuniorAgeGroup;
  childName: string;
  soundMuted: boolean;
  previousRecord?: WorldAssessmentRecord;
  onSaveAssessment: (record: WorldAssessmentRecord) => void;
  onBack: () => void;
}

export const WorldAssessmentQuiz: React.FC<WorldAssessmentQuizProps> = ({
  world,
  language,
  ageGroup,
  childName,
  soundMuted,
  previousRecord,
  onSaveAssessment,
  onBack,
}) => {
  const isAr = language === 'ar';

  const questions = useMemo(() => {
    const filtered = WORLD_ASSESSMENT_QUESTIONS.filter((q) => q.worldId === world.id);
    return filtered.length > 0 ? filtered : WORLD_ASSESSMENT_QUESTIONS.slice(0, 2);
  }, [world.id]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submittedThisQ, setSubmittedThisQ] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savedRecord, setSavedRecord] = useState<WorldAssessmentRecord | null>(null);
  const [robotState, setRobotState] = useState<SmartyGameplayState>('pointing');

  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (optionId: string) => {
    // Prevent accidental duplicate submissions on same question
    if (submittedThisQ) return;
    playSound('click');
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || submittedThisQ || !currentQuestion) return;
    setSubmittedThisQ(true);

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    if (isCorrect) {
      playSound('success');
      setCorrectCount((prev) => prev + 1);
      setRobotState('cheering');
    } else {
      playSound('error');
      setShowHint(true);
      setRobotState('retry');
    }
  };

  const handleNextOrFinish = () => {
    if (!submittedThisQ) return;

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setSubmittedThisQ(false);
      setShowHint(false);
      setRobotState('pointing');
    } else {
      const scorePct = Math.round((correctCount / questions.length) * 100);
      const masteryStatus: WorldAssessmentRecord['masteryStatus'] =
        scorePct >= 80 ? 'mastered' : scorePct >= 50 ? 'proficient' : 'developing';
      const xpAwarded = previousRecord ? 0 : Math.max(15, Math.round((scorePct / 100) * 40));

      const record: WorldAssessmentRecord = {
        worldId: world.id,
        completedAt: new Date().toISOString(),
        scorePct,
        correctCount,
        totalQuestions: questions.length,
        xpAwarded,
        masteryStatus,
      };
      setSavedRecord(record);
      setQuizFinished(true);
      setRobotState('victory');
      playSound('win');
      onSaveAssessment(record);
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setSubmittedThisQ(false);
    setCorrectCount(0);
    setShowHint(false);
    setQuizFinished(false);
    setSavedRecord(null);
    setRobotState('pointing');
  };

  if (quizFinished && savedRecord) {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        data-testid="world-quiz-result"
        className="max-w-2xl mx-auto my-8 bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-emerald-400 shadow-2xl text-center"
      >
        <div className="flex justify-center mb-4">
          <SmartyMascot3D state="victory" size="lg" language={language} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
          {isAr ? `نتيجة تقييم ${world.title.ar}` : `${world.title.en} Assessment Result`}
        </h3>

        <div className="my-6 inline-flex items-center gap-4 px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums">
          <Award className="w-8 h-8 text-amber-500" />
          <div className="text-start">
            <div className="text-3xl font-black text-slate-900 dark:text-white" data-testid="quiz-final-score">
              {savedRecord.scorePct}%
            </div>
            <div className="text-xs font-bold text-slate-500">
              {savedRecord.correctCount} / {savedRecord.totalQuestions}{' '}
              {isAr ? 'إجابات صحيحة' : 'Correct Answers'}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          {savedRecord.xpAwarded > 0
            ? isAr
              ? `رائع يا ${childName}! ربحت +${savedRecord.xpAwarded} XP وتم تحديث تقرير التقدم تلقائياً.`
              : `Awesome ${childName}! Earned +${savedRecord.xpAwarded} XP and updated mastery reports.`
            : isAr
            ? 'تم تحديث نتيجة تقييمك في لوحة ولي الأمر والمعلم!'
            : 'Updated your mastery evaluation in Parent & Teacher reports!'}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleRetake}
            className="px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة التقييم' : 'Retake Assessment'}</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            data-testid="quiz-done-back-btn"
            className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg cursor-pointer"
          >
            {isAr ? 'العودة لخريطة العالم' : 'Back to World Hub'}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;
  const isCorrectSelected = selectedOptionId === currentQuestion.correctOptionId;

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      data-testid="world-assessment-quiz"
      className="max-w-3xl mx-auto py-6 px-4"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black flex items-center gap-2 cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'رجوع' : 'Back'}</span>
        </button>

        <div className="text-xs font-black text-slate-600 dark:text-slate-300 tabular-nums">
          {isAr
            ? `السؤال ${currentIdx + 1} من ${questions.length}`
            : `Question ${currentIdx + 1} of ${questions.length}`}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        {/* Smarty Coach Prompt */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <SmartyMascot3D state={robotState} size="sm" language={language} />
          <div className="flex-1">
            <div className="text-[11px] font-black text-cyan-600 dark:text-cyan-400">
              {currentQuestion.skillTag[language]}
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {currentQuestion.prompt[language]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => speakChildFriendly(currentQuestion.audioScript[language], language, soundMuted)}
            className="p-3 rounded-xl bg-amber-400 text-slate-950 shrink-0 cursor-pointer"
            title={isAr ? 'استمع للسؤال' : 'Listen'}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Cue */}
        <div className="py-5 rounded-2xl bg-indigo-950/90 text-white text-center text-4xl font-black">
          {currentQuestion.visualCue}
        </div>

        {/* Interactive Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const showOutcome = submittedThisQ;
            const isRightAnswer = opt.id === currentQuestion.correctOptionId;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={submittedThisQ}
                data-testid={`quiz-option-${opt.id}`}
                data-selected={isSelected ? 'true' : 'false'}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                  showOutcome && isRightAnswer
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                    : showOutcome && isSelected && !isRightAnswer
                    ? 'bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-200'
                    : isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 scale-[1.03] shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                }`}
              >
                <span className="text-4xl">{opt.icon}</span>
                <span className="text-sm font-black text-slate-900 dark:text-white text-center">
                  {opt.label[language]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback / Hint */}
        {showHint && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{currentQuestion.hint[language]}</span>
          </div>
        )}

        {submittedThisQ && (
          <div
            data-testid="quiz-answer-feedback"
            className={`p-4 rounded-2xl font-black text-sm text-center ${
              isCorrectSelected
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
            }`}
          >
            {isCorrectSelected
              ? isAr
                ? 'إجابة صحيحة وذكية! 🌟'
                : 'Spot-on answer! 🌟'
              : isAr
              ? 'محاولة رائعة! تعلّمنا الإجابة الصحيحة الآن وسنواصل بنجاح.'
              : 'Brave try! Now we spotted the right answer—let us continue!'}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="text-xs font-bold text-slate-500 hover:text-amber-500 cursor-pointer"
          >
            {isAr ? 'أحتاج تلميحاً 💡' : 'Need a hint 💡'}
          </button>

          {!submittedThisQ ? (
            <button
              type="button"
              disabled={!selectedOptionId}
              data-testid="quiz-submit-answer-btn"
              onClick={handleSubmitAnswer}
              className="px-7 py-3 rounded-2xl bg-cyan-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black text-sm shadow cursor-pointer"
            >
              {isAr ? 'تأكيد الإجابة' : 'Check Answer'}
            </button>
          ) : (
            <button
              type="button"
              data-testid="quiz-next-question-btn"
              onClick={handleNextOrFinish}
              className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow cursor-pointer"
            >
              {currentIdx + 1 < questions.length
                ? isAr
                  ? 'السؤال التالي'
                  : 'Next Question'
                : isAr
                ? 'عرض النتيجة النهائية'
                : 'Finish & See Score'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
