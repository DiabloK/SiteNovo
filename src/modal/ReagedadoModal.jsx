import React, { useState } from "react";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

const MaintenanceModal = ({ isVisible, onCancel, item, onSuccess }) => {
    const [dataType, setDataType] = useState("");
    const [horarioInicial, setHorarioInicial] = useState("");
    const [horarioPrevisto, setHorarioPrevisto] = useState("");

    if (!isVisible) return null;

    const handleValidation = () => {
        if (!horarioInicial || !horarioPrevisto) {
            alert("Preencha os horários!");
            return false;
        }

        if (new Date(horarioPrevisto) <= new Date(horarioInicial)) {
            alert("O horário previsto deve ser maior que o horário inicial!");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!handleValidation()) return;

        try {
            const { id, status, isDivided } = item;

            if (!id || !status) {
                console.error("ID ou status ausentes no item:", item);
                return;
            }

            // Tratamento para manutenção dividida
            let updatedData = {};
            if (isDivided) {
                updatedData = {
                    horarioInicial: horarioInicial || null,
                    horarioPrevisto: horarioPrevisto || null,
                    horarioFim: null, // Para próximas divisões
                };
            } else {
                updatedData = {
                    horarioInicial,
                    horarioPrevisto,
                };
            }

            // Atualizar os dados no banco
            const sourceRef = doc(db, "Reagendado", id);
            const docSnapshot = await getDoc(sourceRef);

            if (!docSnapshot.exists()) {
                console.warn(`Documento com ID "${id}" não encontrado na coleção "Reagendado".`);
                return;
            }

            const itemData = docSnapshot.data();

            // Atualizar status e mover para "Analise"
            const targetRef = doc(db, "Analise", id);
            await setDoc(targetRef, { ...itemData, ...updatedData, status: "Analise" });
            console.log("Documento movido para a coleção 'Analise'.");

            // Remover da coleção anterior
            await deleteDoc(sourceRef);
            console.log("Documento removido da coleção 'Reagendado'.");

            // Callback de sucesso
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Erro ao salvar o documento:", error);
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
