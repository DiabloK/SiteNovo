import { useEffect, useState } from "react";
import { getTemplatesFromFirebase } from "@/utils/firebaseemail";
import { updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

export function EmailReenviarModal({ isVisible, contact, onClose }) {
    const [templates, setTemplates] = useState([]); // Lista de templates
    const [selectedTemplate, setSelectedTemplate] = useState(""); // Template selecionado
    const [subject, setSubject] = useState(""); // Assunto do e-mail
    const [emailContent, setEmailContent] = useState(""); // Conteúdo do e-mail
    const [email, setEmail] = useState(contact?.Email || ""); // E-mail do destinatário
    const [loading, setLoading] = useState(false);

    // Carregar templates do Firebase
    useEffect(() => {
        async function fetchTemplates() {
            try {
                const data = await getTemplatesFromFirebase();
                setTemplates(data);
            } catch (error) {
                console.error("Erro ao buscar templates:", error);
            }
        }
        fetchTemplates();
    }, []);

    // Atualiza o conteúdo do e-mail ao escolher um template
    useEffect(() => {
        if (selectedTemplate) {
            const template = templates.find(t => t.id === selectedTemplate);
            if (template) {
                setSubject(template.emailTitle || "Aviso de Manutenção");
                setEmailContent(template.content || "");
            }
        }
    }, [selectedTemplate, templates]);

    // Função para reenviar o e-mail
    const handleResend = async () => {
        console.log("🔍 Dados do contato antes do envio:", contact);
    
        // Obtém o e-mail válido
        const email =
            typeof contact?.Email === "string" && contact.Email.includes("@")
                ? contact.Email
                : typeof contact?.["E-mail"] === "string" && contact["E-mail"].includes("@")
                ? contact["E-mail"]
                : null;
    
        if (!email) {
            console.error("❌ Erro: Nenhum e-mail válido disponível para reenvio.", contact);
            return;
        }
    
        if (!selectedTemplate || !selectedSubject) {
            console.error("❌ Erro: Template ou assunto não selecionado.");
            return;
        }
    
        console.log("📨 Enviando requisição de reenvio para:", {
            to: email,
            subject: selectedSubject,
            text: selectedTemplate,
            html: selectedTemplate,
            id: contact.id, // Adicionando ID do contato
        });
    
        try {
            const response = await fetch("http://172.29.3.210:6060/reenviar-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: email,
                    subject: selectedSubject,
                    text: selectedTemplate,
                    html: selectedTemplate,
                    id: contact.id, // Usamos ID do contato
                }),
            });
    
            const responseData = await response.json();
    
            if (response.ok) {
                console.log("✅ E-mail reenviado com sucesso:", responseData);
                onClose(); // Fecha o modal após sucesso
            } else {
                console.error("❌ Erro ao reenviar e-mail:", responseData.error);
            }
        } catch (error) {
            console.error("❌ Erro na conexão com a API de e-mails:", error);
        }
    };
    
    

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-96 rounded-lg bg-white p-6 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reenviar E-mail</h2>

                {/* Seleção de Template */}
                <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300">
                        Selecione um Template:
                    </label>
                    <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="mt-2 w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value="">Selecione</option>
                        {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.emailTitle}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Campo de Assunto */}
                <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300">
                        Assunto:
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-2 w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        placeholder="Digite o assunto do e-mail"
                    />
                </div>

                {/* Campo de E-mail */}
                <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300">
                        E-mail:
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        placeholder="Digite o e-mail do destinatário"
                    />
                </div>

                {/* Conteúdo do e-mail */}
                <div className="mt-4">
                    <label className="block text-gray-700 dark:text-gray-300">
                        Mensagem:
                    </label>
                    <textarea
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        className="mt-2 w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        rows="5"
                    />
                </div>

                {/* Botões */}
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
                    >
                        {loading ? "Enviando..." : "Reenviar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default EmailReenviarModal;