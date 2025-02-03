import { useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "/src/utils/firebase";

const fetchManutencoesFromFirebase = async (selectedMonth) => {
    try {
        if (!selectedMonth) return [];

        const dataInicio = new Date(`${selectedMonth}-01`);
        const dataFim = new Date(dataInicio);
        dataFim.setMonth(dataFim.getMonth() + 1);

        const manutencoesRef = collection(db, "manutencao");
        const q = query(
            manutencoesRef,
            where("datainicio", ">=", dataInicio),
            where("datainicio", "<", dataFim),
            orderBy("datainicio", "asc")
        );

        const snapshot = await getDocs(q);
        let dadosPorTipo = {
            manutencao: { abertos: 0, fechados: 0 },
            incidente: { abertos: 0, fechados: 0 },
            evento: { abertos: 0, fechados: 0 },
            requerimento: { abertos: 0, fechados: 0 }
        };
        let dadosPorUsuario = {};
        let dadosPorFinalizador = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            const tipo = data.tipo?.toLowerCase() || "outro";
            const status = data.status?.toLowerCase() || "indefinido";
            const usuarioCriador = data.usuariocriador || "Desconhecido";
            const finalizadoPor = data.finalizado_por || "Desconhecido";

            // Contagem de atendimentos por tipo e status
            if (dadosPorTipo[tipo]) {
                dadosPorTipo[tipo].abertos++;
                if (status === "concluida") {
                    dadosPorTipo[tipo].fechados++;
                }
            }

            // Contagem de atendimentos por usuário criador
            if (!dadosPorUsuario[usuarioCriador]) {
                dadosPorUsuario[usuarioCriador] = {
                    requerimento: 0,
                    incidente: 0,
                    manutencao: 0,
                    evento: 0
                };
            }
            if (dadosPorUsuario[usuarioCriador][tipo] !== undefined) {
                dadosPorUsuario[usuarioCriador][tipo]++;
            }

            // Contagem de atendimentos finalizados por usuário
            if (!dadosPorFinalizador[finalizadoPor]) {
                dadosPorFinalizador[finalizadoPor] = {
                    requerimento: 0,
                    incidente: 0,
                    manutencao: 0,
                    evento: 0
                };
            }
            if (dadosPorFinalizador[finalizadoPor][tipo] !== undefined) {
                dadosPorFinalizador[finalizadoPor][tipo]++;
            }
        });

        return {
            dadosPorTipo,
            dadosPorUsuario,
            dadosPorFinalizador
        };
    } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
        return {};
    }
};

const ManutencaoChart = () => {
    const [selectedMonth, setSelectedMonth] = useState("");
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const data = await fetchManutencoesFromFirebase(selectedMonth);
        setChartData(data);
        setLoading(false);
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
                <pre>{JSON.stringify(chartData, null, 2)}</pre>
            )}
        </div>
    );
};

export default ManutencaoChart;
