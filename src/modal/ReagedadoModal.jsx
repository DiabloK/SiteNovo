import React, { useState } from "react";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MaintenanceModal = ({ isVisible, onCancel, item, onSuccess }) => {
    const [dataType, setDataType] = useState("");
    const [horarioInicial, setHorarioInicial] = useState("");
    const [horarioPrevisto, setHorarioPrevisto] = useState("");

    if (!isVisible) return null;

    const handleValidation = () => {
        if (!horarioInicial || !horarioPrevisto) {
            toast.error("Preencha os horários!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        if (new Date(horarioPrevisto) <= new Date(horarioInicial)) {
            toast.error("O horário previsto deve ser maior que o horário inicial!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!handleValidation()) return;

        try {
            const { id, status, isDivided } = item;

            if (!id || !status) {
                toast.error("ID ou status ausentes no item.", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    pauseOnHover: true,
                    draggable: true,
                });
                return;
            }

            let updatedData = {};
            if (isDivided) {
                updatedData = {
                    horarioInicial: horarioInicial || null,
                    horarioPrevisto: horarioPrevisto || null,
                    horarioFim: null,
                };
            } else {
                updatedData = {
                    horarioInicial,
                    horarioPrevisto,
                };
            }

            const sourceRef = doc(db, "Reagendado", id);
            const docSnapshot = await getDoc(sourceRef);

            if (!docSnapshot.exists()) {
                toast.warning(`Documento com ID "${id}" não encontrado na coleção "Reagendado".`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    pauseOnHover: true,
                    draggable: true,
                });
                return;
            }

            const itemData = docSnapshot.data();
            const targetRef = doc(db, "Analise", id);
            await setDoc(targetRef, { ...itemData, ...updatedData, status: "Analise" });

            toast.success("Documento movido para a coleção 'Analise'.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                pauseOnHover: true,
                draggable: true,
            });

            await deleteDoc(sourceRef);

            toast.success("Documento removido da coleção 'Reagendado'.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                pauseOnHover: true,
                draggable: true,
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Erro ao salvar o documento: " + error.message, {
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Agendar Manutenção
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Horário Inicial
                        </label>
                        <input
                            type="datetime-local"
                            value={horarioInicial}
                            onChange={(e) => setHorarioInicial(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Horário Previsto
                        </label>
                        <input
                            type="datetime-local"
                            value={horarioPrevisto}
                            onChange={(e) => setHorarioPrevisto(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceModal;
