import React from 'react';
import { ProcessDetails, NotaFiscal } from '../types';
import { LinkIcon } from './icons/LinkIcon';

interface ProcessCardProps {
    processo: ProcessDetails;
    notas: NotaFiscal[];
    selectedNotaProcesso?: string;
    onSelectNota: (processNumber: number, notaId: string) => void;
    onLinkAndSync: (processNumber: number) => void;
    isSelected?: boolean;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({
    processo,
    notas,
    selectedNotaProcesso,
    onSelectNota,
    onLinkAndSync,
    isSelected
}) => {
    return (
        <div
            className={`p-5 bg-gray-800/60 rounded-xl border transition-all space-y-4 
                ${isSelected ? "border-purple-500 shadow-purple-500/40 shadow-lg" : "border-gray-700 hover:border-purple-400"}
            `}
        >

            {/* Cabeçalho */}
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-purple-300 text-lg">
                    Processo #{processo.processo}
                </h4>
                <span className="text-xs text-gray-400">
                    {processo.empresa}/{processo.obra}
                </span>
            </div>

            {/* SELECT DAS NOTAS */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1">Selecionar Nota Fiscal</label>

                <select
                    value={selectedNotaProcesso || ""}
                    onChange={(e) => onSelectNota(processo.processo, e.target.value)}
                    className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                    <option value="">Selecione uma Nota Fiscal</option>

                    {notas.map((n) => (
                        <option key={n.id} value={n.id}>
                            NF #{n.numero} — {n.prestadorServico} — R$ {n.valor.toLocaleString('pt-BR')}
                        </option>
                    ))}
                </select>
            </div>

            {/* Informações do processo */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-2">
                <div>
                    <p className="text-xs text-gray-400 mb-0.5">Cheque Nominal</p>
                    <p className="font-semibold text-gray-100">{processo.chequeNominal}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-0.5">Valor a Pagar</p>
                    <p className="font-semibold text-gray-100">
                        {processo.valorAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-0.5">Valor Doc Fiscal</p>
                    <p className="font-semibold text-gray-100">
                        {processo.valorDocFiscal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-400 mb-0.5">Documento Fiscal</p>
                    <p className="font-semibold text-gray-100">
                        {processo.docFiscal || "—"}
                    </p>
                </div>
            </div>

            {/* Botão Vincular & Sincronizar */}
            <button
                onClick={() => onLinkAndSync(processo.processo)}
                disabled={!selectedNotaProcesso}
                className="w-full mt-3 flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:bg-gray-700 disabled:text-gray-400"
            >
                <LinkIcon className="w-4 h-4 mr-2" />
                Vincular & Sincronizar
            </button>

        </div>
    );
};
