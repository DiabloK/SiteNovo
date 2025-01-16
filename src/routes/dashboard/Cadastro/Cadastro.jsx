import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isBefore, parseISO } from "date-fns"; // Utilizado para validar as datas

const Cadastro = () => {
    const [formData, setFormData] = useState({
        idManutencao: "",
        protocolo: "", // Protocolo único
        tipo: "Incidente", // Tipo de evento
        dataInicio: "", // Data de início
        dataPrevista: "", // Data prevista
        observacao: "", // Observação
        regional: "", // Regional (valores fixos)
        pontoAcesso: "", // Ponto de Acesso
        total_afetados: 0,
        whatsapp: false,
        email: false,
    });

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
            // Verificar se o protocolo já existe
            const checkResponse = await fetch(`/check-protocolo?protocolo=${formData.protocolo}`);
            const protocoloExists = await checkResponse.json();

            if (protocoloExists) {
                toast.error("Protocolo já cadastrado. Por favor, insira outro protocolo.");
                return;
            }

            // Enviar os dados para o backend
            const response = await fetch("/Cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Cadastro realizado com sucesso!");
                // Limpar o formulário
                setFormData({
                    protocolo: "",
                    tipo: "Incidente",
                    dataInicio: "",
                    dataPrevista: "",
                    observacao: "",
                    regional: "",
                    pontoAcesso: "",
                });
            } else {
                toast.error("Erro ao cadastrar manutenção.");
            }
        } catch (error) {
            console.error("Erro:", error);
            toast.error("Erro ao realizar o cadastro.");
        }
    };

    return (
        <div className="p-4">
            {/* Componente de notificações */}
            <ToastContainer />
            <h1 className="mb-4 text-2xl font-bold">Cadastro de Manutenção</h1>
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                {/* Protocolo */}
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

                {/* Tipo */}
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

                {/* Data de Início */}
                <div>
                    <label>Data de Início</label>
                    <input
                        type="datetime-local"
                        name="dataInicio"
                        value={formData.dataInicio}
                        onChange={handleChange}
                        className="w-full border p-2"
                        required
                    />
                </div>

                {/* Data Prevista */}
                <div>
                    <label>Data Prevista</label>
                    <input
                        type="datetime-local"
                        name="dataPrevista"
                        value={formData.dataPrevista}
                        onChange={handleChange}
                        className="w-full border p-2"
                        required
                    />
                </div>
                {/* Ponto de Acesso */}
                <div>
                    <label>Ponto de Acesso</label>
                    <input
                        type="text"
                        name="pontoAcesso"
                        value={formData.pontoAcesso}
                        onChange={handleChange}
                        className="w-full border p-2"
                    />
                </div>

                {/* Regional */}
                <div>
                    <label>Regional</label>
                    <select
                        name="regional"
                        value={formData.regional}
                        onChange={handleChange}
                        className="w-full border p-2"
                        required
                    >
                        <option value="">Selecione uma regional</option>
                        {[
                            "MFA",
                            "JCA",
                            "CTA",
                            "JGS",
                            "JVE",
                            "SOO",
                            "CCO",
                            "SPO",
                            "RJO",
                            "LGS",
                            "PYE",
                            "MS",
                            "CSL",
                            "CSC",
                            "PGO",
                            "CDR",
                            "UVA",
                            "VDA",
                            "CNI",
                            "RSL",
                            "IRI",
                        ].map((regional) => (
                            <option
                                key={regional}
                                value={regional}
                            >
                                {regional}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Observação */}
                <div>
                    <label>Observação</label>
                    <textarea
                        name="observacao"
                        value={formData.observacao}
                        onChange={handleChange}
                        className="w-full border p-2"
                    />
                </div>

                {/* Botão de Enviar */}
                <button
                    type="submit"
                    className="rounded bg-blue-500 px-4 py-2 text-white"
                >
                    Cadastrar
                </button>
            </form>
        </div>
    );
};

export default Cadastro;
