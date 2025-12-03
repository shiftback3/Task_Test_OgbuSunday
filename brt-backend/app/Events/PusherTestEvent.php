<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PusherTestEvent implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public string $message;

    public function __construct(string $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [new Channel('brt-notifications')];
    }

    public function broadcastAs(): string
    {
        return 'brt.notification';
    }

    public function broadcastWith(): array
    {
        $data = [
            'id' => uniqid(),
            'title' => 'Test Notification',
            'message' => $this->message,
            'action' => 'test',
            'timestamp' => now()->toISOString(),
            'brt' => [
                'id' => 'test-id',
                'brt_code' => 'BRT-TEST123',
                'reserved_amount' => '100.00',
                'status' => 'active',
                'user' => [
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                ],
            ],
        ];

        Log::info('🔔 Broadcasting PusherTestEvent', [
            'channel' => 'brt-notifications',
            'event' => 'brt.notification',
            'data' => $data
        ]);

        return $data;
    }
}
