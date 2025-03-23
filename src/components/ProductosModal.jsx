import React from "react";

const ProductosModal = ({ isOpen, onClose, venta }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-11/12 md:w-1/2 lg:w-1/3 overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Productos Comprados</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Detalles de la venta */}
        <div className="px-6 py-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <strong>Cliente:</strong> {venta?.cliente}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <strong>Total:</strong> S/ {venta?.total.toFixed(2)}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <strong>Pendiente:</strong> S/ {venta?.montoPendiente.toFixed(2)}
          </p>
        </div>

        {/* Lista de productos */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {venta?.productos.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {venta.productos.map((producto, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{producto.nombre}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm mr-2">{producto.cantidad} x</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">S/ {producto.precioUnitario.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6">No hay productos en esta venta</p>
          )}
        </div>

        {/* Botón de cierre */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductosModal;