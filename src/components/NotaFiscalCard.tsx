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

const StatusBadge: React.FC<{ status: SyncStatus }> = ({ status }) => {
    const map: any = {
        PENDING: { label: "Pendente", color: "text-yellow-400", icon: <ClockIcon className="w-4 h-4" /> },
        SYNCING: { label: "Sincronizando...", color: "text-blue-400", icon: <SpinnerIcon /> },
        SYNCED: { label: "Sincronizado", color: "text-green-400", icon: <CheckIcon className="w-4 h-4" /> },
        ERROR: { label: "Erro", color: "text-red-400", icon: <ExclamationIcon className="w-4 h-4" /> },
    };

    const item = map[status];
    return (
        <div className={`flex items-center gap-1 text-xs font-medium ${item.color}`}>
            {item.icon}
            {item.label}
        </div>
    );
};

const Info: React.FC<{ label: string; value: any; full?: boolean }> = ({ label, value, full }) => (
    <div className={full ? "col-span-2" : ""}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-semibold text-gray-200 truncate">{value}</p>
    </div>
);

export const NotaFiscalCard: React.FC<NotaFiscalCardProps> = ({
    nota,
    onSync,
    onProcessNumberChange,
    isSelected,
    onSelect,
}) => {
    const disableSync = nota.status === SyncStatus.SYNCING || nota.status === SyncStatus.SYNCED;

    return (
        <div
            onClick={() => onSelect(nota.id)}
            className={`p-5 rounded-xl bg-gray-800/60 border ${
                isSelected ? "border-sky-500 shadow-lg shadow-sky-500/20" : "border-gray-700 hover:border-gray-500"
            } transition-all cursor-pointer space-y-4`}
        >

            {/* Cabeçalho */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-sky-300">NF #{nota.numero}</h3>
                <StatusBadge status={nota.status} />
            </div>

            {/* Infos */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Info label="CNPJ" value={nota.cnpj} />
                <Info label="Prestador de Serviço" value={nota.prestadorServico} full />
                <Info label="Data Emissão" value={nota.dataEmissao} />
                <Info label="Data Geração" value={nota.dataGeracao} />
                <Info 
                    label="Valor Nominal" 
                    value={nota.valor.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' })} 
                />
                <Info 
                    label="Valor Serviços" 
                    value={nota.valorServicos.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' })} 
                />
            </div>

            {/* Rodapé */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                
                <input
                    type="number"
                    value={nota.processNumber || ""}
                    onChange={(e) => onProcessNumberChange(nota.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Processo"
                    disabled={disableSync}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md w-32 text-white text-sm"
                />

                <button
                    disabled={disableSync || !nota.processNumber}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSync(nota.id);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 rounded-lg font-semibold text-sm transition"
                >
                    {nota.status === SyncStatus.SYNCING ? <SpinnerIcon /> : "Sync"}
                </button>
            </div>

            {nota.status === SyncStatus.ERROR && nota.errorMessage && (
                <p className="text-xs text-red-400 text-right">{nota.errorMessage}</p>
            )}
        </div>
    );
};
