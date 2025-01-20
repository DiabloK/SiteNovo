import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { auth, db } from "@/utils/firebase"; // Importa auth e db do firebase.js
import NotFoundPage from "@/routes/NotFoundPage";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import LoginPage from "@/routes/login/LoginPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Cadastro from "@/routes/dashboard/Cadastro/Cadastro";
import ErrorContatosPage from "@/routes/ClientesErrors/ErrorContatosPage"; // Importa a página
import VisualizacaoPage from "@/routes/visualizacao/protocolo"; // Página de visualização
import Usuario from "@/routes/usuario/usuario";
import CadastrarUsuario from "@/routes/usuario/cadastrousuario";

import { doc, getDoc } from "firebase/firestore"; // Importa Firestore

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [initialized, setInitialized] = useState(false); // Estado de inicialização
  const [userRole, setUserRole] = useState(null); // Papel do usuário

  useEffect(() => {
    const initializeAuth = () => {
      console.log("Iniciando autenticação...");
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            if (user.emailVerified) {
              console.log("Usuário autenticado com email verificado:", user.email);

              const userDoc = await getDoc(doc(db, "users", user.uid));
              if (userDoc.exists()) {
                const role = userDoc.data().privilegio;
                setUserRole(role);
                localStorage.setItem("userRole", role);
                localStorage.setItem("userEmail", user.email);
                localStorage.setItem("userEmailVerified", true);
                setIsAuthenticated(true);
              } else {
                console.error("Documento do usuário não encontrado.");
                setIsAuthenticated(false);
              }
            } else {
              console.warn("Usuário autenticado, mas email não verificado.");
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            setIsAuthenticated(false);
          }
        } else {
          console.log("Nenhum usuário autenticado.");
          setIsAuthenticated(false);
          localStorage.clear();
        }
        setLoading(false);
        setInitialized(true); // Define inicialização como concluída
      });

      return unsubscribe; // Remove o listener ao desmontar o componente
    };

    initializeAuth(); // Inicializa a autenticação
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
          loading={loading}
          initialized={initialized}
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
              loading={loading}
              initialized={initialized}
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
              loading={loading}
              initialized={initialized}
              requiredRoles={["admin", "editor", "eng"]}
            >
              <Cadastro />
            </ProtectedRoute>
          ),
        },
        {
          path: "/ClientesErrors",
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
              <ErrorContatosPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "visualizacao/:protocolo",
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              initialized={initialized}
            >
              <VisualizacaoPage />
            </ProtectedRoute>
          ),
        },{
          path: "/Usuario", // Rota para a página de informações do usuário
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              initialized={initialized}
            >
              <Usuario />
            </ProtectedRoute>
          ),
        },
        {
          path: "/UsuarioCadastrar", // Rota para a página de cadastro de usuários
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              initialized={initialized}
              requiredRoles={["admin"]} // Somente admin pode acessar
            >
              <CadastrarUsuario />
            </ProtectedRoute>
          ),
        },

      ],
    },
    // Adiciona a rota para capturar páginas não encontradas
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);
  return (
    <ThemeProvider storageKey="theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
