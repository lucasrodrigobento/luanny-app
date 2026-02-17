// src/types.ts
export interface NotaFiscal {
  xml: string;
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
  codigoFornecedor?: number;
  dataVencimento?: string;
  dataPagamento?: string;
  historico?: string;

  // Controle de NF gerada/vinculada (lado frontend)
  hasGeneratedNF?: boolean;
}

// Payload alinhado com UAUApi.Models.ProcessoPagamento.GerarNotaFiscalRequest
export interface GerarNotaFiscalRequest {
  Empresa: number;
  Obra: string;
  NumeroProcesso: number;
  Parcela?: number;
  TipoNF: 0 | 1; // 0 - Estadual, 1 - Municipal
  Especie: 'NF' | 'CT' | 'RE' | 'OU' | 'CF';
  Serie: string;
  NFEletronica: boolean;
  ChaveNfe?: string;
  NumeroNotaFiscal: string;
  CodigoRemetente: number;
  DataEmissao: string; // YYYY-MM-DD
  DataDeEmissaoMaiorQueCadastro: boolean;
  DataEntrada: string; // YYYY-MM-DD
  DataDeEntradaMaiorQueCadastro: boolean;
  ModeloNF?: string; // usa CodModelo_mnf ("01", "55", etc.)
  ArqNotaFiscal?: string;
  CaminhoOrigemArquivoLocal?: string;
  CaminhoDestinoArquivo?: string;
  NomeArquivo?: string;
  CopiarArquivo?: boolean;
  VincularADescontos?: boolean;
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
