import React from 'react';
import { NotaFiscal, SyncStatus } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface NotaFiscalCardProps {
  nota: NotaFiscal;
  onSync: (id: string) => void;
  onProcessNumberChange: (id: string, value: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const StatusIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
    switch (status) {
        case SyncStatus.PENDING:
            return <div className="flex items-center text-xs font-medium text-yellow-400"><ClockIcon className="w-4 h-4 mr-1" /> Pending</div>;
        case SyncStatus.SYNCING:
            return <div className="flex items-center text-xs font-medium text-blue-400"><SpinnerIcon /> Syncing...</div>;
        case SyncStatus.SYNCED:
            return <div className="flex items-center text-xs font-medium text-green-400"><CheckIcon className="w-4 h-4 mr-1" /> Synced</div>;
        case SyncStatus.ERROR:
            return <div className="flex items-center text-xs font-medium text-red-400"><ExclamationIcon className="w-4 h-4 mr-1" /> Error</div>;
        default:
            return null;
    }
};

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; className?: string }> = ({ label, value, className = '' }) => (
    <div className={className}>
        <span className="text-gray-400 text-xs">{label}</span>
        <p className="font-medium text-white truncate">{value}</p>
    </div>
);


export const NotaFiscalCard: React.FC<NotaFiscalCardProps> = ({ nota, onSync, onProcessNumberChange, isSelected, onSelect }) => {
  
  const handleSyncClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when clicking button
    const num = parseInt(nota.processNumber || '', 10);
    if (!isNaN(num) && num > 0) {
      onSync(nota.id);
    }
  };

  const isSyncDisabled = nota.status === SyncStatus.SYNCING || nota.status === SyncStatus.SYNCED;
  const selectionClasses = isSelected ? 'ring-2 ring-sky-500 shadow-sky-500/30' : 'hover:ring-1 hover:ring-gray-700';

  return (
    <div 
        className={`bg-gray-800 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-sky-700/20 cursor-pointer ${selectionClasses}`}
        onClick={() => onSelect(nota.id)}
    >
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="text-lg font-bold text-gray-100">NF #{nota.numero}</h3>
        <StatusIndicator status={nota.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
        <DetailItem label="CNPJ" value={nota.cnpj} className="sm:col-span-1" />
        <DetailItem label="Prestador de Serviço" value={nota.prestadorServico} className="col-span-2" />
        <DetailItem label="Data Emissão" value={nota.dataEmissao} />
        <DetailItem label="Data Geração NFS-e" value={nota.dataGeracao} />
        <DetailItem label="Valor Nominal" value={nota.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <DetailItem label="Valor Total Serviços" value={nota.valorServicos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col sm:flex-row items-center gap-2">
        <div className="w-full sm:flex-grow flex items-center gap-2">
            <label htmlFor={`process-no-${nota.id}`} className="text-sm font-medium text-gray-300 hidden sm:inline">Proc.:</label>
            <input
                id={`process-no-${nota.id}`}
                type="number"
                placeholder="Process No."
                value={nota.processNumber || ''}
                onChange={(e) => onProcessNumberChange(nota.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                disabled={isSyncDisabled}
                className="w-full sm:w-36 p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
            />
        </div>
        <button
            onClick={handleSyncClick}
            disabled={isSyncDisabled || !nota.processNumber}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
            {nota.status === SyncStatus.SYNCING ? <SpinnerIcon className="w-5 h-5"/> : 'Sync'}
        </button>
      </div>
       {nota.status === SyncStatus.ERROR && nota.errorMessage && (
            <p className="text-xs text-red-400 mt-2 text-center sm:text-right">{nota.errorMessage}</p>
        )}
    </div>
  );
};