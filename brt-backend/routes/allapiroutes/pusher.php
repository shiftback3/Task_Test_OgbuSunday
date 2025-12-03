<?php

use Illuminate\Support\Facades\Route;
use App\Events\PusherTestEvent;

// Public Pusher test endpoint (no auth) - broadcasts to my-channel/my-event
Route::get('v1/pusher-test', function () {
    event(new PusherTestEvent('Hello from Pusher!'));
    return response()->json(['ok' => true]);
});
