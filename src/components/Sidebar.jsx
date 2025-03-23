import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom'; // Importar Link y useLocation
import Logo from "../img/Logo.png";
import { useAuth } from '../context/AuthContext'; // Importar el contexto de autenticación

const Sidebar = ({ updateSidebarWidth }) => {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation(); // Obtener la ubicación actual
  const { currentUser, userData, logout } = useAuth(); // Obtener datos del usuario y la función de logout

  // Función para ajustar el tamaño de la barra lateral según el tamaño de la pantalla
  const checkScreenSize = () => {
    if (window.innerWidth < 768) {
      setExpanded(false);
      updateSidebarWidth('w-16');
    } else {
      setExpanded(true);
      updateSidebarWidth('w-64');
    }
  };

  // Efecto para ajustar el tamaño de la barra lateral al cargar y al cambiar el tamaño de la pantalla
  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Efecto para actualizar el ancho de la barra lateral cuando cambia el estado `expanded`
  useEffect(() => {
    if (expanded) {
      updateSidebarWidth('w-64');
    } else {
      updateSidebarWidth('w-16');
    }
  }, [expanded, updateSidebarWidth]);

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout(); // Cerrar sesión
      console.log("Sesión cerrada correctamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Elementos del menú con sus rutas correspondientes
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'Ventas', label: 'Ventas', icon: <ShoppingCart size={20} />, path: '/ventas' },
    { id: 'Compras', label: 'Compras', icon: <ShoppingBag size={20} />, path: '/compras' },
    { id: 'Productos', label: 'Productos', icon: <Package size={20} />, path: '/productos' },
    { id: 'Clientes', label: 'Clientes', icon: <Users size={20} />, path: '/clientes' },
    { id: 'Proveedores', label: 'Proveedores', icon: <Truck size={20} />, path: '/proveedores' },
    { id: 'Reportes', label: 'Reportes', icon: <BarChart3 size={20} />, path: '/reportes' },
    { id: 'Configuracion', label: 'Configuración', icon: <Settings size={20} />, path: '/configuracion' },
  ];

  return (
    <div
      className={`bg-green-700 text-white shadow-xl transition-all duration-300 flex flex-col h-screen fixed ${
        expanded ? 'w-64 md:w-72' : 'w-16 md:w-20'
      }`}
    >
      {/* Encabezado de la barra lateral */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-green-600">
        <div className="flex-grow flex justify-center items-center">
          {expanded && (
            <div className="overflow-hidden flex items-center justify-center">
              <img
                src={Logo}
                alt="Logo"
                className="w-20 md:w-24 object-contain"
              />
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-blue-900 to-indigo-900 transition-colors"
        >
          {expanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Menú de la barra lateral */}
      <div className="flex flex-col flex-grow p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center p-2 md:p-3 rounded-lg md:rounded-xl cursor-pointer transition-all ${
              location.pathname === item.path
                ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg'
                : 'hover:bg-blue-700/30 text-blue-100 hover:translate-x-1'
            }`}
          >
            <div className={`flex items-center justify-center w-6 md:w-8 ${
              location.pathname === item.path ? 'text-white' : 'text-blue-300'
            }`}>
              {item.icon}
            </div>
            {expanded && (
              <span className="ml-2 md:ml-3 text-sm md:text-base font-medium tracking-wide truncate">
                {item.label}
              </span>
            )}
            {expanded && location.pathname === item.path && (
              <ChevronRight size={14} className="ml-auto text-blue-200" />
            )}
          </Link>
        ))}
      </div>

      {/* Pie de la barra lateral (información del usuario y botón de cerrar sesión) */}
      <div className="p-2 md:p-4 border-t border-green-600">
        {/* Perfil de usuario con información */}
        <div className={`bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg md:rounded-xl mb-2 overflow-hidden shadow-lg transition-all duration-300 ${
          expanded ? 'p-3' : 'p-2'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 flex items-center justify-center shadow-md ring-2 ring-indigo-400/50">
                <span className="text-base font-bold text-white">
                  {userData?.nombre?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            
            {expanded && (
              <div className="ml-3 min-w-0">
                <div className="font-medium text-base truncate text-white">
                  {userData?.nombre || 'Usuario'}
                </div>
                <div className="text-xs text-blue-200 truncate">
                  {userData?.correo || 'Correo no disponible'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de cerrar sesión mejorado */}
        <button 
          onClick={handleLogout}
          className={`w-full group flex items-center cursor-pointer transition-all duration-300 rounded-lg md:rounded-xl overflow-hidden ${
            expanded ? 'justify-between hover:bg-opacity-80' : 'justify-center'
          } bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-md hover:shadow-lg`}
        >
          <div className={`flex items-center py-2 ${expanded ? 'px-3' : 'px-2'}`}>
            <LogOut size={20} className="text-white transition-transform group-hover:scale-110" />
            {expanded && (
              <span className="ml-3 text-sm md:text-base font-medium">
                Cerrar Sesión
              </span>
            )}
          </div>
          
          {expanded && (
            <div className="bg-red-800/50 h-full p-2 md:p-3 flex items-center transition-colors group-hover:bg-red-800/80">
              <X size={16} className="text-red-100" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;