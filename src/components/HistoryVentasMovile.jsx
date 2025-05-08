import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, 
  Clock, 
  Check, 
  DollarSign, 
  Trash2, 
  Eye, 
  X, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Search,
  Filter,
  UserCheck,
  RefreshCcw,
  Download,
  Printer,
  ArrowLeft
} from 'lucide-react';
import { useVenta } from '../context/VentaContext';
import domtoimage from "dom-to-image";
import Logo from "../img/logo.png";

const HistoryVentasMovile = ({ setActiveOption }) => {
  const { ventas, loading, error, deleteVenta } = useVenta();
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const ticketRef = useRef(null);
  
  // Estados para filtros
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Aplicar filtros cuando cambian las ventas o los filtros
  useEffect(() => {
    if (!ventas) return;
    
    let result = [...ventas];
    
    // Filtrar por fecha
    if (activeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(venta => new Date(venta.fecha) >= today);
    } 
    else if (activeFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      result = result.filter(venta => {
        const ventaDate = new Date(venta.fecha);
        return ventaDate >= yesterday && ventaDate < today;
      });
    }
    else if (activeFilter === 'custom' && customDate) {
      const selectedDate = new Date(customDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(customDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);
      
      result = result.filter(venta => {
        const ventaDate = new Date(venta.fecha);
        return ventaDate >= selectedDate && ventaDate < nextDay;
      });
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(venta => 
        (venta.cliente && venta.cliente.toLowerCase().includes(term)) ||
        venta.id.toLowerCase().includes(term) ||
        venta.productos.some(p => p.nombre.toLowerCase().includes(term))
      );
    }
    
    setFilteredVentas(result);
  }, [ventas, activeFilter, customDate, searchTerm]);

  // Función para obtener el color según el estado de pago
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pagado':
        return 'from-emerald-500 to-green-600';
      case 'Pendiente':
        return 'from-rose-500 to-red-600';
      case 'Parcial':
        return 'from-amber-500 to-yellow-600';
      default:
        return 'from-slate-500 to-gray-600';
    }
  };

  // Función para obtener el icono según el estado de pago
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pagado':
        return <Check size={14} className="mr-1 inline" />;
      case 'Pendiente':
        return <Clock size={14} className="mr-1 inline" />;
      case 'Parcial':
        return <DollarSign size={14} className="mr-1 inline" />;
      default:
        return null;
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para abrir el drawer de confirmación de eliminación
  const openDeleteDrawer = (venta, e) => {
    e.stopPropagation();
    setSelectedVenta(venta);
    setShowDeleteDrawer(true);
  };

  // Función para abrir el drawer de detalles
  const openDetailsDrawer = (venta, e) => {
    e.stopPropagation();
    setSelectedVenta(venta);
    setShowDetailsDrawer(true);
  };

  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    try {
      await deleteVenta(selectedVenta.id);
      setShowDeleteDrawer(false);
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
    }
  };

  // Función para manejar el acordeón
  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Función para cambiar filtro
  const changeFilter = (filter) => {
    setActiveFilter(filter);
    if (filter !== 'custom') {
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  // Función para formatear número con 2 decimales
  const formatNumber = (num) => {
    return parseFloat(num || 0).toFixed(2);
  };

  // Función para obtener fecha legible
  const getFechaLegible = () => {
    if (!selectedVenta) return "";
    const date = new Date(selectedVenta.fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  // Obtener productos de forma segura
  const getProductos = () => {
    if (!selectedVenta) return [];
    return Array.isArray(selectedVenta.productos) ? selectedVenta.productos : [];
  };

  // Calcular subtotal
  const subtotal = getProductos().reduce((sum, p) => {
    return sum + (Number(p.cantidad || 0) * Number(p.precioUnitario || 0));
  }, 0);

  // Descargar ticket como imagen PNG
  const downloadTicket = async () => {
    try {
      const dataUrl = await domtoimage.toPng(ticketRef.current, {
        bgcolor: '#ffffff',
        quality: 1,
        width: 262 * 2,
        height: ticketRef.current.clientHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: '262px',
          height: `${ticketRef.current.clientHeight}px`
        }
      });

      const link = document.createElement('a');
      link.download = `ticket-${selectedVenta?.id || 'venta'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error al generar el ticket:', error);
      alert("Error al generar el ticket. Intente nuevamente.");
    }
  };

  // Función para imprimir el ticket
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket de Venta</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; }
            .ticket { width: 262px; margin: 0 auto; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .mb-1 { margin-bottom: 0.25rem; }
            .opacity-80 { opacity: 0.8; }
            .border-b { border-bottom: 1px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .text-red-700 { color: #b91c1c; }
            .text-green-700 { color: #15803d; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-base { font-size: 1rem; }
            .text-lg { font-size: 1.125rem; }
          </style>
        </head>
        <body>
          <div class="ticket">
            ${ticketRef.current.innerHTML}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 200);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
          <ClipboardList size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar ventas</h2>
          <p className="text-gray-600 mb-4">
            {error.message || "Ocurrió un error al cargar el historial de ventas"}
          </p>
          <button
            className="bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-md"
            onClick={() => setActiveOption('caja')}
          >
            Volver a Caja
          </button>
        </div>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
          <ClipboardList size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Historial de Ventas</h2>
          <p className="text-gray-600 mb-4">
            No hay ventas registradas aún
          </p>
          <button
            className="bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-md"
            onClick={() => setActiveOption('caja')}
          >
            Volver a Caja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">

      
      {/* Barra de búsqueda */}
      <div className="px-4 pt-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm py-2 pl-10 pr-4 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {/* Filtros */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
          <button 
            onClick={() => changeFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => changeFilter('today')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'today' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Hoy
          </button>
          <button 
            onClick={() => changeFilter('yesterday')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'yesterday' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Ayer
          </button>
          <button 
            onClick={() => changeFilter('custom')}
            className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'custom' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <Calendar size={14} className="mr-1" />
            Otra fecha
          </button>
        </div>
        
        {/* Selector de fecha personalizada */}
        {showDatePicker && (
          <div className="mt-2 bg-white p-3 rounded-lg shadow-md border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar fecha:</label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        )}
      </div>
      
      {/* Contador de resultados */}
      <div className="px-4 py-2 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {filteredVentas.length} {filteredVentas.length === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>
      
      {/* Lista de ventas */}
      <div className="space-y-3 overflow-y-auto px-4 pb-20">
        {filteredVentas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Filter size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No se encontraron ventas con el filtro actual</p>
          </div>
        ) : (
          filteredVentas.map((venta) => (
            <div key={venta.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all">
              {/* Cabecera del acordeón */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer border-l-4 border-emerald-500"
                onClick={() => toggleAccordion(venta.id)}
              >
                <div className="flex items-center">
                  {expandedId === venta.id ? 
                    <ChevronDown size={20} className="text-emerald-600 mr-2" /> : 
                    <ChevronRight size={20} className="text-emerald-600 mr-2" />
                  }
                  <div>
                    <p className="font-medium text-gray-800">Venta #{venta.id.substring(0, 6)}</p>
                    <p className="text-xs text-gray-500">{venta.cliente || "Consumidor Final"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getEstadoColor(venta.estado)} shadow-sm`}>
                    {getEstadoIcon(venta.estado)}
                    {venta.estado}
                  </span>
                  <span className="font-bold text-emerald-600">S/ {venta.total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Contenido expandible del acordeón */}
              {expandedId === venta.id && (
                <div className="p-4 pt-0 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center pt-3">
                    <p className="text-sm text-gray-600">
                      Fecha: <span className="font-medium">{formatDate(venta.fecha)}</span>
                    </p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => openDetailsDrawer(venta, e)}
                        className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                        aria-label="Ver detalles"
                      >
                        <Eye size={16} className="mr-1" />
                        <span className="text-sm">Ver</span>
                      </button>
                      <button
                        onClick={(e) => openDeleteDrawer(venta, e)}
                        className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                        aria-label="Eliminar venta"
                      >
                        <Trash2 size={16} className="mr-1" />
                        <span className="text-sm">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Drawer de confirmación de eliminación */}
      {showDeleteDrawer && selectedVenta && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center transition-all animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 transform transition-all duration-300 animate-slide-up shadow-xl">
            <div className="flex flex-col items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mb-3">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-800 text-center">¿Eliminar venta?</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Esta acción no se puede deshacer. ¿Estás seguro de eliminar Venta #{selectedVenta.id.substring(0, 6)}?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(selectedVenta.fecha)} - {selectedVenta.cliente || "Consumidor Final"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setShowDeleteDrawer(false)}
                className="py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all shadow-md"
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer lateral de detalles de venta (similar a TicketDrawer) */}
      {showDetailsDrawer && (
        <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-white p-4 flex justify-between items-center shadow-sm border-b">
            <button 
              onClick={() => setShowDetailsDrawer(false)} 
              className="p-2"
              title="Volver"
            >
              <ArrowLeft size={24} className="text-[#44943b]" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Ticket de Venta</h2>
            <div className="flex gap-3">
              <button 
                onClick={downloadTicket} 
                className="p-2 text-[#44943b] hover:text-[#367c2e] transition-colors"
                title="Descargar ticket"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={handlePrint} 
                className="p-2 text-[#44943b] hover:text-[#367c2e] transition-colors"
                title="Imprimir ticket"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>

          {/* Contenido principal - Vista previa del ticket */}
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
                <img src={Logo} alt="Logo" className="w-20 mx-auto mb-1" />
                  <div className="text-[15px] mb-1 tracking-tight">COMPROBANTE DE VENTA</div>
                  <div className="text-[10px] opacity-80">
                    Ticket #{selectedVenta?.id.substring(0, 6) || "N/A"}
                  </div>
                  <div className="text-[10px] opacity-80">
                    {getFechaLegible()}
                  </div>
                </div>

                <div className="text-[11px] mb-3 border-b pb-2 border-gray-300">
                  <div className="font-semibold">Cliente: {selectedVenta?.cliente || "Consumidor Final"}</div>
                  <div className={(selectedVenta?.montoPendiente || 0) <= 0 ? 
                    "text-green-700 font-bold" : "text-red-700 font-bold"}>
                    Estado: {(selectedVenta?.montoPendiente || 0) <= 0 ? "PAGADO" : "PENDIENTE DE PAGO"}
                  </div>
                </div>

                <div className="border-t border-b border-gray-300 py-2 my-2">
                  {getProductos().map((producto, index) => (
                    <div key={index} className="mb-2">
                      <div className="font-bold text-[12px]">{producto.nombre || "Producto sin nombre"}</div>
                      <div className="flex justify-between text-[11px]">
                        <span>
                          {producto.cantidad || 0} x S/ {formatNumber(producto.precioUnitario)}
                        </span>
                        <span className="font-medium">
                          S/ {formatNumber(producto.subtotal || (producto.cantidad * producto.precioUnitario))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span>Subtotal:</span>
                    <span className="font-medium">S/ {formatNumber(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300">
                    <span>TOTAL:</span>
                    <span>S/ {formatNumber(selectedVenta?.total)}</span>
                  </div>

                  {(selectedVenta?.montoPendiente || 0) > 0 && (
                    <div className="flex justify-between text-red-700 font-bold pt-1 text-[12px]">
                      <span>PENDIENTE:</span>
                      <span>S/ {formatNumber(selectedVenta.montoPendiente)}</span>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] mt-4 opacity-80">
                  ¡Gracias por su compra!
                </div>
                <div className="text-center text-[9px] mt-1 opacity-60">
                  Conserve este comprobante para cualquier reclamo
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t flex justify-center gap-3">
            <button 
              onClick={() => {
                setShowDetailsDrawer(false);
                setActiveOption('caja');
              }}
              className="px-5 py-2 bg-[#44943b] text-white rounded-lg flex items-center justify-center hover:bg-[#367c2e] transition-colors"
            >
              Nueva Venta
            </button>
          </div>

          {/* Ticket oculto para generación de imagen/impresión */}
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
               <img src={Logo} alt="Logo" className="w-20 mx-auto mb-1" />
                <div className="text-[15px] mb-1 tracking-tight">COMPROBANTE DE VENTA</div>
                <div className="text-[10px] opacity-80">
                  Ticket #{selectedVenta?.id.substring(0, 6) || "N/A"}
                </div>
                <div className="text-[10px] opacity-80">
                  {getFechaLegible()}
                </div>
              </div>

              <div className="text-[11px] mb-3 border-b pb-2 border-gray-300">
                <div className="font-semibold">Cliente: {selectedVenta?.cliente || "Consumidor Final"}</div>
                <div className={(selectedVenta?.montoPendiente || 0) <= 0 ? 
                  "text-green-700 font-bold" : "text-red-700 font-bold"}>
                  Estado: {(selectedVenta?.montoPendiente || 0) <= 0 ? "PAGADO" : "PENDIENTE DE PAGO"}
                </div>
              </div>

              <div className="border-t border-b border-gray-300 py-2 my-2">
                {getProductos().map((producto, index) => (
                  <div key={index} className="mb-2">
                    <div className="font-bold text-[12px]">{producto.nombre || "Producto sin nombre"}</div>
                    <div className="flex justify-between text-[11px]">
                      <span>
                        {producto.cantidad || 0} x S/ {formatNumber(producto.precioUnitario)}
                      </span>
                      <span className="font-medium">
                        S/ {formatNumber(producto.subtotal || (producto.cantidad * producto.precioUnitario))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span>Subtotal:</span>
                  <span className="font-medium">S/ {formatNumber(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300">
                  <span>TOTAL:</span>
                  <span>S/ {formatNumber(selectedVenta?.total)}</span>
                </div>

                {(selectedVenta?.montoPendiente || 0) > 0 && (
                  <div className="flex justify-between text-red-700 font-bold pt-1 text-[12px]">
                    <span>PENDIENTE:</span>
                    <span>S/ {formatNumber(selectedVenta.montoPendiente)}</span>
                  </div>
                )}
              </div>

              <div className="text-center text-[10px] mt-4 opacity-80">
                ¡Gracias por su compra!
              </div>
              <div className="text-center text-[9px] mt-1 opacity-60">
                Conserve este comprobante para cualquier reclamo
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryVentasMovile;