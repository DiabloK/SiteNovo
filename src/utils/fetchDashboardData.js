import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase";

// Função para observar os dados do Firestore em tempo real
export const fetchDashboardData = (callback, errorCallback) => {
  const collections = ["Analise", "Ativos", "Pendente", "Reagendado"];
  const unsubscribes = [];
  const dataCounts = {}; // Contadores por coleção
  let allData = []; // Dados combinados de todas as coleções
  let totalClientesAfetados = 0; // Para acumular os clientes afetados dos documentos "Ativos"

  // Para cada coleção, criamos um listener que atualiza os dados
  collections.forEach((col) => {
    const colRef = collection(db, col);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        // Atualiza o contador para esta coleção
        dataCounts[col] = snapshot.size;

        // Processa os documentos desta coleção
        const colData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();

          // Se for da coleção "Ativos", acumula os clientes afetados
          if (col === "Ativos") {
            const clientesDoc = Number(data.total_afetados) || 0;
            totalClientesAfetados += clientesDoc;
          }

          colData.push({
            id: doc.id,
            tipo: col,
            status: data.status || "indefinido",
            protocoloISP: data.protocoloISP || "—",
            horarioInicial: data.horarioInicial || null,
            horarioPrevisto: data.horarioPrevisto || null,
            clientesAfetados: data.total_afetados,
            email: data.email || false,
            whatzap: data.whatzap || false,
            regional: data.regional || "—",
            // Inclua outros campos conforme necessário
            ...data,
          });
        });

        // Atualiza os dados (aqui usamos uma abordagem simples: refazemos o allData para essa coleção)
        const otherData = allData.filter((item) => item.tipo !== col);
        allData = [...otherData, ...colData];

        // Atualiza também o total de "ClientesAfetados"
        dataCounts.ClientesAfetados = totalClientesAfetados;

        // Chama o callback para atualizar os estados do componente
        callback({ counts: { ...dataCounts }, data: [...allData] });
      },
      (error) => {
        console.error(`Erro ao escutar a coleção ${col}:`, error);
        if (errorCallback) errorCallback(error);
      }
    );
    unsubscribes.push(unsubscribe);
  });

  // Retorna uma função que cancela todos os listeners quando necessário
  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
};
export const subscribeDashboardData = (callback, errorCallback) => {
  if (typeof callback !== "function") {
    console.error("subscribeDashboardData: callback is not a function");
    return () => {}; // Retorna uma função "dummy" para evitar erros
  }

  const collections = ["Analise", "Ativos", "Pendente", "Reagendado"];
  const unsubscribes = [];
  const dataCounts = {};
  let allData = [];
  let totalClientesAfetados = 0;

  collections.forEach((col) => {
    const colRef = collection(db, col);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        dataCounts[col] = snapshot.size;

        // Reinicia a contagem para a coleção "Ativos"
        if (col === "Ativos") {
          totalClientesAfetados = 0;
        }

        const colData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (col === "Ativos") {
            const clientesDoc = Number(data.total_afetados) || 0;
            totalClientesAfetados += clientesDoc;
          }
          colData.push({
            id: doc.id,
            tipo: col,
            status: data.status || "indefinido",
            protocoloISP: data.protocoloISP || "—",
            horarioInicial: data.horarioInicial || null,
            horarioPrevisto: data.horarioPrevisto || null,
            clientesAfetados: data.total_afetados,
            email: data.email || false,
            whatzap: data.whatzap || false,
            regional: data.regional || "—",
            ...data,
          });
        });

        // Atualiza os dados combinados para essa coleção
        const otherData = allData.filter((item) => item.tipo !== col);
        allData = [...otherData, ...colData];

        dataCounts.ClientesAfetados = totalClientesAfetados;

        // Só chama o callback se ele for realmente uma função
        if (typeof callback === "function") {
          callback({ counts: { ...dataCounts }, data: [...allData] });
        }
      },
      (error) => {
        console.error(`Erro ao escutar a coleção ${col}:`, error);
        if (typeof errorCallback === "function") {
          errorCallback(error);
        }
      }
    );
    unsubscribes.push(unsubscribe);
  });

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
};