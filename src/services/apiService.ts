import { NotaFiscal, SyncStatus, ProcessDetails } from '../types';

const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE_URL ??
    (typeof window !== 'undefined' ? 'http://localhost:8000' : 'http://localhost:8000');

/**
 * Busca Notas Fiscais via seu backend (Arquivei por trás).
 * GET /arquivei/notas-fiscais?cnpj=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const fetchNotasFiscais = async (
    cnpj: string,
    startDate: string,
    endDate: string
): Promise<NotaFiscal[]> => {
    const q = new URLSearchParams({
        cnpj: cnpj.replace(/\D/g, ''),
        startDate,
        endDate,
    });
    const url = `${API_BASE}/arquivei/notas-fiscais?${q.toString()}`;

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const msg = errorBody?.message || `Erro ao buscar NFes: ${response.status} ${response.statusText}`;
        throw new Error(msg);
    }

    const payload = await response.json();

    // ✅ Tratamento universal para o formato
    let notasArray: any[] = [];
    if (Array.isArray(payload)) {
        notasArray = payload;
    } else if (Array.isArray(payload.data)) {
        notasArray = payload.data;
    } else if (payload.data && typeof payload.data === 'object') {
        notasArray = [payload.data];
    } else if (payload && typeof payload === 'object') {
        notasArray = [payload];
    } else {
        throw new Error("Formato inválido do backend de NFes: resposta não contém array.");
    }

    // Mapeia para o tipo NotaFiscal do front
    return notasArray.map((n): NotaFiscal => {
        const inf = n.xml?.NFe?.infNFe;
        const ide = inf?.ide;
        const emit = inf?.emit;
        const dest = inf?.dest;
        const total = inf?.total?.ICMSTot;

        const numero = ide?.nNF ?? 'N/A';
        const chave = n.access_key ?? inf?.['@attributes']?.Id?.replace('NFe', '') ?? `nf-${Math.random()}`;
        const cnpjEmitente = emit?.CNPJ ?? '';
        const cnpjDestinatario = dest?.CNPJ ?? '';
        const razaoEmitente = emit?.xNome ?? emit?.xFant ?? 'Emitente não informado';
        const dataEmissao = ide?.dhEmi ?? null;
        const valorNF = Number(total?.vNF ?? total?.vProd ?? 0);
        const valorServicos = Number(total?.vProd ?? 0);

        const dataEmissaoISO = dataEmissao ? new Date(dataEmissao).toISOString() : null;
        const dataEmissaoDia = dataEmissaoISO ? dataEmissaoISO.split('T')[0] : 'N/A';

        return {
            id: chave,
            numero: numero.toString(),
            dataEmissao: dataEmissaoDia,
            valor: valorNF,
            valorServicos,
            status: SyncStatus.PENDING,
            cnpj: cnpjDestinatario || cnpjEmitente || 'N/A',
            prestadorServico: razaoEmitente,
            dataGeracao: dataEmissaoISO || 'N/A',
        };
    });
};

/**
 * Busca processos no backend UAU.
 * POST /uau/consultar-processos
 */
export const searchProcessNumbers = async (
    codEmpresa: string,
    codObra: string,
    periodoInicial: string,
    periodoFinal: string
): Promise<ProcessDetails[]> => {

    const body = {
        empresa: Number(codEmpresa),
        obra: codObra,
        periodoInicial,
        periodoFinal,
    };

    const response = await fetch(`${API_BASE}/uau/consultar-processos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: `Server error: ${response.status}`,
        }));
        throw new Error(errorData.message || `Failed to fetch processes from UAU API.`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Invalid response format from UAU API. Expected an array.');
    }

    return data.map((item: any): ProcessDetails => {
        const parcela = Array.isArray(item.Parcelas) && item.Parcelas.length > 0
            ? item.Parcelas[0]
            : null;

        return {
            empresa: item.Empresa,
            descrEmpresa: item.DescrEmpresa,
            obra: item.Obra,
            descrObra: item.DescrObra,
            processo: item.NumeroProcesso,

            // 🔥 CAMPOS QUE O ProcessCard PRECISA
            chequeNominal: parcela?.Nominal ?? "",
            valorAPagar: Number(parcela?.Valor ?? 0),
            valorDocFiscal: Number(parcela?.ValorTotalDocumentoFiscal ?? parcela?.Valor ?? 0),

            // 🔥 CAMPOS OPCIONAIS
            cnpjFornecedor: item.CnpjFornecedor ?? "",
            fornecedor: item.NomeFornecedor ?? "",
            dataVencimento: parcela?.DataVencimento ?? "",
            dataPagamento: parcela?.DataPagamento ?? "",
            historico: parcela?.HistoricoLancamentoContabil ?? "",
        };
    });
};

/**
 * Mock de sync de NF → UAU (frontend).
 */
export const syncToUau = async (
    nfId: string,
    processNumber: number
): Promise<{ success: boolean; message: string }> => {
    console.log(`(FRONTEND MOCK) Syncing NF ${nfId} with process number ${processNumber}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (Math.random() > 0.2) {
        return { success: true, message: `Nota Fiscal ${nfId.substring(0, 10)}... synced successfully!` };
    } else {
        return { success: false, message: `Error syncing NF: UAU API connection failed.` };
    }
};
