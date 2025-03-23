import React, { useState } from "react";
import { PlusCircle, Trash2, Search, Eye } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NuevaVentaModal from "../components/NuevaVentaModal";
import EliminarVentaModal from "../components/EliminarVentaModal";
import ProductosModal from "../components/ProductosModal";
import { useVenta } from "../context/VentaContext";

const Ventas = () => {
  const [sidebarWidth, setSidebarWidth] = useState("w-64");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductosModalOpen, setIsProductosModalOpen] = useState(false);
  const [isEliminarModalOpen, setIsEliminarModalOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const { ventas, loading, deleteVenta } = useVenta();

  // Estado para búsqueda
  const [busqueda, setBusqueda] = useState("");

  // Filtrar ventas según la búsqueda
  const ventasFiltradas = ventas.filter(
    (venta) =>
      venta.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.estado.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.fecha.includes(busqueda)
  );

  // Función para obtener clase de color según el estado
  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "pagado":
        return "from-green-500 to-emerald-600"; // Fondo verde para "Pagado"
      case "pendiente":
        return "from-red-500 to-rose-600"; // Fondo rojo para "Pendiente"
      case "parcial":
        return "from-yellow-500 to-amber-600"; // Fondo amarillo para "Parcial"
      default:
        return "from-gray-500 to-gray-600"; // Fondo gris por defecto
    }
  };

  // Función para abrir el modal de productos
  const verProductos = (venta) => {
    setVentaSeleccionada(venta); // Guardar la venta seleccionada
    setIsProductosModalOpen(true); // Abrir el modal
  };

  // Función para abrir el modal de eliminación
  const abrirModalEliminar = (venta) => {
    setVentaSeleccionada(venta);
    setIsEliminarModalOpen(true);
  };

  // Función para confirmar la eliminación
  const confirmarEliminar = async () => {
    try {
      await deleteVenta(ventaSeleccionada.id);
      setIsEliminarModalOpen(false);
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
    }
  };

  // Si está cargando, mostrar un mensaje de carga
  if (loading) {
    return (
      <div className="flex">
        <Sidebar updateSidebarWidth={setSidebarWidth} />
        <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === "w-64" ? "ml-72" : "ml-16"}`}>
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-500">Cargando ventas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar updateSidebarWidth={setSidebarWidth} />
      <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === "w-64" ? "ml-72" : "ml-16"}`}>
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Ventas</h1>
          <button
            onClick={() => setIsModalOpen(true)} // Abre el modal de nueva venta
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-full shadow-md transition-all"
          >
            <PlusCircle size={18} />
            <span>Nueva Venta</span>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar ventas por cliente, estado o fecha..."
            className="w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Ventas en tarjetas - Vista móvil y tablets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mb-6">
          {ventasFiltradas.map((venta) => (
            <div key={venta.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 flex items-center space-x-3 border-b">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{venta.cliente}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full bg-gradient-to-r ${getEstadoColor(venta.estado)} text-white font-medium`}>
                      {venta.estado}
                    </span>
                    <span className="font-bold text-blue-600">S/ {venta.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <span className="text-xs text-gray-500 block">Fecha:</span>
                    <span className="font-medium text-sm">{venta.fecha}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Productos:</span>
                    <span className="font-medium text-sm">{venta.productos.length}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">ID:</span>
                    <span className="font-medium text-sm">#{venta.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Pendiente:</span>
                    <span className="font-medium text-sm">S/ {venta.montoPendiente.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => verProductos(venta)} // Ver productos
                    className="flex-1 py-2 px-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => abrirModalEliminar(venta)} // Abrir modal de eliminación
                    className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla de ventas - Vista desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasFiltradas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{venta.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venta.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{venta.cliente}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venta.productos.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">S/ {venta.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ${venta.montoPendiente > 0 ? 'text-red-600' : 'text-green-600'}">
                      S/ {venta.montoPendiente.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r ${getEstadoColor(venta.estado)} text-white`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => verProductos(venta)} // Ver productos
                          className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(venta)} // Abrir modal de eliminación
                          className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sin resultados */}
          {ventasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron ventas</h3>
              <p className="text-gray-500 max-w-md mx-auto">No hay ventas que coincidan con tu búsqueda. Intenta con otros términos o registra una nueva venta.</p>
            </div>
          )}
        </div>

        {/* Modal de Nueva Venta */}
        <NuevaVentaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} // Cierra el modal
        />

        {/* Modal de Productos */}
        <ProductosModal
          isOpen={isProductosModalOpen}
          onClose={() => setIsProductosModalOpen(false)}
          venta={ventaSeleccionada}
        />

        {/* Modal de Eliminar Venta */}
        <EliminarVentaModal
          isOpen={isEliminarModalOpen}
          onClose={() => setIsEliminarModalOpen(false)}
          onConfirm={confirmarEliminar}
          venta={ventaSeleccionada}
        />
      </div>
    </div>
  );
};

export default Ventas;