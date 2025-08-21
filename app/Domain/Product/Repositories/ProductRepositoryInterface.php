<?php

namespace App\Domain\Product\Repositories;

use App\Domain\Product\Entities\Product;
interface ProductRepositoryInterface {
    /**
     * Crear un nuevo producto
     */
    public function create(Product $product);
    
    /**
     * Buscar producto por ID
     */
    public function findById(int $id);
    
    /**
     * Obtener todos los productos
     */
    public function getAll();
    
    /**
     * Actualizar un producto existente
     */
    public function update(int $id, Product $product);
    
    /**
     * Eliminar un producto
     */
    public function delete(int $id);
    
    /**
     * Buscar productos por nombre
     */
    public function findByName(string $name);
    
    /**
     * Obtener productos con paginación
     */
    public function getPaginated(int $perPage = 15);
}