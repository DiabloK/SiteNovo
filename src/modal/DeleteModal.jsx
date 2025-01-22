import React from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore"; // Firebase
import { db } from "@/utils/firebase"; // Importe o Firestore configurado


const DeleteModal  = ({
    title,
    message,
    protocoloId, // ID usado para "protocolos"
    originalId, // ID usado para "manutencao"
    analiseId, // ID usado para "Analise"
    status, // Status do protocolo
    onSuccess,
    onCancel,
    isVisible
}) => {
    if (!isVisible) return null;

    const handleConfirm = async () => {
        // Tentar atualizar/excluir cada coleção individualmente
        try {
            // Atualizar e excluir na coleção "protocolos"
            if (protocoloId) {
                try {
                    const protocoloRef = doc(db, "protocolos", protocoloId);
                    await updateDoc(protocoloRef, { status: `${status} - Excluído` });
                    await deleteDoc(protocoloRef);
                    console.log(`Protocolo ${protocoloId} excluído na coleção "protocolos".`);
                } catch (error) {
                    console.warn(`Erro ao excluir na coleção "protocolos":`, error.message);
                }
            }

            // Atualizar e excluir na coleção "manutencao"
            if (originalId) {
                try {
                    const manutencaoRef = doc(db, "manutencao", originalId);
                    await updateDoc(manutencaoRef, { status: `${status} - Excluído` });
                    await deleteDoc(manutencaoRef);
                    console.log(`Protocolo ${originalId} excluído na coleção "manutencao".`);
                } catch (error) {
                    console.warn(`Erro ao excluir na coleção "manutencao":`, error.message);
                }
            }

            // Atualizar e excluir na coleção "Analise"
            if (analiseId) {
                try {
                    const analiseRef = doc(db, "Analise", analiseId);
                    await updateDoc(analiseRef, { status: `${status} - Excluído` });
                    await deleteDoc(analiseRef);
                    console.log(`Protocolo ${analiseId} excluído na coleção "Analise".`);
                } catch (error) {
                    console.warn(`Erro ao excluir na coleção "Analise":`, error.message);
                }
            }

            // Callback de sucesso
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Erro inesperado ao excluir o protocolo:", error);
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
                        onClick={handleConfirm} // Lógica de exclusão com tratamento individualizado
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal ;
