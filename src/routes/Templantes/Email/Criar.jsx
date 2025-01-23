import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import gif1 from "../../../assets/ggnet.gif";
import { doc, setDoc } from "firebase/firestore"; // Importar Firestore
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

const EmailCreator = () => {
    const [formData, setFormData] = useState({
        emailTitle: "",
        previewTitle: "",
        selectedGif: "",
        content: "",
        nome: "João",
        horarioInicial: "10:00",
        horarioFinal: "12:00",
    });

    const gifOptions = [{ name: "GGNET", src: gif1 }];

    const variables = {
        $nome: formData.nome,
        $horarioInicial: formData.horarioInicial,
        $horarioFinal: formData.horarioFinal,
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleGifChange = (e) => {
        const selected = gifOptions.find((gif) => gif.name === e.target.value);
        setFormData((prevState) => ({
            ...prevState,
            selectedGif: selected ? selected.src : "",
        }));
    };

    const handleSave = async () => {
        const finalContent = formData.content;

        // Salvar o template com variáveis dinâmicas intactas
        const templateData = {
            emailTitle: formData.emailTitle,
            previewTitle: formData.previewTitle,
            content: formData.content, // Mantém as variáveis dinâmicas ($nome, etc.)
            variables: Object.keys(variables), // Armazena as variáveis para referência futura
        };

        try {
            const docRef = doc(db, "email", formData.emailTitle || "templateSemTitulo");
            await setDoc(docRef, templateData);
            toast.success("Template salvo com sucesso no Firebase!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        } catch (error) {
            console.error("Erro ao salvar o template:", error);
            toast.error("Erro ao salvar o template. Tente novamente!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    };


    const renderPreview = () => {
        let previewContent = formData.content || "Corpo do e-mail vazio.";

        // Substituir todas as variáveis dinâmicas no conteúdo
        Object.keys(variables).forEach((key) => {
            const regex = new RegExp(`\\${key}`, "g"); // Escape do símbolo $
            previewContent = previewContent.replace(
                regex,
                `<span class="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-1 rounded">${variables[key]}</span>`
            );
        });

        return (
            <div>
                <div className="text-center mb-4 text-lg font-bold text-black dark:text-white px-1">
                    {formData.previewTitle || "Título do E-mail"}
                </div>

                <div
                    className="p-4 bg-transparent border border-gray-500 dark:border-gray-700 rounded-lg mb-4 text-gray-800 dark:text-gray-200 px-1"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                />
                {formData.selectedGif && (
                    <div className="text-center mt-4">
                        <img
                            src={formData.selectedGif}
                            alt="GIF"
                            className="max-w-[50%] mx-auto rounded"
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen font-sans">
            {/* Configuração */}
            <div className="flex-1 p-6 bg-transparent text-gray-300">
                <label className="block mb-4">
                    <span className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
                        Título do Tipo de E-mail:
                    </span>
                    <input
                        type="text"
                        name="emailTitle"
                        value={formData.emailTitle}
                        onChange={handleChange}
                        className="block w-full mt-1 p-2 border border-gray-300 bg-white/30 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    />
                </label>
                <label className="block mb-4">
                    <span className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
                        Título do E-mail (Preview):
                    </span>
                    <input
                        type="text"
                        name="previewTitle"
                        value={formData.previewTitle}
                        onChange={handleChange}
                        className="block w-full mt-1 p-2 border border-gray-300 bg-white/30 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    />
                </label>
                <h3 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">Selecione um GIF:</h3>
                <select
                    onChange={handleGifChange}
                    value={gifOptions.find((gif) => gif.src === formData.selectedGif)?.name || ""}
                    className="block w-full p-2 border border-gray-300 bg-white/30 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Nenhum</option>
                    {gifOptions.map((gif) => (
                        <option key={gif.name} value={gif.name}>
                            {gif.name}
                        </option>
                    ))}
                </select>
                <h3 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">Variáveis Dinâmicas:</h3>
                <div className="mb-6 flex space-x-2">
                    <span className="px-3 py-2 m-2 bg-black text-white rounded-full text-sm">$nome</span>
                    <span className="px-3 py-2 m-2 bg-black text-white rounded-full text-sm">$horarioInicial</span>
                    <span className="px-3 py-2 m-2 bg-black text-white rounded-full text-sm">$horarioFinal</span>
                </div>
                <h3 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">Corpo do E-mail:</h3>
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
                    Salvar Template
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

export default EmailCreator;
