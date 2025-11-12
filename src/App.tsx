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
    const [cnpj, setCnpj] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [empresa, setEmpresa] = useState('225');
    const [obra, setObra] = useState('004');

    const [notas, setNotas] = useState<NotaFiscal[]>([]);
    const [processos, setProcessos] = useState<ProcessDetails[]>([]);
    const [selectedNota, setSelectedNota] = useState<string | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    const handleFetchNotas = async () => {
        try {
            const data = await fetchNotasFiscais(cnpj, startDate, endDate);
            setNotas(data);
        } catch (error: any) {
            setNotification({ message: error.message, type: 'error' });
        }
    };

    const handleFetchProcessos = async () => {
        try {
            const data = await searchProcessNumbers(empresa, obra, startDate, endDate);
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
                            errorMessage: result.success ? '' : result.message,
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
                        ? { ...n, status: SyncStatus.ERROR, errorMessage: error.message }
                        : n
                )
            );
            setNotification({ message: error.message, type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-2xl font-bold mb-6 text-center text-sky-400">
                🔗 Integração Arquivei ↔ UAU
            </h1>

            {/* 🔍 Consulta Arquivei */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6 space-y-3">
                <h2 className="font-semibold text-lg">Consultar Notas Fiscais</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        placeholder="CNPJ"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                    />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                    />
                    <button
                        onClick={handleFetchNotas}
                        className="bg-sky-600 hover:bg-sky-700 font-semibold rounded p-2"
                    >
                        Buscar Notas
                    </button>
                </div>
            </div>

            {/* 🧾 Lista de Notas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
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

            {/* 🏗️ Consulta UAU */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6 space-y-3">
                <h2 className="font-semibold text-lg">Consultar Processos UAU</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        placeholder="Empresa"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                    />
                    <input
                        placeholder="Obra"
                        value={obra}
                        onChange={(e) => setObra(e.target.value)}
                        className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
                    />
                    <button
                        onClick={handleFetchProcessos}
                        className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded p-2"
                    >
                        Buscar Processos
                    </button>
                </div>
            </div>

            {/* 📄 Lista de Processos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
