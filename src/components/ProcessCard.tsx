import React from 'react';
import { ProcessDetails } from '../types';
import { LinkIcon } from './icons/LinkIcon';

interface ProcessCardProps {
    processo: ProcessDetails;
    onLink: (processoNumero: number) => void;
    isLinkDisabled?: boolean;
}

const Info: React.FC<{ label: string; value: string | number; full?: boolean }> = ({ label, value, full }) => (
    <div className={full ? "col-span-2" : ""}>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="font-semibold text-gray-100">{value}</p>
    </div>
);

export const ProcessCard: React.FC<ProcessCardProps> = ({ processo, onLink, isLinkDisabled }) => {
    return (
        <div className="p-5 bg-gray-800/60 border border-gray-700 rounded-xl shadow-sm hover:border-indigo-500/50 hover:bg-gray-800/70 transition-all space-y-4">
            
            {/* Título */}
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-indigo-300 text-lg">
                    Processo #{processo.processo}
                </h4>
                <span className="text-xs text-gray-400">
                    {processo.empresa}/{processo.obra}
                </span>
            </div>

            {/* Grid elegante */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <Info label="Cheque Nominal" value={processo.chequeNominal} full />
                <Info 
                    label="Valor a Pagar" 
                    value={processo.valorAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                />
                <Info 
                    label="Valor Doc Fiscal" 
                    value={processo.valorDocFiscal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                />
                <Info label="Documento Fiscal" value={processo.docFiscal || "—"} />
            </div>

            {/* Botão */}
            <button
                onClick={() => onLink(processo.processo)}
                disabled={isLinkDisabled}
                className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-900 disabled:text-gray-400"
            >
                <LinkIcon className="w-4 h-4 mr-2" />
                Vincular a este Processo
            </button>
        </div>
    );
};
