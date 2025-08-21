"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import { PencilIcon, TrashBinIcon } from '@/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    try {
      console.log('ProductList - fetchProducts ejecutado'); // Debug
      setLoading(true);
      const token = localStorage.getItem('authToken');
      console.log('ProductList - Token encontrado:', token); // Debug
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      console.log('ProductList - Haciendo petición a:', `${process.env.NEXT_PUBLIC_API_URL || 'https://educacionit.test/api'}/admin/products`); // Debug
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://educacionit.test/api'}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('ProductList - Respuesta recibida:', response.status, response.statusText); // Debug

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      console.log('ProductList - Datos recibidos:', data); // Debug
      console.log('ProductList - Productos extraídos:', data.data); // Debug
      console.log('ProductList - Cantidad de productos:', data.data?.length || 0); // Debug
      setProducts(data.data); // ✅ Accedemos a data.data donde están los productos
      console.log('ProductList - Estado de productos después de setProducts:', data.data); // Debug
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    console.log('ProductList - useEffect ejecutado, user:', user); // Debug
    
    if (!user) {
      console.log('ProductList - No hay usuario, mostrando error'); // Debug
      setError('Debes iniciar sesión para ver los productos');
      setLoading(false);
      return;
    }
    
    console.log('ProductList - Usuario encontrado, ejecutando fetchProducts'); // Debug
    fetchProducts();
  }, [user, fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://educacionit.test/api'}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return;
      }

      // Recargar la lista
      fetchProducts();
      
      // Mostrar mensaje de éxito
      alert('Producto eliminado correctamente');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar producto';
      alert(message);
      console.error('Error deleting product:', err);
    }
  };

  if (loading) {
    console.log('ProductList - Mostrando loading'); // Debug
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    console.log('ProductList - Mostrando error:', error); // Debug
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  console.log('ProductList - Renderizando tabla con', products.length, 'productos'); // Debug
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuario ID
                  </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay productos disponibles
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                                             {product.image && (
                         <Image
                           className="h-10 w-10 rounded-full object-cover mr-3"
                           src={product.image}
                           alt={product.name}
                           width={40}
                           height={40}
                         />
                       )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : product.stock > 0 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                     {product.user_id}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="text-brand-600 hover:text-brand-900 dark:text-brand-400 p-1 rounded hover:bg-brand-50 dark:hover:bg-brand-900/20"
                        title="Editar producto"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Eliminar producto"
                        title="Eliminar producto"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}