import React, { useState, useMemo } from 'react';
import { StudentInfo } from '../types';
import { SCHOOLS_AND_CLASSES } from '../constants';

interface HomePageProps {
  onStartQuiz: (studentInfo: StudentInfo) => void;
  onAttemptAdminLogin: (password: string) => void; // Renomeado e alterada a assinatura
}

const HomePage: React.FC<HomePageProps> = ({ onStartQuiz, onAttemptAdminLogin }) => {
  const [name, setName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [studentClass, setStudentClass] = useState(''); // "turma"
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [error, setError] = useState('');

  const [showAdminPasswordInput, setShowAdminPasswordInput] = useState(false);
  const [adminPasswordAttempt, setAdminPasswordAttempt] = useState('');

  const availableClasses = useMemo(() => {
    if (!selectedSchool) return [];
    const schoolData = SCHOOLS_AND_CLASSES.find(s => s.name === selectedSchool);
    return schoolData ? schoolData.classes : [];
  }, [selectedSchool]);

  const handleSubmitStudentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedSchool || !studentClass || !date) {
      setError('Por favor, preencha todos os campos, incluindo a seleção da escola e da turma.');
      return;
    }
    setError('');
    onStartQuiz({ name: name.trim(), school: selectedSchool, class: studentClass, date });
  };

  const handleAdminAccessClick = () => {
    setShowAdminPasswordInput(!showAdminPasswordInput);
    setAdminPasswordAttempt(''); // Limpa a tentativa anterior ao mostrar/ocultar
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAttemptAdminLogin(adminPasswordAttempt);
    // Não limpar a senha aqui, para que o usuário veja o que digitou em caso de erro.
    // A navegação ou o alerta de erro virão do App.tsx.
    // Se o login for bem-sucedido, a view mudará e este componente será desmontado ou a input sumirá.
    // Se falhar, o usuário pode tentar novamente.
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-sky-400">Questionário: Cidade Cinza</h1>
        <form onSubmit={handleSubmitStudentForm} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome Completo:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              placeholder="Seu nome"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-300 mb-1">Escola:</label>
            <select
              id="school"
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setStudentClass(''); 
              }}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              aria-required="true"
            >
              <option value="" disabled>Selecione sua escola</option>
              {SCHOOLS_AND_CLASSES.map(school => (
                <option key={school.name} value={school.name}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="studentClass" className="block text-sm font-medium text-gray-300 mb-1">Turma:</label>
            <select
              id="studentClass"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              aria-required="true"
              disabled={!selectedSchool}
            >
              <option value="" disabled>
                {selectedSchool ? "Selecione sua turma" : "Selecione uma escola primeiro"}
              </option>
              {availableClasses.map(className => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Data:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              aria-required="true"
            />
          </div>
          {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
          >
            Iniciar Questionário
          </button>
        </form>
      </div>

      <footer className="mt-12 text-center w-full max-w-md">
        <button
          onClick={handleAdminAccessClick}
          className="text-sm text-slate-400 hover:text-sky-400 underline transition-colors mb-4"
          aria-label={showAdminPasswordInput ? "Cancelar Acesso Professor" : "Acessar área do professor"}
          aria-expanded={showAdminPasswordInput}
        >
          {showAdminPasswordInput ? "Cancelar Acesso Professor" : "Acesso Professor"}
        </button>

        {showAdminPasswordInput && (
          <form onSubmit={handleAdminLoginSubmit} className="mt-4 p-6 bg-slate-800 rounded-lg shadow-md space-y-4">
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-300 mb-1">Senha do Professor:</label>
              <input
                type="password"
                id="adminPassword"
                value={adminPasswordAttempt}
                onChange={(e) => setAdminPasswordAttempt(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                placeholder="Digite a senha"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              Entrar
            </button>
          </form>
        )}
      </footer>
    </div>
  );
};

export default HomePage;
