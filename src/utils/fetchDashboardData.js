import { getFirestore, collection, getDocs } from "firebase/firestore";

export const fetchDashboardData = async () => {
  const db = getFirestore();

  // Coleções a serem consultadas
  const collections = {
    Analise: "Analise",
    Reagendado: "Reagendado",
    Pendete: "Pendete",
    Ativos: "Ativos",
    ClientesAfetados: "ClientesAfetados",
  };

  const data = {}; // Para armazenar as contagens
  for (const [key, collectionName] of Object.entries(collections)) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      data[key] = querySnapshot.size || 0; // Contagem dos documentos na coleção
    } catch (error) {
      console.error(`Erro ao buscar coleção ${collectionName}:`, error);
      data[key] = 0; // Valor padrão em caso de erro
    }
  }

  return { data };
};
