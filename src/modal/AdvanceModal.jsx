import React from "react";
import { doc, setDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

const AdvanceModal = ({ title, message, item, onSuccess, onCancel, isVisible }) => {
    if (!isVisible) return null;

    const handleAdvance = async () => {
        try {
            // Extração dos dados do item
            const { id, status, protocoloISP } = item;

            if (!id || !status) {
                console.error("ID ou status ausentes no item:", item);
                return;
            }

            // Determinar a próxima coleção e o novo status conforme a lógica:
            // Se o status atual for "Analise" o novo será "Pendente"; caso contrário, "Ativos".
            const nextCollection = status === "Analise" ? "Pendente" : "Ativos";
            const currentCollection = status === "Analise" ? "Analise" : "Pendente";

            // ================================
            // 1. Operação de mover o documento
            // ================================

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

            // =======================================================
            // 2. Atualização dos documentos fixos em "protocolos" e "manutencao"
            // =======================================================

            // Atualizar o documento na coleção "protocolos", se protocoloISP estiver definido
            if (protocoloISP) {
                const protocoloRef = doc(db, "protocolos", protocoloISP);
                const protocoloSnapshot = await getDoc(protocoloRef);
                if (protocoloSnapshot.exists()) {
                    await updateDoc(protocoloRef, { status: nextCollection });
                    console.log(`Documento em "protocolos" atualizado para status "${nextCollection}".`);
                } else {
                    console.warn(`Documento em "protocolos" com ID "${protocoloISP}" não encontrado.`);
                }
            } else {
                console.warn("protocoloISP não fornecido no item; não foi possível atualizar o documento em 'protocolos'.");
            }

            // Atualizar o documento na coleção "manutencao" usando o mesmo id do item
            const manutencaoRef = doc(db, "manutencao", id);
            const manutencaoSnapshot = await getDoc(manutencaoRef);
            if (manutencaoSnapshot.exists()) {
                await updateDoc(manutencaoRef, { status: nextCollection });
                console.log(`Documento em "manutencao" atualizado para status "${nextCollection}".`);
            } else {
                console.warn(`Documento em "manutencao" com ID "${id}" não encontrado.`);
            }

            // Callback de sucesso
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Erro ao avançar o documento:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-96 rounded-lg bg-white p-6 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleAdvance}
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                        Avançar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvanceModal;
