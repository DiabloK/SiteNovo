import React, { useState } from "react";
import Select from "react-select";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { ToastContainer, toast, Bounce } from "react-toastify";

const Modal = ({ isVisible, title, onCancel, children }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                <div className="mt-4 text-gray-600 dark:text-gray-300">{children}</div>
                <div className="mt-6 flex justify-end space-x-4">
                </div>
            </div>
        </div>
    );
};


const CompleteProtocolModal = ({ item, isVisible, onCancel, onComplete }) => {
    const [motivo, setMotivo] = useState("");
    const [forcaMaior, setForcaMaior] = useState(false);
    const [comentario, setComentario] = useState("");

    const options = [
        { value: "Melhoria de rede", label: "Manutenção - Melhoria de rede" },
        { value: "Manutencao Prevetiva", label: "Manutenção Preventiva" },
        { value: "Manutenção Emergêncial", label: "Manutenção Emergencial" },
        { value: "Acidente automobilístico", label: "Acidente automobilístico" },
        { value: "Aquecimento do POP", label: "Aquecimento do POP" },
        { value: "Atenuação de fibra", label: "Atenuação de fibra" },
        { value: "Ativo de Rede", label: "Ativo de Rede" },
        { value: "Banco de baterias", label: "Banco de baterias" },
        { value: "Carga alta", label: "Carga alta" },
        { value: "Cordão Conector", label: "Cordão Conector" },
        { value: "Emenda mal feita", label: "Emenda mal feita" },
        { value: "Equipamento queimado", label: "Equipamento queimado" },
        { value: "Equipamento travado", label: "Equipamento travado" },
        { value: "Erro configuração", label: "Erro configuração" },
        { value: "Falha cordão", label: "Falha cordão" },
        { value: "Falha DIO", label: "Falha DIO" },
        { value: "Falha equipamento rádio", label: "Falha equipamento rádio" },
        { value: "Falha GBIC", label: "Falha GBIC" },
        { value: "Falha na antena", label: "Falha na antena" },
        { value: "Falha na fonte do equipamento", label: "Falha na fonte do equipamento" },
        { value: "Falha no nobreak", label: "Falha no nobreak" },
        { value: "Falha software", label: "Falha software" },
        { value: "Falha splitter saída", label: "Falha splitter saída" },
        { value: "Falta de energia", label: "Falta de energia" },
        { value: "Ferragem mal fixada", label: "Ferragem mal fixada" },
        { value: "Fibra mal acomodada", label: "Fibra mal acomodada" },
        { value: "Frequência Ruído elevado", label: "Frequência Ruído elevado" },
        { value: "Incêndio", label: "Incêndio" },
        { value: "Incêndio em Poste", label: "Incêndio em Poste" },
        { value: "Incêndio em Vegetação", label: "Incêndio em Vegetação" },
        { value: "Insetos na caixa", label: "Insetos na caixa" },
        { value: "Linha de cerol", label: "Linha de cerol" },
        { value: "Manutenção não informada", label: "Manutenção não informada" },
        { value: "Maquina Agricula", label: "Maquina Agricula" },
        { value: "Maquina terraplanagem", label: "Maquina terraplanagem" },
        { value: "Nobreak", label: "Nobreak" },
        { value: "Obra de terceiros", label: "Obra de terceiros" },
        { value: "Poda vegetação", label: "Poda vegetação" },
        { value: "Problema na Caixa de Emenda", label: "Problema na Caixa de Emenda" },
        { value: "Problema no quadro de disjuntores", label: "Problema no quadro de disjuntores" },
        { value: "Processamento elevado", label: "Processamento elevado" },
        { value: "Queda de árvore", label: "Queda de árvore" },
        { value: "Queda de poste", label: "Queda de poste" },
        { value: "Refração na OLT", label: "Refração na OLT" },
        { value: "Roedores", label: "Roedores" },
        { value: "Causa não informada", label: "Causa não informada" },
        { value: "Rompimento Parcial", label: "Rompimento Parcial" },
        { value: "Troca de poste", label: "Troca de poste" },
        { value: "Vandalismo ou roubo", label: "Vandalismo ou roubo" },
    ];


    const handleComplete = async () => {
        if (!motivo) {
            alert("Por favor, selecione um motivo.");
            return;
        }

        const horarioFinal = new Date().toISOString();
        const statusAtualizado = "Reagendado";

        try {
            // Referências
            const ativoRef = doc(db, "Ativos", item.id);
            const reagendadoRef = doc(db, "Reagendado", item.id);
            const colecoes = ["manutencao", "protocolos"];

            // Obter dados do documento em "Ativos"
            const ativoSnapshot = await getDoc(ativoRef);
            if (!ativoSnapshot.exists()) {
                console.warn(`Documento com ID "${item.id}" não encontrado na coleção "Ativos".`);
                return;
            }
            const dadosAtivo = ativoSnapshot.data();

            const isDividida =
                !!dadosAtivo.manutencaoDividida && // Garante que "manutencaoDividida" é true
                dadosAtivo.Dividida && // Garante que "Dividida" existe
                Object.keys(dadosAtivo.Dividida).length > 0; // Garante que "Dividida" tem partes

            console.log("Manutenção dividida:", isDividida);

            if (isDividida) {
                console.log("Processando manutenção dividida...");

                // Transformar o map "Dividida" em uma array iterável
                const partesDivididas = Object.entries(dadosAtivo.Dividida || {});
                console.log("Partes divididas:", partesDivididas);

                // Identificar a parte atual (a última incompleta)
                const parteAtual = partesDivididas.find(([chave, parte]) => {
                    console.log(`Verificando parte ${chave}:`, parte);

                    // Acessando "Fim Horario" corretamente
                    if (parte && parte["Fim Horario"] === null) {
                        console.log(`Parte encontrada com "Fim Horario" === null: ${chave}`);
                        return true; // Retorna a parte incompleta
                    }

                    return false; // Não encontrou a parte
                });

                if (!parteAtual) {
                    console.warn("Nenhuma parte incompleta encontrada ou os dados estão inconsistentes.");
                    return;
                }

                const [chaveParteAtual, dadosParteAtual] = parteAtual; // Ex.: "1-parte", { Fim Horario: null, ... }
                console.log(`Parte incompleta encontrada: ${chaveParteAtual}`, dadosParteAtual);

                const indiceProximo = parseInt(chaveParteAtual.split("-")[0]) + 1; // Calcular próxima parte
                const ehUltimaParte = indiceProximo > partesDivididas.length;

                // Atualizar a parte atual em dadosAtivo.Dividida
                dadosAtivo.Dividida[chaveParteAtual] = {
                    ...dadosParteAtual, // Mantém os valores que já estavam
                    "Fim Horario": horarioFinal, // Atualiza apenas o "Fim Horario"
                    "Inicio Horario": dadosParteAtual["Inicio Horario"] || horarioFinal, // Garante que o "Inicio Horario" tenha um valor
                    "Previsto Horario": dadosParteAtual["Previsto Horario"], // Mantém o previsto
                };

                console.log("Parte atualizada em Dividida:", dadosAtivo.Dividida[chaveParteAtual]);

                if (ehUltimaParte) {
                    console.log("Finalizando última parte...");
                    // Finalização completa (última parte)
                    for (const colecao of colecoes) {
                        const docRef = doc(db, colecao, item.id);
                        const docSnapshot = await getDoc(docRef);

                        if (docSnapshot.exists()) {
                            const dados = docSnapshot.data();
                            await setDoc(
                                docRef,
                                {
                                    ...dados,
                                    Dividida: dadosAtivo.Dividida, // Atualizado aqui
                                    status: "Concluído",
                                    horarioFinal,
                                    motivo,
                                    forcaMaior,
                                    comentarios: [...(dados.comentarios || []), comentario],
                                },
                                { merge: true }
                            );
                        } else {
                            console.warn(`Documento com ID "${item.id}" não encontrado na coleção "${colecao}".`);
                        }
                    }
                    await deleteDoc(ativoRef); // Excluir o documento de "Ativos"
                } else {
                    console.log("Ainda há partes pendentes...");
                    // Ainda há partes pendentes
                    for (const colecao of colecoes) {
                        const docRef = doc(db, colecao, item.id);
                        const docSnapshot = await getDoc(docRef);

                        if (docSnapshot.exists()) {
                            const dados = docSnapshot.data();
                            await setDoc(
                                docRef,
                                {
                                    ...dados,
                                    Dividida: dadosAtivo.Dividida, // Atualizado aqui
                                    status: statusAtualizado,
                                    horarioFinal,
                                    motivo,
                                    forcaMaior,
                                    comentarios: [...(dados.comentarios || []), comentario],
                                },
                                { merge: true }
                            );
                        } else {
                            console.warn(`Documento com ID "${item.id}" não encontrado na coleção "${colecao}".`);
                        }
                    }

                    // Criar uma cópia do documento na coleção "Reagendado"
                    await setDoc(reagendadoRef, {
                        ...dadosAtivo,
                        Dividida: dadosAtivo.Dividida, // Atualizado aqui
                        status: statusAtualizado,
                        horarioFinal,
                        motivo,
                        forcaMaior,
                        comentarios: [...(dadosAtivo.comentarios || []), comentario],
                    });

                    await deleteDoc(ativoRef); // Excluir o documento de "Ativos"
                }
            }
            else {
                for (const colecao of colecoes) {
                    let documentId;
                    
                    if (colecao === "protocolos") {
                        // Para protocolos, usamos o identificador 'protocoloISP'
                        if (!item.protocoloISP) {
                            console.warn(`protocoloISP não fornecido para a coleção "${colecao}".`);
                            continue;
                        }
                        documentId = item.protocoloISP;
                    } else {
                        // Para outras coleções (ex: "manutencao"), usamos o item.id
                        documentId = item.id;
                    }
                    
                    const docRef = doc(db, colecao, documentId);
                    const docSnapshot = await getDoc(docRef);
                
                    if (docSnapshot.exists()) {
                        const dados = docSnapshot.data();
                        await setDoc(
                            docRef,
                            {
                                ...dados,
                                status: 'Concluído',
                                horarioFinal,
                                motivo,
                                forcaMaior,
                                comentarios: [...(dados.comentarios || []), comentario],
                            },
                            { merge: true }
                        );
                    } else {
                        console.warn(`Documento com ID "${documentId}" não encontrado na coleção "${colecao}".`);
                    }
                }
                
                await deleteDoc(ativoRef);
            }

            // Mensagem de sucesso
            toast.success('Finalizado', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });

            // Callback de sucesso
            onComplete();
        } catch (error) {
            console.error("Erro ao concluir o documento:", error);
            alert("Erro ao concluir o documento. Verifique os dados e tente novamente.");
        }
    };


    return (
        <Modal
            isVisible={isVisible}
            title={item ? `Concluir Protocolo: ${item.protocoloISP || "—"}` : "Dados não encontrados"}
            onCancel={onCancel}
        >
            <div className="space-y-4">
                {/* Select de Motivo */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Motivo de Fechamento</span>
                    <Select
                        options={options}
                        placeholder="Selecione uma opção"
                        onChange={(selectedOption) => setMotivo(selectedOption.value)}
                        className="mt-1"
                        classNamePrefix="react-select"
                        isSearchable
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isFocused ? (document.documentElement.classList.contains("dark") ? "#374151" : "#f9fafb") : (document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff"),
                                borderColor: state.isFocused ? "#3b82f6" : (document.documentElement.classList.contains("dark") ? "#4b5563" : "#d1d5db"),
                                boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
                                color: document.documentElement.classList.contains("dark") ? "#ffffff" : "#000000",
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: document.documentElement.classList.contains("dark") ? "#ffffff" : "#000000",
                            }),
                            menu: (provided) => ({
                                ...provided,
                                backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
                                color: document.documentElement.classList.contains("dark") ? "#ffffff" : "#000000",
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isSelected
                                    ? "#3b82f6"
                                    : state.isFocused
                                        ? (document.documentElement.classList.contains("dark") ? "#374151" : "#f1f5f9")
                                        : (document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff"),
                                color: state.isSelected
                                    ? "#ffffff"
                                    : document.documentElement.classList.contains("dark")
                                        ? "#ffffff"
                                        : "#000000",
                            }),
                        }}
                    />
                </label>

                {/* Checkbox Força Maior */}
                <div className="flex items-center justify-center space-x-2 text-center">
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="forcaMaior"
                            className="peer sr-only"
                            checked={forcaMaior}
                            onChange={(e) => setForcaMaior(e.target.checked)}
                        />
                        <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600"></div>
                    </div>
                    <label
                        htmlFor="forcaMaior"
                        className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer select-none"
                    >
                        Força maior
                    </label>
                </div>


                {/* Comentário */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Comentário</span>
                    <textarea
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 py-2 px-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        rows="3"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Adicione um comentário, se necessário."
                    ></textarea>
                </label>

                {/* Botões */}
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleComplete}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Concluir
                    </button>
                </div>
            </div>
        </Modal>
    );
};


export default CompleteProtocolModal;
