
import React, { useState, useEffect, useCallback } from 'react';
import { Question, StudentAnswers } from '../types';
import { QUIZ_QUESTIONS } from '../constants';
import { shuffleArray } from '../utils';
import QuestionCard from './QuestionCard';

interface QuizPageProps {
  onQuizComplete: (answers: StudentAnswers) => void;
  studentName: string;
}

const QuizPage: React.FC<QuizPageProps> = ({ onQuizComplete, studentName }) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<StudentAnswers>({});

  useEffect(() => {
    setShuffledQuestions(shuffleArray(QUIZ_QUESTIONS));
  }, []);

  const handleAnswerSelect = useCallback((questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  }, []);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Optional: Check if all questions are answered
    // const allAnswered = shuffledQuestions.every(q => selectedAnswers[q.id]);
    // if (!allAnswered) {
    //   alert("Por favor, responda todas as questões antes de finalizar.");
    //   return;
    // }
    onQuizComplete(selectedAnswers);
  };

  if (shuffledQuestions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900"><p className="text-xl">Carregando questionário...</p></div>;
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4 md:p-6 text-white">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-sky-400">Olá, {studentName}!</h1>
            <p className="text-slate-300">Responda às seguintes questões:</p>
        </div>

        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswerSelect={handleAnswerSelect}
          selectedAnswerId={selectedAnswers[currentQuestion.id]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={shuffledQuestions.length}
        />

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          <p className="text-sm text-slate-400">{currentQuestionIndex + 1} / {shuffledQuestions.length}</p>

          {currentQuestionIndex === shuffledQuestions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition-colors transform hover:scale-105"
            >
              Finalizar Questionário
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md transition-colors"
            >
              Próxima
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
    