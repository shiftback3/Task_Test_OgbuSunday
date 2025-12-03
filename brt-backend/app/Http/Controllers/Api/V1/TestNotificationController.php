<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\BrtNotification;
use App\Helpers\ApiHelper;
use App\Http\Controllers\Controller;
use App\Models\Brt;
use Illuminate\Http\JsonResponse;

class TestNotificationController extends Controller
{
    public function testNotification(): JsonResponse
    {
        // Get any existing BRT or create a mock one for testing
        $brt = Brt::with('user')->first();

        if (!$brt) {
            return ApiHelper::problemResponse('No BRT found to test with. Please create a BRT first.', 404);
        }

        // Broadcast a test notification
        event(new BrtNotification($brt, 'created'));

        return ApiHelper::validResponse('Test notification sent successfully!', [
            'brt_code' => $brt->brt_code,
            'notification_sent' => true,
            'action' => 'created'
        ]);
    }
}
