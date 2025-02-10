import axios from "axios";

// Define a URL base com o IP e porta especificados
const API_BASE_URL = "http://172.29.3.210:9090";

// Cria uma instância do axios para facilitar as chamadas à API
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Chama o endpoint para obter dados do cliente.
 * @param {string} codcon - Código de conexão do cliente.
 * @param {string} tipo - Tipo de conexão ("GGNET" ou "ALT").
 * @returns {Promise<Object>} Dados retornados pela API.
 */
// Exemplo de getDadosCliente (no seu apiClient.js)
export async function getDadosCliente(codcon, tipo) {
  try {
    const response = await api.post("/dadosCliente", { codcon, tipo });
    console.log("Resposta bruta da API:", response.data);
    // Se a resposta tiver a estrutura esperada, transforme e retorne o array
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data.results)
    ) {
      return transformarClientes(response.data.data.results, tipo); // Passa tipo como origem
    }
    return [];
  } catch (error) {
    console.error("Erro em getDadosCliente:", error);
    throw error;
  }
}

export async function getPontosAcesso(nomePontoAcesso, tipo) {
  try {
    const response = await api.post("/pontosAcesso", { nomePontoAcesso, tipo });
    return response.data;
  } catch (error) {
    console.error("Erro em getPontosAcesso:", error);
    throw error;
  }
}

/**
 * Chama o endpoint para buscar pontos de acesso por código.
 * @param {string} codcon - Código de conexão.
 * @param {string} tipo - Tipo de conexão ("GGNET" ou "ALT").
 * @returns {Promise<Object>} Dados retornados pela API.
 */
export async function getPontosAcessoPorCodigo(codcon, tipo) {
  try {
    const response = await api.post("/pontosAcessoPorCodigo", { codcon, tipo });
    return response.data;
  } catch (error) {
    console.error("Erro em getPontosAcessoPorCodigo:", error);
    throw error;
  }
}

/**
 * Exemplo de função para enviar os dados coletados para o seu cadastro.
 * Essa função pode chamar um endpoint interno (do seu sistema) que realiza
 * o cadastro dos clientes ou atualiza o cadastro existente.
 *
 * @param {Object} dadosCliente - Objeto contendo os dados do cliente coletados.
 * @returns {Promise<Object>} Resposta do endpoint de cadastro.
 */
export async function enviarParaCadastro(dadosCliente) {
  try {
    // Se o seu cadastro estiver na mesma API, ajuste a URL base conforme necessário.
    // Caso seja outro serviço, substitua a URL abaixo pelo endpoint correto.
    const response = await axios.post("/api/cadastro", dadosCliente, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar dados para o cadastro:", error);
    throw error;
  }

}
/**
* @param {string} codcon - Código do ponto de acesso.
 * @param {string} origem - Origem (ex: "ALT" ou "GGNET").
 * @returns {Promise<Object>} Resposta da API contendo os clientes afetados.
 */
export async function getClientesAfetados(codcon, origem) {
  try {
    // Supondo que a API aceite um POST com os campos 'codcon' e 'origem'
    const response = await api.post("/dadosCliente", { codcon, origem });
    return response.data; // Certifique-se de que a resposta contenha os dados desejados
  } catch (error) {
    console.error(`Erro ao obter clientes para o ponto ${codcon}:`, error);
    throw error;
  }
}
function transformarClientes(results, origem) {
  return results
    .filter(cliente => cliente.descri_est !== "Cancelado")
    .map(cliente => ({
      Nome: cliente.nome_cli,
      Codigo: cliente.codcli,   // Observe que usamos "Codigo" (capitalizado)
      Celular: cliente.celular,
      DDDFone: `${cliente.ddd}${cliente.fone}`,
      Email: cliente.e_mail,
      CheckEmail: false,
      CheckTelefone: false,
      Origem: origem  // Adiciona o campo "Origem" ao objeto transformado
    }));
}
