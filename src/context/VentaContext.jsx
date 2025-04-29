import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { app } from "../firebase/firebase"; // Importar la instancia de Firebase

// Crear el contexto
const VentaContext = createContext();

// Hook personalizado para usar el contexto
export function useVenta() {
  return useContext(VentaContext);
}

// Proveedor del contexto
export function VentaProvider({ children }) {
  const [ventas, setVentas] = useState([]); // Estado para almacenar las ventas
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const db = getFirestore(app); // Obtener la instancia de Firestore

  const [clientesCache, setClientesCache] = useState({}); // Cache para clientes
  const [productosCache, setProductosCache] = useState({}); // Cache para productos

  // Función para obtener el nombre de un cliente por su ID
  const getNombreCliente = useCallback(async (clienteId) => {
    if (!clienteId) return "Consumidor Final";

    if (clientesCache[clienteId]) {
      return clientesCache[clienteId];
    }

    try {
      const clienteRef = doc(db, "clientes", clienteId); // Referencia al documento del cliente
      const clienteDoc = await getDoc(clienteRef); // Obtener el documento

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

  // Función para obtener los detalles de un producto por su ID
  const getDetallesProducto = useCallback(async (productoId) => {
    if (productosCache[productoId]) {
      return productosCache[productoId];
    }

    try {
      const productoRef = doc(db, "productos", productoId); // Referencia al documento del producto
      const productoDoc = await getDoc(productoRef); // Obtener el documento

      if (productoDoc.exists()) {
        const datos = productoDoc.data();
        setProductosCache(prev => ({ ...prev, [productoId]: datos }));
        return datos;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener producto:", error);
      return null;
    }
  }, [db, productosCache]);

  // Función para transformar los datos de una venta individual
  const transformarVentaIndividual = async (venta) => {
    try {
      const ventaBase = {
        id: venta.id || '',
        cliente: "Consumidor Final",
        clienteId: venta.clienteId || null,
        productos: venta.productos || [],
        total: venta.total || 0,
        estadoPago: venta.estadoPago || 'Pagado',
        fecha: venta.fecha || new Date().toISOString(),
        montoPendiente: venta.montoPendiente || 0,
      };

      if (venta.clienteId) {
        ventaBase.cliente = await getNombreCliente(venta.clienteId);
      }

      ventaBase.productos = await Promise.all(
        ventaBase.productos.map(async (producto) => {
          const detalles = await getDetallesProducto(producto.productoId);
          return {
            nombre: detalles?.nombre || "Producto no encontrado",
            cantidad: producto.cantidad || 0,
            precioUnitario: producto.precioUnitario || 0,
            productoId: producto.productoId || '',
            subtotal: producto.subtotal || (producto.cantidad * producto.precioUnitario) || 0
          };
        })
      );

      return ventaBase;
    } catch (error) {
      console.error("Error transformando venta:", error);
      return {
        id: venta.id || '',
        cliente: "Consumidor Final",
        productos: [],
        total: 0,
        estadoPago: 'Pagado',
        fecha: new Date().toISOString(),
        montoPendiente: 0,
      };
    }
  };

  // Función para transformar los datos de las ventas
  const obtenerDatosVentas = async (ventasData) => {
    const ventasTransformadas = await Promise.all(
      ventasData.map(async (venta) => {
        const nombreCliente = venta.clienteId ? await getNombreCliente(venta.clienteId) : "Cliente Anónimo";

        const productosTransformados = await Promise.all(
          venta.productos.map(async (producto) => {
            const detallesProducto = await getDetallesProducto(producto.productoId);
            return {
              ...producto,
              nombre: detallesProducto?.nombre || "Producto no encontrado",
              precioUnitario: producto.precioUnitario,
            };
          })
        );

        return {
          id: venta.id, // ID de Firestore
          cliente: nombreCliente,
          clienteId: venta.clienteId, // Mantener el ID del cliente por si acaso
          productos: productosTransformados,
          total: venta.total,
          estado: venta.estadoPago,
          fecha: venta.fecha, // Mantener la fecha original en formato string
          fechaFormateada: new Date(venta.fecha).toLocaleDateString(), // Fecha formateada para mostrar
          montoPendiente: venta.montoPendiente || 0,
        };
      })
    );
    return ventasTransformadas;
  };

  // Obtener ventas en tiempo real
  useEffect(() => {
    const ventasCollection = collection(db, "ventas"); // Referencia a la colección "ventas"

    // Suscribirse a cambios en la colección
    const unsubscribe = onSnapshot(ventasCollection, async (snapshot) => {
      const ventasData = snapshot.docs.map((doc) => ({
        id: doc.id, // ID del documento generado por Firestore
        ...doc.data(), // Datos de la venta
      }));

      // Transformar los datos de las ventas
      const ventasTransformadas = await obtenerDatosVentas(ventasData);
      setVentas(ventasTransformadas); // Actualizar el estado con las ventas transformadas
      setLoading(false); // Desactivar el estado de carga
    });

    return unsubscribe; // Limpiar la suscripción al desmontar el componente
  }, [db]);

  // Función para agregar una venta y disminuir el stock de los productos
  const addVenta = async (venta) => {
    try {
      const batch = writeBatch(db);
      const ventasCollection = collection(db, "ventas"); // Referencia a la colección de ventas
      const productosCollection = collection(db, "productos"); // Referencia a la colección de productos

      // Validar que no haya campos undefined
      const camposRequeridos = ["fecha", "productos", "total", "estadoPago"];
      for (const campo of camposRequeridos) {
        if (venta[campo] === undefined) {
          throw new Error(`Campo requerido '${campo}' no está definido.`);
        }
      }

      // Verificar que los productos existan y tengan stock suficiente
      for (const productoVenta of venta.productos) {
        const productoRef = doc(productosCollection, productoVenta.productoId); // Referencia al producto
        const productoDoc = await getDoc(productoRef); // Obtener el documento del producto

        if (!productoDoc.exists()) {
          throw new Error(`Producto ${productoVenta.productoId} no existe`);
        }

        const productoData = productoDoc.data();
        if (productoData.stock < productoVenta.cantidad) {
          throw new Error(`Stock insuficiente para ${productoData.nombre}`);
        }
      }

      // Disminuir el stock de cada producto vendido
      for (const productoVenta of venta.productos) {
        const productoRef = doc(productosCollection, productoVenta.productoId); // Referencia al producto
        const productoDoc = await getDoc(productoRef); // Obtener el documento del producto
        const nuevoStock = productoDoc.data().stock - productoVenta.cantidad; // Calcular el nuevo stock
        batch.update(productoRef, { stock: nuevoStock });
      }

      // Agregar la venta a Firestore
      const ventaRef = doc(ventasCollection);
      batch.set(ventaRef, venta);
      await batch.commit();

      const ventaSnapshot = await getDoc(ventaRef);

      if (!ventaSnapshot.exists()) {
        throw new Error("No se pudo crear la venta");
      }

      const ventaCompleta = {
        id: ventaSnapshot.id,
        ...ventaSnapshot.data(),
        productos: ventaSnapshot.data().productos || venta.productos,
        total: ventaSnapshot.data().total || venta.total,
        montoPendiente: ventaSnapshot.data().montoPendiente ||
          (venta.estadoPago === 'Parcial' ?
            (venta.total - (venta.adelanto || 0)) :
            (venta.estadoPago === 'Pendiente' ? venta.total : 0))
      };

      const ventaTransformada = await transformarVentaIndividual(ventaCompleta);

      return {
        success: true,
        venta: {
          ...ventaTransformada,
          fechaFormateada: new Date(ventaCompleta.fecha).toLocaleString(),
        }
      };
    } catch (error) {
      console.error("Error al agregar la venta:", error);
      throw error;
    }
  };

  // Función para eliminar una venta
  const deleteVenta = async (ventaId) => {
    try {
      const ventaRef = doc(db, "ventas", ventaId); // Referencia a la venta
      await deleteDoc(ventaRef); // Eliminar la venta
      console.log("Venta eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
      throw error; // Relanzar el error para manejarlo en el componente
    }
  };

  // Función para pagar la deuda pendiente de una venta
  const pagarDeuda = async (ventaId, montoPagado) => {
    try {
      const ventaRef = doc(db, "ventas", ventaId); // Referencia a la venta
      const ventaDoc = await getDoc(ventaRef); // Obtener el documento de la venta

      if (ventaDoc.exists()) {
        const ventaData = ventaDoc.data();
        const montoPendienteActual = ventaData.montoPendiente;
        const nuevoMontoPendiente = montoPendienteActual - montoPagado;

        let nuevoEstadoPago;
        if (nuevoMontoPendiente <= 0) {
          nuevoEstadoPago = "Pagado";
        } else if (ventaData.estadoPago === "Pendiente") {
          nuevoEstadoPago = "Parcial";
        } else {
          nuevoEstadoPago = ventaData.estadoPago;
        }

        // Actualizar el estado de la venta en Firestore
        await updateDoc(ventaRef, {
          montoPendiente: nuevoMontoPendiente >= 0 ? nuevoMontoPendiente : 0,
          estadoPago: nuevoEstadoPago,
        });

        console.log("Deuda actualizada correctamente.");
      } else {
        throw new Error(`Venta con ID ${ventaId} no encontrada.`);
      }
    } catch (error) {
      console.error("Error al actualizar la deuda:", error);
      throw error;
    }
  };

  // Valor del contexto
  const value = {
    ventas, // Lista de ventas transformadas
    loading, // Estado de carga
    error, // Estado de error
    addVenta, // Función para agregar una venta
    deleteVenta, // Función para eliminar una venta
    pagarDeuda, // Función para pagar la deuda
    transformarVentaIndividual // Función para transformar una venta individual
  };

  return (
    <VentaContext.Provider value={value}>
      {children}
    </VentaContext.Provider>
  );
}
