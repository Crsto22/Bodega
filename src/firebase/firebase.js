import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Autenticación
import { getFirestore } from "firebase/firestore"; // Firestore

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBurvPX5zajWNirsliPD2QIheRvxq7EXxc",
  authDomain: "bodega-54c10.firebaseapp.com",
  projectId: "bodega-54c10",
  storageBucket: "bodega-54c10.appspot.com",
  messagingSenderId: "1007463717821",
  appId: "1:1007463717821:web:30a35ab812a7ff81dd50d4",
  measurementId: "G-CEF09511TH",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig); // Instancia de la aplicación de Firebase
const auth = getAuth(app); // Inicializar autenticación
const db = getFirestore(app); // Inicializar Firestore

export { app, auth, db }; // Exportar la instancia de la app, autenticación y Firestore