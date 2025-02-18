import { useState, useEffect, useRef } from "react";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { getDadosCliente } from "@/utils/apiClient";

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
      <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-50">
        {label}
      </span>
    </label>
  );
}

const Cadastro = () => {
  // -------------------------------------------------------------
  // 1) Estados principais do formulário
  // -------------------------------------------------------------
  const [formData, setFormData] = useState({
    tipo: "Manutenção",
    protocoloISP: "",
    horarioInicial: "",
    horarioPrevisto: "",
    regional: "MFA",
    observacao: "",
    manutencaoDividida: false,
    partesManutencao: 1,
    cidadesSelecionadas: [], // Cidade Massiva
  });

  // -------------------------------------------------------------
  // 2) Estados para Pontos de Acesso
  // -------------------------------------------------------------
  const [pontosAcesso, setPontosAcesso] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPontos, setSelectedPontos] = useState([]);
  const [isLoadingPontos, setIsLoadingPontos] = useState(false);
  const pontosRef = useRef(null); // Para fechar dropdown ao clicar fora

  // -------------------------------------------------------------
  // 3) Estados para Cidades (para Cidade Massiva e Local de Ocorrência)
  // -------------------------------------------------------------
  const [cidades, setCidades] = useState([]);
  const [searchTermCidade, setSearchTermCidade] = useState("");
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [mostrarCidades, setMostrarCidades] = useState(false);
  const cidadesRef = useRef(null);

  // Novo campo: Local de Ocorrência
  const [selectedLocalCidades, setSelectedLocalCidades] = useState([]);
  const [searchTermLocal, setSearchTermLocal] = useState("");
  const [searchResultsLocal, setSearchResultsLocal] = useState([]);
  const localRef = useRef(null);

  // -------------------------------------------------------------
  // 4) Estados para Digisac
  // -------------------------------------------------------------
  const [habilitarDigisac, setHabilitarDigisac] = useState(false);
  const [digisacData, setDigisacData] = useState([]);
  const [searchTermDigisac, setSearchTermDigisac] = useState("");
  const [searchResultsDigisac, setSearchResultsDigisac] = useState([]);
  const [selectedDigisac, setSelectedDigisac] = useState([]);
  const digisacRef = useRef(null);

  // -------------------------------------------------------------
  // 5) Estados para E-mail B2B
  // -------------------------------------------------------------
  const [habilitarEmailB2B, setHabilitarEmailB2B] = useState(false);
  const [emailB2BData, setEmailB2BData] = useState([]);
  const [searchTermEmailB2B, setSearchTermEmailB2B] = useState("");
  const [searchResultsEmailB2B, setSearchResultsEmailB2B] = useState([]);
  const [selectedEmailB2B, setSelectedEmailB2B] = useState([]);
  const emailB2BRef = useRef(null);

  // -------------------------------------------------------------
  // 6) Outros
  // -------------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
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
    "ITH",
  ];

  // -------------------------------------------------------------
  // 7) useEffects para carregar dados iniciais
  // -------------------------------------------------------------
  useEffect(() => {
    fetchPontosAcesso();
    fetchCidades();
    fetchDigisacData();
    fetchEmailB2BData();
  }, []);

  // Carrega pontos
  const fetchPontosAcesso = async () => {
    try {
      setIsLoadingPontos(true);
      const response = await fetch("/pontosAcesso.json");
      const data = await response.json();
      const filteredData = data.map((ponto) => ({
        codcon: ponto.codcon,
        nome: ponto.nome_con,
        origem: ponto.origem,
      }));
      setPontosAcesso(filteredData);
    } catch (error) {
      console.error("Erro ao carregar pontos:", error);
    } finally {
      setIsLoadingPontos(false);
    }
  };

  // Carrega cidades
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

  // Carrega digisac
  const fetchDigisacData = async () => {
    try {
      const response = await fetch("/digisac.json");
      const data = await response.json();
      setDigisacData(data);
    } catch (error) {
      console.error("Erro ao carregar digisac:", error);
    }
  };

  // Carrega E-mail B2B
  const fetchEmailB2BData = async () => {
    try {
      const response = await fetch("/emailB2B.json"); // Substitua pelo caminho correto
      const data = await response.json();
      setEmailB2BData(data);
    } catch (error) {
      console.error("Erro ao carregar Email B2B:", error);
    }
  };

  // -------------------------------------------------------------
  // 8) Filtro Pontos
  // -------------------------------------------------------------
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const filtered = pontosAcesso
      .filter((p) => (p.nome || "").toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, MAX_RESULTS);
    setSearchResults(filtered);
  }, [searchTerm, pontosAcesso]);

  // -------------------------------------------------------------
  // 9) Filtro Cidades (para Cidade Massiva)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!searchTermCidade) {
      setCitySearchResults([]);
      return;
    }
    const filtered = cidades.filter((cid) =>
      (cid.nome || "").toLowerCase().includes(searchTermCidade.toLowerCase())
    );
    setCitySearchResults(filtered);
  }, [searchTermCidade, cidades]);

  // -------------------------------------------------------------
  // Novo: Filtro para Local de Ocorrência
  // -------------------------------------------------------------
  useEffect(() => {
    if (!searchTermLocal) {
      setSearchResultsLocal([]);
      return;
    }
    const filtered = cidades.filter((cid) =>
      (cid.nome || "").toLowerCase().includes(searchTermLocal.toLowerCase())
    );
    setSearchResultsLocal(filtered);
  }, [searchTermLocal, cidades]);

  // -------------------------------------------------------------
  // 10) Filtro Digisac
  // -------------------------------------------------------------
  useEffect(() => {
    if (!searchTermDigisac) {
      setSearchResultsDigisac([]);
      return;
    }
    const filtered = digisacData.filter((item) =>
      (item.name || "").toLowerCase().includes(searchTermDigisac.toLowerCase())
    );
    setSearchResultsDigisac(filtered);
  }, [searchTermDigisac, digisacData]);

  // -------------------------------------------------------------
  // 11) Filtro E-mail B2B
  // -------------------------------------------------------------
  useEffect(() => {
    if (!searchTermEmailB2B) {
      setSearchResultsEmailB2B([]);
      return;
    }
    const filtered = emailB2BData.filter(
      (item) =>
        (item.Nome || "").toLowerCase().includes(searchTermEmailB2B.toLowerCase()) ||
        (item.Email || "").toLowerCase().includes(searchTermEmailB2B.toLowerCase())
    );
    setSearchResultsEmailB2B(filtered);
  }, [searchTermEmailB2B, emailB2BData]);

  // -------------------------------------------------------------
  // 12) Hooks para fechar dropdown ao clicar fora
  // -------------------------------------------------------------
  useClickOutside(pontosRef, () => {
    if (searchTerm || searchResults.length > 0) {
      setSearchTerm("");
      setSearchResults([]);
    }
  });
  useClickOutside(cidadesRef, () => {
    if (searchTermCidade || citySearchResults.length > 0) {
      setSearchTermCidade("");
      setCitySearchResults([]);
    }
  });
  useClickOutside(localRef, () => {
    if (searchTermLocal || searchResultsLocal.length > 0) {
      setSearchTermLocal("");
      setSearchResultsLocal([]);
    }
  });
  useClickOutside(digisacRef, () => {
    if (searchTermDigisac || searchResultsDigisac.length > 0) {
      setSearchTermDigisac("");
      setSearchResultsDigisac([]);
    }
  });
  useClickOutside(emailB2BRef, () => {
    if (searchTermEmailB2B || searchResultsEmailB2B.length > 0) {
      setSearchTermEmailB2B("");
      setSearchResultsEmailB2B([]);
    }
  });

  // -------------------------------------------------------------
  // 13) Handlers de seleção (multi-select)
  // -------------------------------------------------------------
  // PONTOS
  const handleSelectPonto = (ponto) => {
    const exists = selectedPontos.some((p) => p.codcon === ponto.codcon);
    if (exists) {
      setSelectedPontos((prev) => prev.filter((p) => p.codcon !== ponto.codcon));
    } else {
      setSelectedPontos((prev) => [...prev, ponto]);
    }
  };

  // CIDADES (Cidade Massiva)
  const handleSelectCity = (cidade) => {
    const exists = formData.cidadesSelecionadas.some((c) => c.id === cidade.id);
    if (!exists) {
      setFormData((prev) => ({
        ...prev,
        cidadesSelecionadas: [...prev.cidadesSelecionadas, cidade],
      }));
    }
    setSearchTermCidade("");
    setCitySearchResults([]);
  };
  const handleRemoveCity = (id) => {
    setFormData((prev) => ({
      ...prev,
      cidadesSelecionadas: prev.cidadesSelecionadas.filter((c) => c.id !== id),
    }));
  };

  // Local de Ocorrência
  const handleSelectLocalCidade = (cidade) => {
    const exists = selectedLocalCidades.some((c) => c.id === cidade.id);
    if (!exists) {
      setSelectedLocalCidades((prev) => [...prev, cidade]);
    }
    setSearchTermLocal("");
    setSearchResultsLocal([]);
  };
  const handleRemoveLocalCidade = (id) => {
    setSelectedLocalCidades((prev) => prev.filter((c) => c.id !== id));
  };

  // DIGISAC
  const handleSelectDigisac = (item) => {
    const exists = selectedDigisac.some((d) => d.id === item.id);
    if (exists) {
      setSelectedDigisac((prev) => prev.filter((d) => d.id !== item.id));
    } else {
      setSelectedDigisac((prev) => [...prev, item]);
    }
    setSearchTermDigisac("");
    setSearchResultsDigisac([]);
  };

  // E-mail B2B
  const handleSelectEmailB2B = (item) => {
    const exists = selectedEmailB2B.some((b2b) => b2b.Codigo === item.Codigo);
    if (exists) {
      setSelectedEmailB2B((prev) => prev.filter((b2b) => b2b.Codigo !== item.Codigo));
    } else {
      setSelectedEmailB2B((prev) => [...prev, item]);
    }
    setSearchTermEmailB2B("");
    setSearchResultsEmailB2B([]);
  };

  // -------------------------------------------------------------
  // 14) Demais Handlers
  // -------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleProtocoloChange = (e) => {
    const valor = e.target.value;
    const valorLimpo = valor.replace(/\D/g, "");
    setFormData({ ...formData, protocoloISP: valorLimpo });
  };

  // Toggle para “mostrarCidades” (Cidade Massiva)
  const handleToggleCidades = () => {
    setMostrarCidades(!mostrarCidades);
  };
  // Toggle para “habilitarDigisac”
  const handleToggleDigisac = () => {
    setHabilitarDigisac(!habilitarDigisac);
  };

  // -------------------------------------------------------------
  // 15) Lógica de divisão de manutenção
  // -------------------------------------------------------------
  const dividirManutencao = (inicio, fim, partes) => {
    const partesDivididas = {
      "1-parte": {
        "Inicio Horario": inicio,
        "Previsto Horario": fim,
        "Fim Horario": null,
      },
    };
    for (let i = 2; i <= partes; i++) {
      partesDivididas[`${i}-parte`] = {
        "Inicio Horario": null,
        "Previsto Horario": null,
        "Fim Horario": null,
      };
    }
    return partesDivididas;
  };

  // -------------------------------------------------------------
  // 16) Validação do Formulário
  // -------------------------------------------------------------
  const validarFormulario = async (formData, selectedPontos, db) => {
    if (!formData.protocoloISP.trim()) {
      return "O protocolo ISP é obrigatório.";
    }
    if (!formData.horarioInicial) {
      return "O horário inicial é obrigatório.";
    }
    // Se NÃO for "Evento", exigimos horárioPrevisto
    if (
      formData.tipo !== "Evento" &&
      (formData.tipo === "Manutenção" || formData.tipo === "Solicitação emergencial")
    ) {
      if (!formData.horarioPrevisto) {
        return "O horário previsto é obrigatório para este tipo.";
      }
      if (
        new Date(formData.horarioPrevisto).getTime() <=
        new Date(formData.horarioInicial).getTime()
      ) {
        return "O horário previsto deve ser maior que o horário inicial.";
      }
    }
    if (selectedPontos.length === 0) {
      return "Selecione pelo menos um ponto de acesso.";
    }
    // Verificar duplicidade do protocolo
    const protocoloRef = doc(db, "protocolos", formData.protocoloISP);
    const protocoloSnap = await getDoc(protocoloRef);
    if (protocoloSnap.exists()) {
      return `O protocolo ISP ${formData.protocoloISP} já existe. Escolha outro.`;
    }
    return null;
  };

  // -------------------------------------------------------------
  // 17) Submissão do Formulário
  // -------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const db = getFirestore();
      const erro = await validarFormulario(formData, selectedPontos, db);
      if (erro) {
        toast.error(erro);
        return;
      }

      const loadingToastId = toast.loading("Processando, por favor aguarde...");

      // (Opcional) Se cidades habilitadas (Cidade Massiva), filtra e adiciona pontos
      if (mostrarCidades && formData.cidadesSelecionadas.length > 0) {
        const pontosFiltrados = pontosAcesso.filter((ponto) =>
          formData.cidadesSelecionadas.some((cidade) => cidade.nome === ponto.origem)
        );
        setSelectedPontos((prev) => [...prev, ...pontosFiltrados]);
      }

      let divisaoManutencao = null;
      if (formData.manutencaoDividida && formData.partesManutencao > 1) {
        divisaoManutencao = dividirManutencao(
          formData.horarioInicial,
          formData.horarioPrevisto,
          formData.partesManutencao
        );
      }

      // Combinar pontos
      const pontosFinal = [...new Set([...selectedPontos])];

      // Buscar dados de clientes ou, se Cidade Massiva estiver ativa, realizar consulta por cidade
      let clientesAfetadosTotal = [];
      let totalAfetados = 0;

      if (mostrarCidades && formData.cidadesSelecionadas.length > 0) {
        // Para cada cidade selecionada, consulta os clientes e soma a quantidade
        for (const cidade of formData.cidadesSelecionadas) {
          try {
            // Aqui usamos getDadosCliente passando, por exemplo, o id da cidade e o nome
            // Certifique-se de que essa função está preparada para tratar a consulta por cidade
            const clientes = await getDadosCliente(cidade.id, cidade.nome);
            const quantidade = clientes.length;
            totalAfetados += quantidade;
            // Armazena apenas o nome da cidade e a quantidade de clientes afetados
            clientesAfetadosTotal.push({ nome: cidade.nome, quantidade });
          } catch (error) {
            console.error("Erro ao buscar dados para a cidade:", cidade.nome, error);
          }
        }
      } else {
        // Fluxo normal: buscar dados de cada ponto de acesso
        for (const ponto of pontosFinal) {
          try {
            const clientes = await getDadosCliente(ponto.codcon, ponto.origem);
            if (Array.isArray(clientes) && clientes.length > 0) {
              clientesAfetadosTotal.push(...clientes);
            }
          } catch (error) {
            console.error("Erro ao buscar dados:", ponto.codcon, error);
            continue;
          }
        }
        totalAfetados = clientesAfetadosTotal.length;
      }

      // Montar objeto final
      const dados = {
        tipo: formData.tipo,
        protocoloISP: formData.protocoloISP,
        horarioInicial: formData.horarioInicial,
        horarioPrevisto: formData.tipo === "Evento" ? null : formData.horarioPrevisto,
        horarioFinal: null,
        pontoAcesso: pontosFinal,
        regional: formData.regional,
        // Novo campo: Local de Ocorrência
        localOcorrencia: selectedLocalCidades,
        observacao: formData.observacao,
        cidadesSelecionadas: formData.cidadesSelecionadas,
        manutencaoDividida: formData.manutencaoDividida,
        Dividida: divisaoManutencao || null,
        email: false,
        whatzap: false,
        total_afetados: totalAfetados || 0,
        Clientesafetados: clientesAfetadosTotal,
        Cometario: [],
        status: "Analise",
        emailB2B: habilitarEmailB2B ? selectedEmailB2B : false,
        digisac: habilitarDigisac ? selectedDigisac : false,
        dataCriacao: new Date().toISOString(),
      };

      // Salvar no Firestore
      const analiseRef = doc(collection(db, "Analise"));
      await setDoc(analiseRef, dados);
      const manutencaoRef = doc(collection(db, "manutencao"), analiseRef.id);
      await setDoc(manutencaoRef, dados);
      const protocoloRef = doc(db, "protocolos", formData.protocoloISP);
      await setDoc(protocoloRef, { ...dados, id: analiseRef.id });

      toast.update(loadingToastId, {
        render: "Cadastro realizado com sucesso!",
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

  // -------------------------------------------------------------
  // 18) Renderização
  // -------------------------------------------------------------
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-transparent text-slate-100">
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
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Tipo:</label>
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
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Protocolo ISP:</label>
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
          {formData.tipo === "Evento" ? (
            <div>
              <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Horário Inicial:</label>
              <input
                type="datetime-local"
                name="horarioInicial"
                value={formData.horarioInicial}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Horário Inicial:</label>
                <input
                  type="datetime-local"
                  name="horarioInicial"
                  value={formData.horarioInicial}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                />
              </div>
              <div>
                <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Horário Previsto:</label>
                <input
                  type="datetime-local"
                  name="horarioPrevisto"
                  value={formData.horarioPrevisto}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
                />
              </div>
            </div>
          )}

          {/* Spinner de carregamento de pontos */}
          {isLoadingPontos && (
            <div className="mb-2 flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-slate-900 dark:text-slate-50">Carregando pontos...</span>
            </div>
          )}

          {/* MULTI-SELECT: Pontos de Acesso */}
          <div>
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Ponto de Acesso:</label>
            <div ref={pontosRef} className="relative mb-4 rounded border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700">
              <div className="flex flex-wrap gap-1">
                {selectedPontos.map((ponto) => (
                  <div
                    key={ponto.codcon}
                    className="flex items-center rounded bg-blue-100 px-2 py-1 text-slate-900 dark:bg-blue-900 dark:text-slate-50"
                  >
                    <span className="mr-1">
                      {ponto.nome} - {ponto.origem}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectPonto(ponto)}
                      className="font-bold text-red-600"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  className="min-w-[80px] flex-1 bg-transparent text-slate-900 placeholder-gray-500 outline-none dark:text-slate-50 dark:placeholder-gray-400"
                  placeholder="Pesquisar ponto de acesso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && searchResults.length > 0 && (
                <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                  {searchResults.map((ponto) => {
                    const isSelected = selectedPontos.some((item) => item.codcon === ponto.codcon);
                    return (
                      <li
                        key={ponto.codcon}
                        onClick={() => handleSelectPonto(ponto)}
                        className={`cursor-pointer p-2 text-slate-900 hover:bg-blue-100 dark:text-slate-50 dark:hover:bg-gray-700 ${
                          isSelected ? "bg-blue-200 dark:bg-blue-900" : ""
                        }`}
                      >
                        {ponto.nome} - {ponto.origem}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Regional */}
          <div>
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Regional:</label>
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

          {/* Novo Campo: Local de Ocorrência */}
          <div className="mt-4">
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">
              Local de Ocorrência:
            </label>
            <div ref={localRef} className="relative mb-4 rounded border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700">
              <div className="flex flex-wrap gap-1">
                {selectedLocalCidades.map((cidade) => (
                  <div
                    key={cidade.id}
                    className="flex items-center rounded bg-green-100 px-2 py-1 text-slate-900 dark:bg-green-900 dark:text-slate-50"
                  >
                    <span className="mr-1">{cidade.nome}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLocalCidade(cidade.id)}
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
                  value={searchTermLocal}
                  onChange={(e) => setSearchTermLocal(e.target.value)}
                />
              </div>
              {searchTermLocal && searchResultsLocal.length > 0 && (
                <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                  {searchResultsLocal.map((cidade) => (
                    <li
                      key={cidade.id}
                      onClick={() => handleSelectLocalCidade(cidade)}
                      className="cursor-pointer p-2 text-slate-900 hover:bg-green-100 dark:text-slate-50 dark:hover:bg-gray-700"
                    >
                      {cidade.nome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Manutenção Dividida -> Toggle Switch */}
          <div>
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Manutenção Dividida:</label>
            <Toggle
              checked={formData.manutencaoDividida}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  manutencaoDividida: e.target.checked,
                })
              }
              label="Dividir manutenção"
            />

            {formData.manutencaoDividida && (
              <div className="mt-4">
                <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Quantidade de Partes:</label>
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

          {/* Seleção de Cidades -> Toggle Switch (Cidade Massiva) */}
          <div>
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Cidade Massiva</label>
            <Toggle checked={mostrarCidades} onChange={handleToggleCidades} label="Habilitar seleção de cidades" />
            {mostrarCidades && (
              <div ref={cidadesRef} className="relative mb-4 mt-4 rounded border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700">
                <div className="flex flex-wrap gap-1">
                  {formData.cidadesSelecionadas.map((cidade) => (
                    <div key={cidade.id} className="flex items-center rounded bg-blue-100 px-2 py-1 text-slate-900 dark:bg-blue-900 dark:text-slate-50">
                      <span className="mr-1">{cidade.nome}</span>
                      <button type="button" onClick={() => handleRemoveCity(cidade.id)} className="font-bold text-red-600">
                        &times;
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="min-w-[80px] flex-1 bg-transparent text-slate-900 placeholder-gray-500 outline-none dark:text-slate-50 dark:placeholder-gray-400"
                    placeholder="Pesquisar cidade..."
                    value={searchTermCidade}
                    onChange={(e) => setSearchTermCidade(e.target.value)}
                  />
                </div>
                {searchTermCidade && citySearchResults.length > 0 && (
                  <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                    {citySearchResults.map((cidade) => (
                      <li
                        key={cidade.id}
                        onClick={() => handleSelectCity(cidade)}
                        className="cursor-pointer p-2 text-slate-900 hover:bg-blue-100 dark:text-slate-50 dark:hover:bg-gray-700"
                      >
                        {cidade.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Habilitar Digisac -> Toggle Switch */}
          <div>
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Habilitar Digisac:</label>
            <Toggle checked={habilitarDigisac} onChange={handleToggleDigisac} label="Ativar seleção de Digisac" />
          </div>
          {habilitarDigisac && (
            <div className="mt-4">
              <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Digisac:</label>
              <div ref={digisacRef} className="relative mb-4 rounded border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700">
                <div className="flex flex-wrap gap-1">
                  {selectedDigisac.map((item) => (
                    <div key={item.id} className="flex items-center rounded bg-blue-100 px-2 py-1 text-slate-900 dark:bg-blue-900 dark:text-slate-50">
                      <span className="mr-1">{item.name}</span>
                      <button type="button" onClick={() => handleSelectDigisac(item)} className="font-bold text-red-600">
                        &times;
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="min-w-[80px] flex-1 bg-transparent text-slate-900 placeholder-gray-500 outline-none dark:text-slate-50 dark:placeholder-gray-400"
                    placeholder="Pesquisar Digisac..."
                    value={searchTermDigisac}
                    onChange={(e) => setSearchTermDigisac(e.target.value)}
                  />
                </div>
                {searchTermDigisac && searchResultsDigisac.length > 0 && (
                  <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                    {searchResultsDigisac.map((item) => {
                      const isSelected = selectedDigisac.some((d) => d.id === item.id);
                      return (
                        <li
                          key={item.id}
                          onClick={() => handleSelectDigisac(item)}
                          className={`cursor-pointer p-2 text-slate-900 hover:bg-blue-100 dark:text-slate-50 dark:hover:bg-gray-700 ${
                            isSelected ? "bg-blue-200 dark:bg-blue-900" : ""
                          }`}
                        >
                          {item.name}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Habilitar E-mail B2B -> Toggle Switch */}
          <div>
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Habilitar E-mail B2B:</label>
            <Toggle checked={habilitarEmailB2B} onChange={() => setHabilitarEmailB2B(!habilitarEmailB2B)} label="Ativar seleção de E-mail B2B" />
          </div>
          {habilitarEmailB2B && (
            <div className="mt-4">
              <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">E-mail B2B:</label>
              <div ref={emailB2BRef} className="relative mb-4 rounded border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700">
                <div className="flex flex-wrap gap-1">
                  {selectedEmailB2B.map((item) => (
                    <div key={item.Codigo} className="flex items-center rounded bg-blue-100 px-2 py-1 text-slate-900 dark:bg-blue-900 dark:text-slate-50">
                      <span className="mr-1">{item.Nome}</span>
                      <button type="button" onClick={() => handleSelectEmailB2B(item)} className="font-bold text-red-600">
                        &times;
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="min-w-[80px] flex-1 bg-transparent text-slate-900 placeholder-gray-500 outline-none dark:text-slate-50 dark:placeholder-gray-400"
                    placeholder="Pesquisar E-mail B2B..."
                    value={searchTermEmailB2B}
                    onChange={(e) => setSearchTermEmailB2B(e.target.value)}
                  />
                </div>
                {searchTermEmailB2B && searchResultsEmailB2B.length > 0 && (
                  <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                    {searchResultsEmailB2B.map((item) => {
                      const isSelected = selectedEmailB2B.some((b2b) => b2b.Codigo === item.Codigo);
                      return (
                        <li
                          key={item.Codigo}
                          onClick={() => handleSelectEmailB2B(item)}
                          className={`cursor-pointer p-2 text-slate-900 hover:bg-blue-100 dark:text-slate-50 dark:hover:bg-gray-700 ${
                            isSelected ? "bg-blue-200 dark:bg-blue-900" : ""
                          }`}
                        >
                          {item.Nome}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Observação */}
          <div>
            <label className="mb-2 block font-bold text-slate-900 dark:text-slate-50">Observação:</label>
            <textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 p-2 text-slate-900 dark:border-gray-700 dark:bg-gray-700 dark:text-slate-50"
              rows="4"
              placeholder="Digite alguma observação"
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

export default Cadastro;
