import React from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore"; // Firebase
import { db } from "@/utils/firebase"; // Importe o Firestore configurado
import { toast } from "react-toastify";
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
            // Atualizar e excluir na coleção "protocolos"
            if (protocoloId) {
                try {
                    const protocoloRef = doc(db, "protocolos", protocoloId);
                    await updateDoc(protocoloRef, { status: `${status} - Excluído` });
                    await deleteDoc(protocoloRef);
                    toast.success(`Protocolo ${protocoloId} excluído na coleção "protocolos".`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } catch (error) {
                    toast.error(`Erro ao excluir na coleção "protocolos": ${error.message}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            }

            // Atualizar e excluir na coleção "manutencao"
            if (originalId) {
                try {
                    const manutencaoRef = doc(db, "manutencao", originalId);
                    await updateDoc(manutencaoRef, { status: `${status} - Excluído` });
                    await deleteDoc(manutencaoRef);
                    toast.success(`Protocolo ${originalId} excluído na coleção "manutencao".`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } catch (error) {
                    toast.error(`Erro ao excluir na coleção "manutencao": ${error.message}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            }

            // Atualizar e excluir na coleção "Analise"
            if (analiseId) {
                try {
                    const analiseRef = doc(db, "Analise", analiseId);
                    await updateDoc(analiseRef, { status: `${status} - Excluído` });
                    await deleteDoc(analiseRef);
                    toast.success(`Protocolo ${analiseId} excluído na coleção "Analise".`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } catch (error) {
                    toast.error(`Erro ao excluir na coleção "Analise": ${error.message}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        pauseOnHover: true,
                        draggable: true,
                    });
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
