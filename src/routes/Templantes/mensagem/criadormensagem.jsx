import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { doc, setDoc } from "firebase/firestore"; // Firebase Firestore
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

            // Estilos do editor
            editorRef.current.querySelector(".ql-editor").classList.add(
                "bg-transparent",
                "text-gray-800",
                "dark:text-gray-200"
            );
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
            className="h-48 border border-gray-500 bg-transparent rounded"
        />
    );
};

const MessageCreator = () => {
    const [formData, setFormData] = useState({
        messageTitle: "",
        messageBody: "",
    });

    // Variáveis dinâmicas fixas
    const variables = {
        $nome: "João",
        $horarioInicial: "10:00",
        $horarioFinal: "12:00",
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        const { messageTitle, messageBody } = formData;

        if (!messageTitle.trim()) {
            toast.error("O título da mensagem é obrigatório.", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        try {
            const docRef = doc(db, "messages", messageTitle);
            await setDoc(docRef, {
                title: messageTitle,
                content: messageBody,
            });

            toast.success("Mensagem salva com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Erro ao salvar mensagem:", error);
            toast.error("Erro ao salvar a mensagem. Tente novamente!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const renderPreview = () => {
        let previewContent = formData.messageBody || "Corpo da mensagem vazio.";

        // Substituir variáveis dinâmicas no conteúdo
        Object.keys(variables).forEach((key) => {
            const regex = new RegExp(`\\${key}`, "g");
            previewContent = previewContent.replace(
                regex,
                `<span class="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-1 rounded">${variables[key]}</span>`
            );
        });

        return (
            <div className="flex flex-col items-start space-y-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-sm mx-auto">
                <div className="p-3 bg-blue-500 text-white rounded-lg shadow-lg max-w-full">
                    <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen font-sans">
            {/* Configuração */}
            <div className="flex-1 p-6 bg-white/30 backdrop-blur-md text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-lg shadow-lg">
                <h2 className="mb-6 text-xl font-bold">Criador de Mensagem</h2>
                <label className="block mb-4">
                    <span className="text-sm font-medium">Título da Mensagem:</span>
                    <input
                        type="text"
                        name="messageTitle"
                        value={formData.messageTitle}
                        onChange={handleChange}
                        className="block w-full mt-1 p-2 border border-gray-300 bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded shadow-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Digite o título da mensagem"
                    />
                </label>
                <div className="mb-4">
                    <h3 className="text-sm font-medium">Variáveis Dinâmicas Disponíveis:</h3>
                    <ul className="list-disc ml-6 text-gray-800 dark:text-gray-200">
                        <li>
                            <span className="font-bold">$nome</span> — Substituído por: <span className="text-blue-500">{variables.$nome}</span>
                        </li>
                        <li>
                            <span className="font-bold">$horarioInicial</span> — Substituído por: <span className="text-blue-500">{variables.$horarioInicial}</span>
                        </li>
                        <li>
                            <span className="font-bold">$horarioFinal</span> — Substituído por: <span className="text-blue-500">{variables.$horarioFinal}</span>
                        </li>
                    </ul>
                </div>
                <h3 className="text-sm font-medium mb-2">Corpo da Mensagem:</h3>
                <QuillEditor
                    content={formData.messageBody}
                    setContent={(content) =>
                        setFormData((prevState) => ({ ...prevState, messageBody: content }))
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
            <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-800 text-gray-300 rounded-lg shadow-lg">
                <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-gray-200">
                    Pré-visualização
                </h2>
                <div className="border border-gray-500 p-4 rounded-lg bg-transparent">
                    {renderPreview()}
                </div>
            </div>

            {/* Toast container para notificações */}
            <ToastContainer />
        </div>
    );
};

export default MessageCreator;
