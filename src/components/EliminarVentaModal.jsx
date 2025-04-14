import React, { useState } from "react";

const EliminarVentaModal = ({ isOpen, onClose, onConfirm, venta }) => {
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el spinner

  if (!isOpen) return null;

  // Función para manejar la confirmación de eliminación
  const handleConfirm = async () => {
    setIsLoading(true); // Activar el spinner
    try {
      await onConfirm(); // Ejecutar la función de confirmación
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
    } finally {
      setIsLoading(false); // Desactivar el spinner
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-11/12 md:w-1/2 lg:w-1/3 overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Eliminar Venta</h2>
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
          <p className="text-gray-600 dark:text-gray-300">
            ¿Estás seguro de que deseas eliminar la venta del cliente <strong>{venta?.cliente}</strong> por un total de <strong>S/ {venta?.total.toFixed(2)}</strong>?
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-all"
            disabled={isLoading} // Deshabilitar el botón mientras se carga
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            disabled={isLoading} // Deshabilitar el botón mientras se carga
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              "Eliminar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarVentaModal;