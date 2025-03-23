import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase"; // Importar la autenticación de Firebase
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Firestore
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}

// Proveedor del contexto
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // Estado del usuario
  const [userData, setUserData] = useState(null); // Estado para los datos del usuario
  const [loading, setLoading] = useState(true); // Estado de carga

  // Función para iniciar sesión
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Función para cerrar sesión
  function logout() {
    return signOut(auth);
  }

  // Función para obtener los datos del usuario desde Firestore
  const fetchUserData = async (uid) => {
    const db = getFirestore();
    const userDocRef = doc(db, "usuarios", uid); // Referencia al documento del usuario

    try {
      const userDoc = await getDoc(userDocRef); // Obtener el documento

      if (userDoc.exists()) {
        const userDataFromFirestore = userDoc.data();

        // Verificar que el UID del documento coincida con el UID del usuario autenticado
        if (userDataFromFirestore.uid === uid) {
          setUserData(userDataFromFirestore); // Guardar los datos del usuario en el estado
        } else {
          console.error("El UID del documento no coincide con el UID del usuario autenticado.");
          setUserData(null); // Limpiar los datos del usuario
        }
      } else {
        console.log("No se encontraron datos del usuario.");
        setUserData(null); // Limpiar los datos del usuario
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      setUserData(null); // Limpiar los datos del usuario en caso de error
    }
  };

  // Observar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Actualizar el estado del usuario
        fetchUserData(user.uid); // Obtener los datos del usuario desde Firestore
      } else {
        setCurrentUser(null); // Limpiar el estado del usuario
        setUserData(null); // Limpiar los datos del usuario
      }
      setLoading(false); // Desactivar el estado de carga
    });

    return unsubscribe; // Limpiar la suscripción al desmontar el componente
  }, []);

  // Valor del contexto
  const value = {
    currentUser,
    userData, // Datos del usuario desde Firestore
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Renderizar hijos cuando no esté cargando */}
    </AuthContext.Provider>
  );
}