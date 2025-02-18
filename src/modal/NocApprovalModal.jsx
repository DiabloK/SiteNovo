import React, { useState, useEffect, useRef } from "react";
import { getDoc, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "@/utils/firebase";
import "react-toastify/dist/ReactToastify.css";

const NocApprovalModal = ({
  title,
  message,
  docId,            // ID do documento na coleção "Requisição"
  onCancel,         // Função para fechar o modal
  isVisible,
}) => {
  // Estados para exibir campos de cadastro de clientes
  const [showClientFields, setShowClientFields] = useState(false);

  // Estados para os dados do JSON
  const [digisacData, setDigisacData] = useState([]);
  const [emailB2BData, setEmailB2BData] = useState([]);

  // Estados para os termos de busca e seleção para Digisac
  const [searchTermDigisac, setSearchTermDigisac] = useState("");
  const [searchResultsDigisac, setSearchResultsDigisac] = useState([]);
  const [selectedDigisac, setSelectedDigisac] = useState([]);

  // Estados para os termos de busca e seleção para E-mail B2B
  const [searchTermEmailB2B, setSearchTermEmailB2B] = useState("");
  const [searchResultsEmailB2B, setSearchResultsEmailB2B] = useState([]);
  const [selectedEmailB2B, setSelectedEmailB2B] = useState([]);

  // Estado para total de clientes afetados (soma dos itens selecionados)
  const [totalClientesAfetados, setTotalClientesAfetados] = useState(0);

  // Atualiza o total sempre que os itens selecionados mudam
  useEffect(() => {
    const total = selectedDigisac.length + selectedEmailB2B.length;
    setTotalClientesAfetados(total);
  }, [selectedDigisac, selectedEmailB2B]);

  // Refs para dropdowns
  const digisacRef = useRef(null);
  const emailB2BRef = useRef(null);

  // Carrega os dados de Digisac do JSON
  useEffect(() => {
    const fetchDigisacData = async () => {
      try {
        const response = await fetch("/digisac.json");
        const data = await response.json();
        setDigisacData(data);
      } catch (error) {
        console.error("Erro ao carregar digisac:", error);
      }
    };
    fetchDigisacData();
  }, []);

  // Carrega os dados de E-mail B2B do JSON
  useEffect(() => {
    const fetchEmailB2BData = async () => {
      try {
        const response = await fetch("/emailB2B.json");
        const data = await response.json();
        setEmailB2BData(data);
      } catch (error) {
        console.error("Erro ao carregar Email B2B:", error);
      }
    };
    fetchEmailB2BData();
  }, []);

  // Filtra os dados de Digisac conforme o termo de busca
  useEffect(() => {
    if (!searchTermDigisac) {
      setSearchResultsDigisac([]);
      return;
    }
    const filtered = digisacData.filter((item) =>
      (item.name || "").toLowerCase().includes(searchTermDigisac.toLowerCase())
    );
    setSearchResultsDigisac(filtered);
  }, [searchTermDigisac, digisacData]);

  // Filtra os dados de E-mail B2B conforme o termo de busca
  useEffect(() => {
    if (!searchTermEmailB2B) {
      setSearchResultsEmailB2B([]);
      return;
    }
    const filtered = emailB2BData.filter((item) =>
      ((item.Nome || "") + (item.Email || ""))
        .toLowerCase()
        .includes(searchTermEmailB2B.toLowerCase())
    );
    setSearchResultsEmailB2B(filtered);
  }, [searchTermEmailB2B, emailB2BData]);

  if (!isVisible) return null;

  // Handler para "Não": atualiza o documento definindo "conselho" como "Pendente"
  const handleNo = async () => {
    try {
      const reqRef = doc(db, "Requisição", docId);
      const reqSnap = await getDoc(reqRef);
      if (!reqSnap.exists()) {
        toast.error(`Documento ${docId} não encontrado na coleção Requisição.`);
        return;
      }
      await updateDoc(reqRef, { conselho: "Pendente" });
      toast.error("Rejeitado em NOC – encaminhado para Conselho!");
      // Fecha o modal
      if (onCancel) onCancel();
    } catch (error) {
      toast.error(`Erro ao atualizar documento: ${error.message}`);
    }
  };

  // Função que processa o documento (fluxo padrão)
  const processDocument = async (extraData = {}) => {
    try {
      const reqRef = doc(db, "Requisição", docId);
      const reqSnap = await getDoc(reqRef);
      if (!reqSnap.exists()) {
        toast.error(`Documento ${docId} não encontrado na coleção Requisição.`);
        return;
      }
      const data = reqSnap.data();
      const updatedData = {
        ...data,
        status: "Pendente",
        protocoloId: docId,
        ...extraData,
      };
      // Copia para a coleção "protocolos"
      const protocoloRef = doc(db, "protocolos", docId);
      await setDoc(protocoloRef, updatedData);
      // Copia para a coleção "Pendente"
      const pendenteRef = doc(db, "Pendente", docId);
      await setDoc(pendenteRef, updatedData);
      // Deleta o documento original na coleção "Requisição"
      await deleteDoc(reqRef);
      toast.success("Documento aprovado em NOC e movido para Pendente.");
      // Fecha o modal
      if (onCancel) onCancel();
    } catch (error) {
      toast.error(`Erro ao atualizar documento: ${error.message}`);
    }
  };

  // Handler para "Sim": fluxo padrão sem dados de clientes
  const handleYes = async () => {
    await processDocument({ total_afetados: totalClientesAfetados });
  };

  // Handler para "Cadastrar Clientes":
  // Se os campos ainda não estão visíveis, os exibe; se já estiverem, processa com os dados extras
  const handleCadastrarClientes = async () => {
    if (!showClientFields) {
      setShowClientFields(true);
      return;
    }
    // Atualiza o documento original na coleção "Requisição" com os dados dos clientes
    try {
      const reqRef = doc(db, "Requisição", docId);
      const reqSnap = await getDoc(reqRef);
      if (!reqSnap.exists()) {
        toast.error(`Documento ${docId} não encontrado na coleção Requisição.`);
        return;
      }
      await updateDoc(reqRef, {
        digisac: selectedDigisac,
        emailB2B: selectedEmailB2B,
        total_afetados: totalClientesAfetados,
      });
      
      toast.success("Dados dos clientes atualizados com sucesso!");
      // Opcional: fechar o modal ou aguardar uma ação do usuário
      if (onCancel) onCancel();
    } catch (error) {
      toast.error(`Erro ao atualizar os dados: ${error.message}`);
    }
  };

  // Handlers para seleção dos itens nos dropdowns
  const handleSelectDigisac = (item) => {
    const exists = selectedDigisac.some((d) => d.id === item.id);
    if (!exists) {
      setSelectedDigisac((prev) => [...prev, item]);
    }
  };

  const handleSelectEmailB2B = (item) => {
    const exists = selectedEmailB2B.some((b) => b.Codigo === item.Codigo);
    if (!exists) {
      setSelectedEmailB2B((prev) => [...prev, item]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">{message}</p>

        {/* Exibição do total de clientes afetados */}
        <div className="mb-4">
          <strong>Total de Clientes Afetados:</strong> {totalClientesAfetados}
        </div>

        {/* Campos para cadastro de clientes */}
        {showClientFields && (
          <div className="mb-4 space-y-4">
            {/* Campo para Cliente Digisac */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-50">
                Cliente Digisac:
              </label>
              <div
                ref={digisacRef}
                className="relative mb-2 rounded border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedDigisac.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center rounded bg-blue-100 px-2 py-1 text-slate-900 dark:bg-blue-900 dark:text-slate-50"
                    >
                      <span className="mr-1">{item.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDigisac((prev) =>
                            prev.filter((d) => d.id !== item.id)
                          )
                        }
                        className="font-bold text-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="min-w-[80px] flex-1 bg-transparent text-slate-900 placeholder-gray-500 outline-none dark:text-slate-50 dark:placeholder-gray-400"
                    placeholder="Pesquisar Digisac..."
                    value={searchTermDigisac}
                    onChange={(e) => setSearchTermDigisac(e.target.value)}
                  />
                </div>
                {searchTermDigisac && searchResultsDigisac.length > 0 && (
                  <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                    {searchResultsDigisac.map((item) => {
                      const isSelected = selectedDigisac.some(
                        (d) => d.id === item.id
                      );
                      return (
                        <li
                          key={item.id}
                          onClick={() => handleSelectDigisac(item)}
                          className={`cursor-pointer p-2 text-slate-900 hover:bg-blue-100 dark:text-slate-50 dark:hover:bg-gray-700 ${
                            isSelected ? "bg-blue-200 dark:bg-blue-900" : ""
                          }`}
                        >
                          {item.name}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
            {/* Campo para Cliente E-mail B2B */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-50">
                Cliente E-mail B2B:
              </label>
              <div
                ref={emailB2BRef}
                className="relative mb-2 rounded border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedEmailB2B.map((item) => (
                    <div
                      key={item.Codigo}
                      className="flex items-center rounded bg-blue-100 px-2 py-1 text-slate-900 dark:bg-blue-900 dark:text-slate-50"
                    >
                      <span className="mr-1">{item.Nome}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedEmailB2B((prev) =>
                            prev.filter((b) => b.Codigo !== item.Codigo)
                          )
                        }
                        className="font-bold text-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="min-w-[80px] flex-1 bg-transparent text-slate-900 placeholder-gray-500 outline-none dark:text-slate-50 dark:placeholder-gray-400"
                    placeholder="Pesquisar E-mail B2B..."
                    value={searchTermEmailB2B}
                    onChange={(e) => setSearchTermEmailB2B(e.target.value)}
                  />
                </div>
                {searchTermEmailB2B && searchResultsEmailB2B.length > 0 && (
                  <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                    {searchResultsEmailB2B.map((item) => {
                      const isSelected = selectedEmailB2B.some(
                        (b) => b.Codigo === item.Codigo
                      );
                      return (
                        <li
                          key={item.Codigo}
                          onClick={() => handleSelectEmailB2B(item)}
                          className={`cursor-pointer p-2 text-slate-900 hover:bg-blue-100 dark:text-slate-50 dark:hover:bg-gray-700 ${
                            isSelected ? "bg-blue-200 dark:bg-blue-900" : ""
                          }`}
                        >
                          {item.Nome}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleNo}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500"
          >
            Não
          </button>
          <button
            onClick={handleYes}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500"
          >
            Sim
          </button>
          <button
            onClick={handleCadastrarClientes}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
          >
            Cadastrar Clientes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NocApprovalModal;
