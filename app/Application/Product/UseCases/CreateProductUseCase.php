<?php
namespace App\Application\Product\UseCases;

use App\Domain\Product\Repositories\ProductRepositoryInterface;
use App\Domain\Product\Entities\Product;

class CreateProductUseCase
{
    private $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function execute(array $data): Product
    {
        $product = new Product(
            id: null,
            name: $data['name'],
            description: $data['description'],
            price: $data['price'],
            stock: $data['stock'],
            user_id: $data['user_id'],
            image: $data['image'],
            created_at: now(),
            updated_at: now(),
        );
        
        $this->productRepository->create($product);
        return $product;
    }
}
