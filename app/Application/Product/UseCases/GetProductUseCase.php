<?php
namespace App\Application\Product\UseCases;

use App\Domain\Product\Repositories\ProductRepositoryInterface;
use App\Domain\Product\Entities\Product;
use Illuminate\Support\Facades\Log;

class GetProductUseCase
{
    public function __construct(private readonly ProductRepositoryInterface $productRepository)
    {
    }

    public function execute(int $id): ?Product
    {
        $product = $this->productRepository->findById($id);
        
        if ($product) {
            // ✅ Aplicar lógica de dominio usando la entidad
            if ($product->isNew()) {
                $this->logNewProductAccess($product);
            }
            
            if ($product->isOutOfStock()) {
                $this->logOutOfStockAccess($product);
            }
            
            if ($product->isExpensive()) {
                $this->logExpensiveProductAccess($product);
            }
        }
        
        return $product;
    }
    
    private function logNewProductAccess(Product $product): void
    {
        Log::info('Acceso a producto nuevo', [
            'product_id' => $product->id,
            'name' => $product->name,
            'created_at' => $product->created_at
        ]);
    }
    
    private function logOutOfStockAccess(Product $product): void
    {
        Log::warning('Acceso a producto sin stock', [
            'product_id' => $product->id,
            'name' => $product->name
        ]);
    }
    
    private function logExpensiveProductAccess(Product $product): void
    {
        Log::info('Acceso a producto caro', [
            'product_id' => $product->id,
            'name' => $product->name,
            'price' => $product->price
        ]);
    }
}