import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronsLeft, Search, Sun, Moon } from "lucide-react";
import { db } from "@/utils/firebase"; // Firebase Config
import { doc, getDoc } from "firebase/firestore";
import imagemlogin from "@/assets/logo-dark.png";

export const Header = ({ collapsed, setCollapsed }) => {
    const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
    const [results, setResults] = useState([]); // Resultados da busca
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const [theme, setTheme] = useState("light"); // Estado para tema (claro/escuro)

    // Inicializa o tema a partir do localStorage
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "light";
        setTheme(storedTheme);
        document.documentElement.classList.add(storedTheme);
    }, []);

    // Alterna o tema e salva no localStorage
    const handleSetTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.remove(theme);
        document.documentElement.classList.add(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const handleSearch = async (term) => {
        if (!term) {
            setResults([]); // Limpa os resultados se o termo for vazio
            return;
        }

        setLoading(true);

        try {
            // Caminho para o documento específico
            const docRef = doc(db, "protocolos", term); // `term` é o ID do documento, como "1347056"
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Documento encontrado
                setResults([{ id: docSnap.id, ...docSnap.data() }]);
            } else {
                // Documento não encontrado
                setResults([]);
                console.log("Nenhum documento encontrado para:", term);
            }
        } catch (error) {
            console.error("Erro ao buscar documento no Firebase:", error);
        } finally {
            setLoading(false);
        }
    };



    // Debounce para limitar as consultas ao Firebase
    useEffect(() => {
        const debounce = setTimeout(() => {
            handleSearch(searchTerm); // Chama a busca após 300ms
        }, 300);

        return () => clearTimeout(debounce); // Limpa o timeout ao alterar o termo
    }, [searchTerm]);

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
                </button>

                {/* Barra de Pesquisa */}
                <div className="relative w-[300px]">
                    <div className="flex items-center border border-slate-300 rounded-md bg-white dark:bg-slate-800 dark:border-slate-600">
                        <Search size={20} className="text-slate-400 mx-2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar..."
                            className="flex-1 py-2 px-1 text-sm text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {/* Indicador de Carregamento */}
                    {loading && (
                        <p className="absolute top-full mt-1 text-sm text-slate-400">
                            Carregando...
                        </p>
                    )}

                    {/* Resultados da Pesquisa */}
                    {!loading && results.length === 0 && searchTerm && (
                        <p className="absolute top-full mt-1 text-sm text-red-500">
                            Nenhum resultado encontrado.
                        </p>
                    )}

                    {results.length > 0 && (
                        <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
                            {results.map((protocol) => (
                                <li
                                    key={protocol.id}
                                    className="cursor-pointer py-2 px-4 text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-700"
                                    onClick={() =>
                                        (window.location.href = `/visualizacao/${protocol.protocolo}`)
                                    }
                                >
                                    {protocol.protocolo} {/* Exibe o campo "protocolo" */}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-x-3">
                <button className="btn-ghost size-10" onClick={handleSetTheme}>
                    {theme === "light" ? (
                        <Sun size={20} className="text-yellow-500" />
                    ) : (
                        <Moon size={20} className="text-blue-500" />
                    )}
                </button>
                <button className="size-10 overflow-hidden rounded-full">
                    <img src={imagemlogin} alt="profile" className="size-full object-cover" />
                </button>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
