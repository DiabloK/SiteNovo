import { useState, useEffect } from "react";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore"; // Importações Firestore
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Cadastro = () => {
    const [formData, setFormData] = useState({
        tipo: "Manutenção",
        protocoloISP: "",
        horarioInicial: "",
        horarioPrevisto: "",
        pontoAcesso: [],
        regional: "MFA",
        observacao: "",
        manutencaoDividida: false,
        partesManutencao: 1,
        cidadesSelecionadas: [],
    });

    const [pontosAcesso, setPontosAcesso] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPontos, setSelectedPontos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [mostrarCidades, setMostrarCidades] = useState(false);
    const [error, setError] = useState(""); // Erros de validação

    const MAX_RESULTS = 50;
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
    ];

    const fetchPontosAcesso = async () => {
        try {
            const response = await fetch("/pontosAcesso.json");
            const data = await response.json();
            const filteredData = data.map((ponto) => ({
                codcon: ponto.codcon,
                nome: ponto.nome_con,
                origem: ponto.origem,
            }));
            setPontosAcesso(filteredData);
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
        }
    };
    const navigate = useNavigate();

    const dividirManutencao = (inicio, fim, partes) => {
        // Apenas a primeira parte será preenchida com os horários iniciais e previstos
        const partesDivididas = {
            "1-parte": {
                "Inicio Horario": inicio,
                "Previsto Horario": fim,
                "Fim Horario": null,
            },
        };

        // As outras partes terão valores vazios para serem preenchidos no futuro
        for (let i = 2; i <= partes; i++) {
            partesDivididas[`${i}-parte`] = {
                "Inicio Horario": null,
                "Previsto Horario": null,
                "Fim Horario": null,
            };
        }
        return partesDivididas;
    };
    useEffect(() => {
        fetchPontosAcesso();
    }, []);

    useEffect(() => {
        if (searchTerm === "") {
            setSearchResults([]);
        } else {
            const filtered = pontosAcesso.filter((ponto) => ponto.nome.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, MAX_RESULTS);
            setSearchResults(filtered);
        }
    }, [searchTerm, pontosAcesso]);

    const handleSelectPonto = (ponto) => {
        if (selectedPontos.some((item) => item.codcon === ponto.codcon)) {
            setSelectedPontos(selectedPontos.filter((item) => item.codcon !== ponto.codcon));
        } else {
            setSelectedPontos([...selectedPontos, ponto]);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const [cidades, setCidades] = useState([]);
    const [searchTermCidade, setSearchTermCidade] = useState("");
    const [filteredCidades, setFilteredCidades] = useState([]);
    const [visibleCidades, setVisibleCidades] = useState([]);
    const [page, setPage] = useState(0);

    const CIDADES_POR_PAGINA = 10;

    const fetchCidades = async () => {
        try {
            const response = await fetch("/cidades.json");
            const data = await response.json();

            if (Array.isArray(data)) {
                setCidades(data);
                setFilteredCidades(data);
                setVisibleCidades(data.slice(0, CIDADES_POR_PAGINA));
            } else {
                console.error("Erro: O JSON de cidades não é um array.");
            }
        } catch (error) {
            console.error("Erro ao carregar o JSON de cidades:", error);
        }
    };

    useEffect(() => {
        fetchCidades();
    }, []);

    useEffect(() => {
        const filtro = cidades.filter((cidade) => cidade.nome.toLowerCase().includes(searchTermCidade.toLowerCase()));
        setFilteredCidades(filtro);
        setPage(0);
        setVisibleCidades(filtro.slice(0, CIDADES_POR_PAGINA));
    }, [searchTermCidade, cidades]);

    const carregarMaisCidades = () => {
        const proximaPagina = page + 1;
        const novasCidades = filteredCidades.slice(0, (proximaPagina + 1) * CIDADES_POR_PAGINA);
        setVisibleCidades(novasCidades);
        setPage(proximaPagina);
    };

    const handleCidadeChange = (cidade) => {
        const jaSelecionada = formData.cidadesSelecionadas.some((c) => c.id === cidade.id);
        if (jaSelecionada) {
            setFormData({
                ...formData,
                cidadesSelecionadas: formData.cidadesSelecionadas.filter((c) => c.id !== cidade.id),
            });
        } else {
            setFormData({
                ...formData,
                cidadesSelecionadas: [...formData.cidadesSelecionadas, cidade],
            });
        }
    };

    const toggleCidades = () => {
        setMostrarCidades(!mostrarCidades);
    };

    const validarFormulario = async (formData, selectedPontos, db) => {
        // Validação de campos obrigatórios
        if (!formData.protocoloISP.trim()) return "O protocolo ISP é obrigatório.";
        if (!formData.horarioInicial) return "O horário inicial é obrigatório.";
        if (!formData.horarioPrevisto) return "O horário previsto é obrigatório.";
        if (selectedPontos.length === 0) return "Selecione pelo menos um ponto de acesso.";

        // Verifica se o horário previsto é maior que o inicial
        if (new Date(formData.horarioPrevisto).getTime() <= new Date(formData.horarioInicial).getTime()) {
            return "O horário previsto deve ser maior que o horário inicial.";
        }

        // Validação de protocolo duplicado no Firestore
        const protocoloRef = doc(db, "protocolos", formData.protocoloISP);
        const protocoloSnap = await getDoc(protocoloRef);
        if (protocoloSnap.exists()) {
            return `O protocolo ISP ${formData.protocoloISP} já existe. Escolha outro.`;
        }

        return null; // Nenhum erro encontrado
    };

    const filtrarPontosPorCidade = async (loadingToastId) => {
        try {
            // Carrega os dois arquivos
            const [pontosResponse, cidadesResponse] = await Promise.all([fetch("/pontosAcesso.json"), fetch("/cidades.json")]);

            const pontosData = await pontosResponse.json();
            const cidadesData = await cidadesResponse.json();

            // Normaliza os nomes das cidades selecionadas para comparação
            const nomesCidadesSelecionadas = formData.cidadesSelecionadas
                .map((cidade) => (cidade?.nome || "").trim().toLowerCase())
                .filter((nome) => nome !== ""); // Remove valores inválidos

            console.log("Cidades Selecionadas (Normalizadas):", nomesCidadesSelecionadas);

            // Filtra os pontos de acesso com base no campo `nome_cid`
            const pontosFiltrados = pontosData.filter((ponto) => {
                const nomeCidadePonto = (ponto?.nome_cid || "").trim().toLowerCase();
                return nomesCidadesSelecionadas.includes(nomeCidadePonto);
            });

            toast.update(loadingToastId, {
                render: "Cadastro realizado com sucesso!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });

            return pontosFiltrados;
        } catch (error) {
            toast.update(loadingToastId, {
                render: "Erro ao cadastrar. Tente novamente.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
            return [];
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const db = getFirestore();
        const erro = await validarFormulario(formData, selectedPontos, db);
        if (erro) {
            toast.error(erro); // Exibe o erro via Toastify
            return;
        }

        try {

            const loadingToastId = toast.loading("Processando, por favor aguarde...");
            // Adicionar pontos de acesso com base nas cidades selecionadas
            if (mostrarCidades && formData.cidadesSelecionadas.length > 0) {
                const pontosFiltrados = pontosAcesso.filter((ponto) => formData.cidadesSelecionadas.some((cidade) => cidade.nome === ponto.origem));
                setSelectedPontos((prev) => [...prev, ...pontosFiltrados]);
            }

            // Divisão da manutenção, se aplicável
            let divisaoManutencao = null;
            if (formData.manutencaoDividida && formData.partesManutencao > 1) {
                divisaoManutencao = dividirManutencao(formData.horarioInicial, formData.horarioPrevisto, formData.partesManutencao);
            }
            let pontosFiltrados = [];
            if (mostrarCidades) {


                pontosFiltrados = await filtrarPontosPorCidade(loadingToastId);
            }
            const pontosFinal = [...new Set([...selectedPontos, ...pontosFiltrados])];

            // Preparar os dados para salvar no Firestore
            const dados = {
                tipo: formData.tipo,
                protocoloISP: formData.protocoloISP,
                horarioInicial: formData.horarioInicial,
                horarioPrevisto: formData.horarioPrevisto,
                horarioFinal: null,
                pontoAcesso: pontosFinal,
                regional: formData.regional,
                observacao: formData.observacao,
                cidadesSelecionadas: formData.cidadesSelecionadas,
                manutencaoDividida: formData.manutencaoDividida,
                Dividida: divisaoManutencao || null, // Adicionar divisão, se existir
                dataCriacao: new Date().toISOString(),
            };

            // Salvar no Firestore
            const analiseRef = doc(collection(db, "Analise"));
            await setDoc(analiseRef, dados);

            // Notificação de sucesso
            toast.success("Cadastro realizado com sucesso!", { position: "top-left", transition: Bounce });

            // Redirecionar para o Dashboard
            navigate("/");
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            toast.update(loadingToastId, {
                render: "Erro ao cadastrar. Tente novamente.",
                type: "error",
                isLoading: false,
                autoClose: 5000,
            });
        }
    };
    const handleProtocoloChange = (e) => {
        const valor = e.target.value;

        // Remove caracteres não numéricos e espaços
        const valorLimpo = valor.replace(/\D/g, "");

        setFormData({
            ...formData,
            protocoloISP: valorLimpo, // Atualiza o estado com o valor limpo
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-11/12 max-w-3xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
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
                <h1 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-slate-50">
                    Cadastro de Manutenção
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipo */}
                    <div>
                        <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">Tipo:</label>
                        <select
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            className="w-full rounded border border-gray-300 bg-white p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        >
                            <option value="Manutenção">Manutenção</option>
                            <option value="Evento">Evento</option>
                            <option value="Solicitação emergencial">Solicitação emergencial</option>
                        </select>
                    </div>

                    {/* Protocolo ISP */}
                    <div>
                        <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">Protocolo ISP:</label>
                        <input
                            type="text"
                            name="protocoloISP"
                            value={formData.protocoloISP}
                            onChange={handleProtocoloChange}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            placeholder="Digite o protocolo (somente números)"
                        />
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">Horário Inicial:</label>
                            <input
                                type="datetime-local"
                                name="horarioInicial"
                                value={formData.horarioInicial}
                                onChange={handleChange}
                                className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">Horário Previsto:</label>
                            <input
                                type="datetime-local"
                                name="horarioPrevisto"
                                value={formData.horarioPrevisto}
                                onChange={handleChange}
                                className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">
                            Ponto de Acesso:
                        </label>
                        <input
                            type="text"
                            placeholder="Pesquisar ponto de acesso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-4 w-full rounded border border-gray-300 bg-white p-2 text-slate-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50 dark:placeholder-gray-400"
                        />

                        {/* Lista de Resultados */}
                        {searchTerm && searchResults.length > 0 && (
                            <div className="max-h-40 overflow-y-auto rounded border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                {searchResults.map((ponto) => (
                                    <div
                                        key={ponto.codcon}
                                        className={`flex cursor-pointer items-center justify-between rounded p-2 transition-colors ${selectedPontos.some((item) => item.codcon === ponto.codcon)
                                            ? "bg-blue-100 dark:bg-blue-900"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                        onClick={() => handleSelectPonto(ponto)}
                                    >
                                        <span className="text-slate-900 dark:text-slate-50">{ponto.nome}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{ponto.origem}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Exibir Pontos de Acesso Selecionados */}
                        <div className="mt-4">
                            <h2 className="mb-2 font-bold text-slate-900 dark:text-slate-50">
                                Pontos de Acesso Selecionados:
                            </h2>
                            {selectedPontos.length > 0 ? (
                                <ul className="ml-4 list-disc space-y-1">
                                    {selectedPontos.map((item) => (
                                        <li
                                            key={item.codcon}
                                            className="text-slate-900 dark:text-slate-50"
                                        >
                                            {item.nome} -{" "}
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.origem}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                    Nenhum ponto selecionado ainda.
                                </p>
                            )}
                        </div>
                    </div>


                    {/* Regional */}
                    <div>
                        <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">Regional:</label>
                        <select
                            name="regional"
                            value={formData.regional}
                            onChange={handleChange}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                        >
                            {regionais.map((regional) => (
                                <option key={regional} value={regional}>
                                    {regional}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Manutenção Dividida */}
                    <div>
                        <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">
                            Manutenção Dividida:
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="manutencaoDividida"
                                checked={formData.manutencaoDividida}
                                onChange={handleChange}
                                className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                            />
                            <label className="text-slate-900 dark:text-slate-50">Dividir manutenção</label>
                        </div>

                        {formData.manutencaoDividida && (
                            <div className="mt-4">
                                <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">
                                    Quantidade de Partes:
                                </label>
                                <input
                                    type="number"
                                    name="partesManutencao"
                                    value={formData.partesManutencao}
                                    onChange={handleChange}
                                    className="w-20 rounded border border-gray-300 bg-white p-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                                    min="1"
                                    max="10"
                                />
                            </div>
                        )}
                    </div>

                    {/* Campo de pesquisa e lista de cidades */}
                    <div className="mt-6">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={mostrarCidades}
                                onChange={toggleCidades}
                                className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                            />
                            <label className="text-slate-900 dark:text-slate-50">Habilitar seleção de cidades</label>
                        </div>

                        {mostrarCidades && (
                            <div className="mt-4">
                                <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">
                                    Seleção de Cidade (para Evento):
                                </label>
                                <input
                                    type="text"
                                    placeholder="Pesquisar cidade..."
                                    value={searchTermCidade}
                                    onChange={(e) => setSearchTermCidade(e.target.value)}
                                    className="mb-4 w-full rounded border border-gray-300 bg-white p-2 text-slate-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50 dark:placeholder-gray-400"
                                />

                                {/* Lista de Cidades */}
                                <div className="max-h-40 overflow-y-auto rounded border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    {visibleCidades.map((cidade) => (
                                        <div
                                            key={cidade.id}
                                            className={`flex cursor-pointer items-center justify-between rounded p-2 transition-colors ${formData.cidadesSelecionadas.some((c) => c.id === cidade.id)
                                                ? "bg-blue-100 dark:bg-blue-900"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                                }`}
                                            onClick={() => handleCidadeChange(cidade)}
                                        >
                                            <span className="text-slate-900 dark:text-slate-50">{cidade.nome}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Botão para Carregar Mais Cidades */}
                                {filteredCidades.length > visibleCidades.length && (
                                    <button
                                        type="button"
                                        onClick={carregarMaisCidades}
                                        className="mt-4 block w-full rounded bg-gray-200 p-2 text-center text-sm text-slate-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-slate-50 dark:hover:bg-gray-600"
                                    >
                                        Carregar mais cidades
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Observação */}
                    <div>
                        <label className="block mb-2 font-bold text-slate-900 dark:text-slate-50">Observação:</label>
                        <textarea
                            name="observacao"
                            value={formData.observacao}
                            onChange={handleChange}
                            className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                            rows="4"
                            placeholder="Digite alguma observação"
                        />
                    </div>

                    <button
                        type="submit"
                        className="block w-full rounded bg-blue-500 p-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500"
                    >
                        Finalizar Cadastro
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Cadastro;
