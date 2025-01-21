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
    MessageSquareShareIcon,
    MailCheckIcon,
    UserX2Icon,
    XIcon,
    CheckIcon,
    SendIcon,
    ArrowBigRightDashIcon,
    CircleCheckBig
} from "lucide-react";
import { handleEdit, handleDelete, handleComplete } from "@/utils/action";


const DashboardPage = () => {
    const [data, setData] = useState([]); // Dados completos
    const [filteredData, setFilteredData] = useState([]); // Dados filtrados
    const [counts, setCounts] = useState({}); // Contadores para os cards
    const [loading, setLoading] = useState(true); // Estado de carregamento
    const [search, setSearch] = useState(""); // Valor de pesquisa
    const [activeFilter, setActiveFilter] = useState("Analise"); // Filtro ativo

    // Carregar os dados do Firebase
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await fetchDashboardData(); // Busca os dados do Firebase
                setCounts(result.counts || {}); // Atualiza os contadores
                setData(result.data || []); // Salva os dados completos
                setFilteredData(
                    result.data.filter((item) => item.status === activeFilter) // Filtra os dados com base no filtro ativo
                );
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
    }, []); // Carrega os dados ao montar o componente

    // Atualizar a tabela ao mudar o filtro ativo
    useEffect(() => {
        const filterData = () => {
            const filtered = data.filter((item) => item.status === activeFilter); // Filtra com base no status
            setFilteredData(filtered);
        };

        filterData();
    }, [activeFilter, data]); // Refiltra ao mudar `activeFilter` ou `data`

    // Filtrar os dados com base na pesquisa
    useEffect(() => {
        const filterBySearch = () => {
            if (!search) {
                setFilteredData(data.filter((item) => item.status === activeFilter)); // Reaplica apenas o filtro ativo
            } else {
                const filtered = data
                    .filter((item) => item.status === activeFilter)
                    .filter((item) => {
                        const protocolo = item.protocoloISP || "";
                        const regional = item.regional || "";

                        return (
                            protocolo.toLowerCase().includes(search.toLowerCase()) ||
                            regional.toLowerCase().includes(search.toLowerCase())
                        );
                    });
                setFilteredData(filtered);
            }
        };

        filterBySearch();
    }, [search, activeFilter, data]);

    const containers = [
        { title: "Analise", icon: Activity, value: counts.Analise || 0 },
        { title: "Reagendado/Incompletos", icon: Calendar, value: counts.Reagendado || 0 },
        { title: "Pendente", icon: Clock, value: counts.Pendente || 0 },
        { title: "Ativos", icon: AlertCircle, value: counts.Ativos || 0 },
        { title: "Clientes Afetados", icon: UserX2Icon, value: counts.ClientesAfetados || 0 }, // Novo card
    ];
    const handleEdit = (idProtocolo, navigate) => {
        const path = `/visualizacao/${idProtocolo}`;
        navigate(path); // Redireciona o usuário para o caminho
    };


    const handleDelete = (id) => {
        console.log(`Excluindo protocolo ${id}`);
        // Adicione lógica para exclusão aqui
    };

    const handleComplete = (id) => {
        console.log(`Protocolo ${id} concluído!`);
        // Adicione lógica para concluir o protocolo aqui
    };



    return (
        <div className="w-full min-h-screen bg-inherit text-slate-100">
            <h1 className="flex items-center text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
                <Activity className="mr-2 text-blue-500 dark:text-blue-400" size={32} />
                Dashboard
            </h1>
            
            {/* Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {containers.map((container, index) => (
                    <div
                        key={index}
                        className={`card p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg ${activeFilter === container.title ? "ring-2 ring-blue-500" : ""
                            }`}
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
            {/* Tabela com Campo de Pesquisa */}
            <div className="card mt-8">
                <div className="card-header flex justify-between items-center p-4">
                    <p className="card-title text-lg font-semibold text-slate-900 dark:text-slate-50">
                        Detalhes do Protocolo
                    </p>
                    <input
                        type="text"
                        placeholder="Pesquisar por Protocolo ou Regional"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-1/3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-50 dark:placeholder-gray-500 dark:focus:ring-blue-400"
                    />
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <p className="text-center py-4">Carregando...</p>
                    ) : (
                        <div className="relative h-[500px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                            <table className="table-auto w-full text-sm">
                                <thead className="bg-inherit text-gray-900 dark:text-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                            Protocolo
                                        </th>
                                        <th className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                            Status
                                        </th>
                                        <th className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                            Horário Previsto
                                        </th>
                                        <th className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                            Regional
                                        </th>
                                        <th className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                            Clientes Afetados
                                        </th>
                                        <th className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                            WhatsApp
                                        </th>
                                        <th className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                            E-mail
                                        </th>
                                        <th className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                                {/* Protocolo */}
                                                <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">{item.protocoloISP || "—"}</td>

                                                {/* Status */}
                                                <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">{item.status || "—"}</td>

                                                {/* Horário Previsto */}
                                                <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                                                    <div className="flex flex-col items-center">
                                                        <span>
                                                            {new Date(item.horarioInicial).toLocaleString("pt-BR", {
                                                                dateStyle: "short",
                                                                timeStyle: "short",
                                                            })}
                                                        </span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {new Date(item.horarioPrevisto).toLocaleString("pt-BR", {
                                                                dateStyle: "short",
                                                                timeStyle: "short",
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>


                                                {/* Regional */}
                                                <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">{item.regional || "—"}</td>

                                                {/* Clientes Afetados */}
                                                <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">{item.clientesAfetados || "—"}</td>

                                                {/* Coluna WhatsApp */}
                                                <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <SendIcon
                                                            size={20}
                                                            className={
                                                                item.emailStatus
                                                                    ? "text-blue-800 dark:text-blue-800" // Ícone de envio
                                                                    : "text-blue-800 dark:text-blue-800"  // Ícone de erro
                                                            }
                                                            title={
                                                                item.emailStatus
                                                                    ? "E-mail enviado"
                                                                    : "E-mail não enviado"
                                                            }
                                                        />
                                                        {item.emailStatus ? (
                                                            <CircleCheckBig
                                                                size={20}
                                                                className="text-green-800 dark:text-green-800"
                                                                title="E-mail enviado com sucesso"
                                                            />
                                                        ) : (
                                                            <XIcon
                                                                size={20}
                                                                className="text-red-500 dark:text-red-400"
                                                                title="E-mail não enviado"
                                                            />
                                                        )}
                                                    </div>
                                                </td>



                                                {/* Coluna E-mail */}
                                                <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <MailCheckIcon
                                                            size={20}
                                                            className={
                                                                item.emailStatus
                                                                    ? "text-green-500 dark:text-green-400"
                                                                    : "text-green-500 dark:text-green-400"
                                                            }
                                                            title={
                                                                item.emailStatus
                                                                    ? "E-mail enviado"
                                                                    : "E-mail não enviado"
                                                            }
                                                        />
                                                        {item.emailStatus ? (
                                                            <CircleCheckBig
                                                                size={20}
                                                                className="text-blue-500 dark:text-green-400"
                                                                title="E-mail enviado com sucesso"
                                                            />
                                                        ) : (
                                                            <XIcon
                                                                size={20}
                                                                className="text-red-500 dark:text-red-400"
                                                                title="E-mail não enviado"
                                                            />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Coluna Ações */}
                                                <td className="px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                                                    <div className="flex justify-center items-center space-x-2">
                                                        {/* Botão para Check ou Arrow */}
                                                        {item.status === "ATIVO" || item.status === "REAGENDANDO" ? (
                                                            <button
                                                                onClick={() => handleComplete(item.id)}
                                                                className="text-green-500 hover:text-green-600"
                                                                title="Marcar como concluído"
                                                            >
                                                                <CheckIcon size={20} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleComplete(item.id)}
                                                                className="text-blue-500 hover:text-blue-600"
                                                                title="Avançar"
                                                            >
                                                                <ArrowBigRightDashIcon size={20} />
                                                            </button>
                                                        )}

                                                        {/* Botão Editar */}
                                                        <button
                                                            onClick={() => handleEdit(item.id, navigate)}
                                                            className="text-blue-500 hover:text-blue-600"
                                                            title="Editar protocolo"
                                                        >
                                                            <PencilLine size={20} />
                                                        </button>

                                                        {/* Botão Excluir */}
                                                        <button
                                                            onClick={() => {
                                                                setModalData(item);
                                                                handleDelete(item.id, setShowModal);
                                                            }}
                                                            className="text-red-500 hover:text-red-600"
                                                            title="Excluir protocolo"
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
                                                colSpan="8"
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
            <Footer />
        </div>

    );
};

export default DashboardPage;
