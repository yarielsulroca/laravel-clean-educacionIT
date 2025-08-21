<?php
namespace App\Application\Product\UseCases;

use App\Domain\Product\Repositories\ProductRepositoryInterface;
use App\Domain\Product\Entities\Product;
use Illuminate\Support\Facades\Log;

class FindByNameProductUseCase
{
    public function __construct(private readonly ProductRepositoryInterface $productRepository)
    {
    }

    public function execute(string $name): ?Product
    {
        $product = $this->productRepository->findByName($name);
        
        if ($product) {
            // ✅ Aplicar lógica de dominio usando la entidad
            if ($product->isAvailable()) {
                $this->logAvailableProductSearch($product, $name);
            } else {
                $this->logOutOfStockProductSearch($product, $name);
            }
            
            if ($product->isPopular()) {
                $this->logPopularProductSearch($product, $name);
            }
        } else {
            $this->logProductNotFound($name);
        }
        
        return $product;
    }
    
    private function logAvailableProductSearch(Product $product, string $searchTerm): void
    {
        Log::info('Búsqueda de producto disponible', [
            'search_term' => $searchTerm,
            'product_id' => $product->id,
            'name' => $product->name,
            'stock' => $product->stock
        ]);
    }
    
    private function logOutOfStockProductSearch(Product $product, string $searchTerm): void
    {
        Log::warning('Búsqueda de producto sin stock', [
            'search_term' => $searchTerm,
            'product_id' => $product->id,
            'name' => $product->name
        ]);
    }
    
    private function logPopularProductSearch(Product $product, string $searchTerm): void
    {
        Log::info('Búsqueda de producto popular', [
            'search_term' => $searchTerm,
            'product_id' => $product->id,
            'name' => $product->name,
            'stock' => $product->stock
        ]);
    }
    
    private function logProductNotFound(string $searchTerm): void
    {
        Log::info('Producto no encontrado en búsqueda', [
            'search_term' => $searchTerm
        ]);
    }
}