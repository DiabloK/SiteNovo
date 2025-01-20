import { useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Adicionado
import { toast } from "react-toastify";

const CadastrarUsuario = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    privilegios: "",
  });

  const privilegiosDisponiveis = [
    { value: "admin", label: "Admin" },
    { value: "editor", label: "Monitoramento" },
    { value: "eng", label: "Engenharia" },
    { value: "ler", label: "CSA" },
  ];

  const db = getFirestore();
  const auth = getAuth(); // Instância do Firebase Auth

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrivilegioChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      privilegios: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.senha || !formData.privilegios) {
      toast.error("Preencha todos os campos obrigatórios!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    // Exibe o toast de carregamento
    const loadingToastId = toast.loading("Cadastrando usuário...");

    try {
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha
      );

      const user = userCredential.user; // Usuário criado no Authentication

      // Salva os dados adicionais no Firestore
      await setDoc(doc(db, "users", user.uid), {
        nome: formData.nome,
        email: formData.email,
        privilegios: formData.privilegios,
        criadoEm: new Date(),
      });

      // Atualiza o toast para "sucesso"
      toast.update(loadingToastId, {
        render: "Usuário cadastrado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        theme: "dark",
      });

      // Limpa o formulário após o sucesso
      setFormData({ nome: "", email: "", senha: "", privilegios: "" });
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);

      // Atualiza o toast para "erro"
      toast.update(loadingToastId, {
        render: "Erro ao cadastrar usuário. Tente novamente.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        theme: "dark",
      });
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div className="w-full max-w-4xl rounded-lg bg-white p-10 shadow-lg dark:bg-gray-800">
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
        Cadastrar Usuário
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Nome */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Nome
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="mt-2 w-full rounded border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* E-mail */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-2 w-full rounded border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Senha */}
        <div className="flex flex-col">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Senha
          </label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            className="mt-2 w-full rounded border border-gray-300 p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* Privilégios */}
        <div>
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Privilégio
          </label>
          <div className="mt-4 flex flex-wrap gap-4">
            {privilegiosDisponiveis.map(({ value, label }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center space-x-2 text-gray-700 dark:text-gray-300"
              >
                <input
                  type="radio"
                  value={value}
                  checked={formData.privilegios === value}
                  onChange={() => handlePrivilegioChange(value)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Botão de envio */}
        <button
          type="submit"
          className="block w-full rounded bg-blue-500 p-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Cadastrar
        </button>
      </form>
    </div>
  </div>
);
};

export default CadastrarUsuario;