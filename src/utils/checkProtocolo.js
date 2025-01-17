import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // Ajuste o caminho para o arquivo firebase.js

async function checkProtocolo(protocolo) {
    try {
        console.log("Protocolo recebido:", protocolo);

        // Certifique-se de que o protocolo é uma string
        if (!protocolo || typeof protocolo !== "string") {
            protocolo = protocolo.toString();
        }

        // Referência ao documento no Firestore
        const docRef = doc(db, "protocolos", protocolo);
        console.log("Documento referência:", docRef.path);

        // Obter o documento
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Documento encontrado:", docSnap.data());
            return true;
        } else {
            console.log("Documento não encontrado.");
            return false;
        }
    } catch (error) {
        console.error("Erro ao verificar protocolo:", error);
        throw error;
    }
}

export default checkProtocolo;
