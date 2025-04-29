import React, { useState, useEffect } from 'react';
import { ShoppingBasket, ShoppingBag, Store, ArrowLeft, Plus, Minus, Search, X, Trash2, AlertTriangle, Check, Weight } from 'lucide-react';
import Logo from '../img/Logo.png';
import { useProduct } from '../context/ProductContext';
import { useCliente } from '../context/ClienteContext';
import { useVenta } from '../context/VentaContext';
import FinalizarVentaDrawer from '../components/FinalizarVentaDrawer';
import TicketDrawer from '../components/TicketDrawer';
import NuevoProductoDrawer from '../components/NuevoProductoDrawer'; // Importa el nuevo drawer
import { Link, useLocation } from 'react-router-dom';

export default function VentasMovile() {
  const [activeOption, setActiveOption] = useState('caja');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Material Escolar');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [saleActive, setSaleActive] = useState(false);
  const [priceEditDrawerOpen, setPriceEditDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newUnitPrice, setNewUnitPrice] = useState('');
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pagado');
  const [partialPaymentAmount, setPartialPaymentAmount] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [status, setStatus] = useState(null);
  const [currentVenta, setCurrentVenta] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [isNuevoProductoDrawerOpen, setIsNuevoProductoDrawerOpen] = useState(false); // Estado para el nuevo drawer

  const { products, loading: productLoading } = useProduct();
  const { clientes, loading: clienteLoading, addCliente } = useCliente();
  const { addVenta } = useVenta();

  const categories = [
    'Dulces y Snacks',
    'Bebidas',
    'Productos de Tabaco',
    'Frutas y Verduras',
    'Productos de abarrotes',
    'Nutrición Animal',
    'Productos de Limpieza',
    'Material Escolar',
    'Higiene Personal',
    'Pan y Postres',
    'Préstamo',
    'Impresiones y Scaneos',
    'Alimentos a Granel'
  ];

  const categoriasEspeciales = ["Préstamo", "Frutas y Verduras", "Alimentos a Granel", "Nutrición Animal"];
  const productsByCategory = categories.map(category => ({
    name: category,
    products: products.filter(product => product.categoria === category)
  }));

  const filteredProducts = searchTerm.trim() !== ''
    ? products.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.marca && product.marca.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : [];

  const isSearchActive = searchTerm.trim() !== '';

  useEffect(() => {
    if (clientSearchTerm.trim() !== '') {
      const filtered = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(clientSearchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [clientSearchTerm, clientes]);

  const handleOptionClick = (option) => {
    setActiveOption(option);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const handleProductClick = (product) => {
    if (product.stock <= 0 && !categoriasEspeciales.includes(product.categoria)) {
      return;
    }

    const existingItem = cartItems.find(item => item.product.id === product.id);
    const isSpecialCategory = categoriasEspeciales.includes(product.categoria);
    const initialQuantity = existingItem ? (isSpecialCategory ? 1 : existingItem.quantity) : 0;

    setSelectedProduct(product);
    setQuantity(initialQuantity);
    setDrawerOpen(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const increaseQuantity = () => {
    if (selectedProduct && quantity < getAvailableStock(selectedProduct)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  const getAvailableStock = (product) => {
    if (!product || !product.stock) return 0;

    if (categoriasEspeciales.includes(product.categoria)) {
      return Infinity;
    }

    const existingItem = cartItems.find(item => item.product.id === product.id);

    if (!existingItem) {
      return product.stock;
    }

    return product.stock;
  };

  const startNewSale = () => {
    setSaleActive(true);
    setActiveOption('articulos');
  };

  const addToCart = () => {
    if (selectedProduct.stock <= 0 && !categoriasEspeciales.includes(selectedProduct.categoria)) {
      closeDrawer();
      return;
    }

    const isSpecialCategory = selectedProduct && categoriasEspeciales.includes(selectedProduct.categoria);
    const cartQuantity = isSpecialCategory ? 1 : quantity;

    if (cartQuantity <= 0 || (isSpecialCategory && cartItems.some(item => item.product.id === selectedProduct.id))) {
      const existingItemIndex = cartItems.findIndex(item => item.product.id === selectedProduct.id);
      if (existingItemIndex !== -1) {
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== selectedProduct.id));
      }
      closeDrawer();
      return;
    }

    const existingItemIndex = cartItems.findIndex(item => item.product.id === selectedProduct.id);

    if (!isSpecialCategory && cartQuantity > selectedProduct.stock) {
      alert(`Solo hay ${selectedProduct.stock} unidades disponibles de ${selectedProduct.nombre}`);
      return;
    }

    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity = cartQuantity;
      updatedCartItems[existingItemIndex].subtotal = updatedCartItems[existingItemIndex].customPrice
        ? updatedCartItems[existingItemIndex].customPrice * cartQuantity
        : updatedCartItems[existingItemIndex].product.precio * cartQuantity;

      setCartItems(updatedCartItems);
    } else {
      const newItem = {
        id: Date.now(),
        product: selectedProduct,
        quantity: cartQuantity,
        subtotal: isSpecialCategory ? selectedProduct.precio : selectedProduct.precio * cartQuantity,
        customPrice: isSpecialCategory ? null : undefined
      };

      setCartItems(prevItems => [...prevItems, newItem]);
    }

    setSaleActive(true);
    closeDrawer();
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));

    if (cartItems.length === 1) {
      setSaleActive(false);
    }
  };

  const updateCartItemQuantity = (itemId, newQuantity) => {
    const item = cartItems.find(item => item.id === itemId);

    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
            ...item,
            quantity: newQuantity,
            subtotal: item.customPrice
              ? item.customPrice * newQuantity
              : item.product.precio * newQuantity
          }
          : item
      )
    );
  };

  const updateCartItemPrice = (itemId, newPrice) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, subtotal: price }
          : item
      )
    );
  };

  const updatePrecioKilo = (itemId, newPrecioKilo) => {
    const precioKilo = parseFloat(newPrecioKilo);
    if (isNaN(precioKilo)) return;

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, precioKilo: precioKilo }
          : item
      )
    );
  };

  const openPriceEditDrawer = (item) => {
    if (categoriasEspeciales.includes(item.product.categoria)) {
      return;
    }

    setEditingItem(item);
    setNewUnitPrice(item.customPrice ? item.customPrice.toFixed(2) : item.product.precio.toFixed(2));
    setPriceEditDrawerOpen(true);
  };

  const confirmPriceChange = () => {
    const price = parseFloat(newUnitPrice);
    if (isNaN(price) || price <= 0) {
      alert('Por favor ingrese un precio válido');
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === editingItem.id
          ? {
            ...item,
            customPrice: price,
            subtotal: price * item.quantity
          }
          : item
      )
    );

    setPriceEditDrawerOpen(false);
    setEditingItem(null);
    setNewUnitPrice('');
  };

  const cancelSale = () => {
    setCartItems([]);
    setSaleActive(false);
  };

  const completeSale = () => {
    setCustomerDetailsOpen(true);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
  const resetCustomerDetails = () => {
    setClientSearchTerm('');
    setSelectedClient(null);
    setPaymentStatus('pagado');
    setPartialPaymentAmount('');
  };

  const finalizeSale = async () => {
    setStatus('loading');

    if (paymentStatus === 'parcial' && (isNaN(parseFloat(partialPaymentAmount)) || parseFloat(partialPaymentAmount) <= 0)) {
      alert('Por favor ingrese un monto válido para el pago parcial');
      setStatus(null);
      return;
    }

    if ((paymentStatus === 'pendiente' || paymentStatus === 'parcial') && !selectedClient) {
      alert('Por favor seleccione un cliente para el estado de pago pendiente o parcial');
      setStatus(null);
      return;
    }

    const fechaActual = new Date().toISOString();
    const adelanto = paymentStatus === 'parcial' ? parseFloat(partialPaymentAmount) : 0;

    const venta = {
      clienteId: selectedClient ? selectedClient.id : null,
      productos: cartItems.map(item => ({
        productoId: item.product.id,
        cantidad: item.quantity,
        precioUnitario: item.customPrice || item.product.precio,
        subtotal: item.subtotal
      })),
      total: cartTotal,
      estadoPago: paymentStatus === 'pagado' ? 'Pagado' :
        paymentStatus === 'pendiente' ? 'Pendiente' : 'Parcial',
      montoPendiente: paymentStatus === 'parcial' ? cartTotal - adelanto :
        paymentStatus === 'pendiente' ? cartTotal : 0,
      fecha: fechaActual,
    };

    try {
      const resultado = await addVenta(venta);
      if (resultado.success) {
        setCurrentVenta(resultado.venta);
        setStatus('success');
        resetCustomerDetails();
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error al finalizar la venta:', error);
      setStatus('error');
    }
  };

  const formatPrice = (price) => {
    return `S/ ${Number(price).toFixed(2)}`;
  };

  const isSpecialCategoryProduct = (product) => {
    return product && categoriasEspeciales.includes(product.categoria);
  };

  const isProductInCart = (productId) => {
    return cartItems.some(item => item.product.id === productId);
  };

  // Resto del código de renderizado (igual que antes)
  return (
    <div className="fixed inset-0 flex flex-col w-full h-full bg-gray-100">
      {/* Capa superior con botón de volver y logo */}
      <div className="absolute top-0 left-0 right-0 flex items-center p-2 z-10">
  <Link to="/">
    <button className="p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-200">
      <ArrowLeft className="text-gray-700" size={20} />
    </button>
  </Link>
  <div className="flex-1 flex justify-center">
    <div className="h-12 w-32 rounded-md flex items-center justify-center">
      <img src={Logo} alt="Logo" className="h-full w-auto" />
    </div>
  </div>
  <div className="w-10"></div>
</div>

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col pt-16 px-2 overflow-y-auto">
        {activeOption === 'caja' && (
          <div className="flex flex-col w-full h-full">
            {!saleActive ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <button
                  onClick={startNewSale}
                  className="bg-[#44943b] p-7 rounded-lg shadow-md mb-3 flex flex-col items-center w-full max-w-md"
                >
                  <Plus size={36} className="text-white mb-1" />
                  <span className="text-white font-medium text-sm">Nueva Venta</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-full bg-white ">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-base text-gray-800">Venta en curso</h2>
                    <span className="text-sm text-[#44943b] font-medium">{cartItems.length} items</span>
                  </div>

                  {cartItems.length > 0 ? (
                    <div>
                      <div className="max-h-[70vh] overflow-y-auto pb-1">
                        {cartItems.map((item) => (
                          <div key={item.id} className="border-b border-gray-100 py-2">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-sm pr-2">{item.product.nombre}</p>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1 text-red-500"
                                aria-label="Eliminar producto"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <p className="text-xs text-gray-500 mb-1">
                              {categoriasEspeciales.includes(item.product.categoria) && item.product.categoria !== "Préstamo"
                                ? `Ref: ${formatPrice(item.product.precio)}/kg`
                                : `${formatPrice(item.customPrice || item.product.precio)} c/u`}
                              {!categoriasEspeciales.includes(item.product.categoria) &&
                                <span className="ml-2">(Stock: {item.product.stock})</span>}
                            </p>

                            {!categoriasEspeciales.includes(item.product.categoria) ? (
                              <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center bg-gray-50 rounded-md">
                                  <button
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                    className="w-18 h-10 flex items-center justify-center"
                                  >
                                    <Minus size={22} className="text-gray-700" />
                                  </button>
                                  <span className="mx-2 text-sm font-extrabold">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                    className="w-18 h-10 flex items-center justify-center"
                                    disabled={item.quantity >= item.product.stock}
                                  >
                                    <Plus size={22} className={item.quantity >= item.product.stock ? "text-gray-300" : "text-gray-700"} />
                                  </button>
                                </div>

                                <div className="text-right">
                                  <button
                                    onClick={() => openPriceEditDrawer(item)}
                                    className="text-xs text-gray-500 underline mb-1"
                                  >
                                    Editar precio
                                  </button>
                                  <p className="font-medium text-sm text-[#44943b]">
                                    {formatPrice(item.subtotal)}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1">
                                <div className="mt-1 text-sm text-gray-600">
                                  {item.categoria !== "Préstamo" && (
                                    <div className="flex items-center gap-1">
                                      <Weight size={14} className="text-gray-500" />
                                      <span>El precio del kilo está a S/ {item.product.precio.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="relative">
                                      <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                                      <input
                                        type="number"
                                        value={item.precioKilo || ''}
                                        placeholder="Ingresa el precio"
                                        onChange={(e) => updatePrecioKilo(item.id, e.target.value)}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                                      />
                                    </div>
                                    <span className="text-gray-600">Total: S/ {(item.precioKilo || 0).toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <div className="text-xs text-gray-500">
                                    {item.product.precio > 0 && item.product.categoria !== "Préstamo" && (
                                      <span>~{(item.subtotal / item.product.precio).toFixed(2)} kg</span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs text-gray-500">Subtotal:</span>
                                    <p className="font-medium text-sm text-[#44943b]">
                                      {formatPrice(item.subtotal)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="border-t mt-2 pt-2">
                        <div className="flex justify-between items-center py-1 mt-1">
                          <span className="font-medium text-sm">TOTAL:</span>
                          <span className="font-bold text-base text-[#44943b]">{formatPrice(cartTotal)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          onClick={cancelSale}
                          className="py-3 bg-red-500 text-white text-xs font-medium rounded-md flex items-center justify-center"
                        >
                          <X size={12} className="mr-1" /> Cancelar
                        </button>

                        <button
                          onClick={() => setActiveOption('articulos')}
                          className="py-3 bg-blue-500 text-white text-xs font-medium rounded-md flex items-center justify-center"
                        >
                          <Plus size={12} className="mr-1" /> Agregar
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-3">
                        <button
                          onClick={completeSale}
                          className="py-3 bg-[#44943b] text-white rounded-md flex items-center justify-center font-extrabold"
                        >
                          Cobrar: {formatPrice(cartTotal)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag size={24} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500 mb-3">No hay productos en el carrito</p>
                      <button
                        onClick={() => setActiveOption('articulos')}
                        className="py-2 px-4 bg-[#44943b] text-white text-xs font-medium rounded-md flex items-center justify-center mx-auto"
                      >
                        <Plus size={12} className="mr-1" /> Agregar productos
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeOption === 'articulos' && (
          <div className="flex flex-col w-full">
            {/* Buscador y botón de nuevo producto */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  className="text-sm w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#44943b]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearchActive && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="text-gray-400 hover:text-gray-600" size={18} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsNuevoProductoDrawerOpen(true)}
                className="bg-[#44943b] py-2 px-2 rounded-lg shadow-md text-white font-medium flex items-center justify-center whitespace-nowrap text-sm"
              >
                <Plus size={15} className="mr-1" />
                Nuevo Producto
              </button>
            </div>
            {/* Resultados de búsqueda */}
            {isSearchActive && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                <h3 className="font-semibold mb-2">Resultados de búsqueda</h3>
                {productLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#44943b]"></div>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`bg-gray-50 p-2 rounded border border-gray-200 flex flex-col items-center transition-shadow ${product.stock <= 0 && !categoriasEspeciales.includes(product.categoria) ? 'opacity-50' : 'cursor-pointer hover:shadow-md'}`}
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="w-16 h-16 mb-1 bg-gray-200 rounded-full flex items-center justify-center">
                          {cartItems.some(item => item.product.id === product.id) ? (
                            <span className="text-2xl font-bold text-[#44943b]">
                              {categoriasEspeciales.includes(product.categoria) ? "✓" : `x${cartItems.find(item => item.product.id === product.id).quantity}`}
                            </span>
                          ) : product.stock <= 0 && !categoriasEspeciales.includes(product.categoria) ? (
                            <AlertTriangle size={24} className="text-red-500" />
                          ) : (
                            <span className="text-2xl font-bold text-gray-500">{product.nombre.charAt(0)}</span>
                          )}
                        </div>
                        <div className="text-xs font-medium w-full text-center">{product.nombre}</div>
                        <div className="text-xs font-extrabold text-[#44943b]">
                          {formatPrice(product.precio)}
                          {categoriasEspeciales.includes(product.categoria) && product.categoria !== "Préstamo" && (
                            <span className="text-xs ml-1">/kilo</span>
                          )}
                        </div>
                        {!categoriasEspeciales.includes(product.categoria) && (
                          <div className="text-xs mt-1 text-gray-500">
                            Stock: {product.stock}
                          </div>
                        )}
                        {product.stock <= 0 && !categoriasEspeciales.includes(product.categoria) && (
                          <div className="text-xs mt-1 text-red-500 font-medium">
                            Sin stock
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}

            {/* Acordeón de categorías - Solo visible cuando no hay búsqueda activa */}
            {!isSearchActive && (
              <div className="space-y-2">
                {productsByCategory.map((category) => (
                  <div key={category.name} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className={`flex items-center justify-between p-3 cursor-pointer ${activeCategory === category.name ? 'bg-gray-50' : ''}`}
                      onClick={() => handleCategoryChange(category.name)}
                    >
                      <div className="font-semibold">
                        {category.name}
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                          {category.products.length}
                        </span>
                      </div>
                      <div className={`transform transition-transform ${activeCategory === category.name ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>

                    {activeCategory === category.name && (
                      <div className="p-3 bg-white">
                        {productLoading ? (
                          <div className="flex justify-center items-center h-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#44943b]"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {category.products.map((product) => (
                              <div
                                key={product.id}
                                className={`bg-gray-50 p-2 rounded border border-gray-200 flex flex-col items-center transition-shadow ${product.stock <= 0 && !categoriasEspeciales.includes(product.categoria) ? 'opacity-50' : 'cursor-pointer hover:shadow-md'}`}
                                onClick={() => handleProductClick(product)}
                              >
                                <div className="w-16 h-16 mb-1 bg-gray-200 rounded-full flex items-center justify-center">
                                  {cartItems.some(item => item.product.id === product.id) ? (
                                    <span className="text-2xl font-bold text-[#44943b]">
                                      {categoriasEspeciales.includes(product.categoria) ? "✓" : `x${cartItems.find(item => item.product.id === product.id).quantity}`}
                                    </span>
                                  ) : product.stock <= 0 && !categoriasEspeciales.includes(product.categoria) ? (
                                    <AlertTriangle size={24} className="text-red-500" />
                                  ) : (
                                    <span className="text-2xl font-bold text-gray-500">{product.nombre.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="text-xs font-medium w-full text-center">{product.nombre}</div>
                                <div className="text-xs font-extrabold text-[#44943b]">
                                  {formatPrice(product.precio)}
                                  {categoriasEspeciales.includes(product.categoria) && product.categoria !== "Préstamo" && (
                                    <span className="text-xs ml-1">/kilo</span>
                                  )}
                                </div>
                                {!categoriasEspeciales.includes(product.categoria) && (
                                  <div className="text-xs mt-1 text-gray-500">
                                    Stock: {product.stock}
                                  </div>
                                )}
                                {product.stock <= 0 && !categoriasEspeciales.includes(product.categoria) && (
                                  <div className="text-xs mt-1 text-red-500 font-medium">
                                    Sin stock
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Dock de navegación fijo en la parte inferior */}
      <div className="w-full py-1 px-2">
        <div className="flex justify-around max-w-xs mx-auto rounded-xl bg-[#44943b] p-1">
          <div className="flex-1">
            <button
              className={`flex flex-col items-center justify-center py-1.5 w-full px-3 rounded-lg transition-all ${activeOption === 'caja' ? 'bg-white shadow-md' : 'hover:bg-gray-400 text-white'}`}
              onClick={() => handleOptionClick('caja')}
            >
              <div className="relative">
                <Store className={activeOption === 'caja' ? 'text-gray-700' : 'text-white'} size={18} />
                {cartItems.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </div>
                )}
              </div>
              <span className="text-xs mt-1">Caja</span>
            </button>
          </div>

          <div className="flex-1">
            <button
              className={`flex flex-col items-center justify-center py-1.5 w-full px-3 rounded-lg transition-all ${activeOption === 'articulos' ? 'bg-white shadow-md' : 'hover:bg-gray-400 text-white'}`}
              onClick={() => handleOptionClick('articulos')}
            >
              <ShoppingBasket className={activeOption === 'articulos' ? 'text-gray-700' : 'text-white'} size={18} />
              <span className="text-xs mt-1">Artículos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drawer navigation para selección de productos */}
      {drawerOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-end transition-all">
          <div className="bg-white w-full rounded-t-xl p-4 transform transition-transform duration-300 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{selectedProduct.nombre}</h3>
              <button
                onClick={closeDrawer}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>

            <div className="mb-4">
              {selectedProduct.marca && (
                <p className="text-gray-700">Marca: {selectedProduct.marca}</p>
              )}

              <p className="text-lg font-bold text-[#44943b] mt-2">
                {formatPrice(selectedProduct.precio)}
                {categoriasEspeciales.includes(selectedProduct.categoria) && selectedProduct.categoria !== "Préstamo" && (
                  <span className="text-sm ml-1">/kilo</span>
                )}
              </p>

              {!isSpecialCategoryProduct(selectedProduct) && selectedProduct.categoria !== "Préstamo" && (
                <p className="text-sm text-gray-600 mt-1">
                  Stock disponible:{" "}
                  <span className={selectedProduct.stock <= 0 ? 'font-bold text-red-500' : 'font-bold'}>
                    {selectedProduct.stock}
                  </span>{" "}
                  unidades
                </p>
              )}

              {selectedProduct.categoria === "Préstamo" ? (
                <p className="text-sm text-blue-600 mt-1">
                  Este producto corresponde a un <strong>préstamo</strong>. Consulta los términos y condiciones antes de continuar.
                </p>
              ) : isSpecialCategoryProduct(selectedProduct) ? (
                <p className="text-sm text-gray-600 mt-1">
                  Este producto se vende por kilo. El precio mostrado es por kilo y servirá como referencia.
                </p>
              ) : selectedProduct.stock <= 0 ? (
                <p className="text-sm text-red-500 mt-1 font-medium">
                  No hay stock disponible de este producto.
                </p>
              ) : cartItems.some(item => item.product.id === selectedProduct.id) && (
                <p className="text-sm text-gray-600 mt-1">
                  Ya tienes{" "}
                  <span className="font-extrabold">
                    {cartItems.find(item => item.product.id === selectedProduct.id).quantity}
                  </span>{" "}
                  unidades en el carrito.
                </p>
              )}
            </div>

            {!isSpecialCategoryProduct(selectedProduct) &&
              selectedProduct.stock > 0 &&
              selectedProduct.categoria !== "Préstamo" && (
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={decreaseQuantity}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                      disabled={quantity <= 0}
                    >
                      <Minus size={16} className={quantity <= 0 ? "text-gray-400" : "text-gray-700"} />
                    </button>
                    <span className="mx-10 font-bold text-lg">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                      disabled={quantity >= selectedProduct.stock}
                    >
                      <Plus size={16} className={quantity >= selectedProduct.stock ? "text-gray-400" : "text-gray-700"} />
                    </button>
                  </div>
                </div>
              )}

            <button
              onClick={addToCart}
              className={`w-full py-3 font-medium rounded-lg flex items-center justify-center ${(!isSpecialCategoryProduct(selectedProduct) &&
                selectedProduct.stock <= 0 &&
                selectedProduct.categoria !== "Préstamo")
                ? 'bg-gray-300 text-gray-500'
                : 'bg-[#44943b] text-white'
                }`}
              disabled={
                !isSpecialCategoryProduct(selectedProduct) &&
                selectedProduct.stock <= 0 &&
                selectedProduct.categoria !== "Préstamo"
              }
            >
              <ShoppingBag size={18} className="mr-2" />
              {isSpecialCategoryProduct(selectedProduct) ? (
                isProductInCart(selectedProduct.id) ? 'Eliminar del carrito' : 'Agregar al carrito'
              ) : selectedProduct.categoria === "Préstamo" ? (
                isProductInCart(selectedProduct.id) ? 'Quitar préstamo del carrito' : 'Solicitar préstamo'
              ) : selectedProduct.stock <= 0 ? (
                'Sin stock disponible'
              ) : quantity === 0 ? (
                'Eliminar del carrito'
              ) : cartItems.some(item => item.product.id === selectedProduct.id) ? (
                'Actualizar carrito'
              ) : (
                'Agregar al carrito'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Drawer para edición de precio unitario (solo para productos normales) */}
      {priceEditDrawerOpen && editingItem && !categoriasEspeciales.includes(editingItem.product.categoria) && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-end transition-all">
          <div className="bg-white w-full rounded-t-xl p-4 transform transition-transform duration-300 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Editar precio unitario</h3>
              <button
                onClick={() => setPriceEditDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>

            <div className="mb-4">
              <p className="font-medium">{editingItem.product.nombre}</p>
              <p className="text-sm text-gray-500 mb-2">
                Cantidad: {editingItem.quantity} unidades
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo precio unitario:</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newUnitPrice}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9.]/g, '')
                        .replace(/(\..*)\./g, '$1');

                      setNewUnitPrice(value);
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#44943b]"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-2 bg-gray-50 p-2 rounded">
                <p className="text-sm text-gray-600">Precio original: {formatPrice(editingItem.product.precio)}</p>
                <p className="text-sm font-medium text-gray-800">
                  Nuevo subtotal: {formatPrice(parseFloat(newUnitPrice || '0') * editingItem.quantity)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPriceEditDrawerOpen(false)}
                className="py-3 bg-gray-300 text-gray-700 font-medium rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPriceChange}
                className="py-3 bg-[#44943b] text-white font-medium rounded-md"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer para detalles del cliente */}
      {customerDetailsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end transition-all">
          <div
            className="bg-white w-full h-3/4 rounded-t-2xl p-5 transform transition-all duration-300 animate-slide-up shadow-xl overflow-auto"
            style={{
              maxHeight: '75vh',
              marginTop: '25vh'
            }}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-xl text-gray-800">Detalles del cliente</h3>
              <button
                onClick={() => setCustomerDetailsOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Sección del total de la venta */}
            <div className="bg-[#44943b]/10 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Total a pagar:</span>
                <span className="font-bold text-lg text-[#44943b]">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Buscar cliente:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44943b] focus:border-transparent transition-all bg-gray-50"
                    placeholder="Buscar por nombre..."
                  />
                  {clientSearchTerm && (
                    <button
                      onClick={() => {
                        setClientSearchTerm("");
                        setSelectedClient(null);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                      aria-label="Borrar búsqueda"
                    >
                      <X size={18} className="text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Lista de clientes filtrados */}
                {clientSearchTerm && filteredClients.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white shadow-sm">
                    {filteredClients.map(cliente => (
                      <div
                        key={cliente.id}
                        onClick={() => {
                          setSelectedClient(cliente);
                          setClientSearchTerm(cliente.nombre);
                        }}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedClient?.id === cliente.id ? 'bg-[#44943b]/10' : ''
                          }`}
                      >
                        <div className="font-medium">{cliente.nombre}</div>
                        {cliente.dni && <div className="text-xs text-gray-500">DNI: {cliente.dni}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Cliente seleccionado */}
                {selectedClient && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-green-800">{selectedClient.nombre}</div>
                        {selectedClient.dni && (
                          <div className="text-xs text-green-600">DNI: {selectedClient.dni}</div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedClient(null);
                          setClientSearchTerm("");
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado de pago:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('pagado')}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border-2 transition-all ${paymentStatus === 'pagado'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-1 ${paymentStatus === 'pagado' ? 'text-green-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-sm">Pagado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentStatus('pendiente')}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border-2 transition-all ${paymentStatus === 'pendiente'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-1 ${paymentStatus === 'pendiente' ? 'text-red-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-sm">Pendiente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentStatus('parcial')}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border-2 transition-all ${paymentStatus === 'parcial'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-1 ${paymentStatus === 'parcial' ? 'text-yellow-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium text-sm">Parcial</span>
                  </button>
                </div>
              </div>

              {paymentStatus === 'parcial' && (
                <div className="transition-all duration-300 animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Monto pagado:</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">S/</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={partialPaymentAmount}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^0-9.]/g, '')
                          .replace(/(\..*)\./g, '$1');
                        setPartialPaymentAmount(value);
                      }}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44943b] focus:border-transparent transition-all bg-gray-50"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Saldo pendiente: S/ {(cartTotal - (parseFloat(partialPaymentAmount) || 0)).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if ((paymentStatus === 'pendiente' || paymentStatus === 'parcial') && !selectedClient) {
                  alert('Por favor seleccione un cliente para ventas a crédito');
                  return;
                }
                finalizeSale();
              }}
              className="w-full py-3.5 mt-4 bg-[#44943b] text-white rounded-lg flex items-center justify-center font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Finalizar Venta - {formatPrice(cartTotal)}
            </button>
          </div>
        </div>
      )}

      {/* Drawer para finalización de venta */}
      {status && (
        <>
          <FinalizarVentaDrawer
            status={status}
            venta={currentVenta}
            onNuevaVenta={() => {
              setStatus(null);
              setCartItems([]);
              setSaleActive(false);
              setCustomerDetailsOpen(false);
              setCurrentVenta(null);
              resetCustomerDetails();
            }}
            onObtenerTicket={() => setShowTicket(true)}
          />

          {showTicket && currentVenta && (
            <TicketDrawer
              venta={currentVenta}
              onClose={() => setShowTicket(false)}
              onPrint={() => window.print()}
              onNewSale={() => {
                // Misma acción que en FinalizarVentaDrawer
                setStatus(null);
                setCartItems([]);
                setSaleActive(false);
                setCustomerDetailsOpen(false);
                setCurrentVenta(null);
                resetCustomerDetails();
                // No necesitas setShowTicket(false) aquí porque ya lo hace onClose
              }}
              Logo={Logo}
            />
          )}
        </>
      )}

      {/* Nuevo Producto Drawer */}
      <NuevoProductoDrawer
        isOpen={isNuevoProductoDrawerOpen}
        onClose={() => setIsNuevoProductoDrawerOpen(false)}
      />
    </div>
  );
}
