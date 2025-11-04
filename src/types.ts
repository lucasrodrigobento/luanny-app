export enum SyncStatus {
  PENDING,
  SYNCING,
  SYNCED,
  ERROR,
}

export interface NotaFiscal {
  id: string;
  numero: string;
  dataEmissao: string;
  valor: number; // Valor Nominal
  status: SyncStatus;
  errorMessage?: string;
  processNumber?: string;
  cnpj: string;
  prestadorServico: string;
  valorServicos: number;
  dataGeracao: string;
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

export enum AppStep {
    UPLOAD_CERT,
    FETCH_NF,
    SYNC_NF,
}