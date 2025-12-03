<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Analytics API Routes
|--------------------------------------------------------------------------
|
| Here are the analytics routes for BRT dashboard and statistics
|
*/

Route::prefix('v1')->middleware(['throttle:60,1'])->group(function () {

    // Analytics Dashboard Routes
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard'])
        ->name('analytics.dashboard');

    // Real-time statistics endpoint
    Route::get('/analytics/stats', [AnalyticsController::class, 'realTimeStats'])
        ->name('analytics.realtime');

    // Trends and historical data
    Route::get('/analytics/trends', [AnalyticsController::class, 'trends'])
        ->name('analytics.trends');
});
