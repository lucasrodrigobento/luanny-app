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
}

export interface ProcessDetails {
    empresa: string | number;
    descrEmpresa: string;
    obra: string;
    descrObra: string;
    processo: number;

    chequeNominal: string;
    valorAPagar: number;
    valorDocFiscal: number;

    fornecedor?: string;
    cnpjFornecedor?: string;
    dataVencimento?: string;
    dataPagamento?: string;
    historico?: string;
}

// FIX: Added the missing Empresa interface.
export interface Empresa {
    id: string;
    nome: string;
    cnpj: string;
    estado: string;
    senhaCertificado: string;
    certificadoBase64?: string;
    nomeCertificado?: string;
    tpAmb: '1' | '2';
}
