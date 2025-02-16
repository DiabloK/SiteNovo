import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, LineChart, Line } from "recharts";
import fetchManutencoesFromFirebase from "../services/fetchManutencoesFromFirebase";

const ManutencaoChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchManutencoesFromFirebase();
                console.log("📊 Dados carregados:", data); // 🔹 Debug no console
                setChartData(data);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const checkTheme = () => {
            setTheme(mediaQuery.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", checkTheme);
        checkTheme();

        return () => mediaQuery.removeEventListener("change", checkTheme);
    }, []);

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
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="mesFormatado" stroke={isDarkMode ? "#94a3b8" : "#475569"} tickMargin={6} />
                                    <YAxis stroke={isDarkMode ? "#94a3b8" : "#475569"} tickMargin={6} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="total_manutencoes" stroke="#007BFF" fillOpacity={0.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-8 w-full max-w-5xl">
                        <h2 className="text-center text-xl font-bold text-black dark:text-white">Disponibilidade da Rede</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <XAxis dataKey="mesFormatado" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="disponibilidade" stroke="#ff4d4d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManutencaoChart;
