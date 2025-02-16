import { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { db } from "@/utils/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Função recursiva para "achatar" objetos, igual à utilizada no back-end
function flattenObject(obj, prefix = "") {
  let result = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        // Converte o array inteiro em uma string JSON
        result[newKey] = JSON.stringify(value);
      } else {
        // Array de primitivos: junta em uma única string
        result[newKey] = value.join(", ");
      }
    } else if (value !== null && typeof value === "object") {
      const flatChild = flattenObject(value, newKey);
      result = { ...result, ...flatChild };
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

const KpisModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);

  // Função para gerar os arquivos e iniciar o download
  const generateAndDownload = async () => {
    setLoading(true);
    try {
      // Busca todos os documentos da coleção "protocolos"
      const protocolosSnapshot = await getDocs(collection(db, "protocolos"));
      if (protocolosSnapshot.empty) {
        toast.error("Não existem documentos na coleção 'protocolos'.");
        setLoading(false);
        return;
      }

      // Processa os dados: achata cada documento e coleta as chaves (colunas)
      const dadosAchatados = [];
      const colunasSet = new Set();
      protocolosSnapshot.forEach((doc) => {
        const docId = doc.id;
        let dados = doc.data();
        // Exclui a propriedade "id" (se existir)
        if (dados.hasOwnProperty("id")) {
          delete dados.id;
        }
        // Ajuste: se horarioFinal for nulo, usa horarioPrevisto
        if (dados.horarioFinal === null && dados.horarioPrevisto) {
          dados.horarioFinal = dados.horarioPrevisto;
        }
        const dadosFlat = flattenObject(dados);
        dadosFlat.__protocolo = docId;
        dadosAchatados.push(dadosFlat);
        Object.keys(dadosFlat).forEach((key) => {
          if (key !== "__protocolo") {
            colunasSet.add(key);
          }
        });
      });

      const colunas = Array.from(colunasSet).sort();

      // Cria o workbook e worksheet com ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("KPIs");
      worksheet.columns = [
        { header: "Protocolo", key: "protocolo", width: 20 },
        ...colunas.map((col) => ({ header: col, key: col, width: 25 })),
      ];

      dadosAchatados.forEach((dado) => {
        const row = { protocolo: dado.__protocolo };
        colunas.forEach((col) => {
          row[col] = dado[col] !== undefined ? dado[col] : "";
        });
        worksheet.addRow(row);
      });

      // Gera os arquivos em memória
      const xlsxBuffer = await workbook.xlsx.writeBuffer();

      // Tenta gerar CSV utilizando o método writeBuffer (caso disponível)
      let csvBuffer;
      if (worksheet.csv && worksheet.csv.writeBuffer) {
        csvBuffer = await worksheet.csv.writeBuffer();
      } else {
        // Se não estiver disponível, gera CSV manualmente:
        const rows = [];
        // Adiciona o header
        rows.push(["Protocolo", ...colunas].join(","));
        // Adiciona cada linha
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // pula o header, pois já foi adicionado
          const rowValues = row.values;
          // row.values[0] é undefined, então ignora
          rows.push(rowValues.slice(1).join(","));
        });
        csvBuffer = new TextEncoder().encode(rows.join("\n"));
      }

      // Cria um arquivo ZIP com JSZip contendo os dois arquivos
      const zip = new JSZip();
      zip.file("KPIs.xlsx", xlsxBuffer);
      zip.file("KPIs.csv", csvBuffer);
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Inicia o download do arquivo ZIP
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "KPIs.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download iniciado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar KPIs:", error);
      toast.error("Erro ao gerar KPIs.");
    }
    setLoading(false);
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
            KPIs
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Clique no botão abaixo para gerar e baixar os KPIs (XLSX e CSV) em um arquivo ZIP.
          </p>
          <button
            onClick={generateAndDownload}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "Gerando..." : "Gerar e Baixar KPIs"}
          </button>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
};

export default KpisModal;
