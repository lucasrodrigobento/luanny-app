import { NotaFiscal, SyncStatus, ProcessDetails } from '../types';

/**
 * Fetches Notas Fiscais by hitting the real backend API.
 * The backend will then communicate with the Receita Federal.
 * @param cnpj The CNPJ to fetch invoices for.
 * @param certificateFile The A1 certificate file (.pfx or .p12).
 * @param state The state code (e.g., DF, SP).
 * @param tpAmb The environment type ('1' for production, '2' for test).
 * @returns A Promise that resolves to an array of NotaFiscal objects.
 */
export const fetchNotasFiscais = async (cnpj: string, certificateFile: File, state: string, tpAmb: string): Promise<NotaFiscal[]> => {
  console.log(`Calling backend to fetch notas fiscais for CNPJ: ${cnpj}`);

  const certificatePassword = prompt("Please enter the password for your A1 certificate:");
  if (certificatePassword === null) { // User clicked cancel
      throw new Error("Operation cancelled.");
  }
  if (!certificatePassword) {
      throw new Error("Certificate password is required.");
  }

  const formData = new FormData();
  formData.append('cnpj', cnpj.replace(/\D/g, '')); // Send unformatted CNPJ
  formData.append('certificate', certificateFile);
  formData.append('password', certificatePassword);
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
    // If the API returns a valid response but no 'notas' array, it might mean no new notes were found.
    // Check for a log message to confirm.
    if (data.logs && data.logs.info) {
        console.log("API Info:", data.logs.info);
        return []; // Return an empty array, which is a valid result.
    }
    throw new Error("Invalid API response format: 'notas' array not found.");
  }

  // Map the response from your API to the frontend's NotaFiscal type
  return data.notas.map((nf: any): NotaFiscal => {
      const emissionDate = new Date(nf.dataEmissao);
      return {
          id: `nf-${nf.numero}`, // Generate a unique ID
          numero: nf.numero,
          dataEmissao: emissionDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
          valor: nf.valor,
          status: SyncStatus.PENDING,
          cnpj: cnpj, // Pass the formatted CNPJ from the input
          prestadorServico: nf.emitente,
          valorServicos: nf.valor, // Map 'valor' as no specific field is available in the response
          dataGeracao: emissionDate.toISOString(), // Use the full ISO string here
      };
  });
};

/**
 * Mocks searching for process numbers directly in the frontend.
 * @param codEmpresa The company code.
 * @param codObra The work code.
 * @returns A promise that resolves to an array of ProcessDetails.
 */
export const searchProcessNumbers = async (codEmpresa: string, codObra: string): Promise<ProcessDetails[]> => {
  console.log(`(FRONTEND MOCK) Searching process numbers for Empresa ${codEmpresa} and Obra ${codObra}`);
  
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay

  if (Math.random() > 0.1) {
    const results: ProcessDetails[] = Array.from({ length: Math.ceil(Math.random() * 5) + 1 }, () => {
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
    return results;
  } else {
    return [];
  }
};

/**
 * Mocks syncing a Nota Fiscal with the UAU system directly in the frontend.
 * @param nfId The ID of the Nota Fiscal to sync.
 * @param processNumber The process number to link.
 * @returns A promise that resolves to a success status and message.
 */
export const syncToUau = async (nfId: string, processNumber: number): Promise<{ success: boolean; message: string }> => {
  console.log(`(FRONTEND MOCK) Syncing NF ${nfId} with process number ${processNumber}`);

  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
  
  if (Math.random() > 0.2) {
    return { success: true, message: `Nota Fiscal ${nfId.substring(0, 10)}... synced successfully!` };
  } else {
    return { success: false, message: `Error syncing NF: UAU API connection failed.` };
  }
};
