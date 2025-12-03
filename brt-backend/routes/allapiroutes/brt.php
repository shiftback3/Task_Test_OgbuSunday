<?php

use App\Http\Controllers\Api\V1\BrtController;
use Illuminate\Support\Facades\Route;

// Public test routes (no auth required)
Route::group(['prefix' => 'v1'], function () {
    // Test notification route (public for testing)
    Route::get('test-notification', [App\Http\Controllers\Api\V1\TestNotificationController::class, 'testNotification']);
});

// BRT Management Routes (all require authentication)
Route::group(['prefix' => 'v1', 'middleware' => ['auth:api']], function () {
    Route::apiResource('brts', BrtController::class);

    // Additional BRT routes
    Route::post('brts/redeem', [BrtController::class, 'redeem'])->name('brts.redeem');
});
