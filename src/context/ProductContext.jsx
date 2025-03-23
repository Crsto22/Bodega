import React, { createContext, useContext, useEffect, useState } from "react";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { app } from "../firebase/firebase"; // Importar la instancia de Firebase

// Crear el contexto
const ProductContext = createContext();

// Hook personalizado para usar el contexto
export function useProduct() {
  return useContext(ProductContext);
}

// Proveedor del contexto
export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]); // Estado para almacenar los productos
  const [loading, setLoading] = useState(true); // Estado de carga
  const db = getFirestore(app); // Obtener la instancia de Firestore

  // Obtener productos en tiempo real
  useEffect(() => {
    const productsCollection = collection(db, "productos"); // Referencia a la colección "productos"

    // Suscribirse a cambios en la colección
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id, // ID del documento
        ...doc.data(), // Datos del producto
      }));
      setProducts(productsData); // Actualizar el estado con los productos
      setLoading(false); // Desactivar el estado de carga
    });

    return unsubscribe; // Limpiar la suscripción al desmontar el componente
  }, [db]);

  // Función para agregar un producto
  const addProduct = async (product) => {
    try {
      const productsCollection = collection(db, "productos");
      await addDoc(productsCollection, product); // Agregar el producto a Firestore
      console.log("Producto agregado correctamente.");
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  };

  // Función para editar un producto
  const editProduct = async (id, updatedProduct) => {
    try {
      const productDoc = doc(db, "productos", id); // Referencia al documento del producto
      await updateDoc(productDoc, updatedProduct); // Actualizar el producto en Firestore
      console.log("Producto actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  // Función para eliminar un producto
  const deleteProduct = async (id) => {
    try {
      console.log("Intentando eliminar el producto con ID:", id); // Depuración

      // Verificar que el ID no esté vacío o sea inválido
      if (!id) {
        console.error("ID de producto no válido.");
        return;
      }

      const productDoc = doc(db, "productos", id); // Referencia al documento del producto
      console.log("Referencia al documento:", productDoc); // Depuración

      // Eliminar el producto de Firestore
      await deleteDoc(productDoc);
      console.log("Producto eliminado correctamente de Firestore.");

      // Actualizar el estado local eliminando el producto
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
      console.log("Producto eliminado correctamente de la vista.");
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  // Valor del contexto
  const value = {
    products, // Lista de productos
    loading, // Estado de carga
    addProduct, // Función para agregar un producto
    editProduct, // Función para editar un producto
    deleteProduct, // Función para eliminar un producto
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}