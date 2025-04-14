import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit, Search, Package, DollarSign, Tag, BarChart4, Weight } from 'lucide-react';
import Sidebar from '../components/Sidebar'; // Asegúrate de que la ruta sea correcta
import { useProduct } from '../context/ProductContext'; // Importar el contexto de productos
import NuevoProductoModal from '../components/NuevoProductoModal'; // Importar el modal de nuevo producto
import EliminarProductoModal from '../components/EliminarProductoModal'; // Importar el modal de confirmación
import EditarProductoModal from '../components/EditarProductoModal';

const Productos = () => {
  const [sidebarWidth, setSidebarWidth] = useState('w-64'); // Ancho predeterminado del sidebar
  const { products, loading, deleteProduct } = useProduct(); // Obtener productos, estado de carga y función de eliminar del contexto
  const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal de nuevo producto
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Estado para controlar el modal de confirmación
  const [productoAEliminar, setProductoAEliminar] = useState(null); // Estado para almacenar el producto a eliminar
  const [productoAEditar, setProductoAEditar] = useState(null); // Estado para almacenar el producto a editar

  // Categorías especiales que requieren precio por kilo
  const categoriasEspeciales = ["Frutas y Verduras", "Alimentos a Granel", "Nutrición Animal"];

  // Función para actualizar el ancho del sidebar
  const updateSidebarWidth = (width) => {
    setSidebarWidth(width);
  };

  // Función para abrir el modal de nuevo producto
  const openModal = () => setIsModalOpen(true);

  // Función para cerrar el modal de nuevo producto
  const closeModal = () => setIsModalOpen(false);

  // Función para abrir el modal de confirmación de eliminación
  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto); // Guardar el producto a eliminar
    setIsDeleteModalOpen(true); // Abrir el modal de confirmación
  };

  // Función para cerrar el modal de confirmación de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false); // Cerrar el modal de confirmación
    setProductoAEliminar(null); // Limpiar el producto a eliminar
  };

  // Función para abrir el modal de edición
  const openEditModal = (producto) => {
    setProductoAEditar(producto); // Guardar el producto a editar
  };

  // Función para cerrar el modal de edición
  const closeEditModal = () => {
    setProductoAEditar(null); // Limpiar el producto a editar
  };

  // Función para eliminar un producto después de confirmar
  const handleConfirmarEliminacion = async () => {
    if (productoAEliminar) {
      try {
        await deleteProduct(productoAEliminar.id); // Eliminar el producto usando el contexto
        console.log("Producto eliminado correctamente.");
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
      } finally {
        closeDeleteModal(); // Cerrar el modal de confirmación
      }
    }
  };

  // Filtrar productos según la búsqueda
  const productosFiltrados = products.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Componente de esqueleto para la tabla
  const TableSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Componente de esqueleto para tarjetas móviles
  const CardSkeleton = () => (
    <div className="lg:hidden space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
          <div className="flex justify-between items-start mb-2">
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full ml-2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex">
      <Sidebar updateSidebarWidth={updateSidebarWidth} />
      <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === 'w-64' ? 'ml-72' : 'ml-16'}`}>
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Mantenimiento de Productos</h1>
          <button
            onClick={openModal} // Abrir el modal al hacer clic
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-full shadow-md transition-all"
          >
            <PlusCircle size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar productos por nombre o categoría..."
            className="placeholder-gray-400 w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla de productos - Vista desktop */}
        <div className="hidden lg:block">
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productosFiltrados.map((producto) => (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          S/ {producto.precio.toFixed(2)}
                          {categoriasEspeciales.includes(producto.categoria) && (
                            <span className="ml-1 text-gray-500">
                              <Weight size={14} className="inline-block" /> /kg
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                            {producto.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {producto.marca || "No existe"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {producto.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(producto)} // Abrir modal de edición
                              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(producto)} // Abrir modal de confirmación
                              className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
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
            </div>
          )}
        </div>

        {/* Vista móvil - Tarjetas de productos */}
        {loading ? (
          <CardSkeleton />
        ) : (
          <div className="lg:hidden space-y-4">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{producto.nombre}</h3>
                  <span className="text-blue-600 font-medium">
                    S/ {producto.precio.toFixed(2)}
                    {categoriasEspeciales.includes(producto.categoria) && (
                      <span className="ml-1 text-gray-500">
                        <Weight size={14} className="inline-block" /> /kg
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    {producto.categoria}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {producto.marca || "No existe"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-gray-400" />
                    <span className="text-gray-600">Stock: <b>{producto.stock}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-400" />
                    <span className="text-gray-600 truncate" title={producto.fecha_vencimiento}>
                      Vence: <b>{producto.fecha_vencimiento}</b>
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(producto)} // Abrir modal de edición
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(producto)} // Abrir modal de confirmación
                    className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay productos o resultados de búsqueda */}
        {!loading && productosFiltrados.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-800">No se encontraron productos</h3>
            <p className="text-gray-500 mt-2">
              {busqueda ? 
                `No hay productos que coincidan con "${busqueda}"` : 
                "Aún no hay productos registrados"
              }
            </p>
            <button
              onClick={openModal}
              className="mt-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg shadow-md transition-all"
            >
              <PlusCircle size={18} />
              <span>Agregar un producto</span>
            </button>
          </div>
        )}

        {/* Modal para agregar nuevo producto */}
        <NuevoProductoModal isOpen={isModalOpen} onClose={closeModal} />

        {/* Modal de confirmación para eliminar producto */}
        <EliminarProductoModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmarEliminacion}
          productoNombre={productoAEliminar ? productoAEliminar.nombre : ''}
        />

        {/* Modal para editar producto */}
        <EditarProductoModal
          isOpen={!!productoAEditar} // Abrir si hay un producto a editar
          onClose={closeEditModal} // Cerrar el modal
          producto={productoAEditar} // Pasar el producto a editar
        />
      </div>
    </div>
  );
};

export default Productos;