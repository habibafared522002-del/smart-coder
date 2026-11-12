export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type UserRole = 'home' | 'student' | 'teacher' | 'admin' | 'parent';
export type JuniorAgeGroup = '3-4' | '4-5' | '5-6';

export type MaterialType = 'pdf' | 'image' | 'video' | 'audio' | 'presentation' | 'worksheet' | 'guide' | 'link';

export interface EducationalMaterial {
  id: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  type: MaterialType;
  ageGroup: string;
  programId: string;
  levelId: string;
  unitId: string;
  lessonIds: string[];
  language: 'ar' | 'en' | 'bilingual';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  uploadDate: string;
  isPublished: boolean;
}

export type LearningPathway = 'junior' | 'explorer' | 'innovator';

export interface Activity {
  id: string;
  title: { ar: string; en: string };
  type: 'robot_maze' | 'sequencing' | 'matching' | 'debugging' | 'drag_drop' | 'safe_choices' | 'drag_drop_shapes' | 'compass_game' | 'puzzle_studio' | 'mouse_explorer' | 'code_builder';
  config?: any;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: { ar: string; en: string };
  summary: { ar: string; en: string };
  objectives: { ar: string[]; en: string[] };
  explanation: { ar: string; en: string };
  videoUrl?: string;
  audioNarration?: string;
  materialIds: string[];
  activities: Activity[];
  durationMinutes: number;
  starsReward: number;
  isPublished: boolean;
}

export interface Unit {
  id: string;
  levelId: string;
  code: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string;
  lessons: Lesson[];
}

export interface Level {
  id: string;
  programId: string;
  name: { ar: string; en: string };
  ageRange: string;
  description: { ar: string; en: string };
  units: Unit[];
}

export interface Program {
  id: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  description: { ar: string; en: string };
  targetAge: string;
  icon: string;
  levels: Level[];
}

export interface StudentProgress {
  studentId: string;
  completedLessonIds: string[];
  completedActivityIds: string[];
  starsEarned: number;
  xpEarned?: number;
  badges: string[];
  lastActiveDate: string;
  selectedAgeGroup?: JuniorAgeGroup;
  unlockedJigsawByAge?: Record<JuniorAgeGroup, number>;
  enjoymentRatings?: Record<string, 'loved' | 'okay'>;
}

export interface Teacher {
  id: string;
  name: { ar: string; en: string };
  email: string;
  classes: string[];
  assignedLevels: string[];
}
