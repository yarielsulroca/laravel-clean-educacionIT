<?php
namespace App\Infrastructure\Persistence\Eloquent;

use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Models\User; // El modelo Eloquent

class EloquentUserRepository implements UserRepositoryInterface {
    public function create(array $data) {
        return User::create($data);
    }

    public function findByEmail(string $email) {
        return User::where('email', $email)->first();
    }
}
