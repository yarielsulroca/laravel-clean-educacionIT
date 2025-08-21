<?php
namespace App\Application\Product\UseCases;

use App\Domain\Product\Repositories\ProductRepositoryInterface;
use App\Domain\Product\Entities\Product;
use Illuminate\Support\Facades\Log;

class UpdateProductUseCase
{
    public function __construct(private readonly ProductRepositoryInterface $productRepository)
    {
    }

    public function execute(int $id, array $data): Product
    {
        // Obtener producto existente
        $existingProduct = $this->productRepository->findById($id);
        if (!$existingProduct) {
            throw new \Exception('Producto no encontrado');
        }
        
        // Crear nueva entidad con datos actualizados
        $updatedProduct = new Product(
            id: $id,
            name: $data['name'] ?? $existingProduct->name,
            description: $data['description'] ?? $existingProduct->description,
            price: $data['price'] ?? $existingProduct->price,
            stock: $data['stock'] ?? $existingProduct->stock,
            user_id: $data['user_id'] ?? $existingProduct->user_id,
            image: $data['image'] ?? $existingProduct->image,
            created_at: $existingProduct->created_at,
            updated_at: now()
        );
        
        // ✅ Aplicar lógica de negocio usando la entidad
        if ($updatedProduct->isExpensive()) {
            // Lógica para productos caros
            $this->logExpensiveProductUpdate($updatedProduct);
        }
        
        if ($updatedProduct->isOutOfStock()) {
            // Lógica para productos sin stock
            $this->notifyLowStock($updatedProduct);
        }
        
        return $this->productRepository->update($id, $updatedProduct);
    }
    
    private function logExpensiveProductUpdate(Product $product): void
    {
        // Lógica para productos caros
        Log::info('Producto caro actualizado', [
            'product_id' => $product->id,
            'price' => $product->price
        ]);
    }
    
    private function notifyLowStock(Product $product): void
    {
        // Lógica para productos sin stock
        Log::warning('Producto sin stock', [
            'product_id' => $product->id,
            'name' => $product->name
        ]);
    }
}