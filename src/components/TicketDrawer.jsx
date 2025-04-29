import React, { useRef } from 'react';
import { Printer, ArrowLeft, Download, X } from 'lucide-react';
import domtoimage from "dom-to-image";

const TicketDrawer = ({ venta, onClose, onPrint, Logo, onNewSale }) => {
  const ticketRef = useRef(null);

  // Función para formatear números con 2 decimales
  const formatNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Función para formatear fecha legible
  const getFechaLegible = () => {
    if (!venta?.fecha) return "Fecha no disponible";
    try {
      const fecha = new Date(venta.fecha);
      return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', '');
    } catch {
      return "Fecha inválida";
    }
  };

  // Obtener productos de forma segura
  const getProductos = () => {
    return Array.isArray(venta?.productos) ? venta.productos : [];
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
      link.download = `ticket-${venta?.id || 'venta'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error al generar el ticket:', error);
      alert("Error al generar el ticket. Intente nuevamente.");
    }
  };

  // Acción para nueva venta
  const handleNewSale = () => {
    onClose?.(); // Cierra el drawer primero
    onNewSale?.(); // Luego ejecuta la acción de nueva venta
  };

  // Vista cuando no hay datos de venta
  if (!venta) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <X className="mx-auto text-red-500 mb-3" size={32} />
          <h3 className="text-lg font-bold mb-2">Ticket no disponible</h3>
          <button 
            onClick={handleNewSale}
            className="mt-4 px-4 py-2 bg-[#44943b] text-white rounded hover:bg-[#367c2e] transition-colors"
          >
            Nueva Venta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center shadow-sm border-b">
        <button 
          onClick={onClose} 
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
            onClick={onPrint} 
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
              {Logo && <img src={Logo} alt="Logo" className="w-20 mx-auto mb-1" />}
              <div className="text-[15px] mb-1 tracking-tight">COMPROBANTE DE VENTA</div>
              <div className="text-[10px] opacity-80">
                Ticket #{venta?.id || "N/A"}
              </div>
              <div className="text-[10px] opacity-80">
                {getFechaLegible()}
              </div>
            </div>

            <div className="text-[11px] mb-3 border-b pb-2 border-gray-300">
              <div className="font-semibold">Cliente: {venta?.cliente || "Consumidor Final"}</div>
              <div className={(venta?.montoPendiente || 0) <= 0 ? 
                "text-green-700 font-bold" : "text-red-700 font-bold"}>
                Estado: {(venta?.montoPendiente || 0) <= 0 ? "PAGADO" : "PENDIENTE DE PAGO"}
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
                <span>S/ {formatNumber(venta?.total)}</span>
              </div>

              {(venta?.montoPendiente || 0) > 0 && (
                <div className="flex justify-between text-red-700 font-bold pt-1 text-[12px]">
                  <span>PENDIENTE:</span>
                  <span>S/ {formatNumber(venta.montoPendiente)}</span>
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
          onClick={handleNewSale}
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
            {Logo && <img src={Logo} alt="Logo" className="w-20 mx-auto mb-1" />}
            <div className="text-[15px] mb-1 tracking-tight">COMPROBANTE DE VENTA</div>
            <div className="text-[10px] opacity-80">
              Ticket #{venta?.id || "N/A"}
            </div>
            <div className="text-[10px] opacity-80">
              {getFechaLegible()}
            </div>
          </div>

          <div className="text-[11px] mb-3 border-b pb-2 border-gray-300">
            <div className="font-semibold">Cliente: {venta?.cliente || "Consumidor Final"}</div>
            <div className={(venta?.montoPendiente || 0) <= 0 ? 
              "text-green-700 font-bold" : "text-red-700 font-bold"}>
              Estado: {(venta?.montoPendiente || 0) <= 0 ? "PAGADO" : "PENDIENTE DE PAGO"}
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
              <span>S/ {formatNumber(venta?.total)}</span>
            </div>

            {(venta?.montoPendiente || 0) > 0 && (
              <div className="flex justify-between text-red-700 font-bold pt-1 text-[12px]">
                <span>PENDIENTE:</span>
                <span>S/ {formatNumber(venta.montoPendiente)}</span>
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
  );
};

export default TicketDrawer;