"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types/product';
import { AlertIcon, ExclamationTriangleIcon } from '@/icons';
import Link from 'next/link';

export default function StockAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<{
    lowStock: Product[];
    outOfStock: Product[];
  }>({ lowStock: [], outOfStock: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStockAlerts();
    }
  }, [user]);

  const fetchStockAlerts = async () => {
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

      // Filtrar productos con problemas de stock
      const lowStock = products.filter(product => product.stock > 0 && product.stock <= 10);
      const outOfStock = products.filter(product => product.stock === 0);

      setAlerts({ lowStock, outOfStock });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar alertas de stock';
      setError(message);
      console.error('Error fetching stock alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            onClick={fetchStockAlerts}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalAlerts = alerts.lowStock.length + alerts.outOfStock.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alertas de Stock
        </h3>
        {totalAlerts > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
            {totalAlerts} alerta{totalAlerts !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {totalAlerts === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-green-600 dark:text-green-400 font-medium">
            ¡Todo en orden!
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            No hay alertas de stock pendientes
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Productos sin stock */}
          {alerts.outOfStock.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">
                  Sin Stock ({alerts.outOfStock.length})
                </h4>
              </div>
              <div className="space-y-2">
                {alerts.outOfStock.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Precio: ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <Link
                      href={`/products/edit/${product.id}`}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Reabastecer
                    </Link>
                  </div>
                ))}
                {alerts.outOfStock.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{alerts.outOfStock.length - 3} más productos sin stock
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Productos con stock bajo */}
          {alerts.lowStock.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  Stock Bajo ({alerts.lowStock.length})
                </h4>
              </div>
              <div className="space-y-2">
                {alerts.lowStock.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Stock: {product.stock} | Precio: ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <Link
                      href={`/products/edit/${product.id}`}
                      className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                    >
                      Actualizar
                    </Link>
                  </div>
                ))}
                {alerts.lowStock.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{alerts.lowStock.length - 3} más productos con stock bajo
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Enlace para ver todos los productos */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/products"
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
            >
              Ver todos los productos →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
