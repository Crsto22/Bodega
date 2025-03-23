import React, { useState } from 'react';
import { X, Save, User, Mail, Phone } from 'lucide-react';
import { useCliente } from '../context/ClienteContext';

const NuevoClienteModal = ({ isOpen, onClose }) => {
  const { addCliente } = useCliente();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para manejar errores de validación

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
  });

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpiar el error del campo cuando el usuario comienza a escribir
    setErrors({
      ...errors,
      [name]: '',
    });
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar solo el nombre (obligatorio)
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    // Validar el correo solo si se ingresa (opcional)
    if (formData.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar el formulario antes de enviar
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Crear el objeto del cliente con la fecha de creación automática
      const clienteNuevo = {
        ...formData,
        fecha_creacion: new Date(), // Fecha actual automática
      };

      // Llamar a la función del contexto para añadir el cliente
      await addCliente(clienteNuevo);

      // Cerrar modal y resetear formulario
      onClose();
      setFormData({
        nombre: '',
        correo: '',
        telefono: '',
      });
      setErrors({}); // Limpiar errores
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-inner">
              <User size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Nuevo Cliente</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Nombre del cliente */}
              <div className="col-span-full">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del cliente <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                      errors.nombre ? 'border-red-500' : ''
                    }`}
                    placeholder="Ingrese el nombre del cliente"
                  />
                </div>
                {errors.nombre && (
                  <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Correo electrónico */}
              <div className="col-span-full">
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                      errors.correo ? 'border-red-500' : ''
                    }`}
                    placeholder="Ingrese el correo electrónico"
                  />
                </div>
                {errors.correo && (
                  <p className="text-sm text-red-500 mt-1">{errors.correo}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="col-span-full">
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                      errors.telefono ? 'border-red-500' : ''
                    }`}
                    placeholder="Ingrese el número de teléfono"
                  />
                </div>
                {errors.telefono && (
                  <p className="text-sm text-red-500 mt-1">{errors.telefono}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Pie del modal con botones */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row-reverse gap-3 sm:gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-5 rounded-lg shadow-sm transition-all"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <Save size={18} />
            )}
            <span>{loading ? 'Guardando...' : 'Guardar Cliente'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 px-5 rounded-lg shadow-sm transition-all"
          >
            <span>Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevoClienteModal;