<?php

use App\Http\Controllers\Api\V1\BrtController;
use App\Models\Brt;
use App\Models\User;
use App\Events\StatsUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Test Routes for Analytics Demo
|--------------------------------------------------------------------------
*/

Route::prefix('test')->group(function () {

    // Test route to create a BRT for demo purposes
    Route::post('/create-brt', function (Request $request) {
        try {
            // Get a random user for testing
            $user = User::inRandomOrder()->first();

            if (!$user) {
                return response()->json(['error' => 'No users found'], 404);
            }

            $brt = Brt::create([
                'id' => Str::uuid(),
                'brt_code' => 'BRT-' . strtoupper(Str::random(8)),
                'reserved_amount' => $request->get('amount', rand(10, 500)),
                'user_id' => $user->id,
                'status' => 'active',
            ]);

            // Fire the events
            event(new \App\Events\BrtCreated($brt));
            event(new StatsUpdated());

            return response()->json([
                'message' => 'BRT created successfully for demo',
                'brt' => $brt,
                'user' => $user->name,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Test route to update BRT status
    Route::post('/update-brt-status', function (Request $request) {
        try {
            $brt = Brt::where('status', '!=', 'redeemed')->inRandomOrder()->first();

            if (!$brt) {
                return response()->json(['error' => 'No active BRTs found'], 404);
            }

            $originalData = $brt->toArray();
            $newStatus = $request->get('status', 'expired');

            $brt->update(['status' => $newStatus]);
            $brt->load('user');

            // Fire the events
            event(new \App\Events\BrtUpdated($brt, $originalData));
            event(new StatsUpdated());

            return response()->json([
                'message' => 'BRT status updated successfully',
                'brt' => $brt,
                'old_status' => $originalData['status'],
                'new_status' => $newStatus,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Test route to manually trigger stats update
    Route::post('/trigger-stats', function () {
        try {
            event(new StatsUpdated());
            return response()->json(['message' => 'Stats update event triggered']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

});
