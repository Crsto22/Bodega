import React, { createContext, useContext, useEffect, useState } from "react";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { app } from "../firebase/firebase"; // Importar la instancia de Firebase

// Crear el contexto
const ProveedorContext = createContext();

// Hook personalizado para usar el contexto
export function useProveedor() {
  return useContext(ProveedorContext);
}

// Proveedor del contexto
export function ProveedorProvider({ children }) {
  const [proveedores, setProveedores] = useState([]); // Estado para almacenar los proveedores
  const [loading, setLoading] = useState(true); // Estado de carga
  const db = getFirestore(app); // Obtener la instancia de Firestore

  // Obtener proveedores en tiempo real
  useEffect(() => {
    const proveedoresCollection = collection(db, "proveedores"); // Referencia a la colección "proveedores"

    // Suscribirse a cambios en la colección
    const unsubscribe = onSnapshot(proveedoresCollection, (snapshot) => {
      const proveedoresData = snapshot.docs.map((doc) => ({
        id: doc.id, // ID del documento
        ...doc.data(), // Datos del proveedor
      }));
      setProveedores(proveedoresData); // Actualizar el estado con los proveedores
      setLoading(false); // Desactivar el estado de carga
    });

    return unsubscribe; // Limpiar la suscripción al desmontar el componente
  }, [db]);

  // Función para agregar un proveedor
  const addProveedor = async (proveedor) => {
    try {
      const proveedoresCollection = collection(db, "proveedores");
      await addDoc(proveedoresCollection, {
        ...proveedor,
        fecha_creacion: new Date(), // Agregar la fecha de creación automáticamente
      });
      console.log("Proveedor agregado correctamente.");
    } catch (error) {
      console.error("Error al agregar el proveedor:", error);
    }
  };

  // Función para editar un proveedor
  const editProveedor = async (id, updatedProveedor) => {
    try {
      const proveedorDoc = doc(db, "proveedores", id); // Referencia al documento del proveedor
      await updateDoc(proveedorDoc, updatedProveedor); // Actualizar el proveedor en Firestore
      console.log("Proveedor actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el proveedor:", error);
    }
  };

  // Función para eliminar un proveedor
  const deleteProveedor = async (id) => {
    try {
      const proveedorDoc = doc(db, "proveedores", id); // Referencia al documento del proveedor
      await deleteDoc(proveedorDoc); // Eliminar el proveedor de Firestore
      console.log("Proveedor eliminado correctamente.");

      // Actualizar el estado local eliminando el proveedor
      setProveedores((prevProveedores) => prevProveedores.filter((proveedor) => proveedor.id !== id));
    } catch (error) {
      console.error("Error al eliminar el proveedor:", error);
    }
  };

  // Valor del contexto
  const value = {
    proveedores, // Lista de proveedores
    loading, // Estado de carga
    addProveedor, // Función para agregar un proveedor
    editProveedor, // Función para editar un proveedor
    deleteProveedor, // Función para eliminar un proveedor
  };

  return (
    <ProveedorContext.Provider value={value}>
      {children}
    </ProveedorContext.Provider>
  );
}