<?php
namespace App\Application\Product\UseCases;

use App\Domain\Product\Repositories\ProductRepositoryInterface;
use App\Domain\Product\Entities\Product;

class GetAllProductsUseCase
{
    public function __construct(private readonly ProductRepositoryInterface $productRepository)
    {
    }

    public function execute(int $perPage = 15): array
    {
        return $this->productRepository->getPaginated($perPage);
    }
}
