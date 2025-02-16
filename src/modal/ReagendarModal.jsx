import React, { useState } from "react";
import Select from "react-select";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { toast, Bounce } from "react-toastify";

const Modal = ({ isVisible, title, onCancel, children }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <div className="mt-4 text-gray-600 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
};

/**
 * NewActionModal - Modal para executar uma nova ação que:
 * 1. Altera o status do documento para "Reagendado".
 * 2. Copia os dados para a coleção de destino (padrão: "Reagendado").
 * 3. Atualiza o documento na coleção "protocolos" (usando item.protocoloISP como ID).
 * 4. Deleta o documento na coleção de origem, que agora é determinada dinamicamente
 *    a partir do status atual do item (se item.status existir, esse valor é usado; caso contrário, "Ativos" é o fallback).
 */
const NewActionModal = ({
  item,
  isVisible,
  onCancel,
  onSuccess,
  targetCollection = "Reagendado",
  protocolosCollection = "protocolos",
}) => {
  const [motivo, setMotivo] = useState("");
  const [forcaMaior, setForcaMaior] = useState(false);
  const [comentario, setComentario] = useState("");

  // Determina a coleção de origem dinamicamente a partir do status do item
  // Se o item não possuir um status definido, usa "Ativos" como fallback
  const sourceCollection = item?.status ? item.status : "Ativos";

  // Exemplo de opções para o Select (adicione ou ajuste conforme necessário)
  const options = [
    { value: "Motivo A", label: "Motivo A" },
    { value: "Motivo B", label: "Motivo B" },
    { value: "Motivo C", label: "Motivo C" },
  ];

  const handleNewAction = async () => {
    if (!motivo) {
      alert("Por favor, selecione um motivo.");
      return;
    }

    if (!item || !item.id || !item.protocoloISP) {
      alert("Dados insuficientes para executar a ação.");
      return;
    }

    const horarioFinal = new Date().toISOString();
    const statusAtualizado = "Reagendado";

    try {
      // Referências dinâmicas:
      const currentRef = doc(db, sourceCollection, item.id); // Documento de origem (dinâmico)
      const reagendadoRef = doc(db, targetCollection, item.id); // Coleção de destino
      const protocolosRef = doc(db, protocolosCollection, item.protocoloISP); // Documento em protocolos

      // Obter dados do documento atual na coleção de origem
      const currentSnap = await getDoc(currentRef);
      if (!currentSnap.exists()) {
        alert(`Documento com ID "${item.id}" não encontrado na coleção "${sourceCollection}".`);
        return;
      }
      const currentData = currentSnap.data();

      // Atualiza o documento atual (opcional, para registrar a ação)
      await setDoc(
        currentRef,
        {
          ...currentData,
          status: statusAtualizado,
          horarioFinal,
          motivo,
          forcaMaior,
          comentario,
        },
        { merge: true }
      );

      // Copia os dados para a coleção de destino
      await setDoc(reagendadoRef, {
        ...currentData,
        status: statusAtualizado,
        horarioFinal,
        motivo,
        forcaMaior,
        comentario,
      });

      // Atualiza o documento na coleção "protocolos"
      const protocolosSnap = await getDoc(protocolosRef);
      if (protocolosSnap.exists()) {
        const protocolosData = protocolosSnap.data();
        await setDoc(
          protocolosRef,
          {
            ...protocolosData,
            status: statusAtualizado,
            horarioFinal,
            motivo,
            forcaMaior,
            comentario,
          },
          { merge: true }
        );
      }

      // Deleta o documento da coleção de origem
      await deleteDoc(currentRef);


      onSuccess();
    } catch (error) {
      console.error("Erro ao executar nova ação:", error);
      alert("Erro ao executar nova ação. Verifique os dados e tente novamente.");
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      title={item ? `Nova Ação para: ${item.protocoloISP || "—"}` : "Dados não encontrados"}
      onCancel={onCancel}
    >
      <div className="space-y-4">
        {/* Select de Motivo */}
        <label className="block">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Motivo da Ação
          </span>
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
                backgroundColor: state.isFocused
                  ? document.documentElement.classList.contains("dark")
                    ? "#374151"
                    : "#f9fafb"
                  : document.documentElement.classList.contains("dark")
                  ? "#1f2937"
                  : "#ffffff",
                borderColor: state.isFocused
                  ? "#3b82f6"
                  : document.documentElement.classList.contains("dark")
                  ? "#4b5563"
                  : "#d1d5db",
                boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
                color: document.documentElement.classList.contains("dark")
                  ? "#ffffff"
                  : "#000000",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: document.documentElement.classList.contains("dark")
                  ? "#ffffff"
                  : "#000000",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: document.documentElement.classList.contains("dark")
                  ? "#1f2937"
                  : "#ffffff",
                color: document.documentElement.classList.contains("dark")
                  ? "#ffffff"
                  : "#000000",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? "#3b82f6"
                  : state.isFocused
                  ? document.documentElement.classList.contains("dark")
                    ? "#374151"
                    : "#f1f5f9"
                  : document.documentElement.classList.contains("dark")
                  ? "#1f2937"
                  : "#ffffff",
                color: state.isSelected
                  ? "#ffffff"
                  : document.documentElement.classList.contains("dark")
                  ? "#ffffff"
                  : "#000000",
              }),
            }}
          />
        </label>

        {/* Comentário */}
        <label className="block">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Comentário
          </span>
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
            onClick={handleNewAction}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Executar Ação
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewActionModal;
