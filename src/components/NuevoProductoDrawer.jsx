import React, { useState } from 'react';
import { X, Save, Package, Tag, Calendar, BarChart4, ChevronDown, ChevronUp } from 'lucide-react';
import { useProduct } from '../context/ProductContext';

const NuevoProductoDrawer = ({ isOpen, onClose }) => {
  const { addProduct } = useProduct();
  const [loading, setLoading] = useState(false);
  const [tieneFechaVencimiento, setTieneFechaVencimiento] = useState(false);
  const [errors, setErrors] = useState({});
  const [tieneMarca, setTieneMarca] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    marca: '',
    stock: '',
    fecha_vencimiento: ''
  });

  const categoriasEspeciales = ["Préstamo", "Frutas y Verduras", "Alimentos a Granel", "Nutrición Animal"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const handleToggleChange = () => {
    setTieneFechaVencimiento(!tieneFechaVencimiento);
    if (tieneFechaVencimiento) {
      setFormData({
        ...formData,
        fecha_vencimiento: ''
      });
    }
  };

  const handleMarcaChange = () => {
    setTieneMarca(!tieneMarca);
    if (!tieneMarca) {
      setFormData({
        ...formData,
        marca: ''
      });
    }
  };

  const handleCategoriaChange = (e) => {
    const categoria = e.target.value;
    setCategoriaSeleccionada(categoria);
    setFormData({
      ...formData,
      categoria,
      stock: categoriasEspeciales.includes(categoria) ? 'No Especificado' : '',
    });
  };

  const handleStockRapido = (cantidad) => {
    setFormData({
      ...formData,
      stock: cantidad
    });
    setErrors({
      ...errors,
      stock: ''
    });
  };

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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const productoNuevo = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: categoriasEspeciales.includes(formData.categoria) ? 'No Especificado' : formData.stock,
      };

      await addProduct(productoNuevo);

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
      setErrors({});
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end transition-all">
      <div
        className="bg-white w-full h-auto rounded-t-2xl p-5 transform transition-all duration-300 animate-slide-up shadow-xl overflow-auto"
        style={{
          maxHeight: '80vh',
          marginTop: '20vh'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-gray-800">Agregar Producto Rápido</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Sección de formulario rápido */}
        <div className="bg-[#44943b]/10 p-3 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">Información básica del producto</span>
            <Package size={18} className="text-[#44943b]" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto:</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="text-gray-400" size={16} />
              </div>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44943b] focus:border-transparent transition-all bg-gray-50"
                placeholder="Ingrese el nombre del producto"
              />
            </div>
            {errors.nombre && (
              <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría:</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="text-gray-400" size={16} />
                </div>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleCategoriaChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44943b] focus:border-transparent transition-all bg-gray-50"
                >
                  <option value="">Seleccionar</option>
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
                <p className="text-xs text-red-500 mt-1">{errors.categoria}</p>
              )}
            </div>

            {formData.categoria && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {categoriasEspeciales.includes(formData.categoria) ? 'Precio por Kilo (S/)' : 'Precio (S/)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">S/</span>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44943b] focus:border-transparent transition-all bg-gray-50"
                    placeholder="0.00"
                  />
                </div>
                {errors.precio && (
                  <p className="text-xs text-red-500 mt-1">{errors.precio}</p>
                )}
              </div>
            )}
          </div>

          {formData.categoria && !categoriasEspeciales.includes(formData.categoria) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock:</label>
              <div className="flex flex-col space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BarChart4 className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44943b] focus:border-transparent transition-all bg-gray-50"
                    placeholder="Cantidad disponible"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleStockRapido(5)}
                    className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                  >
                    5 unid.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStockRapido(10)}
                    className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                  >
                    10 unid.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStockRapido(20)}
                    className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                  >
                    20 unid.
                  </button>
                </div>
              </div>
              {errors.stock && (
                <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
              )}
            </div>
          )}

          {/* Botón para mostrar opciones avanzadas */}
          <button
            type="button"
            onClick={() => setMostrarOpcionesAvanzadas(!mostrarOpcionesAvanzadas)}
            className="w-full flex items-center justify-center py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mostrarOpcionesAvanzadas ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
            {mostrarOpcionesAvanzadas ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
          </button>

          {/* Opciones avanzadas */}
          {mostrarOpcionesAvanzadas && formData.categoria && (
            <div className="pt-2 border-t border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Tiene marca?</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMarcaChange}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      tieneMarca ? 'bg-[#44943b]' : 'bg-gray-200'
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
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44943b] focus:border-transparent transition-all bg-gray-50"
                      placeholder="Marca del producto"
                    />
                    {errors.marca && (
                      <p className="text-xs text-red-500 mt-1">{errors.marca}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Tiene fecha de vencimiento?</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleChange}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      tieneFechaVencimiento ? 'bg-[#44943b]' : 'bg-gray-200'
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
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="text-gray-400" size={16} />
                      </div>
                      <input
                        type="date"
                        name="fecha_vencimiento"
                        value={formData.fecha_vencimiento}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44943b] focus:border-transparent transition-all bg-gray-50"
                      />
                    </div>
                    {errors.fecha_vencimiento && (
                      <p className="text-xs text-red-500 mt-1">{errors.fecha_vencimiento}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 mt-5 bg-[#44943b] text-white rounded-lg flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
          ) : (
            <Save size={18} className="mr-2" />
          )}
          {loading ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </div>
    </div>
  );
};

export default NuevoProductoDrawer;