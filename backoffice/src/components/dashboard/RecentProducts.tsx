"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types/product';
import { TimeIcon, PlusIcon } from '@/icons';
import Link from 'next/link';
import Image from 'next/image';

export default function RecentProducts() {
  const { user } = useAuth();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecentProducts();
    }
  }, [user]);

  const fetchRecentProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://educacionit.test/api'}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      const products: Product[] = data.data;

      // Ordenar por fecha de creación (más recientes primero) y tomar los últimos 5
      const sortedProducts = products
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setRecentProducts(sortedProducts);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos recientes';
      setError(message);
      console.error('Error fetching recent products:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hoy';
    } else if (diffDays === 2) {
      return 'Ayer';
    } else if (diffDays <= 7) {
      return `Hace ${diffDays - 1} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-2">{error}</p>
          <button 
            onClick={fetchRecentProducts}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TimeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productos Recientes
            </h3>
          </div>
          <Link
            href="/products/create"
            className="inline-flex items-center px-3 py-2 bg-brand-500 text-white text-sm rounded-md hover:bg-brand-600 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Nuevo Producto
          </Link>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Los últimos productos agregados al sistema
        </p>
      </div>

      <div className="p-6">
        {recentProducts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No hay productos aún
            </p>
            <Link
              href="/products/create"
              className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
            >
              Crear el primer producto
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                {/* Imagen del producto */}
                <div className="flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <PlusIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {product.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                  
                  {/* Fecha de creación */}
                  <div className="flex items-center mt-2">
                    <TimeIcon className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Agregado {formatDate(product.created_at)}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex-shrink-0">
                  <Link
                    href={`/products/edit/${product.id}`}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enlace para ver todos los productos */}
        {recentProducts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              href="/products"
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
            >
              Ver todos los productos →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
