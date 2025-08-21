"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types/product';
import { UserIcon, PencilIcon, CheckIcon, XIcon } from '@/icons';

export default function ProfilePage() {
  const { user, checkAuthStatus } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('No hay usuario autenticado');
      return;
    }

    // Validación básica
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('El nombre y email son obligatorios');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('El email no es válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://educacionit.test/api'}/profile`, {
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
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      setSuccess(true);
      setIsEditing(false);
      
      // Recargar datos del usuario
      await checkAuthStatus();
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el perfil';
      setError(message);
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-medium text-gray-900 dark:text-white">
            Cargando perfil...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-600 dark:text-green-400">
                ¡Perfil actualizado exitosamente!
              </p>
            </div>
          </div>
        )}

        {/* Formulario de perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información Personal
              </h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Editar
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tu nombre completo"
                    required
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {user.name || 'No especificado'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    placeholder="tu@email.com"
                    required
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Información de la Cuenta
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">ID de Usuario:</span> {user.id}
                  </div>
                  <div>
                    <span className="font-medium">Miembro desde:</span> {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Última actualización:</span> {user.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES') : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span> 
                    <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Activo
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    <XIcon className="w-4 h-4 mr-1 inline" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : (
                      <>
                        <CheckIcon className="w-4 h-4 mr-1 inline" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Información Importante
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Tu email se utiliza para iniciar sesión en el sistema</li>
            <li>• Los cambios en tu perfil se reflejan inmediatamente</li>
            <li>• Para cambiar tu contraseña, contacta al administrador</li>
            <li>• Tu información está protegida y es confidencial</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
