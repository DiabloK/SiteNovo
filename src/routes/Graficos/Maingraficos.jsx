import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const GraficosPage = () => {
    const chartOptions = [
        { label: "Dex", path: "/graficos/dex" },
        { label: "Gráfico Ano", path: "/graficos/ano" },
        { label: "Gráfico Individual", path: "/graficos/individual" },
        { label: "Gráfico Geral Individual", path: "/graficos/Geral" },
    ];

    return (
        <div className="flex min-h-screen flex-col items-center bg-transparent p-6">
            {/* Título centralizado */}
            <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">Opções de Gráficos</h1>

            {/* Contêiner de botões bem alinhado */}
            <div className="mb-6 flex flex-wrap justify-center gap-4">
                {chartOptions.map((option) => (
                    <NavLink
                        key={option.label}
                        to={option.path}
                        end
                        className={({ isActive }) =>
                            `rounded px-4 py-2 font-medium backdrop-blur-lg transition-all ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-900 hover:bg-blue-200 hover:text-black dark:text-gray-100"
                            }`
                        }
                    >
                        {option.label}
                    </NavLink>
                ))}
            </div>

            {/* Área onde os gráficos serão carregados */}
            <div className="w-full max-w-4xl bg-transparent p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default GraficosPage;
