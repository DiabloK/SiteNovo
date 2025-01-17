const admin = require("firebase-admin");
const axios = require("axios");
const fs = require("fs"); // Para manipular o sistema de arquivos
const cron = require("node-cron"); // Para agendamento

// Caminho do arquivo JSON
const filePath = "../public/pontosAcesso.json";

// Inicializa o Firebase Admin (caso precise usar)
const serviceAccount = require("../paymiua.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://paymiua.firebaseio.com",
});

const db = admin.firestore();

// Função para comparar dois objetos pelos campos relevantes
function isEqual(obj1, obj2) {
  // Liste os campos que você quer comparar
  const camposRelevantes = ["codcon", "nome_con", "nome_cid", "estado", "origem"];

  return camposRelevantes.every((campo) => obj1[campo] === obj2[campo]);
}

async function sincronizarPontosDeAcesso() {
  console.log("Iniciando sincronização dos pontos de acesso...");

  try {
    // 1. Carregar o arquivo JSON existente (se disponível)
    let pontosExistentes = [];
    if (fs.existsSync(filePath)) {
      console.log(`Carregando o arquivo JSON existente: ${filePath}`);
      const jsonData = fs.readFileSync(filePath, "utf-8");
      pontosExistentes = JSON.parse(jsonData); // Dados existentes no JSON
    } else {
      console.log("Arquivo JSON não encontrado. Um novo será criado.");
    }

    // 2. Buscar dados da API GGNET
    console.log("Buscando dados da API GGNET...");
    const ggnetResponse = await axios.post("http://187.85.152.205:5055/api/ggnet/pontos", {
      con_nome: "", // Busca todos os pontos de acesso (sem filtros)
    });
    const pontosGGNET = ggnetResponse.data?.data?.results || [];
    console.log(`Pontos da API GGNET recebidos: ${pontosGGNET.length}`);

    // 3. Buscar dados da API ALT
    console.log("Buscando dados da API ALT...");
    const altResponse = await axios.post("http://187.85.152.205:5055/api/alt/pontos", {
      con_nome: "", // Busca todos os pontos de acesso (sem filtros)
    });
    const pontosALT = altResponse.data?.data?.results || [];
    console.log(`Pontos da API ALT recebidos: ${pontosALT.length}`);

    // 4. Combinar todos os pontos em um único array e marcar a origem
    const novosPontos = [
      ...pontosGGNET.map((ponto) => ({ ...ponto, origem: "GGNET" })),
      ...pontosALT.map((ponto) => ({ ...ponto, origem: "ALT" })),
    ];

    console.log(`Total de novos pontos recebidos: ${novosPontos.length}`);

    // 5. Comparar os novos pontos com os existentes no JSON
    console.log("Comparando os novos pontos com o arquivo JSON existente...");
    const dadosAlterados = novosPontos.filter((novoPonto) => {
      const pontoExistente = pontosExistentes.find((p) => p.codcon === novoPonto.codcon);
      return !pontoExistente || !isEqual(pontoExistente, novoPonto);
    });

    console.log(`Total de pontos alterados ou novos: ${dadosAlterados.length}`);

    // 6. Se não houver alterações, não acionar o Firebase
    if (dadosAlterados.length === 0) {
      console.log("Nenhuma alteração detectada. O Firestore não será acionado.");
    } else {
      // Caso contrário, atualizar o Firebase e gerar um log claro
      console.log("Alterações detectadas! Atualizando o Firestore...");
      const batch = db.batch();

      novosPontos.forEach((novoPonto) => {
        // Atualizar o Firestore
      });

     
      console.log("Firestore atualizado com sucesso!");
    }

    // 7. Atualizar o arquivo JSON
    console.log("Atualizando o arquivo JSON...");
    fs.writeFileSync(filePath, JSON.stringify(novosPontos, null, 2)); // Sobrescreve o arquivo JSON
    console.log(`Arquivo JSON atualizado com sucesso: ${filePath}`);

    console.log("Sincronização concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a sincronização dos pontos de acesso:", error.message);
  }
}

// Agendar para executar às 01:30 da manhã todos os dias
cron.schedule("30 1 * * *", () => {
  console.log("Executando sincronização agendada às 01:30...");
  sincronizarPontosDeAcesso();
});

// Verificar se o arquivo está sendo executado diretamente
if (require.main === module) {
  sincronizarPontosDeAcesso();
}
