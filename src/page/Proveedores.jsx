import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit, Search, Building, Phone, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar'; // Asegúrate que la ruta sea correcta
import { useProveedor } from '../context/ProveedorContext'; // Importar el contexto
import NuevoProveedorModal from '../components/NuevoProveedorModal';
import EditarProveedorModal from '../components/EditarProveedorModal';
import EliminarProveedorModal from '../components/EliminarProveedorModal';

const Proveedores = () => {
  const [sidebarWidth, setSidebarWidth] = useState('w-64'); // Ancho predeterminado
  const { proveedores, loading, deleteProveedor } = useProveedor(); // Usar el contexto de proveedores

  // Estado para búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Filtrar proveedores según la búsqueda
  const proveedoresFiltrados = proveedores.filter(proveedor =>
    proveedor.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    proveedor.ruc.includes(busqueda) ||
    proveedor.telefono.includes(busqueda)
  );

  // Función para actualizar el ancho de la barra lateral
  const updateSidebarWidth = (width) => {
    setSidebarWidth(width);
  };

  // Estados para los modales
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de nuevo proveedor
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal de edición
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal de eliminación

  // Estados para almacenar el proveedor seleccionado
  const [proveedorToEdit, setProveedorToEdit] = useState(null);
  const [proveedorToDelete, setProveedorToDelete] = useState(null);

  // Función para abrir el modal de edición
  const openEditModal = (proveedor) => {
    setProveedorToEdit(proveedor);
    setIsEditModalOpen(true);
  };

  // Función para cerrar el modal de edición
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setProveedorToEdit(null);
  };

  // Función para abrir el modal de eliminación
  const openDeleteModal = (proveedor) => {
    setProveedorToDelete(proveedor);
    setIsDeleteModalOpen(true);
  };

  // Función para cerrar el modal de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProveedorToDelete(null);
  };

  // Función para manejar la eliminación de un proveedor
  const handleDeleteProveedor = async (id) => {
    await deleteProveedor(id);
    closeDeleteModal();
  };

  return (
    <div className="flex">
      <Sidebar updateSidebarWidth={updateSidebarWidth} />
      <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === 'w-64' ? 'ml-72' : 'ml-16'}`}>
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Proveedores</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-full shadow-md transition-all"
          >
            <PlusCircle size={18} />
            <span>Nuevo Proveedor</span>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar proveedores por razón social, RUC o teléfono..."
            className="w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Mostrar mensaje de carga */}
        {loading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Cargando proveedores...</h3>
          </div>
        )}

        {/* Proveedores en tarjetas - Vista móvil y tablets */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mb-6">
              {proveedoresFiltrados.map((proveedor) => (
                <div key={proveedor.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 flex items-center space-x-3 border-b">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {proveedor.razonSocial.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{proveedor.razonSocial}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm">
                        <FileText size={14} className="text-gray-400 mr-2" />
                        <span className="text-gray-800">RUC: {proveedor.ruc}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone size={14} className="text-gray-400 mr-2" />
                        <span className="text-gray-800">Teléfono: {proveedor.telefono}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Building size={14} className="text-gray-400 mr-2" />
                        <span className="text-gray-800">Fecha: {new Date(proveedor.fecha_creacion?.toDate()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(proveedor)}
                        className="flex-1 py-2 px-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm flex items-center justify-center gap-1"
                      >
                        <Edit size={16} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(proveedor)}
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

            {/* Tabla de proveedores - Vista desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón Social</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUC</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {proveedoresFiltrados.map((proveedor) => (
                      <tr key={proveedor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                              {proveedor.razonSocial.split('  ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{proveedor.razonSocial}</div>
                              <div className="text-sm text-gray-500">ID: {proveedor.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{proveedor.ruc}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{proveedor.telefono}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(proveedor.fecha_creacion?.toDate()).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => openEditModal(proveedor)}
                              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(proveedor)}
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
              {proveedoresFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Building size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron proveedores</h3>
                  <p className="text-gray-500 max-w-md mx-auto">No hay proveedores que coincidan con tu búsqueda. Intenta con otros términos o agrega un nuevo proveedor.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <NuevoProveedorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <EditarProveedorModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        proveedor={proveedorToEdit}
      />
      <EliminarProveedorModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteProveedor(proveedorToDelete?.id)}
        proveedorNombre={proveedorToDelete?.razonSocial}
      />
    </div>
  );
};

export default Proveedores;