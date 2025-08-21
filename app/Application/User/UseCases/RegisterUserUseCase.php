<?php
namespace App\Application\User\UseCases;

use App\Domain\User\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class RegisterUserUseCase {
    protected $repository;

    public function __construct(UserRepositoryInterface $repository) {
        $this->repository = $repository;
    }

    public function execute($data) {
        $data['password'] = Hash::make($data['password']);
        return $this->repository->create($data);
    }
}
