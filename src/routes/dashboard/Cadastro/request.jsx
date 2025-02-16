import { useState, useEffect, useRef } from "react";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

/* Hook que detecta clique fora de um elemento (ref) */
function useClickOutside(ref, callback) {
    useEffect(() => {
        function handleClick(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [ref, callback]);
}

/* Componente de Toggle Switch */
function Toggle({ checked, onChange, label }) {
    return (
        <label className="relative inline-flex cursor-pointer items-center">
            {/* Input invisível para acessibilidade */}
            <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={onChange}
            />
            {/* Corpo do switch */}
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-500 dark:bg-gray-600 dark:peer-checked:bg-blue-500" />
            {/* Label ao lado do switch */}
            <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-50">{label}</span>
        </label>
    );
}

const CadastroBackbone = () => {
    // ------------------------------
    // Estados para o formulário de Backbone
    // (Adicionamos "usuarioSolicitante" e "cidade")
    // ------------------------------
    const [backboneData, setBackboneData] = useState({
        usuarioSolicitante: "",
        gerenciaSetor: "",
        parceiroSwap: false,
        gerencia: "",
        atividadeRede: false,
        resumo: "",
        classificacao: "",
        grupoAtividade: "",
        impactoBackbone: "", // "Interrupção", "Perda proteção" ou "Não"
        impactoClientes: "", // "Interrupção", "Perda proteção" ou "Não"
        criticidade: "", // "Alta", "Média" ou "Baixa"
        envolveEquipamento: false,
        envolveDwdm: false,
        regional: "MFA",
        cidade: "",
        dataPrevista1: "",
        dataPrevista2: "",
        horaInicio: "",
        horaFim: "",
        ispProtocolo: "",
        justificacao: "",
        descricao: "",
    });

    // Estados para seleção de “Cidade Afetada”
    const [backboneCidadesAfetadas, setBackboneCidadesAfetadas] = useState([]);
    const [searchTermCidadeAfetada, setSearchTermCidadeAfetada] = useState("");
    const [citySearchResultsAfetada, setCitySearchResultsAfetada] = useState([]);
    const cidadeAfetadaRef = useRef(null);

    // Carrega lista de cidades (usada tanto no select de "Cidade" quanto para "Cidade Afetada")
    const [cidades, setCidades] = useState([]);
    useEffect(() => {
        const fetchCidades = async () => {
            try {
                const response = await fetch("/cidades.json");
                const data = await response.json();
                if (Array.isArray(data)) {
                    setCidades(data);
                }
            } catch (error) {
                console.error("Erro ao carregar cidades:", error);
            }
        };
        fetchCidades();
    }, []);

    // Filtro para "Cidade Afetada"
    useEffect(() => {
        if (!searchTermCidadeAfetada) {
            setCitySearchResultsAfetada([]);
            return;
        }
        const filtered = cidades.filter((cid) => (cid.nome || "").toLowerCase().includes(searchTermCidadeAfetada.toLowerCase()));
        setCitySearchResultsAfetada(filtered);
    }, [searchTermCidadeAfetada, cidades]);

    useClickOutside(cidadeAfetadaRef, () => {
        if (searchTermCidadeAfetada || citySearchResultsAfetada.length > 0) {
            setSearchTermCidadeAfetada("");
            setCitySearchResultsAfetada([]);
        }
    });

    const handleSelectCidadeAfetada = (cidade) => {
        const exists = backboneCidadesAfetadas.some((c) => c.id === cidade.id);
        if (!exists) {
            setBackboneCidadesAfetadas((prev) => [...prev, cidade]);
        }
        setSearchTermCidadeAfetada("");
        setCitySearchResultsAfetada([]);
    };

    const handleRemoveCidadeAfetada = (id) => {
        setBackboneCidadesAfetadas((prev) => prev.filter((c) => c.id !== id));
    };

    // Outros estados e constantes
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const regionais = [
        "MFA",
        "JCA",
        "CTA",
        "JGS",
        "JVE",
        "SOO",
        "CCO",
        "SPO",
        "RJO",
        "LGS",
        "PYE",
        "MS",
        "CSL",
        "CSC",
        "PGO",
        "CDR",
        "UVA",
        "VDA",
        "CNI",
        "RSL",
        "IRI",
        "ITH",
    ];

    // ------------------------------
    // Validação do formulário Backbone
    // ------------------------------
    const validarFormularioBackbone = async (data, db) => {
        if (!data.usuarioSolicitante.trim()) {
            return "O Usuário Solicitante é obrigatório.";
        }
        if (!data.gerenciaSetor) {
            return "A Gerência/Setor é obrigatória.";
        }
        if (!data.gerencia) {
            return "A Gerência é obrigatória.";
        }
        if (!data.ispProtocolo.trim()) {
            return "O ISP Protocolo é obrigatório.";
        }
        if (!data.dataPrevista1) {
            return "A Data Prevista 1 é obrigatória.";
        }
        if (!data.horaInicio) {
            return "A Hora de Início é obrigatória.";
        }

        // Verifica duplicidade do protocolo
        const protocoloRef = doc(db, "protocolos", data.ispProtocolo);
        const protocoloSnap = await getDoc(protocoloRef);
        if (protocoloSnap.exists()) {
            return `O ISP Protocolo ${data.ispProtocolo} já existe. Escolha outro.`;
        }
        return null;
    };

    // ------------------------------
    // Submissão do formulário
    // ------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const db = getFirestore();
            const erro = await validarFormularioBackbone(backboneData, db);
            if (erro) {
                toast.error(erro);
                setIsSubmitting(false);
                return;
            }
            const loadingToastId = toast.loading("Processando, por favor aguarde...");

            const payload = {
                tipo: "Backbone", // Sempre Backbone nesta página
                usuarioSolicitante: backboneData.usuarioSolicitante,
                gerenciaSetor: backboneData.gerenciaSetor,
                parceiroSwap: backboneData.parceiroSwap,
                gerencia: backboneData.gerencia,
                atividadeRede: backboneData.atividadeRede,
                resumo: backboneData.resumo,
                classificacao: backboneData.classificacao,
                grupoAtividade: backboneData.grupoAtividade,
                impactoBackbone: backboneData.impactoBackbone,
                impactoClientes: backboneData.impactoClientes,
                criticidade: backboneData.criticidade,
                envolveEquipamento: backboneData.envolveEquipamento,
                envolveDwdm: backboneData.envolveDwdm,
                regional: backboneData.regional,
                cidade: backboneData.cidade,
                dataPrevista1: backboneData.dataPrevista1,
                dataPrevista2: backboneData.dataPrevista2,
                horaInicio: backboneData.horaInicio,
                horaFim: backboneData.horaFim,
                ispProtocolo: backboneData.ispProtocolo,
                justificacao: backboneData.justificacao,
                descricao: backboneData.descricao,
                cidadesAfetadas: backboneCidadesAfetadas,
                dataCriacao: new Date().toISOString(),
                status: "Analise",
            };

            const protocoloRef = doc(db, "protocolos", backboneData.ispProtocolo);
            await setDoc(protocoloRef, { ...payload, id: backboneRef.id });

            // Salva também na coleção "Requisição"
            const requisicaoRef = doc(collection(db, "Requisição"));
            await setDoc(requisicaoRef, { ...payload, id: requisicaoRef.id });

            toast.update(loadingToastId, {
                render: "Cadastro de Backbone realizado com sucesso!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
            navigate("/");
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            toast.error("Erro ao cadastrar. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-transparent text-slate-100">
            <div className="w-11/12 max-w-3xl rounded-lg border border-black bg-white p-8 shadow-lg dark:bg-gray-800">
                <ToastContainer
                    position="top-left"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme={document.documentElement.classList.contains("dark") ? "dark" : "light"}
                />

                <h1 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-slate-50">Cadastro de Requisição</h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Usuário Solicitante */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Usuário Solicitante:</label>
                        <input
                            type="text"
                            name="usuarioSolicitante"
                            value={backboneData.usuarioSolicitante}
                            onChange={(e) => setBackboneData({ ...backboneData, usuarioSolicitante: e.target.value })}
                            className="w-full rounded border border-gray-300 bg-white p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            placeholder="Digite o nome do usuário solicitante"
                        />
                    </div>

                    {/* Gerências/Setor */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Gerências/Setor:</label>
                        <select
                            name="gerenciaSetor"
                            value={backboneData.gerenciaSetor}
                            onChange={(e) => setBackboneData({ ...backboneData, gerenciaSetor: e.target.value })}
                            className="w-full rounded border border-gray-300 bg-white p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        >
                            <option value="">Selecione</option>
                            <option value="Administrativo e Financeiro">Administrativo e Financeiro</option>
                            <option value="Comercial Corporativo Oeste">Comercial Corporativo Oeste</option>
                            <option value="Comercial Corporativo Sudeste e Operadoras">Comercial Corporativo Sudeste e Operadoras</option>
                            <option value="Comercial Varejo">Comercial Varejo</option>
                            <option value="Entregas e Soluções Corporativas">Entregas e Soluções Corporativas</option>
                            <option value="Operações de Campo Corporativo e Backbone">Operações de Campo Corporativo e Backbone</option>
                            <option value="Operações de Campo Varejo">Operações de Campo Varejo</option>
                            <option value="Engenharia de Expansão">Engenharia de Expansão</option>
                            <option value="Engenharia e Operações de Rede">Engenharia e Operações de Rede</option>
                            <option value="Transformação Digital e Governança">Transformação Digital e Governança</option>
                            <option value="Relacionamento com Cliente">Relacionamento com Cliente</option>
                            <option value="Comercial Corporativo Leste">Comercial Corporativo Leste</option>
                            <option value="Comercial Governo">Comercial Governo</option>
                            <option value="Quality Assurance">Quality Assurance</option>
                        </select>
                    </div>

                    {/* Toggle - Parceiro swap/Last Mile */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Parceiro swap/Last Mile?</label>
                        <Toggle
                            checked={backboneData.parceiroSwap}
                            onChange={(e) => setBackboneData({ ...backboneData, parceiroSwap: e.target.checked })}
                            label="Ativar"
                        />
                    </div>

                    {/* Gerência */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Gerência:</label>
                        <select
                            name="gerencia"
                            value={backboneData.gerencia}
                            onChange={(e) => setBackboneData({ ...backboneData, gerencia: e.target.value })}
                            className="w-full rounded border border-gray-300 bg-white p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        >
                            <option value="">Selecione</option>
                            <option value="Gustavo Rebello">Gustavo Rebello</option>
                            <option value="Flavio Zucchi">Flavio Zucchi</option>
                            <option value="Rodrigo Schoffel">Rodrigo Schoffel</option>
                            <option value="Edilson Valgoi">Edilson Valgoi</option>
                            <option value="Wesley Gonçalves">Wesley Gonçalves</option>
                            <option value="Erich Hannes">Erich Hannes</option>
                            <option value="Rodrigo Piccolo">Rodrigo Piccolo</option>
                            <option value="Jessé Turcattel">Jessé Turcattel</option>
                            <option value="Marcos Cavali">Marcos Cavali</option>
                            <option value="Carole Bestetti">Carole Bestetti</option>
                            <option value="Gilmar Balbinot">Gilmar Balbinot</option>
                            <option value="Rodrio Bestetti">Rodrio Bestetti</option>
                            <option value="Marcelo Balbinot">Marcelo Balbinot</option>
                            <option value="Everton Siqueira">Everton Siqueira</option>
                        </select>
                    </div>

                    {/* Toggle - Atividade em Rede de Parceiro */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Atividade em Rede de Parceiro?</label>
                        <Toggle
                            checked={backboneData.atividadeRede}
                            onChange={(e) => setBackboneData({ ...backboneData, atividadeRede: e.target.checked })}
                            label="Ativar"
                        />
                    </div>

                    {/* Resumo */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Resumo:</label>
                        <textarea
                            name="resumo"
                            value={backboneData.resumo}
                            onChange={(e) => setBackboneData({ ...backboneData, resumo: e.target.value })}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            rows="3"
                            placeholder="Digite um resumo da atividade"
                        />
                    </div>

                    {/* Classificação */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Classificação:</label>
                        <select
                            name="classificacao"
                            value={backboneData.classificacao}
                            onChange={(e) => setBackboneData({ ...backboneData, classificacao: e.target.value })}
                            className="w-full rounded border border-gray-300 bg-white p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        >
                            <option value="">Selecione</option>
                            <option value="Melhoria">Melhoria</option>
                            <option value="Ampliação">Ampliação</option>
                            <option value="Novo">Novo</option>
                            <option value="Emergencial">Emergencial</option>
                        </select>
                    </div>

                    {/* Grupo de Atividade */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Grupo de Atividade:</label>
                        <select
                            name="grupoAtividade"
                            value={backboneData.grupoAtividade}
                            onChange={(e) => setBackboneData({ ...backboneData, grupoAtividade: e.target.value })}
                            className="w-full rounded border border-gray-300 bg-white p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        >
                            <option value="">Selecione</option>
                            <option value="Rede óptica">Rede óptica</option>
                            <option value="Equipamento">Equipamento</option>
                            <option value="DWDM">DWDM</option>
                            <option value="Elétrica">Elétrica</option>
                            <option value="POP">POP</option>
                        </select>
                    </div>

                    {/* Impacto no Backbone (radio buttons) */}
                    {/* Impacto no Backbone (radio buttons) */}
                    <div className="mb-6">
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Impacto no Backbone:</label>
                        <div className="grid grid-cols-3 gap-4 text-slate-900 dark:text-slate-50">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="impactoBackbone"
                                    value="Interrupção"
                                    checked={backboneData.impactoBackbone === "Interrupção"}
                                    onChange={(e) => setBackboneData({ ...backboneData, impactoBackbone: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Interrupção</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="impactoBackbone"
                                    value="Perda proteção"
                                    checked={backboneData.impactoBackbone === "Perda proteção"}
                                    onChange={(e) => setBackboneData({ ...backboneData, impactoBackbone: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Perda proteção</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="impactoBackbone"
                                    value="Não"
                                    checked={backboneData.impactoBackbone === "Não"}
                                    onChange={(e) => setBackboneData({ ...backboneData, impactoBackbone: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Não</span>
                            </label>
                        </div>
                    </div>

                    {/* Impacto em Clientes (radio buttons) */}
                    <div className="mb-6">
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Impacto em Clientes:</label>
                        <div className="grid grid-cols-3 gap-4 text-slate-900 dark:text-slate-50">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="impactoClientes"
                                    value="Interrupção"
                                    checked={backboneData.impactoClientes === "Interrupção"}
                                    onChange={(e) => setBackboneData({ ...backboneData, impactoClientes: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Interrupção</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="impactoClientes"
                                    value="Perda proteção"
                                    checked={backboneData.impactoClientes === "Perda proteção"}
                                    onChange={(e) => setBackboneData({ ...backboneData, impactoClientes: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Perda proteção</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="impactoClientes"
                                    value="Não"
                                    checked={backboneData.impactoClientes === "Não"}
                                    onChange={(e) => setBackboneData({ ...backboneData, impactoClientes: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Não</span>
                            </label>
                        </div>
                    </div>

                    {/* Criticidade (radio buttons) */}
                    <div className="mb-6">
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Criticidade:</label>
                        <div className="grid w-full max-w-lg grid-cols-3 gap-4 text-slate-900 dark:text-slate-50">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="criticidade"
                                    value="Alta"
                                    checked={backboneData.criticidade === "Alta"}
                                    onChange={(e) => setBackboneData({ ...backboneData, criticidade: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Alta</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="criticidade"
                                    value="Média"
                                    checked={backboneData.criticidade === "Média"}
                                    onChange={(e) => setBackboneData({ ...backboneData, criticidade: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Média</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="criticidade"
                                    value="Baixa"
                                    checked={backboneData.criticidade === "Baixa"}
                                    onChange={(e) => setBackboneData({ ...backboneData, criticidade: e.target.value })}
                                    className="accent-black"
                                />
                                <span>Baixa</span>
                            </label>
                        </div>
                    </div>

                    {/* Toggle - Envolve equipamento? */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Envolve equipamento?</label>
                        <Toggle
                            checked={backboneData.envolveEquipamento}
                            onChange={(e) => setBackboneData({ ...backboneData, envolveEquipamento: e.target.checked })}
                            label="Ativar"
                        />
                    </div>

                    {/* Toggle - Envolve DWDM? */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Envolve DWDM?</label>
                        <Toggle
                            checked={backboneData.envolveDwdm}
                            onChange={(e) => setBackboneData({ ...backboneData, envolveDwdm: e.target.checked })}
                            label="Ativar"
                        />
                    </div>

                    {/* Regional */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Regional:</label>
                        <select
                            name="regional"
                            value={backboneData.regional}
                            onChange={(e) => setBackboneData({ ...backboneData, regional: e.target.value })}
                            className="w-full rounded border border-gray-300 bg-white p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        >
                            {regionais.map((regional) => (
                                <option
                                    key={regional}
                                    value={regional}
                                >
                                    {regional}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cidade (Select abaixo da Regional) */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Cidade Afetada:</label>
                        <div
                            ref={cidadeAfetadaRef}
                            className="relative mb-4 rounded border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700"
                        >
                            <div className="flex flex-wrap gap-1">
                                {backboneCidadesAfetadas.map((cidade) => (
                                    <div
                                        key={cidade.id}
                                        className="flex items-center rounded bg-blue-100 px-2 py-1 text-slate-900 dark:bg-blue-900 dark:text-slate-50"
                                    >
                                        <span className="mr-1">
                                            {cidade.nome} {cidade.sigla ? `- ${cidade.sigla}` : ""}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCidadeAfetada(cidade.id)}
                                            className="font-bold text-red-600"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    className="min-w-[80px] flex-1 bg-transparent text-slate-900 placeholder-gray-500 outline-none dark:text-slate-50 dark:placeholder-gray-400"
                                    placeholder="Pesquisar cidade..."
                                    value={searchTermCidadeAfetada}
                                    onChange={(e) => setSearchTermCidadeAfetada(e.target.value)}
                                />
                            </div>
                            {searchTermCidadeAfetada && citySearchResultsAfetada.length > 0 && (
                                <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                                    {citySearchResultsAfetada.map((cidade) => (
                                        <li
                                            key={cidade.id}
                                            onClick={() => handleSelectCidadeAfetada(cidade)}
                                            className="cursor-pointer p-2 text-slate-900 hover:bg-blue-100 dark:text-slate-50 dark:hover:bg-gray-700"
                                        >
                                            {cidade.nome} {cidade.sigla ? `- ${cidade.sigla}` : ""}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Data Prevista 1 */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Data Prevista 1:</label>
                        <input
                            type="date"
                            name="dataPrevista1"
                            value={backboneData.dataPrevista1}
                            onChange={(e) => setBackboneData({ ...backboneData, dataPrevista1: e.target.value })}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        />
                    </div>

                    {/* Data Prevista 2 */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Data Prevista 2:</label>
                        <input
                            type="date"
                            name="dataPrevista2"
                            value={backboneData.dataPrevista2}
                            onChange={(e) => setBackboneData({ ...backboneData, dataPrevista2: e.target.value })}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        />
                    </div>

                    {/* Hora Início */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Hora Início:</label>
                        <input
                            type="time"
                            name="horaInicio"
                            value={backboneData.horaInicio}
                            onChange={(e) => setBackboneData({ ...backboneData, horaInicio: e.target.value })}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        />
                    </div>

                    {/* Hora Fim */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Hora Fim:</label>
                        <input
                            type="time"
                            name="horaFim"
                            value={backboneData.horaFim}
                            onChange={(e) => setBackboneData({ ...backboneData, horaFim: e.target.value })}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        />
                    </div>

                    {/* ISP Protocolo */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">ISP Protocolo:</label>
                        <input
                            type="text"
                            name="ispProtocolo"
                            value={backboneData.ispProtocolo}
                            onChange={(e) =>
                                setBackboneData({
                                    ...backboneData,
                                    ispProtocolo: e.target.value.replace(/\D/g, ""),
                                })
                            }
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            placeholder="Digite o protocolo (somente números)"
                        />
                    </div>

                    {/* Justificação */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Justificação:</label>
                        <textarea
                            name="justificacao"
                            value={backboneData.justificacao}
                            onChange={(e) => setBackboneData({ ...backboneData, justificacao: e.target.value })}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            rows="3"
                            placeholder="Digite a justificação"
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Descrição:</label>
                        <textarea
                            name="descricao"
                            value={backboneData.descricao}
                            onChange={(e) => setBackboneData({ ...backboneData, descricao: e.target.value })}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            rows="4"
                            placeholder="Digite a descrição"
                        />
                    </div>
                    {/* Botão de envio */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="block w-full rounded bg-blue-500 p-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Enviando...</span>
                            </div>
                        ) : (
                            "Finalizar Cadastro"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CadastroBackbone;
