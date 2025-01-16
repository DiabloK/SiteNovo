import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useState } from "react";

import { ThemeProvider } from "@/contexts/theme-context";

import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import LoginPage from "@/routes/login/LoginPage";
import ProtectedRoute from "@/routes/ProtectedRoute";

// Importando os componentes das páginas
import Cadastro from "@/routes/dashboard/cadastro/Cadastro";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const router = createBrowserRouter([
        {
            path: "/login",
            element: <LoginPage setIsAuthenticated={setIsAuthenticated} />,
        },
        {
            path: "/",
            element: (
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Layout />
                </ProtectedRoute>
            ),
            children: [
                {
                    index: true,
                    element: <DashboardPage />, // Página inicial (Dashboard)
                },
                {
                    path: "Cadastro",
                    element: <Cadastro />, // Agora renderiza o componente real de Cadastro
                },
                {
                    path: "reports",
                    element: <h1 className="title">Reports</h1>,
                },
                {
                    path: "customers",
                    element: <h1 className="title">Customers</h1>,
                },
                {
                    path: "new-customer",
                    element: <h1 className="title">New Customer</h1>,
                },
                {
                    path: "verified-customers",
                    element: <h1 className="title">Verified Customers</h1>,
                },
                {
                    path: "products",
                    element: <h1 className="title">Products</h1>,
                },
                {
                    path: "new-product",
                    element: <h1 className="title">New Product</h1>,
                },
                {
                    path: "inventory",
                    element: <h1 className="title">Inventory</h1>,
                },
                {
                    path: "settings",
                    element: <h1 className="title">Settings</h1>,
                },
            ],
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
