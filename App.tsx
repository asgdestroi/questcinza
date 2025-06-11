
import React, { useState, useEffect, useCallback } from 'react';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import ResultsPage from './components/ResultsPage';
import AdminPage from './components/AdminPage';
import { AppView, StudentInfo, StudentAnswers, Question, StudentSubmission } from './types';
import { QUIZ_QUESTIONS, LOCAL_STORAGE_SUBMISSIONS_KEY } from './constants';

const ADMIN_PASSWORD = "Profandre123";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Home);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [totalQuestionsInQuiz, setTotalQuestionsInQuiz] = useState(0);
  const [allSubmissions, setAllSubmissions] = useState<StudentSubmission[]>([]);

  useEffect(() => {
    const storedSubmissions = localStorage.getItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
    if (storedSubmissions) {
      try {
        const parsedSubmissions = JSON.parse(storedSubmissions) as StudentSubmission[];
        if (Array.isArray(parsedSubmissions)) {
            const submissionsWithSchool = parsedSubmissions.map(sub => ({
                ...sub,
                school: sub.school || 'Não especificada' 
            }));
            setAllSubmissions(submissionsWithSchool);
        } else {
            setAllSubmissions([]);
            localStorage.removeItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
        }
      } catch (error) {
        console.error("Failed to parse submissions from localStorage", error);
        setAllSubmissions([]);
        localStorage.removeItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
      }
    }
  }, []);

  const saveSubmissionsToLocalStorage = (submissions: StudentSubmission[]) => {
    localStorage.setItem(LOCAL_STORAGE_SUBMISSIONS_KEY, JSON.stringify(submissions));
  };

  const handleStartQuiz = useCallback((info: StudentInfo) => {
    setStudentInfo(info);
    setCurrentView(AppView.Quiz);
  }, []);

  const handleQuizComplete = useCallback((answers: StudentAnswers) => {
    if (!studentInfo) return;

    let score = 0;
    const originalQuestionsById: Record<string, Question> = QUIZ_QUESTIONS.reduce((acc, q) => {
        acc[q.id] = q;
        return acc;
    }, {} as Record<string, Question>);

    for (const questionId in answers) {
      if (originalQuestionsById[questionId] && originalQuestionsById[questionId].correctAnswerId === answers[questionId]) {
        score++;
      }
    }
    
    const formattedAnswers = QUIZ_QUESTIONS.map((q) => {
        const originalQuestionIndex = QUIZ_QUESTIONS.findIndex(origQ => origQ.id === q.id);
        const questionNumberForDisplay = originalQuestionIndex + 1;
        const studentAnswer = answers[q.id];
        return `${questionNumberForDisplay}.${studentAnswer || '-'}`;
    }).sort((a,b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0])).join(', ');


    setCurrentScore(score);
    setTotalQuestionsInQuiz(QUIZ_QUESTIONS.length);
    
    const newSubmission: StudentSubmission = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      ...studentInfo,
      answers,
      score,
      totalQuestions: QUIZ_QUESTIONS.length,
      formattedAnswers,
    };

    const updatedSubmissions = [...allSubmissions, newSubmission];
    setAllSubmissions(updatedSubmissions);
    saveSubmissionsToLocalStorage(updatedSubmissions);

    setCurrentView(AppView.StudentResults);
  }, [studentInfo, allSubmissions]);

  const handleRestartQuiz = useCallback(() => {
    setStudentInfo(null);
    setCurrentScore(0);
    setTotalQuestionsInQuiz(0);
    setCurrentView(AppView.Home);
  }, []);

  const handleAdminLoginAttempt = useCallback((password: string) => {
    console.log("Tentativa de login do administrador com a senha fornecida.");
    if (password === ADMIN_PASSWORD) {
        console.log("Senha correta. Navegando para a visão do administrador.");
        setCurrentView(AppView.Admin);
    } else {
        console.log("Senha incorreta fornecida:", password);
        alert("Senha incorreta!");
    }
  }, []);
  
  const handleClearSubmissions = useCallback(() => {
    if (window.confirm("Tem certeza que deseja apagar todos os resultados? Esta ação não pode ser desfeita.")) {
        setAllSubmissions([]);
        localStorage.removeItem(LOCAL_STORAGE_SUBMISSIONS_KEY);
    }
  }, []);


  const renderView = () => {
    switch (currentView) {
      case AppView.Quiz:
        return studentInfo ? <QuizPage onQuizComplete={handleQuizComplete} studentName={studentInfo.name} /> : <HomePage onStartQuiz={handleStartQuiz} onAttemptAdminLogin={handleAdminLoginAttempt} />;
      case AppView.StudentResults:
        return studentInfo ? <ResultsPage score={currentScore} totalQuestions={totalQuestionsInQuiz} studentName={studentInfo.name} onRestartQuiz={handleRestartQuiz} /> : <HomePage onStartQuiz={handleStartQuiz} onAttemptAdminLogin={handleAdminLoginAttempt} />;
      case AppView.Admin:
        return <AdminPage submissions={allSubmissions} onClearSubmissions={handleClearSubmissions} onGoHome={handleRestartQuiz} />;
      case AppView.Home:
      default:
        return <HomePage onStartQuiz={handleStartQuiz} onAttemptAdminLogin={handleAdminLoginAttempt} />;
    }
  };

  return <div className="App">{renderView()}</div>;
};

export default App;
