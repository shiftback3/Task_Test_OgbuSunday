<?php

namespace App\Repositories\Eloquent;

use App\Models\RateLimit;
use App\Repositories\Contracts\RateLimitRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class RateLimitRepository implements RateLimitRepositoryInterface
{
    public function create(array $data): RateLimit
    {
        return RateLimit::create($data);
    }

    public function findByIdentifier(string $identifier): ?RateLimit
    {
        return RateLimit::where('identifier', $identifier)
                       ->where('reset_time', '>', Carbon::now())
                       ->first();
    }

    public function updateAttempts(string $identifier, int $attempts, \DateTime $resetTime): RateLimit
    {
        return RateLimit::updateOrCreate(
            ['identifier' => $identifier],
            [
                'attempts' => $attempts,
                'reset_time' => $resetTime,
                'updated_at' => Carbon::now()
            ]
        );
    }

    public function deleteExpired(): int
    {
        return RateLimit::where('reset_time', '<=', Carbon::now())->delete();
    }

    public function getRecentAttempts(string $identifier, int $minutes = 60): Collection
    {
        return RateLimit::where('identifier', $identifier)
                       ->where('updated_at', '>=', Carbon::now()->subMinutes($minutes))
                       ->orderBy('updated_at', 'desc')
                       ->get();
    }
}
