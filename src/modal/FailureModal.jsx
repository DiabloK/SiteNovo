import  { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Clipboard, Download } from "lucide-react";

const FailureModal = ({ isOpen, onClose }) => {
  const [failureData, setFailureData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFailureData();
    }
  }, [isOpen]);

  const fetchFailureData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "ativos")); // Busca apenas os documentos "Ativos"
      const data = querySnapshot.docs.map((doc) => doc.data());
      setFailureData(data);
    } catch (error) {
      console.error("Erro ao buscar falhas:", error);
    }
    setLoading(false);
  };

  const formatMessage = () => {
    if (failureData.length === 0) {
      return "Nenhuma falha registrada no momento.";
    }
    
    let message = "GESTÃO DE FALHAS GGNET\n\n";
    
    failureData.forEach(event => {
      message += `EVENTO ${event.id} ${event.location}\n`;
      message += `Duração: ${event.duration}\n`;
      message += `Última atualização: ${event.lastUpdate} por ${event.user}\n`;
      message += `Última info: ${event.lastInfo}\n`;
      message += "----------------------------\n";
    });
    
    return message;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatMessage());
    alert("Texto copiado!");
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([formatMessage()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "gestao_de_falhas.txt";
    document.body.appendChild(element);
    element.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Gestão de Falhas</h2>
        {loading ? (
          <p className="text-gray-700 dark:text-gray-300">Carregando dados...</p>
        ) : (
          <textarea
            className="w-full h-40 p-2 border border-gray-300 rounded resize-none dark:bg-gray-700 dark:text-white"
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
  );
};

export default FailureModal;
