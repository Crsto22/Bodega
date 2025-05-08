import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
  FileText,
  ChevronRight,
  Smartphone,
  ClipboardList // Nuevo icono importado
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarWidth, setSidebarWidth] = useState('w-64');
  const [isMobile, setIsMobile] = useState(false);

  // Función para actualizar el ancho del sidebar
  const updateSidebarWidth = (width) => {
    setSidebarWidth(width);
  };
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Cards de acceso a rutas
  const routeCards = [
    {
      title: "Ventas",
      icon: <ShoppingCart size={20} className="text-white" />,
      path: "/ventas",
      description: "Gestión de ventas y transacciones",
      bgColor: "bg-gradient-to-br from-green-400 to-green-600",
      iconBg: "bg-green-700",
      hiddenOnMobile: true
    },
    {
      title: "Ventas Móviles",
      icon: <Smartphone size={20} className="text-white" />,
      path: "/ventasMovile",
      description: "Ventas optimizadas para móviles",
      bgColor: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      iconBg: "bg-emerald-700",
      hiddenOnDesktop: true
    },
    {
      title: "Deudas Móvil",
      icon: <Smartphone size={20} className="text-white" />,
      path: "/deudasMovile",
      description: "Pagos pendientes en móvil",
      bgColor: "bg-gradient-to-br from-amber-400 to-amber-600",
      iconBg: "bg-amber-700",
      hiddenOnDesktop: true
    },
    {
      title: "Compras",
      icon: <ShoppingBag size={20} className="text-white" />,
      path: "/compras",
      description: "Administración de compras",
      bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
      iconBg: "bg-blue-700"
    },
    {
      title: "Productos",
      icon: <Package size={20} className="text-white" />,
      path: "/productos",
      description: "Inventario y catálogo",
      bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
      iconBg: "bg-purple-700",
      hiddenOnMobile: true
    },
    {
      title: "Productos Móviles",
      icon: <Smartphone size={20} className="text-white" />,
      path: "/productosMovile",
      description: "Gestión de productos en móvil",
      bgColor: "bg-gradient-to-br from-violet-400 to-violet-600",
      iconBg: "bg-violet-700",
      hiddenOnDesktop: true
    },
    {
      title: "Clientes",
      icon: <Users size={20} className="text-white" />,
      path: "/clientes",
      description: "Registro y seguimiento",
      bgColor: "bg-gradient-to-br from-amber-400 to-amber-600",
      iconBg: "bg-amber-700"
    },
    {
      title: "Proveedores",
      icon: <Truck size={20} className="text-white" />,
      path: "/proveedores",
      description: "Gestión de proveedores",
      bgColor: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      iconBg: "bg-indigo-700"
    },
    {
      title: "Reportes",
      icon: <BarChart3 size={20} className="text-white" />,
      path: "/reportes",
      description: "Análisis y estadísticas",
      bgColor: "bg-gradient-to-br from-teal-400 to-teal-600",
      iconBg: "bg-teal-700"
    },
    {
      title: "Facturación",
      icon: <FileText size={20} className="text-white" />,
      path: "/facturacion",
      description: "Gestión de facturas",
      bgColor: "bg-gradient-to-br from-rose-400 to-rose-600",
      iconBg: "bg-rose-700"
    },
    // Nueva entrada para Deudas Pendientes (versión escritorio)
    {
      title: "Deudas Pendientes",
      icon: <ClipboardList size={20} className="text-white" />,
      path: "/deudas",
      description: "Gestión de pagos fiados",
      bgColor: "bg-gradient-to-br from-orange-400 to-orange-600",
      iconBg: "bg-orange-700",
      hiddenOnMobile: true
    },
    // Nueva entrada para Deudas Móvil
   
    {
      title: "Configuración",
      icon: <Settings size={20} className="text-white" />,
      path: "/configuracion",
      description: "Ajustes del sistema",
      bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
      iconBg: "bg-gray-700"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar solo en pantallas grandes */}
      {!isMobile && <Sidebar updateSidebarWidth={updateSidebarWidth} />}
      
      <div className={`flex-grow p-3 md:p-6 transition-all duration-300 ${!isMobile ? (sidebarWidth === 'w-64' ? 'md:ml-72' : 'md:ml-16') : 'ml-0'}`}>
        {/* Encabezado */}
        <div className="mb-4 md:mb-8 p-4 bg-white rounded-xl shadow-sm">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-1">Panel de Control</h1>
          <p className="text-xs md:text-sm text-gray-500">Acceso rápido a todas las secciones del sistema</p>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
          {routeCards.map((card, index) => (
            <Link 
              to={card.path} 
              key={index}
              className={`group ${card.hiddenOnMobile ? 'hidden lg:block' : ''} ${card.hiddenOnDesktop ? 'lg:hidden' : ''}`}
            >
              <div className={`${card.bgColor} rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] h-full relative`}>
                {/* Decoración */}
                <div className="absolute -top-6 -right-6 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-black/5 blur-xl"></div>
                
                {/* Contenido */}
                <div className="p-3 md:p-4 relative z-10">
                  <div className="flex items-start mb-2 md:mb-3">
                    <div className={`${card.iconBg} p-2 rounded-lg shadow-inner flex items-center justify-center`}>
                      {card.icon}
                    </div>
                    <div className="ml-2 md:ml-3">
                      <h3 className="text-sm md:text-base font-bold text-white">{card.title}</h3>
                      <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{card.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 md:mt-3 flex items-center justify-end">
                    <span className="text-xs font-medium text-white/90 group-hover:text-white flex items-center transition-colors">
                      Acceder <ChevronRight size={14} className="ml-1 group-hover:ml-2 transition-all" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 text-center text-xs text-gray-400 p-4">
          © {new Date().getFullYear()} Sistema de Gestión
        </div>
      </div>
    </div>
  );
};

export default Dashboard;