import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Search, Eye, Calendar, Filter, CheckCircle, DollarSign, Users, CreditCard } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NuevaVentaModal from "../components/NuevaVentaModal";
import EliminarVentaModal from "../components/EliminarVentaModal";
import ProductosModal from "../components/ProductosModal";
import VerificarPagoModal from "../components/VerificarPagoModal";
import { useVenta } from "../context/VentaContext";

const Ventas = () => {
  const [sidebarWidth, setSidebarWidth] = useState("w-64");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductosModalOpen, setIsProductosModalOpen] = useState(false);
  const [isEliminarModalOpen, setIsEliminarModalOpen] = useState(false);
  const [isVerificarPagoModalOpen, setIsVerificarPagoModalOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const { ventas, loading, deleteVenta } = useVenta();

  // Estado para búsqueda
  const [busqueda, setBusqueda] = useState("");

  // Estado para el filtro de fecha
  const [filtroFecha, setFiltroFecha] = useState("todo"); // Opciones: "hoy", "todo"

  // Estado para filtro de estado
  const [filtroEstado, setFiltroEstado] = useState("todos"); // Opciones: "todos", "pagado", "pendiente", "parcial"

  // Estado para mostrar/ocultar dropdown de filtro de estado
  const [mostrarFiltroEstado, setMostrarFiltroEstado] = useState(false);

  // Estado para guardar la fecha actual
  const [fechaHoy, setFechaHoy] = useState("");

  // Establecer la fecha de hoy al cargar el componente
  useEffect(() => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;
    setFechaHoy(fechaFormateada);
  }, []);

  // Función mejorada para comprobar si una fecha es hoy
  const esFechaHoy = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let fechaObj;

    if (fecha.includes('/')) {
      const [dia, mes, año] = fecha.split('/').map(part => parseInt(part, 10));
      fechaObj = new Date(año, mes - 1, dia);
    }
    else if (fecha.includes('-')) {
      const [año, mes, dia] = fecha.split('-').map(part => parseInt(part, 10));
      fechaObj = new Date(año, mes - 1, dia);
    }

    if (!fechaObj || isNaN(fechaObj.getTime())) {
      return false;
    }

    fechaObj.setHours(0, 0, 0, 0);
    return fechaObj.getTime() === hoy.getTime();
  };

  // Filtrar ventas según la búsqueda, el filtro de fecha y el filtro de estado
  const ventasFiltradas = ventas.filter((venta) => {
    const coincideBusqueda =
      venta.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.estado.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.fecha.includes(busqueda);

    const coincideFecha = filtroFecha === "hoy" ? esFechaHoy(venta.fecha) : true;
    const coincideEstado = filtroEstado === "todos" || venta.estado.toLowerCase() === filtroEstado.toLowerCase();

    return coincideBusqueda && coincideFecha && coincideEstado;
  });

  // Cálculos para las tarjetas de resumen
  const calcularResumen = () => {
    const ventasAConsiderar = ventas.filter(venta =>
      filtroFecha === "hoy" ? esFechaHoy(venta.fecha) : true
    );

    const totalVentas = ventasAConsiderar.reduce((sum, venta) => sum + venta.total, 0);

    const clientesConDeuda = new Set();
    ventasAConsiderar.forEach(venta => {
      if (venta.estado.toLowerCase() === "pendiente" || venta.estado.toLowerCase() === "parcial") {
        clientesConDeuda.add(venta.cliente);
      }
    });

    const totalPendiente = ventasAConsiderar.reduce((sum, venta) => {
      if (venta.estado.toLowerCase() === "pendiente" || venta.estado.toLowerCase() === "parcial") {
        return sum + venta.montoPendiente;
      }
      return sum;
    }, 0);

    return {
      totalVentas,
      clientesConDeuda: clientesConDeuda.size,
      totalPendiente
    };
  };

  const resumen = calcularResumen();

  // Calcular el total de deuda según la búsqueda
  const calcularTotalDeuda = () => {
    return ventasFiltradas.reduce((sum, venta) => {
      if (venta.estado.toLowerCase() === "pendiente" || venta.estado.toLowerCase() === "parcial") {
        return sum + venta.montoPendiente;
      }
      return sum;
    }, 0);
  };

  const totalDeuda = calcularTotalDeuda();

  // Cerrar el dropdown de filtro cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarFiltroEstado && !event.target.closest('.filtro-estado-container')) {
        setMostrarFiltroEstado(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarFiltroEstado]);

  // Función para obtener clase de color según el estado
  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "pagado":
        return "from-green-500 to-emerald-600";
      case "pendiente":
        return "from-red-500 to-rose-600";
      case "parcial":
        return "from-yellow-500 to-amber-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Función para obtener texto y color para el botón de filtro de estado
  const getEstadoFilterLabel = () => {
    switch (filtroEstado) {
      case "pagado":
        return { texto: "Pagado", color: "text-green-600 bg-green-50 border-green-200" };
      case "pendiente":
        return { texto: "Pendiente", color: "text-red-600 bg-red-50 border-red-200" };
      case "parcial":
        return { texto: "Parcial", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
      default:
        return { texto: "Estado", color: "text-gray-700 bg-white" };
    }
  };

  // Función para abrir el modal de productos
  const verProductos = (venta) => {
    setVentaSeleccionada(venta);
    setIsProductosModalOpen(true);
  };

  // Función para abrir el modal de eliminación
  const abrirModalEliminar = (venta) => {
    setVentaSeleccionada(venta);
    setIsEliminarModalOpen(true);
  };

  // Función para abrir el modal de verificación de pago
  const abrirModalVerificarPago = (venta) => {
    setVentaSeleccionada(venta);
    setIsVerificarPagoModalOpen(true);
  };

  // Función para confirmar la eliminación
  const confirmarEliminar = async () => {
    try {
      await deleteVenta(ventaSeleccionada.id);
      setIsEliminarModalOpen(false);
    } catch (error) {
      console.error("Error al eliminar la venta:", error);
    }
  };

  // Componente de esqueleto para las tarjetas de resumen
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="p-2 bg-gray-200 rounded-lg h-8 w-8"></div>
        </div>
        <div className="mt-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );

  // Componente de esqueleto para las filas de la tabla
  const SkeletonTableRow = () => (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-8"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex gap-2 justify-center">
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  // Componente de esqueleto para las tarjetas de venta (móvil)
  const SkeletonVentaCard = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 flex items-center space-x-3 border-b">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="flex justify-between items-center mt-1">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-8 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  // Si está cargando, mostrar esqueletos de carga
  if (loading) {
    return (
      <div className="flex">
        <Sidebar updateSidebarWidth={setSidebarWidth} />
        <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === "w-64" ? "ml-72" : "ml-16"}`}>
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-full w-36 animate-pulse"></div>
          </div>

          {/* Tarjetas de Resumen con Esqueleto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Barra de búsqueda y botones de filtro */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-pulse">
            <div className="relative flex-1">
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-12 bg-gray-200 rounded-xl w-32"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-32"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-24"></div>
            </div>
          </div>

          {/* Esqueleto de la tabla para desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array(6).fill().map((_, index) => (
                    <SkeletonTableRow key={index} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Esqueleto de tarjetas para móvil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mb-6">
            {Array(4).fill().map((_, index) => (
              <SkeletonVentaCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar updateSidebarWidth={setSidebarWidth} />
      <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === "w-64" ? "ml-72" : "ml-16"}`}>
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Ventas</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-full shadow-md transition-all"
          >
            <PlusCircle size={18} />
            <span>Nueva Venta</span>
          </button>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Tarjeta 1: Total de Ventas */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium opacity-90">Total de Ventas</h3>
                <div className="p-2 bg-white bg-opacity-30 rounded-lg">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-bold">S/ {resumen.totalVentas.toFixed(2)}</h2>
                <p className="text-sm mt-1 opacity-80">
                  {filtroFecha === "hoy" ? "Hoy" : "Todas las fechas"}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Clientes con Deuda */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium opacity-90">Clientes con Deuda</h3>
                <div className="p-2 bg-white bg-opacity-30 rounded-lg">
                  <Users size={20} />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-bold">{resumen.clientesConDeuda}</h2>
                <p className="text-sm mt-1 opacity-80">
                  {filtroFecha === "hoy" ? "Hoy" : "Todas las fechas"}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Total Pendiente por Cobrar */}
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium opacity-90">Total por Cobrar</h3>
                <div className="p-2 bg-white bg-opacity-30 rounded-lg">
                  <CreditCard size={20} />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-3xl font-bold">S/ {totalDeuda.toFixed(2)}</h2>
                <p className="text-sm mt-1 opacity-80">
                  Estados pendiente y parcial
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y botones de filtro */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar ventas por cliente, estado o fecha..."
              className="w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroFecha("todo")}
              className={`px-4 py-3 rounded-xl transition-all ${
                filtroFecha === "todo"
                  ? "bg-blue-600 text-white font-medium shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Todas las Ventas
            </button>
            <button
              onClick={() => setFiltroFecha("hoy")}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
                filtroFecha === "hoy"
                  ? "bg-blue-600 text-white font-medium shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Calendar size={16} />
              Ventas de Hoy
            </button>

            {/* Botón y dropdown para filtrar por estado */}
            <div className="relative filtro-estado-container">
              <button
                onClick={() => setMostrarFiltroEstado(!mostrarFiltroEstado)}
                className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 border ${getEstadoFilterLabel().color}`}
              >
                <Filter size={16} />
                <span>{getEstadoFilterLabel().texto}</span>
              </button>

              {/* Dropdown de filtros de estado */}
              {mostrarFiltroEstado && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg z-10 overflow-hidden">
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={() => {
                          setFiltroEstado("todos");
                          setMostrarFiltroEstado(false);
                        }}
                        className="block px-4 py-3 text-left w-full hover:bg-gray-50 transition-colors"
                      >
                        Todos los estados
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setFiltroEstado("pagado");
                          setMostrarFiltroEstado(false);
                        }}
                        className="block px-4 py-3 text-left w-full hover:bg-green-50 text-green-600 transition-colors"
                      >
                        Pagado
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setFiltroEstado("pendiente");
                          setMostrarFiltroEstado(false);
                        }}
                        className="block px-4 py-3 text-left w-full hover:bg-red-50 text-red-600 transition-colors"
                      >
                        Pendiente
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setFiltroEstado("parcial");
                          setMostrarFiltroEstado(false);
                        }}
                        className="block px-4 py-3 text-left w-full hover:bg-yellow-50 text-yellow-600 transition-colors"
                      >
                        Parcial
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fecha y filtros activos */}
        <div className="mb-4 text-sm text-gray-500">
          Mostrando:
          {filtroFecha === "hoy" ? ` Ventas del ${fechaHoy} (Hoy)` : " Todas las ventas"}
          {filtroEstado !== "todos" && ` con estado "${filtroEstado}"`}
        </div>

        {/* Ventas en tarjetas - Vista móvil y tablets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mb-6">
          {ventasFiltradas.map((venta) => (
            <div key={venta.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 flex items-center space-x-3 border-b">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{venta.cliente}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full bg-gradient-to-r ${getEstadoColor(venta.estado)} text-white font-medium`}>
                      {venta.estado}
                    </span>
                    <span className="font-bold text-blue-600">S/ {venta.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <span className="text-xs text-gray-500 block">Fecha:</span>
                    <span className="font-medium text-sm">{venta.fecha}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Productos:</span>
                    <span className="font-medium text-sm">{venta.productos.length}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Pendiente:</span>
                    <span className="font-medium text-sm">S/ {venta.montoPendiente.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => verProductos(venta)}
                    className="flex-1 py-2 px-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => abrirModalEliminar(venta)}
                    className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    <span>Eliminar</span>
                  </button>
                  {(venta.estado.toLowerCase() === "pendiente" || venta.estado.toLowerCase() === "parcial") && (
                    <button
                      onClick={() => abrirModalVerificarPago(venta)}
                      className="flex-1 py-2 px-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={16} />
                      <span>Verificar Pago</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla de ventas - Vista desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasFiltradas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{venta.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venta.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{venta.cliente}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venta.productos.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">S/ {venta.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      S/ {venta.montoPendiente.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r ${getEstadoColor(venta.estado)} text-white`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => verProductos(venta)}
                          className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(venta)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        {(venta.estado.toLowerCase() === "pendiente" || venta.estado.toLowerCase() === "parcial") && (
                          <button
                            onClick={() => abrirModalVerificarPago(venta)}
                            className="text-green-600 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sin resultados */}
          {ventasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron ventas</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {filtroFecha === "hoy" && filtroEstado === "todos"
                  ? "No hay ventas registradas para el día de hoy. Registra una nueva venta o cambia el filtro."
                  : filtroEstado !== "todos" && filtroFecha === "todo"
                  ? `No hay ventas con estado "${filtroEstado}" que coincidan con tu búsqueda.`
                  : filtroEstado !== "todos" && filtroFecha === "hoy"
                  ? `No hay ventas de hoy con estado "${filtroEstado}".`
                  : "No hay ventas que coincidan con tu búsqueda. Intenta con otros términos o registra una nueva venta."}
              </p>
            </div>
          )}
        </div>

        {/* Modal de Nueva Venta */}
        <NuevaVentaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Modal de Productos */}
        <ProductosModal
          isOpen={isProductosModalOpen}
          onClose={() => setIsProductosModalOpen(false)}
          venta={ventaSeleccionada}
        />

        {/* Modal de Eliminar Venta */}
        <EliminarVentaModal
          isOpen={isEliminarModalOpen}
          onClose={() => setIsEliminarModalOpen(false)}
          onConfirm={confirmarEliminar}
          venta={ventaSeleccionada}
        />

        {/* Modal de Verificar Pago */}
        <VerificarPagoModal
          isOpen={isVerificarPagoModalOpen}
          onClose={() => setIsVerificarPagoModalOpen(false)}
          venta={ventaSeleccionada}
        />
      </div>
    </div>
  );
};

export default Ventas;
