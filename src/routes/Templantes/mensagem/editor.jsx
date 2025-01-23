import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QuillEditor = ({ content, setContent }) => {
    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    useEffect(() => {
        if (!quillInstance.current) {
            quillInstance.current = new Quill(editorRef.current, {
                theme: "snow",
                placeholder: "Escreva aqui...",
                modules: {
                    toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "image"],
                    ],
                },
            });

            quillInstance.current.on("text-change", () => {
                const updatedContent = quillInstance.current.root.innerHTML;
                setContent(updatedContent);
            });
        }
    }, [setContent]);

    useEffect(() => {
        if (quillInstance.current && quillInstance.current.root.innerHTML !== content) {
            quillInstance.current.root.innerHTML = content;
        }
    }, [content]);

    return (
        <div
            ref={editorRef}
            className="h-48 border border-gray-500 bg-transparent text-gray-800 dark:text-gray-200 rounded"
        />
    );
};

const MessageEditor = () => {
    const [formData, setFormData] = useState({
        selectedMessage: "",
        content: "",
    });
    const [messageOptions, setMessageOptions] = useState([]); // Armazena os títulos das mensagens

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "messages"));
                const messages = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name || doc.id, // Usa o campo 'name' ou o ID do documento como fallback
                    content: doc.data().content || "",
                }));
                setMessageOptions(messages); // Salva todos os dados necessários
            } catch (error) {
                console.error("Erro ao buscar mensagens:", error);
                toast.error("Erro ao buscar mensagens. Tente novamente!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        };

        fetchMessages();
    }, []);

    const handleSelectChange = async (e) => {
        const selectedMessageId = e.target.value;

        setFormData((prevState) => ({
            ...prevState,
            selectedMessage: selectedMessageId,
        }));

        if (selectedMessageId) {
            try {
                const docRef = doc(db, "messages", selectedMessageId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData((prevState) => ({
                        ...prevState,
                        content: data.content || "",
                    }));
                } else {
                    toast.error("Mensagem não encontrada no banco de dados!", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar a mensagem:", error);
                toast.error("Erro ao carregar a mensagem. Tente novamente!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } else {
            setFormData((prevState) => ({
                ...prevState,
                content: "",
            }));
        }
    };

    const handleSave = async () => {
        const { selectedMessage, content } = formData;

        if (!selectedMessage) {
            toast.error("Por favor, selecione ou crie um nome para a mensagem.", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        try {
            const docRef = doc(db, "messages", selectedMessage);
            await setDoc(docRef, { name: selectedMessage, content });

            toast.success("Mensagem salva com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Erro ao salvar a mensagem:", error);
            toast.error("Erro ao salvar a mensagem. Tente novamente!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const renderPreview = () => {
        return (
            <div className="flex flex-col items-start space-y-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-sm mx-auto">
                <div className="p-3 bg-blue-500 text-white rounded-lg shadow-lg">
                    <div dangerouslySetInnerHTML={{ __html: formData.content || "Mensagem vazia." }} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen font-sans">
            {/* Configuração */}
            <div className="flex-1 p-6 bg-transparent text-gray-300">
                <h2 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
                    Editor de Mensagens
                </h2>
                <label className="block mb-4">
                    <span className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-200">
                        Nome da Mensagem:
                    </span>
                    <select
                        value={formData.selectedMessage}
                        onChange={handleSelectChange}
                        className="block w-full p-2 border border-gray-300 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione o nome da mensagem</option>
                        {messageOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name} {/* Exibe o nome ou o ID do documento */}
                            </option>
                        ))}
                    </select>
                </label>
                <h3 className="mb-6 text-lg font-medium text-gray-700 dark:text-gray-200">
                    Corpo da Mensagem:
                </h3>
                <QuillEditor
                    content={formData.content}
                    setContent={(content) =>
                        setFormData((prevState) => ({ ...prevState, content }))
                    }
                />
                <button
                    className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition shadow-md"
                    onClick={handleSave}
                >
                    Salvar Mensagem
                </button>
            </div>

            {/* Pré-visualização */}
            <div className="flex-1 p-6 bg-transparent text-gray-300 border-l border-gray-500 dark:border-gray-700">
                <h2 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
                    Pré-visualização
                </h2>
                <div className="border border-gray-500 p-4 rounded-lg bg-white/20 dark:bg-gray-800">
                    {renderPreview()}
                </div>
            </div>

            {/* Toast container para notificações */}
            <ToastContainer />
        </div>
    );
};

export default MessageEditor;
