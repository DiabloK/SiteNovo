import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

// Importa o logotipo
import logoDark from "@/assets/logo-dark.png";

const LoginPage = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // Estado do "Lembrar-me"
  const [showResetPassword, setShowResetPassword] = useState(false); // Alterna entre login e redefinição de senha
  const navigate = useNavigate();
  const auth = getAuth();

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Define a persistência com base no estado "Lembrar-me"
      const persistence = rememberMe
        ? browserLocalPersistence // Persistência local (mantém o login após fechar o navegador)
        : browserSessionPersistence; // Persistência de sessão (mantém o login enquanto o navegador está aberto)
      await setPersistence(auth, persistence);

      // Faz o login no Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Login bem-sucedido
      setIsAuthenticated(true);

      // Aqui você pode buscar o nível hierárquico no Firebase Database
      console.log("Usuário autenticado:", userCredential.user);

      navigate("/"); // Redireciona para a página inicial
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
    }
  };

  // Função de redefinição de senha
  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Um e-mail de redefinição de senha foi enviado para: " + email);
      setShowResetPassword(false); // Volta para a tela de login
    } catch (error) {
      alert("Erro ao redefinir senha: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <img
            src={logoDark} // Usa a imagem importada corretamente
            alt="Logo"
            className="mx-auto mb-4 w-32 h-auto" // Define largura máxima como 8rem (w-32) e altura automática
          />

          <h2 className="text-3xl font-bold text-gray-800">Bem-vindo!</h2>
          <p className="text-gray-600">
            {showResetPassword
              ? "Insira seu e-mail para redefinir sua senha"
              : "Faça login na sua conta"}
          </p>
        </div>

        {showResetPassword ? (
          // Formulário de redefinição de senha
          <form onSubmit={handleResetPassword} className="mt-6">
            <div className="mb-4">
              <label
                htmlFor="resetEmail"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <input
                type="email"
                id="resetEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite seu e-mail"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Enviar E-mail de Redefinição
            </button>
            <button
              type="button"
              onClick={() => setShowResetPassword(false)}
              className="w-full mt-4 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Voltar para Login
            </button>
          </form>
        ) : (
          // Formulário de login
          <form onSubmit={handleLogin} className="mt-6">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite seu e-mail"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua senha"
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700">
                Lembrar-me
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Entrar
            </button>
          </form>
        )}

        {!showResetPassword && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="text-blue-600 hover:underline"
            >
              Esqueceu sua senha?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
