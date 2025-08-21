"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types/product';

export default function ProductChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<{ range: string; count: number; percentage: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChartData();
    }
  }, [user]);

  const fetchChartData = async () => {
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

      // Crear rangos de precios
      const ranges = [
        { min: 0, max: 50, label: '$0 - $50' },
        { min: 50.01, max: 100, label: '$50 - $100' },
        { min: 100.01, max: 200, label: '$100 - $200' },
        { min: 200.01, max: 500, label: '$200 - $500' },
        { min: 500.01, max: Infinity, label: '$500+' }
      ];

      const rangeCounts = ranges.map(range => {
        const count = products.filter(product => 
          product.price >= range.min && product.price <= range.max
        ).length;
        return {
          range: range.label,
          count,
          percentage: products.length > 0 ? (count / products.length) * 100 : 0
        };
      });

      setChartData(rangeCounts);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos del gráfico';
      setError(message);
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
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
            onClick={fetchChartData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...chartData.map(item => item.count));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Distribución de Productos por Precio
      </h3>
      
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
              {item.range}
            </div>
            
            <div className="flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-brand-500 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="w-16 text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {item.count}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Total:</span> {chartData.reduce((sum, item) => sum + item.count, 0)} productos
        </div>
      </div>
    </div>
  );
}
