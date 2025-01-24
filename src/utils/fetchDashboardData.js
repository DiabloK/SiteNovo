import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

// Função para buscar os dados do Firestore
export const fetchDashboardData = async () => {
  const collections = ["Analise", "Ativos", "Pendente", "Reagendado"]; // Coleções para buscar
  const dataCounts = {}; // Objeto para armazenar os contadores
  const allData = []; // Array para armazenar os documentos

  try {
    // Usa Promise.all para buscar todas as coleções simultaneamente
    await Promise.all(
      collections.map(async (col) => {
        try {
          const querySnapshot = await getDocs(collection(db, col)); // Busca a coleção
          dataCounts[col] = querySnapshot.size; // Armazena o número de documentos na coleção

          // Processa cada documento
          querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Adiciona os dados ao array allData
            allData.push({
              id: doc.id, // ID do documento
              tipo: col, // Nome da coleção (tipo do documento)
              status: data.status || "indefinido", // Status do protocolo
              protocoloISP: data.protocoloISP || "—", // Nome do protocolo
              horarioInicial: data.horarioInicial || null, // Horário inicial
              horarioPrevisto: data.horarioPrevisto || null, // Horário previsto
              clientesAfetados: data.clientesAfetados || [], // Clientes afetados
              email: data.email || false, // Se há email associado
              whatzap: data.whatzap || false, // Se há WhatsApp associado
              regional: data.regional || "—", // Região associada
              ...data, // Adiciona todos os outros campos do documento
            });
          });
        } catch (err) {
          console.error(`Erro ao buscar a coleção "${col}":`, err); // Log de erro para uma coleção específica
        }
      })
    );

    // Loga os dados carregados para depuração
    console.log("Dados carregados com sucesso:", { counts: dataCounts, data: allData });

    // Retorna os contadores e os dados para o frontend
    return { counts: dataCounts, data: allData };
  } catch (error) {
    // Loga o erro geral se ocorrer
    console.error("Erro geral ao buscar dados do Firebase:", error);

    // Retorna valores padrão para evitar quebra
    return { counts: {}, data: [] };
  }
};
