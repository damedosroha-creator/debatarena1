export type SubjectCategory = 'MATEMATIKA' | 'FISIKA' | 'BAHASA INGGRIS' | 'KIMIA';

export type QuestionStatus = 'unopened' | 'active' | 'revealed' | 'correct' | 'wrong';

export interface Question {
  id: number;
  category: SubjectCategory;
  difficulty: 'Menengah' | 'Tinggi' | 'Olimpiade';
  topic: string;
  questionText: string;
  ttsNarration: string;
  correctAnswer: string;
  alternativeAnswers?: string[];
  explanation: string;
  unit?: string;
  initialPauseSeconds: number;
}

export interface QuestionRecord {
  questionId: number;
  status: QuestionStatus;
  userAnswerStatus?: 'correct' | 'wrong';
  timeSpentSeconds: number;
  timestamp?: number;
}

export interface AppSettings {
  ttsVoiceURI: string | null;
  ttsRate: number; // 0.75, 0.9, 1.0, 1.1, 1.25, 1.5
  englishVoiceURI: string | null;
  englishTtsMode: 'english' | 'indonesia';
  initialThinkingSeconds: number; // default 5
  soundFxVolume: number; // 0 to 1
  soundFxEnabled: boolean;
  shuffleQuestions: boolean;
}
