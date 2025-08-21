"use client";
import React from 'react';
import CreateProductForm from '@/components/products/CreateProductForm';
import Link from 'next/link';
import { ChevronLeftIcon } from '@/icons';

export default function CreateProductPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Volver a Productos
        </Link>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crear Nuevo Producto
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completa el formulario para agregar un nuevo producto al catálogo
          </p>
        </div>
      </div>
      
      <CreateProductForm />
    </div>
  );
}
