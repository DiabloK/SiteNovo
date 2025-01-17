import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "@/utils/firebase"; // Importa o auth inicializado

const ProtectedRoute = ({ isAuthenticated, requiredRole, children }) => {
  if (!isAuthenticated) {
    // Se o usuário não estiver autenticado, redireciona para a tela de login
    return <Navigate to="/login" />;
  }

  // Aqui você pode adicionar a lógica de validação de role (papel) se necessário
  if (requiredRole) {
    const userRole = localStorage.getItem("userRole"); // Exemplo: recuperar o role de um cache local
    if (userRole !== requiredRole) {
      return <Navigate to="/no-access" />; // Redireciona para uma página de acesso negado
    }
  }

  return children; // Renderiza a rota protegida normalmente
};

export default ProtectedRoute;
