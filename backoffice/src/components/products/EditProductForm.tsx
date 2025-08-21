"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Product, UpdateProductData } from '@/types/product';
import { CheckCircleIcon, AlertIcon } from '@/icons';

interface EditProductFormProps {
  productId: number;
}

export default function EditProductForm({ productId }: EditProductFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<UpdateProductData>({
    id: productId,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar datos del producto
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://educacionit.test/api'}/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        if (response.status === 404) {
          throw new Error('Producto no encontrado.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const productData = data.data;
      
      setProduct(productData);
      setFormData({
        id: productId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        image: productData.image || ''
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar el producto';
      setError(message);
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Debes iniciar sesión para editar productos');
      return;
    }

    // Validación básica
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('El nombre y la descripción son obligatorios');
      return;
    }

    if (formData.price <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    if (formData.stock < 0) {
      setError('El stock no puede ser negativo');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://educacionit.test/api'}/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        if (response.status === 404) {
          throw new Error('Producto no encontrado.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/products');
      }, 2000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el producto';
      setError(message);
      console.error('Error updating product:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando producto...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <AlertIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Error al Cargar el Producto
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={fetchProduct}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
            ¡Producto Actualizado Exitosamente!
          </h3>
          <p className="text-green-600 dark:text-green-300">
            Redirigiendo a la lista de productos...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Nombre del Producto */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Laptop Dell Inspiron"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe las características del producto..."
              required
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          {/* URL de la Imagen */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL de la Imagen
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Opcional. Deja vacío para usar una imagen por defecto.
            </p>
          </div>

          {/* Información del Producto */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Información del Producto
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">ID:</span> {product.id}
              </div>
              <div>
                <span className="font-medium">Usuario ID:</span> {product.user_id}
              </div>
              <div>
                <span className="font-medium">Creado:</span> {new Date(product.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Actualizado:</span> {new Date(product.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
