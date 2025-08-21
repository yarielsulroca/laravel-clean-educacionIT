<?php
namespace App\Application\User\UseCases;

use App\Domain\User\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class LoginUserUseCase {
    protected $repository;

    public function __construct(UserRepositoryInterface $repository) {
        $this->repository = $repository;
    }

    public function execute($data) {
        $user = $this->repository->findByEmail($data['email']);
        if ($user && Hash::check($data['password'], $user->password)) {
            return $user;
        }
        return null;
    }
}
