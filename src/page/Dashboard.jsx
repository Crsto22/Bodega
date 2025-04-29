import React, { useState } from 'react';
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
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarWidth, setSidebarWidth] = useState('w-64');
  const updateSidebarWidth = (width) => {
    setSidebarWidth(width);
  };

  // Cards de acceso a rutas mejoradas con diseño moderno
  const routeCards = [
    {
      title: "Ventas",
      icon: <ShoppingCart size={20} className="text-white" />,
      path: "/ventas",
      description: "Gestión de ventas y transacciones",
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      iconBg: "bg-green-700",
      hiddenOnMobile: true // Nueva propiedad para ocultar en móviles
    },
    {
      title: "Ventas Móviles",
      icon: <Smartphone size={20} className="text-white" />,
      path: "/ventasMovile",
      description: "Ventas optimizadas para dispositivos móviles",
      bgColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-700",
      hiddenOnDesktop: true // Nueva propiedad para ocultar en desktop
    },
    {
      title: "Compras",
      icon: <ShoppingBag size={20} className="text-white" />,
      path: "/compras",
      description: "Administración de compras a proveedores",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-blue-700"
    },
    {
      title: "Productos",
      icon: <Package size={20} className="text-white" />,
      path: "/productos",
      description: "Inventario y gestión de productos",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBg: "bg-purple-700"
    },
    {
      title: "Clientes",
      icon: <Users size={20} className="text-white" />,
      path: "/clientes",
      description: "Registro y seguimiento de clientes",
      bgColor: "bg-gradient-to-br from-amber-500 to-amber-600",
      iconBg: "bg-amber-700"
    },
    {
      title: "Proveedores",
      icon: <Truck size={20} className="text-white" />,
      path: "/proveedores",
      description: "Gestión de proveedores y contactos",
      bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-700"
    },
    {
      title: "Reportes",
      icon: <BarChart3 size={20} className="text-white" />,
      path: "/reportes",
      description: "Análisis y reportes de negocio",
      bgColor: "bg-gradient-to-br from-teal-500 to-teal-600",
      iconBg: "bg-teal-700"
    },
    {
      title: "Facturación",
      icon: <FileText size={20} className="text-white" />,
      path: "/facturacion",
      description: "Gestión de facturas y documentos",
      bgColor: "bg-gradient-to-br from-rose-500 to-rose-600",
      iconBg: "bg-rose-700"
    },
    {
      title: "Configuración",
      icon: <Settings size={20} className="text-white" />,
      path: "/configuracion",
      description: "Ajustes del sistema",
      bgColor: "bg-gradient-to-br from-gray-500 to-gray-600",
      iconBg: "bg-gray-700"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar updateSidebarWidth={updateSidebarWidth} />
      
      <div className={`flex-grow p-3 md:p-6 transition-all duration-300 ${sidebarWidth === 'w-64' ? 'ml-72' : 'ml-16'}`}>
        {/* Encabezado */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-xs md:text-base text-gray-600">Acceso rápido a todas las secciones del sistema</p>
        </div>

        {/* Cards de acceso rápido con diseño móvil adaptable */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {routeCards.map((card, index) => (
            <Link 
              to={card.path} 
              key={index}
              className={`group ${card.hiddenOnMobile ? 'hidden lg:block' : ''} ${card.hiddenOnDesktop ? 'lg:hidden' : ''}`}
            >
              <div className={`${card.bgColor} rounded-lg md:rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] h-full relative`}>
                {/* Círculo decorativo */}
                <div className="absolute -top-6 -right-6 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/10 blur-xl"></div>
                
                {/* Contenido de la tarjeta */}
                <div className="p-3 md:p-5 relative z-10">
                  <div className="flex items-start mb-2 md:mb-4">
                    <div className={`${card.iconBg} p-2 md:p-3 rounded-lg md:rounded-xl shadow`}>
                      {card.icon}
                    </div>
                    <div className="ml-2 md:ml-4">
                      <h3 className="text-sm md:text-lg font-bold text-white">{card.title}</h3>
                      <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">{card.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 md:mt-4 flex items-center justify-end">
                    <span className="text-xs md:text-sm font-medium text-white/90 group-hover:text-white flex items-center transition-colors">
                      Acceder <ChevronRight size={14} className="ml-1 group-hover:ml-2 transition-all" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Espacio adicional al final */}
        <div className="mt-6 md:mt-12"></div>
      </div>
    </div>
  );
};

export default Dashboard;