<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

// Test route
Route::get('v1/test', function () {
    return response()->json(['message' => 'API is working!', 'timestamp' => now()]);
});

// V1 API Routes with auth prefix
Route::prefix('v1/auth')->group(function () {
    // Authentication Routes
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    // Email Verification Routes
    Route::post('email/resend', [AuthController::class, 'resendEmailVerification'])->middleware('auth:api');

    // Protected routes (authentication required)
    Route::middleware(['auth:api'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // Password reset routes (for future implementation)
    // Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('rate.limit.sensitive:2,15');
    // Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('rate.limit.sensitive:3,10');
});

// Email Verification Route (kept outside auth group as it needs to be accessible via web)
Route::get('v1/email/verify/{id}/{token}', [AuthController::class, 'verifyEmail'])->name('api.email.verify');

// Password reset routes (to be implemented later) - with rate limiting
// Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('rate.limit.sensitive:2,15');
// Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('rate.limit.sensitive:3,10');
