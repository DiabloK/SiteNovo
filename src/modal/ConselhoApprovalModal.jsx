import React from "react";
import { getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "@/utils/firebase";
import "react-toastify/dist/ReactToastify.css";

const ConselhoApprovalModal = ({
  title,
  message,
  docId,    // ID do documento na coleção "Requisição"
  onSuccess,
  onCancel,
  isVisible,
}) => {
  if (!isVisible) return null;

  // Handler para "Não": deleta o documento da coleção "Requisição"
  const handleNo = async () => {
    try {
      const reqRef = doc(db, "Requisição", docId);
      const reqSnap = await getDoc(reqRef);
      if (!reqSnap.exists()) {
        toast.error(`Documento ${docId} não encontrado na coleção Requisição.`);
        return;
      }
      await deleteDoc(reqRef);
      toast.error("Documento removido (Conselho: Não).");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(`Erro ao deletar documento: ${error.message}`);
    }
  };

  // Handler para "Sim": copia e atualiza o documento para as coleções "protocolos" e "Pendente", e deleta o original
  const handleYes = async () => {
    try {
      // 1. Lê o documento da coleção "Requisição"
      const reqRef = doc(db, "Requisição", docId);
      const reqSnap = await getDoc(reqRef);
      if (!reqSnap.exists()) {
        toast.error(`Documento ${docId} não encontrado na coleção Requisição.`);
        return;
      }
      const data = reqSnap.data();

      // 2. Atualiza os dados: define status "Pendente" e adiciona protocoloId
      const updatedData = {
        ...data,
        status: "Pendente",
        protocoloId: docId, // Guarda o ID do documento
      };

      // 3. Copia (ou cria) o documento atualizado na coleção "protocolos"
      const protocoloRef = doc(db, "protocolos", docId);
      await setDoc(protocoloRef, updatedData);

      // 4. Copia o mesmo documento para a coleção "Pendente"
      const pendenteRef = doc(db, "Pendente", docId);
      await setDoc(pendenteRef, updatedData);

      // 5. Deleta o documento original na coleção "Requisição"
      await deleteDoc(reqRef);

      toast.success("Documento aprovado em Conselho e movido para Pendente com sucesso!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(`Erro ao mover documento: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleNo}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500"
          >
            Não
          </button>
          <button
            onClick={handleYes}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500"
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConselhoApprovalModal;
