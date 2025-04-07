import React, { useRef, useState } from "react";
import { ShoppingBag, X, Receipt, CreditCard, AlertCircle, CheckCircle, Download } from "lucide-react";
import domtoimage from "dom-to-image";

const ProductosModal = ({ isOpen, onClose, venta }) => {
  if (!isOpen) return null;
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Referencia para el ticket que queremos capturar como imagen
  const ticketRef = useRef(null);

  // Calculate subtotal and total
  const subtotal = venta?.productos.reduce((sum, producto) => 
    sum + (producto.precioUnitario * producto.cantidad), 0) || 0;

  // Función para descargar el ticket como PNG
  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      // Capturar el ticket oculto como imagen
      const dataUrl = await domtoimage.toPng(ticketRef.current, {
        bgcolor: '#ffffff',
        quality: 0.95
      });
      
      // Descargar la imagen
      const link = document.createElement('a');
      link.download = `ticket-${venta?.cliente || "compra"}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error('Error al generar la imagen del ticket:', error);
      alert("Hubo un problema al generar el ticket. Por favor intente nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generar ID único para el ticket
  const ticketId = Math.random().toString(36).substr(2, 9).toUpperCase();

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

        {/* Vista normal con tabla (vista actual) */}
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
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                <span className="text-gray-800 dark:text-gray-200">S/ {subtotal.toFixed(2)}</span>
              </div>
              
              {/* You can add tax or other items here if needed */}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-800 dark:text-gray-200 font-medium">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">S/ {venta?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden ticket template for PNG generation */}
        <div className="fixed -left-[9999px]">
          <div
            ref={ticketRef}
            className="bg-white p-8 w-[300px] font-mono text-sm"
            style={{ fontFamily: 'monospace' }}
          >
            <div className="text-center font-bold mb-4">
              <div className="text-xl mb-1">COMPROBANTE DE VENTA</div>
              <div className="text-xs">
                Ticket #{ticketId}
              </div>
              <div className="text-xs">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            <div className="text-xs mb-4">
              <div>Cliente: {venta?.cliente || "Consumidor Final"}</div>
              <div>Estado: {venta?.montoPendiente.toFixed(2) === '0.00' ? "PAGADO" : "PENDIENTE DE PAGO"}</div>
            </div>
            
            <div className="border-t border-b border-gray-300 py-4 my-4">
              {venta?.productos.map((producto, index) => (
                <div key={index} className="mb-2">
                  <div className="font-bold">{producto.nombre}</div>
                  <div className="flex justify-between text-xs">
                    <span>{producto.cantidad} x S/ {producto.precioUnitario.toFixed(2)}</span>
                    <span>S/ {(producto.cantidad * producto.precioUnitario).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300">
                <span>TOTAL:</span>
                <span>S/ {venta?.total.toFixed(2)}</span>
              </div>
              
              {venta?.montoPendiente.toFixed(2) !== '0.00' && (
                <div className="flex justify-between text-red-600 pt-2">
                  <span>PENDIENTE:</span>
                  <span>S/ {venta?.montoPendiente.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="text-center text-xs mt-6">
              ¡Gracias por su compra!
            </div>
            
            <div className="text-center text-xs mt-2">
              Conserve este comprobante para cualquier reclamo
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex flex-col sm:flex-row gap-3">
          {/* Botón para descargar ticket */}
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
                <span>Descargar Ticket</span>
              </>
            )}
          </button>
          
          {/* Botón para cerrar */}
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