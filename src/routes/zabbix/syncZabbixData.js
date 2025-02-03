import axios from 'axios';
import fs from 'fs';
import cron from 'node-cron';


// Configurações do Zabbix
const ZABBIX_URL = 'http://zabbix-bb.as53062.net.br/zabbix/api_jsonrpc.php';
const USER = 'vinicius.signorelli';
const PASSWORD = 'Vs2021GG';

// Função para autenticar e obter o token
async function getAuthToken() {
  try {
    const response = await axios.post(ZABBIX_URL, {
      jsonrpc: '2.0',
      method: 'user.login',
      params: {
        user: USER,
        password: PASSWORD,
      },
      id: 1,
      auth: null,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.data.result;
  } catch (error) {
    console.error('Erro na autenticação:', error.message);
  }
}

// Função para obter hosts com dados do inventário (assumindo que as coordenadas estão em "location_lat" e "location_lon")
async function getHosts(authToken) {
  try {
    const response = await axios.post(ZABBIX_URL, {
      jsonrpc: '2.0',
      method: 'host.get',
      params: {
        output: ['hostid', 'name'],
        selectInventory: ['location_lat', 'location_lon']
      },
      auth: authToken,
      id: 2,
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.data.result;
  } catch (error) {
    console.error('Erro ao obter hosts:', error.message);
  }
}

// Função principal que sincroniza os dados e salva em um arquivo JSON
async function syncZabbixData() {
  const authToken = await getAuthToken();
  if (!authToken) {
    console.error('Não foi possível autenticar.');
    return;
  }

  const hosts = await getHosts(authToken);
  if (!hosts) {
    console.error('Não foi possível obter os hosts.');
    return;
  }

  // Processa os dados para extrair somente hosts com coordenadas válidas
  const processedData = hosts
    .map(host => {
      const inventory = host.inventory || {};
      const lat = parseFloat(inventory.location_lat);
      const lon = parseFloat(inventory.location_lon);
      return {
        id: host.hostid,
        nome: host.name,
        lat: isNaN(lat) ? null : lat,
        lon: isNaN(lon) ? null : lon,
      };
    })
    .filter(item => item.lat !== null && item.lon !== null);

  // Salva os dados em um arquivo JSON
  fs.writeFileSync('dados_zabbix.json', JSON.stringify(processedData, null, 2));
  console.log('Dados do Zabbix sincronizados e salvos com sucesso.');
}

// Agendamento: executa a sincronização a cada 24 horas
// O seguinte cron job executa o script diariamente à 2h da manhã:
cron.schedule('0 2 * * *', () => {
  console.log('Iniciando a sincronização dos dados do Zabbix...');
  syncZabbixData();
});

// Para execução manual (caso queira testar sem esperar o cron)
syncZabbixData();
