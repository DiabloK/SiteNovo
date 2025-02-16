import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getTemplatesFromFirebase } from "@/utils/firebaseUtils";
import { processTemplate } from "@/utils/templateProcessor";

export function WhatsAppModal({ isVisible, item, onCancel }) {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateContent, setSelectedTemplateContent] = useState("");
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

    const handleSend = (e) => {
        e.preventDefault(); // Evita o comportamento padrão

        if (!selectedTemplateContent || !item || !item.Clientesafetados || item.Clientesafetados.length === 0) {
            toast.error("Erro: Selecione um template e verifique os dados do cliente.");
            console.error("❌ Erro: Dados inválidos:", { item, selectedTemplateContent });
            return;
        }

        if (!item.id || !item.status || !item.protocoloISP) {
            toast.error("Erro: Dados da manutenção incompletos.");
            console.error("❌ Erro: Dados da manutenção ausentes no item:", item);
            return;
        }

        const clientesFormatados = item.Clientesafetados.map((cliente) => ({
            nome: cliente.Nome || "Cliente",
            celular: cliente.Celular ? cliente.Celular.replace(/\D/g, "") : "",
            ddd: cliente.DDDFone || "",
        })).filter((cliente) => cliente.celular);

        if (clientesFormatados.length === 0) {
            toast.error("Erro: Nenhum cliente tem um número de celular válido.");
            console.error("❌ Nenhum cliente válido encontrado.");
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

        // Fecha o modal imediatamente
        onCancel();

        // Inicia a requisição sem aguardar para manter o feedback imediato
        fetch("http://172.29.3.210:7070/enviar-mensagem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clientes: clientesFormatados,
                dadosManutencao,
                template: selectedTemplateContent,
            }),
        })
            .then(async (response) => {
                const responseData = await response.json();
                if (response.ok) {
                  
                    console.log("✅ Resposta do servidor:", responseData);
                } else {
                    toast.error(`Erro ao enfileirar: ${responseData.error}`);
                    console.error("❌ Erro na resposta:", responseData);
                }
            })
            .catch((error) => {
                toast.error("Erro ao conectar com o servidor.");
                console.error("❌ Erro ao conectar com API:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enviar Mensagem via WhatsApp</h2>

                <div className="mt-4">
                    <label
                        htmlFor="templateSelect"
                        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                        Selecione um Template:
                    </label>
                    <select
                        id="templateSelect"
                        value={selectedTemplateContent}
                        onChange={(e) => setSelectedTemplateContent(e.target.value)}
                        className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Selecione</option>
                        {templates.map((template) => (
                            <option
                                key={template.id}
                                value={template.content}
                            >
                                {template.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-500"
                    >
                        {loading ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
