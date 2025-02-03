import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/src/utils/firebase.js";

const fetchManutencoesFromFirebase = async () => {
  try {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 12);
    dataInicio.setDate(1);

    const manutencoesRef = collection(db, "manutencao");
    const q = query(manutencoesRef, where("datainicio", ">=", dataInicio));
    const snapshot = await getDocs(q);

    let dadosPorMes = {};

    snapshot.forEach((doc) => {
      const { datainicio, total_afetados } = doc.data();
      const mes = new Date(datainicio.toDate()).toISOString().slice(0, 7);

      if (!dadosPorMes[mes]) {
        dadosPorMes[mes] = { total_manutencoes: 0, total_clientes_afetados: 0 };
      }

      dadosPorMes[mes].total_manutencoes += 1;
      dadosPorMes[mes].total_clientes_afetados += total_afetados;
    });

    return Object.entries(dadosPorMes).map(([mes, valores]) => ({ mes, ...valores }));
  } catch (error) {
    console.error("Erro ao buscar dados do Firestore:", error);
    return [];
  }
};

export default fetchManutencoesFromFirebase;
