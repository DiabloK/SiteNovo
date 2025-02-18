import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase";

// Função para observar os dados do Firestore em tempo real
export const fetchDashboardData = (callback, errorCallback) => {
  const collections = ["Requisição", "Analise", "Ativos", "Pendente", "Reagendado"];

  const unsubscribes = [];
  const dataCounts = {}; // Contadores por coleção
  let allData = []; // Dados combinados de todas as coleções

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

          // Unifica protocolo (lê tanto protocoloISP quanto ispProtocolo)
          const protocolValue = data.protocoloISP || data.ispProtocolo || "—";

          colData.push({
            id: doc.id,
            tipo: col,
            status: data.status || "indefinido",
            // Agora sempre teremos 'protocolo' e 'protocoloISP' com o mesmo valor
            protocolo: protocolValue,
            protocoloISP: protocolValue,
            horarioInicial: data.horarioInicial || null,
            horarioPrevisto: data.horarioPrevisto || null,
            email: data.email || false,
            whatzap: data.whatzap || false,
            regional: data.regional || "—",
            // Inclua outros campos conforme necessário
            ...data,
          });
        });

        // Atualiza os dados: remove os itens da coleção atual (caso já existam) e adiciona os novos
        const otherData = allData.filter((item) => item.tipo !== col);
        allData = [...otherData, ...colData];

        // Chama o callback para atualizar os estados do componente
        callback({ counts: { ...dataCounts }, data: [...allData] });
      },
      (error) => {
        console.error(`Erro ao escutar a coleção ${col}:`, error);
        if (errorCallback) errorCallback(error);
      },
    );
    unsubscribes.push(unsubscribe);
  });

  // Retorna uma função que cancela todos os listeners quando necessário
  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
};

export const subscribeDashboardData = (callback, errorCallback) => {
    const collections = ["Requisição", "Analise", "Ativos", "Pendente", "Reagendado"];
    const unsubscribes = [];
    const dataMap = new Map();
    const counts = {};
  
    collections.forEach((col) => {
      const colRef = collection(db, col);
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          counts[col] = snapshot.size;
  
          snapshot.forEach((doc) => {
            const data = doc.data();
  
            // 1) Unifica horárioInicial e horárioPrevisto
            let horarioInicial = data.horarioInicial || null;
            let horarioPrevisto = data.horarioPrevisto || null;
  
            // Se vier de "Requisição", usamos somente dataPrevista1/horaInicio e ignoramos horárioPrevisto
            if (col === "Requisição") {
              if (data.dataPrevista1 && data.horaInicio) {
                horarioInicial = new Date(`${data.dataPrevista1}T${data.horaInicio}:00`).toISOString();
              }
              // Definimos o horário previsto como null para documentos de Requisição
              horarioPrevisto = null;
            } else {
              // Para as outras coleções, se não houver horárioInicial, tenta montar a partir de dataPrevista1 e horaInicio
              if (!horarioInicial && data.dataPrevista1 && data.horaInicio) {
                horarioInicial = new Date(`${data.dataPrevista1}T${data.horaInicio}:00`).toISOString();
              }
              if (!horarioPrevisto && data.dataPrevista2 && data.horaFim) {
                horarioPrevisto = new Date(`${data.dataPrevista2}T${data.horaFim}:00`).toISOString();
              }
            }
  
            // 2) Unifica city (ex.: localOcorrencia, cidadesAfetadas ou campo cidade)
            let cityName = "—";
            if (Array.isArray(data.localOcorrencia) && data.localOcorrencia.length > 0) {
              cityName = data.localOcorrencia.map((loc) => loc.nome).join(", ");
            } else if (Array.isArray(data.cidadesAfetadas) && data.cidadesAfetadas.length > 0) {
              cityName = data.cidadesAfetadas.map((loc) => loc.nome).join(", ");
            } else if (data.cidade) {
              cityName = data.cidade;
            }
  
            // 3) Unifica clientesAfetados
            let clientesValue = 0;
            if (data.total_afetados !== undefined && data.total_afetados !== null) {
              clientesValue = Number(data.total_afetados);
            } else if (Array.isArray(data.Clientesafetados)) {
              clientesValue = data.Clientesafetados.length;
            } else if (Array.isArray(data.cidadesAfetadas)) {
              clientesValue = data.cidadesAfetadas.length;
            }
  
            // 4) Unifica emailB2B e digisac
            let emailB2BValue = false;
            if (data.emailB2B === false || data.emailB2B === "false") {
              emailB2BValue = false;
            } else if (Array.isArray(data.emailB2B)) {
              emailB2BValue = data.emailB2B.length > 0 ? data.emailB2B : false;
            } else {
              emailB2BValue = data.emailB2B !== "false" ? [{ name: data.emailB2B }] : false;
            }
  
            let digisacValue = false;
            if (data.digisac === false || data.digisac === "false") {
              digisacValue = false;
            } else if (Array.isArray(data.digisac)) {
              digisacValue = data.digisac.length > 0 ? data.digisac : false;
            } else {
              digisacValue = data.digisac !== "false" ? [{ name: data.digisac }] : false;
            }
  
            // Unifica protocolo (lê tanto protocoloISP quanto ispProtocolo)
            const protocolValue = data.protocoloISP || data.ispProtocolo || "—";
  
            // Monta objeto final padronizado
            dataMap.set(doc.id, {
              id: doc.id,
              tipo: col, // Coleção de origem
              status: data.status || "indefinido",
  
              // Horários unificados
              horarioInicial,
              horarioPrevisto,
  
              // Cidade unificada
              city: cityName,
  
              // Contagem de clientes afetados
              clientesAfetados: clientesValue,
  
              // E-mail e WhatsApp "sim/não"
              email: data.email || false,
              whatzap: data.whatzap || false,
  
              // Email B2B e digisac
              emailB2B: emailB2BValue,
              digisac: digisacValue,
  
              // Protocolo unificado
              protocolo: protocolValue,
              protocoloISP: protocolValue,
  
              // Mantenha o resto do data
              ...data,
            });
          });
  
          // Remove docs que foram excluídos
          const currentDocIds = new Set(snapshot.docs.map((doc) => doc.id));
          for (const [id, item] of dataMap.entries()) {
            if (item.tipo === col && !currentDocIds.has(id)) {
              dataMap.delete(id);
            }
          }
  
          // Atualiza contadores
          const totalClientesAfetados = Array.from(dataMap.values())
            .filter((item) => item.status === "Ativos")
            .reduce((acc, item) => acc + (Number(item.clientesAfetados) || 0), 0);
          counts.ClientesAfetados = totalClientesAfetados;
  
          const totalClientesB2B = Array.from(dataMap.values()).filter(
            (item) => item.status === "Ativos" && (item.emailB2B !== false || item.digisac !== false)
          ).length;
          counts.ClientesB2B = totalClientesB2B;
  
          callback({
            counts: { ...counts },
            data: Array.from(dataMap.values()),
          });
        },
        (error) => {
          console.error(`Erro ao escutar a coleção ${col}:`, error);
          if (errorCallback) errorCallback(error);
        }
      );
      unsubscribes.push(unsubscribe);
    });
  
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  };
  