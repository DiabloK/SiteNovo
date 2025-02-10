import { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Clipboard, Download } from "lucide-react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReportModal = ({ isOpen, onClose }) => {
  const [reportData, setReportData] = useState({ eventos: [], manutencoes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchReportData();
    }
  }, [isOpen]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const collections = ["Pendente", "Ativos"];
      let eventosData = [];
      let manutencoesData = [];

      await Promise.all(
        collections.map(async (col) => {
          const querySnapshot = await getDocs(collection(db, col));
          querySnapshot.forEach((doc) => {
            const data = doc.data();

            let duration = "Sem dados";
            if (data.horarioInicial) {
              const inicio = new Date(data.horarioInicial);
              const fim = data.horarioPrevisto ? new Date(data.horarioPrevisto) : null;

              if (fim) {
                const diffMs = fim - inicio;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                duration = `${diffHours}h ${diffMinutes}min`;
              } else {
                duration = `${inicio.toLocaleString()} - Sem previsão`;
              }
            }

            let lastUpdate = data.ultimaAtualizacao ? new Date(data.ultimaAtualizacao).toLocaleString() : "Sem atualização";
            let user = data.usuario || "Desconhecido";
            let lastInfo = data.ultimaInfo || "Nenhuma informação disponível";
            let totalAfetados = data.total_afetados !== undefined ? data.total_afetados : "Não informado";

            let pontosAcesso = (data.pontoAcesso && Array.isArray(data.pontoAcesso))
              ? data.pontoAcesso
                  .map((ponto) => ponto.nome)
                  .filter((nome) => nome && nome.trim() !== "")
                  .join(", ")
              : "Nenhum ponto registrado";

            let emailStatus = data.email ? "Sim" : "Não";
            let whatzapStatus = data.whatzap ? "Sim" : "Não";

            let eventoTipo = data.tipo || "Desconhecido";

            const eventoFormatado = {
              protocolo: data.protocoloISP || "Sem protocolo",
              tipo: col,
              location: data.regional || "Sem localização",
              duration,
              lastUpdate,
              user,
              lastInfo,
              totalAfetados,
              pontosAcesso,
              emailStatus,
              whatzapStatus,
              eventoTipo,
            };

            if (eventoTipo === "Manutenção") {
              manutencoesData.push(eventoFormatado);
            } else {
              eventosData.push(eventoFormatado);
            }
          });
        })
      );

      setReportData({ eventos: eventosData, manutencoes: manutencoesData });
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
    }
    setLoading(false);
  };

  const formatMessage = () => {
    let message = "";

    if (reportData.eventos.length === 0 && reportData.manutencoes.length === 0) {
      return "Nenhum evento ou manutenção registrada no momento.";
    }

    if (reportData.eventos.length > 0) {
      message += "GESTÃO DE FALHAS REDE DE ACESSO\n\n";
      reportData.eventos.forEach((event) => {
        message += `EVENTO ${event.protocolo} - ${event.location}\n`;
        message += `Duração: ${event.duration}\n`;
        message += `Última atualização: ${event.lastUpdate} por ${event.user}\n`;
        message += `Última info: ${event.lastInfo}\n`;
        message += `Total de Clientes Afetados: ${event.totalAfetados}\n`;
        message += `Pontos de Acesso: ${event.pontosAcesso}\n`;
        message += `Contatos: WhatsApp: ${event.whatzapStatus}\n`;
        message += `E-mail: ${event.emailStatus}\n`;
      });
    } else {
      message += "GESTÃO DE FALHAS REDE DE ACESSO\n\nNenhum evento registrado no momento.\n";
    }

    if (reportData.manutencoes.length > 0) {
      message += "\nMANUTENÇÕES PROGRAMADAS\n\n";
      reportData.manutencoes.forEach((event) => {
        message += `EVENTO ${event.protocolo} - ${event.location}\n`;
        message += `Duração: ${event.duration}\n`;
        message += `Última atualização: ${event.lastUpdate} por ${event.user}\n`;
        message += `Última info: ${event.lastInfo}\n`;
        message += `Total de Clientes Afetados: ${event.totalAfetados}\n`;
        message += `Pontos de Acesso: ${event.pontosAcesso}\n`;
        message += `Contatos: WhatsApp: ${event.whatzapStatus}\n`;
        message += `E-mail: ${event.emailStatus}\n`;
      });
    } else {
      message += "\nMANUTENÇÕES PROGRAMADAS\n\nNenhuma manutenção programada registrada no momento.\n";
    }

    return message;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatMessage());
    toast.success("Texto copiado para a área de transferência!");
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([formatMessage()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "relatorio.txt";
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
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relatório Geral</h2>
          {loading ? (
            <p className="text-gray-700 dark:text-gray-300">Carregando dados...</p>
          ) : (
            <textarea
              className="w-full h-40 p-2 border border-gray-300 rounded resize-none dark:bg-gray-700 dark:text-white focus:outline-none shadow-inner"
              value={formatMessage()}
              readOnly
            />
          )}
          <div className="flex justify-between mt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={copyToClipboard}>
              <Clipboard size={16} /> Copiar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={downloadTxt}>
              <Download size={16} /> Baixar TXT
            </button>
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </>
  );
};

export default ReportModal;
