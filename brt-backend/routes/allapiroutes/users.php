<?php

use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

// User Management Routes (require authentication and proper permissions)
Route::group(['prefix' => 'v1', 'middleware' => ['auth:api']], function () {
    Route::apiResource('users', UserController::class);

    // Additional user-specific routes
    Route::post('users/{user}/assign-role', [UserController::class, 'assignRole'])->name('users.assign-role');
    Route::delete('users/{user}/remove-role/{role}', [UserController::class, 'removeRole'])->name('users.remove-role');
    Route::get('users/{user}/permissions', [UserController::class, 'getUserPermissions'])->name('users.permissions');
});
