import React, { useRef, useState } from "react";
import { ShoppingBag, X, Receipt, CreditCard, AlertCircle, CheckCircle, Download } from "lucide-react";
import domtoimage from "dom-to-image";
import Logo from "../img/Logo.png";

const ProductosModal = ({ isOpen, onClose, venta }) => {
  if (!isOpen) return null;

  const [isGenerating, setIsGenerating] = useState(false);
  const ticketRef = useRef(null);

  const subtotal = venta?.productos.reduce((sum, producto) =>
    sum + (producto.precioUnitario * producto.cantidad), 0) || 0;
  const igv = venta?.total - subtotal;

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      const dataUrl = await domtoimage.toPng(ticketRef.current, {
        bgcolor: '#ffffff',
        quality: 1,
        width: 262 * 2, // Doble resolución para mejor calidad
        height: ticketRef.current.clientHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: '262px',
          height: `${ticketRef.current.clientHeight}px`
        }
      });

      const link = document.createElement('a');
      link.download = `boleta-${venta?.cliente || "compra"}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();

    } catch (error) {
      console.error('Error al generar la imagen del ticket:', error);
      alert("Hubo un problema al generar el ticket. Por favor intente nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const fechaLegible = venta?.fecha ? new Date(venta.fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Fecha no disponible';

  const numeroALetras = (numero) => {
    // Función simplificada para convertir número a letras
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    
    const entero = Math.floor(numero);
    const decimal = Math.round((numero - entero) * 100);
    
    if (entero < 10) return `${unidades[entero]} CON ${decimal.toString().padStart(2, '0')}/100 SOLES`;
    if (entero < 20) {
      const especiales = {
        10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE',
        15: 'QUINCE', 16: 'DIECISEIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE'
      };
      return `${especiales[entero]} CON ${decimal.toString().padStart(2, '0')}/100 SOLES`;
    }
    
    const decena = Math.floor(entero / 10);
    const unidad = entero % 10;
    
    let texto = decenas[decena];
    if (unidad > 0) texto += ` Y ${unidades[unidad]}`;
    
    return `${texto} CON ${decimal.toString().padStart(2, '0')}/100 SOLES`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-11/12 md:w-2/3 lg:w-1/2 overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Detalle de Compra</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Vista normal con tabla */}
        <div className="bg-white dark:bg-gray-800">
          {/* Client and Payment Status */}
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Cliente:</span> {venta?.cliente}
                </p>
              </div>

              {venta?.montoPendiente.toFixed(2) === '0.00' ? (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium text-sm">Pagado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-lg dark:bg-red-900/30 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Pendiente:</span>
                  <span className="font-bold">S/ {venta?.montoPendiente.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Table */}
          <div className="px-6 py-2 table-container" style={{ maxHeight: "384px", overflow: "auto" }}>
            {venta?.productos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                    <tr>
                      <th scope="col" className="px-4 py-3 rounded-l-lg">Producto</th>
                      <th scope="col" className="px-4 py-3 text-center">Cantidad</th>
                      <th scope="col" className="px-4 py-3 text-center">Precio Unit.</th>
                      <th scope="col" className="px-4 py-3 text-right rounded-r-lg">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venta.productos.map((producto, index) => (
                      <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {producto.nombre}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                          {producto.cantidad}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                          S/ {producto.precioUnitario.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          S/ {(producto.cantidad * producto.precioUnitario).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                <ShoppingBag className="h-10 w-10 mb-2 opacity-50" />
                <p>No hay productos en esta venta</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <div className="space-y-2">
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-800 dark:text-gray-200 font-medium">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">S/ {venta?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

     {/* Hidden ticket template for PNG generation - Mismo estilo pero con ancho 262px */}
     <div className="fixed -left-[9999px]">
        <div
          ref={ticketRef}
          className="bg-white p-4 w-[262px] text-xs" // Ancho fijo de 262px
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
              Ticket #{venta?.id || "N/A"}
            </div>
            <div className="text-[10px] opacity-80">
              {fechaLegible}
            </div>
          </div>

          <div className="text-[11px] mb-3 border-b pb-2 border-gray-300">
            <div className="font-semibold">Cliente: {venta?.cliente || "Consumidor Final"}</div>
            <div className={venta?.montoPendiente.toFixed(2) === '0.00' ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
              Estado: {venta?.montoPendiente.toFixed(2) === '0.00' ? "PAGADO" : "PENDIENTE DE PAGO"}
            </div>
          </div>

          <div className="border-t border-b border-gray-300 py-2 my-2">
            {venta?.productos.map((producto, index) => (
              <div key={index} className="mb-2">
                <div className="font-bold text-[12px]">{producto.nombre}</div>
                <div className="flex justify-between text-[11px]">
                  <span>{producto.cantidad} x S/ {producto.precioUnitario.toFixed(2)}</span>
                  <span className="font-medium">S/ {(producto.cantidad * producto.precioUnitario).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[12px]">
              <span>Subtotal:</span>
              <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-300">
              <span>TOTAL:</span>
              <span>S/ {venta?.total.toFixed(2)}</span>
            </div>

            {venta?.montoPendiente.toFixed(2) !== '0.00' && (
              <div className="flex justify-between text-red-700 font-bold pt-1 text-[12px]">
                <span>PENDIENTE:</span>
                <span>S/ {venta?.montoPendiente.toFixed(2)}</span>
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

        {/* Buttons */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Descargar Boleta</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
          >
            <CreditCard className="h-5 w-5" />
             Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductosModal;