import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase";

// Função para observar os dados do Firestore em tempo real
export const fetchDashboardData = (callback, errorCallback) => {
    const collections = ["Analise", "Ativos", "Pendente", "Reagendado"];
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

                    colData.push({
                        id: doc.id,
                        tipo: col,
                        status: data.status || "indefinido",
                        protocoloISP: data.protocoloISP || "—",
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
    const collections = ["Analise", "Ativos", "Pendente", "Reagendado"];
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

                    // Clientes afetados
                    const clientesValue =
                        data.total_afetados !== undefined && data.total_afetados !== null
                            ? Number(data.total_afetados)
                            : Array.isArray(data.Clientesafetados)
                              ? data.Clientesafetados.length
                              : 0;

                    // Para emailB2B: se não houver dado, interpretamos como false;
                    // se houver, esperamos que seja um array de objetos.
                    let emailB2BValue = false;
                    if (data.emailB2B === false || data.emailB2B === "false") {
                        emailB2BValue = false;
                    } else if (Array.isArray(data.emailB2B)) {
                        emailB2BValue = data.emailB2B.length > 0 ? data.emailB2B : false;
                    } else {
                        // Caso venha como string diferente de "false"
                        emailB2BValue = data.emailB2B !== "false" ? [{ name: data.emailB2B }] : false;
                    }

                    // Para digisac: mesma lógica
                    let digisacValue = false;
                    if (data.digisac === false || data.digisac === "false") {
                        digisacValue = false;
                    } else if (Array.isArray(data.digisac)) {
                        digisacValue = data.digisac.length > 0 ? data.digisac : false;
                    } else {
                        digisacValue = data.digisac !== "false" ? [{ name: data.digisac }] : false;
                    }

                    // Normaliza a cidade a partir de localOcorrencia
                    let cityName = "—";
                    if (Array.isArray(data.localOcorrencia) && data.localOcorrencia.length > 0) {
                        cityName = data.localOcorrencia.map((loc) => loc.nome).join(", ");
                    }

                    // Se o campo emailB2B for um array de objetos, tentamos extrair um nome para exibição:
                    let nomeB2B = "—";
                    if (Array.isArray(emailB2BValue) && emailB2BValue.length > 0 && typeof emailB2BValue[0] === "object") {
                        nomeB2B = emailB2BValue[0].name || "—";
                    }

                    dataMap.set(doc.id, {
                        id: doc.id,
                        tipo: col,
                        status: data.status || "indefinido",
                        protocoloISP: data.protocoloISP || "—",
                        horarioInicial: data.horarioInicial || null,
                        horarioPrevisto: data.horarioPrevisto || null,
                        clientesAfetados: clientesValue,
                        email: data.email || false,
                        whatzap: data.whatzap || false,
                        regional: data.regional || "—",
                        city: cityName,
                        // Guardamos os campos conforme já convertidos:
                        emailB2B: emailB2BValue,
                        digisac: digisacValue,
                        // Para exibição na tabela B2B:
                        nomeB2B,
                        ...data,
                    });
                });

                const currentDocIds = new Set(snapshot.docs.map((doc) => doc.id));
                for (const [id, item] of dataMap.entries()) {
                    if (item.tipo === col && !currentDocIds.has(id)) {
                        dataMap.delete(id);
                    }
                }

                // Contadores
                const totalClientesAfetados = Array.from(dataMap.values())
                    .filter((item) => item.status === "Ativos")
                    .reduce((acc, item) => acc + (Number(item.clientesAfetados) || 0), 0);
                counts.ClientesAfetados = totalClientesAfetados;

                // Conte apenas documentos ativos com emailB2B !== false
                // Conte documentos ativos que tenham emailB2B OU digisac habilitado
                const totalClientesB2B = Array.from(dataMap.values()).filter(
                    (item) => item.status === "Ativos" && (item.emailB2B !== false || item.digisac !== false),
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
            },
        );
        unsubscribes.push(unsubscribe);
    });

    return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
};
