import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase (substitua pelas suas credenciais)
const firebaseConfig = {
  apiKey: "AIzaSyARvqk1jNs9hqVRApmwBTPEoNyW4cBc12M",
  authDomain: "paymiua.firebaseapp.com",
  projectId: "paymiua",
  storageBucket: "paymiua.appspot.com",
  messagingSenderId: "1046107327760",
  appId: "1:1046107327760:web:efd71a1f2cd833ea832995",
  measurementId: "G-X6QTF5Z6YG"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o Firestore
export const db = getFirestore(app);

