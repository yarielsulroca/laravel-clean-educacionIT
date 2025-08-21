<?php
namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\Product\Repositories\ProductRepositoryInterface;
use App\Domain\Product\Entities\Product;
use App\Models\Product as EloquentProduct;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function create(Product $product): Product
    {
        $eloquentProduct = EloquentProduct::create([
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'stock' => $product->stock,
            'user_id' => $product->user_id,
            'image' => $product->image,
        ]);
        
        return new Product(
            id: $eloquentProduct->id,
            name: $eloquentProduct->name,
            description: $eloquentProduct->description,
            price: $eloquentProduct->price,
            stock: $eloquentProduct->stock,
            user_id: $eloquentProduct->user_id,
            image: $eloquentProduct->image,
            created_at: $eloquentProduct->created_at,
            updated_at: $eloquentProduct->updated_at
        );
    }

    public function findById(int $id): ?Product
    {
        $eloquentProduct = EloquentProduct::find($id);
        
        if (!$eloquentProduct) {
            return null;
        }
        
        return $this->toDomainEntity($eloquentProduct);
    }

    public function getAll(): array
    {
        return EloquentProduct::all()->map(function($eloquentProduct) 
        {return $this->toDomainEntity($eloquentProduct);})->toArray();
    }

    public function update(int $id, Product $product): Product
    {
        $eloquentProduct = EloquentProduct::find($id);
        
        if (!$eloquentProduct) {
            throw new \Exception('Producto no encontrado');
        }
        
        $eloquentProduct->update([
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'stock' => $product->stock,
            'user_id' => $product->user_id,
            'image' => $product->image,
        ]);
        
        return $this->toDomainEntity($eloquentProduct->fresh());
    }

    public function delete(int $id): bool
    {
        return EloquentProduct::where('id', $id)->delete() > 0;
    }

    public function findByName(string $name): array
    {
        return EloquentProduct::where('name', 'like', '%' . $name . '%')
            ->get()
            ->map(function($eloquentProduct) {
                return $this->toDomainEntity($eloquentProduct);
            })
            ->toArray();
    }

    public function getPaginated(int $perPage = 15): array
    {
        return EloquentProduct::paginate($perPage)
            ->getCollection()
            ->map(function($eloquentProduct) {
                return $this->toDomainEntity($eloquentProduct);
            })
            ->toArray();
    }
    
    private function toDomainEntity(EloquentProduct $eloquentProduct): Product
    {
        return new Product(
            id: $eloquentProduct->id,
            name: $eloquentProduct->name,
            description: $eloquentProduct->description,
            price: $eloquentProduct->price,
            stock: $eloquentProduct->stock,
            user_id: $eloquentProduct->user_id,
            image: $eloquentProduct->image,
            created_at: $eloquentProduct->created_at,
            updated_at: $eloquentProduct->updated_at
        );
    }
}