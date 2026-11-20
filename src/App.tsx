/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, Theme, UserRole, EducationalMaterial, StudentProgress, LearningPathway } from './types';
import { initialPrograms, initialMaterials, initialProgress } from './data/initialData';
import { loadStudentProgress, recordDailyStreakActivity, saveStudentProgress } from './data/jigsawLevelsData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { StudentPortal } from './components/StudentPortal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StemLabsView } from './components/StemLabsView';
import { MembershipView } from './components/MembershipView';
import { PathwaysView } from './components/PathwaysView';
import { ExplorerInnovatorView } from './components/ExplorerInnovatorView';
import { JuniorCurriculumView } from './components/JuniorCurriculumView';
import { ParentDashboard } from './components/ParentDashboard';

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [currentRole, setCurrentRole] = useState<UserRole | 'labs' | 'membership' | 'pathways' | 'explorer_innovator'>('home');
  const [selectedPathway, setSelectedPathway] = useState<LearningPathway>('junior');
  const [programs] = useState(initialPrograms);
  const [materials, setMaterials] = useState<EducationalMaterial[]>(initialMaterials);
  const [progress, setProgress] = useState<StudentProgress>(() => loadStudentProgress(initialProgress));

  const handleUpdateProgress = (nextProgress: StudentProgress) => {
    const withStreak = recordDailyStreakActivity(nextProgress);
    setProgress(withStreak);
    saveStudentProgress(withStreak);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleAddMaterial = (mat: EducationalMaterial) => {
    setMaterials([mat, ...materials]);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleSelectPathway = (pathway: LearningPathway) => {
    setSelectedPathway(pathway);
    if (pathway === 'junior') {
      setCurrentRole('student');
    } else {
      setCurrentRole('explorer_innovator');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>
      <Header
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        currentRole={currentRole as UserRole}
        setCurrentRole={setCurrentRole as (role: UserRole) => void}
        onNavigateToLabs={() => setCurrentRole('labs')}
        onNavigateToMembership={() => setCurrentRole('membership')}
        dailyStreak={progress.dailyStreak ?? 1}
      />

      <main className="flex-grow">
        {currentRole === 'home' && (
          <HomeView
            language={language}
            setCurrentRole={setCurrentRole as (role: UserRole) => void}
            programs={programs}
            onNavigateToLabs={() => setCurrentRole('labs')}
            onNavigateToMembership={() => setCurrentRole('membership')}
          />
        )}
        {currentRole === 'pathways' && (
          <PathwaysView language={language} onSelectPathway={handleSelectPathway} />
        )}
        {currentRole === 'explorer_innovator' && (
          <ExplorerInnovatorView
            language={language}
            pathway={selectedPathway}
            onBack={() => setCurrentRole('pathways')}
          />
        )}
        {currentRole === 'labs' && <StemLabsView language={language} />}
        {currentRole === 'membership' && <MembershipView language={language} />}
        {currentRole === 'student' && (
          <JuniorCurriculumView
            language={language}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
        {currentRole === 'parent' && <ParentDashboard language={language} />}
        {currentRole === 'teacher' && (
          <TeacherDashboard
            language={language}
            programs={programs}
            progress={progress}
          />
        )}
        {currentRole === 'admin' && (
          <AdminDashboard
            language={language}
            programs={programs}
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
      </main>

      <Footer language={language} />
    </div>
  );
}
