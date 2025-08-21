"use client";
import React from 'react';
import EditProductForm from '@/components/products/EditProductForm';
import Link from 'next/link';
import { ChevronLeftIcon } from '@/icons';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const productId = parseInt(params.id);

  if (isNaN(productId)) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            ID de Producto Inválido
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            El ID del producto no es válido.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center mt-4 px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

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
            Editar Producto
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Modifica la información del producto existente
          </p>
        </div>
      </div>
      
      <EditProductForm productId={productId} />
    </div>
  );
}
