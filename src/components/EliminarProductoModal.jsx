import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

const EliminarProductoModal = ({ isOpen, onClose, onConfirm, productoNombre }) => {
  const [isDeleting, setIsDeleting] = useState(false); // Estado para controlar si la eliminación está en progreso

  if (!isOpen) return null;

  // Función para manejar la confirmación de eliminación
  const handleConfirm = async () => {
    setIsDeleting(true); // Activar el estado de eliminación en progreso
    try {
      await onConfirm(); // Ejecutar la función de confirmación
    } finally {
      setIsDeleting(false); // Desactivar el estado de eliminación en progreso
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-2 rounded-lg shadow-inner">
              <Trash2 size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Eliminar Producto</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Contenido del modal */}
        <div className="p-6">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar el producto <strong>{productoNombre}</strong>? Esta acción no se puede deshacer.
          </p>
        </div>
        
        {/* Pie del modal con botones */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row-reverse gap-3 sm:gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting} // Deshabilitar el botón mientras se elimina
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 px-5 rounded-lg shadow-sm transition-all"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> // Spinner
            ) : (
              <>
                <Trash2 size={18} />
                <span>Eliminar</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting} // Deshabilitar el botón mientras se elimina
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 px-5 rounded-lg shadow-sm transition-all"
          >
            <span>Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarProductoModal;