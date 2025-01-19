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
import { Player } from "@lottiefiles/react-lottie-player";
import loginAnimation from "@/assets/login-animation.json";
import forgotPasswordAnimation from "@/assets/forget.json";
import logoDark from "@/assets/logo-dark.png";

const LoginPage = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar senha
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert("Por favor, verifique seu email antes de continuar.");
        return;
      }

      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login. Verifique as credenciais.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Um e-mail de redefinição de senha foi enviado para: " + email);
      setShowResetPassword(false);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      alert("Erro ao redefinir senha. Tente novamente mais tarde.");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundColor: "#0080FF",
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center bg-white shadow-lg rounded-lg p-8 md:p-12 max-w-5xl">
        {/* Coluna Esquerda: Formulário de Login */}
        <div className="w-full md:w-3/5">
          <div className="text-center mb-6">
            <img
              src={logoDark}
              alt="Logo"
              className="mx-auto w-24 h-auto"
            />
            <h2 className="text-3xl font-bold text-gray-800">Bem-vindo</h2>
            <p className="text-gray-600">
              {showResetPassword
                ? "Digite seu e-mail para redefinir sua senha"
                : "Faça login na sua conta"}
            </p>
          </div>
          {showResetPassword ? (
            <form onSubmit={handleResetPassword}>
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
                Enviar e-mail de redefinição
              </button>
              <button
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="w-full mt-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300"
              >
                Voltar para o login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
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
              <div className="mb-4 relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <div className="relative">
                  {/* Campo de senha */}
                  <input
                    type={showPassword ? "text" : "password"} // Alterna entre texto e senha
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-12"
                    placeholder="Digite sua senha"
                  />
                  {/* Botão de "mostrar/ocultar senha" */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} // Alterna o estado
                    className="absolute inset-y-0 right-3 flex items-center"
                    style={{ zIndex: 10 }} // Garante que o botão fique clicável
                  >
                    <img
                      src={showPassword ? "/eye_slash.svg" : "/eye.svg"} // Ícone alternado
                      alt="Mostrar/Ocultar senha"
                      className="h-5 w-5 text-gray-500 hover:text-blue-500"
                    />
                  </button>
                </div>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <div>
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
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-blue-600 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Entrar
              </button>
            </form>
          )}
        </div>

        {/* Coluna Direita: Animação */}
        <div className="w-full md:w-2/5 flex items-center justify-center mt-6 md:mt-0">
          <Player
            autoplay
            loop
            src={showResetPassword ? forgotPasswordAnimation : loginAnimation} // Troca a animação
            style={{ height: "300px", width: "300px" }} // Tamanho ajustado
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
