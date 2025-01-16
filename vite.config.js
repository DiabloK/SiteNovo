import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    base: "./", // Adicionado para corrigir os caminhos no build
    build: {
        outDir: "dist", // Diretório onde os arquivos do build serão gerados
    },
});
