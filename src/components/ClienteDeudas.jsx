    import React, { useState, useEffect, useRef } from 'react';
    import { 
      Loader2, 
      Search, 
      User, 
      ShoppingBag, 
      AlertCircle,
      Check,
      CheckCircle,
      Clock,
      Calendar,
      ChevronDown,
      ChevronUp,
      Package,
      CreditCard,
      DollarSign,
      ArrowLeft,
      Download,
      Printer
    } from 'lucide-react';

    const ClienteDeudas = ({ clientesConDeudas, loadingClientes, getVentasCliente }) => {
      // Estados
      const [searchTerm, setSearchTerm] = useState('');
      const [filteredClientes, setFilteredClientes] = useState([]);
      const [drawerOpen, setDrawerOpen] = useState(false);
      const [selectedCliente, setSelectedCliente] = useState(null);
      const [ventasCliente, setVentasCliente] = useState([]);
      const [loadingVentas, setLoadingVentas] = useState(false);
      const [selectedVentas, setSelectedVentas] = useState([]);
      const [totalSeleccionado, setTotalSeleccionado] = useState(0);
      const [expandedVentas, setExpandedVentas] = useState({});
      const [showDeudaDrawer, setShowDeudaDrawer] = useState(false);
      const [ventasParaComprobante, setVentasParaComprobante] = useState([]);
      const ticketRef = useRef(null);

      // Filtrar clientes
      useEffect(() => {
        if (clientesConDeudas) {
          setFilteredClientes(
            clientesConDeudas.filter(cliente => 
              cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
        }
      }, [searchTerm, clientesConDeudas]);

      // Formatear fecha y hora
      const formatFechaHora = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return {
          fecha: fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          hora: fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        };
      };

      // Formatear número a 2 decimales
      const formatNumber = (num) => {
        return parseFloat(num || 0).toFixed(2);
      };

      // Obtener fecha legible para el comprobante
      const getFechaLegible = () => {
        const now = new Date();
        return now.toLocaleDateString('es-PE', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      // Abrir drawer y cargar ventas del cliente
      const openDrawer = async (cliente) => {
        setSelectedCliente(cliente);
        setLoadingVentas(true);
        setDrawerOpen(true);
        setSelectedVentas([]);
        setExpandedVentas({});
        
        try {
          const ventas = await getVentasCliente(cliente.clienteId);
          const ventasConHora = ventas.map(venta => {
            const { fecha, hora } = formatFechaHora(venta.fecha);
            return {
              ...venta,
              fechaFormateada: fecha,
              horaFormateada: hora
            };
          });
          setVentasCliente(ventasConHora);
        } catch (error) {
          console.error("Error cargando ventas:", error);
        } finally {
          setLoadingVentas(false);
        }
      };

      // Manejar selección de ventas
      const toggleVentaSelection = (ventaId) => {
        setSelectedVentas(prev => {
          const newSelection = prev.includes(ventaId) 
            ? prev.filter(id => id !== ventaId)
            : [...prev, ventaId];
          
          const total = ventasCliente
            .filter(v => newSelection.includes(v.id))
            .reduce((sum, v) => sum + (v.montoPendiente || 0), 0);
          
          setTotalSeleccionado(total);
          return newSelection;
        });
      };

      // Seleccionar todas las ventas
      const selectAllVentas = () => {
        const allVentasIds = ventasCliente.map(v => v.id);
        
        if (selectedVentas.length === allVentasIds.length) {
          // Deseleccionar todas
          setSelectedVentas([]);
          setTotalSeleccionado(0);
        } else {
          // Seleccionar todas
          setSelectedVentas(allVentasIds);
          const total = ventasCliente.reduce((sum, v) => sum + (v.montoPendiente || 0), 0);
          setTotalSeleccionado(total);
        }
      };

      // Toggle accordion
      const toggleAccordion = (ventaId) => {
        setExpandedVentas(prev => ({
          ...prev,
          [ventaId]: !prev[ventaId]
        }));
      };

      // Generar comprobante de deudas
      const generarComprobanteDeudas = () => {
        const ventasSeleccionadas = ventasCliente.filter(v => selectedVentas.includes(v.id));
        setVentasParaComprobante(ventasSeleccionadas);
        setShowDeudaDrawer(true);
      };

      // Descargar comprobante como imagen
      const downloadTicket = () => {
        console.log("Descargando comprobante...");
        // Implementar lógica de descarga aquí
      };

      // Imprimir comprobante
      const handlePrint = () => {
        console.log("Imprimiendo comprobante...");
        // Implementar lógica de impresión aquí
      };

      // Manejar pago
      const handlePagar = () => {
        console.log("Ventas seleccionadas para pago:", selectedVentas);
        console.log("Total a pagar:", totalSeleccionado);
        setDrawerOpen(false);
      };

      // Obtener el código corto de la venta
      const getCodigoCorto = (ventaId) => {
        return ventaId ? ventaId.substring(0, 6).toUpperCase() : '';
      };

      // Calcular total pagado en ventas parciales
      const calcularPagado = (venta) => {
        if (venta.estadoPago === 'Parcial') {
          return (venta.total || 0) - (venta.montoPendiente || 0);
        }
        return 0;
      };

      return (
        <div className="w-full relative bg-gray-50 ">
          {/* Lista de clientes */}
          <div className="max-w-lg mx-auto p-4">
            {/* Search Bar */}
            {!loadingClientes && clientesConDeudas.length > 0 && (
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-0 shadow-sm bg-white focus:ring-2 focus:ring-[#44943b] transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            
            {/* Content */}
            <div className="space-y-4">
              {loadingClientes ? (
                 <div className="space-y-4">
                 {Array(6).fill().map((_, index) => (
                   <div 
                     key={index} 
                     className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-200 animate-pulse"
                   >
                     <div className="flex justify-between items-center">
                       <div className="flex items-center">
                         <div className="bg-gray-200 p-3 rounded-lg mr-3 w-10 h-10"></div>
                         <div>
                           <div className="h-4 bg-gray-200 rounded w-36 mb-2"></div>
                           <div className="h-3 bg-gray-200 rounded w-28"></div>
                         </div>
                       </div>
                       
                       <div className="flex flex-col items-end">
                         <div className="bg-gray-200 w-24 h-6 rounded-full"></div>
                         <div className="mt-2 w-24 h-8 bg-gray-200 rounded-lg"></div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
              ) : filteredClientes.length === 0 ? (
                <div className="bg-white rounded-xl py-16 px-6 text-center shadow-sm">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No hay resultados</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm ? 'No se encontraron clientes con ese nombre' : 'No hay clientes con deudas pendientes'}
                  </p>
                </div>
              ) : (
                filteredClientes.map(cliente => (
                  <div 
                    key={cliente.clienteId} 
                    className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-[#44943b] hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-blue-50 p-3 rounded-lg mr-3">
                          <User size={20} className="text-[#44943b]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{cliente.nombre}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <ShoppingBag size={12} className="mr-1.5" />
                            <span>
                              {cliente.ventasPendientes} {cliente.ventasPendientes === 1 ? 'venta pendiente' : 'ventas pendientes'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="bg-red-50 px-3 py-1 rounded-full">
                          <p className="font-bold text-red-600">S/ {cliente.totalDeuda.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => openDrawer(cliente)}
                          className="mt-2 px-4 py-1.5 text-xs bg-[#44943b] text-white font-medium rounded-lg hover:bg-[#31522e] transition-colors shadow-sm flex items-center"
                        >
                          <DollarSign size={14} className="mr-1" />
                          Ver Deudas
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Summary if there are results */}
            {!loadingClientes && filteredClientes.length > 0 && (
              <div className="mt-6 text-xs text-gray-500 text-center">
                Mostrando {filteredClientes.length} de {clientesConDeudas.length} clientes con deudas
              </div>
            )}
          </div>

          {/* Drawer para mostrar deudas */}
          {drawerOpen && (
            <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto flex flex-col">
              {/* Encabezado fijo */}
              <div className="sticky top-0 bg-white z-10 p-4 border-b shadow-sm">
                <div className="max-w-lg mx-auto flex justify-between items-center">
                  <div className="flex items-center">
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="mr-3 p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">{selectedCliente?.nombre}</h2>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <DollarSign size={12} className="mr-1" />
                        Deuda total: 
                        <span className="font-bold text-red-600 ml-1">S/ {selectedCliente?.totalDeuda.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="flex-grow p-4 pb-24">
                <div className="max-w-lg mx-auto">
                  {loadingVentas ? (
                    <div className="flex justify-center items-center h-48">
                      <Loader2 className="animate-spin text-[#44943b]" size={32} />
                    </div>
                  ) : ventasCliente.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                      <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-800">No hay ventas pendientes</h3>
                      <p className="text-sm text-gray-500 mt-2">Este cliente no tiene deudas registradas</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Seleccionar todo */}
                      <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex items-center justify-between">
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={selectAllVentas}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            selectedVentas.length === ventasCliente.length && ventasCliente.length > 0
                              ? 'bg-[#44943b] border-[#44943b]'
                              : 'border-gray-300'
                          }`}>
                            {selectedVentas.length === ventasCliente.length && ventasCliente.length > 0 && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Seleccionar todas las ventas
                          </span>
                        </div>
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                          {selectedVentas.length} de {ventasCliente.length}
                        </div>
                      </div>

                      {/* Lista de ventas */}
                      {ventasCliente.map(venta => (
                        <div key={venta.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          {/* Cabecera del acordeón */}
                          <div className="flex items-center p-4 border-l-4 border-[#44943b]">
                            <div 
                              onClick={() => toggleVentaSelection(venta.id)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mr-3 cursor-pointer ${
                                selectedVentas.includes(venta.id) 
                                  ? 'bg-[#44943b] border-[#44943b]'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedVentas.includes(venta.id) && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                            
                            <div className="flex-1" onClick={() => toggleAccordion(venta.id)}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="bg-blue-50 px-2 py-1 rounded text-xs font-bold text-blue-700">
                                  Venta #{getCodigoCorto(venta.id)}
                                  </div>
                                  <div className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                    venta.estadoPago === 'Pendiente' 
                                      ? 'bg-red-50 text-red-600' 
                                      : 'bg-yellow-50 text-yellow-600'
                                  }`}>
                                    {venta.estadoPago}
                                  </div>
                                </div>
                                <p className="font-bold text-gray-800">
                                  S/ {(venta.montoPendiente || 0).toFixed(2)}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center text-xs text-gray-500 space-x-3">
                                  <div className="flex items-center">
                                    <Clock size={12} className="mr-1" />
                                    <span>{venta.horaFormateada}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar size={12} className="mr-1" />
                                    <span>{venta.fechaFormateada}</span>
                                  </div>
                                </div>
                                
                                <button className="text-[#44943b] flex items-center text-xs font-medium">
                                  {expandedVentas[venta.id] ? (
                                    <>
                                      <ChevronUp size={16} className="mr-1" />
                                      Ocultar
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={16} className="mr-1" />
                                      Ver productos
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Contenido del acordeón */}
                          {expandedVentas[venta.id] && (
                            <div className="border-t p-4 bg-gray-50">
                              <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
                                <Package size={14} className="mr-2 text-[#44943b]" />
                                Detalle de productos
                              </h4>
                              
                              <div className="space-y-3">
                                {venta.productos?.map((producto, index) => (
                                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{producto.nombreProducto || 'Producto no encontrado'}</p>
                                      <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-500">
                                          {producto.cantidad} × S/ {producto.precioUnitario?.toFixed(2) || '0.00'}
                                        </p>
                                        <p className="font-bold text-sm">
                                          S/ {(
                                            producto.cantidad * 
                                            (producto.precioUnitario || 0)
                                          ).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
                                <div className="flex justify-between text-[12px]">
                                  <span>Subtotal:</span>
                                  <span className="font-medium">S/ {formatNumber(venta.total)}</span>
                                </div>
                                
                                {venta.estadoPago === 'Parcial' && (
                                  <>
                                    <div className="flex justify-between text-green-700 text-[12px]">
                                      <span>Pagado:</span>
                                      <span className="font-medium">S/ {formatNumber(calcularPagado(venta))}</span>
                                    </div>
                                    <div className="flex justify-between text-red-700 font-bold text-[12px]">
                                      <span>Pendiente:</span>
                                      <span>S/ {formatNumber(venta.montoPendiente)}</span>
                                    </div>
                                  </>
                                )}
                                
                                <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300">
                                  <span>TOTAL:</span>
                                  <span>S/ {formatNumber(venta.total)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de acciones fija en la parte inferior */}
              {ventasCliente.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                  <div className="max-w-lg mx-auto">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <ShoppingBag size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Seleccionadas:</p>
                          <p className="font-medium">{selectedVentas.length} ventas</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <DollarSign size={16} className="text-green-600" />
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs">Total pendiente:</p>
                          <p className="text-lg font-bold text-green-600">S/ {totalSeleccionado.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePagar}
                        disabled={selectedVentas.length === 0}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                          selectedVentas.length > 0
                            ? 'bg-[#44943b] text-white hover:shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <CreditCard className="mr-2" size={18} />
                        {selectedVentas.length > 0 
                          ? `Pagar ${selectedVentas.length} ventas` 
                          : 'Seleccione ventas'
                        }
                      </button>
                      
                      <button
                        onClick={generarComprobanteDeudas}
                        disabled={selectedVentas.length === 0}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                          selectedVentas.length > 0
                            ? 'bg-blue-600 text-white hover:shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle className="mr-2" size={18} />
                        Comprobante
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drawer de comprobante de deudas */}
          {showDeudaDrawer && (
            <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
              {/* Header */}
              <div className="bg-white p-4 flex justify-between items-center shadow-sm border-b">
                <button 
                  onClick={() => setShowDeudaDrawer(false)} 
                  className="p-2"
                  title="Volver"
                >
                  <ArrowLeft size={24} className="text-[#44943b]" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">COMPROBANTE DE DEUDAS</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={downloadTicket} 
                    className="p-2 text-[#44943b] hover:text-[#367c2e] transition-colors"
                    title="Descargar comprobante"
                  >
                    <Download size={20} />
                  </button>
                  <button 
                    onClick={handlePrint} 
                    className="p-2 text-[#44943b] hover:text-[#367c2e] transition-colors"
                    title="Imprimir comprobante"
                  >
                    <Printer size={20} />
                  </button>
                </div>
              </div>

{/* Contenido principal - Vista previa del comprobante */}
<div className="flex-1 overflow-y-auto p-4">
  <div className="bg-white rounded-lg shadow-sm max-w-md mx-auto">
    <div 
      className="bg-white p-4 w-full text-xs mx-auto"
      style={{
        fontFamily: "'Courier New', monospace",
        lineHeight: '1.5',
        color: '#000'
      }}
    >
      <div className="text-center font-bold mb-3">
        <div className="text-[15px] mb-1 tracking-tight">COMPROBANTE DE DEUDAS</div>
        <div className="text-[10px] opacity-80">
          {getFechaLegible()}
        </div>
      </div>

      <div className="text-[11px] mb-3 border-b pb-2 border-gray-300">
        <div className="font-semibold">Cliente: {selectedCliente?.nombre || "Consumidor Final"}</div>
        <div className="text-red-700 font-bold">
          Total a pagar: S/ {formatNumber(totalSeleccionado)}
        </div>
      </div>

      {ventasParaComprobante.map((venta, index) => (
        <div key={index} className="mb-4 border-b border-gray-200 pb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-bold text-[12px]">Venta #{getCodigoCorto(venta.id)}</div>
              <div className="text-[10px] text-gray-500">
                {venta.fechaFormateada} - {venta.horaFormateada}
              </div>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              venta.estadoPago === 'Pendiente' 
                ? 'bg-red-50 text-red-600' 
                : 'bg-yellow-50 text-yellow-600'
            }`}>
              {venta.estadoPago}
            </div>
          </div>

          {/* Detalle de productos con cantidad y precio unitario */}
          <div className="mb-2">
            <div className="text-[11px] font-medium mb-1">Detalle de productos:</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {venta.productos?.map((producto, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <div>
                    <span className="font-medium">{producto.nombreProducto || 'Producto'}</span>
                    <div className="text-gray-500 text-[10px]">
                      {producto.cantidad} × S/ {producto.precioUnitario?.toFixed(2)}
                    </div>
                  </div>
                  <span className="font-medium">
                    S/ {formatNumber(producto.cantidad * producto.precioUnitario)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen por venta */}
          <div className="bg-gray-50 p-2 rounded-lg mt-2">
            <div className="grid grid-cols-2 gap-1 text-[11px]">

              
              {venta.estadoPago === 'Parcial' && (
                <>
                  <div className="text-green-600">Pagado anteriormente:</div>
                  <div className="text-right text-green-600">
                    S/ {formatNumber(venta.total - venta.montoPendiente)}
                  </div>
                </>
              )}
              
              <div className="font-bold">Total a pagar:</div>
              <div className="text-right font-bold text-red-600">
                S/ {formatNumber(venta.estadoPago === 'Parcial' ? venta.montoPendiente : venta.total)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Resumen final */}
      <div className="pt-3 border-t border-gray-300 mt-4">
        <div className="bg-[#f8f8f8] p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-sm">TOTAL A PAGAR:</span>
            <span className="font-bold text-xl text-red-600">S/ {formatNumber(totalSeleccionado)}</span>
          </div>
          <div className="text-[10px] text-gray-500 text-right">
            Incluye {ventasParaComprobante.length} {ventasParaComprobante.length === 1 ? 'venta' : 'ventas'}
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] mt-4 opacity-80">
        ¡Gracias por su preferencia!
      </div>
    </div>
  </div>
</div>

              {/* Footer */}
              <div className="p-4 bg-white border-t flex justify-center">
                <button 
                  onClick={() => setShowDeudaDrawer(false)}
                  className="px-5 py-2 bg-[#44943b] text-white rounded-lg flex items-center justify-center hover:bg-[#367c2e] transition-colors"
                >
                  Cerrar Comprobante
                </button>
              </div>

              {/* Comprobante oculto para generación de imagen/impresión */}
              <div className="fixed -left-[9999px]">
                <div
                  ref={ticketRef}
                  className="bg-white p-4 w-[262px] text-xs"
                  style={{
                    fontFamily: "'Courier New', monospace",
                    lineHeight: '1.5',
                    color: '#000',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="text-center font-bold mb-3">
                    <div className="text-[15px] mb-1 tracking-tight">COMPROBANTE DE DEUDAS</div>
                    <div className="text-[10px] opacity-80">
                      {getFechaLegible()}
                    </div>
                  </div>

                  <div className="text-[11px] mb-3 border-b pb-2 border-gray-300">
                    <div className="font-semibold">Cliente: {selectedCliente?.nombre || "Consumidor Final"}</div>
                    <div className="text-red-700 font-bold">
                      Total pendiente: S/ {formatNumber(totalSeleccionado)}
                    </div>
                  </div>

                  {ventasParaComprobante.map((venta, index) => (
                    <div key={index} className="mb-4 border-b border-gray-200 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-[12px]">Venta #{getCodigoCorto(venta.id)}</div>
                          <div className="text-[10px] text-gray-500">
                            {venta.fechaFormateada} - {venta.horaFormateada}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          venta.estadoPago === 'Pendiente' 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {venta.estadoPago}
                        </div>
                      </div>

                      <div className="space-y-2 mb-2">
                        {venta.productos?.map((producto, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>{producto.nombreProducto || 'Producto no encontrado'}</span>
                            <span className="font-medium">
                              S/ {formatNumber(producto.cantidad * producto.precioUnitario)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">S/ {formatNumber(venta.total)}</span>
                        </div>
                        
                        {venta.estadoPago === 'Parcial' && (
                          <>
                            <div className="flex justify-between text-green-700">
                              <span>Pagado:</span>
                              <span className="font-medium">S/ {formatNumber(calcularPagado(venta))}</span>
                            </div>
                            <div className="flex justify-between text-red-700 font-bold">
                              <span>Pendiente:</span>
                              <span>S/ {formatNumber(venta.montoPendiente)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between font-bold text-base">
                      <span>TOTAL DEUDA:</span>
                      <span>S/ {formatNumber(totalSeleccionado)}</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] mt-4 opacity-80">
                    ¡Gracias por su preferencia!
                  </div>
                  <div className="text-center text-[9px] mt-1 opacity-60">
                    Este comprobante detalla las deudas pendientes
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default ClienteDeudas;