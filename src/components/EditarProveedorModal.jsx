import React, { useState, useEffect } from 'react';
import { X, Save, Building, FileText, Phone } from 'lucide-react';
import { useProveedor } from '../context/ProveedorContext';

const EditarProveedorModal = ({ isOpen, onClose, proveedor }) => {
  const { editProveedor } = useProveedor();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para manejar errores de validación

  // Estado inicial del formulario con los datos del proveedor seleccionado
  const [formData, setFormData] = useState({
    razonSocial: '',
    ruc: '',
    telefono: '',
  });

  // Actualizar el estado del formulario cuando el proveedor cambia
  useEffect(() => {
    if (proveedor) {
      setFormData({
        razonSocial: proveedor.razonSocial || '',
        ruc: proveedor.ruc || '',
        telefono: proveedor.telefono || '',
      });
    }
  }, [proveedor]);

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

    // Validar Razón Social (obligatorio)
    if (!formData.razonSocial.trim()) {
      newErrors.razonSocial = 'La razón social es obligatoria';
    }

    // Validar RUC (11 dígitos)
    if (!formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es obligatorio';
    } else if (!/^\d{11}$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    }

    // Validar Teléfono (opcional, pero si se ingresa, debe ser válido)
    if (formData.telefono.trim() && !/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 9 dígitos';
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
      // Llamar a la función del contexto para editar el proveedor
      await editProveedor(proveedor.id, formData);

      // Cerrar modal y resetear formulario
      onClose();
      setErrors({}); // Limpiar errores
    } catch (error) {
      console.error('Error al actualizar el proveedor:', error);
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
              <Building size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Editar Proveedor</h2>
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
              {/* Razón Social */}
              <div className="col-span-full">
                <label htmlFor="razonSocial" className="block text-sm font-medium text-gray-700 mb-1">
                  Razón Social <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="razonSocial"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                      errors.razonSocial ? 'border-red-500' : ''
                    }`}
                    placeholder="Ingrese la razón social"
                  />
                </div>
                {errors.razonSocial && (
                  <p className="text-sm text-red-500 mt-1">{errors.razonSocial}</p>
                )}
              </div>

              {/* RUC */}
              <div className="col-span-full">
                <label htmlFor="ruc" className="block text-sm font-medium text-gray-700 mb-1">
                  RUC <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="ruc"
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleChange}
                    required
                    className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                      errors.ruc ? 'border-red-500' : ''
                    }`}
                    placeholder="Ingrese el RUC (11 dígitos)"
                  />
                </div>
                {errors.ruc && (
                  <p className="text-sm text-red-500 mt-1">{errors.ruc}</p>
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
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
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

export default EditarProveedorModal;