<?php

namespace App\Http\Controllers;

use App\Application\Product\UseCases\CreateProductUseCase;
use App\Application\Product\UseCases\UpdateProductUseCase;
use App\Application\Product\UseCases\DeleteProductUseCase;
use App\Application\Product\UseCases\GetProductUseCase;
use App\Application\Product\UseCases\FindByNameProductUseCase;
use App\Application\Product\UseCases\GetAllProductsUseCase;
use App\Http\Requests\CreateProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class ProductController extends Controller
{
    public function __construct(
        private readonly CreateProductUseCase $createProductUseCase,
        private readonly UpdateProductUseCase $updateProductUseCase,
        private readonly DeleteProductUseCase $deleteProductUseCase,
        private readonly GetProductUseCase $getProductUseCase,
        private readonly FindByNameProductUseCase $findByNameProductUseCase,
        private readonly GetAllProductsUseCase $getAllProductsUseCase
    ) {}

    /**
     * Mostrar lista de productos (con paginación)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            
            if ($search) {
                $products = $this->findByNameProductUseCase->execute($search);
                return response()->json([
                    'data' => $products,
                    'message' => 'Productos encontrados'
                ]);
            }
            
            // ✅ Ahora usamos el caso de uso para listar todos los productos
            $products = $this->getAllProductsUseCase->execute($perPage);
            
            return response()->json([
                'data' => $products,
                'message' => 'Productos listados exitosamente',
                'pagination' => [
                    'per_page' => $perPage,
                    'total' => count($products)
                ]
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al listar productos', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error al listar productos',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }

    /**
     * Mostrar formulario de creación
     */
    public function create(): JsonResponse
    {
        return response()->json([
            'message' => 'Formulario de creación de producto'
        ]);
    }

    /**
     * Almacenar nuevo producto
     */
    public function store(CreateProductRequest $request): JsonResponse
    {
        try {
            $product = $this->createProductUseCase->execute($request->validated());
            
            Log::info('Producto creado exitosamente', [
                'product_id' => $product->id,
                'name' => $product->name
            ]);
            
            return response()->json([
                'message' => 'Producto creado exitosamente',
                'data' => $product
            ], 201);
            
        } catch (Exception $e) {
            Log::error('Error al crear producto', [
                'data' => $request->validated(),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al crear producto',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }

    /**
     * Mostrar producto específico
     */
    public function show(int $id): JsonResponse
    {
        try {
            $product = $this->getProductUseCase->execute($id);
            
            if (!$product) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }
            
            return response()->json([
                'data' => $product,
                'message' => 'Producto encontrado'
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al obtener producto', [
                'product_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al obtener producto',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit(int $id): JsonResponse
    {
        try {
            $product = $this->getProductUseCase->execute($id);
            
            if (!$product) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }
            
            return response()->json([
                'data' => $product,
                'message' => 'Formulario de edición'
            ]);
            
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener producto para edición',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }

    /**
     * Actualizar producto existente
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        try {
            $product = $this->updateProductUseCase->execute($id, $request->validated());
            
            Log::info('Producto actualizado exitosamente', [
                'product_id' => $id,
                'changes' => $request->validated()
            ]);
            
            return response()->json([
                'message' => 'Producto actualizado exitosamente',
                'data' => $product
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al actualizar producto', [
                'product_id' => $id,
                'data' => $request->validated(),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al actualizar producto',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }

    /**
     * Eliminar producto
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->deleteProductUseCase->execute($id);
            
            Log::info('Producto eliminado exitosamente', ['product_id' => $id]);
            
            return response()->json([
                'message' => 'Producto eliminado exitosamente'
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al eliminar producto', [
                'product_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al eliminar producto',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }

    /**
     * Búsqueda de productos
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $name = $request->get('name');
            
            if (!$name) {
                return response()->json([
                    'message' => 'El parámetro de búsqueda es requerido'
                ], 400);
            }
            
            $products = $this->findByNameProductUseCase->execute($name);
            
            return response()->json([
                'data' => $products,
                'message' => 'Búsqueda completada',
                'search_term' => $name
            ]);
            
        } catch (Exception $e) {
            Log::error('Error en búsqueda de productos', [
                'search_term' => $request->get('name'),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error en la búsqueda',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }

    /**
     * Dashboard de productos (estadísticas para admin)
     */
    public function dashboard(): JsonResponse
    {
        try {
            // Aquí podrías crear casos de uso específicos para estadísticas
            // Por ejemplo: GetProductStatsUseCase, GetLowStockProductsUseCase, etc.
            
            return response()->json([
                'message' => 'Dashboard de productos',
                'data' => [
                    'total_products' => 'Implementar caso de uso',
                    'low_stock_products' => 'Implementar caso de uso',
                    'expensive_products' => 'Implementar caso de uso',
                    'recent_products' => 'Implementar caso de uso'
                ]
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al obtener dashboard', ['error' => $e->getMessage()]);
            
            return response()->json([
                'message' => 'Error al obtener dashboard',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }
}
