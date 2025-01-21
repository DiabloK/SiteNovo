import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

export const fetchDashboardData = async () => {
  const collections = ["Analise", "Ativos", "Pendete", "Reagendado"];
  const dataCounts = {};
  const allData = []; // Para armazenar todos os documentos das coleções

  try {
    // Buscar dados de todas as coleções em paralelo
    await Promise.all(
      collections.map(async (col) => {
        try {
          const querySnapshot = await getDocs(collection(db, col));

          // Atualiza os contadores de cada coleção
          dataCounts[col] = querySnapshot.size;

          // Verifica se há documentos na coleção
          if (!querySnapshot.empty) {
            // Adiciona os dados completos de cada documento ao array "allData"
            querySnapshot.forEach((doc) => {
              allData.push({
                ...doc.data(), // Dados do documento
                id: doc.id, // ID do documento no Firestore
                tipo: col, // Adiciona o nome da coleção como "tipo"
              });
            });
          } else {
            console.warn(`A coleção "${col}" está vazia.`);
          }
        } catch (err) {
          console.error(`Erro ao buscar a coleção "${col}":`, err);
        }
      })
    );

    console.log("Dados carregados com sucesso:", { counts: dataCounts, data: allData });
    return { counts: dataCounts, data: allData }; // Retorna os contadores e os dados completos
  } catch (error) {
    console.error("Erro geral ao buscar dados do Firebase:", error);
    return { counts: {}, data: [] }; // Retorna valores padrão em caso de erro
  }
};
