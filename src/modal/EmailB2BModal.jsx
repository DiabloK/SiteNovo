import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getTemplatesFromFirebase } from "@/utils/firebaseemail";

export default function EmailB2BModal({ isVisible, item, onCancel }) {
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
    setSubject(template ? template.emailTitle : "");
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
      const clienteDados =
        item.Clientesafetados.find(
          (c) => c.Email && c.Email.toLowerCase() === email.toLowerCase()
        ) || {};

      fetch("http://172.29.3.210:6060/enviar-email-b2b", {
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
          selectedGif: selectedTemplate.selectedGif, // Envia também o GIF, se houver
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
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Enviar E-mail B2B
        </h2>

        {/* Seleção de Template */}
        <div className="mt-4">
          <label
            htmlFor="templateSelect"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Selecione um Template:
          </label>
          <select
            id="templateSelect"
            onChange={handleTemplateChange}
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white text-gray-900 py-2 px-3 shadow-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
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
          <label
            htmlFor="subjectInput"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Assunto:
          </label>
          <input
            type="text"
            id="subjectInput"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Digite o assunto do e-mail"
            className="mt-2 block w-full rounded-md border border-gray-300 bg-white text-gray-900 py-2 px-3 shadow-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 disabled:bg-gray-200 dark:disabled:bg-gray-700"
          />
        </div>

        {/* Botões */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-500"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
