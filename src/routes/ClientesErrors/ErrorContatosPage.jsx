import { useEffect, useState } from "react";
import { RotateCw, CheckIcon, XIcon } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import EmailReenviarModal from "@/modal/EmailReenviarModal";
import WhatsAppReenviarModal from "@/modal/WhatsAppReenviarModal";

const ErrorContatosPage = () => {
    const [data, setData] = useState([]); // Armazena os contatos
    const [filteredData, setFilteredData] = useState([]); // Armazena os contatos filtrados
    const [search, setSearch] = useState(""); // Estado para a pesquisa
    const [loading, setLoading] = useState(true); // Estado para carregamento
    const [selectedContact, setSelectedContact] = useState(null); // Contato selecionado
    const [showEmailModal, setShowEmailModal] = useState(false); // Estado para abrir modal de e-mail
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false); // Estado para abrir modal de WhatsApp

    // Busca os contatos com erro no Firebase
    useEffect(() => {
        const fetchErrorContatos = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "ErrorContatos"));
                const contatos = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setData(contatos);
                setFilteredData(contatos);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar os dados do Firestore:", error);
                setLoading(false);
            }
        };

        fetchErrorContatos();
    }, []);

    // Filtra os contatos com base na pesquisa
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        setFilteredData(
            data.filter(
                (item) =>
                    item.Nome?.toLowerCase().includes(value) || String(item.Codigo).includes(value)
            )
        );
    };

    // Função para abrir o modal de reenviar e-mail
    const handleReenviarEmail = (contact) => {
        setSelectedContact(contact);
        setShowEmailModal(true);
    };

    // Função para abrir o modal de reenviar WhatsApp
    const handleReenviarWhatsApp = (contact) => {
        if (!contact || !contact.Celular) {
            console.error("Contato inválido para reenvio de WhatsApp:", contact);
            return;
        }
        setSelectedContact(contact);
        setShowWhatsAppModal(true);
    };
    
    if (loading) {
        return <p>Carregando...</p>;
    }

    return (
        <div className="card">
            <div className="card-header flex items-center justify-between p-4">
                <p className="card-title">Contatos com Erros</p>
                <input
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    placeholder="Pesquisar por Nome ou Código"
                    className="w-1/3 rounded-lg border border-gray-300 px-4 py-2 text-sm text-slate-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-slate-50 dark:placeholder-gray-500 dark:focus:ring-blue-400"
                />
            </div>

            <div className="card-body p-0">
                <div className="relative h-[500px] w-full overflow-auto">
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
                                    <td className="table-cell text-center">{index + 1}</td>
                                    <td className="table-cell text-center">{item.Nome || "—"}</td>
                                    <td className="table-cell text-center">{item.Codigo || "—"}</td>

                                    {/* E-mail */}
                                    <td className="table-cell text-center">
                                        <div className="flex justify-center items-center gap-x-2">
                                            {item.email ? (
                                                <CheckIcon size={18} className="text-green-500" />
                                            ) : (
                                                <>
                                                    <XIcon size={18} className="text-red-500" />
                                                    <button
                                                        className="text-blue-500 hover:text-blue-600"
                                                        onClick={() => handleReenviarEmail(item)}
                                                    >
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
                                                <CheckIcon size={18} className="text-green-500" />
                                            ) : (
                                                <>
                                                    <XIcon size={18} className="text-red-500" />
                                                    <button
                                                        className="text-blue-500 hover:text-blue-600"
                                                        onClick={() => handleReenviarWhatsApp(item)}
                                                    >
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

            {/* Modais de reenvio */}
            <EmailReenviarModal
                isVisible={showEmailModal} // 🔥 Adicionado `isVisible`
                contact={selectedContact}
                onClose={() => setShowEmailModal(false)}
            />

            <WhatsAppReenviarModal
                isVisible={showWhatsAppModal} // 🔥 Adicionado `isVisible`
                contact={selectedContact}
                onClose={() => setShowWhatsAppModal(false)}
            />
        </div>
    );
};

export default ErrorContatosPage;
