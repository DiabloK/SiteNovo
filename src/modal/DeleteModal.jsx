import React from "react";
import {
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "@/utils/firebase";
import "react-toastify/dist/ReactToastify.css";

const DeleteModal = ({
  title,
  message,
  protocoloId,
  originalId,
  analiseId,
  status,
  onSuccess,
  onCancel,
  isVisible,
}) => {
  if (!isVisible) return null;

  const handleConfirm = async () => {
    try {
      // -----------------------------------------------------
      // 1. Exclusão na coleção "protocolos" e documento dinâmico
      // -----------------------------------------------------
      if (protocoloId) {
        try {
          // Obter o documento na coleção "protocolos"
          const protocoloRef = doc(db, "protocolos", protocoloId);
          const protocoloSnap = await getDoc(protocoloRef);

          if (!protocoloSnap.exists()) {
            toast.error(`Documento protocolos ${protocoloId} não encontrado.`);
          } else {
            const protocoloData = protocoloSnap.data();
            // Usando os campos do nível raiz
            const dynamicStatus = protocoloData.status; // ex.: "manutencao", "Ativos", "Pendente", "Analise", etc.
            const dynamicId = protocoloData.id; // ID do documento dinâmico

            if (!dynamicStatus || !dynamicId) {
              toast.error("Status ou ID dinâmico não encontrados no documento protocolos.");
            } else {
              // Verifica se o documento dinâmico existe na coleção definida por dynamicStatus
              const dynamicDocRef = doc(db, dynamicStatus, dynamicId);
              const dynamicSnap = await getDoc(dynamicDocRef);

              if (dynamicSnap.exists()) {
                await updateDoc(dynamicDocRef, { status: `${dynamicStatus} - Excluído` });
                await deleteDoc(dynamicDocRef);
              } else {
                toast.warn(`Documento dinâmico ${dynamicId} na coleção "${dynamicStatus}" não encontrado.`);
              }
            }
          }

          // Atualiza e exclui o documento na coleção "protocolos"
          await updateDoc(protocoloRef, { status: `${status} - Excluído` });
          await deleteDoc(protocoloRef);
        } catch (error) {
          console.log("Erro na exclusão de protocolos:", error);
        }
      }

      // -----------------------------------------------------
      // 2. Exclusão na coleção "manutencao"
      // -----------------------------------------------------
      if (originalId) {
        try {
          const manutencaoRef = doc(db, "manutencao", originalId);
          const manutencaoSnap = await getDoc(manutencaoRef);
          if (manutencaoSnap.exists()) {
            await updateDoc(manutencaoRef, { status: `${status} - Excluído` });
            await deleteDoc(manutencaoRef);
          } else {
            toast.warn(`Documento manutencao ${originalId} não encontrado.`);
          }
        } catch (error) {
          console.log("Erro na exclusão de manutencao:", error);
        }
      }

      // -----------------------------------------------------
      // 3. Exclusão dinâmica (Coleção definida pelo status)
      // -----------------------------------------------------
      if (analiseId) {
        try {
          // Usa o valor da prop "status" para definir a coleção dinamicamente
          const dynamicAnaliseRef = doc(db, status, analiseId);
          const dynamicAnaliseSnap = await getDoc(dynamicAnaliseRef);
          if (dynamicAnaliseSnap.exists()) {
            await updateDoc(dynamicAnaliseRef, { status: `${status} - Excluído` });
            await deleteDoc(dynamicAnaliseRef);
          } else {
            toast.warn(`Documento ${analiseId} não encontrado na coleção "${status}".`);
          }
        } catch (error) {
          console.log("Erro na exclusão dinâmica:", error);
        }
      }

      // Callback de sucesso
      if (onSuccess) {
        toast.success("Exclusão concluída com sucesso!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          pauseOnHover: true,
          draggable: true,
        });
        onSuccess();
      }
    } catch (error) {
      toast.error(`Erro inesperado ao excluir o protocolo: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
