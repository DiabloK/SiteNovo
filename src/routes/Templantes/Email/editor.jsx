import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
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

const EmailEditor = () => {
    const [formData, setFormData] = useState({
        emailTitle: "",
        previewTitle: "",
        selectedGif: "",
        content: "",
        nome: "João",
        horarioInicial: "10:00",
        horarioFinal: "12:00",
    });
    const [loading, setLoading] = useState(false);
    const [templateTitles, setTemplateTitles] = useState([]); // Armazena os títulos dos templates

    const variables = {
        $nome: formData.nome,
        $horarioInicial: formData.horarioInicial,
        $horarioFinal: formData.horarioFinal,
    };

    useEffect(() => {
        const fetchTemplateTitles = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "email"));
                const titles = querySnapshot.docs.map((doc) => doc.id); // Extrai os IDs dos documentos
                setTemplateTitles(titles);
            } catch (error) {
                console.error("Erro ao buscar os templates:", error);
                toast.error("Erro ao carregar a lista de templates. Tente novamente!");
            }
        };

        fetchTemplateTitles(); // Carrega os títulos ao montar o componente
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const loadTemplate = async (title) => {
        setLoading(true);
        try {
            const docRef = doc(db, "email", title);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData((prevState) => ({
                    ...prevState,
                    emailTitle: data.emailTitle,
                    previewTitle: data.previewTitle,
                    content: data.content,
                }));
                toast.success("Template carregado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                toast.error("Template não encontrado.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Erro ao carregar o template:", error);
            toast.error("Erro ao carregar o template. Tente novamente!", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const finalContent = formData.content;

        const templateData = {
            emailTitle: formData.emailTitle,
            previewTitle: formData.previewTitle,
            content: formData.content,
            variables: Object.keys(variables),
        };

        try {
            const docRef = doc(db, "email", formData.emailTitle || "templateSemTitulo");
            await setDoc(docRef, templateData);
            toast.success("Template atualizado com sucesso no Firebase!", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Erro ao salvar o template:", error);
            toast.error("Erro ao salvar o template. Tente novamente!", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="flex h-screen font-sans">
            {/* Configuração */}
            <div className="flex-1 p-6 bg-transparent text-gray-300">
                <label className="block mb-4">
                    <span className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">Selecione o Template:</span>
                    <select
                        name="emailTitle"
                        value={formData.emailTitle}
                        onChange={handleChange}
                        className="block w-full mt-1 p-2 border border-gray-300 bg-white/30 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Selecione um template</option>
                        {templateTitles.map((title) => (
                            <option key={title} value={title}>
                                {title}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    className="mt-2 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition shadow-md"
                    onClick={() => loadTemplate(formData.emailTitle)}
                    disabled={loading || !formData.emailTitle}
                >
                    {loading ? "Carregando..." : "Carregar Template"}
                </button>

                <h3 className="mt-6 mb-4 text-xl font-bold text-gray-700 dark:text-gray-200">Editar Template:</h3>
                <label className="block mb-4">
                    <span className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">Título do E-mail:</span>
                    <input
                        type="text"
                        name="previewTitle"
                        value={formData.previewTitle}
                        onChange={handleChange}
                        className="block w-full mt-1 p-2 border border-gray-300 bg-white/30 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    />
                </label>
                <h3 className="mb-6 text-lg font-semibold text-gray-700 dark:text-gray-200">Corpo do E-mail:</h3>
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
                    Salvar Alterações
                </button>
            </div>

            {/* Toast container para notificações */}
            <ToastContainer />
        </div>
    );
};

export default EmailEditor;
