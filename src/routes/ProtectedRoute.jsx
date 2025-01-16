import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    // Se o usuário não estiver autenticado, redireciona para a tela de login
    return <Navigate to="/login" />;
  }

  // Se estiver autenticado, renderiza a página normalmente
  return children;
};

export default ProtectedRoute;
