import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, User, Minus, Plus, X, Search, Weight, AlertCircle, Edit, Loader2, PlusCircle } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useCliente } from '../context/ClienteContext';
import { useVenta } from '../context/VentaContext';
import NuevoProductoModal from '../components/NuevoProductoModal'; // Asegúrate de que la ruta sea correcta

const NuevaVentaModal = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isAnonimo, setIsAnonimo] = useState(false);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [estadoPago, setEstadoPago] = useState('Pagado');
  const [adelanto, setAdelanto] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [montoPagado, setMontoPagado] = useState(0);
  const [vuelto, setVuelto] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const { products, loading: loadingProducts } = useProduct();
  const { clientes, loading: loadingClientes } = useCliente();
  const { addVenta } = useVenta();

  const categoriasEspeciales = ["Préstamo", "Frutas y Verduras", "Alimentos a Granel", "Nutrición Animal"];
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (products.length > 0) {
      const initialQuantities = products.reduce((acc, product) => {
        acc[product.id] = 0;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    }
  }, [products]);

  useEffect(() => {
    if (searchTerm) {
      const results = products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(results);
      setCurrentPage(1);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(clienteSearchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const isCategoriaEspecial = categoriasEspeciales.includes(product.categoria);

    if (isCategoriaEspecial) {
      const existingItem = cart.find(item => item.id === product.id);
      if (!existingItem) {
        setCart([...cart, { ...product, quantity: 1, precioKilo: product.precio }]);
      }
    } else {
      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          setCart(cart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ));
        }
      } else {
        if (product.stock > 0) {
          setCart([...cart, { ...product, quantity: 1, precioEditado: product.precio }]);
        }
      }
    }
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [product.id]: (prevQuantities[product.id] || 0) + 1
    }));
  };

  const decrement = (productId) => {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      removeFromCart(productId);
    }
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: (prevQuantities[productId] || 0) - 1
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: 0
    }));
  };

  const updatePrecioKilo = (productId, newPrecioKilo) => {
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, precioKilo: parseFloat(newPrecioKilo) } : item
    );
    setCart(updatedCart);
  };

  const handleAnonimoChange = () => {
    setIsAnonimo(!isAnonimo);
    if (!isAnonimo) {
      setSelectedCliente(null);
    }
  };

  const handleEstadoPagoChange = (e) => {
    const nuevoEstado = e.target.value;
    setEstadoPago(nuevoEstado);
    if ((nuevoEstado === 'Pendiente' || nuevoEstado === 'Parcial') && !selectedCliente) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const handleAdelantoChange = (e) => {
    const value = parseFloat(e.target.value);
    setAdelanto(isNaN(value) ? 0 : value);
  };

  const handleEditPrice = (productId, currentPrice) => {
    setEditingProductId(productId);
    setEditedPrice(currentPrice);
  };

  const saveEditedPrice = (productId) => {
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, precioEditado: parseFloat(editedPrice) } : item
    );
    setCart(updatedCart);
    setEditingProductId(null);
    setEditedPrice('');
  };

  const subtotal = cart.reduce((total, item) => {
    if (!item || (!item.precio && !item.precioEditado)) {
      console.error("Producto o precio no definido en el carrito:", item);
      return total;
    }

    if (categoriasEspeciales.includes(item.categoria)) {
      return total + (item.precioKilo || 0);
    } else {
      const precio = item.precioEditado || item.precio;
      return total + (precio * item.quantity);
    }
  }, 0);

  const total = subtotal;

  const calcularVuelto = (montoPagado) => {
    const vueltoCalculado = montoPagado - total;
    setVuelto(vueltoCalculado >= 0 ? vueltoCalculado : 0);
  };

  const handleMontoPagadoChange = (e) => {
    const value = parseFloat(e.target.value);
    setMontoPagado(isNaN(value) ? 0 : value);
    calcularVuelto(value);
  };

  const handleFinalizarVenta = async () => {
    if (cart.length === 0) {
      alert("No hay productos en el carrito.");
      return;
    }

    if ((estadoPago === 'Pendiente' || estadoPago === 'Parcial') && !selectedCliente) {
      alert("Para ventas Pendiente o Parcial, debes seleccionar un cliente.");
      return;
    }

    setIsSubmitting(true);

    const fechaActual = new Date().toISOString();

    const venta = {
      clienteId: selectedCliente ? selectedCliente.id : null,
      productos: cart.map((item) => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: categoriasEspeciales.includes(item.categoria) ? item.precioKilo : item.precioEditado || item.precio,
        subtotal: categoriasEspeciales.includes(item.categoria) ? item.precioKilo : item.quantity * (item.precioEditado || item.precio),
      })),
      total: total,
      estadoPago: estadoPago,
      montoPendiente: estadoPago === 'Parcial' ? total - adelanto : estadoPago === 'Pendiente' ? total : 0,
      fecha: fechaActual,
    };

    try {
      await addVenta(venta);

      setCart([]);
      setSelectedCliente(null);
      setIsAnonimo(false);
      setEstadoPago('Pagado');
      setAdelanto(0);
      setSearchTerm('');
      setClienteSearchTerm('');
      setMontoPagado(0);
      setVuelto(0);

      const initialQuantities = products.reduce((acc, product) => {
        acc[product.id] = 0;
        return acc;
      }, {});
      setQuantities(initialQuantities);

      onClose();
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      alert("Hubo un error al registrar la venta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="w-full max-w bg-white rounded-lg shadow-xl p-4 sm:p-6 relative max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 hover:text-gray-900 transition-colors duration-200 z-10 flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 pr-8">Nueva Venta</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded-md mr-2">
                  <ShoppingCart size={18} />
                </span>
                Productos
              </h3>

              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-full shadow-md transition-all"
              >
                <PlusCircle size={18} />
                <span>Agregar Producto</span>
              </button>
            </div>

            {loadingProducts ? (
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>Cargando productos...</p>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search size={24} className="text-gray-400" />
                </div>
                <p className="font-medium">No se encontraron productos</p>
                <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-blue-500 hover:underline font-medium"
                >
                  Mostrar todos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentProducts.map((product) => {
                  if (!product || !product.precio) {
                    console.error("Producto o precio no definido:", product);
                    return null;
                  }

                  const isCategoriaEspecial = categoriasEspeciales.includes(product.categoria);
                  const existingItem = cart.find((item) => item.id === product.id);
                  const isStockExceeded = existingItem ? existingItem.quantity >= product.stock : false;

                  return (
                    <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h4 className="font-medium text-gray-800">{product.nombre}</h4>
                      <span className="text-green-600 font-bold text-lg">S/ {product.precio.toFixed(2)}</span>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          {product.categoria}
                        </span>
                        <span className={`text-sm ${product.stock === 0 ? "text-red-600" : "text-gray-600"}`}>
                          Stock: <b>{product.stock === 0 ? <span className="text-red-600">0</span> : product.stock}</b>
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        {isCategoriaEspecial ? (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 font-medium"
                            disabled={isStockExceeded || product.stock === 0}
                          >
                            Agregar al carrito
                          </button>
                        ) : (
                          product.stock > 0 ? (
                            <div className="flex items-center shadow-sm rounded-md overflow-hidden">
                              <button
                                onClick={() => decrement(product.id)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700"
                                disabled={!existingItem || existingItem.quantity === 0}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-10 h-8 flex items-center justify-center bg-white border-t border-b border-gray-200 font-medium">
                                {quantities[product.id]}
                              </span>
                              <button
                                onClick={() => addToCart(product)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700"
                                disabled={isStockExceeded}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="w-full bg-red-100 text-red-600 py-2 rounded-lg font-medium"
                              disabled
                            >
                              Agotado
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center mt-4">
              {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`mx-1 px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/2 bg-white p-4 shadow-md rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-600 p-1 rounded-md mr-2">
                    <User size={18} />
                  </span>
                  <span className="font-bold text-lg">Cliente</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar cliente:</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Venta Anónima</span>
                    <button
                      onClick={handleAnonimoChange}
                      className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${isAnonimo ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${isAnonimo ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={clienteSearchTerm}
                      onChange={(e) => setClienteSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isAnonimo}
                    />
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    {clienteSearchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {loadingClientes ? (
                          <p className="px-4 py-2 text-sm text-gray-500">Cargando clientes...</p>
                        ) : filteredClientes.length === 0 ? (
                          <p className="px-4 py-2 text-sm text-gray-500">No se encontraron clientes</p>
                        ) : (
                          filteredClientes.map(cliente => (
                            <button
                              key={cliente.id}
                              onClick={() => {
                                setSelectedCliente(cliente);
                                setClienteSearchTerm('');
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                            >
                              {cliente.nombre}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de pago:</label>
                <select
                  value={estadoPago}
                  onChange={handleEstadoPagoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Parcial">Parcial</option>
                </select>
                {showWarning && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle size={16} />
                    <span>Pendiente o Parcial no puede ser anónimo.</span>
                  </div>
                )}
              </div>

              {estadoPago === 'Parcial' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adelanto (S/):</label>
                  <input
                    type="number"
                    value={adelanto}
                    onChange={handleAdelantoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max={total}
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto pagado (S/):</label>
                <input
                  type="number"
                  value={montoPagado}
                  onChange={handleMontoPagadoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                {vuelto > 0 && (
                  <div className="mt-2 text-sm text-green-600">
                    Vuelto: <b>S/ {vuelto.toFixed(2)}</b>
                  </div>
                )}
              </div>

              <div className="py-2 border-t border-b border-gray-200 mb-4">
                <p className="text-sm text-gray-500">
                  {selectedCliente ? `Cliente: ${selectedCliente.nombre}` : "Cliente Anónimo"}
                </p>
              </div>
            </div>

            <div className="w-full lg:w-1/2 bg-white p-4 shadow-md rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-600 p-1 rounded-md mr-2">
                    <ShoppingCart size={18} />
                  </span>
                  <span className="font-bold text-lg">Carrito</span>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShoppingCart size={24} className="text-gray-400" />
                  </div>
                  <p>No hay productos en el carrito</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto mb-4 pr-1">
                  {cart.map(item => {
                    if (!item || (!item.precio && !item.precioEditado)) {
                      console.error("Producto o precio no definido en el carrito:", item);
                      return null;
                    }

                    const isCategoriaEspecial = categoriasEspeciales.includes(item.categoria);

                    return (
                      <div key={item.id} className="py-2 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">{item.nombre}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {isCategoriaEspecial ? (
                          <div className="mt-1 text-sm text-gray-600">
                            {item.categoria !== "Préstamo" && (
                              <div className="flex items-center gap-1">
                                <Weight size={14} className="text-gray-500" />
                                <span>El precio del kilo está a S/ {item.precio.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="number"
                                value={item.precioKilo || ''}
                                placeholder="Ingresa el precio"
                                onChange={(e) => updatePrecioKilo(item.id, e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                              />
                              <span className="text-gray-600">Total: S/ {(item.precioKilo || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>{item.quantity} x S/</span>
                              {editingProductId === item.id ? (
                                <>
                                  <input
                                    type="number"
                                    value={editedPrice}
                                    onChange={(e) => setEditedPrice(e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                                  />
                                  <button
                                    onClick={() => saveEditedPrice(item.id)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                                  >
                                    Guardar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span>{item.precioEditado || item.precio}</span>
                                  <button
                                    onClick={() => handleEditPrice(item.id, item.precioEditado || item.precio)}
                                    className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                            <span className="ml-auto font-medium">S/ {(item.quantity * (item.precioEditado || item.precio)).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg text-blue-600">S/ {total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleFinalizarVenta}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 mt-4 font-medium flex items-center justify-center gap-2 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Finalizar Venta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddProductModal && (
        <NuevoProductoModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
        />
      )}
    </div>
  );
};

export default NuevaVentaModal;
