import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

// Função para simular a verificação de roles do usuário
const userHasRole = (roles) => {
  // Simulação do usuário atual (em produção, substitua por dados reais)
  const userRoles = ["admin", "editor", "eng"];
  return roles.some((role) => userRoles.includes(role));
};

// Componente que renderiza o botão de ação somente se as condições forem atendidas
const BotaoAcao = ({ label, onClick, roles, show }) => {
  if (!show || !userHasRole(roles)) return null;

  return (
    <button
      onClick={onClick}
      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500"
    >
      {label}
    </button>
  );
};

const VisualizacaoPage = () => {
  const { protocolo } = useParams(); // Captura o parâmetro da URL
  const [protocoloData, setProtocoloData] = useState(null); // Dados do protocolo
  const [loading, setLoading] = useState(true); // Indica se está carregando
  const [error, setError] = useState(false); // Indica se houve erro

  // Função para simular a ação de um botão (ex: Reagendar, Reabrir, etc.)
  const handleAction = (action) => {
    // Aqui você pode implementar a lógica real de cada ação
    // Por enquanto, vamos apenas exibir no console
    console.log(`Ação "${action}" acionada para o protocolo ${protocolo}.`);
  };

  // Função para simular alteração de status
  const alterarStatus = (status) => {
    // Aqui você pode implementar a lógica real para alteração de status
    console.log(`Status alterado para "${status}" no protocolo ${protocolo}.`);
  };

  useEffect(() => {
    if (!protocolo) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchProtocolo = async () => {
      try {
        const docRef = doc(db, "protocolos", protocolo);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProtocoloData(docSnap.data());
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProtocolo();
  }, [protocolo]);

  // Tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-inherit text-slate-100">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-blue-500 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dados do protocolo...</p>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-center text-red-500 dark:text-red-400">
          Protocolo não encontrado ou ocorreu um erro ao buscar os dados.
        </p>
      </div>
    );
  }

  // Tela de exibição dos dados
// Tela de exibição dos dados com visual melhorado
return (
    <div className="min-h-screen w-full bg-inherit text-slate-100">
      <div className="mx-auto max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Detalhes do Protocolo
        </h1>
  
        {/* Grid para informações básicas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card para Status */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {protocoloData?.status || "Não disponível"}
            </p>
          </div>
  
          {/* Card para Data Início */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Data Início</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {protocoloData?.horarioInicial || "Não disponível"}
            </p>
          </div>
  
          {/* Card para Data Finalização */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Data Finalização</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {protocoloData?.horarioFinal || "Não disponível"}
            </p>
          </div>
  
          {/* Card para Tipo */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Tipo</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {protocoloData?.tipo || "Não disponível"}
            </p>
          </div>
  
          {/* Card para Regional */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Regional</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {protocoloData?.regional || "Não disponível"}
            </p>
          </div>
  
          {/* Card para Total Afetados */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Afetados</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {protocoloData?.total_afetados !== undefined && protocoloData.total_afetados !== null
                ? protocoloData.total_afetados
                : "Não disponível"}
            </p>
          </div>
        </div>
  
        {/* Card para Pontos de Acesso */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300">Pontos de Acesso</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {Array.isArray(protocoloData?.pontoAcesso) && protocoloData.pontoAcesso.length > 0
              ? protocoloData.pontoAcesso.map((item) => item.nome).join(", ")
              : typeof protocoloData?.pontoAcesso === "string" &&
                protocoloData.pontoAcesso.trim()
              ? protocoloData.pontoAcesso
              : "Nenhum ponto disponível"}
          </p>
        </div>
  
        {/* Card para Manutenção Dividida */}
        {protocoloData?.Dividida && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Manutenção Dividida</p>
            {Object.entries(protocoloData.Dividida).map(([parte, valores]) => (
              <div key={parte} className="mt-4 border-t pt-2">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Parte {parte.split("-")[0]}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Início: {valores["Inicio Horario"] || "Vazio"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Previsto: {valores["Previsto Horario"] || "Vazio"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Fim: {valores["Fim Horario"] || "Vazio"}
                </p>
              </div>
            ))}
          </div>
        )}
  
        {/* Card para Cidades Selecionadas */}
        {protocoloData?.cidadesSelecionadas?.length > 0 && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Cidades Selecionadas</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {protocoloData.cidadesSelecionadas
                .map((cidade) => cidade.nome)
                .join(", ")}
            </p>
          </div>
        )}
  
        {/* Card para Observação */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300">Observação</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {protocoloData?.observacao || "Nenhuma observação registrada"}
          </p>
        </div>
  
        {/* Botões de Ação */}
        <div className="mt-8 flex flex-wrap gap-4">
          <BotaoAcao
            label="Reagendar"
            onClick={() => handleAction("Reagendar")}
            roles={["admin", "editor", "eng"]}
            show={protocoloData?.status?.trim().toLowerCase() === "reagendado"}
          />
  
          <BotaoAcao
            label="Reabrir"
            onClick={() => handleAction("Reabrir")}
            roles={["admin", "editor", "eng"]}
            show={protocoloData?.status?.trim().toLowerCase() === "concluida"}
          />
  
          <BotaoAcao
            label="Editar Ajustes"
            onClick={() => handleAction("Editar Ajustes")}
            roles={["admin", "editor", "eng"]}
            show={true}
          />
  
          <BotaoAcao
            label="Finalizar"
            onClick={() => handleAction("Finalizar")}
            roles={["admin", "editor", "eng"]}
            show={protocoloData?.status?.trim().toLowerCase() !== "concluida"}
          />
  
          <BotaoAcao
            label="Aprovar"
            onClick={() => alterarStatus("Aprovado")}
            roles={["admin", "editor"]}
            show={protocoloData?.status?.trim().toLowerCase() === "analise"}
          />
  
          <BotaoAcao
            label="Em Andamento"
            onClick={() => alterarStatus("Em Andamento")}
            roles={["admin", "editor"]}
            show={protocoloData?.status?.trim().toLowerCase() === "pendente"}
          />
        </div>
      </div>
    </div>
  );
  
};

export default VisualizacaoPage;
