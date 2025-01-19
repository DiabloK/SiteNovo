import React from "react";
import { Player } from "@lottiefiles/react-lottie-player"; // Biblioteca Lottie
import loginAnimation from "@/assets/404.json";
const NotFoundPage = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                textAlign: "center",
                backgroundColor: "#f9f9f9",
            }}
        >
            <Player
                autoplay
                loop
                src={loginAnimation} // URL da animação do LottieFiles
                style={{ height: "300px", width: "300px" }} // Tamanho grande para destaque
            />
            <h1 style={{ fontSize: "2rem", marginTop: "20px", color: "#333" }}>
                Página não encontrada
            </h1>
            <p style={{ fontSize: "1rem", color: "#555" }}>
                Opa! Parece que você tentou acessar uma página que não existe.
            </p>
            <a
                href="/"
                style={{
                    marginTop: "20px",
                    fontSize: "1rem",
                    textDecoration: "none",
                    padding: "10px 20px",
                    color: "#fff",
                    backgroundColor: "#007bff",
                    borderRadius: "5px",
                }}
            >
                Voltar para a página inicial
            </a>
        </div>
    );
};

export default NotFoundPage;
