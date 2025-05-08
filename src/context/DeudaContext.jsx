import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    getDoc,
    query,
    where,
    getDocs, 
} from "firebase/firestore";
import { app } from "../firebase/firebase";

const DeudaContext = createContext();

export function useDeuda() {
  return useContext(DeudaContext);
}

export function DeudaProvider({ children }) {
  const [clientesConDeudas, setClientesConDeudas] = useState([]);
  const [ventasPendientes, setVentasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore(app);

  // Caches para clientes y productos
  const [clientesCache, setClientesCache] = useState({});
  const [productosCache, setProductosCache] = useState({});

  // Obtener nombre del cliente con cache
  const getNombreCliente = useCallback(async (clienteId) => {
    if (!clienteId) return "Consumidor Final";

    if (clientesCache[clienteId]) {
      return clientesCache[clienteId];
    }

    try {
      const clienteRef = doc(db, "clientes", clienteId);
      const clienteDoc = await getDoc(clienteRef);

      if (clienteDoc.exists()) {
        const nombre = clienteDoc.data().nombre;
        setClientesCache(prev => ({ ...prev, [clienteId]: nombre }));
        return nombre;
      }
      return "Cliente no encontrado";
    } catch (error) {
      console.error("Error al obtener cliente:", error);
      return "Error al cargar";
    }
  }, [db, clientesCache]);

  // Obtener nombre del producto con cache
  const getNombreProducto = useCallback(async (productoId) => {
    if (!productoId) return "Producto no especificado";

    if (productosCache[productoId]) {
      return productosCache[productoId];
    }

    try {
      const productoRef = doc(db, "productos", productoId);
      const productoDoc = await getDoc(productoRef);

      if (productoDoc.exists()) {
        const nombre = productoDoc.data().nombre;
        setProductosCache(prev => ({ ...prev, [productoId]: nombre }));
        return nombre;
      }
      return "Producto no encontrado";
    } catch (error) {
      console.error("Error al obtener producto:", error);
      return "Error al cargar producto";
    }
  }, [db, productosCache]);

  // Función para obtener ventas pendientes/parciales de un cliente específico
  const getVentasCliente = useCallback(async (clienteId) => {
    try {
      const ventasCollection = collection(db, "ventas");
      const q = query(
        ventasCollection,
        where("clienteId", "==", clienteId),
        where("estadoPago", "in", ["Pendiente", "Parcial"])
      );

      const querySnapshot = await getDocs(q);
      const ventasProcesadas = [];

      for (const doc of querySnapshot.docs) {
        const venta = {
          id: doc.id,
          ...doc.data()
        };

        const nombreCliente = await getNombreCliente(venta.clienteId);
        
        // Procesar productos para obtener sus nombres
        const productosConNombre = await Promise.all(
          venta.productos.map(async (producto) => {
            const nombreProducto = await getNombreProducto(producto.productoId);
            return {
              ...producto,
              nombreProducto: nombreProducto
            };
          })
        );

        ventasProcesadas.push({
          ...venta,
          clienteNombre: nombreCliente,
          fechaFormateada: new Date(venta.fecha).toLocaleDateString(),
          productos: productosConNombre
        });
      }

      return ventasProcesadas;
    } catch (error) {
      console.error("Error obteniendo ventas del cliente:", error);
      setError(error);
      throw error;
    }
  }, [db, getNombreCliente, getNombreProducto]);

  // Obtener ventas pendientes/parciales en tiempo real
  useEffect(() => {
    const ventasCollection = collection(db, "ventas");
    const q = query(
      ventasCollection,
      where("estadoPago", "in", ["Pendiente", "Parcial"])
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const ventasProcesadas = [];

        for (const doc of snapshot.docs) {
          const venta = {
            id: doc.id,
            ...doc.data()
          };

          const nombreCliente = await getNombreCliente(venta.clienteId);
          
          // Procesar productos para obtener sus nombres
          const productosConNombre = await Promise.all(
            venta.productos.map(async (producto) => {
              const nombreProducto = await getNombreProducto(producto.productoId);
              return {
                ...producto,
                nombreProducto: nombreProducto
              };
            })
          );

          ventasProcesadas.push({
            ...venta,
            clienteNombre: nombreCliente,
            fechaFormateada: new Date(venta.fecha).toLocaleDateString(),
            productos: productosConNombre
          });
        }

        // Procesar para obtener clientes con deudas
        const deudasAgrupadas = {};
        for (const venta of ventasProcesadas) {
          if (venta.clienteId) {
            if (!deudasAgrupadas[venta.clienteId]) {
              deudasAgrupadas[venta.clienteId] = {
                clienteId: venta.clienteId,
                nombre: venta.clienteNombre,
                totalDeuda: 0,
                ventasPendientes: 0
              };
            }
            deudasAgrupadas[venta.clienteId].totalDeuda += venta.montoPendiente || 0;
            deudasAgrupadas[venta.clienteId].ventasPendientes += 1;
          }
        }

        setVentasPendientes(ventasProcesadas);
        setClientesConDeudas(Object.values(deudasAgrupadas));
        setLoading(false);
      } catch (error) {
        console.error("Error procesando deudas:", error);
        setError(error);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [db, getNombreCliente, getNombreProducto]);

  // Obtener detalles completos de una venta específica
  const getDetallesVenta = useCallback(async (ventaId) => {
    try {
      const ventaRef = doc(db, "ventas", ventaId);
      const ventaDoc = await getDoc(ventaRef);

      if (ventaDoc.exists()) {
        const ventaData = ventaDoc.data();
        const nombreCliente = await getNombreCliente(ventaData.clienteId);
        
        // Procesar productos para obtener sus nombres
        const productosConNombre = await Promise.all(
          ventaData.productos.map(async (producto) => {
            const nombreProducto = await getNombreProducto(producto.productoId);
            return {
              ...producto,
              nombreProducto: nombreProducto
            };
          })
        );

        return {
          id: ventaId,
          ...ventaData,
          clienteNombre: nombreCliente,
          fechaFormateada: new Date(ventaData.fecha).toLocaleDateString(),
          productos: productosConNombre
        };
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo detalles de venta:", error);
      return null;
    }
  }, [db, getNombreCliente, getNombreProducto]);

  const value = {
    clientesConDeudas,
    ventasPendientes,
    loading,
    error,
    getDetallesVenta,
    getVentasCliente
  };

  return (
    <DeudaContext.Provider value={value}>
      {children}
    </DeudaContext.Provider>
  );
}