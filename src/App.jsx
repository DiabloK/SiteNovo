import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { auth, db } from "@/utils/firebase";
import NotFoundPage from "@/routes/NotFoundPage";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import LoginPage from "@/routes/login/LoginPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Cadastro from "@/routes/dashboard/Cadastro/Cadastro";
import ErrorContatosPage from "@/routes/ClientesErrors/ErrorContatosPage";
import VisualizacaoPage from "@/routes/visualizacao/protocolo";
import Usuario from "@/routes/usuario/usuario";
import CadastrarUsuario from "@/routes/usuario/cadastrousuario";
import EmailCriar from "@/routes/Templantes/Email/Criar";
import Emaileditor from "@/routes/Templantes/Email/editor";
import Mensagemeditor from "@/routes/Templantes/mensagem/editor";
import MensagemCriar from "@/routes/Templantes/mensagem/criadormensagem";
import { doc, getDoc } from "firebase/firestore";

// Novos imports para os gráficos:
import Maingraficos from "@/routes/graficos/Maingraficos";
import Grafico1 from "@/routes/Graficos/pages/Dex";
import Grafico2 from "@/routes/Graficos/pages/GeralIndividual";
import Grafico3 from "@/routes/Graficos/pages/Dex";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [userRole, setUserRole] = useState(null);

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
        setInitialized(true);
      });

      return unsubscribe;
    };

    initializeAuth();
  }, []);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage setIsAuthenticated={setIsAuthenticated} />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
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
          path: "ClientesErrors",
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
              <ErrorContatosPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "visualizacao/:protocolo",
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
              <VisualizacaoPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "Usuario",
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
              <Usuario />
            </ProtectedRoute>
          ),
        },
        {
          path: "UsuarioCadastrar",
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              initialized={initialized}
              requiredRoles={["admin"]}
            >
              <CadastrarUsuario />
            </ProtectedRoute>
          ),
        },
        {
          path: "Templates/Email/Criar",
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              initialized={initialized}
              requiredRoles={["admin"]}
            >
              <EmailCriar />
            </ProtectedRoute>
          ),
        },
        {
          path: "Templates/Email/Editar",
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              initialized={initialized}
              requiredRoles={["admin"]}
            >
              <Emaileditor />
            </ProtectedRoute>
          ),
        },
        {
          path: "Templates/WhatsApp/Editar",
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              initialized={initialized}
              requiredRoles={["admin"]}
            >
              <Mensagemeditor />
            </ProtectedRoute>
          ),
        },
        {
          path: "Templates/WhatsApp/Criar",
          element: (
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              loading={loading}
              initialized={initialized}
              requiredRoles={["admin"]}
            >
              <MensagemCriar />
            </ProtectedRoute>
          ),
        },
        // Rota para gráficos (pasta graficos)
        {
          path: "Graficos",
          element: (
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
              <Maingraficos />
            </ProtectedRoute>
          ),
          children: [
            {
              path: "Dex",
              element: (
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
                  <Grafico1 />
                </ProtectedRoute>
              ),
            },
            {
              path: "Geral",
              element: (
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
                  <Grafico2 />
                </ProtectedRoute>
              ),
            },
            {
              path: "3",
              element: (
                <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading} initialized={initialized}>
                  <Grafico3 />
                </ProtectedRoute>
              ),
            },
          ],
        },
      ],
    },
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
