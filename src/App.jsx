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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [initialized, setInitialized] = useState(false); // Estado de inicialização
  const [userRole, setUserRole] = useState(null); // Papel do usuário

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true); // Ativa o estado de carregamento

      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            // Verifica se o email foi verificado
            if (user.emailVerified) {
              console.log("Usuário autenticado com email verificado:", user.email);

              // Recupera o papel do usuário do Firestore
              const userDoc = await getDoc(doc(db, "users", user.uid));
              if (userDoc.exists()) {
                const role = userDoc.data().privilegio;

                // Atualiza o papel do usuário e o estado de autenticação
                setUserRole(role);
                localStorage.setItem("userRole", role);
                localStorage.setItem("userEmail", user.email);
                localStorage.setItem("userEmailVerified", true);
                setIsAuthenticated(true);
              } else {
                console.error("Documento do usuário não encontrado.");
                setUserRole(null);
                setIsAuthenticated(false);
              }
            } else {
              console.warn("Usuário autenticado, mas o email não foi verificado!");
              setUserRole(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            setUserRole(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("Nenhum usuário autenticado.");
          setUserRole(null);
          setIsAuthenticated(false);
          localStorage.removeItem("userRole");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userEmailVerified");
        }

        setLoading(false); // Finaliza o carregamento
        setInitialized(true); // Marca a inicialização como concluída
      });

      return () => unsubscribe(); // Remove o listener ao desmontar o componente
    };

    initializeAuth(); // Executa a inicialização
  }, []);
  

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage setIsAuthenticated={setIsAuthenticated} />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute
          isAuthenticated={isAuthenticated}
          loading={loading} // Passa o estado `loading` corretamente
          initialized={initialized} // Passa o estado `initialized` corretamente
        >
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading} // Passa o estado `loading` corretamente
              initialized={initialized} // Passa o estado `initialized` corretamente
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
              loading={loading} // Passa o estado `loading` corretamente
              initialized={initialized} // Passa o estado `initialized` corretamente
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
