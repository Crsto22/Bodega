import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit, Search, Users, Phone, Mail } from 'lucide-react';
import Sidebar from '../components/Sidebar'; // Asegúrate que la ruta sea correcta
import { useCliente } from '../context/ClienteContext'; // Importar el contexto
import EliminarClienteModal from '../components/EliminarClienteModal'; // Importar el modal de eliminación
import NuevoClienteModal from '../components/NuevoClienteModal'; // Importar el modal de nuevo cliente
import EditarClienteModal from '../components/EditarClienteModal'; // Importar el modal de edición

const Clientes = () => {
  const [sidebarWidth, setSidebarWidth] = useState('w-64'); // Ancho predeterminado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Estado para controlar el modal de eliminación
  const [clienteToDelete, setClienteToDelete] = useState(null); // Estado para almacenar el cliente a eliminar
  const [isNuevoClienteModalOpen, setIsNuevoClienteModalOpen] = useState(false); // Estado para controlar el modal de nuevo cliente
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Estado para controlar el modal de edición
  const [clienteToEdit, setClienteToEdit] = useState(null); // Estado para almacenar el cliente a editar

  // Función para actualizar el ancho de la barra lateral
  const updateSidebarWidth = (width) => {
    setSidebarWidth(width);
  };

  // Usar el contexto de clientes
  const { clientes, loading, deleteCliente } = useCliente();

  // Estado para búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Filtrar clientes según la búsqueda
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.telefono.includes(busqueda)
  );

  // Función para abrir el modal de eliminación
  const openDeleteModal = (cliente) => {
    setClienteToDelete(cliente);
    setIsDeleteModalOpen(true);
  };

  // Función para cerrar el modal de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setClienteToDelete(null);
  };

  // Función para manejar la eliminación de un cliente
  const handleDeleteCliente = async (id) => {
    await deleteCliente(id);
    closeDeleteModal();
  };

  // Función para abrir el modal de nuevo cliente
  const openNuevoClienteModal = () => {
    setIsNuevoClienteModalOpen(true);
  };

  // Función para cerrar el modal de nuevo cliente
  const closeNuevoClienteModal = () => {
    setIsNuevoClienteModalOpen(false);
  };

  // Función para abrir el modal de edición
  const openEditModal = (cliente) => {
    setClienteToEdit(cliente);
    setIsEditModalOpen(true);
  };

  // Función para cerrar el modal de edición
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setClienteToEdit(null);
  };

  return (
    <div className="flex">
      <Sidebar updateSidebarWidth={updateSidebarWidth} />
      <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === 'w-64' ? 'ml-72' : 'ml-16'}`}>
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
          <button
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-full shadow-md transition-all"
            onClick={openNuevoClienteModal}
          >
            <PlusCircle size={18} />
            <span>Nuevo Cliente</span>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Mostrar mensaje de carga */}
        {loading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Cargando clientes...</h3>
          </div>
        )}

        {/* Clientes en tarjetas - Vista móvil y tablets */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mb-6">
              {clientesFiltrados.map((cliente) => (
                <div key={cliente.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 flex items-center space-x-3 border-b">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {cliente.nombre.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{cliente.nombre}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm">
                        <Mail size={14} className="text-gray-400 mr-2" />
                        <span className="text-gray-800">{cliente.correo}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone size={14} className="text-gray-400 mr-2" />
                        <span className="text-gray-800">{cliente.telefono}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users size={14} className="text-gray-400 mr-2" />
                        <span className="text-gray-800">Fecha: {new Date(cliente.fecha_creacion?.toDate()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 py-2 px-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm flex items-center justify-center gap-1"
                        onClick={() => openEditModal(cliente)}
                      >
                        <Edit size={16} />
                        <span>Editar</span>
                      </button>
                      <button
                        className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center justify-center gap-1"
                        onClick={() => openDeleteModal(cliente)}
                      >
                        <Trash2 size={16} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla de clientes - Vista desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientesFiltrados.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                              {cliente.nombre.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                              <div className="text-sm text-gray-500">ID: {cliente.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{cliente.correo}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{cliente.telefono}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(cliente.fecha_creacion?.toDate()).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                              onClick={() => openEditModal(cliente)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                              onClick={() => openDeleteModal(cliente)}
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
              {clientesFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron clientes</h3>
                  <p className="text-gray-500 max-w-md mx-auto">No hay clientes que coincidan con tu búsqueda. Intenta con otros términos o agrega un nuevo cliente.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal de eliminación */}
        <EliminarClienteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={() => handleDeleteCliente(clienteToDelete?.id)}
          clienteNombre={clienteToDelete?.nombre}
        />

        {/* Modal de nuevo cliente */}
        <NuevoClienteModal
          isOpen={isNuevoClienteModalOpen}
          onClose={closeNuevoClienteModal}
        />

        {/* Modal de edición */}
        <EditarClienteModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          cliente={clienteToEdit}
        />
      </div>
    </div>
  );
};

export default Clientes;