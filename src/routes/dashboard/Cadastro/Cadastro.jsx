import React, { useState, useEffect } from "react";

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
        partesManutencao: 1, // Padrão: 1 parte
        cidadesSelecionadas: [], // Novo campo para cidades selecionadas
    });

    const [pontosAcesso, setPontosAcesso] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPontos, setSelectedPontos] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Processar divisão de manutenção
        const protocolos = [];
        for (let i = 1; i <= (formData.manutencaoDividida ? formData.partesManutencao : 1); i++) {
            protocolos.push({
                ...formData,
                parte: i, // Parte atual
                pontoAcesso: selectedPontos,
            });
        }

        console.log("Protocolos enviados:", protocolos);
    };

    const [cidades, setCidades] = useState([]); // Lista de cidades carregadas do JSON
    const [searchTermCidade, setSearchTermCidade] = useState(""); // Campo de pesquisa
    const [filteredCidades, setFilteredCidades] = useState([]); // Cidades filtradas pela pesquisa
    const [visibleCidades, setVisibleCidades] = useState([]); // Cidades exibidas no momento
    const [page, setPage] = useState(0); // Página atual de carregamento

    const CIDADES_POR_PAGINA = 10;

    // Função para carregar o JSON de cidades
    const fetchCidades = async () => {
        try {
            const response = await fetch("/cidades.json");
            const data = await response.json();

            if (Array.isArray(data)) {
                setCidades(data); // Armazena todas as cidades
                setFilteredCidades(data); // Inicialmente, todas as cidades estão disponíveis para exibição
                setVisibleCidades(data.slice(0, CIDADES_POR_PAGINA)); // Carrega as 10 primeiras
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

    // Atualiza a lista de cidades filtradas e reseta a paginação
    useEffect(() => {
        if (Array.isArray(cidades)) {
            const filtro = cidades.filter((cidade) => cidade.toLowerCase().includes(searchTermCidade.toLowerCase()));
            setFilteredCidades(filtro);
            setPage(0); // Reseta a página para o início
            setVisibleCidades(filtro.slice(0, CIDADES_POR_PAGINA));
        }
    }, [searchTermCidade, cidades]);

    // Carrega mais 10 cidades ao clicar em "Carregar mais"
    const carregarMaisCidades = () => {
        const proximaPagina = page + 1;
        const novasCidades = filteredCidades.slice(0, (proximaPagina + 1) * CIDADES_POR_PAGINA);
        setVisibleCidades(novasCidades);
        setPage(proximaPagina);
    };

    const handleCidadeChange = (cidade) => {
        const jaSelecionada = formData.cidadesSelecionadas.includes(cidade);
        if (jaSelecionada) {
            setFormData({
                ...formData,
                cidadesSelecionadas: formData.cidadesSelecionadas.filter((c) => c !== cidade),
            });
        } else {
            setFormData({
                ...formData,
                cidadesSelecionadas: [...formData.cidadesSelecionadas, cidade],
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-11/12 max-w-3xl rounded-lg bg-white p-8 shadow-lg">
                <h1 className="mb-4 text-center text-2xl font-bold">Cadastro de Manutenção</h1>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Campo Tipo */}
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
                            className="w-full rounded border p-2"
                            placeholder="Digite o protocolo"
                        />
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
                                className="w-full rounded border p-2"
                            />
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
                                        className={`flex cursor-pointer items-center justify-between border-b p-2 ${
                                            selectedPontos.some((item) => item.codcon === ponto.codcon) ? "bg-blue-100" : ""
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
                        <label className="block font-bold">Seleção de Cidade (para Evento):</label>
                        <input
                            type="text"
                            placeholder="Pesquisar cidade..."
                            value={searchTermCidade}
                            onChange={(e) => setSearchTermCidade(e.target.value)}
                            className="mb-4 w-full rounded border p-2"
                        />

                        {/* Exibe lista de cidades (carrega incrementalmente) */}
                        <div className="max-h-40 overflow-y-auto rounded border p-4">
                            {Array.isArray(visibleCidades) &&
                                visibleCidades.map((cidade, index) => (
                                    <div
                                        key={index}
                                        className={`flex cursor-pointer items-center justify-between p-2 ${
                                            formData.cidadesSelecionadas.includes(cidade) ? "bg-blue-100" : ""
                                        }`}
                                        onClick={() => handleCidadeChange(cidade)}
                                    >
                                        <span>{cidade}</span>
                                    </div>
                                ))}
                        </div>

                        {/* Botão para carregar mais resultados */}
                        {Array.isArray(filteredCidades) && filteredCidades.length > visibleCidades.length && (
                            <button
                                type="button"
                                onClick={carregarMaisCidades}
                                className="mt-2 block w-full rounded bg-gray-200 p-2 text-center text-sm"
                            >
                                Carregar mais cidades
                            </button>
                        )}
                    </div>

                    {/* Exibir cidades selecionadas */}
                    <div>
                        <h2 className="font-bold">Cidades Selecionadas:</h2>
                        {formData.cidadesSelecionadas.length > 0 ? (
                            <ul>
                                {formData.cidadesSelecionadas.map((cidade, index) => (
                                    <li key={index}>{cidade}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Nenhuma cidade selecionada ainda.</p>
                        )}
                    </div>

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
