import { collection, getDocs } from "firebase/firestore";
import { db } from "/src/utils/firebase.js";

const fetchManutencoesFromFirebase = async () => {
  try {
    console.log("📡 Buscando TODOS os documentos do Firebase...");

    // 📌 Referência da coleção principal
    const manutencoesRef = collection(db, "manutencao");

    // 📡 Buscar TODOS os documentos
    const snapshot = await getDocs(manutencoesRef);

    if (snapshot.empty) {
      console.warn("⚠️ Nenhum dado encontrado no Firebase.");
      return [];
    }

    let dadosPorMes = {};
    const totalPontosAcesso = 15716; // Ajuste para sua realidade

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (!data) return; // Ignorar documentos vazios

      // 🔍 Determinar a data correta (prioridade: dataInicio > dataPrevista > dataFim)
      let dataReferencia = null;

      if (data.dataInicio) {
        dataReferencia = new Date(data.dataInicio);
      } else if (data.dataPrevista) {
        dataReferencia = new Date(data.dataPrevista);
      } else if (data.dataFim) {
        dataReferencia = new Date(data.dataFim);
      } else {
        console.warn("⚠️ Registro ignorado por não ter datas válidas:", data);
        return;
      }

      const mes = dataReferencia.toISOString().slice(0, 7); // Exemplo: "2024-06"

      if (!dadosPorMes[mes]) {
        dadosPorMes[mes] = {
          total_manutencoes: 0,
          total_clientes_afetados: 0,
          total_horas_eventos: 0,
          tempo_medio_eventos: 0,
          disponibilidade: 100,
          tiposEventos: { Manutencao: 0, Incidente: 0, Evento: 0 },
        };
      }

      // 📌 Contagem por tipo
      if (["Manutencao", "Incidente", "Evento"].includes(data.tipo)) {
        dadosPorMes[mes].tiposEventos[data.tipo] += 1;
      }

      dadosPorMes[mes].total_manutencoes += 1;
      dadosPorMes[mes].total_clientes_afetados += data.total_afetados || 0;

      // ⏳ Calcular tempo do evento (se tiver dataFim)
      if (data.dataFim) {
        const dataFim = new Date(data.dataFim);
        const horas = (dataFim - dataReferencia) / (1000 * 60 * 60);
        dadosPorMes[mes].total_horas_eventos += horas;
      }

      dadosPorMes[mes].tempo_medio_eventos =
        dadosPorMes[mes].total_horas_eventos / dadosPorMes[mes].total_manutencoes;

      // 📊 Calcular disponibilidade
      const totalHorasNoMes =
        24 * new Date(dataReferencia.getFullYear(), dataReferencia.getMonth() + 1, 0).getDate();
      const totalHorasEsperadas = totalHorasNoMes * totalPontosAcesso;
      dadosPorMes[mes].disponibilidade =
        ((totalHorasEsperadas - dadosPorMes[mes].total_horas_eventos) /
          totalHorasEsperadas) *
        100;
    });

    console.log("✅ Dados processados com sucesso!", dadosPorMes);

    return Object.entries(dadosPorMes).map(([mes, valores]) => ({
      mesFormatado: new Date(mes + "-01").toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
      ...valores,
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar dados do Firestore:", error);
    return [];
  }
};

export default fetchManutencoesFromFirebase;
