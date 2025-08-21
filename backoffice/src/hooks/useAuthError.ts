import { useState } from 'react';

interface AuthError {
  message: string;
  field?: string;
}

export const useAuthError = () => {
  const [error, setError] = useState<AuthError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleError = (error: any) => {
    if (error instanceof Error) {
      setError({ message: error.message });
    } else if (typeof error === 'string') {
      setError({ message: error });
    } else {
      setError({ message: 'Ha ocurrido un error inesperado' });
    }
  };

  const clearError = () => {
    setError(null);
  };

  const startSubmitting = () => {
    setIsSubmitting(true);
    clearError();
  };

  const stopSubmitting = () => {
    setIsSubmitting(false);
  };

  return {
    error,
    isSubmitting,
    handleError,
    clearError,
    startSubmitting,
    stopSubmitting,
  };
};
