<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'user_id' => 'required|exists:users,id',
            'image' => 'nullable|string|url', // URL de la imagen
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del producto es requerido',
            'name.max' => 'El nombre no puede tener más de 255 caracteres',
            'description.required' => 'La descripción del producto es requerida',
            'price.required' => 'El precio del producto es requerido',
            'price.numeric' => 'El precio debe ser un número',
            'price.min' => 'El precio debe ser mayor a 0',
            'stock.required' => 'El stock del producto es requerido',
            'stock.integer' => 'El stock debe ser un número entero',
            'stock.min' => 'El stock no puede ser negativo',
            'user_id.required' => 'El usuario es requerido',
            'user_id.exists' => 'El usuario especificado no existe',
            'image.url' => 'La imagen debe ser una URL válida',
        ];
    }
}
