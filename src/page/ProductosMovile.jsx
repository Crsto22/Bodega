import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, X, Edit2, Trash2, ArrowLeft, Filter ,
  BarChart4, AlertTriangle, Box, Tag, DollarSign, 
  Grid, Layers, ChevronRight, ChevronDown, Loader, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import NuevoProductoDrawer from '../components/NuevoProductoDrawer';
import EditarProductoDrawer from '../components/EditarProductoDrawer';
import Logo from "../img/Logo.png";
export default function ProductosMovile() {
  const [activeOption, setActiveOption] = useState('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isNuevoProductoDrawerOpen, setIsNuevoProductoDrawerOpen] = useState(false);
  const [isEditarProductoDrawerOpen, setIsEditarProductoDrawerOpen] = useState(false);
  const [isConfirmacionDrawerOpen, setIsConfirmacionDrawerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', or 'compact'
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [sortOption, setSortOption] = useState('nombre-asc');
  const [expandedStats, setExpandedStats] = useState(null);

  const { products, loading, deleteProduct } = useProduct();

  const categories = useMemo(() => [
    'Todas',
    'Dulces y Snacks',
    'Bebidas',
    'Productos de Tabaco',
    'Frutas y Verduras',
    'Productos de abarrotes',
    'Nutrición Animal',
    'Productos de Limpieza',
    'Material Escolar',
    'Higiene Personal',
    'Pan y Postres',
    'Préstamo',
    'Impresiones y Scaneos',
    'Alimentos a Granel'
  ], []);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalProductos = products.length;
    const productosBajoStock = products.filter(p => p.stock !== 'No Especificado' && p.stock < 10).length;
    const categoriasUnicas = [...new Set(products.map(p => p.categoria))].length;
    const valorTotalInventario = products.reduce((total, p) => {
      const stock = p.stock === 'No Especificado' ? 0 : Number(p.stock);
      return total + (stock * Number(p.precio));
    }, 0);
    
    // Categorías por valor
    const categoryValueData = [...new Set(products.map(p => p.categoria))].map(categoria => {
      const productsInCategory = products.filter(p => p.categoria === categoria);
      const count = productsInCategory.length;
      const totalValue = productsInCategory.reduce((total, p) => {
        const stock = p.stock === 'No Especificado' ? 0 : Number(p.stock);
        return total + (stock * Number(p.precio));
      }, 0);
      
      return {
        categoria,
        count,
        percentage: (count / totalProductos * 100).toFixed(1),
        value: totalValue,
        valuePercentage: totalProductos ? (totalValue / valorTotalInventario * 100).toFixed(1) : 0
      };
    }).sort((a, b) => b.value - a.value);

    // Productos más valiosos
    const topValueProducts = [...products]
      .map(p => ({
        ...p,
        totalValue: (p.stock === 'No Especificado' ? 0 : Number(p.stock)) * Number(p.precio)
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    // Productos bajo stock
    const lowStockProducts = products
      .filter(p => p.stock !== 'No Especificado' && p.stock < 10)
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 5);
      
    return {
      totalProductos,
      productosBajoStock,
      categoriasUnicas,
      valorTotalInventario,
      categoryValueData,
      topValueProducts,
      lowStockProducts
    };
  }, [products]);

  // Aplicar filtros y ordenación
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = 
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (product.marca && product.marca.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'Todas' || product.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Aplicar ordenación
    switch (sortOption) {
      case 'nombre-asc':
        return filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre-desc':
        return filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'precio-asc':
        return filtered.sort((a, b) => Number(a.precio) - Number(b.precio));
      case 'precio-desc':
        return filtered.sort((a, b) => Number(b.precio) - Number(a.precio));
      case 'stock-asc':
        return filtered.sort((a, b) => {
          if (a.stock === 'No Especificado') return 1;
          if (b.stock === 'No Especificado') return -1;
          return Number(a.stock) - Number(b.stock);
        });
      case 'stock-desc':
        return filtered.sort((a, b) => {
          if (a.stock === 'No Especificado') return 1;
          if (b.stock === 'No Especificado') return -1;
          return Number(b.stock) - Number(a.stock);
        });
      default:
        return filtered;
    }
  }, [products, searchTerm, selectedCategory, sortOption]);

  // Agrupar productos por categoría para la vista compacta
  const productsByCategory = useMemo(() => {
    if (viewMode !== 'compact') return null;
    
    const grouped = {};
    filteredAndSortedProducts.forEach(product => {
      if (!grouped[product.categoria]) {
        grouped[product.categoria] = [];
      }
      grouped[product.categoria].push(product);
    });
    
    return Object.keys(grouped)
      .sort()
      .map(categoria => ({
        categoria,
        products: grouped[categoria],
        count: grouped[categoria].length
      }));
  }, [filteredAndSortedProducts, viewMode]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsConfirmacionDrawerOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setIsConfirmacionDrawerOpen(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmacionDrawerOpen(false);
    setProductToDelete(null);
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setIsEditarProductoDrawerOpen(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleCategoryFilter = () => {
    setShowCategoryFilter(!showCategoryFilter);
  };

  const toggleCategory = (categoria) => {
    setExpandedCategory(expandedCategory === categoria ? null : categoria);
  };

  const toggleStats = (statName) => {
    setExpandedStats(expandedStats === statName ? null : statName);
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'Dulces y Snacks': 'bg-orange-100 text-orange-600',
      'Bebidas': 'bg-blue-100 text-blue-600',
      'Productos de Tabaco': 'bg-gray-100 text-gray-600',
      'Frutas y Verduras': 'bg-green-100 text-green-600',
      'Productos de abarrotes': 'bg-yellow-100 text-yellow-600',
      'Nutrición Animal': 'bg-purple-100 text-purple-600',
      'Productos de Limpieza': 'bg-cyan-100 text-cyan-600',
      'Material Escolar': 'bg-indigo-100 text-indigo-600',
      'Higiene Personal': 'bg-pink-100 text-pink-600',
      'Pan y Postres': 'bg-amber-100 text-amber-600',
      'Préstamo': 'bg-lime-100 text-lime-600',
      'Impresiones y Scaneos': 'bg-slate-100 text-slate-600',
      'Alimentos a Granel': 'bg-emerald-100 text-emerald-600'
    };
    
    return colors[categoria] || 'bg-gray-100 text-gray-600';
  };

  const renderProductItem = (product) => {
    switch (viewMode) {
      case 'grid':
        return (
          <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(product.categoria)}`}>
                {product.categoria}
              </span>
              {product.stock !== 'No Especificado' && Number(product.stock) < 10 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  ¡Bajo stock!
                </span>
              )}
            </div>
            
            <h3 className="font-medium text-base line-clamp-2 mb-1">{product.nombre}</h3>
            
            {product.marca && (
              <p className="text-xs text-gray-500 mb-2">{product.marca}</p>
            )}
            
            <div className="mt-auto flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500">
                  Stock: {product.stock === 'No Especificado' ? 'N/A' : product.stock}
                </p>
              </div>
              <p className="text-lg font-bold text-[#44943b]">
                S/ {Number(product.precio).toFixed(2)}
              </p>
            </div>
            
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleEditProduct(product)}
                className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                aria-label="Editar producto"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDeleteClick(product)}
                className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                aria-label="Eliminar producto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
        
      default: // lista por defecto
        return (
          <div className="p-3 hover:bg-gray-50 transition-colors rounded-lg flex flex-col">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.nombre}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(product.categoria)}`}>
                    {product.categoria}
                  </span>
                  {product.marca && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {product.marca}
                    </span>
                  )}
                  {product.stock !== 'No Especificado' && Number(product.stock) < 10 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      ¡Bajo stock!
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="font-bold text-[#44943b]">
                  S/ {Number(product.precio).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Stock: {product.stock === 'No Especificado' ? 'N/A' : product.stock}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => handleEditProduct(product)}
                className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                aria-label="Editar producto"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDeleteClick(product)}
                className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                aria-label="Eliminar producto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col w-full h-full bg-gray-50">
      {/* Header superior */}
      {/* Capa superior con botón de volver y logo */}
      <div className="absolute top-0 left-0 right-0 flex items-center p-2 z-10">
  <Link to="/">
    <button className="p-2 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-200">
      <ArrowLeft className="text-gray-700" size={20} />
    </button>
  </Link>
  <div className="flex-1 flex justify-center">
    <div className="h-12 w-32 rounded-md flex items-center justify-center">
      <img src={Logo} alt="Logo" className="h-full w-auto" />
    </div>
  </div>
  <div className="w-10"></div>
</div>

      {/* Área de contenido principal */}
      <div className="flex-1 flex flex-col pt-2 px-3 pb-16 overflow-y-auto">
        {activeOption === 'lista' && (
          <>
            {/* Opciones de vista y búsqueda */}
            <div className="flex items-center gap-2 mb-3 mt-12 top-14 bg-gray-50 py-2 ">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="text-sm w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#44943b] shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="text-gray-400 hover:text-gray-600" size={18} />
                  </button>
                )}
              </div>
              
              <button
                onClick={toggleCategoryFilter}
                className="p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                aria-label="Filtrar por categoría"
              >
                <Filter size={18} className="text-gray-600" />
              </button>
              
              <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-[#44943b] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  aria-label="Vista de lista"
                >
                  <Layers size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-[#44943b] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  aria-label="Vista de cuadrícula"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2.5 ${viewMode === 'compact' ? 'bg-[#44943b] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  aria-label="Vista compacta"
                >
                  <Layers size={18} />
                </button>
              </div>
            </div>

            {/* Filtro de categorías desplegable */}
            {showCategoryFilter && (
              <div className="mb-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Filtrar por categoría</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryFilter(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                        selectedCategory === category
                          ? 'bg-[#44943b] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ordenar por</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSortOption('nombre-asc');
                        setShowCategoryFilter(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        sortOption === 'nombre-asc' ? 'bg-[#44943b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      Nombre A-Z
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('nombre-desc');
                        setShowCategoryFilter(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        sortOption === 'nombre-desc' ? 'bg-[#44943b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      Nombre Z-A
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('precio-asc');
                        setShowCategoryFilter(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        sortOption === 'precio-asc' ? 'bg-[#44943b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      Precio ↑
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('precio-desc');
                        setShowCategoryFilter(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        sortOption === 'precio-desc' ? 'bg-[#44943b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      Precio ↓
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('stock-asc');
                        setShowCategoryFilter(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        sortOption === 'stock-asc' ? 'bg-[#44943b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      Stock ↑
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('stock-desc');
                        setShowCategoryFilter(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        sortOption === 'stock-desc' ? 'bg-[#44943b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      Stock ↓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Indicador de filtro activo */}
            {(selectedCategory !== 'Todas' || sortOption !== 'nombre-asc') && (
              <div className="flex items-center justify-between mb-3 px-3 py-2 bg-[#44943b]/10 rounded-lg">
                <div className="flex-1">
                  {selectedCategory !== 'Todas' && (
                    <span className="text-sm font-medium text-[#44943b] mr-2">
                      Categoría: {selectedCategory}
                    </span>
                  )}
                  {sortOption !== 'nombre-asc' && (
                    <span className="text-sm font-medium text-[#44943b]">
                      Orden: {
                        sortOption === 'nombre-desc' ? 'Nombre Z-A' :
                        sortOption === 'precio-asc' ? 'Precio ascendente' :
                        sortOption === 'precio-desc' ? 'Precio descendente' :
                        sortOption === 'stock-asc' ? 'Stock ascendente' :
                        sortOption === 'stock-desc' ? 'Stock descendente' : ''
                      }
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('Todas');
                    setSortOption('nombre-asc');
                  }}
                  className="text-[#44943b] hover:text-[#367c2e]"
                  aria-label="Eliminar filtros"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Mostrar número de resultados */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">
                {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'producto' : 'productos'} encontrados
              </span>
            </div>

            {/* Lista de productos */}
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 bg-white rounded-xl shadow-sm p-6">
                <Loader className="animate-spin h-8 w-8 text-[#44943b] mb-2" />
                <p className="text-gray-500">Cargando productos...</p>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                <Package size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-700">No se encontraron productos</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm || selectedCategory !== 'Todas' 
                    ? 'Intenta modificar los filtros' 
                    : 'Añade tu primer producto'}
                </p>
              </div>
            ) : (
              <>
                {viewMode === 'compact' ? (
                  <div className="space-y-3">
                    {productsByCategory?.map(categoryGroup => (
                      <div key={categoryGroup.categoria} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <button 
                          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50"
                          onClick={() => toggleCategory(categoryGroup.categoria)}
                        >
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(categoryGroup.categoria).split(' ')[0]}`}></span>
                            <span className="font-medium">{categoryGroup.categoria}</span>
                            <span className="ml-2 text-xs text-gray-500 rounded-full bg-gray-200 px-2 py-0.5">
                              {categoryGroup.count}
                            </span>
                          </div>
                          {expandedCategory === categoryGroup.categoria ? 
                            <ChevronDown size={18} className="text-gray-500" /> : 
                            <ChevronRight size={18} className="text-gray-500" />
                          }
                        </button>
                        
                        {expandedCategory === categoryGroup.categoria && (
                          <div className="divide-y divide-gray-100">
                            {categoryGroup.products.map(product => (
                              <div key={product.id} className="p-3 hover:bg-gray-50">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{product.nombre}</span>
                                  <span className="font-bold text-[#44943b]">S/ {Number(product.precio).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center text-sm text-gray-500">
                                    {product.marca && <span className="mr-2">{product.marca}</span>}
                                    <span>Stock: {product.stock === 'No Especificado' ? 'N/A' : product.stock}</span>
                                  </div>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditProduct(product);
                                      }}
                                      className="p-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                      aria-label="Editar producto"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(product);
                                      }}
                                      className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                      aria-label="Eliminar producto"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredAndSortedProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {renderProductItem(product)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAndSortedProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {renderProductItem(product)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeOption === 'estadisticas' && (
                      <div className="space-y-4 mt-14">
            {/* Cards de resumen */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Total productos</span>
                  <Package size={18} className="text-[#44943b]" />
                </div>
                <p className="text-2xl font-bold text-[#44943b]">{stats.totalProductos}</p>
                <div className="h-1 w-full bg-gray-100 rounded-full mt-2">
                  <div className="h-1 bg-[#44943b] rounded-full w-full"></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Categorías</span>
                  <Tag size={18} className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-500">{stats.categoriasUnicas}</p>
                <div className="h-1 w-full bg-gray-100 rounded-full mt-2">
                  <div className="h-1 bg-blue-500 rounded-full w-full"></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Bajo stock</span>
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-amber-500">{stats.productosBajoStock}</p>
                <div className="h-1 w-full bg-gray-100 rounded-full mt-2">
                  <div 
                    className="h-1 bg-amber-500 rounded-full" 
                    style={{ width: `${(stats.productosBajoStock / stats.totalProductos) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Valor total</span>
                  <DollarSign size={18} className="text-purple-500" />
                </div>
                <p className="text-xl font-bold text-purple-500">
                  S/ {stats.valorTotalInventario.toFixed(2)}
                </p>
                <div className="h-1 w-full bg-gray-100 rounded-full mt-2">
                  <div className="h-1 bg-purple-500 rounded-full w-full"></div>
                </div>
              </div>
            </div>

            {/* Productos bajo stock */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button 
                className="w-full px-4 py-3 flex items-center justify-between bg-amber-50"
                onClick={() => toggleStats('lowStock')}
              >
                <div className="flex items-center">
                  <AlertTriangle size={18} className="text-amber-500 mr-2" />
                  <span className="font-medium text-amber-700">Productos con bajo stock</span>
                </div>
                {expandedStats === 'lowStock' ? 
                  <ChevronDown size={18} className="text-amber-500" /> : 
                  <ChevronRight size={18} className="text-amber-500" />
                }
              </button>
              
              {expandedStats === 'lowStock' && (
                <div className="divide-y divide-gray-100 p-3">
                  {stats.lowStockProducts.length > 0 ? (
                    stats.lowStockProducts.map(product => (
                      <div key={product.id} className="py-2">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{product.nombre}</p>
                            <p className="text-xs text-gray-500">{product.categoria}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-500">Stock: {product.stock}</p>
                            <p className="text-xs text-gray-500">Precio: S/ {Number(product.precio).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-3 text-gray-500">No hay productos con bajo stock</p>
                  )}
                </div>
              )}
            </div>

            {/* Distribución por categoría */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button 
                className="w-full px-4 py-3 flex items-center justify-between bg-blue-50"
                onClick={() => toggleStats('categoryDistribution')}
              >
                <div className="flex items-center">
                  <Tag size={18} className="text-blue-500 mr-2" />
                  <span className="font-medium text-blue-700">Distribución por categoría</span>
                </div>
                {expandedStats === 'categoryDistribution' ? 
                  <ChevronDown size={18} className="text-blue-500" /> : 
                  <ChevronRight size={18} className="text-blue-500" />
                }
              </button>
              
              {expandedStats === 'categoryDistribution' && (
                <div className="p-3 space-y-3">
                  {stats.categoryValueData.length > 0 ? (
                    stats.categoryValueData.map(category => (
                      <div key={category.categoria}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{category.categoria}</span>
                          <span>{category.percentage}% ({category.count})</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-3 text-gray-500">No hay datos de categorías</p>
                  )}
                </div>
              )}
            </div>

            {/* Productos más valiosos */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button 
                className="w-full px-4 py-3 flex items-center justify-between bg-purple-50"
                onClick={() => toggleStats('topValue')}
              >
                <div className="flex items-center">
                  <DollarSign size={18} className="text-purple-500 mr-2" />
                  <span className="font-medium text-purple-700">Productos más valiosos</span>
                </div>
                {expandedStats === 'topValue' ? 
                  <ChevronDown size={18} className="text-purple-500" /> : 
                  <ChevronRight size={18} className="text-purple-500" />
                }
              </button>
              
              {expandedStats === 'topValue' && (
                <div className="divide-y divide-gray-100 p-3">
                  {stats.topValueProducts.length > 0 ? (
                    stats.topValueProducts.map(product => (
                      <div key={product.id} className="py-2">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{product.nombre}</p>
                            <p className="text-xs text-gray-500">{product.categoria}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-500">
                              S/ {product.totalValue.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.stock === 'No Especificado' ? 'N/A' : product.stock} unidades
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-3 text-gray-500">No hay datos de productos</p>
                  )}
                </div>
              )}
            </div>

            {/* Valor por categoría */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button 
                className="w-full px-4 py-3 flex items-center justify-between bg-green-50"
                onClick={() => toggleStats('categoryValue')}
              >
                <div className="flex items-center">
                  <BarChart4 size={18} className="text-green-500 mr-2" />
                  <span className="font-medium text-green-700">Valor por categoría</span>
                </div>
                {expandedStats === 'categoryValue' ? 
                  <ChevronDown size={18} className="text-green-500" /> : 
                  <ChevronRight size={18} className="text-green-500" />
                }
              </button>
              
              {expandedStats === 'categoryValue' && (
                <div className="p-3 space-y-3">
                  {stats.categoryValueData.length > 0 ? (
                    stats.categoryValueData.map(category => (
                      <div key={category.categoria}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{category.categoria}</span>
                          <span>S/ {category.value.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${category.valuePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-3 text-gray-500">No hay datos de valor por categoría</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dock de navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40">
        <div className="flex justify-around max-w-xs mx-auto rounded-xl bg-[#44943b] p-1">
          <button
            className={`flex flex-col items-center justify-center py-2 flex-1 rounded-lg transition-all ${activeOption === 'lista' ? 'bg-white shadow-md text-gray-700' : 'text-white hover:bg-[#367c2e]'}`}
            onClick={() => setActiveOption('lista')}
          >
            <Package size={18} />
            <span className="text-xs mt-1">Productos</span>
          </button>

          <button
            className={`flex flex-col items-center justify-center py-2 flex-1 rounded-lg transition-all ${activeOption === 'estadisticas' ? 'bg-white shadow-md text-gray-700' : 'text-white hover:bg-[#367c2e]'}`}
            onClick={() => setActiveOption('estadisticas')}
          >
            <BarChart4 size={18} />
            <span className="text-xs mt-1">Estadísticas</span>
          </button>
        </div>
      </div>

      {/* Drawer para nuevo producto */}
      {isNuevoProductoDrawerOpen && (
        <NuevoProductoDrawer
          isOpen={isNuevoProductoDrawerOpen}
          onClose={() => setIsNuevoProductoDrawerOpen(false)}
          productToEdit={null}
        />
      )}

      {/* Drawer para editar producto */}
      {isEditarProductoDrawerOpen && productToEdit && (
        <EditarProductoDrawer
          isOpen={isEditarProductoDrawerOpen}
          onClose={() => setIsEditarProductoDrawerOpen(false)}
          productToEdit={productToEdit}
        />
      )}

      {/* Drawer de confirmación para eliminar producto */}
      {isConfirmacionDrawerOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center transition-all">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 transform transition-all duration-300 animate-slide-up shadow-xl">
            <div className="flex flex-col items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mb-3">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-800 text-center">¿Eliminar producto?</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Esta acción no se puede deshacer. ¿Estás seguro de eliminar "{productToDelete.nombre}"?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleCancelDelete}
                className="py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-3 bg-red-500 text-white rounded-lg font-bold flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}