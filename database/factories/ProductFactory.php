<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 1.00, 1000.00),
            'stock' => fake()->numberBetween(0, 1000),
            'image' => 'https://picsum.photos/400/300?random=' . fake()->unique()->numberBetween(1, 1000),
            'user_id' => User::factory(),
        ];
    }
}