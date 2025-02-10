import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getTemplatesFromFirebase } from "@/utils/firebaseemail";

export function EmailModal({ isVisible, item, onCancel }) {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [subject, setSubject] = useState("");
    const [loading, setLoading] = useState(false);

    // Carrega os templates do Firebase quando o modal for exibido
    useEffect(() => {
        if (!isVisible) return;
        async function fetchTemplates() {
            try {
                const data = await getTemplatesFromFirebase();
                setTemplates(data);
            } catch (error) {
                console.error("Erro ao buscar templates:", error);
                toast.error("Erro ao carregar os templates");
            }
        }
        fetchTemplates();
    }, [isVisible]);

    // Atualiza o template selecionado e define o título do e-mail automaticamente
    const handleTemplateChange = (e) => {
        const selectedId = e.target.value;
        const template = templates.find((t) => t.id === selectedId);
        setSelectedTemplate(template);
        setSubject(template ? template.emailTitle : ""); // Define o título do email automaticamente
    };

    const handleSend = (e) => {
        e.preventDefault();

        // Validação de dados
        if (!selectedTemplate || !item || !item.Clientesafetados || item.Clientesafetados.length === 0) {
            toast.error("Erro: Selecione um template e verifique os dados do cliente.");
            return;
        }

        if (!item.id || !item.status || !item.protocoloISP) {
            toast.error("Erro: Dados da manutenção incompletos.");
            return;
        }

        // Filtra os clientes que possuem e-mail válido
        const destinatarios = item.Clientesafetados
            .filter((cliente) => cliente.Email && cliente.Email.includes("@"))
            .map((cliente) => cliente.Email);

        if (destinatarios.length === 0) {
            toast.error("Erro: Nenhum cliente tem um e-mail válido.");
            return;
        }

        const dadosManutencao = {
            id: item.id,
            status: item.status,
            protocoloISP: item.protocoloISP,
            horarioInicial: item.horarioInicial || "Sem horário definido",
            horarioPrevisto: item.horarioPrevisto || "Sem horário definido",
        };

        setLoading(true);
        onCancel(); // Fecha o modal imediatamente

        destinatarios.forEach((email) => {
            const clienteDados = item.Clientesafetados.find(
                (c) => c.Email && c.Email.toLowerCase() === email.toLowerCase()
            ) || {};

            fetch("http://172.29.3.210:6060/enviar-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: email,
                    subject,
                    text: selectedTemplate.content,
                    html: selectedTemplate.content,
                    dadosManutencao,
                    item: {
                        Email: email,
                        Nome: clienteDados.Nome,
                        Codigo: clienteDados.Codigo,
                        Origem: clienteDados.Origem,
                    },
                }),
            })
                .then(async (response) => {
                    const responseData = await response.json();
                    if (response.ok) {
                        toast.success("E-mails enfileirados com sucesso!");
                    } else {
                        toast.error(`Erro ao enfileirar: ${responseData.error}`);
                    }
                })
                .catch(() => {
                    toast.error("Erro ao conectar com o servidor.");
                })
                .finally(() => {
                    setLoading(false);
                });
        });
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-96 rounded-lg bg-white p-6 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enviar E-mail</h2>

                <div className="mt-4">
                    <label htmlFor="templateSelect" className="block text-gray-700 dark:text-gray-300">
                        Selecione um Template:
                    </label>
                    <select
                        id="templateSelect"
                        onChange={handleTemplateChange}
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

                <div className="mt-4">
                    <label htmlFor="subjectInput" className="block text-gray-700 dark:text-gray-300">
                        Assunto:
                    </label>
                    <input
                        type="text"
                        id="subjectInput"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-2 w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        placeholder="Digite o assunto do e-mail"
                    />
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
                    >
                        {loading ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
