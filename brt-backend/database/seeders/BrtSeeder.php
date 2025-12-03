<?php

namespace Database\Seeders;

use App\Models\Brt;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrtSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users
        $users = [];
        for ($i = 1; $i <= 5; $i++) {
            $users[] = User::create([
                'id' => Str::uuid(),
                'name' => "Test User $i",
                'email' => "user$i@example.com",
                'password_hash' => bcrypt('password123'),
                'is_active' => true,
                'roles' => ['user'],
            ]);
        }

        // Create sample BRTs with different statuses and dates
        $statuses = ['active', 'expired', 'redeemed'];
        $amounts = [10.50, 25.00, 50.00, 100.00, 250.00];

        for ($i = 0; $i < 25; $i++) {
            $user = $users[array_rand($users)];
            $status = $statuses[array_rand($statuses)];
            $amount = $amounts[array_rand($amounts)];

            // Create BRTs with dates spread over the last 30 days
            $createdAt = now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            Brt::create([
                'id' => Str::uuid(),
                'brt_code' => 'BRT-' . strtoupper(Str::random(8)),
                'reserved_amount' => $amount,
                'user_id' => $user->id,
                'status' => $status,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $this->command->info('BRT test data seeded successfully!');
    }
}
