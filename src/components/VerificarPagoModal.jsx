import React, { useState } from "react";
import { useVenta } from "../context/VentaContext"; // Asegúrate de importar el contexto

const VerificarPagoModal = ({ isOpen, onClose, venta }) => {
  const [montoPagado, setMontoPagado] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para el spinner de carga
  const [pagarCompleto, setPagarCompleto] = useState(false); // Estado para pagar el monto completo
  const { pagarDeuda } = useVenta(); // Obtener la función pagarDeuda del contexto

  if (!isOpen) return null;

  const handleConfirmarPago = async () => {
    setIsLoading(true); // Activar el spinner de carga
    setError(""); // Limpiar cualquier error anterior

    let monto;
    if (pagarCompleto) {
      monto = venta.montoPendiente;
    } else {
      monto = parseFloat(montoPagado);
      if (isNaN(monto) || monto <= 0) {
        setError("Ingresa un monto válido.");
        setIsLoading(false); // Desactivar el spinner de carga
        return;
      }
    }

    try {
      await pagarDeuda(venta.id, monto); // Llamar a la función para pagar la deuda
      setMontoPagado(""); // Limpiar el input de monto pagado
      setPagarCompleto(false); // Desmarcar el checkbox de pagar completo
      onClose(); // Cerrar el modal después de confirmar el pago
    } catch (error) {
      console.error("Error al confirmar el pago:", error);
      setError("Hubo un error al procesar el pago. Intenta de nuevo.");
    } finally {
      setIsLoading(false); // Desactivar el spinner de carga
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-11/12 md:w-1/2 lg:w-1/3 overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Verificar Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Verifica el pago para la venta de <strong>{venta?.cliente}</strong>.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Pendiente:</label>
            <span className="text-red-600 font-bold text-lg">S/ {venta?.montoPendiente.toFixed(2)}</span>
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="pagarCompleto"
              checked={pagarCompleto}
              onChange={(e) => setPagarCompleto(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="pagarCompleto" className="text-sm font-medium text-gray-700">Pagar monto completo</label>
          </div>
          {!pagarCompleto && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar:</label>
              <input
                type="number"
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
          <button
            onClick={handleConfirmarPago}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            disabled={isLoading} // Deshabilitar el botón mientras se carga
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Confirmar Pago"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificarPagoModal;
