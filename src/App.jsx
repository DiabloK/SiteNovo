import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { auth, db } from "@/utils/firebase"; // Importa auth e db do firebase.js

import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import LoginPage from "@/routes/login/LoginPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Cadastro from "@/routes/dashboard/Cadastro/Cadastro";

import { doc, getDoc } from "firebase/firestore"; // Importa Firestore

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Função para buscar o papel do usuário no Firestore
    const fetchUserRole = async (user) => {
        if (!user) return;

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid)); // Busca documento do Firestore
            if (userDoc.exists()) {
                setUserRole(userDoc.data().role); // Define o papel
            } else {
                setUserRole("comum"); // Papel padrão
            }
        } catch (error) {
            console.error("Erro ao buscar nível hierárquico:", error);
        }
    };

    // Monitora a autenticação e busca o papel do usuário
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setIsAuthenticated(!!user);
            if (user) {
                await fetchUserRole(user);
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div>Carregando...</div>;
    }

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
                    element: (
                        <ProtectedRoute
                            isAuthenticated={isAuthenticated}
                            requiredRole="comum"
                        >
                            <DashboardPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "Cadastro",
                    element: (
                        <ProtectedRoute
                            isAuthenticated={isAuthenticated}
                            requiredRole="regional_cliente"
                        >
                            <Cadastro />
                        </ProtectedRoute>
                    ),
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
