import React, { useState } from 'react';
import { NotaFiscal, ProcessDetails, SyncStatus } from '../../types';
import { fetchNotasFiscais, searchProcessNumbers, syncToUau } from '../../services/apiService';
import { NotaFiscalCard } from '../NotaFiscalCard';
import { ProcessCard } from '../ProcessCard';
import { Notification } from '../Notification';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { SearchIcon } from '../icons/SearchIcon';

// Helper to get the first and last day of the current month in YYYY-MM-DD format
const getMonthDateRange = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    return { firstDay, lastDay };
};

export const SincronizarNFes: React.FC = () => {
    // Form state
    const [cnpj, setCnpj] = useState('');
    const [startDate, setStartDate] = useState(getMonthDateRange().firstDay);
    const [endDate, setEndDate] = useState(getMonthDateRange().lastDay);

    // Data state
    const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
    const [processos, setProcessos] = useState<ProcessDetails[]>([]);
    const [selectedNotaId, setSelectedNotaId] = useState<string | null>(null);

    // UI/Loading state
    const [isLoadingNotas, setIsLoadingNotas] = useState(false);
    const [isLoadingProcessos, setIsLoadingProcessos] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // State for process search form
    const [codEmpresa, setCodEmpresa] = useState('');
    const [codObra, setCodObra] = useState('');
    const [periodoInicial, setPeriodoInicial] = useState(new Date().toISOString().split('T')[0]);
    const [periodoFinal, setPeriodoFinal] = useState(new Date().toISOString().split('T')[0]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleFetchNotas = async () => {
        if (!cnpj) {
            showNotification("Please enter a CNPJ.", 'error');
            return;
        }

        setIsLoadingNotas(true);
        setError(null);
        setNotasFiscais([]);
        setSelectedNotaId(null);

        try {
            const fetchedNotas = await fetchNotasFiscais(cnpj, startDate, endDate);
            setNotasFiscais(fetchedNotas);
            if (fetchedNotas.length === 0) {
                showNotification("No pending invoices found for this CNPJ and period.", 'success');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch invoices.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoadingNotas(false);
        }
    };

    const handleProcessNumberChange = (id: string, value: string) => {
        setNotasFiscais(notas => notas.map(nf => nf.id === id ? { ...nf, processNumber: value } : nf));
    };

    const handleSync = async (id: string) => {
        const nota = notasFiscais.find(nf => nf.id === id);
        if (!nota || !nota.processNumber) return;

        const processNumber = parseInt(nota.processNumber, 10);
        if (isNaN(processNumber)) return;

        setNotasFiscais(notas => notas.map(nf => nf.id === id ? { ...nf, status: SyncStatus.SYNCING, errorMessage: undefined } : nf));

        try {
            const result = await syncToUau(id, processNumber);
            if (result.success) {
                setNotasFiscais(notas => notas.map(nf => nf.id === id ? { ...nf, status: SyncStatus.SYNCED } : nf));
                showNotification(result.message, 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (err: any) {
            setNotasFiscais(notas => notas.map(nf => nf.id === id ? { ...nf, status: SyncStatus.ERROR, errorMessage: err.message } : nf));
            showNotification(err.message, 'error');
        }
    };

    const handleSearchProcessos = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!codEmpresa || !codObra || !periodoInicial || !periodoFinal) {
            showNotification("Please provide Company Code, Work Code, and both dates.", 'error');
            return;
        }
        setIsLoadingProcessos(true);
        setProcessos([]);
        try {
            const results = await searchProcessNumbers(codEmpresa, codObra, periodoInicial, periodoFinal);
            setProcessos(results);
            if (results.length === 0) {
                showNotification("No matching processes found for the given criteria.", 'success');
            }
        } catch (err: any) {
            showNotification(err.message || "Failed to search for processes.", 'error');
        } finally {
            setIsLoadingProcessos(false);
        }
    };

    const handleLinkProcesso = (processoNumero: number) => {
        if (!selectedNotaId) {
            showNotification("Please select an invoice first before linking a process.", 'error');
            return;
        }
        handleProcessNumberChange(selectedNotaId, processoNumero.toString());
        showNotification(`Process number ${processoNumero} linked. Click Sync to finalize.`, 'success');
    };

    const FormInput: React.FC<{ label: string, value: string, onChange: (val: string) => void, type?: string, placeholder?: string, disabled?: boolean }> =
        ({ label, value, onChange, type = 'text', placeholder, disabled = false }) => (
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
        );

    return (
        <div className="space-y-8">
            {/* Search Configuration */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Search Invoices via Arquivei</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <FormInput label="Company CNPJ" placeholder="00.000.000/0000-00" value={cnpj} onChange={setCnpj} disabled={isLoadingNotas}/>
                    </div>
                    <FormInput label="Start Date" value={startDate} onChange={setStartDate} type="date" disabled={isLoadingNotas}/>
                    <FormInput label="End Date" value={endDate} onChange={setEndDate} type="date" disabled={isLoadingNotas}/>
                    <button
                        onClick={handleFetchNotas}
                        disabled={isLoadingNotas || !cnpj}
                        className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoadingNotas ? <SpinnerIcon /> : 'Fetch Invoices'}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Invoice List */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-xl font-bold text-gray-200 border-b border-gray-700 pb-2">
                        Found Invoices ({notasFiscais.length})
                    </h3>
                    {isLoadingNotas && <div className="text-center p-8"><SpinnerIcon className="w-8 h-8 mx-auto" /></div>}
                    {error && <p className="text-red-400 text-center p-4 bg-red-900/20 rounded-md">{error}</p>}
                    {!isLoadingNotas && notasFiscais.length === 0 && <p className="text-gray-400 text-center p-8">No invoices to display. Please fetch them using the form above.</p>}
                    {notasFiscais.map(nf => (
                        <NotaFiscalCard
                            key={nf.id}
                            nota={nf}
                            onSync={handleSync}
                            onProcessNumberChange={handleProcessNumberChange}
                            isSelected={selectedNotaId === nf.id}
                            onSelect={() => setSelectedNotaId(nf.id)}
                        />
                    ))}
                </div>

                {/* Process Linking Area */}
                <div className="lg:col-span-2">
                    <div className="sticky top-24 space-y-4">
                        <h3 className="text-xl font-bold text-gray-200 border-b border-gray-700 pb-2">Link UAU Process</h3>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4">
                            <form onSubmit={handleSearchProcessos} className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <FormInput label="Company Code" placeholder="e.g., 102" value={codEmpresa} onChange={setCodEmpresa} disabled={isLoadingProcessos} />
                                    <FormInput label="Work Code" placeholder="e.g., 00013" value={codObra} onChange={setCodObra} disabled={isLoadingProcessos} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <FormInput label="Start Date" value={periodoInicial} onChange={setPeriodoInicial} type="date" disabled={isLoadingProcessos} />
                                    <FormInput label="End Date" value={periodoFinal} onChange={setPeriodoFinal} type="date" disabled={isLoadingProcessos} />
                                </div>
                                <button type="submit" disabled={isLoadingProcessos} className="w-full flex items-center justify-center p-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:bg-sky-900 disabled:cursor-not-allowed">
                                    {isLoadingProcessos ? <SpinnerIcon className="w-5 h-5"/> : <SearchIcon className="w-5 h-5"/>}
                                    <span className="ml-2">Search Processes</span>
                                </button>
                            </form>

                            {!selectedNotaId && processos.length > 0 && (
                                <p className="text-xs text-center text-sky-300 bg-sky-900/50 p-2 rounded-md">Select an invoice on the left to enable linking.</p>
                            )}

                            <div className="max-h-[30rem] overflow-y-auto space-y-3 pr-2">
                                {isLoadingProcessos && <div className="text-center p-4"><SpinnerIcon className="w-6 h-6 mx-auto"/></div>}
                                {!isLoadingProcessos && processos.length === 0 && <p className="text-sm text-gray-500 text-center pt-4">Search for processes to link them here.</p>}
                                {processos.map(p => (
                                    <ProcessCard key={p.processo} processo={p} onLink={handleLinkProcesso} isLinkDisabled={!selectedNotaId} />
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
    );
};
