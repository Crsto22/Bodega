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
  UserCircle,
  Bell,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from "../img/Logo.png";
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ updateSidebarWidth }) => {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { currentUser, userData, logout } = useAuth();

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

  // Efecto para simular la carga de datos del usuario
  useEffect(() => {
    // Simular tiempo de carga para los datos del usuario
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [userData]);

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
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
  ];
  
  // Elementos de configuración y usuario - Separados para dar un tratamiento especial
  const bottomMenuItems = [
    { id: 'Configuracion', label: 'Configuración', icon: <Settings size={20} />, path: '/configuracion' },
    { id: 'Usuario', label: 'Mi Perfil', icon: <UserCircle size={20} />, path: '/perfil' },
  ];

  return (
    <div
      className={`bg-green-700 text-white shadow-xl animate transition-all duration-300 flex flex-col h-screen fixed ${
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

      {/* Menu principal - Ocupa la mayor parte del espacio */}
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

      {/* Sección flotante del usuario - Siempre visible en la parte central-inferior */}
      {expanded && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 flex items-center justify-center shadow-md ring-2 ring-indigo-400/50">
                <span className="text-xl font-bold text-white">
                  {loading ? "..." : (userData?.nombre?.charAt(0) || 'U')}
                </span>
              </div>
              <div className="flex-1">
                {loading ? (
                  <>
                    <div className="h-5 bg-blue-700/50 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-blue-700/50 rounded w-32 animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-lg text-white truncate">
                      {userData?.nombre || 'Usuario'}
                    </div>
                    <div className="text-xs text-blue-200 truncate">
                      {userData?.correo || 'Correo no disponible'}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link 
                to="/perfil"
                className="flex-1 bg-blue-700/50 hover:bg-blue-700/80 rounded-lg p-2 text-center text-sm font-medium transition-colors"
              >
                Mi Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600/70 hover:bg-red-600 rounded-lg p-2 text-center text-sm font-medium transition-colors flex items-center justify-center"
              >
                <LogOut size={16} className="mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elementos inferiores: configuración y notificaciones */}
      <div className="p-2 md:p-3 border-t border-green-600">
        <div className="flex flex-col space-y-1 md:space-y-2">
          {/* Solo mostrar aquí configuración si está colapsado */}
          {!expanded && (
            <>
              {bottomMenuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg'
                      : 'hover:bg-blue-700/30 text-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-center w-6">
                    {item.icon}
                  </div>
                </Link>
              ))}
              
              {/* Botón de cerrar sesión cuando está colapsado */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded-lg bg-red-600/70 hover:bg-red-600 text-white shadow-md transition-colors"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
          
          {/* Solo mostrar configuración si está expandido */}
          {expanded && (
            <Link
              to="/configuracion"
              className={`flex items-center p-2 md:p-3 rounded-lg md:rounded-xl cursor-pointer transition-all ${
                location.pathname === '/configuracion'
                  ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg'
                  : 'hover:bg-blue-700/30 text-blue-100 hover:translate-x-1'
              }`}
            >
              <div className={`flex items-center justify-center w-6 md:w-8 ${
                location.pathname === '/configuracion' ? 'text-white' : 'text-blue-300'
              }`}>
                <Settings size={20} />
              </div>
              <span className="ml-2 md:ml-3 text-sm md:text-base font-medium tracking-wide">
                Configuración
              </span>
              {location.pathname === '/configuracion' && (
                <ChevronRight size={14} className="ml-auto text-blue-200" />
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;