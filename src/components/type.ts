export enum SyncStatus {
    PENDING = 'PENDING',
    SYNCING = 'SYNCING',
    SYNCED = 'SYNCED',
    ERROR = 'ERROR',
}

export interface NotaFiscal {
    id: string;
    numero: string;
    dataEmissao: string;
    valor: number;
    status: SyncStatus;
    cnpj: string;
    prestadorServico: string;
    valorServicos: number;
    dataGeracao: string;
    processNumber?: string;
    errorMessage?: string;

    xml?: string | null;
}

export interface ProcessDetails {
    empresa: string;
    obra: string;
    processo: number;
    chequeNominal: string;
    valorAPagar: number;
    valorDocFiscal: number;
    docFiscal: string;
}

export interface Empresa {
    id: string;
    nome: string;
    codigo: string;
    obra: string;
}
