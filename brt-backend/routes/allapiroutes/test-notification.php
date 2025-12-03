<?php

use App\Events\BrtNotification;
use App\Helpers\ApiHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test-brt-notification', function (Request $request) {
    try {
        // Get an actual BRT from the database if available
        $brt = \App\Models\Brt::with('user')->latest()->first();

        if (!$brt) {
            // Create a mock BRT object for testing if no BRTs exist
            $mockBrt = (object) [
                'id' => 'test-' . uniqid(),
                'brt_code' => 'TEST-' . strtoupper(substr(md5(uniqid()), 0, 8)),
                'reserved_amount' => '100.00',
                'status' => 'active',
                'user' => (object) [
                    'id' => 'test-user-id',
                    'name' => 'Test User',
                    'email' => 'test@example.com'
                ]
            ];
            $brt = $mockBrt;
        }

        // Log the event being fired
        logger('Firing test BRT notification', ['brt' => $brt]);

        // Create and fire the notification event
        $notification = new BrtNotification($brt, 'created');
        event($notification);

        return ApiHelper::validResponse('Test BRT notification sent successfully', [
            'brt_code' => $brt->brt_code ?? 'N/A',
            'action' => 'created',
            'channels' => [
                'brt-notifications' => 'public channel',
            ]
        ]);

    } catch (\Exception $e) {
        logger('Test notification error: ' . $e->getMessage(), [
            'exception' => $e,
            'trace' => $e->getTraceAsString()
        ]);

        return ApiHelper::problemResponse('Failed to send test notification: ' . $e->getMessage(), 500, $request, $e);
    }
});
