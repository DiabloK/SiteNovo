import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase.js"; // Substitua pelo caminho correto do seu Firestore config

const migrateProtocoloToString = async () => {
    try {
        const protocolosRef = collection(db, "protocolos");
        const snapshot = await getDocs(protocolosRef);

        snapshot.forEach(async (docSnap) => {
            const data = docSnap.data();

            // Verifica se o campo "protocolo" existe e é um número
            if (typeof data.protocolo === "number") {
                const docRef = doc(db, "protocolos", docSnap.id);

                // Atualiza o campo "protocolo" para string
                await updateDoc(docRef, {
                    protocolo: data.protocolo.toString(), // Converte para string
                });

                console.log(`Documento ${docSnap.id} atualizado.`);
            }
        });

        console.log("Migração concluída.");
    } catch (error) {
        console.error("Erro ao migrar os documentos:", error);
    }
};

migrateProtocoloToString();
