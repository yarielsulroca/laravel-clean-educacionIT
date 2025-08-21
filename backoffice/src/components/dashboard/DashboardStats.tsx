"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types/product';
import { 
  BoxIcon, 
  DollarLineIcon, 
  AlertIcon, 
  TrendingUpIcon 
} from '@/icons';

export default function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
    averagePrice: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
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

      // Calcular estadísticas
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
      const lowStock = products.filter(product => product.stock > 0 && product.stock <= 10).length;
      const outOfStock = products.filter(product => product.stock === 0).length;
      const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;

      setStats({
        totalProducts,
        totalValue,
        lowStock,
        outOfStock,
        averagePrice
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertIcon className="w-5 h-5 text-red-400 mr-2" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
        <button 
          onClick={fetchStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Productos',
      value: stats.totalProducts,
      icon: <BoxIcon className="w-6 h-6" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Valor Total del Inventario',
      value: `$${stats.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <DollarLineIcon className="w-6 h-6" />,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Stock Bajo (≤10)',
      value: stats.lowStock,
      icon: <AlertIcon className="w-6 h-6" />,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    },
    {
      title: 'Sin Stock',
      value: stats.outOfStock,
      icon: <TrendingUpIcon className="w-6 h-6" />,
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
              <div className={stat.textColor}>
                {stat.icon}
              </div>
            </div>
          </div>
          
          {/* Información adicional para algunos stats */}
          {stat.title === 'Valor Total del Inventario' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Precio promedio: ${stats.averagePrice.toFixed(2)}
            </p>
          )}
          
          {stat.title === 'Stock Bajo (≤10)' && stats.lowStock > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              Requiere atención
            </p>
          )}
          
          {stat.title === 'Sin Stock' && stats.outOfStock > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              Reabastecer urgentemente
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
