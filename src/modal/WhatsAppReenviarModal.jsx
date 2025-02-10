import { useState } from "react";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase"; 

const WhatsAppReenviarModal = ({ isVisible, contact, onClose }) => {
    if (!isVisible || !contact) return null; // ✅ Evita erro se `contact` for `null`
    const [loading, setLoading] = useState(false);
    const [telefone, setTelefone] = useState(contact.Celular || ""); 

    const handleResend = async () => {
        const numeroFormatado = telefone.replace(/\D/g, ""); 

        if (numeroFormatado.length < 10) {
            alert("Por favor, insira um número de telefone válido.");
            return;
        }

        setLoading(true);
        const response = await fetch("http://172.29.3.210:7070/enviar-mensagem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clientes: [{ nome: contact.Nome, celular: numeroFormatado }],
                dadosManutencao: {
                    id: contact.id, 
                    status: "ErroContato",
                },
                template: "Olá $nome, estamos reenviando sua mensagem sobre a manutenção.",
            }),
        });

        if (response.ok) {
            // Atualiza o campo "Whatszap" para true no Firebase
            const docRef = doc(db, "ErrorContatos", contact.Nome);
            await updateDoc(docRef, { Whatszap: true });

            // Verifica se deve remover o contato do Firestore
            const updatedDoc = await getDoc(docRef);
            if (updatedDoc.exists()) {
                const data = updatedDoc.data();
                if (data.email === true || !data.email) {
                    await deleteDoc(docRef);
                }
            }
        }

        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-96 rounded-lg bg-white p-6 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Reenviar WhatsApp
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                    Deseja reenviar a mensagem para <strong>{contact.Nome}</strong>?
                </p>

                <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300">
                        Número de WhatsApp:
                    </label>
                    <input
                        type="text"
                        value={contact.Celular || ""}
                        className="mt-2 w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        disabled
                    />
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
                    >
                        Reenviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppReenviarModal;
