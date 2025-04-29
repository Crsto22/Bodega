import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext"; // Importar el contexto de productos
import { ClienteProvider } from "./context/ClienteContext"; // Importar el contexto de clientes
import { VentaProvider } from "./context/VentaContext"; // Importar el contexto de ventas
import { ProveedorProvider } from "./context/ProveedorContext"; // Importar el contexto de proveedores
import Login from './page/Login';
import Dashboard from './page/Dashboard';
import Productos from './page/Productos';
import Ventas from './page/Ventas';
import Clientes from './page/Clientes';
import Proveedores from './page/Proveedores';
import VentasMovile from './page/VentasMovile';
// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Obtener el usuario actual del contexto

  // Si no hay usuario autenticado, redirigir a Login
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario autenticado, permitir el acceso a la ruta
  return children;
};

// Componente para redirigir si el usuario ya está autenticado
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Obtener el usuario actual del contexto

  // Si hay usuario autenticado, redirigir al Dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no hay usuario autenticado, permitir el acceso a la ruta
  return children;
};

function App() {
  return (
    <AuthProvider> {/* Proveer el contexto de autenticación */}
      <Router>
        <Routes>
          {/* Ruta pública (Login) */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Ruta de productos con ProductProvider */}
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <ProductProvider> {/* Proveer el contexto de productos solo en esta ruta */}
                  <Productos />
                </ProductProvider>
              </ProtectedRoute>
            }
          />

          {/* Ruta de ventas con ProductProvider, ClienteProvider y VentaProvider */}
          <Route
            path="/ventas"
            element={
              <ProtectedRoute>
                <ProductProvider> {/* Proveer el contexto de productos en la ruta de ventas */}
                  <ClienteProvider> {/* Proveer el contexto de clientes en la ruta de ventas */}
                    <VentaProvider> {/* Proveer el contexto de ventas en la ruta de ventas */}
                      <Ventas />
                    </VentaProvider>
                  </ClienteProvider>
                </ProductProvider>
              </ProtectedRoute>
            }
          />

          {/* Ruta de clientes con ClienteProvider */}
          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <ClienteProvider> {/* Proveer el contexto de clientes solo en esta ruta */}
                  <Clientes />
                </ClienteProvider>
              </ProtectedRoute>
            }
          />

          {/* Ruta de proveedores con ProveedorProvider */}
          <Route
            path="/proveedores"
            element={
              <ProtectedRoute>
                <ProveedorProvider> {/* Proveer el contexto de proveedores solo en esta ruta */}
                  <Proveedores />
                </ProveedorProvider>
              </ProtectedRoute>
            }
          />
          {/* Ruta de ventas móvil */}
          <Route
            path="/ventasMovile"
            element={
              <ProtectedRoute>
                <ProductProvider> 
                <ClienteProvider>
                <VentaProvider>
                <VentasMovile />
                </VentaProvider>
                </ClienteProvider>
                </ProductProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
        
      </Router>
    </AuthProvider>
  );
}

export default App;