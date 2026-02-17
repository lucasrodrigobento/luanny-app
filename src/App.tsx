import React, { useState } from 'react';
import {
    fetchNotasFiscais,
    searchProcessNumbers,
    syncToUau,
    gerarNotaFiscalUAU,
    fetchModelosNota,
} from './services/apiService';

import { NotaFiscal, SyncStatus, ProcessDetails, GerarNotaFiscalRequest } from './types';
import { NotaFiscalCard } from './components/NotaFiscalCard';
import { ProcessCard } from './components/ProcessCard';
import { Notification } from './components/Notification';


// Máscara de CNPJ
const maskCNPJ = (value: string) => {
    value = value.replace(/\D/g, ""); // remove tudo que não é número
    value = value.slice(0, 14); // limita a 14 dígitos

    if (value.length <= 2) return value;
    if (value.length <= 5) return value.replace(/(\d{2})(\d+)/, "$1.$2");
    if (value.length <= 8) return value.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
    if (value.length <= 12) return value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};


const App: React.FC = () => {
    // ------------------------------
    // Estados Notas Fiscais
    // ------------------------------
    const [cnpj, setCnpj] = useState('');
    const [startDateNF, setStartDateNF] = useState('');
    const [endDateNF, setEndDateNF] = useState('');
    const [notas, setNotas] = useState<NotaFiscal[]>([]);

    // ------------------------------
    // Estados Processos UAU
    // ------------------------------
    const [empresa, setEmpresa] = useState('225');
    const [obra, setObra] = useState('004');
    const [startDateProcess, setStartDateProcess] = useState('');
    const [endDateProcess, setEndDateProcess] = useState('');
    const [processos, setProcessos] = useState<ProcessDetails[]>([]);

    // ------------------------------
    // Modelos de NF (dinâmicos por empresa UAU)
    // ------------------------------
    const [modelosNF, setModelosNF] = useState<Array<{ codigo: number | string; descricao: string }>>([]);

    // ------------------------------
    // Nota selecionada por processo
    // ------------------------------
    const [notaSelecionadaPorProcesso, setNotaSelecionadaPorProcesso] = useState<{ [proc: number]: string }>({});

    // ------------------------------
    // Modal de Nova NF
    // ------------------------------
    const [processoSelecionadoParaNovaNF, setProcessoSelecionadoParaNovaNF] = useState<ProcessDetails | null>(null);
    const [novaNFForm, setNovaNFForm] = useState<{
        TipoNF: '0' | '1'; // 0 = Estadual (Produto), 1 = Municipal (Serviço)
        Especie: 'NF' | 'CT' | 'RE' | 'OU' | 'CF';
        Serie: string;
        NFEletronica: boolean;
        NumeroNotaFiscal: string;
        CodigoRemetente: string;
        ModeloNF: string; // código inteiro controlado pelo UAU
        DataEmissao: string;
        DataDeEmissaoMaiorQueCadastro: boolean;
        DataEntrada: string;
        DataDeEntradaMaiorQueCadastro: boolean;
    }>({
        TipoNF: '0',
        Especie: 'NF',
        Serie: '1',
        NFEletronica: true,
        NumeroNotaFiscal: '',
        CodigoRemetente: '',
        ModeloNF: '',
        DataEmissao: '',
        DataDeEmissaoMaiorQueCadastro: true,
        DataEntrada: '',
        DataDeEntradaMaiorQueCadastro: true,
    });

    // ------------------------------
    // Notificações
    // ------------------------------
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    const notify = (msg: string, type: 'success' | 'error') => {
        setNotification({ message: msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    // ------------------------------
    // Carregar modelos NF na inicialização (uma vez)
    // ------------------------------
    React.useEffect(() => {
        (async () => {
            try {
                const data = await fetchModelosNota();
                setModelosNF(data);
            } catch (err: any) {
                notify(err.message || 'Erro ao carregar modelos de NF.', 'error');
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ------------------------------
    // Carregar Notas
    // ------------------------------
    const handleFetchNotas = async () => {

        if (!cnpj.trim() || !startDateNF || !endDateNF) {
            notify("Preencha CNPJ, Data inicial e Data final para consultar Notas!", "error");
            return;
        }

        try {
            const data = await fetchNotasFiscais(cnpj, startDateNF, endDateNF);
            setNotas(data);
        } catch (error: any) {
            notify(error.message, 'error');
        }
    };

    // ------------------------------
    // Carregar Processos
    // ------------------------------
    const handleFetchProcessos = async () => {

        if (!empresa.trim() || !obra.trim() || !startDateProcess || !endDateProcess) {
            notify("Preencha Empresa, Obra, Data inicial e Data final para consultar Processos!", "error");
            return;
        }

        try {
            const data = await searchProcessNumbers(
                empresa,
                obra,
                startDateProcess,
                endDateProcess
            );
            setProcessos(data);
        } catch (error: any) {
            notify(error.message, 'error');
        }
    };

    // Selecionar Nota dentro do Processo
    const handleSelectNotaProcesso = (processoNumero: number, notaId: string) => {
        setNotaSelecionadaPorProcesso(prev => ({
            ...prev,
            [processoNumero]: notaId
        }));
    };

    // ------------------------------
    // Abrir modal de Nova NF para um processo
    const handleOpenNovaNFModal = (processo: ProcessDetails) => {
        setProcessoSelecionadoParaNovaNF(processo);
        setNovaNFForm((prev) => ({
            ...prev,
            NumeroNotaFiscal: '',
            CodigoRemetente: processo.codigoFornecedor ? String(processo.codigoFornecedor) : '',
            ModeloNF: '',
            DataEmissao: '',
            DataEntrada: '',
        }));
    };


    const handleSubmitNovaNF = async () => {
        if (!processoSelecionadoParaNovaNF) return;

        try {
            // validação de obrigatórios no modal
            if (!novaNFForm.NumeroNotaFiscal.trim()) {
                notify('Número da NF é obrigatório.', 'error');
                return;
            }
            if (!novaNFForm.CodigoRemetente.trim()) {
                notify('Código do remetente (fornecedor) é obrigatório.', 'error');
                return;
            }
            if (!novaNFForm.DataEmissao) {
                notify('Data de emissão é obrigatória.', 'error');
                return;
            }
            if (!novaNFForm.DataEntrada) {
                notify('Data de entrada é obrigatória.', 'error');
                return;
            }
            if (['NF', 'CT', 'CF'].includes(novaNFForm.Especie) && !novaNFForm.ModeloNF.trim()) {
                notify('Modelo da NF é obrigatório para espécies NF, CT e CF.', 'error');
                return;
            }

            const payload: GerarNotaFiscalRequest = {
                Empresa: Number(processoSelecionadoParaNovaNF.empresa),
                Obra: processoSelecionadoParaNovaNF.obra,
                NumeroProcesso: processoSelecionadoParaNovaNF.processo,
                TipoNF: novaNFForm.TipoNF === '0' ? 0 : 1,
                Especie: novaNFForm.Especie,
                Serie: novaNFForm.Serie,
                NFEletronica: novaNFForm.NFEletronica,
                NumeroNotaFiscal: novaNFForm.NumeroNotaFiscal,
                CodigoRemetente: Number(novaNFForm.CodigoRemetente),
                DataEmissao: novaNFForm.DataEmissao,
                DataDeEmissaoMaiorQueCadastro: novaNFForm.DataDeEmissaoMaiorQueCadastro,
                DataEntrada: novaNFForm.DataEntrada || novaNFForm.DataEmissao,
                DataDeEntradaMaiorQueCadastro: novaNFForm.DataDeEntradaMaiorQueCadastro,
                ModeloNF:
                    ['NF', 'CT', 'CF'].includes(novaNFForm.Especie) && novaNFForm.ModeloNF.trim()
                        ? novaNFForm.ModeloNF
                        : undefined,
                VincularADescontos: true,
            };

            await gerarNotaFiscalUAU(payload);

            // Marca o processo como tendo NF gerada (apenas em memória por enquanto)
            setProcessos((prev) =>
                prev.map((p) =>
                    p.processo === processoSelecionadoParaNovaNF.processo
                        ? { ...p, hasGeneratedNF: true }
                        : p
                )
            );

            notify('Nota Fiscal gerada e vinculada ao processo no UAU.', 'success');
            setProcessoSelecionadoParaNovaNF(null);
        } catch (error: any) {
            notify(error.message || 'Erro ao gerar Nota Fiscal no UAU.', 'error');
        }
    };

    // Vincular & Sincronizar
    // ------------------------------
    const handleLinkAndSyncProcesso = async (processoNumero: number) => {
        const notaId = notaSelecionadaPorProcesso[processoNumero];

        if (!notaId) {
            notify("Selecione uma Nota Fiscal!", "error");
            return;
        }

        setNotas(prev =>
            prev.map(n =>
                n.id === notaId ? { ...n, status: SyncStatus.SYNCING } : n
            )
        );

        try {
            const result = await syncToUau(notaId, processoNumero);

            setNotas(prev =>
                prev.map(n =>
                    n.id === notaId
                        ? {
                            ...n,
                            status: result.success ? SyncStatus.SYNCED : SyncStatus.ERROR,
                            errorMessage: result.success ? "" : result.message,
                            processNumber: String(processoNumero)
                        }
                        : n
                )
            );

            notify(
                result.success
                    ? `Nota sincronizada com o processo ${processoNumero}!`
                    : result.message,
                result.success ? "success" : "error"
            );

        } catch (err: any) {
            notify(err.message, "error");
        }
    };

    // ------------------------------
    // Layout final
    // ------------------------------
    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-sky-400">
                    Integração Arquivei ↔ UAU
                </h1>
                <span className="text-gray-400">
                    Painel — {new Date().toLocaleDateString('pt-BR')}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Coluna de Notas */}
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="font-semibold text-lg mb-3">Consultar Notas Fiscais</h2>

                    <div className="flex flex-wrap gap-3 items-end mb-4">

                        {/* CNPJ */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                CNPJ <span className="text-red-500">*</span>
                            </label>
                                <input
                                    placeholder="CNPJ"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                                    className={`p-2 rounded w-40 text-white 
                                        ${!cnpj.trim() ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                    `}
                                    title={!cnpj.trim() ? "Campo obrigatório" : ""}
                                />

                        </div>

                        {/* Data Inicial */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Data Inicial <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={startDateNF}
                                onChange={(e) => setStartDateNF(e.target.value)}
                                className={`p-2 rounded text-white 
                                    ${!startDateNF ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!startDateNF ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Data Final */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Data Final <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={endDateNF}
                                onChange={(e) => setEndDateNF(e.target.value)}
                                className={`p-2 rounded text-white 
                                    ${!endDateNF ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!endDateNF ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Botão */}
                        <button
                            onClick={handleFetchNotas}
                            disabled={!cnpj.trim() || !startDateNF || !endDateNF}
                            className={`flex items-center gap-2 font-semibold rounded px-3 py-2 text-sm whitespace-nowrap 
                                ${(!cnpj.trim() || !startDateNF || !endDateNF)
                                    ? "bg-sky-900 text-gray-500 cursor-not-allowed"
                                    : "bg-sky-600 hover:bg-sky-700"}`}
                        >
                            🔍 Buscar
                        </button>

                    </div>

                    {/* Lista NF */}
                    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                        {notas.map((nota) => (
                            <NotaFiscalCard
                                key={nota.id}
                                nota={nota}
                                isSelected={false}
                                onSelect={() => {}}
                            />
                        ))}
                    </div>
                </div>

                {/* Coluna de Processos */}
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="font-semibold text-lg mb-3">Consultar Processos UAU</h2>

                    <div className="flex flex-wrap gap-3 items-end mb-4">

                        {/* Empresa */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Empresa <span className="text-red-500">*</span>
                            </label>
                            <input
                                placeholder="Empresa"
                                value={empresa}
                                onChange={(e) => setEmpresa(e.target.value)}
                                className={`p-2 rounded text-white w-20
                                    ${!empresa.trim() ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!empresa.trim() ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Obra */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Obra <span className="text-red-500">*</span>
                            </label>
                            <input
                                placeholder="Obra"
                                value={obra}
                                onChange={(e) => setObra(e.target.value)}
                                className={`p-2 rounded text-white w-20
                                    ${!obra.trim() ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!obra.trim() ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Data Inicial */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Data Inicial <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={startDateProcess}
                                onChange={(e) => setStartDateProcess(e.target.value)}
                                className={`p-2 rounded text-white 
                                    ${!startDateProcess ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!startDateProcess ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Data Final */}
                        <div className="flex flex-col">
                            <label className="text-xs mb-1">
                                Data Final <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={endDateProcess}
                                onChange={(e) => setEndDateProcess(e.target.value)}
                                className={`p-2 rounded text-white 
                                    ${!endDateProcess ? "border-red-500 bg-red-900/20" : "border-gray-600 bg-gray-700"}
                                `}
                                title={!endDateProcess ? "Campo obrigatório" : ""}
                            />
                        </div>

                        {/* Botão */}
                        <button
                            onClick={handleFetchProcessos}
                            disabled={!empresa.trim() || !obra.trim() || !startDateProcess || !endDateProcess}
                            className={`flex items-center gap-2 font-semibold rounded px-3 py-2 text-sm whitespace-nowrap 
                                ${(!empresa.trim() || !obra.trim() || !startDateProcess || !endDateProcess)
                                    ? "bg-indigo-900 text-gray-500 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                            🔍 Buscar
                        </button>

                    </div>

                    {/* Lista Processos */}
                    <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                        {processos.map((proc) => (
                            <ProcessCard
                                key={proc.processo}
                                processo={proc}
                                notas={notas}
                                selectedNotaProcesso={notaSelecionadaPorProcesso[proc.processo]}
                                onSelectNota={handleSelectNotaProcesso}
                                onLinkAndSync={handleLinkAndSyncProcesso}
                                onNovaNFClick={handleOpenNovaNFModal}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Nova NF */}
            {processoSelecionadoParaNovaNF && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-emerald-400 mb-4">
                            Nova NF para Processo #{processoSelecionadoParaNovaNF.processo}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {/* Tipo da NF */}
                            <div>
                                <label className="text-xs text-gray-400">Tipo da NF</label>
                                <select
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    value={novaNFForm.TipoNF}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, TipoNF: e.target.value as '0' | '1' })}
                                >
                                    <option value="0">Estadual</option>
                                    <option value="1">Municipal</option>
                                </select>
                            </div>

                            {/* Espécie */}
                            <div>
                                <label className="text-xs text-gray-400">Espécie</label>
                                <select
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    value={novaNFForm.Especie}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, Especie: e.target.value as any })}
                                >
                                    <option value="NF">NF - Nota Fiscal</option>
                                    <option value="CT">CT - Conhecimento de transporte</option>
                                    <option value="RE">RE - Recibo</option>
                                    <option value="OU">OU - Outros</option>
                                    <option value="CF">CF - Cupom fiscal</option>
                                </select>
                            </div>

                            {/* Série */}
                            <div>
                                <label className="text-xs text-gray-400">Série</label>
                                <input
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    value={novaNFForm.Serie}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, Serie: e.target.value })}
                                />
                            </div>

                            {/* Modelo da NF (dinâmico por empresa) */}
                            <div>
                                <label className="text-xs text-gray-400">Modelo da NF</label>
                                <select
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    value={novaNFForm.ModeloNF}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, ModeloNF: e.target.value })}
                                >
                                    <option value="">Selecione o modelo</option>
                                    {modelosNF.map((m) => (
                                        <option key={String(m.codigo)} value={String(m.codigo)}>
                                            {m.codigo} - {m.descricao}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* NF-e */}
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    id="nf-eletronica"
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={novaNFForm.NFEletronica}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, NFEletronica: e.target.checked })}
                                />
                                <label htmlFor="nf-eletronica" className="text-xs text-gray-300">
                                    Nota Fiscal Eletrônica (NF-e)
                                </label>
                            </div>

                            {/* Número da NF */}
                            <div>
                                <label className="text-xs text-gray-400">Número da NF</label>
                                <input
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    value={novaNFForm.NumeroNotaFiscal}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, NumeroNotaFiscal: e.target.value })}
                                />
                            </div>

                            {/* Código do Remetente/Destinatário */}
                            <div>
                                <label className="text-xs text-gray-400">Código do Remetente</label>
                                <input
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    value={novaNFForm.CodigoRemetente}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, CodigoRemetente: e.target.value })}
                                />
                            </div>

                            {/* Valor da Nota (processo) */}
                            <div className="col-span-2">
                                <label className="text-xs text-gray-400">Valor da Nota (processo)</label>
                                <input
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    readOnly
                                    value={
                                        processoSelecionadoParaNovaNF
                                            ? (
                                                  (processoSelecionadoParaNovaNF.valorDocFiscal &&
                                                      processoSelecionadoParaNovaNF.valorDocFiscal > 0
                                                      ? processoSelecionadoParaNovaNF.valorDocFiscal
                                                      : processoSelecionadoParaNovaNF.valorAPagar
                                                  ) || 0
                                              ).toLocaleString('pt-BR', {
                                                  style: 'currency',
                                                  currency: 'BRL',
                                              })
                                            : ''
                                    }
                                />
                            </div>

                            {/* Datas */}
                            <div>
                                <label className="text-xs text-gray-400">Data Emissão</label>
                                <input
                                    type="date"
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    value={novaNFForm.DataEmissao}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, DataEmissao: e.target.value })}
                                />
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={novaNFForm.DataDeEmissaoMaiorQueCadastro}
                                        onChange={(e) => setNovaNFForm({ ...novaNFForm, DataDeEmissaoMaiorQueCadastro: e.target.checked })}
                                    />
                                    <span className="text-[11px] text-gray-300">Permitir emissão &gt; cadastro</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400">Data Entrada</label>
                                <input
                                    type="date"
                                    className="mt-1 w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                                    value={novaNFForm.DataEntrada}
                                    onChange={(e) => setNovaNFForm({ ...novaNFForm, DataEntrada: e.target.value })}
                                />
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={novaNFForm.DataDeEntradaMaiorQueCadastro}
                                        onChange={(e) => setNovaNFForm({ ...novaNFForm, DataDeEntradaMaiorQueCadastro: e.target.checked })}
                                    />
                                    <span className="text-[11px] text-gray-300">Permitir entrada &gt; cadastro</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 text-sm">
                            <button
                                onClick={() => setProcessoSelecionadoParaNovaNF(null)}
                                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmitNovaNF}
                                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                                Gerar NF no UAU
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

        </div>
    );
};

export default App;
