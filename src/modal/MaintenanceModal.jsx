import { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Clipboard, Download } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MaintenanceModal = ({ isOpen, onClose }) => {
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchMaintenanceData();
    }
  }, [isOpen]);

  const fetchMaintenanceData = async () => {
    setLoading(true);
    try {
      const pendentesSnapshot = await getDocs(collection(db, "Pendente"));
      const allMaintenance = [];

      pendentesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tipo === "Manutenção") {
          allMaintenance.push({
            protocolo: data.protocoloISP || "Sem protocolo",
            regional: data.regional || "Sem localização",
            duration: data.horarioInicial
              ? calculateDuration(data.horarioInicial, data.horarioPrevisto)
              : "Sem dados",
            lastUpdate: data.ultimaAtualizacao
              ? new Date(data.ultimaAtualizacao).toLocaleString()
              : "Sem atualização",
            user: data.usuario || "Desconhecido",
            lastInfo: data.ultimaInfo || "Nenhuma informação disponível",
            totalAfetados:
              data.total_afetados !== undefined
                ? data.total_afetados
                : "Não informado",
            pontosAcesso:
              data.pontoAcesso && Array.isArray(data.pontoAcesso)
                ? data.pontoAcesso
                    .map((ponto) => ponto.nome)
                    .filter((nome) => nome && nome.trim() !== "")
                    .join(", ")
                : "Nenhum ponto registrado",
            emailStatus: data.email ? "Sim" : "Não",
            whatzapStatus: data.whatzap ? "Sim" : "Não",
          });
        }
      });

      setMaintenanceData(allMaintenance);
    } catch (error) {
      console.error("Erro ao buscar manutenções:", error);
      toast.error("Erro ao buscar manutenções.");
    }
    setLoading(false);
  };

  const formatMessage = () => {
    if (maintenanceData.length === 0) {
      return "MANUTENÇÕES PROGRAMADAS GGNET\n\nNenhuma manutenção pendente registrada no momento.";
    }

    let message = "MANUTENÇÕES PROGRAMADAS GGNET\n\n";

    maintenanceData.forEach((event) => {
      message += `EVENTO ${event.protocolo} - ${event.regional}\n`;
      message += `Duração: ${event.duration}\n`;
      message += `Última atualização: ${event.lastUpdate} por ${event.user}\n`;
      message += `Última info: ${event.lastInfo}\n`;
      message += `Total de Clientes Afetados: ${event.totalAfetados}\n`;
      message += `Pontos de Acesso: ${event.pontosAcesso}\n`;
      message += `Contatos: WhatsApp: ${event.whatzapStatus}\n`;
      message += `E-mail: ${event.emailStatus}\n`;
    });

    return message;
  };

  const calculateDuration = (start, end) => {
    const inicio = new Date(start);
    const fim = end ? new Date(end) : new Date();
    const diffMs = fim - inicio;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}min`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatMessage());
    toast.success("Texto copiado para a área de transferência!");
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([formatMessage()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "manutencoes_pendentes.txt";
    document.body.appendChild(element);
    element.click();
    toast.success("Arquivo baixado com sucesso!");
  };

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Manutenções Pendentes
          </h2>
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">
              Carregando dados...
            </p>
          ) : (
            <textarea
              className="w-full h-40 p-2 border border-gray-300 rounded resize-none dark:bg-gray-700 dark:text-white focus:outline-none shadow-inner"
              value={formatMessage()}
              readOnly
            />
          )}
          <div className="flex justify-between mt-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={copyToClipboard}
            >
              <Clipboard size={16} /> Copiar
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={downloadTxt}
            >
              <Download size={16} /> Baixar TXT
            </button>
          </div>
          <button
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
};

export default MaintenanceModal;
