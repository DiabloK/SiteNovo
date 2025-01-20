import { useState, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/utils/firebase"; // Firebase Auth
import { toast } from "react-toastify";

const Usuario = () => {
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    privilegios: [],
  });

  const handleResetPassword = async () => {
    // Exibe uma notificação de carregamento
    const loadingToastId = toast.loading("Enviando e-mail de redefinição...");
  
    try {
      await sendPasswordResetEmail(auth, userData.email);
  
      // Atualiza o toast para "sucesso"
      toast.update(loadingToastId, {
        render: "E-mail de redefinição enviado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        theme: "dark",
      });
    } catch (error) {
      console.error("Erro ao enviar redefinição de senha:", error);
  
      // Atualiza o toast para "erro"
      toast.update(loadingToastId, {
        render: "Erro ao enviar redefinição. Tente novamente.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        theme: "dark",
      });
    }
  };
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");

    if (role && email) {
      setUserData({
        nome: "Nome do Usuário", // Substituir pelo nome real do Firestore, se necessário
        email: email,
        privilegios: [role],
      });
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-4xl rounded-lg bg-white p-10 shadow-lg dark:bg-gray-800">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Informações do Usuário
        </h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">
              Nome
            </h2>
            <p className="text-lg text-gray-800 dark:text-gray-200">
              {userData.nome || "Usuário não identificado"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">
              E-mail
            </h2>
            <p className="text-lg text-gray-800 dark:text-gray-200">
              {userData.email || "E-mail não encontrado"}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">
              Privilégios
            </h2>
            <ul className="list-disc pl-6 text-lg text-gray-800 dark:text-gray-200">
              {userData.privilegios.map((privilegio, index) => (
                <li key={index}>{privilegio}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleResetPassword}
            className="mt-6 block w-full rounded bg-blue-500 py-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Redefinir Senha
          </button>
        </div>
      </div>
    </div>
  );
};

export default Usuario;
