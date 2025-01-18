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
    const inicioTime = new Date(inicio).getTime();
    const fimTime = new Date(fim).getTime();
    const intervalo = (fimTime - inicioTime) / partes;

    const partesDivididas = {};
    for (let i = 0; i < partes; i++) {
        const inicioParte = new Date(inicioTime + i * intervalo).toISOString();
        const fimParte = new Date(inicioTime + (i + 1) * intervalo).toISOString();

        partesDivididas[`${i + 1}-parte`] = {
            "Inicio Horario": inicioParte,
            "Previsto Horario": fimParte,
            "Fim Horario": null // O campo "Fim Horario" pode ser atualizado posteriormente
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
            const filtered = pontosAcesso
                .filter((ponto) => ponto.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                .slice(0, MAX_RESULTS);
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
        const filtro = cidades.filter((cidade) =>
            cidade.nome.toLowerCase().includes(searchTermCidade.toLowerCase())
        );
        setFilteredCidades(filtro);
        setPage(0);
        setVisibleCidades(filtro.slice(0, CIDADES_POR_PAGINA));
    }, [searchTermCidade, cidades]);

    const carregarMaisCidades = () => {
        const proximaPagina = page + 1;
        const novasCidades = filteredCidades.slice(
            0,
            (proximaPagina + 1) * CIDADES_POR_PAGINA
        );
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

    const validarFormulario = async () => {
        if (!formData.protocoloISP.trim()) return "O protocolo ISP é obrigatório.";
        if (!formData.horarioInicial) return "O horário inicial é obrigatório.";
        if (!formData.horarioPrevisto) return "O horário previsto é obrigatório.";
        if (selectedPontos.length === 0) return "Selecione pelo menos um ponto de acesso.";
        if (new Date(formData.horarioPrevisto).getTime() <= new Date(formData.horarioInicial).getTime()) {
            return "O horário previsto deve ser maior que o horário inicial.";
        }
        const db = getFirestore();
        const protocoloRef = doc(db, "protocolos", formData.protocoloISP);
        const protocoloSnap = await getDoc(protocoloRef);
        if (protocoloSnap.exists()) {
            return "O protocolo ISP já existe. Escolha outro.";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const erro = await validarFormulario();
        if (erro) {
            // Notificação de erro
            toast.error(erro, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
            return;
        }

        try {
            
            const db = getFirestore();
            let divisaoManutencao = null;
            if (formData.manutencaoDividida && formData.partesManutencao > 1) {
                divisaoManutencao = dividirManutencao(
                    formData.horarioInicial,
                    formData.horarioPrevisto,
                    formData.partesManutencao
                );
            }

            // Filtrar pontos de acesso com base nas cidades selecionadas
            if (mostrarCidades && formData.cidadesSelecionadas.length > 0) {
                const pontosFiltrados = pontosAcesso.filter((ponto) =>
                    formData.cidadesSelecionadas.some((cidade) => cidade.nome === ponto.origem)
                );
                selectedPontos.push(...pontosFiltrados);
            }
            const analiseRef = doc(collection(db, "Analise"));

            const dados = {
                tipo: formData.tipo,
                protocoloISP: formData.protocoloISP,
                horarioInicial: formData.horarioInicial,
                horarioPrevisto: formData.horarioPrevisto,
                pontoAcesso: selectedPontos,
                regional: formData.regional,
                observacao: formData.observacao,
                cidadesSelecionadas: formData.cidadesSelecionadas,
                dataCriacao: new Date().toISOString(),
            };

            await setDoc(analiseRef, dados);

            // Reseta o formulário
            setFormData({
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
            setSelectedPontos([]);
            setSearchTerm("");
            setError(""); // Limpa os erros

            // Notificação de sucesso
            toast.success("Cadastro realizado com sucesso!", {
                position: "top-left", // Certifique-se de usar a constante correta
                autoClose: 3000, // Fecha em 3 segundos
            });
            navigate("/");
        } catch (error) {
            console.error("Erro ao cadastrar:", error);

            // Notificação de erro
            toast.error("Erro ao cadastrar. Tente novamente.", {
                position: "top-left", // Certifique-se de usar a constante correta
                autoClose: 5000, // Fecha em 5 segundos
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-11/12 max-w-3xl rounded-lg bg-white p-8 shadow-lg">
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
                    theme="dark"
                />
                <h1 className="mb-4 text-center text-2xl font-bold">Cadastro de Manutenção</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block font-bold">Tipo:</label>
                        <select
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            className="w-full rounded border p-2"
                        >
                            <option value="Manutenção">Manutenção</option>
                            <option value="Evento">Evento</option>
                            <option value="Solicitação emergencial">Solicitação emergencial</option>
                        </select>
                    </div>

                    {/* Protocolo ISP */}
                    <div>
                        <label className="block font-bold">Protocolo ISP:</label>
                        <input
                            type="text"
                            name="protocoloISP"
                            value={formData.protocoloISP}
                            onChange={handleChange}
                            className={`w-full rounded border p-2 ${error === "O protocolo ISP é obrigatório." ? "border-red-500" : ""}`}
                            placeholder="Digite o protocolo"
                        />
                        {error === "O protocolo ISP é obrigatório." && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    {/* Horários */}
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block font-bold">Horário Inicial:</label>
                            <input
                                type="datetime-local"
                                name="horarioInicial"
                                value={formData.horarioInicial}
                                onChange={handleChange}
                                className={`w-full rounded border p-2 ${error === "O horário inicial é obrigatório." ? "border-red-500" : ""}`}
                            />
                            {error === "O horário inicial é obrigatório." && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block font-bold">Horário Previsto:</label>
                            <input
                                type="datetime-local"
                                name="horarioPrevisto"
                                value={formData.horarioPrevisto}
                                onChange={handleChange}
                                className="w-full rounded border p-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold">Ponto de Acesso:</label>
                        <input
                            type="text"
                            placeholder="Pesquisar ponto de acesso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-2 w-full rounded border p-2"
                        />

                        {/* Lista de Resultados - Só exibe se houver termo de busca e resultados */}
                        {searchTerm && searchResults.length > 0 && (
                            <div className="max-h-40 overflow-y-auto rounded border p-4">
                                {searchResults.map((ponto) => (
                                    <div
                                        key={ponto.codcon}
                                        className={`flex cursor-pointer items-center justify-between border-b p-2 ${selectedPontos.some((item) => item.codcon === ponto.codcon) ? "bg-blue-100" : ""
                                            }`}
                                        onClick={() => handleSelectPonto(ponto)}
                                    >
                                        <span>{ponto.nome}</span>
                                        <span className="text-sm text-gray-500">{ponto.origem}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Exibir Pontos de Acesso Selecionados */}
                        <div className="mt-4">
                            <h2 className="mb-2 font-bold">Pontos de Acesso Selecionados:</h2>
                            {selectedPontos.length > 0 ? (
                                <ul className="ml-6 list-disc">
                                    {selectedPontos.map((item) => (
                                        <li key={item.codcon}>
                                            {item.nome} - <span className="text-sm text-gray-500">{item.origem}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">Nenhum ponto selecionado ainda.</p>
                            )}
                        </div>
                    </div>

                    {/* Regional */}
                    <div>
                        <label className="block font-bold">Regional:</label>
                        <select
                            name="regional"
                            value={formData.regional}
                            onChange={handleChange}
                            className="w-full rounded border p-2"
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

                    {/* Manutenção Dividida */}
                    <div>
                        <label className="block font-bold">Manutenção Dividida:</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="manutencaoDividida"
                                checked={formData.manutencaoDividida}
                                onChange={handleChange}
                            />
                            <span>Dividir manutenção</span>
                        </div>
                        {formData.manutencaoDividida && (
                            <div className="mt-2">
                                <label className="block font-bold">Quantidade de Partes:</label>
                                <input
                                    type="number"
                                    name="partesManutencao"
                                    value={formData.partesManutencao}
                                    onChange={handleChange}
                                    className="w-20 rounded border p-2"
                                    min="1"
                                    max="10"
                                />
                            </div>
                        )}
                    </div>
                    {/* Campo de pesquisa e lista de cidades */}
                    <div>
                        <label className="block font-bold">Deseja selecionar cidades?</label>
                        <input
                            type="checkbox"
                            checked={mostrarCidades}
                            onChange={toggleCidades}
                            className="mr-2"
                        />
                        <span>Habilitar seleção de cidades</span>
                    </div>

                    {/* Campo de cidades, visível apenas se o checkbox estiver ativado */}
                    {mostrarCidades && (
                        <div>
                            <label className="block font-bold">Seleção de Cidade (para Evento):</label>
                            <input
                                type="text"
                                placeholder="Pesquisar cidade..."
                                value={searchTermCidade}
                                onChange={(e) => setSearchTermCidade(e.target.value)}
                                className="mb-4 w-full rounded border p-2"
                            />

                            <div className="max-h-40 overflow-y-auto rounded border p-4">
                                {visibleCidades.map((cidade) => (
                                    <div
                                        key={cidade.id}
                                        className={`flex cursor-pointer items-center justify-between p-2 ${formData.cidadesSelecionadas.some((c) => c.id === cidade.id)
                                            ? "bg-blue-100"
                                            : ""
                                            }`}
                                        onClick={() => handleCidadeChange(cidade)}
                                    >
                                        <span>{cidade.nome}</span>
                                    </div>
                                ))}
                            </div>

                            {filteredCidades.length > visibleCidades.length && (
                                <button
                                    type="button"
                                    onClick={carregarMaisCidades}
                                    className="mt-2 block w-full rounded bg-gray-200 p-2 text-center text-sm"
                                >
                                    Carregar mais cidades
                                </button>
                            )}
                        </div>
                    )}
                    {/* Observação */}
                    <div>
                        <label className="block font-bold">Observação:</label>
                        <textarea
                            name="observacao"
                            value={formData.observacao}
                            onChange={handleChange}
                            className="w-full rounded border p-2"
                            rows="4"
                            placeholder="Digite alguma observação"
                        />
                    </div>

                    <button
                        type="submit"
                        className="block w-full rounded bg-blue-500 p-3 text-white"
                    >
                        Finalizar Cadastro
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Cadastro;
