<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;

Route::get('/ping', fn () => response()->json(['pong' => true]));

// Auth routes (public)
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('profile', [AuthController::class, 'profile']);
    Route::get('token-status', [AuthController::class, 'tokenStatus']);
    
    // Product routes (Admin panel)
    Route::prefix('admin/products')->group(function () {
        Route::get('/', [ProductController::class, 'index']);           // Listar productos
        Route::get('/dashboard', [ProductController::class, 'dashboard']); // Dashboard admin
        Route::get('/search', [ProductController::class, 'search']);   // Búsqueda
        Route::post('/', [ProductController::class, 'store']);         // Crear producto
        Route::get('/{id}', [ProductController::class, 'show']);      // Ver producto
        Route::get('/{id}/edit', [ProductController::class, 'edit']); // Formulario edición
        Route::put('/{id}', [ProductController::class, 'update']);    // Actualizar producto
        Route::delete('/{id}', [ProductController::class, 'destroy']); // Eliminar producto
    });
});
