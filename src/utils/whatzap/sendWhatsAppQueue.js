// sendWhatsAppQueue.js
const Queue = require("bull");
const { sendWhatsAppMessage } = require("./sendWhatsAppAPI"); // Sua função que envia a mensagem

// Cria a fila; você pode usar o Redis (Bull usa o Redis como backend)
const sendWhatsAppQueue = new Queue("sendWhatsApp", {
  redis: { host: "127.0.0.1", port: 6379 },
});

// Processamento da fila: cada job conterá { item, message }
sendWhatsAppQueue.process(async (job) => {
  const { item, message } = job.data;
  try {
    const result = await sendWhatsAppMessage(item, message);
    console.log(`Mensagem enviada para ID ${item.Celular}:`, result);
    return result;
  } catch (error) {
    console.error("Erro ao processar job na fila:", error);
    throw error;
  }
});

module.exports = sendWhatsAppQueue;
