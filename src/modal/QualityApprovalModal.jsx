import React from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "@/utils/firebase";
import "react-toastify/dist/ReactToastify.css";

const QualityApprovalModal = ({
  title,
  message,
  docId,      // O ID real do documento na coleção "Requisição"
  onSuccess,
  onCancel,
  isVisible,
}) => {
  if (!isVisible) return null;

  // Se o usuário clicar em "Não", atualiza o campo "conselho" para "Pendente"
  const handleNo = async () => {
    try {
      const docRef = doc(db, "Requisição", docId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        toast.error(`Documento ${docId} não encontrado para atualização.`);
        return;
      }
      await updateDoc(docRef, { conselho: "Pendente" });
      toast.error("Rejeitado em Qualidade – encaminhado para Conselho!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(`Erro ao atualizar documento: ${error.message}`);
    }
  };

  // Se o usuário clicar em "Sim", atualiza o campo "qualidade" para "Aprova"
  const handleYes = async () => {
    try {
      const docRef = doc(db, "Requisição", docId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        toast.error(`Documento ${docId} não encontrado para atualização.`);
        return;
      }
      await updateDoc(docRef, { qualidade: "Aprova" });
      toast.success("Aprovação de Qualidade realizada com sucesso!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(`Erro ao atualizar documento: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
        <div className="mt-6 flex justify-end space-x-4">
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

export default QualityApprovalModal;
