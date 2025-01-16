import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isBefore, parseISO } from "date-fns";
import checkProtocolo from "../../../utils/checkProtocolo";

const Cadastro = () => {
    const [formData, setFormData] = useState({
        idManutencao: "",
        protocolo: "",
        tipo: "Incidente",
        dataInicio: "",
        dataPrevista: "",
        observacao: "",
        regional: "",
        pontoAcesso: "",
        total_afetados: 0,
        whatsapp: false,
        email: false,
    });

    const [pontosAcesso, setPontosAcesso] = useState([]); // Lista de pontos de acesso
    const [loadingPontos, setLoadingPontos] = useState(true); // Status de carregamento

    // Função para buscar pontos de acesso das APIs
    const fetchPontosAcesso = async () => {
        try {
            const ggnetResponse = await fetch("https://api.ggnet.com.br/pontosAcesso"); // Exemplo
            const altResponse = await fetch("https://api.alt.com.br/pontosAcesso"); // Exemplo

            const ggnetData = await ggnetResponse.json();
            const altData = await altResponse.json();

            // Combinar dados das duas APIs
            const combinedData = [...ggnetData, ...altData].reduce((unique, item) => {
                if (!unique.some((u) => u.codcon === item.codcon)) {
                    unique.push(item);
                }
                return unique;
            }, []);

            return combinedData;
        } catch (error) {
            console.error("Erro ao buscar pontos de acesso:", error);
            return [];
        }
    };

    // Carregar pontos de acesso ao montar o componente
    useEffect(() => {
        const loadPontosAcesso = async () => {
            setLoadingPontos(true);
            const data = await fetchPontosAcesso();
            setPontosAcesso(data);
            setLoadingPontos(false);
        };

        loadPontosAcesso();
    }, []);

    // Atualizar os campos do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Submeter o formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar: Data prevista não pode ser menor que a data de início
        if (isBefore(parseISO(formData.dataPrevista), parseISO(formData.dataInicio))) {
            toast.error("A data prevista não pode ser menor que a data de início.");
            return;
        }

        try {
            if (!formData.protocolo || isNaN(formData.protocolo)) {
                toast.error("Protocolo inválido. Deve ser um número.");
                return;
            }

            // Verificar se o protocolo já existe
            const protocoloExists = await checkProtocolo(Number(formData.protocolo));
            if (protocoloExists) {
                toast.error("Protocolo já cadastrado. Por favor, insira outro protocolo.");
                return;
            }

            // Enviar os dados para o backend
            const response = await fetch("http://localhost:4000/Cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Cadastro realizado com sucesso!");
                setFormData({
                    idManutencao: "",
                    protocolo: "",
                    tipo: "Incidente",
                    dataInicio: "",
                    dataPrevista: "",
                    observacao: "",
                    regional: "",
                    pontoAcesso: "",
                    total_afetados: 0,
                    whatsapp: false,
                    email: false,
                });
            } else {
                const errorMsg = await response.text();
                toast.error(`Erro ao cadastrar manutenção: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Erro ao verificar ou cadastrar protocolo:", error);
            toast.error("Erro ao realizar o cadastro.");
        }
    };

    return (
        <div className="p-4">
            <ToastContainer />
            <h1 className="mb-4 text-2xl font-bold">Cadastro de Manutenção</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Outros Campos do Formulário */}
                <div>
                    <label>Protocolo</label>
                    <input
                        type="text"
                        name="protocolo"
                        value={formData.protocolo}
                        onChange={handleChange}
                        required
                        className="w-full border p-2"
                    />
                </div>
                <div>
                    <label>Tipo</label>
                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="w-full border p-2"
                    >
                        <option value="Incidente">Evento</option>
                        <option value="Solicitação">Solicitação emergencial</option>
                        <option value="Preventiva">Manutenção</option>
                    </select>
                </div>
                {/* Campo de Ponto de Acesso */}
                <div>
                    <label>Ponto de Acesso</label>
                    {loadingPontos ? (
                        <p>Carregando pontos de acesso...</p>
                    ) : (
                        <select
                            name="pontoAcesso"
                            value={formData.pontoAcesso}
                            onChange={handleChange}
                            className="w-full border p-2"
                        >
                            <option value="">Selecione um ponto de acesso</option>
                            {pontosAcesso.map((ponto) => (
                                <option key={ponto.codcon} value={ponto.codcon}>
                                    {ponto.nome} ({ponto.codcon})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div>
                    <label>Observação</label>
                    <textarea
                        name="observacao"
                        value={formData.observacao}
                        onChange={handleChange}
                        className="w-full border p-2"
                    />
                </div>
                <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white">
                    Cadastrar
                </button>
            </form>
        </div>
    );
};

export default Cadastro;
