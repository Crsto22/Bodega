import React, { useState } from 'react';
import { X, Save, Package, Tag, Calendar, BarChart4 } from 'lucide-react';
import { useProduct } from '../context/ProductContext';

const NuevoProductoModal = ({ isOpen, onClose }) => {
  const { addProduct } = useProduct();
  const [loading, setLoading] = useState(false);
  const [tieneFechaVencimiento, setTieneFechaVencimiento] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para manejar errores de validación
  const [tieneMarca, setTieneMarca] = useState(false); // Estado para manejar si el producto tiene marca
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(''); // Estado para la categoría seleccionada
  
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    marca: '',
    stock: '',
    fecha_vencimiento: ''
  });

  // Categorías especiales que requieren precio por kilo y stock "No Especificado"
  const categoriasEspeciales = ["Préstamo","Frutas y Verduras", "Alimentos a Granel", "Nutrición Animal"];

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar el error del campo cuando el usuario comienza a escribir
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  // Manejar cambio en el toggle de fecha de vencimiento
  const handleToggleChange = () => {
    setTieneFechaVencimiento(!tieneFechaVencimiento);
    if (tieneFechaVencimiento) {
      setFormData({
        ...formData,
        fecha_vencimiento: ''
      });
    }
  };

  // Manejar cambio en el toggle de marca
  const handleMarcaChange = () => {
    setTieneMarca(!tieneMarca);
    if (!tieneMarca) {
      setFormData({
        ...formData,
        marca: ''
      });
    }
  };

  // Manejar cambio en la categoría
  const handleCategoriaChange = (e) => {
    const categoria = e.target.value;
    setCategoriaSeleccionada(categoria);
    setFormData({
      ...formData,
      categoria,
      stock: categoriasEspeciales.includes(categoria) ? 'No Especificado' : '',
    });
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    if (!formData.precio) {
      newErrors.precio = 'El precio es obligatorio';
    }
    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es obligatoria';
    }
    if (tieneMarca && !formData.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria';
    }
    if (!categoriasEspeciales.includes(formData.categoria)) {
      if (!formData.stock) {
        newErrors.stock = 'El stock es obligatorio';
      }
    }
    if (tieneFechaVencimiento && !formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = 'La fecha de vencimiento es obligatoria';
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
      // Formatear datos para guardar
      const productoNuevo = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: categoriasEspeciales.includes(formData.categoria) ? 'No Especificado' : formData.stock,
      };
      
      // Llamar a la función del contexto para añadir el producto
      await addProduct(productoNuevo);
      
      // Cerrar modal y resetear formulario
      onClose();
      setFormData({
        nombre: '',
        precio: '',
        categoria: '',
        marca: '',
        stock: '',
        fecha_vencimiento: ''
      });
      setTieneFechaVencimiento(false);
      setTieneMarca(false);
      setCategoriaSeleccionada('');
      setErrors({}); // Limpiar errores
    } catch (error) {
      console.error('Error al guardar el producto:', error);
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
              <Package size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Nuevo Producto</h2>
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
              {/* Nombre del producto */}
              <div className="col-span-full">
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del producto
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package size={16} className="text-gray-400" />
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
                    placeholder="Ingrese el nombre del producto"
                  />
                </div>
                {errors.nombre && (
                  <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>
                )}
              </div>
              
              {/* Categoría */}
              <div className="col-span-full">
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag size={16} className="text-gray-400" />
                  </div>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleCategoriaChange}
                    required
                    className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow appearance-none ${
                      errors.categoria ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Dulces y Snacks">Dulces y Snacks</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Productos de Tabaco">Productos de Tabaco</option>
                    <option value="Frutas y Verduras">Frutas y Verduras</option>
                    <option value="Productos de abarrotes">Productos de abarrotes</option>
                    <option value="Nutrición Animal">Nutrición Animal</option>
                    <option value="Productos de Limpieza">Productos de Limpieza</option>
                    <option value="Material Escolar">Material Escolar</option>
                    <option value="Higiene Personal">Higiene Personal</option>
                    <option value="Pan y Postres">Pan y Postres</option>
                    <option value="Préstamo">Préstamo</option>
                    <option value="Impresiones y Scaneos">Impresiones y Scaneos</option>
                  </select>
                </div>
                {errors.categoria && (
                  <p className="text-sm text-red-500 mt-1">{errors.categoria}</p>
                )}
              </div>
              
              {/* Precio - Solo visible si se selecciona una categoría */}
              {formData.categoria && (
                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                    {categoriasEspeciales.includes(formData.categoria) ? 'Precio por Kilo (S/)' : 'Precio (S/)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-medium">S/</span>
                    </div>
                    <input
                      type="number"
                      id="precio"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                        errors.precio ? 'border-red-500' : ''
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.precio && (
                    <p className="text-sm text-red-500 mt-1">{errors.precio}</p>
                  )}
                </div>
              )}
              
              {/* Marca - Toggle */}
              {formData.categoria && (
                <div className="col-span-full mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Tiene marca?
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarcaChange}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        tieneMarca ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                          tieneMarca ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-700">
                      {tieneMarca ? 'Sí' : 'No'}
                    </span>
                  </div>
                  {tieneMarca && (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="marca"
                        name="marca"
                        value={formData.marca}
                        onChange={handleChange}
                        required
                        className={`px-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                          errors.marca ? 'border-red-500' : ''
                        }`}
                        placeholder="Marca del producto"
                      />
                      {errors.marca && (
                        <p className="text-sm text-red-500 mt-1">{errors.marca}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Stock - Solo visible si no es una categoría especial */}
              {formData.categoria && !categoriasEspeciales.includes(formData.categoria) && (
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BarChart4 size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      min="0"
                      className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                        errors.stock ? 'border-red-500' : ''
                      }`}
                      placeholder="Cantidad disponible"
                    />
                  </div>
                  {errors.stock && (
                    <p className="text-sm text-red-500 mt-1">{errors.stock}</p>
                  )}
                </div>
              )}
              
              {/* Toggle para fecha de vencimiento */}
              {formData.categoria && (
                <div className="col-span-full mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Tiene fecha de vencimiento?
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleChange}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        tieneFechaVencimiento ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                          tieneFechaVencimiento ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-700">
                      {tieneFechaVencimiento ? 'Sí' : 'No'}
                    </span>
                  </div>
                  {tieneFechaVencimiento && (
                    <div className="mt-2">
                      <label htmlFor="fecha_vencimiento" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Vencimiento
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="fecha_vencimiento"
                          name="fecha_vencimiento"
                          value={formData.fecha_vencimiento}
                          onChange={handleChange}
                          required
                          className={`pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-shadow ${
                            errors.fecha_vencimiento ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                      {errors.fecha_vencimiento && (
                        <p className="text-sm text-red-500 mt-1">{errors.fecha_vencimiento}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
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
            <span>{loading ? 'Guardando...' : 'Guardar Producto'}</span>
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

export default NuevoProductoModal;