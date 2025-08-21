<?php
namespace App\Application\Product\UseCases;

use App\Domain\Product\Repositories\ProductRepositoryInterface;
use App\Domain\Product\Entities\Product;
use Illuminate\Support\Facades\Log;

class DeleteProductUseCase
{
    public function __construct(private readonly ProductRepositoryInterface $productRepository)
    {
    }

    public function execute(int $id): void
    {
        $product = $this->productRepository->findById($id);
        if (!$product) {
            throw new \Exception('Producto no encontrado');
        }
        
        // ✅ Usar lógica de dominio para validar reglas de negocio
        if ($product->hasStock()) {
            throw new \Exception('No se puede eliminar un producto con stock disponible');
        }
        
        if ($product->isNew()) {
            throw new \Exception('No se puede eliminar un producto recién creado');
        }
        
        // Lógica adicional antes de eliminar
        if ($product->isExpensive()) {
            $this->logExpensiveProductDeletion($product);
        }
        
        $this->productRepository->delete($id);
    }
    
    private function logExpensiveProductDeletion(Product $product): void
    {
        Log::warning('Producto caro eliminado', [
            'product_id' => $product->id,
            'name' => $product->name,
            'price' => $product->price
        ]);
    }
}