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
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdvanceModal from "@/modal/AdvanceModal";
import DeleteModal from "@/modal/DeleteModal"; // Modal genérico de exclusão
import CompleteProtocolModal from "@/modal/CompleteProtocol"; // Modal para conclusão de protocolos
import MaintenanceModal from "@/modal/ReagedadoModal"; // Modal para reagendamento
import CompleteProtocolReagedadoModal from "@/modal/CompleteReagedado"; // Modal para conclusão de protocolos reagendados
import { subscribeDashboardData } from "@/utils/fetchDashboardData";
import { EmailModal } from "@/modal/EmailModal";
import { WhatsAppModal } from "@/modal/WhatsAppModal";

const DashboardPage = () => {
    const [data, setData] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("Analise");
    const navigate = useNavigate();
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20; // Definição de limite de itens por página
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeDashboardData(
            ({ counts, data }) => {
                setCounts(counts);
                setData((prevData) => {
                    // Remove duplicatas antes de atualizar
                    const uniqueData = [...new Map([...prevData, ...data].map((item) => [item.id, item])).values()];
                    return uniqueData;
                });
                setCurrentPage(1); // Sempre volta para página 1 quando os dados mudam
                setLoading(false);
            },
            (error) => {
                console.error("Erro no listener:", error);
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, []);

    // useMemo para calcular os dados a serem exibidos, conforme o filtro e a busca
    const displayedData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        let filteredData;

        if (activeFilter === "Clientes Afetados") {
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
        } else {
            filteredData = data.filter((item) => item.status === activeFilter);
        }

        if (search) {
            filteredData = filteredData.filter(
                (item) =>
                    (item.protocoloISP && item.protocoloISP.toLowerCase().includes(search.toLowerCase())) ||
                    (item.regional && item.regional.toLowerCase().includes(search.toLowerCase())),
            );
        }

        return filteredData;
    }, [data, activeFilter, search]);

    const containers = [
        { title: "Analise", icon: Activity, value: counts?.Analise || 0 },
        { title: "Reagendado", icon: Calendar, value: counts?.Reagendado || 0 },
        { title: "Pendente", icon: Clock, value: counts?.Pendente || 0 },
        { title: "Ativos", icon: AlertCircle, value: counts?.Ativos || 0 },
        { title: "Clientes Afetados", icon: UserX2Icon, value: counts?.ClientesAfetados || 0 },
    ];

    // Funções de ações (edição, exclusão, avanço, etc.)
    const handleEdit = (idProtocolo) => navigate(`/visualizacao/${idProtocolo}`);
    const handleDelete = (item) => {
        setModalData(item);
        setShowModal(true);
    };
    const handleComplete = (item) => {
        console.log("Item clicado para avançar:", item);
        setAdvanceData(item);
        setShowAdvanceModal(true);
    };
    const handleCompleteProtocolModal = (item) => {
        console.log("Abrindo modal para:", item);
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

    const totalPages = Math.max(1, Math.ceil(displayedData.length / itemsPerPage));

    const paginatedData = useMemo(() => {
        if (!displayedData || displayedData.length === 0) return [];

        const startIndex = (currentPage - 1) * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;

        if (startIndex >= displayedData.length) {
            setCurrentPage(1); // Volta para a primeira página se o índice estiver errado
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

    return (
        <div className="min-h-screen w-full bg-inherit text-slate-100">
            <header className="mb-6 flex items-center text-3xl font-bold text-slate-900 dark:text-slate-50">
                <Activity
                    className="mr-2 text-blue-500 dark:text-blue-400"
                    size={32}
                />
                Dashboard
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

            {/* Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {containers.map((container, index) => (
                    <div
                        key={index}
                        className={`card rounded-lg bg-white p-4 shadow hover:shadow-lg dark:bg-gray-800 ${activeFilter === container.title ? "ring-2 ring-blue-500" : ""}`}
                        onClick={() => setActiveFilter(container.title)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 dark:bg-blue-600/20 dark:text-blue-600">
                                <container.icon size={26} />
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{container.title}</p>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-50">{container.value}</p>
                    </div>
                ))}
            </div>

            {/* Search e Tabela */}
            <div className="card mt-8">
                <div className="card-header flex items-center justify-between p-4">
                    <h2 className="card-title text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {activeFilter === "Clientes Afetados" ? "Clientes" : "Detalhes do Protocolo"}
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
                            <table
                                key={displayedData.map((item) => item.id || item.Codigo).join(",")}
                                className="w-full table-auto text-sm"
                            >
                                <thead className="bg-inherit text-gray-900 dark:text-gray-100">
                                    {activeFilter === "Clientes Afetados" ? (
                                        <tr>
                                            <th className="px-4 py-2 text-center">Nome</th>
                                            <th className="px-4 py-2 text-center">Código</th>
                                            <th className="px-4 py-2 text-center">Origem</th>
                                            <th className="px-4 py-2 text-center">Email</th>
                                            <th className="px-4 py-2 text-center">WhatsApp</th>
                                            <th className="px-4 py-2 text-center">Protocolo</th>
                                            <th className="px-4 py-2 text-center">Tipo</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="px-4 py-2 text-center">Protocolo</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                            <th className="px-4 py-2 text-center">Horário Previsto</th>
                                            <th className="px-4 py-2 text-center">Regional</th>
                                            <th className="px-4 py-2 text-center">Clientes Afetados</th>
                                            <th className="px-4 py-2 text-center">WhatsApp</th>
                                            <th className="px-4 py-2 text-center">E-mail</th>
                                            <th className="px-4 py-2 text-center">Ações</th>
                                        </tr>
                                    )}
                                </thead>

                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item, index) =>
                                            activeFilter === "Clientes Afetados" ? (
                                                <tr
                                                    key={index}
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
                                            ) : (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">{item.protocoloISP || "—"}</td>
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">{item.status || "—"}</td>
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {item.horarioInicial
                                                                    ? new Date(item.horarioInicial).toLocaleString("pt-BR", {
                                                                          dateStyle: "short",
                                                                          timeStyle: "short",
                                                                      })
                                                                    : "—"}
                                                            </span>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {item.horarioPrevisto
                                                                    ? new Date(item.horarioPrevisto).toLocaleString("pt-BR", {
                                                                          dateStyle: "short",
                                                                          timeStyle: "short",
                                                                      })
                                                                    : "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">{item.regional || "—"}</td>
                                                    <td className="px-4 py-2 text-center text-black dark:text-white">
                                                        {item.clientesAfetados !== undefined && item.clientesAfetados !== null
                                                            ? item.clientesAfetados
                                                            : "0"}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            {/* Botão para WhatsApp com ícone e emoji */}
                                                            <button
                                                                onClick={() => handleOpenWhatsAppModal(item)}
                                                                className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                                                            >
                                                                <SendIcon
                                                                    size={20}
                                                                    className={item.whatzap ? "text-blue-800" : "text-blue-500"}
                                                                />
                                                            </button>

                                                            <div className="flex items-center justify-center">
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

                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            {/* Botão para E-mail com ícone e emoji */}
                                                            <button
                                                                onClick={() => handleOpenEmailModal(item)}
                                                                className="flex items-center space-x-1 text-green-500 hover:text-green-600"
                                                            >
                                                                <MailCheckIcon
                                                                    size={20}
                                                                    className={item.email ? "text-green-500" : "text-red-500"}
                                                                />
                                                                
                                                            </button>
                                                            <div className="flex items-center justify-center">
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
                                                    <td className="px-4 py-2 text-center">
                                                        <div className="flex justify-center space-x-2">
                                                            {item.status === "Analise" || item.status === "Pendente" ? (
                                                                <button
                                                                    onClick={() => handleComplete(item)}
                                                                    className="text-blue-500 hover:text-blue-600"
                                                                >
                                                                    <ArrowBigRightDashIcon size={20} />
                                                                </button>
                                                            ) : null}
                                                            {item.status === "Ativos" ? (
                                                                <button
                                                                    onClick={() => handleCompleteProtocolModal(item)}
                                                                    className="text-green-500 hover:text-green-600"
                                                                >
                                                                    <CheckIcon size={20} />
                                                                </button>
                                                            ) : null}
                                                            {item.status === "Reagendado" ? (
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
                                                            ) : null}
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
                                            ),
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={activeFilter === "Clientes Afetados" ? 9 : 8}
                                                className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                Nenhum dado encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modais */}
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
                    // Ajuste essa lógica de remoção se necessário
                    setData((prev) => prev.filter((item) => item.id !== advanceData?.id));
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
                    setData((prev) => prev.filter((item) => item.id !== maintenanceData?.id));
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
                onCancel={() => setShowEmailModal(false)}
            />

            <CompleteProtocolReagedadoModal
                item={completeReagendadoData}
                isVisible={showCompleteReagendadoModal}
                onCancel={() => setShowCompleteReagendadoModal(false)}
                onComplete={() => {
                    setShowCompleteReagendadoModal(false);
                    setData((prev) => prev.filter((item) => item.id !== completeReagendadoData?.id));
                    toast.success("Protocolo finalizado com sucesso!");
                }}
            />
            <div className="mt-4 flex items-center justify-center space-x-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    Anterior
                </button>

                <span className="text-lg font-semibold">
                    Página {currentPage} de {totalPages}
                </span>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    Próximo
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default DashboardPage;
