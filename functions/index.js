const admin = require("firebase-admin");
const axios = require("axios");

// Inicializa o Firebase Admin com o arquivo de chave de serviço
const serviceAccount = require("../paymiua.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://paymiua.firebaseio.com", // Substitua pelo URL do seu projeto
});

const db = admin.firestore();
const fs = require("fs"); // Para manipular o sistema de arquivos

async function sincronizarPontosDeAcesso() {
  console.log("Iniciando sincronização dos pontos de acesso...");

  try {
    // 1. Buscar dados da API GGNET
    console.log("Buscando dados da API GGNET...");
    const ggnetResponse = await axios.post("http://187.85.152.205:5055/api/ggnet/pontos", {
      con_nome: "", // Busca todos os pontos de acesso (sem filtros)
    });
    console.log("Resposta da API GGNET:", ggnetResponse.data);

    const pontosGGNET = ggnetResponse.data?.data?.results || []; // Acessar o campo correto

    // 2. Buscar dados da API ALT
    console.log("Buscando dados da API ALT...");
    const altResponse = await axios.post("http://187.85.152.205:5055/api/alt/pontos", {
      con_nome: "", // Busca todos os pontos de acesso (sem filtros)
    });
    console.log("Resposta da API ALT:", altResponse.data);

    const pontosALT = altResponse.data?.data?.results || []; // Acessar o campo correto

    // 3. Combinar todos os pontos em um único array e marcar a origem
    const todosPontos = [
      ...pontosGGNET.map((ponto) => ({ ...ponto, origem: "GGNET" })),
      ...pontosALT.map((ponto) => ({ ...ponto, origem: "ALT" })),
    ];
    const snapshot = await db.collection("pontosAcesso").get();
    const pontos = snapshot.docs.map((doc) => doc.data());

    // 2. Gerar o arquivo JSON
    const filePath = "../pontosAcesso.json"; // Caminho do arquivo
    fs.writeFileSync(filePath, JSON.stringify(pontos, null, 2)); // Salvar como JSON formatado

    console.log(`Arquivo JSON gerado com sucesso: ${filePath}`);
    console.log(`Total de pontos de acesso a serem sincronizados: ${todosPontos.length}`);

    
    console.log("Sincronização concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a sincronização dos pontos de acesso:", error.message);
  }
}

// Verificar se o arquivo está sendo executado diretamente
if (require.main === module) {
  sincronizarPontosDeAcesso();
}
