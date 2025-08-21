"use client";
import React from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import ProductChart from '@/components/dashboard/ProductChart';
import RecentProducts from '@/components/dashboard/RecentProducts';
import StockAlerts from '@/components/dashboard/StockAlerts';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen y estadísticas de tu catálogo de productos
        </p>
      </div>
      
      {/* Estadísticas principales */}
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Gráfico de productos por precio */}
        <ProductChart />
        
        {/* Alertas de stock */}
        <StockAlerts />
      </div>
      
      {/* Productos recientes */}
      <div className="mt-6">
        <RecentProducts />
      </div>
    </div>
  );
}
