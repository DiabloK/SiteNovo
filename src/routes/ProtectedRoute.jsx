import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, requiredRoles = [], loading, children }) => {
  // Exibe uma tela de carregamento enquanto a autenticação está sendo verificada
  if (loading || isAuthenticated === null) {
    return <div>Carregando...</div>; // Substitua por um spinner, se preferir
  }

  // Caso o usuário não esteja autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Obtém o papel do usuário do localStorage
  const userRole = localStorage.getItem("userRole");

  // Caso o papel do usuário não esteja definido (falta de dados ou erro)
  if (!userRole) {
    console.error("Papel do usuário não encontrado!");
    return <Navigate to="/login" />;
  }

  // Caso o papel do usuário não esteja na lista de papéis permitidos
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    console.warn(`Acesso negado para o papel: ${userRole}`);
    return <Navigate to="/no-access" />;
  }

  // Renderiza a rota normalmente se todas as condições forem atendidas
  return children;
};

export default ProtectedRoute;
