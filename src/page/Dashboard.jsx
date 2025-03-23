import React, { useState } from 'react';
import Sidebar from '../components/Sidebar'; // Ensure the path is correct

const Dashboard = () => {
  const [sidebarWidth, setSidebarWidth] = useState('w-64'); // Default width

  // Function to update the sidebar width based on its state
  const updateSidebarWidth = (width) => {
    setSidebarWidth(width);
  };

  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Chocolate', precio: 2.50, categoria: 'Dulces', stock: 45 },
    { id: 2, nombre: 'Agua mineral', precio: 1.00, categoria: 'Bebidas', stock: 30 },
    { id: 3, nombre: 'Revista', precio: 3.75, categoria: 'Prensa', stock: 12 },
    { id: 4, nombre: 'Chicles', precio: 0.75, categoria: 'Dulces', stock: 60 },
    { id: 5, nombre: 'Café', precio: 1.50, categoria: 'Bebidas', stock: 25 },
  ]);

  // Estado para búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Filtrar productos según la búsqueda
  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar updateSidebarWidth={updateSidebarWidth} />
      <div className={`flex-grow p-4 md:p-8 transition-all duration-300 ${sidebarWidth === 'w-64' ? 'ml-72' : 'ml-16'}`}>
     
        
      </div>
    </div>
  );
};

export default Dashboard;
