
import React from 'react';

interface ResultsPageProps {
  score: number;
  totalQuestions: number;
  studentName: string;
  onRestartQuiz: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ score, totalQuestions, studentName, onRestartQuiz }) => {
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  // Score from 0 to 10
  const scoreOutOfTen = totalQuestions > 0 ? (score / totalQuestions) * 10 : 0;


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white text-center">
      <div className="bg-slate-800 p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-400 mb-4">Parabéns, {studentName}!</h1>
        <p className="text-lg text-gray-300 mb-6">Você completou o questionário.</p>
        
        <div className="mb-8">
          <p className="text-xl text-gray-200">Sua pontuação:</p>
          <p className="text-5xl md:text-6xl font-extrabold text-green-400 my-2">
            {scoreOutOfTen.toFixed(1)} / 10
          </p>
          <p className="text-md text-gray-400">({score} de {totalQuestions} respostas corretas - {percentage.toFixed(0)}%)</p>
        </div>

        <button
          onClick={onRestartQuiz}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
        >
          Responder Novamente
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
    