import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from "recharts";
import fetchManutencoesFromFirebase from "../services/firebaseManutencoes";

const ManutencaoChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [theme, setTheme] = useState("light");

    // 1️⃣ Buscar dados do Firebase uma vez ao montar o componente
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchManutencoesFromFirebase();
                setChartData(data);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 2️⃣ Detectar mudança no tema automaticamente usando matchMedia
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const checkTheme = () => {
            setTheme(mediaQuery.matches ? "dark" : "light");
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", checkTheme);
        } else if (mediaQuery.addListener) {
            mediaQuery.addListener(checkTheme);
        }

        checkTheme();

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener("change", checkTheme);
            } else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(checkTheme);
            }
        };
    }, []);

    // 3️⃣ Handler para clique no gráfico (para exibir detalhes)
    const handleChartClick = (data) => {
        // O Recharts fornece activeLabel quando um ponto é clicado
        if (data && data.activeLabel) {
            const mesSelecionado = data.activeLabel;
            const detalhes = chartData.find((item) => item.mesFormatado === mesSelecionado)?.detalhes || [];
            setSelectedMonth(mesSelecionado);
            setSelectedDetails(detalhes);
        }
    };

    const isDarkMode = theme === "dark";

    return (
        <div className={`flex w-full flex-col items-center justify-center ${isDarkMode ? "dark" : ""}`}>
            {loading ? (
                <div className="flex h-96 items-center justify-center">
                    <p className={isDarkMode ? "text-white" : "text-black"}>Carregando dados...</p>
                </div>
            ) : (
                <>
                    <div className="card w-full max-w-5xl">
                        <div className="card-header">
                            <p className="card-title text-center text-xl font-bold text-black dark:text-white">Manutenções por Mês</p>
                        </div>
                        <div className="card-body p-0">
                            <ResponsiveContainer
                                width="100%"
                                height={400}
                            >
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                                    onClick={handleChartClick}
                                >
                                    <defs>
                                        <linearGradient
                                            id="colorTotal"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor={isDarkMode ? "#ff4d4d" : "#2563eb"}
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={isDarkMode ? "#ff4d4d" : "#2563eb"}
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="mesFormatado"
                                        stroke={isDarkMode ? "#94a3b8" : "#475569"}
                                        tickMargin={6}
                                    />
                                    <YAxis
                                        stroke={isDarkMode ? "#94a3b8" : "#475569"}
                                        tickMargin={6}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        formatter={(value) => `${value}`}
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255,255,255,0.8)",
                                            color: isDarkMode ? "#ffffff" : "#000000",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total_manutencoes"
                                        stroke={isDarkMode ? "#ff4d4d" : "#007BFF"}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {selectedMonth && (
                        <div className="mt-6 w-full max-w-5xl">
                            <h2 className="mb-4 text-center text-xl font-bold text-black dark:text-white">
                                Detalhes das Manutenções em {selectedMonth}
                            </h2>
                            <table className="w-full table-auto text-sm">
                                <thead>
                                    <tr className="px-4 py-2 text-center hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <th className="px-4 py-2 text-center text-black dark:text-white">ID</th>
                                        <th className="px-4 py-2 text-center text-black dark:text-white">Protocolo</th>
                                        <th className="px-4 py-2 text-center text-black dark:text-white">Clientes Afetados</th>
                                        <th className="px-4 py-2 text-center text-black dark:text-white">Data Início</th>
                                        <th className="px-4 py-2 text-center text-black dark:text-white">Data Fim</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDetails.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`text-center ${
                                                isDarkMode ? "bg-transparent hover:bg-gray-700" : "bg-transparent hover:bg-gray-200"
                                            }`}
                                        >
                                            <td className="px-4 py-2 text-center text-black dark:text-white">{item.id}</td>
                                            <td className="px-4 py-2 text-center text-black dark:text-white">{item.protocolo}</td>
                                            <td className="px-4 py-2 text-center text-black dark:text-white">{item.total_afetados}</td>
                                            <td className="px-4 py-2 text-center text-black dark:text-white">{item.dataInicio}</td>
                                            <td className="px-4 py-2 text-center text-black dark:text-white">{item.dataFim}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManutencaoChart;
