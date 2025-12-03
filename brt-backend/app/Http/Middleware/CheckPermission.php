<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            if (!$user->is_active) {
                return response()->json(['message' => 'Account inactive'], 403);
            }

            if (!$user->hasPermission($permission)) {
                return response()->json([
                    'error' => true,
                    'message' => 'Forbidden',
                    'details' => ['permission' => ["Required permission: {$permission}"]]
                ], 403);
            }

            return $next($request);

        } catch (JWTException $e) {
            return response()->json(['message' => 'Token invalid'], 401);
        }
    }
}
