import React, { useState, useCallback } from 'react';
import { NotaFiscal, SyncStatus, AppStep, ProcessDetails } from './types';
import { fetchNotasFiscais, syncToUau, searchProcessNumbers } from './services/apiService';
import { NotaFiscalCard } from './components/NotaFiscalCard';
import { Notification } from './components/Notification';
import { UploadIcon } from './components/icons/UploadIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

interface ProcessDetailsModalProps {
  process: ProcessDetails;
  onClose: () => void;
}

const ProcessDetailsModal: React.FC<ProcessDetailsModalProps> = ({ process, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-700 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-indigo-300">Process Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Empresa:</span>
            <span className="font-medium text-white">{process.empresa}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Obra:</span>
            <span className="font-medium text-white">{process.obra}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Proc.:</span>
            <span className="font-mono text-white">{process.processo}</span>
          </div>
           <div className="flex justify-between text-sm">
            <span className="text-gray-400">Doc. fiscal:</span>
            <span className="font-medium text-white">{process.docFiscal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Cheque nominal:</span>
            <span className="font-medium text-white">{process.chequeNominal}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-700/50">
            <span className="text-gray-400">Valor doc. fiscal:</span>
            <span className="font-semibold text-sky-400">{process.valorDocFiscal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Valor a pagar:</span>
            <span className="font-semibold text-green-400">{process.valorAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-b-lg text-right">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};


interface ProcessSearchProps {
  onProcessSelect: (processNumber: number) => void;
}

const ProcessSearch: React.FC<ProcessSearchProps> = ({ onProcessSelect }) => {
  const [codEmpresa, setCodEmpresa] = useState('');
  const [codObra, setCodObra] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProcessDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [detailsToShow, setDetailsToShow] = useState<ProcessDetails | null>(null);


  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchProcessNumbers(codEmpresa, codObra);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full flex flex-col sticky top-6">
        <h3 className="text-xl font-bold text-indigo-300 mb-4">Search Process Number</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Cod. Empresa"
            value={codEmpresa}
            onChange={(e) => setCodEmpresa(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Cod. Obra"
            value={codObra}
            onChange={(e) => setCodObra(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !codEmpresa || !codObra}
            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed"
          >
            {isLoading ? <SpinnerIcon /> : 'Search'}
          </button>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-4 flex-grow overflow-y-auto min-h-[150px]">
          <h4 className="text-lg font-semibold text-gray-300 mb-2">Results</h4>
          {isLoading && <div className="flex justify-center pt-4"><SpinnerIcon /></div>}
          {error && <p className="text-center text-red-400">{error}</p>}
          {!isLoading && !error && searched && results.length === 0 && (
            <p className="text-center text-gray-400">No process numbers found.</p>
          )}
          {!isLoading && results.length > 0 && (
            <ul className="space-y-2">
              {results.map((proc) => (
                <li key={proc.processo} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                  <span className="font-mono text-gray-200">{proc.processo}</span>
                  <div className="flex items-center gap-2">
                     <button 
                      onClick={() => setDetailsToShow(proc)}
                      className="px-3 py-1 text-sm bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => onProcessSelect(proc.processo)}
                      className="px-3 py-1 text-sm bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500"
                    >
                      Use
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {detailsToShow && <ProcessDetailsModal process={detailsToShow} onClose={() => setDetailsToShow(null)} />}
    </>
  );
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD_CERT);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [cnpj, setCnpj] = useState<string>('');
  const [state, setState] = useState<string>('DF'); // UF, e.g., DF, SP, RJ
  const [tpAmb, setTpAmb] = useState<string>('1'); // 1 for Production, 2 for Homologation
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedNfId, setSelectedNfId] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCertificateFile(event.target.files[0]);
    }
  };

  const handleProceedToFetch = () => {
    if (certificateFile) {
      setCurrentStep(AppStep.FETCH_NF);
    }
  };

  const handleCnpjChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '');
    let formatted = value;
    if (value.length > 2) formatted = `${value.slice(0, 2)}.${value.slice(2)}`;
    if (value.length > 5) formatted = `${formatted.slice(0, 6)}.${value.slice(5)}`;
    if (value.length > 8) formatted = `${formatted.slice(0, 10)}/${value.slice(8)}`;
    if (value.length > 12) formatted = `${formatted.slice(0, 15)}-${value.slice(12)}`;
    setCnpj(formatted.slice(0, 18));
  };
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFetchNFs = async () => {
    if (cnpj.replace(/\D/g, '').length !== 14) {
        showNotification('Please enter a valid 14-digit CNPJ.', 'error');
        return;
    }
    if (!certificateFile) {
        showNotification('A certificate file is required.', 'error');
        return;
    }
     if (!state || state.length !== 2) {
        showNotification('Please enter a valid 2-letter state code (UF).', 'error');
        return;
    }
    setIsLoading(true);
    try {
      const fetchedNFs = await fetchNotasFiscais(cnpj, certificateFile, state, tpAmb);
      setNotas(fetchedNFs);
      setSelectedNfId(null);
      setCurrentStep(AppStep.SYNC_NF);
      showNotification(`Found ${fetchedNFs.length} invoices for CNPJ ${cnpj}.`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showNotification(`Error fetching invoices: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessNumberChange = (nfId: string, value: string) => {
    setNotas(prev => prev.map(nf => 
      nf.id === nfId ? { ...nf, processNumber: value } : nf
    ));
  };

  const handleProcessSelect = (processNumber: number) => {
    if (!selectedNfId) {
      showNotification('Please select an invoice first to assign the process number.', 'error');
      return;
    }
    handleProcessNumberChange(selectedNfId, processNumber.toString());
    showNotification(`Process number ${processNumber} assigned to selected invoice.`, 'success');
  };

  const handleSync = useCallback(async (nfId: string) => {
    const notaToSync = notas.find(n => n.id === nfId);
    if (!notaToSync || !notaToSync.processNumber) {
        showNotification('Process number is required to sync.', 'error');
        return;
    }
    const processNumber = parseInt(notaToSync.processNumber, 10);
     if (isNaN(processNumber) || processNumber <= 0) {
        showNotification('A valid process number is required.', 'error');
        return;
    }

    setNotas(prev => prev.map(nf => nf.id === nfId ? { ...nf, status: SyncStatus.SYNCING } : nf));
    
    try {
        const result = await syncToUau(nfId, processNumber);
        setNotas(prev => prev.map(nf => {
            if (nf.id === nfId) {
            return result.success
                ? { ...nf, status: SyncStatus.SYNCED }
                : { ...nf, status: SyncStatus.ERROR, errorMessage: result.message };
            }
            return nf;
        }));
        showNotification(result.message, result.success ? 'success' : 'error');
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
         setNotas(prev => prev.map(nf => nf.id === nfId ? { ...nf, status: SyncStatus.ERROR, errorMessage } : nf));
         showNotification(`Sync failed: ${errorMessage}`, 'error');
    }
  }, [notas]);

  const renderContent = () => {
    switch (currentStep) {
      case AppStep.UPLOAD_CERT:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-sky-300 mb-4">Step 1: Upload Certificate A1</h2>
            <p className="text-gray-400 mb-6">Please select your .pfx or .p12 certificate file to begin.</p>
            <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-sky-400 transition-colors duration-300">
                <input
                    type="file"
                    id="certificate"
                    accept=".pfx,.p12"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <label htmlFor="certificate" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                    <UploadIcon className="w-12 h-12 text-gray-500" />
                    <p className="text-gray-400">{certificateFile ? certificateFile.name : 'Click to browse or drag & drop'}</p>
                </label>
            </div>
             <p className="text-xs text-amber-500 mt-4">
                <span className="font-bold">Important:</span> Your certificate is sent directly to your secure backend for processing and is never stored.
            </p>
            {certificateFile && (
                 <button onClick={handleProceedToFetch} className="mt-8 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500">
                    Proceed to Next Step
                </button>
            )}
          </div>
        );
      case AppStep.FETCH_NF:
        return (
             <div className="w-full">
                <h2 className="text-2xl font-bold text-sky-300 mb-4 text-center">Step 2: Fetch Invoices by CNPJ</h2>
                <div className="flex flex-col space-y-4">
                    <input 
                        type="text"
                        value={cnpj}
                        onChange={handleCnpjChange}
                        placeholder="00.000.000/0000-00"
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <div className="flex gap-4">
                      <input 
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value.toUpperCase())}
                          placeholder="UF (e.g., DF)"
                          maxLength={2}
                          className="w-1/3 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <select
                        value={tpAmb}
                        onChange={(e) => setTpAmb(e.target.value)}
                        className="w-2/3 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="1">Production</option>
                        <option value="2">Homologation (Test)</option>
                      </select>
                    </div>
                    <button 
                        onClick={handleFetchNFs}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 disabled:bg-sky-800 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? <SpinnerIcon /> : 'Fetch Notas Fiscais'}
                    </button>
                </div>
                 <p className="text-xs text-gray-500 mt-4 text-center">
                    This will make a secure request to your backend, which will then communicate with the Receita Federal.
                </p>
             </div>
        );
      case AppStep.SYNC_NF:
        return (
            <div className="w-full">
                <h2 className="text-2xl font-bold text-sky-300 mb-6 text-center">Step 3: Sync Invoices with UAU</h2>
                 <p className="text-center text-gray-400 mb-6 max-w-2xl mx-auto">Select an invoice from the list on the left, then use the search panel on the right to find and assign its corresponding process number.</p>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-4">
                        {notas.length > 0 ? (
                            notas.map(nf => (
                                <NotaFiscalCard 
                                    key={nf.id} 
                                    nota={nf} 
                                    onSync={handleSync}
                                    onProcessNumberChange={handleProcessNumberChange}
                                    isSelected={selectedNfId === nf.id}
                                    onSelect={setSelectedNfId}
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-400 pt-8">No invoices found to sync.</p>
                        )}
                    </div>
                    <div className="lg:col-span-2">
                       <ProcessSearch onProcessSelect={handleProcessSelect} />
                    </div>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                    Nota Fiscal Sync
                </h1>
                <p className="text-gray-400 mt-2">Link your invoices to UAU system processes seamlessly.</p>
            </header>
            <main className="w-full bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl shadow-sky-900/20 flex justify-center min-h-[400px]">
                 {currentStep === AppStep.SYNC_NF ? (
                     renderContent()
                ) : (
                    <div className="w-full max-w-lg flex items-center">
                       {renderContent()}
                    </div>
                )}
            </main>
        </div>
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default App;