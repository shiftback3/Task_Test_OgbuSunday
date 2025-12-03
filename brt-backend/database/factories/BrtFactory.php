<?php

namespace Database\Factories;

use App\Models\Brt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Brt>
 */
class BrtFactory extends Factory
{
    protected $model = Brt::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'brt_code' => 'BRT-' . strtoupper($this->faker->bothify('????????')),
            'reserved_amount' => $this->faker->randomFloat(2, 1, 10000),
            'status' => $this->faker->randomElement(['active', 'expired', 'redeemed']),
        ];
    }

    /**
     * Indicate that the BRT is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the BRT is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
        ]);
    }

    /**
     * Indicate that the BRT is redeemed.
     */
    public function redeemed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'redeemed',
        ]);
    }
}
