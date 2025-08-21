<?php

namespace App\Http\Controllers;

use App\Application\User\UseCases\RegisterUserUseCase;
use App\Application\User\UseCases\LoginUserUseCase;
use App\Http\Resources\UserResource;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Exception;

class AuthController extends Controller
{
    private const TOKEN_NAME = 'auth_token';
    private const HTTP_CREATED = 201;
    private const HTTP_OK = 200;
    private const HTTP_UNAUTHORIZED = 401;
    private const HTTP_INTERNAL_ERROR = 500;

    public function __construct
    (private readonly RegisterUserUseCase $registerUserUseCase, 
    private readonly LoginUserUseCase $loginUserUseCase) 
    {
        
    }

    /**
     * Register a new user
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            Log::info('User registration attempt', ['email' => $request->email]);
            
            $user = $this->registerUserUseCase->execute($request->validated());
            
            Log::info('User registered successfully', ['user_id' => $user->id]);
            
            return response()->json([
                'message' => 'Usuario registrado exitosamente',
                'data' => new UserResource($user)
            ], self::HTTP_CREATED);
            
        } catch (Exception $e) {
            Log::error('User registration failed', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al registrar usuario',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], self::HTTP_INTERNAL_ERROR);
        }
    }

    /**
     * Authenticate user and return token
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            Log::info('User login attempt', ['email' => $request->email]);
            
            $user = $this->loginUserUseCase->execute($request->validated());
            
            if (!$user) {
                Log::warning('Login failed - invalid credentials', ['email' => $request->email]);
                
                return response()->json([
                    'message' => 'Credenciales inválidas',
                    'error' => 'Email o contraseña incorrectos'
                ], self::HTTP_UNAUTHORIZED);
            }
            
            $token = $this->generateAuthToken($user);
            
            Log::info('User logged in successfully', ['user_id' => $user->id]);
            
            return response()->json([
                'message' => 'Login exitoso',
                'data' => [
                    'user' => new UserResource($user),
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], self::HTTP_OK);
            
        } catch (Exception $e) {
            Log::error('Login failed', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error en el login',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], self::HTTP_INTERNAL_ERROR);
        }
    }

    /**
     * Logout user and revoke token
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user) {
                /** @var \Laravel\Sanctum\HasApiTokens $user */
                $user->tokens()->delete();
                Log::info('User logged out successfully', ['user_id' => $user->id]);
            }
            
            return response()->json([
                'message' => 'Logout exitoso'
            ], self::HTTP_OK);
            
        } catch (Exception $e) {
            Log::error('Logout failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'message' => 'Error en el logout',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], self::HTTP_INTERNAL_ERROR);
        }
    }

    /**
     * Get authenticated user profile
     *
     * @return JsonResponse
     */
    public function profile(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Usuario no autenticado'
                ], self::HTTP_UNAUTHORIZED);
            }
            
            return response()->json([
                'data' => new UserResource($user)
            ], self::HTTP_OK);
            
        } catch (Exception $e) {
            Log::error('Profile retrieval failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'message' => 'Error al obtener perfil',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], self::HTTP_INTERNAL_ERROR);
        }
    }

    /**
     * Check token status and information
     *
     * @return JsonResponse
     */
    public function tokenStatus(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Token inválido o expirado'
                ], self::HTTP_UNAUTHORIZED);
            }

            /** @var \Laravel\Sanctum\HasApiTokens $user */
            $currentToken = $user->currentAccessToken();
            
            return response()->json([
                'message' => 'Token válido',
                'data' => [
                    'token_id' => $currentToken->id,
                    'token_name' => $currentToken->name,
                    'created_at' => $currentToken->created_at,
                    'last_used_at' => $currentToken->last_used_at,
                    'expires_at' => $currentToken->expires_at ?? 'No expira',
                    'user' => new UserResource($user)
                ]
            ], self::HTTP_OK);
            
        } catch (Exception $e) {
            Log::error('Token status check failed', ['error' => $e->getMessage()]);
            
            return response()->json([
                'message' => 'Error al verificar token',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], self::HTTP_INTERNAL_ERROR);
        }
    }

    /**
     * Generate authentication token for user
     *
     * @param mixed $user
     * @return string
     */
    private function generateAuthToken($user): string
    {
        return $user->createToken(self::TOKEN_NAME)->plainTextToken;
    }
}
