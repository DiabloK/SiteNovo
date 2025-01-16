// Importa as funções necessárias do SDK da Web
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getDatabase } from "firebase/database";   // Realtime Database (se necessário)

// Configurações do Firebase Web SDK (você forneceu isso no exemplo)
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

// Inicializa Firestore (caso esteja usando Firestore)
export const db = getFirestore(app);

// Inicializa Realtime Database (caso esteja usando Realtime Database)
export const realtimeDb = getDatabase(app);
