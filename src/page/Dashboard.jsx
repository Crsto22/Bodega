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
  PlusCircle,
  CreditCard,
  FileText,
  Archive,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarWidth, setSidebarWidth] = useState('w-64');
  const updateSidebarWidth = (width) => {
    setSidebarWidth(width);
  };

  // Cards de acceso a rutas mejoradas
  const routeCards = [
    {
      title: "Ventas",
      icon: <ShoppingCart size={28} className="text-green-600" />,
      path: "/ventas",
      description: "Gestión de ventas y transacciones",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      borderColor: "border-green-200"
    },
    {
      title: "Compras",
      icon: <ShoppingBag size={28} className="text-blue-600" />,
      path: "/compras",
      description: "Administración de compras a proveedores",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200"
    },
    {
      title: "Productos",
      icon: <Package size={28} className="text-purple-600" />,
      path: "/productos",
      description: "Inventario y gestión de productos",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      borderColor: "border-purple-200"
    },
    {
      title: "Clientes",
      icon: <Users size={28} className="text-amber-600" />,
      path: "/clientes",
      description: "Registro y seguimiento de clientes",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      borderColor: "border-amber-200"
    },
    {
      title: "Proveedores",
      icon: <Truck size={28} className="text-indigo-600" />,
      path: "/proveedores",
      description: "Gestión de proveedores y contactos",
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      borderColor: "border-indigo-200"
    },
    {
      title: "Reportes",
      icon: <BarChart3 size={28} className="text-teal-600" />,
      path: "/reportes",
      description: "Análisis y reportes de negocio",
      bgColor: "bg-gradient-to-br from-teal-50 to-teal-100",
      borderColor: "border-teal-200"
    },
    {
      title: "Facturación",
      icon: <FileText size={28} className="text-rose-600" />,
      path: "/facturacion",
      description: "Gestión de facturas y documentos",
      bgColor: "bg-gradient-to-br from-rose-50 to-rose-100",
      borderColor: "border-rose-200"
    },
    {
      title: "Configuración",
      icon: <Settings size={28} className="text-gray-600" />,
      path: "/configuracion",
      description: "Ajustes del sistema",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      borderColor: "border-gray-200"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar updateSidebarWidth={updateSidebarWidth} />
      
      <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === 'w-64' ? 'ml-72' : 'ml-16'}`}>
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-gray-600">Acceso rápido a todas las secciones del sistema</p>
        </div>

        {/* Cards de acceso rápido mejoradas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {routeCards.map((card, index) => (
            <Link 
              to={card.path} 
              key={index}
              className={`${card.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border ${card.borderColor} hover:translate-y-[-4px] group`}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg bg-white shadow-sm mr-4 group-hover:shadow-md transition-shadow ${card.borderColor}`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{card.description}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors flex items-center">
                  Acceder <ChevronRight size={16} className="ml-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Espacio adicional al final */}
        <div className="mt-12"></div>
      </div>
    </div>
  );
};

export default Dashboard;