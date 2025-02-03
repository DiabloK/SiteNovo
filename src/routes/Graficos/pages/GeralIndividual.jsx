import {  useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "/src/utils/firebase";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from "recharts";

const ManutencaoChart = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [theme, setTheme] = useState("light");

    const fetchData = async () => {
        if (!selectedMonth) return;
        setLoading(true);
        try {
            const dataInicio = new Date(`${selectedMonth}-01`);
            const dataFim = new Date(dataInicio);
            dataFim.setMonth(dataFim.getMonth() + 1);
            
            const manutencoesRef = collection(db, "manutencao");
            const q = query(
                manutencoesRef,
                where("dataInicio", ">=", dataInicio.toISOString()),
                where("dataInicio", "<", dataFim.toISOString()),
                orderBy("dataInicio", "asc")
            );
            
            const snapshot = await getDocs(q);
            let dadosPorMes = [];
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const totalAfetados = Array.isArray(data.afetados) ? data.afetados.length : 0;
                if (totalAfetados < 150) return;
                
                dadosPorMes.push({
                    id: doc.id,
                    protocolo: data.protocolo || "Sem Protocolo",
                    total_afetados: totalAfetados,
                    dataInicio: new Date(data.dataInicio).toLocaleString(),
                    dataFim: new Date(data.dataFim).toLocaleString(),
                });
            });
            
            setChartData(dadosPorMes);
        } catch (error) {
            console.error("Erro ao buscar dados do Firestore:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-center justify-center">
            <div className="flex space-x-4 mb-4">
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border rounded"
                />
                <button
                    onClick={fetchData}
                    className="p-2 bg-blue-500 text-white rounded"
                >
                    Carregar Dados
                </button>
            </div>
            {loading ? (
                <p>Carregando dados...</p>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData}>
                            <XAxis dataKey="dataInicio" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="total_afetados" stroke="#2563eb" fill="#2563eb" />
                        </AreaChart>
                    </ResponsiveContainer>
                    {selectedDetails.length > 0 && (
                        <div>
                            <h2>Detalhes de {selectedMonth}</h2>
                            <ul>
                                {selectedDetails.map((item) => (
                                    <li key={item.id}>{item.protocolo} - {item.dataInicio}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManutencaoChart;
