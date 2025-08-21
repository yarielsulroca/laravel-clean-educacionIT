<?php

namespace App\Domain\User\Repositories;

interface UserRepositoryInterface {

    public function create(array $data);
    
    public function findByEmail(string $email);
}
