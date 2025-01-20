import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import Modal from "@/utils/Modal";
const userHasRole = (roles) => {
    const userRoles = ["admin", "editor", "eng"]; // Simulação do usuário atual
    return roles.some((role) => userRoles.includes(role));
};
const BotaoAcao = ({ label, onClick, roles, show }) => {
    if (!show || !userHasRole(roles)) return null;

    return (
        <button
            onClick={onClick}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500"
        >
            {label}
        </button>
    );
};

const VisualizacaoPage = () => {
    const { protocolo } = useParams(); // Captura o parâmetro da URL
    const [protocoloData, setProtocoloData] = useState(null); // Armazena os dados do protocolo
    const [loading, setLoading] = useState(true); // Indica se a página está carregando
    const [error, setError] = useState(false); // Indica se houve erro na busca

    useEffect(() => {
        if (!protocolo) {
            setError(true);
            setLoading(false);
            return;
        }

        const fetchProtocolo = async () => {
            try {
                const docRef = doc(db, "protocolos", protocolo);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProtocoloData(docSnap.data());
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProtocolo();
    }, [protocolo]);

    // Tela de carregamento
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 dark:border-blue-400"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Carregando dados do protocolo...
                    </p>
                </div>
            </div>
        );
    }

    // Tela de erro
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-center text-red-500 dark:text-red-400">
                    Protocolo não encontrado ou ocorreu um erro ao buscar os dados.
                </p>
            </div>
        );
    }

    // Tela de exibição dos dados
    return (
        <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">
                    Detalhes do Protocolo
                </h1>

                {/* Exibição dos Dados */}
                <div className="space-y-4">
                    {/* Usuário Criador */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Usuário Criador:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {protocoloData?.usuario || "Não disponível"}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Status:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {protocoloData?.status || "Não disponível"}
                        </p>
                    </div>

                    {/* Data Início */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Data Início:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {protocoloData?.horarioInicial || "Não disponível"}
                        </p>
                    </div>

                    {/* Data Finalização */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Data Finalização:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {protocoloData?.horarioFinal || "Não disponível"}
                        </p>
                    </div>

                    {/* Tipo */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Tipo:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {protocoloData?.tipo || "Não disponível"}
                        </p>
                    </div>

                    {/* Regional */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Regional:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {protocoloData?.regional || "Não disponível"}
                        </p>
                    </div>

                    {/* Total de Clientes */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Total de Clientes:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {protocoloData?.total_afetados || "Não disponível"}
                        </p>
                    </div>

                    {/* Pontos de Acesso */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Pontos de Acesso:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {Array.isArray(protocoloData?.pontoAcesso) && protocoloData.pontoAcesso.length > 0
                                ? protocoloData.pontoAcesso.join(", ")
                                : typeof protocoloData?.pontoAcesso === "string" && protocoloData.pontoAcesso.trim()
                                    ? protocoloData.pontoAcesso
                                    : "Nenhum ponto disponível"}
                        </p>
                    </div>

                    {/* Dividida */}
                    {protocoloData?.Dividida && (
                        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                            <p className="text-slate-900 dark:text-slate-50 font-semibold">
                                Manutenção Dividida:
                            </p>
                            {Object.entries(protocoloData.Dividida).map(([parte, valores]) => (
                                <div key={parte} className="mt-2">
                                    <p className="text-slate-900 dark:text-slate-50 font-semibold">
                                        Parte {parte.split("-")[0]}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Início: {valores["Inicio Horario"] || "Vazio"}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Previsto: {valores["Previsto Horario"] || "Vazio"}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fim: {valores["Fim Horario"] || "Vazio"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Cidades Selecionadas */}
                    {protocoloData?.cidadesSelecionadas?.length > 0 && (
                        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                            <p className="text-slate-900 dark:text-slate-50 font-semibold">
                                Cidades Selecionadas:
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {protocoloData.cidadesSelecionadas.map((cidade) => cidade.nome).join(", ")}
                            </p>
                        </div>
                    )}

                    {/* Observação */}
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700 mt-6">
                        <p className="text-slate-900 dark:text-slate-50 font-semibold">
                            Observação:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {protocoloData?.observacao || "Nenhuma observação registrada"}
                        </p>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 flex flex-wrap gap-4">
                    {/* Botão Reagendar */}
                    <BotaoAcao
                        label="Reagendar"
                        onClick={() => handleAction("Reagendar")}
                        roles={["admin", "editor", "eng"]}
                        show={protocoloData?.status?.trim().toLowerCase() === "reagendado"}
                    />

                    {/* Botão Reabrir */}
                    <BotaoAcao
                        label="Reabrir"
                        onClick={() => handleAction("Reabrir")}
                        roles={["admin", "editor", "eng"]}
                        show={protocoloData?.status?.trim().toLowerCase() === "concluida"}
                    />

                    {/* Botão Editar Ajustes */}
                    <BotaoAcao
                        label="Editar Ajustes"
                        onClick={() => handleAction("Editar Ajustes")}
                        roles={["admin", "editor", "eng"]}
                        show={true}
                    />

                    {/* Botão Finalizar */}
                    <BotaoAcao
                        label="Finalizar"
                        onClick={() => handleAction("Finalizar")}
                        roles={["admin", "editor", "eng"]}
                        show={protocoloData?.status?.trim().toLowerCase() !== "concluida"}
                    />
                    <BotaoAcao
                        label="Aprovar"
                        onClick={() => alterarStatus("Aprovado")}
                        roles={["admin", "editor"]}
                        show={protocoloData?.status?.trim().toLowerCase() === "analise"}
                    />

                    {/* Botão para Em Andamento (Nível: Pendente -> Em Andamento) */}
                    <BotaoAcao
                        label="Em Andamento"
                        onClick={() => alterarStatus("Em Andamento")}
                        roles={["admin", "editor"]}
                        show={protocoloData?.status?.trim().toLowerCase() === "pendente"}
                    />
                </div>


            </div>

            {/* Modal Reutilizável */}

        </div >
    );
};

export default VisualizacaoPage;
