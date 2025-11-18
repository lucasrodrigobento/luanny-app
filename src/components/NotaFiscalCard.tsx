import React, { useState } from 'react';
import { NotaFiscal, SyncStatus } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

/* ----------------------- */
/* FUNÇÕES DE FORMATAÇÃO   */
/* ----------------------- */

const formatCNPJ = (value: string) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 14) return value;
    return digits.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
    );
};

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];
    const [yyyy, mm, dd] = dateStr.split("-");
    if (!yyyy || !mm || !dd) return dateStr;
    return `${dd}/${mm}/${yyyy}`;
};

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

interface NotaFiscalCardProps {
    nota: NotaFiscal;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const NotaFiscalCard: React.FC<NotaFiscalCardProps> = ({
    nota,
    isSelected,
    onSelect,
}) => {

    const [showXml, setShowXml] = useState(false);

    return (
        <div
            onClick={() => onSelect(nota.id)}
            className={`p-5 rounded-xl bg-gray-800/60 border 
                ${isSelected ? "border-sky-500 shadow-lg shadow-sky-500/20" : "border-gray-700 hover:border-gray-500"} 
                transition-all cursor-pointer space-y-4`}
        >

            {/* Cabeçalho */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-sky-300">NF #{nota.numero}</h3>
                <StatusBadge status={nota.status} />
            </div>

            {/* Infos */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Info label="CNPJ" value={formatCNPJ(nota.cnpj)} />
                <Info label="Prestador de Serviço" value={nota.prestadorServico} full />
                <Info label="Data Emissão" value={formatDate(nota.dataEmissao)} />
                <Info label="Data Geração" value={formatDate(nota.dataGeracao)} />
                <Info 
                    label="Valor Nominal" 
                    value={nota.valor.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' })} 
                />
                <Info 
                    label="Valor Serviços" 
                    value={nota.valorServicos.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' })} 
                />
            </div>

            {/* Botão Ver XML */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowXml(!showXml);
                }}
                className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-sm px-3 py-2 rounded-md font-semibold transition"
            >
                {showXml ? "Ocultar XML" : "Ver XML"}
            </button>

            {/* Área expandida */}
            {showXml && (
                <div
                    className="mt-3 p-3 bg-black/40 border border-gray-700 rounded-lg max-h-80 overflow-auto text-xs text-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <pre className="whitespace-pre-wrap leading-5">
                        {nota.xml || "XML não disponível nesta nota."}
                    </pre>
                </div>
            )}

            {nota.status === SyncStatus.ERROR && nota.errorMessage && (
                <p className="text-xs text-red-400 text-right">{nota.errorMessage}</p>
            )}
        </div>
    );
};
