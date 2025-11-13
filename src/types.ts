// src/types.ts
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
  descrEmpresa?: string;
  obra: string;
  descrObra?: string;
  processo: number;

  // Campos usados na UI
  chequeNominal: string;
  valorAPagar: number;
  valorDocFiscal: number;
  docFiscal?: string;

  // Campos extras úteis
  fornecedor?: string;
  cnpjFornecedor?: string;
  dataVencimento?: string;
  dataPagamento?: string;
  historico?: string;
}

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  ERROR = 'ERROR',
}

export interface Empresa {
  id: string;
  nome: string;
  codigo: string;
  obra: string;
}
