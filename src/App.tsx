import React, { useState } from 'react';
import {
    fetchNotasFiscais,
    searchProcessNumbers,
    syncToUau,
} from './services/apiService';

import { NotaFiscal, SyncStatus, ProcessDetails } from './types';
import { NotaFiscalCard } from './components/NotaFiscalCard';
import { ProcessCard } from './components/ProcessCard';
import { Notification } from './components/Notification';

const App: React.FC = () => {
    // ------------------------------
    // Estados Notas Fiscais
    // ------------------------------
    const [cnpj, setCnpj] = useState('');
    const [startDateNF, setStartDateNF] = useState('');
    const [endDateNF, setEndDateNF] = useState('');
    const [notas, setNotas] = useState<NotaFiscal[]>([]);
    const [selectedNota, setSelectedNota] = useState<string | null>(null);

    // ------------------------------
    // Estados Processos UAU
    // ------------------------------
    const [empresa, setEmpresa] = useState('225');
    const [obra, setObra] = useState('004');
    const [startDateProcess, setStartDateProcess] = useState('');
    const [endDateProcess, setEndDateProcess] = useState('');
    const [processos, setProcessos] = useState<ProcessDetails[]>([]);

    // ------------------------------
    // Notificações
    // ------------------------------
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // ------------------------------
    // Ações
    // ------------------------------
    const handleFetchNotas = async () => {
        try {
            const data = await fetchNotasFiscais(cnpj, startDateNF, endDateNF);
            setNotas(data);
        } catch (error: any) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    const handleFetchProcessos = async () => {
        try {
            const data = await searchProcessNumbers(
                empresa,
                obra,
                startDateProcess,
                endDateProcess
            );
            setProcessos(data);
        } catch (error: any) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    const handleSelectNota = (id: string) => {
        setSelectedNota(id === selectedNota ? null : id);
    };

    const handleProcessNumberChange = (id: string, value: string) => {
        setNotas((prev) =>
            prev.map((n) => (n.id === id ? { ...n, processNumber: value } : n))
        );
    };

    const handleSync = async (id: string) => {
        setNotas((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, status: SyncStatus.SYNCING } : n
            )
        );
        const nota = notas.find((n) => n.id === id);
        if (!nota?.processNumber) return;

        const processNumber = parseInt(nota.processNumber, 10);
        try {
            const result = await syncToUau(id, processNumber);
            setNotas((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              status: result.success
                                  ? SyncStatus.SYNCED
                                  : SyncStatus.ERROR,
                              errorMessage: result.success
                                  ? ''
                                  : result.message,
                          }
                        : n
                )
            );
            setNotification({
                message: result.message,
                type: result.success ? 'success' : 'error',
            });
        } catch (error: any) {
            setNotas((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              status: SyncStatus.ERROR,
                              errorMessage: error.message,
                          }
                        : n
                )
            );
            setNotification({ message: error.message, type: 'error' });
        }
    };

    // ------------------------------
    // Layout
    // ------------------------------
    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-sky-400">
                    Integração Arquivei ↔ UAU
                </h1>
                <span className="text-gray-400">
                    Painel — {new Date().toLocaleDateString('pt-BR')}
                </span>
            </div>

            {/* DUAS COLUNAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Coluna da esquerda — NOTAS FISCAIS */}
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="font-semibold text-lg mb-3">Consultar Notas Fiscais</h2>

                    {/* Filtros NF */}
                    <div className="flex flex-wrap gap-3 items-center mb-4">
                        <input
                            placeholder="CNPJ"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-40"
                        />

                        <input
                            type="date"
                            value={startDateNF}
                            onChange={(e) => setStartDateNF(e.target.value)}
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />

                        <input
                            type="date"
                            value={endDateNF}
                            onChange={(e) => setEndDateNF(e.target.value)}
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />

                        <button
                            onClick={handleFetchNotas}
                            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 font-semibold rounded px-3 py-2 text-sm whitespace-nowrap"
                        >
                            🔍 Buscar
                        </button>
                    </div>

                    {/* Lista NF (scroll independente) */}
                    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                        {notas.map((nota) => (
                            <NotaFiscalCard
                                key={nota.id}
                                nota={nota}
                                onSync={handleSync}
                                onProcessNumberChange={handleProcessNumberChange}
                                isSelected={selectedNota === nota.id}
                                onSelect={handleSelectNota}
                            />
                        ))}
                    </div>
                </div>

                {/* Coluna da direita — PROCESSOS UAU */}
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="font-semibold text-lg mb-3">Consultar Processos UAU</h2>

                    {/* Filtros Processos */}
                    <div className="flex flex-wrap gap-3 items-center mb-4">

                        <input
                            placeholder="Empresa"
                            value={empresa}
                            onChange={(e) => setEmpresa(e.target.value)}
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-20"
                        />

                        <input
                            placeholder="Obra"
                            value={obra}
                            onChange={(e) => setObra(e.target.value)}
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-20"
                        />

                        <input
                            type="date"
                            value={startDateProcess}
                            onChange={(e) => setStartDateProcess(e.target.value)}
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />

                        <input
                            type="date"
                            value={endDateProcess}
                            onChange={(e) => setEndDateProcess(e.target.value)}
                            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        />

                        <button
                            onClick={handleFetchProcessos}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded px-3 py-2 text-sm whitespace-nowrap"
                        >
                            🔍 Buscar
                        </button>
                    </div>

                    {/* Lista Processos (scroll independente) */}
                    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                        {processos.map((proc) => (
                            <ProcessCard
                                key={proc.processo}
                                processo={proc}
                                onLink={(numero) => {
                                    if (selectedNota) {
                                        setNotas((prev) =>
                                            prev.map((n) =>
                                                n.id === selectedNota
                                                    ? { ...n, processNumber: String(numero) }
                                                    : n
                                            )
                                        );
                                        setNotification({
                                            message: `Nota vinculada ao processo ${numero}`,
                                            type: 'success',
                                        });
                                    } else {
                                        setNotification({
                                            message: 'Selecione uma nota antes de vincular!',
                                            type: 'error',
                                        });
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Notificação */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

        </div>
    );
};

export default App;
