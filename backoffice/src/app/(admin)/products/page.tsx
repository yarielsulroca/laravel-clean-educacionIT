"use client";
import React from 'react';
import ProductList from '@/components/products/ProductList';
import Link from 'next/link';
import { PlusIcon } from '@/icons';

export default function ProductsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <Link
          href="/products/create"
          className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Link>
      </div>
      
      <ProductList />
    </div>
  );
}