import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

export const fetchDashboardData = async () => {
  const collections = ["Analise", "Ativos", "Pendente", "Reagendado"];
  const dataCounts = {};
  const allData = [];

  try {
    await Promise.all(
      collections.map(async (col) => {
        try {
          const querySnapshot = await getDocs(collection(db, col));
          dataCounts[col] = querySnapshot.size;

          querySnapshot.forEach((doc) => {
            const data = doc.data();

            allData.push({
              id: doc.id, // Garante que sempre tenha um ID
              tipo: col, // Adiciona o tipo baseado na coleção
              status: data.status || "indefinido", // Valor padrão para status
              protocoloISP: data.protocoloISP || "—", // Valor padrão para protocolo
              horarioInicial: data.horarioInicial || null,
              horarioPrevisto: data.horarioPrevisto || null,
              clientesAfetados: data.clientesAfetados || [],
              email: data.email || false,
              whatzap: data.whatzap || false,
              regional: data.regional || "—",
              ...data, // Adiciona todos os outros campos do documento
            });
          });
        } catch (err) {
          console.error(`Erro ao buscar a coleção "${col}":`, err);
        }
      })
    );

    console.log("Dados carregados com sucesso:", { counts: dataCounts, data: allData });
    return { counts: dataCounts, data: allData };
  } catch (error) {
    console.error("Erro geral ao buscar dados do Firebase:", error);
    return { counts: {}, data: [] };
  }
};
