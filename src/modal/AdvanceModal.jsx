import React from "react";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

const AdvanceModal = ({ title, message, item, onSuccess, onCancel, isVisible }) => {
    if (!isVisible) return null;

    const handleAdvance = async () => {
        try {
            const { id, status } = item;

            if (!id || !status) {
                console.error("ID ou status ausentes no item:", item);
                return;
            }

            // Determinar a próxima coleção com base no status atual
            const nextCollection = status === "Analise" ? "Pendente" : "Ativos";
            const currentCollection = status === "Analise" ? "Analise" : "Pendente";

            // Referência ao documento na coleção atual
            const sourceRef = doc(db, currentCollection, id);

            // Verificar se o documento existe
            const docSnapshot = await getDoc(sourceRef);
            if (!docSnapshot.exists()) {
                console.warn(`Documento com ID "${id}" não encontrado na coleção "${currentCollection}".`);
                return;
            }

            const itemData = docSnapshot.data();

            // Referência ao documento na próxima coleção
            const targetRef = doc(db, nextCollection, id);

            // Adicionar o documento na nova coleção com o novo status
            await setDoc(targetRef, { ...itemData, status: nextCollection });
            console.log(`Documento movido para a coleção "${nextCollection}" com status "${nextCollection}".`);

            // Excluir o documento da coleção atual
            await deleteDoc(sourceRef);
            console.log(`Documento removido da coleção "${currentCollection}".`);

            // Callback de sucesso
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Erro ao avançar o documento:", error);
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
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAdvance}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Avançar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvanceModal;
