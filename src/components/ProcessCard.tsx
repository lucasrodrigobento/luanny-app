import React from 'react';
import { ProcessDetails } from '../types';
import { LinkIcon } from './icons/LinkIcon';

interface ProcessCardProps {
    processo: ProcessDetails;
    onLink: (processoNumero: number) => void;
    isLinkDisabled?: boolean;
}

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; className?: string }> = ({
                                                                                                          label,
                                                                                                          value,
                                                                                                          className = '',
                                                                                                      }) => (
    <div className={className}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-medium text-white truncate">{value}</p>
    </div>
);

export const ProcessCard: React.FC<ProcessCardProps> = ({ processo, onLink, isLinkDisabled = false }) => {
    return (
        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3 transition-all hover:border-sky-600">
            <h4 className="font-bold text-sky-300">Processo #{processo.processo}</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <DetailItem label="Empresa/Obra" value={`${processo.empresa}/${processo.obra}`} className="col-span-2" />
                <DetailItem label="Cheque Nominal" value={processo.chequeNominal} className="col-span-2" />
                <DetailItem
                    label="Valor a Pagar"
                    value={processo.valorAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                />
                <DetailItem
                    label="Valor Doc Fiscal"
                    value={processo.valorDocFiscal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                />
            </div>
            <button
                onClick={() => onLink(processo.processo)}
                disabled={isLinkDisabled}
                className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                <LinkIcon className="w-5 h-5 mr-2" />
                Vincular a este Processo
            </button>
        </div>
    );
};
