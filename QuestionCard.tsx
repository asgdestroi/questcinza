
import React, { useState, useEffect } from 'react';
import { Question, AnswerOption } from '../types';
import { shuffleArray } from '../utils';

interface QuestionCardProps {
  question: Question;
  onAnswerSelect: (questionId: string, answerId: string) => void;
  selectedAnswerId?: string;
  questionNumber: number;
  totalQuestions: number;
}

const FALLBACK_PLACEHOLDER_URL = `https://placehold.co/600x300/718096/E2E8F0/png?text=Falha+ao+carregar+imagem`;
const FALLBACK_ALT_TEXT = 'Imagem de fallback: falha ao carregar.';

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerSelect, selectedAnswerId, questionNumber, totalQuestions }) => {
  const [shuffledOptions, setShuffledOptions] = useState<AnswerOption[]>([]);
  const [imageDetails, setImageDetails] = useState<{src: string; alt: string; key: number}>({src: '', alt: '', key: 0});
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);

  useEffect(() => {
    setShuffledOptions(shuffleArray(question.options));
  }, [question]);

  useEffect(() => {
    let primaryUrl: string;
    let primaryAltText: string;

    if (question.imageUrlSeed && (question.imageUrlSeed.startsWith('http://') || question.imageUrlSeed.startsWith('https://'))) {
      primaryUrl = question.imageUrlSeed;
      primaryAltText = `Ilustração para: ${question.text.substring(0, 40)}...`;
    } else {
      const seedText = question.imageUrlSeed
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      primaryUrl = `https://placehold.co/600x300/4A5568/E2E8F0/png?text=Ilustração%0A${encodeURIComponent(seedText)}`;
      primaryAltText = `Ilustração placeholder: ${seedText}`;
    }
    setImageDetails({src: primaryUrl, alt: primaryAltText, key: Date.now()});
    setImageLoadFailed(false); // Reset on question change
  }, [question]);

  const handleImageError = () => {
    if (imageDetails.src !== FALLBACK_PLACEHOLDER_URL) { // If current src is not already the fallback
      setImageDetails({src: FALLBACK_PLACEHOLDER_URL, alt: FALLBACK_ALT_TEXT, key: Date.now() + 1});
    } else { // Fallback also failed
      setImageLoadFailed(true);
    }
  };

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-xl w-full">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-sky-300">Questão {questionNumber} de {totalQuestions}</h2>
        <p className="mt-2 text-lg text-gray-200">{question.text}</p>
      </div>
      
      <div className="w-full h-48 md:h-64 rounded-lg mb-6 shadow-md border-2 border-slate-700 bg-slate-700 flex items-center justify-center overflow-hidden">
        {imageLoadFailed ? (
          <div className="text-center p-2">
            <p className="text-slate-300 text-sm font-semibold">Imagem Indisponível</p>
            <p className="text-slate-400 text-xs mt-1">{imageDetails.alt}</p>
          </div>
        ) : (
          imageDetails.src && (
            <img 
              key={imageDetails.key}
              src={imageDetails.src} 
              alt={imageDetails.alt} 
              className="max-w-full max-h-full object-contain"
              onError={handleImageError}
            />
          )
        )}
      </div>

      <div className="space-y-4">
        {shuffledOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onAnswerSelect(question.id, option.id)}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ease-in-out
              transform focus:outline-none focus:ring-2 focus:ring-opacity-75
              ${selectedAnswerId === option.id 
                ? 'bg-sky-500 border-sky-400 text-white shadow-lg scale-105' 
                : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 text-gray-300 hover:text-white'}
            `}
            aria-pressed={selectedAnswerId === option.id}
          >
            <span className="font-medium">{option.id.toUpperCase()}.</span> {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;