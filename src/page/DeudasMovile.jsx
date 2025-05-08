import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User,
  ChevronDown,
  List,
  Loader2
} from 'lucide-react';
import Logo from '../img/logo.png';
import { useDeuda } from '../context/DeudaContext';
import ClienteDeudas from '../components/ClienteDeudas';

const DeudasMovile = () => {
  const [activeView, setActiveView] = useState('porCliente');
  const [expandedDeuda, setExpandedDeuda] = useState(null);
  const { 
    clientesConDeudas, 
    ventasPendientes, 
    loading, 
    getDetallesVenta,
    getVentasCliente // Asegúrate de incluir esta función del contexto
  } = useDeuda();
  
  const [ventaDetallada, setVentaDetallada] = useState(null);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(true);

  const cargarDetallesVenta = async (ventaId) => {
    setLoadingVentas(true);
    try {
      const detalles = await getDetallesVenta(ventaId);
      setVentaDetallada(detalles);
    } finally {
      setLoadingVentas(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (activeView === 'porCliente') {
        setLoadingClientes(false);
      } else {
        setLoadingVentas(false);
      }
    }
  }, [loading, activeView]);

  const cambiarVista = (vista) => {
    setActiveView(vista);
    if (vista === 'porCliente') {
      setLoadingClientes(true);
      setLoadingVentas(false);
    } else {
      setLoadingClientes(false);
      setLoadingVentas(true);
    }
    setTimeout(() => {
      if (vista === 'porCliente') {
        setLoadingClientes(false);
      } else {
        setLoadingVentas(false);
      }
    }, 300);
  };

  return (
    <div className="pb-16 pt-14 bg-gray-50 min-h-screen">
      {/* Header superior */}
      <div className="fixed top-0 left-0 right-0 flex items-center p-2 z-10">
        <Link to="/">
          <button className="p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-200">
            <ArrowLeft className="text-gray-700" size={20} />
          </button>
        </Link>

        <div className="w-10"></div>
      </div>

      {/* Contenido principal */}
      <div className="p-3 mt-2">
        {activeView === 'porVenta' ? (
          <div className="space-y-3">
            {loadingVentas ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-gray-500" size={24} />
              </div>
            ) : ventasPendientes.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No hay ventas pendientes
              </div>
            ) : (
              ventasPendientes.map(venta => (
                <div key={venta.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div 
                    className="p-3 flex justify-between items-center cursor-pointer"
                    onClick={() => {
                      setExpandedDeuda(expandedDeuda === venta.id ? null : venta.id);
                      if (expandedDeuda !== venta.id) {
                        cargarDetallesVenta(venta.id);
                      }
                    }}
                  >
                    <div>
                      <p className="font-medium">Venta #{venta.id.substring(0, 6)}</p>
                      <p className="text-sm text-gray-600">{venta.clienteNombre}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`font-bold mr-2 ${
                        venta.estadoPago === 'Pendiente' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        S/ {venta.montoPendiente?.toFixed(2) || '0.00'}
                      </span>
                      <ChevronDown 
                        size={18} 
                        className={`transition-transform ${
                          expandedDeuda === venta.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {expandedDeuda === venta.id && (
                    <div className="p-3 border-t bg-gray-50">
                      {loadingVentas ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="animate-spin text-gray-500" size={20} />
                        </div>
                      ) : ventaDetallada ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Fecha</p>
                              <p className="text-sm">{ventaDetallada.fechaFormateada}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Total</p>
                              <p className="text-sm">S/ {ventaDetallada.total?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Estado</p>
                              <p className={`text-sm font-medium ${
                                ventaDetallada.estadoPago === 'Pendiente' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {ventaDetallada.estadoPago}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="font-medium text-sm mb-1">Productos:</p>
                            {ventaDetallada.productos?.map((prod, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1">
                                <span>{prod.cantidad} x {prod.nombre || 'Producto'}</span>
                                <span>S/ {prod.subtotal?.toFixed(2) || (prod.cantidad * prod.precioUnitario)?.toFixed(2) || '0.00'}</span>
                              </div>
                            ))}
                          </div>

                          <Link 
                            to={`/pagar-deuda/${ventaDetallada.id}`}
                            className="block w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium text-center"
                          >
                            Registrar Pago
                          </Link>
                        </>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Error al cargar detalles
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <ClienteDeudas 
            clientesConDeudas={clientesConDeudas} 
            loadingClientes={loadingClientes} 
            getVentasCliente={getVentasCliente} // Pasar la función del contexto
          />
        )}
      </div>

      {/* Dock de navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 shadow-lg">
        <div className="flex justify-around max-w-md mx-auto rounded-xl bg-[#44943b] p-1 m-2">
          <div className="flex-1">
            <button
              className={`flex flex-col items-center justify-center py-1.5 w-full px-3 rounded-lg transition-all ${activeView === 'porCliente' ? 'bg-white shadow-md' : 'hover:bg-gray-400 text-white'}`}
              onClick={() => cambiarVista('porCliente')}
            >
              <User className={activeView === 'porCliente' ? 'text-gray-700' : 'text-white'} size={18} />
              <span className="text-xs mt-1">Por Cliente</span>
            </button>
          </div>

          <div className="flex-1">
            <button
              className={`flex flex-col items-center justify-center py-1.5 w-full px-3 rounded-lg transition-all ${activeView === 'porVenta' ? 'bg-white shadow-md' : 'hover:bg-gray-400 text-white'}`}
              onClick={() => cambiarVista('porVenta')}
            >
              <List className={activeView === 'porVenta' ? 'text-gray-700' : 'text-white'} size={18} />
              <span className="text-xs mt-1">Por Venta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeudasMovile;