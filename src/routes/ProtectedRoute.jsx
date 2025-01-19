import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  isAuthenticated = false, // Valor padrão para evitar problemas
  requiredRoles = [],
  loading = true, // Valor padrão para evitar `undefined`
  initialized = false, // Valor padrão para evitar `undefined`
  children,
}) => {
  const userRole = localStorage.getItem("userRole");
  const userEmailVerified = localStorage.getItem("userEmailVerified") === "true";

  console.log("ProtectedRoute -> isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute -> loading:", loading);
  console.log("ProtectedRoute -> initialized:", initialized);
  console.log("ProtectedRoute -> userRole:", userRole);
  console.log("ProtectedRoute -> userEmailVerified:", userEmailVerified);

  // Exibe uma tela de carregamento enquanto a autenticação está sendo verificada
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  // Verifica se o usuário está autenticado e tem o email verificado
  if (!isAuthenticated || !userEmailVerified) {
    console.error("Usuário não autenticado ou email não verificado!");
    return <Navigate to="/login" />;
  }

  // Se há papéis requeridos e o papel do usuário não está entre os permitidos
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    console.warn(`Acesso negado: o papel '${userRole}' não é permitido.`);
    return <Navigate to="/no-access" />;
  }

  // Renderiza o conteúdo da rota se todas as condições forem atendidas
  return children;
};

export default ProtectedRoute;
