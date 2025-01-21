import React, { useState, useEffect } from "react";
import { Footer } from "@/layouts/footer";
import { fetchDashboardData } from "@/utils/fetchDashboardData";
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
    AlarmClockPlusIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "@/modal/Modal";
import AdvanceModal from "@/modal/AdvanceModal";

const DashboardPage = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("Analise");
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [advanceData, setAdvanceData] = useState(null);

    // Fetch data from API
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await fetchDashboardData();
                setCounts(result.counts || {});
                setData(result.data || []);
                setFilteredData(result.data.filter(item => item.status === activeFilter));
            } catch (error) {
                console.error("Erro ao carregar os dados:", error);
                setCounts({});
                setData([]);
                setFilteredData([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Update filtered data on activeFilter change
    useEffect(() => {
        setFilteredData(data.filter(item => item.status === activeFilter));
    }, [activeFilter, data]);

    // Update filtered data on search input
    useEffect(() => {
        setFilteredData(
            data.filter((item) => {
                return (
                    item.status === activeFilter &&
                    (item.protocoloISP?.toLowerCase().includes(search.toLowerCase()) ||
                        item.regional?.toLowerCase().includes(search.toLowerCase()))
                );
            })
        );
    }, [search, activeFilter, data]);

    const containers = [
        { title: "Analise", icon: Activity, value: counts.Analise || 0 },
        { title: "Reagendado/Incompletos", icon: Calendar, value: counts.Reagendado || 0 },
        { title: "Pendente", icon: Clock, value: counts.Pendente || 0 },
        { title: "Ativos", icon: AlertCircle, value: counts.Ativos || 0 },
        { title: "Clientes Afetados", icon: UserX2Icon, value: counts.ClientesAfetados || 0 },
    ];

    const handleEdit = idProtocolo => navigate(`/visualizacao/${idProtocolo}`);

    const handleDelete = item => {
        setModalData(item);
        setShowModal(true);
    };

    const handleComplete = (item) => {
        console.log("Item clicado para avançar:", item); // Verificar os dados do item
        setAdvanceData(item); // Salva o item inteiro no estado
        setShowAdvanceModal(true); // Exibe o modal
    };

    return (
        <div className="w-full min-h-screen bg-inherit text-slate-100">
            <header className="flex items-center text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
                <Activity className="mr-2 text-blue-500 dark:text-blue-400" size={32} />
                Dashboard
            </header>

            {/* Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {containers.map((container, index) => (
                    <div
                        key={index}
                        className={`card p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg ${activeFilter === container.title ? "ring-2 ring-blue-500" : ""}`}
                        onClick={() => setActiveFilter(container.title)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 dark:bg-blue-600/20 dark:text-blue-600">
                                <container.icon size={26} />
                            </div>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                {container.title}
                            </p>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-50">
                            {container.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Search and Table */}
            <div className="card mt-8">
                <div className="card-header flex justify-between items-center p-4">
                    <h2 className="card-title text-lg font-semibold text-slate-900 dark:text-slate-50">
                        Detalhes do Protocolo
                    </h2>
                    <input
                        type="text"
                        placeholder="Pesquisar por Protocolo ou Regional"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-1/3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-50 dark:placeholder-gray-500 dark:focus:ring-blue-400"
                    />
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <p className="text-center py-4">Carregando...</p>
                    ) : (
                        <div className="relative h-[500px] w-full overflow-auto">
                            <table className="table-auto w-full text-sm">
                                <thead className="bg-inherit text-gray-900 dark:text-gray-100">
                                    <tr>
                                        {['Protocolo', 'Status', 'Horário Previsto', 'Regional', 'Clientes Afetados', 'WhatsApp', 'E-mail', 'Ações'].map((header, index) => (
                                            <th key={index} className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                                <td className="px-4 py-2 text-center">{item.protocoloISP || "—"}</td>
                                                <td className="px-4 py-2 text-center">{item.status || "—"}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span>
                                                            {item.horarioInicial
                                                                ? new Date(item.horarioInicial).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                                                                : "—"}
                                                        </span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {item.horarioPrevisto
                                                                ? new Date(item.horarioPrevisto).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                                                                : "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">{item.regional || "—"}</td>
                                                <td className="px-4 py-2 text-center">
                                                    {Array.isArray(item.clientesAfetados) ? item.clientesAfetados.length : "—"}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <SendIcon size={20} className={item.whatzap ? "text-blue-800" : "text-blue-500"} />
                                                        {item.whatzap ? (
                                                            <CheckIcon size={20} className={item.whatzap ? "text-green-800" : "text-green-500"} />
                                                        ) : (
                                                            <XIcon size={20} className={item.whatzap ? "text-red-800" : "text-red-500"} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <MailCheckIcon size={20} className={item.email ? "text-green-500" : "text-green-500"} />
                                                        {item.whatzap ? (
                                                            <CheckIcon size={20} className={item.whatzap ? "text-green-800" : "text-green-500"} />
                                                        ) : (
                                                            <XIcon size={20} className={item.whatzap ? "text-red-800" : "text-red-500"} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <div className="flex justify-center space-x-2">
                                                        {item.status === "Analise" || item.status === "Pendente" ? (
                                                            <button onClick={() => handleComplete(item)} className="text-blue-500 hover:text-blue-600">
                                                                <ArrowBigRightDashIcon size={20} />
                                                            </button>
                                                        ) : null}
                                                        {item.status === "Ativos" ? (
                                                            <button className="text-green-500 hover:text-green-600">
                                                                <CheckIcon size={20} />
                                                            </button>
                                                        ) : null}
                                                        {item.status === "Reagendados" ? (
                                                            <button className="text-yellow-500 hover:text-yellow-600">
                                                                <AlarmClockPlusIcon size={20} />
                                                            </button>
                                                        ) : null}
                                                        <button onClick={() => handleEdit(item.protocoloISP)} className="text-blue-500 hover:text-blue-600">
                                                            <PencilLine size={20} />
                                                        </button>
                                                        <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-600">
                                                            <Trash size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
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

            <Modal
                title="Confirmar Exclusão"
                message={`Tem certeza de que deseja excluir o protocolo "${modalData?.protocoloISP}"?`}
                protocoloId={modalData?.protocoloISP}
                onSuccess={() => {
                    setShowModal(false);
                    setData(prev => prev.filter(item => item.id !== modalData?.id));
                }}
                onCancel={() => setShowModal(false)}
                isVisible={showModal}
            />

            <AdvanceModal
                title="Avançar Protocolo"
                message={`Deseja avançar o protocolo "${advanceData?.protocoloISP}" para o próximo status?`}
                item={advanceData} // Passa o item inteiro
                onSuccess={() => {
                    setShowAdvanceModal(false);
                    setData(prev => prev.filter(d => d.id !== advanceData.id)); // Remove o item da lista local
                }}
                onCancel={() => setShowAdvanceModal(false)}
                isVisible={showAdvanceModal}
            />

            <Footer />
        </div>
    );
};

export default DashboardPage;
