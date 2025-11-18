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


// Máscara de CNPJ
const maskCNPJ = (value: string) => {
    value = value.replace(/\D/g, ""); // remove tudo que não é número
    value = value.slice(0, 14); // limita a 14 dígitos

    if (value.length <= 2) return value;
    if (value.length <= 5) return value.replace(/(\d{2})(\d+)/, "$1.$2");
    if (value.length <= 8) return value.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
    if (value.length <= 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};


const App: React.FC = () => {
    // ------------------------------
    // Estados Notas Fiscais
    // ------------------------------
    const [cnpj, setCnpj] = useState('');
    const [startDateNF, setStartDateNF] = useState('');
    const [endDateNF, setEndDateNF] = useState('');
    const [notas, setNotas] = useState<NotaFiscal[]>([]);

    // ------------------------------
    // Estados Processos UAU
    // ------------------------------
    const [empresa, setEmpresa] = useState('225');
    const [obra, setObra] = useState('004');
    const [startDateProcess, setStartDateProcess] = useState('');
    const [endDateProcess, setEndDateProcess] = useState('');
    const [processos, setProcessos] = useState<ProcessDetails[]>([]);

    // ------------------------------
    // Nota selecionada por processo
    // ------------------------------
    const [notaSelecionadaPorProcesso, setNotaSelecionadaPorProcesso] = useState<{ [proc: number]: string }>({});

    // ------------------------------
    // Notificações
    // ------------------------------
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    const notify = (msg: string, type: 'success' | 'error') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    // ------------------------------
    // Carregar Notas
    // ------------------------------
    const handleFetchNotas = async () => {

        if (!cnpj.trim() || !startDateNF || !endDateNF) {
            notify("Preencha CNPJ, Data inicial e Data final para consultar Notas!", "error");
            return;
        }

        try {
            const data = await fetchNotasFiscais(cnpj, startDateNF, endDateNF);
            setNotas(data);
        } catch (error: any) {
            notify(error.message, 'error');
        }
    };

    // ------------------------------
    // Carregar Processos
    // ------------------------------
    const handleFetchProcessos = async () => {

        if (!empresa.trim() || !obra.trim() || !startDateProcess || !endDateProcess) {
            notify("Preencha Empresa, Obra, Data inicial e Data final para consultar Processos!", "error");
            return;
        }

        try {
            const data = await searchProcessNumbers(
                empresa,
                obra,
                startDateProcess,
                endDateProcess
            );
            setProcessos(data);
        } catch (error: any) {
            notify(error.message, 'error');
        }
    };

    // Selecionar Nota dentro do Processo
    const handleSelectNotaProcesso = (processoNumero: number, notaId: string) => {
        setNotaSelecionadaPorProcesso(prev => ({
            ...prev,
            [processoNumero]: notaId
        }));
    };

    // ------------------------------
    // Vincular & Sincronizar
    // ------------------------------
    const handleLinkAndSyncProcesso = async (processoNumero: number) => {
        const notaId = notaSelecionadaPorProcesso[processoNumero];

        if (!notaId) {
            notify("Selecione uma Nota Fiscal!", "error");
            return;
        }

        setNotas(prev =>
            prev.map(n =>
                n.id === notaId ? { ...n, status: SyncStatus.SYNCING } : n
            )
        );

        try {
            const result = await syncToUau(notaId, processoNumero);

            setNotas(prev =>
                prev.map(n =>
                    n.id === notaId
                        ? {
                            ...n,
                            status: result.success ? SyncStatus.SYNCED : SyncStatus.ERROR,
                            errorMessage: result.success ? "" : result.message,
                            processNumber: String(processoNumero)
                        }
                        : n
                )
            );

            notify(
                result.success
                    ? `Nota sincronizada com o processo ${processoNumero}!`
                    : result.message,
                result.success ? "success" : "error"
            );

        } catch (err: any) {
            notify(err.message, "error");
        }
    };

    // ------------------------------
    // Layout final
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Coluna de Notas */}
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="font-semibold text-lg mb-3">Consultar Notas Fiscais</h2>

                    <div className="flex flex-wrap gap-3 items-end mb-4">

                        {/* CNPJ */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                CNPJ <span className="text-red-500">*</span>
                            </label>
                                <input
                                    placeholder="CNPJ"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                                    className={`p-2 rounded w-40 text-white 
                                        ${!cnpj.trim() ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                    `}
                                    title={!cnpj.trim() ? "Campo obrigatório" : ""}
                                />

                        </div>

                        {/* Data Inicial */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Data Inicial <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={startDateNF}
                                onChange={(e) => setStartDateNF(e.target.value)}
                                className={`p-2 rounded text-white 
                                    ${!startDateNF ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!startDateNF ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Data Final */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Data Final <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={endDateNF}
                                onChange={(e) => setEndDateNF(e.target.value)}
                                className={`p-2 rounded text-white 
                                    ${!endDateNF ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!endDateNF ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Botão */}
                        <button
                            onClick={handleFetchNotas}
                            disabled={!cnpj.trim() || !startDateNF || !endDateNF}
                            className={`flex items-center gap-2 font-semibold rounded px-3 py-2 text-sm whitespace-nowrap 
                                ${(!cnpj.trim() || !startDateNF || !endDateNF)
                                    ? "bg-sky-900 text-gray-500 cursor-not-allowed"
                                    : "bg-sky-600 hover:bg-sky-700"}`}
                        >
                            🔍 Buscar
                        </button>

                    </div>

                    {/* Lista NF */}
                    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                        {notas.map((nota) => (
                            <NotaFiscalCard
                                key={nota.id}
                                nota={nota}
                                isSelected={false}
                                onSelect={() => {}}
                            />
                        ))}
                    </div>
                </div>

                {/* Coluna de Processos */}
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="font-semibold text-lg mb-3">Consultar Processos UAU</h2>

                    <div className="flex flex-wrap gap-3 items-end mb-4">

                        {/* Empresa */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Empresa <span className="text-red-500">*</span>
                            </label>
                            <input
                                placeholder="Empresa"
                                value={empresa}
                                onChange={(e) => setEmpresa(e.target.value)}
                                className={`p-2 rounded text-white w-20
                                    ${!empresa.trim() ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!empresa.trim() ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Obra */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Obra <span className="text-red-500">*</span>
                            </label>
                            <input
                                placeholder="Obra"
                                value={obra}
                                onChange={(e) => setObra(e.target.value)}
                                className={`p-2 rounded text-white w-20
                                    ${!obra.trim() ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!obra.trim() ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Data Inicial */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Data Inicial <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={startDateProcess}
                                onChange={(e) => setStartDateProcess(e.target.value)}
                                className={`p-2 rounded text-white 
                                    ${!startDateProcess ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!startDateProcess ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Data Final */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Data Final <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={endDateProcess}
                                onChange={(e) => setEndDateProcess(e.target.value)}
                                className={`p-2 rounded text-white 
                                    ${!endDateProcess ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!endDateProcess ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Botão */}
                        <button
                            onClick={handleFetchProcessos}
                            disabled={!empresa.trim() || !obra.trim() || !startDateProcess || !endDateProcess}
                            className={`flex items-center gap-2 font-semibold rounded px-3 py-2 text-sm whitespace-nowrap 
                                ${(!empresa.trim() || !obra.trim() || !startDateProcess || !endDateProcess)
                                    ? "bg-indigo-900 text-gray-500 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                            🔍 Buscar
                        </button>

                    </div>

                    {/* Lista Processos */}
                    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                        {processos.map((proc) => (
                            <ProcessCard
                                key={proc.processo}
                                processo={proc}
                                notas={notas}
                                selectedNotaProcesso={notaSelecionadaPorProcesso[proc.processo]}
                                onSelectNota={handleSelectNotaProcesso}
                                onLinkAndSync={handleLinkAndSyncProcesso}
                            />
                        ))}
                    </div>
                </div>
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
