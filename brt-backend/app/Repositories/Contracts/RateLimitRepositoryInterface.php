<?php

namespace App\Repositories\Contracts;

use App\Models\RateLimit;
use Illuminate\Database\Eloquent\Collection;

interface RateLimitRepositoryInterface
{
    public function create(array $data): RateLimit;
    public function findByIdentifier(string $identifier): ?RateLimit;
    public function updateAttempts(string $identifier, int $attempts, \DateTime $resetTime): RateLimit;
    public function deleteExpired(): int;
    public function getRecentAttempts(string $identifier, int $minutes = 60): Collection;
}
