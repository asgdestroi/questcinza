
import React, { useState, useMemo, useCallback } from 'react';
import { StudentSubmission } from '../types';
import { SCHOOLS_AND_CLASSES } from '../constants'; // Import for available schools

interface AdminPageProps {
  submissions: StudentSubmission[];
  onClearSubmissions: () => void;
  onGoHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ submissions, onClearSubmissions, onGoHome }) => {
  const [filterSchool, setFilterSchool] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [sortBy, setSortBy] = useState<keyof StudentSubmission | null>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const availableSchools = useMemo(() => {
    return SCHOOLS_AND_CLASSES.map(s => s.name).sort((a,b) => a.localeCompare(b));
  }, []);

  const availableClasses = useMemo(() => {
    let classesFromSubmissions = new Set<string>();
    if (filterSchool) {
        const schoolData = SCHOOLS_AND_CLASSES.find(s => s.name === filterSchool);
        if (schoolData) {
            schoolData.classes.forEach(c => classesFromSubmissions.add(c));
        }
    } else {
        // If no school is filtered, show all classes from all schools that have submissions
        // Or, more simply, show all possible classes from all defined schools
        SCHOOLS_AND_CLASSES.forEach(school => {
            school.classes.forEach(c => classesFromSubmissions.add(c));
        });
    }
    return Array.from(classesFromSubmissions).sort((a,b) => a.localeCompare(b));
  }, [filterSchool]);


  const filteredAndSortedSubmissions = useMemo(() => {
    let result = [...submissions]; 
    if (filterSchool) {
      result = result.filter(s => s.school === filterSchool);
    }
    if (filterClass) {
      result = result.filter(s => s.class === filterClass);
    }

    if (sortBy) {
      result.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'date') {
            valA = new Date(a.date).getTime();
            valB = new Date(b.date).getTime();
        } else if (sortBy === 'score') {
            valA = (a.score / a.totalQuestions) * 10;
            valB = (b.score / b.totalQuestions) * 10;
        }


        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return result;
  }, [submissions, filterSchool, filterClass, sortBy, sortOrder]);

  const handleSort = (key: keyof StudentSubmission) => {
    if (sortBy === key) {
      setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };
  
  const getSortIndicator = (key: keyof StudentSubmission) => {
    if (sortBy === key) {
      return sortOrder === 'asc' ? '▲' : '▼';
    }
    return '';
  };

  const escapeCSVField = (field: string | number): string => {
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const handleExportCSV = useCallback(() => {
    if (filteredAndSortedSubmissions.length === 0) {
      alert("Não há dados para exportar com os filtros selecionados.");
      return;
    }

    const headers = ["Nome", "Escola", "Turma", "Data", "Respostas", "Nota (0-10)"];
    const csvRows = [
      headers.join(','),
      ...filteredAndSortedSubmissions.map(sub => [
        escapeCSVField(sub.name),
        escapeCSVField(sub.school),
        escapeCSVField(sub.class),
        escapeCSVField(new Date(sub.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })),
        escapeCSVField(sub.formattedAnswers),
        escapeCSVField(((sub.score / sub.totalQuestions) * 10).toFixed(1))
      ].join(','))
    ];
    
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      
      let fileNameBase = 'resultados_alunos';
      if (filterSchool && filterClass) {
        fileNameBase = `resultados_escola_${filterSchool.replace(/\s+/g, '_')}_turma_${filterClass.replace(/\s+/g, '_')}`;
      } else if (filterSchool) {
        fileNameBase = `resultados_escola_${filterSchool.replace(/\s+/g, '_')}`;
      } else if (filterClass) {
        fileNameBase = `resultados_turma_${filterClass.replace(/\s+/g, '_')}`;
      }
      link.setAttribute("download", `${fileNameBase}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [filteredAndSortedSubmissions, filterSchool, filterClass]);


  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-sky-400">Resultados dos Alunos</h1>
          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md transition-colors"
          >
            Página Inicial
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-slate-800 p-4 rounded-lg shadow-md">
            <div>
                <label htmlFor="filterSchool" className="block text-sm font-medium text-gray-300 mb-1">Filtrar por Escola:</label>
                <select
                    id="filterSchool"
                    value={filterSchool}
                    onChange={(e) => {
                        setFilterSchool(e.target.value);
                        setFilterClass(''); // Reset class filter when school changes
                    }}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-sky-500 focus:border-sky-500"
                    aria-label="Filtrar resultados por escola"
                >
                    <option value="">Todas as Escolas</option>
                    {availableSchools.map(sName => <option key={sName} value={sName}>{sName}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="filterClass" className="block text-sm font-medium text-gray-300 mb-1">Filtrar por Turma:</label>
                <select
                    id="filterClass"
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-sky-500 focus:border-sky-500"
                    aria-label="Filtrar resultados por turma"
                    disabled={!filterSchool && availableClasses.length === 0} // Disable if no school selected and no classes to show
                >
                    <option value="">{filterSchool ? "Todas as Turmas da Escola" : "Todas as Turmas"}</option>
                    {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-end sm:justify-end gap-2 mt-4 sm:mt-0">
                <button
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors whitespace-nowrap"
                    aria-label="Exportar resultados visíveis para CSV"
                >
                    Exportar CSV
                </button>
                <button
                    onClick={onClearSubmissions}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors whitespace-nowrap"
                    aria-label="Limpar todos os resultados permanentemente"
                >
                    Limpar Tudo
                </button>
            </div>
        </div>

        {filteredAndSortedSubmissions.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-xl">Nenhum resultado encontrado para os filtros selecionados.</p>
        ) : (
          <div className="overflow-x-auto bg-slate-800 shadow-xl rounded-lg">
            <table className="min-w-full divide-y divide-slate-700 admin-table" aria-live="polite">
              <caption className="sr-only">Tabela de resultados dos alunos com nome, escola, turma, data, respostas e nota.</caption>
              <thead className="bg-slate-700">
                <tr>
                  <th scope="col" onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600">Nome {getSortIndicator('name')}</th>
                  <th scope="col" onClick={() => handleSort('school')} className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600">Escola {getSortIndicator('school')}</th>
                  <th scope="col" onClick={() => handleSort('class')} className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600">Turma {getSortIndicator('class')}</th>
                  <th scope="col" onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600">Data {getSortIndicator('date')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Respostas</th>
                  <th scope="col" onClick={() => handleSort('score')} className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600">Nota (0-10) {getSortIndicator('score')}</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {filteredAndSortedSubmissions.map((sub, index) => (
                  <tr key={sub.id} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'} hover:bg-slate-700 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{sub.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sub.school}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sub.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(sub.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sub.formattedAnswers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">{((sub.score / sub.totalQuestions) * 10).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;