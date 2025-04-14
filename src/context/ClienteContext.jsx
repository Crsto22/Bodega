import React, { createContext, useContext, useEffect, useState } from "react";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { app } from "../firebase/firebase"; // Importar la instancia de Firebase

// Crear el contexto
const ClienteContext = createContext();

// Hook personalizado para usar el contexto
export function useCliente() {
  return useContext(ClienteContext);
}

// Proveedor del contexto
export function ClienteProvider({ children }) {
  const [clientes, setClientes] = useState([]); // Estado para almacenar los clientes
  const [loading, setLoading] = useState(true); // Estado de carga
  const db = getFirestore(app); // Obtener la instancia de Firestore

  // Obtener clientes en tiempo real
  useEffect(() => {
    const clientesCollection = collection(db, "clientes"); // Referencia a la colección "clientes"

    // Suscribirse a cambios en la colección
    const unsubscribe = onSnapshot(clientesCollection, (snapshot) => {
      const clientesData = snapshot.docs.map((doc) => ({
        id: doc.id, // ID del documento
        ...doc.data(), // Datos del cliente
      }));
      setClientes(clientesData); // Actualizar el estado con los clientes
      setLoading(false); // Desactivar el estado de carga
    });

    return unsubscribe; // Limpiar la suscripción al desmontar el componente
  }, [db]);

  // Función para agregar un cliente
  const addCliente = async (cliente) => {
    try {
      const clientesCollection = collection(db, "clientes");
      await addDoc(clientesCollection, {
        ...cliente,
        fecha_creacion: new Date(), // Agregar la fecha de creación automáticamente
      });
      console.log("Cliente agregado correctamente.");
    } catch (error) {
      console.error("Error al agregar el cliente:", error);
    }
  };

  // Función para editar un cliente
  const editCliente = async (id, updatedCliente) => {
    try {
      const clienteDoc = doc(db, "clientes", id); // Referencia al documento del cliente
      await updateDoc(clienteDoc, updatedCliente); // Actualizar el cliente en Firestore
      console.log("Cliente actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
    }
  };

  // Función para eliminar un cliente
  const deleteCliente = async (id) => {
    try {
      const clienteDoc = doc(db, "clientes", id); // Referencia al documento del cliente
      await deleteDoc(clienteDoc); // Eliminar el cliente de Firestore
      console.log("Cliente eliminado correctamente.");

      // Actualizar el estado local eliminando el cliente
      setClientes((prevClientes) => prevClientes.filter((cliente) => cliente.id !== id));
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
    }
  };

  // Valor del contexto
  const value = {
    clientes, // Lista de clientes
    loading, // Estado de carga
    addCliente, // Función para agregar un cliente
    editCliente, // Función para editar un cliente
    deleteCliente, // Función para eliminar un cliente
  };

  return (
    <ClienteContext.Provider value={value}>
      {children}
    </ClienteContext.Provider>
  );
}