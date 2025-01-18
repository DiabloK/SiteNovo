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
    const [loading, setLoading] = useState(true); // Estado de carregamento
    const [userRole, setUserRole] = useState(null); // Papel do usuário
  
    useEffect(() => {
  
      // Listener para verificar o estado de autenticação
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
  
          // Tenta buscar o papel do usuário no Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const role = userDoc.data().privilegio; // Obtém o papel do usuário
              setUserRole(role);
              localStorage.setItem("userRole", role); // Armazena no localStorage para uso no ProtectedRoute
            } else {
              setUserRole(null); // Define como null se não existir
            }
          } catch (error) {
            console.error("Erro ao buscar o papel do usuário:", error);
            setUserRole(null); // Define como null em caso de erro
          }
  
          setIsAuthenticated(true); // Define o usuário como autenticado
        } else {
          console.log("Nenhum usuário autenticado.");
          setIsAuthenticated(false);
          setUserRole(null); // Remove o papel se não houver usuário
          localStorage.removeItem("userRole"); // Remove o papel do localStorage
        }
        setLoading(false); // Finaliza o carregamento
      });
  
      return () => unsubscribe();
    }, []);
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
                        <ProtectedRoute isAuthenticated={isAuthenticated}>
                            <DashboardPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "Cadastro",
                    element: (
                        <ProtectedRoute
                            isAuthenticated={isAuthenticated}
                            requiredRoles={["admin", "editor", "eng"]}
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
