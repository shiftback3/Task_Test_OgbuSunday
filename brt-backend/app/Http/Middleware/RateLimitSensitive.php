<?php

namespace App\Http\Middleware;

use App\Models\RateLimit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RateLimitSensitive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, int $maxAttempts = 5, int $decayMinutes = 1): Response
    {
        $key = $this->resolveRequestSignature($request);
        $cacheKey = "rate_limit:{$key}";

        // Get current count from Redis/cache
        $currentCount = Cache::get($cacheKey, 0);

        if ($currentCount >= $maxAttempts) {
            // Check if we should apply exponential backoff
            $backoffMinutes = $this->calculateBackoff($currentCount, $decayMinutes);

            // Log rate limit hit for monitoring
            Log::warning('Rate limit exceeded', [
                'key' => $key,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'attempts' => $currentCount,
                'route' => $request->route()?->getName(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Too many requests',
                'details' => [
                    'max_attempts' => $maxAttempts,
                    'retry_after' => $backoffMinutes * 60
                ]
            ], 429, [
                'Retry-After' => $backoffMinutes * 60,
                'X-RateLimit-Limit' => $maxAttempts,
                'X-RateLimit-Remaining' => 0,
            ]);
        }

        // Increment counter
        Cache::put($cacheKey, $currentCount + 1, now()->addMinutes($decayMinutes));

        // Also store in database for persistent tracking
        $this->updateDatabaseCounter($key);

        $response = $next($request);

        // Add rate limit headers to response
        $remaining = max(0, $maxAttempts - ($currentCount + 1));
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', $remaining);

        return $response;
    }

    /**
     * Resolve request signature for rate limiting
     */
    protected function resolveRequestSignature(Request $request): string
    {
        $user = $request->user();

        // For authenticated requests, use user ID + IP
        if ($user) {
            return "user:{$user->id}:ip:{$request->ip()}";
        }

        // For unauthenticated requests, use IP + User Agent hash
        return "ip:{$request->ip()}:ua:" . md5($request->userAgent() ?? '');
    }

    /**
     * Calculate exponential backoff
     */
    protected function calculateBackoff(int $attempts, int $baseMinutes): int
    {
        // Simple exponential backoff: base * 2^(attempts - threshold)
        $threshold = 5; // Start backoff after 5 attempts

        if ($attempts <= $threshold) {
            return $baseMinutes;
        }

        $exponentialFactor = min(pow(2, $attempts - $threshold), 60); // Cap at 60x
        return (int) ($baseMinutes * $exponentialFactor);
    }

    /**
     * Update database counter for persistent tracking
     */
    protected function updateDatabaseCounter(string $key): void
    {
        try {
            RateLimit::updateOrCreate(
                ['key' => $key],
                [
                    'count' => DB::raw('count + 1'),
                    'last_attempt' => now(),
                ]
            );
        } catch (\Exception $e) {
            // Don't fail the request if database logging fails
            Log::error('Failed to update rate limit counter in database', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
