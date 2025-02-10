// whatsappSender.js
export async function sendWhatsAppMessage(item, message) {
    // Função para formatar o número removendo caracteres não numéricos
    const formatarNumero = (telefone) => {
      return telefone.replace(/\D/g, '');
    };
  
    const numeroFormatado = formatarNumero(item.Celular || "");
  
    // Controla o rate limit: 10 segundos + atraso aleatório entre 1 e 5 segundos
    const atrasoFixo = 10; // 10 segundos fixos
    const atrasoAleatorio = Math.floor(Math.random() * 5) + 1; // 1 a 5 segundos aleatórios
    const delaySeconds = atrasoFixo + atrasoAleatorio;
    console.log(`Aguardando ${delaySeconds} segundos para enviar a mensagem...`);
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  
    // Monta a URL com os parâmetros necessários
    const url = `http://172.29.3.210:5050/message/text?key=BotGG&id=${numeroFormatado}&message=${encodeURIComponent(message)}`;
  
    try {
      const response = await fetch(url);
      const dados = await response.json();
      return dados;
    } catch (error) {
      console.error("Erro no envio do WhatsApp:", error);
      throw error;
    }
  }
  