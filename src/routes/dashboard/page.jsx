import { useState, useEffect, useMemo } from "react";
import { Footer } from "@/layouts/footer";
import {
    Activity,
    Calendar,
    Clock,
    AlertCircle,
    PencilLine,
    Trash,
    SendIcon,
    MailCheckIcon,
    UserX2Icon,
    XIcon,
    CheckIcon,
    ArrowBigRightDashIcon,
    AlarmClockPlusIcon,
    CheckCheck,
    CalendarClockIcon,
    BellDot,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdvanceModal from "@/modal/AdvanceModal";
import DeleteModal from "@/modal/DeleteModal";
import CompleteProtocolModal from "@/modal/CompleteProtocol";
import MaintenanceModal from "@/modal/ReagedadoModal";
import CompleteProtocolReagedadoModal from "@/modal/CompleteReagedado";

// Import da função ajustada – certifique-se de que o caminho esteja correto
import { subscribeDashboardData } from "@/utils/fetchDashboardData";

import { EmailModal } from "@/modal/EmailModal";
import { WhatsAppModal } from "@/modal/WhatsAppModal";
import DigisacModal from "@/modal/DigisacModal";
import EmailB2BModal from "@/modal/EmailB2BModal";
import NewActionModal from "@/modal/ReagendarModal";

const DashboardPage = () => {
    const [data, setData] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("Analise");
    const navigate = useNavigate();

    // Estados dos modais
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [advanceData, setAdvanceData] = useState(null);
    const [showCompleteReagendadoModal, setShowCompleteReagendadoModal] = useState(false);
    const [completeReagendadoData, setCompleteReagendadoData] = useState(null);
    const [showCompleteProtocolModal, setShowCompleteProtocolModal] = useState(false);
    const [completeProtocolData, setCompleteProtocolData] = useState(null);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [maintenanceData, setMaintenanceData] = useState(null);

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Modais de WhatsApp e E-mail
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Novos modais (Digisac, EmailB2B, Nova Ação)
    const [showDigisacModal, setShowDigisacModal] = useState(false);
    const [digisacData, setDigisacData] = useState(null);
    const [showEmailB2BModal, setShowEmailB2BModal] = useState(false);
    const [emailB2BData, setEmailB2BData] = useState(null);
    const [showNewActionModal, setShowNewActionModal] = useState(false);
    const [newActionData, setNewActionData] = useState(null);

    // Efeito para escutar dados em tempo real
    useEffect(() => {
        const unsubscribe = subscribeDashboardData(
            ({ counts, data }) => {
                setCounts(counts);
                setData(data);
                setCurrentPage(1);
                setLoading(false);
            },
            (error) => {
                console.error("Erro no listener:", error);
                setLoading(false);
            },
        );
        return () => unsubscribe();
    }, []);

    // FILTRAGEM E PREPARO DE DADOS
    const displayedData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        let filteredData;

        if (activeFilter === "Clientes Varejo") {
            // Agrega clientes do array Clientesafetados (Varejo)
            let aggregatedClients = [];
            data.forEach((doc) => {
                if (doc.status === "Ativos" && Array.isArray(doc.Clientesafetados)) {
                    doc.Clientesafetados.forEach((cliente) => {
                        aggregatedClients.push({
                            nome: cliente.Nome || "—",
                            Codigo: cliente.Codigo || "—",
                            origem: cliente.Origem || "—",
                            CheckEmail: cliente.CheckEmail ?? false,
                            CheckTelefone: cliente.CheckTelefone ?? false,
                            protocolo: doc.protocoloISP || "—",
                            tipo: doc.tipo || "—",
                        });
                    });
                }
            });
            filteredData = aggregatedClients;
        } else if (activeFilter === "Clientes B2B") {
            let aggregatedB2B = [];
            data.forEach((doc) => {
                if (doc.status === "Ativos" && (doc.emailB2B !== false || doc.digisac !== false)) {
                    // Definindo o nome: prioriza emailB2B se existir, senão utiliza digisac
                    let nomeB2B = "—";
                    if (Array.isArray(doc.emailB2B) && doc.emailB2B.length > 0) {
                        nomeB2B = doc.emailB2B[0].Nome || doc.emailB2B[0].name || "—";
                    } else if (Array.isArray(doc.digisac) && doc.digisac.length > 0) {
                        nomeB2B = doc.digisac[0].name || "—";
                    }
                    aggregatedB2B.push({
                        nome: nomeB2B,
                        protocolo: doc.protocoloISP || "—",
                        tipo: doc.tipo || "—",
                        emailB2B: doc.emailB2B,
                        digisac: doc.digisac,
                    });
                }
            });
            filteredData = aggregatedB2B;
        } else {
            // Filtro normal por status
            filteredData = data.filter((item) => item.status === activeFilter);
        }

        // Filtro de busca (pesquisa por protocolo, regional ou nome)
        if (search) {
            filteredData = filteredData.filter(
                (item) =>
                    (item.protocoloISP && item.protocoloISP.toLowerCase().includes(search.toLowerCase())) ||
                    (item.regional && item.regional.toLowerCase().includes(search.toLowerCase())) ||
                    (item.nome && item.nome.toLowerCase().includes(search.toLowerCase())),
            );
        }
        return filteredData;
    }, [data, activeFilter, search]);

    // CONTADORES (Cards)
    const containers = [
        { title: "Requisição", icon: BellDot, value: counts?.Requisicao || 0 },
        { title: "Analise", icon: Activity, value: counts?.Analise || 0 },
        { title: "Reagendado", icon: Calendar, value: counts?.Reagendado || 0 },
        { title: "Pendente", icon: Clock, value: counts?.Pendente || 0 },
        { title: "Ativos", icon: AlertCircle, value: counts?.Ativos || 0 },
        { title: "Clientes Varejo", icon: UserX2Icon, value: counts?.ClientesAfetados || 0 },
        { title: "Clientes B2B", icon: UserX2Icon, value: counts?.ClientesB2B || 0 },
    ];

    // AÇÕES
    const handleEdit = (idProtocolo) => navigate(`/visualizacao/${idProtocolo}`);
    const handleDelete = (item) => {
        setModalData(item);
        setShowModal(true);
    };
    const handleComplete = (item) => {
        setAdvanceData(item);
        setShowAdvanceModal(true);
    };
    const handleCompleteProtocolModal = (item) => {
        setCompleteProtocolData(item);
        setShowCompleteProtocolModal(true);
    };
    const handleReagendadoModal = (item) => {
        setMaintenanceData(item);
        setShowMaintenanceModal(true);
    };
    const handleCompleteReagendadoModal = (item) => {
        setCompleteReagendadoData(item);
        setShowCompleteReagendadoModal(true);
    };
    const handleOpenWhatsAppModal = (item) => {
        setSelectedItem(item);
        setShowWhatsAppModal(true);
    };
    const handleOpenEmailModal = (item) => {
        setSelectedItem(item);
        setShowEmailModal(true);
    };
    const handleOpenDigisacModal = (item) => {
        setDigisacData(item);
        setShowDigisacModal(true);
    };
    const handleOpenEmailB2BModal = (item) => {
        setEmailB2BData(item);
        setShowEmailB2BModal(true);
    };
    const handleOpenNewActionModal = (item) => {
        setNewActionData(item);
        setShowNewActionModal(true);
    };

    // PAGINAÇÃO
    const totalPages = Math.max(1, Math.ceil(displayedData.length / itemsPerPage));
    const paginatedData = useMemo(() => {
        if (!displayedData || displayedData.length === 0) return [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;
        if (startIndex >= displayedData.length) {
            setCurrentPage(1);
            return displayedData.slice(0, itemsPerPage);
        }
        endIndex = Math.min(endIndex, displayedData.length);
        return displayedData.slice(startIndex, endIndex);
    }, [displayedData, currentPage, itemsPerPage]);

    const handlePageChange = (newPage) => {
        if (newPage < 1) return;
        if (newPage > totalPages) {
            setCurrentPage(totalPages);
            return;
        }
        setCurrentPage(newPage);
    };

    // Identifica se estamos na aba Clientes B2B
    const isB2B = activeFilter === "Clientes B2B";

    return (
        <div className="min-h-screen w-full bg-inherit text-slate-100">
            {/* Cabeçalho */}
            <header className="mb-6 flex items-center space-x-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                <Activity
                    className="text-blue-500 dark:text-blue-400"
                    size={28}
                />
                <h1>Dashboard</h1>
            </header>

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

            {/* Cards - Grid responsivo */}
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                {containers.map((container, index) => (
                    <div
                        key={index}
                        className={`flex flex-col justify-between rounded-lg bg-white p-3 shadow-md transition-all hover:shadow-lg dark:bg-gray-800 ${
                            activeFilter === container.title ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => setActiveFilter(container.title)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 dark:bg-blue-600/20 dark:text-blue-600">
                                <container.icon size={22} />
                            </div>
                            <p className="text-base font-medium text-slate-900 dark:text-slate-50">{container.title}</p>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{container.value}</p>
                    </div>
                ))}
            </div>

            {/* Search e Tabela */}
            <div className="card mt-8">
                <div className="card-header flex items-center justify-between p-4">
                    <h2 className="card-title text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {activeFilter.startsWith("Clientes") ? "Clientes" : "Detalhes do Protocolo"}
                    </h2>
                    <input
                        type="text"
                        placeholder="Pesquisar por Protocolo, Regional ou Nome"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-1/3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-50 dark:placeholder-gray-500 dark:focus:ring-blue-400"
                    />
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <p className="py-4 text-center">Carregando...</p>
                    ) : (
                        <div className="relative h-[500px] w-full overflow-auto">
                            {activeFilter.startsWith("Clientes") ? (
                                activeFilter === "Clientes B2B" ? (
                                    /* ===========================
                     Tabela de Clientes B2B
                     =========================== */
                                    <table className="w-full table-auto text-sm">
                                        <thead className="bg-inherit text-gray-900 dark:text-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-center">Nome (Grupo/Cliente)</th>
                                                <th className="px-4 py-2 text-center">Email B2B</th>
                                                <th className="px-4 py-2 text-center">Digisac</th>
                                                <th className="px-4 py-2 text-center">Protocolo</th>
                                                <th className="px-4 py-2 text-center">Tipo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((item, index) => (
                                                    <tr
                                                        key={`b2b-${index}`}
                                                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        {/* Nome do grupo, extraído em aggregatedB2B */}
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">{item.nome || "—"}</td>
                                                        {/* Coluna Email B2B */}
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">
                                                            {Array.isArray(item.emailB2B) && item.emailB2B.length > 0 ? (
                                                                <span>{item.emailB2B[0].Nome || item.emailB2B[0].name || "—"}</span>
                                                            ) : (
                                                                <span className="text-yellow-500">Não habilitado</span>
                                                            )}
                                                        </td>
                                                        {/* Coluna Digisac - agora verifica checkTelefone ou checkEmail */}
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">
                                                            <div className="flex items-center justify-center">
                                                                {Array.isArray(item.digisac) && item.digisac.length > 0 ? (
                                                                    item.digisac[0].checkTelefone || item.digisac[0].checkEmail ? (
                                                                        <CheckCheck
                                                                            size={20}
                                                                            className="text-green-500"
                                                                        />
                                                                    ) : (
                                                                        <XIcon
                                                                            size={20}
                                                                            className="text-red-500"
                                                                        />
                                                                    )
                                                                ) : (
                                                                    <span className="text-yellow-500">Não habilitado</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-2 text-center text-black dark:text-white">{item.protocolo || "—"}</td>
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">{item.tipo || "—"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                                    >
                                                        Nenhum dado encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                ) : (
                                    /* ==============================
                     Tabela de Clientes Varejo
                     ============================== */
                                    <table className="w-full table-auto text-sm">
                                        <thead className="bg-inherit text-gray-900 dark:text-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-center">Nome</th>
                                                <th className="px-4 py-2 text-center">Código</th>
                                                <th className="px-4 py-2 text-center">Origem</th>
                                                <th className="px-4 py-2 text-center">Email</th>
                                                <th className="px-4 py-2 text-center">{isB2B ? "Digisac" : "WhatsApp"}</th>
                                                <th className="px-4 py-2 text-center">Protocolo</th>
                                                <th className="px-4 py-2 text-center">Tipo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {paginatedData.length > 0 ? (
                                                paginatedData.map((item, index) => (
                                                    <tr
                                                        key={`${item.Codigo}-${item.nome}-${index}`}
                                                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">{item.nome || "—"}</td>
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">{item.Codigo || "—"}</td>
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">{item.origem || "—"}</td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex items-center justify-center">
                                                                {item.CheckEmail ? (
                                                                    <MailCheckIcon
                                                                        size={20}
                                                                        className="text-green-600"
                                                                    />
                                                                ) : (
                                                                    <XIcon
                                                                        size={20}
                                                                        className="text-red-600"
                                                                    />
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex items-center justify-center">
                                                                {item.CheckTelefone ? (
                                                                    <CheckCheck
                                                                        size={20}
                                                                        className="text-green-600"
                                                                    />
                                                                ) : (
                                                                    <XIcon
                                                                        size={20}
                                                                        className="text-red-600"
                                                                    />
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">{item.protocolo || "—"}</td>
                                                        <td className="px-4 py-2 text-center text-black dark:text-white">{item.tipo || "—"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                                    >
                                                        Nenhum dado encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )
                            ) : (
                                /* ===================
                   Tabela de Protocolos
                   =================== */
                                <table className="w-full table-auto text-sm">
                                    <thead className="bg-inherit text-gray-900 dark:text-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-center">Protocolo</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                            <th className="px-4 py-2 text-center">Horários</th>
                                            <th className="px-4 py-2 text-center">Regional</th>
                                            <th className="px-4 py-2 text-center">Cidade</th>
                                            <th className="px-4 py-2 text-center">Clientes Afetados</th>
                                            <th className="px-4 py-2 text-center">Digisac</th>
                                            <th className="px-4 py-2 text-center">Email B2B</th>
                                            <th className="px-4 py-2 text-center">WhatsApp</th>
                                            <th className="px-4 py-2 text-center">E-mail</th>
                                            <th className="px-4 py-2 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">{item.protocoloISP || "—"}</td>
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">{item.status || "—"}</td>
                                                    {/* Horários */}
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">
                                                        <div className="flex flex-col items-center">
                                                            {item.tipo === "Evento" ? (
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {item.horarioInicial
                                                                        ? new Date(item.horarioInicial).toLocaleString("pt-BR", {
                                                                              dateStyle: "short",
                                                                              timeStyle: "short",
                                                                          })
                                                                        : ""}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {item.horarioInicial
                                                                        ? new Date(item.horarioInicial).toLocaleString("pt-BR", {
                                                                              dateStyle: "short",
                                                                              timeStyle: "short",
                                                                          })
                                                                        : "—"}
                                                                </span>
                                                            )}
                                                            {item.tipo === "Evento" ? (
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {item.horarioPrevisto
                                                                        ? new Date(item.horarioPrevisto).toLocaleString("pt-BR", {
                                                                              dateStyle: "short",
                                                                              timeStyle: "short",
                                                                          })
                                                                        : ""}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {item.horarioPrevisto
                                                                        ? new Date(item.horarioPrevisto).toLocaleString("pt-BR", {
                                                                              dateStyle: "short",
                                                                              timeStyle: "short",
                                                                          })
                                                                        : "—"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">{item.regional || "—"}</td>
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">{item.city || "—"}</td>
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">
                                                        {item.clientesAfetados ?? "0"}
                                                    </td>
                                                    {/* Digisac */}
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleOpenDigisacModal(item)}
                                                                className="flex items-center space-x-1 text-indigo-500 hover:text-indigo-600"
                                                            >
                                                                <SendIcon size={20} />
                                                            </button>
                                                            <div>
                                                                {Array.isArray(item.digisac) &&
                                                                item.digisac.length > 0 &&
                                                                item.digisac[0].checkTelefone ? (
                                                                    <CheckCheck
                                                                        size={20}
                                                                        className="text-green-500"
                                                                    />
                                                                ) : (
                                                                    <XIcon
                                                                        size={20}
                                                                        className="text-red-500"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Email B2B */}
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleOpenEmailB2BModal(item)}
                                                                className="flex items-center space-x-1 text-indigo-500 hover:text-indigo-600"
                                                            >
                                                                <MailCheckIcon size={20} />
                                                            </button>
                                                            <div>
                                                                {Array.isArray(item.emailB2B) &&
                                                                item.emailB2B.length > 0 &&
                                                                item.emailB2B[0].checkEmail ? (
                                                                    <CheckCheck
                                                                        size={20}
                                                                        className="text-green-500"
                                                                    />
                                                                ) : (
                                                                    <XIcon
                                                                        size={20}
                                                                        className="text-red-500"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* WhatsApp */}
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleOpenWhatsAppModal(item)}
                                                                className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                                                            >
                                                                <SendIcon
                                                                    size={20}
                                                                    className={item.whatzap ? "text-blue-800" : "text-blue-500"}
                                                                />
                                                            </button>
                                                            <div>
                                                                {item.whatzap ? (
                                                                    <CheckCheck
                                                                        size={20}
                                                                        className="text-green-500"
                                                                    />
                                                                ) : (
                                                                    <XIcon
                                                                        size={20}
                                                                        className="text-red-500"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* E-mail */}
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleOpenEmailModal(item)}
                                                                className="flex items-center space-x-1 text-green-500 hover:text-green-600"
                                                            >
                                                                <MailCheckIcon
                                                                    size={20}
                                                                    className={item.email ? "text-green-500" : "text-red-500"}
                                                                />
                                                            </button>
                                                            <div>
                                                                {item.email ? (
                                                                    <CheckCheck
                                                                        size={20}
                                                                        className="text-green-500"
                                                                    />
                                                                ) : (
                                                                    <XIcon
                                                                        size={20}
                                                                        className="text-red-500"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Ações */}
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex justify-center space-x-2">
                                                            {(item.status === "Analise" || item.status === "Pendente") && (
                                                                <button
                                                                    onClick={() => handleComplete(item)}
                                                                    className="text-blue-500 hover:text-blue-600"
                                                                >
                                                                    <ArrowBigRightDashIcon size={20} />
                                                                </button>
                                                            )}
                                                            {item.status === "Ativos" && (
                                                                <button
                                                                    onClick={() => handleCompleteProtocolModal(item)}
                                                                    className="text-green-500 hover:text-green-600"
                                                                >
                                                                    <CheckIcon size={20} />
                                                                </button>
                                                            )}
                                                            {item.status === "Reagendado" && (
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleReagendadoModal(item)}
                                                                        className="text-yellow-500 hover:text-yellow-600"
                                                                    >
                                                                        <AlarmClockPlusIcon size={20} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCompleteReagendadoModal(item)}
                                                                        className="text-green-500 hover:text-green-600"
                                                                    >
                                                                        <CheckIcon size={20} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {(item.status === "Pendente" || item.status === "Ativos") && (
                                                                <button
                                                                    onClick={() => handleOpenNewActionModal(item)}
                                                                    className="text-purple-500 hover:text-purple-600"
                                                                >
                                                                    <CalendarClockIcon size={20} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleEdit(item.protocoloISP)}
                                                                className="text-blue-500 hover:text-blue-600"
                                                            >
                                                                <PencilLine size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="text-red-500 hover:text-red-600"
                                                            >
                                                                <Trash size={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={11}
                                                    className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    Nenhum dado encontrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Paginação */}
            <div className="mt-4 flex items-center justify-center space-x-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-500"
                >
                    Anterior
                </button>

                <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Página {currentPage} de {totalPages}
                </span>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-500"
                >
                    Próximo
                </button>
            </div>

            {/* Modais Existentes */}
            <DeleteModal
                title="Confirmar Exclusão"
                message={`Tem certeza de que deseja excluir o protocolo "${modalData?.protocoloISP}"?`}
                protocoloId={modalData?.protocoloISP}
                onSuccess={() => {
                    setShowModal(false);
                    setData((prev) => prev.filter((item) => item.id !== modalData?.id));
                    toast.success("Protocolo excluído com sucesso!");
                }}
                onCancel={() => setShowModal(false)}
                isVisible={showModal}
            />

            <CompleteProtocolModal
                item={completeProtocolData}
                isVisible={showCompleteProtocolModal}
                onCancel={() => setShowCompleteProtocolModal(false)}
                onComplete={() => {
                    setShowCompleteProtocolModal(false);
                    setData((prev) => prev.filter((item) => item.id !== completeProtocolData?.id));
                }}
            />

            <AdvanceModal
                title="Avançar Protocolo"
                message={`Deseja avançar o protocolo "${advanceData?.protocoloISP}" para o próximo status?`}
                item={advanceData}
                onSuccess={() => {
                    setShowAdvanceModal(false);
                }}
                onCancel={() => setShowAdvanceModal(false)}
                isVisible={showAdvanceModal}
            />

            <MaintenanceModal
                isVisible={showMaintenanceModal}
                item={maintenanceData}
                onCancel={() => setShowMaintenanceModal(false)}
                onSuccess={() => {
                    setShowMaintenanceModal(false);
                    setData((prev) => prev.filter((i) => i.id !== maintenanceData?.id));
                    toast.success("Protocolo reagendado com sucesso!");
                }}
            />

            <WhatsAppModal
                isVisible={showWhatsAppModal}
                item={selectedItem}
                onCancel={() => setShowWhatsAppModal(false)}
            />

            <EmailModal
                isVisible={showEmailModal}
                item={selectedItem}
                onSuccess={() => {
                    toast.success("Protocolo reagendado com sucesso!");
                }}
                onCancel={() => setShowEmailModal(false)}
            />

            <CompleteProtocolReagedadoModal
                item={completeReagendadoData}
                isVisible={showCompleteReagendadoModal}
                onCancel={() => setShowCompleteReagendadoModal(false)}
                onComplete={() => {
                    setShowCompleteReagendadoModal(false);
                    setData((prev) => prev.filter((i) => i.id !== completeReagendadoData?.id));
                    toast.success("Protocolo finalizado com sucesso!");
                }}
            />

            {/* Novos Modais */}
            <DigisacModal
                isVisible={showDigisacModal}
                item={digisacData}
                onCancel={() => setShowDigisacModal(false)}
                onSuccess={() => {
                    setShowDigisacModal(false);
                    toast.success("Ação Digisac realizada com sucesso!");
                }}
            />

            <EmailB2BModal
                isVisible={showEmailB2BModal}
                item={emailB2BData}
                onCancel={() => setShowEmailB2BModal(false)}
                onSuccess={() => {
                    setShowEmailB2BModal(false);
                    toast.success("Ação Email B2B realizada com sucesso!");
                }}
            />

            <NewActionModal
                isVisible={showNewActionModal}
                item={newActionData}
                onCancel={() => setShowNewActionModal(false)}
                onSuccess={() => {
                    setShowNewActionModal(false);
                    toast.success("Nova ação realizada com sucesso!");
                }}
            />

            <Footer />
        </div>
    );
};

export default DashboardPage;
