import { collection, doc, setDoc } from "firebase/firestore";

// Salva os dados no Firestore
export const salvarNoFirestore = async (db, dados, collectionName) => {
    const analiseRef = doc(collection(db, collectionName));
    await setDoc(analiseRef, dados);
};
