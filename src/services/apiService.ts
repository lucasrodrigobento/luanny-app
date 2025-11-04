import { NotaFiscal, SyncStatus, ProcessDetails } from '../types';

// --- CONTROLE DE MOCK ---
// Altere para 'true' para usar dados de teste sem o backend.
const USE_MOCK_API = false;

/**
 * Creates a mocked list of NotaFiscal objects for development purposes.
 * @param cnpj The CNPJ to be included in the mock data.
 * @returns An array of mock NotaFiscal objects.
 */
const _createMockNotasFiscais = (cnpj: string): NotaFiscal[] => {
  console.warn("--- USING MOCKED API DATA (Notas Fiscais) ---");
  return [
    {
      id: 'nf-mock-1',
      numero: '12345',
      dataEmissao: '2023-10-26',
      valor: 1250.75,
      status: SyncStatus.PENDING,
      cnpj: cnpj,
      prestadorServico: 'Alpha Services Ltda.',
      valorServicos: 1250.75,
      dataGeracao: '2023-10-26T10:00:00Z',
    },
    {
      id: 'nf-mock-2',
      numero: '12346',
      dataEmissao: '2023-10-25',
      valor: 850.00,
      status: SyncStatus.PENDING,
      cnpj: cnpj,
      prestadorServico: 'Omega Solutions S.A.',
      valorServicos: 850.00,
      dataGeracao: '2023-10-25T14:30:00Z',
    },
  ];
};


/**
 * Fetches Notas Fiscais by hitting the real backend API or returning mock data.
 * The backend will then communicate with the Receita Federal.
 */
export const fetchNotasFiscais = async (
    cnpj: string, 
    certificateFile: File, 
    state: string, 
    tpAmb: string, 
    certificatePassword?: string | null
): Promise<NotaFiscal[]> => {
  if (!USE_MOCK_API && !certificatePassword) {
      throw new Error("Certificate password is required.");
  }

  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    return _createMockNotasFiscais(cnpj);
  }

  const formData = new FormData();
  formData.append('cnpj', cnpj.replace(/\D/g, ''));
  formData.append('certificate', certificateFile);
  formData.append('password', certificatePassword as string);
  formData.append('state', state);
  formData.append('tpAmb', tpAmb);

  const response = await fetch('/sefaz/consultar', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Server responded with status: ${response.status}` }));
    throw new Error(errorData.message || `Server responded with status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.notas || !Array.isArray(data.notas)) {
    if (data.logs && data.logs.info) {
        console.log("API Info:", data.logs.info);
        return [];
    }
    throw new Error("Invalid API response format: 'notas' array not found.");
  }

  return data.notas.map((nf: any): NotaFiscal => ({
      id: `nf-${nf.numero}`,
      numero: nf.numero,
      dataEmissao: new Date(nf.dataEmissao).toISOString().split('T')[0],
      valor: nf.valor,
      status: SyncStatus.PENDING,
      cnpj: cnpj,
      prestadorServico: nf.emitente,
      valorServicos: nf.valor,
      dataGeracao: new Date(nf.dataEmissao).toISOString(),
  }));
};

/**
 * Mocks or calls the backend to search for process numbers.
 * @returns A promise that resolves to an array of ProcessDetails.
 */
export const searchProcessNumbers = async (
  codEmpresa: string, 
  codObra: string,
  periodoInicial: string,
  periodoFinal: string,
): Promise<ProcessDetails[]> => {
  if (USE_MOCK_API) {
    console.warn("--- USING MOCKED API DATA (Processos) ---");
    await new Promise(resolve => setTimeout(resolve, 1200));
    return Array.from({ length: Math.ceil(Math.random() * 5) + 1 }, () => {
      const valor = parseFloat((Math.random() * 5000 + 50).toFixed(2));
      return {
        empresa: codEmpresa,
        obra: codObra,
        processo: Math.floor(Math.random() * 90000) + 10000,
        chequeNominal: `Fornecedor Exemplo ${Math.floor(Math.random() * 100)}`,
        valorAPagar: valor * 0.98,
        valorDocFiscal: valor,
        docFiscal: `NF-${Math.floor(Math.random() * 10000)}`,
      };
    });
  }

  // --- Real API Call ---
  const body = {
    empresa: parseInt(codEmpresa, 10),
    obra: codObra,
    periodoInicial: periodoInicial,
    periodoFinal: periodoFinal,
  };

  const response = await fetch('http://localhost:8000/uau/consultar-processos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
    throw new Error(errorData.message || `Failed to fetch processes from UAU API.`);
  }

  const data = await response.json();
  
  if (!Array.isArray(data)) {
    throw new Error("Invalid response format from UAU API. Expected an array.");
  }
  
  // Map the backend response to the frontend's ProcessDetails structure
  return data.map((item: any): ProcessDetails => {
    const firstParcel = item.Parcelas && item.Parcelas[0] ? item.Parcelas[0] : {};
    return {
      empresa: item.Empresa.toString(),
      obra: item.Obra,
      processo: item.NumeroProcesso,
      chequeNominal: item.NomeFornecedor || firstParcel.Nominal || 'N/A',
      valorAPagar: firstParcel.Valor || 0,
      valorDocFiscal: firstParcel.ValorTotalDocumentoFiscal || firstParcel.Valor || 0,
      docFiscal: firstParcel.NumeroDocumentofiscal || 'N/A',
    };
  });
};


/**
 * Mocks syncing a Nota Fiscal with the UAU system directly in the frontend.
 */
export const syncToUau = async (nfId: string, processNumber: number): Promise<{ success: boolean; message: string }> => {
  console.log(`(FRONTEND MOCK) Syncing NF ${nfId} with process number ${processNumber}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (Math.random() > 0.2) {
    return { success: true, message: `Nota Fiscal ${nfId.substring(0, 10)}... synced successfully!` };
  } else {
    return { success: false, message: `Error syncing NF: UAU API connection failed.` };
  }
};