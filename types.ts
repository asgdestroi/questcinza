
export interface AnswerOption {
  id: string; // e.g., 'a', 'b', 'c', 'd', 'e'
  text: string;
}

export interface Question {
  id: string; // e.g., 'q1', 'q2'
  text: string;
  options: AnswerOption[];
  correctAnswerId: string;
  imageUrlSeed: string; // Used for picsum.photos to have a unique image per question
}

export interface StudentInfo {
  name: string;
  school: string; // Nome da Escola
  class: string; // Turma
  date: string;
}

export interface StudentAnswers {
  [questionId: string]: string; // e.g., { "q1": "c", "q2": "a" }
}

export interface StudentSubmission extends StudentInfo {
  id: string; // Unique ID for the submission
  answers: StudentAnswers;
  score: number;
  totalQuestions: number;
  formattedAnswers: string; // e.g., "1.c, 2.a, ..."
}

export enum AppView {
  Home = 'HOME',
  Quiz = 'QUIZ',
  StudentResults = 'STUDENT_RESULTS',
  Admin = 'ADMIN',
}