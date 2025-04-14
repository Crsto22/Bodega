import React from 'react';

const EliminarProveedorModal = ({ isOpen, onClose, onConfirm, proveedorNombre }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Eliminar Proveedor</h2>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar al proveedor <span className="font-semibold">{proveedorNombre}</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarProveedorModal;