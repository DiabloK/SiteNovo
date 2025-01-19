import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore"; // Importa Firestore
import { db } from "@/utils/firebase"; // Importa a instância do Firestore
import { RotateCw } from "lucide-react"; // Ícones

const ErrorContatosPage = () => {
    const [data, setData] = useState([]); // Estado para armazenar os dados
    const [filteredData, setFilteredData] = useState([]); // Estado para dados filtrados
    const [search, setSearch] = useState(""); // Estado para o campo de pesquisa
    const [loading, setLoading] = useState(true); // Estado para carregamento

    // Função para buscar os dados do Firestore
    const fetchErrorContatos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "ErrorContatos")); // Acessa a coleção "ErrorContatos"
            const contatos = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            console.log("Dados recuperados do Firestore:", contatos); // Log dos dados recuperados

            setData(contatos); // Define os dados no estado original
            setFilteredData(contatos); // Define os dados filtrados inicialmente
            setLoading(false); // Finaliza o carregamento
        } catch (error) {
            console.error("Erro ao buscar os dados do Firestore:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchErrorContatos(); // Busca os dados ao carregar o componente
    }, []);

    // Função para filtrar os resultados com base na pesquisa
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        const filtered = data.filter(
            (item) =>
                item.Nome?.toLowerCase().includes(value) || // Verifica Nome
                String(item.Codigo).includes(value) // Verifica Código
        );
        setFilteredData(filtered);
    };

    if (loading) {
        return <p>Carregando...</p>; // Exibe mensagem enquanto carrega
    }

    return (
        <div className="card">
            <div className="card-header flex justify-between items-center">
                <p className="card-title">Contatos com Erros</p>
                {/* Campo de Pesquisa */}
                <input
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    placeholder="Pesquisar por Nome ou Código"
                    className="w-1/3 rounded-lg border border-gray-300 px-4 py-2 text-sm"
                />
            </div>
            <div className="card-body p-0">
                <div className="relative h-[500px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                    <table className="table">
                        <thead className="table-header">
                            <tr className="table-row">
                                <th className="table-head text-center">#</th>
                                <th className="table-head text-center">Nome</th>
                                <th className="table-head text-center">Código</th>
                                <th className="table-head text-center">E-mail</th>
                                <th className="table-head text-center">WhatsApp</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {filteredData.map((item, index) => (
                                <tr key={item.id} className="table-row align-middle">
                                    {/* Índice da linha */}
                                    <td className="table-cell text-center">{index + 1}</td>

                                    {/* Nome */}
                                    <td className="table-cell text-center">{item.Nome || "—"}</td>

                                    {/* Código */}
                                    <td className="table-cell text-center">{item.Codigo || "—"}</td>

                                    {/* E-mail */}
                                    <td className="table-cell text-center">
                                        <div className="flex justify-center items-center gap-x-2">
                                            {item["E-mail"] ? (
                                                <span className="text-green-500">✅</span>
                                            ) : (
                                                <>
                                                    <span className="text-red-500">❌</span>
                                                    <button className="text-blue-500 dark:text-blue-600">
                                                        <RotateCw size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>

                                    {/* WhatsApp */}
                                    <td className="table-cell text-center">
                                        <div className="flex justify-center items-center gap-x-2">
                                            {item.Whatszap ? (
                                                <span className="text-green-500">✅</span>
                                            ) : (
                                                <>
                                                    <span className="text-red-500">❌</span>
                                                    <button className="text-blue-500 dark:text-blue-600">
                                                        <RotateCw size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ErrorContatosPage;
