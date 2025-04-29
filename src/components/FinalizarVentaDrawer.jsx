import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import TicketDrawer from './TicketDrawer';

const FinalizarVentaDrawer = ({ status, onNuevaVenta, onObtenerTicket, venta }) => {
  const [showTicket, setShowTicket] = useState(false);

  const handleObtenerTicket = () => {
    setShowTicket(true);
    if (onObtenerTicket) onObtenerTicket();
  };

  return (
    <>
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        {/* Contenedor principal centrado en la página */}
        <div className="flex flex-col items-center justify-center p-8 max-w-md w-full mx-4">
          <div className="relative w-24 h-24 flex items-center justify-center mb-2">
            {/* Estado de carga */}
            {status === 'loading' && (
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
            )}

            {/* Estado de éxito */}
            {status === 'success' && (
              <div className="check-circle">
                <Check className="check-icon" size={48} strokeWidth={2.5} />
              </div>
            )}

            {/* Estado de error */}
            {status === 'error' && (
              <div className="error-circle">
                <X className="error-icon" size={28} strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Mensajes */}
          {status === 'success' && (
            <div className="mt-4 font-medium text-gray-800 fade-in">
              Venta completada con éxito
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 font-medium text-gray-800 fade-in">
              Error al procesar la venta
            </div>
          )}
        </div>
        
        {/* Botones de acción en la parte inferior de la página */}

{status === 'success' && (
  <div className="fixed bottom-8 w-full max-w-md px-4">
    <div className="flex flex-row gap-2 justify-center w-full">
      <button
        onClick={onNuevaVenta}
        className="py-3 px-6 bg-green-600 text-white rounded-xl flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-max"
      >
        Nueva Venta
      </button>
      <button
        onClick={onObtenerTicket}
        className="py-3 px-6 bg-blue-500 text-white rounded-xl flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 w-max"
      >
        Obtener Ticket
      </button>
    </div>
  </div>
)}
      </div>

      {/* Mostrar ticket si está activo */}
      {showTicket && venta && (
        <TicketDrawer 
          venta={venta}
          onClose={() => setShowTicket(false)}
          onPrint={() => {
            // Lógica para imprimir
            window.print();
          }}
        />
      )}

      <style jsx>{`
        .spinner-container {
          width: 80px;
          height: 80px;
        }

        .spinner {
          width: 80px;
          height: 80px;
          border: 2px solid rgba(34, 197, 94, 0.1);
          border-radius: 50%;
          border-top: 2px solid #22c55e;
          animation: spin 1s linear infinite;
        }

        .check-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background-color: #f0fdf4;
          border: 2px solid #22c55e;
          border-radius: 50%;
          animation: circle-appear 0.4s ease-out forwards;
        }

        .error-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background-color: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 50%;
          animation: circle-appear 0.4s ease-out forwards;
        }

        .check-icon {
          color: #22c55e;
          animation: icon-appear 0.3s ease-out forwards;
        }

        .error-icon {
          color: #ef4444;
          animation: icon-appear 0.3s ease-out forwards;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes circle-appear {
          0% { transform: scale(0); }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        @keyframes icon-appear {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }

        .fade-in {
          opacity: 0;
          animation: fade-in 0.5s ease-out forwards;
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default FinalizarVentaDrawer;