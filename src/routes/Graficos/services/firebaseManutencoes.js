import { collection, getDocs } from "firebase/firestore";
import { db } from "/src/utils/firebase.js";

// Função para formatar o mês corretamente (Ex: "Setembro de 2024")
const formatarMes = (data) => {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dt = new Date(data);
  return `${meses[dt.getMonth()]} de ${dt.getFullYear()}`;
};

// Função para formatar Data e Hora (Ex: "05/09/2024 21:33")
const formatarDataHora = (data) => {
  if (!data) return "N/A";
  const dt = new Date(data);
  if (isNaN(dt)) return "N/A";
  
  const dia = dt.getDate().toString().padStart(2, "0");
  const mes = (dt.getMonth() + 1).toString().padStart(2, "0");
  const ano = dt.getFullYear();
  const hora = dt.getHours().toString().padStart(2, "0");
  const min = dt.getMinutes().toString().padStart(2, "0");

  return `${dia}/${mes}/${ano} ${hora}:${min}`;
};

const fetchManutencoesFromFirebase = async () => {
  try {
    const manutencoesRef = collection(db, "manutencao");
    const snapshot = await getDocs(manutencoesRef);

    let dadosPorMes = {};

    // Criando data limite para os últimos 12 meses
    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - 11);
    dataLimite.setDate(1);

    snapshot.forEach((doc) => {
      const data = doc.data();
      const totalAfetados = Array.isArray(data.afetados) ? data.afetados.length : 0;

      if (totalAfetados > 150) {
        const dataManutencao = new Date(data.dataInicio);
        if (isNaN(dataManutencao) || dataManutencao < dataLimite) return; // Ignorar dados fora do intervalo

        const mes = dataManutencao.toISOString().slice(0, 7);
        const mesFormatado = formatarMes(dataManutencao);

        if (!dadosPorMes[mes]) {
          dadosPorMes[mes] = {
            mesFormatado,
            total_manutencoes: 0,
            detalhes: [],
          };
        }

        dadosPorMes[mes].total_manutencoes += 1;
        dadosPorMes[mes].detalhes.push({
          id: doc.id,
          protocolo: data.protocolo || "Sem Protocolo",
          total_afetados: totalAfetados,
          dataInicio: formatarDataHora(data.dataInicio),
          dataFim: formatarDataHora(data.dataFim),
        });
      }
    });

    return Object.entries(dadosPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, valores]) => ({ mes, ...valores }));
  } catch (error) {
    console.error("❌ Erro ao buscar dados do Firestore:", error);
    return [];
  }
};

export default fetchManutencoesFromFirebase;
