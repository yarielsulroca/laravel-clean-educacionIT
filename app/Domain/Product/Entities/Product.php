<?php

namespace App\Domain\Product\Entities;

class Product
{
    public function __construct(
        public readonly ?int $id,
        public readonly string $name,
        public readonly string $description,
        public readonly float $price,
        public readonly int $stock,
        public readonly int $user_id,
        public readonly string $image,
        public readonly ?string $created_at = null,
        public readonly ?string $updated_at = null,
    ) 
    {$this->validate();}

    private function validate(): void
    {
        if (empty($this->name)) {
            throw new \InvalidArgumentException('El nombre del producto no puede estar vacío');
        }
        
        if ($this->price <= 0) {
            throw new \InvalidArgumentException('El precio debe ser mayor a 0');
        }
        
        if ($this->stock < 0) {
            throw new \InvalidArgumentException('El stock no puede ser negativo');
        }
        
        // ✅ Validar que la URL de imagen sea válida
        if (!empty($this->image) && !filter_var($this->image, FILTER_VALIDATE_URL)) {
            throw new \InvalidArgumentException('La URL de la imagen no es válida');
        }
    }

    // Métodos de dominio

    public function isExpensive(): bool
    {
        return $this->price > 1000;
    }

    public function isCheap(): bool
    {
    return $this->price <= 1000;
    }

    public function isAvailable(): bool
    {
        return $this->stock > 0;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock === 0;
    }

    public function isNew(): bool
    {
        return $this->created_at > now()->subDays(30);
    }

    public function isOld(): bool
    {
        return $this->created_at < now()->subDays(30);
    }

    public function isPopular(): bool  
    {
        return $this->stock > 200;
    }

    public function     isNotPopular(): bool
    {
        return $this->stock <= 200;
    }
}
