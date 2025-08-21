<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Implementar lógica de autorización según tus necesidades
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'user_id' => 'sometimes|exists:users,id',
            'image' => 'sometimes|nullable|string|url', // URL de la imagen
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.max' => 'El nombre no puede tener más de 255 caracteres',
            'price.numeric' => 'El precio debe ser un número',
            'price.min' => 'El precio debe ser mayor a 0',
            'stock.integer' => 'El stock debe ser un número entero',
            'stock.min' => 'El stock no puede ser negativo',
            'user_id.exists' => 'El usuario especificado no existe',
            'image.url' => 'La imagen debe ser una URL válida',
        ];
    }
}
