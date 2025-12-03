<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BrtDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $brtId;
    public string $brtCode;
    public string $userId;
    public array $brtData;

    /**
     * Create a new event instance.
     */
    public function __construct(string $brtId, string $brtCode, string $userId, array $brtData)
    {
        $this->brtId = $brtId;
        $this->brtCode = $brtCode;
        $this->userId = $userId;
        $this->brtData = $brtData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
            new Channel('brt.deleted'),
            new Channel('analytics'),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->brtId,
            'brt_code' => $this->brtCode,
            'user_id' => $this->userId,
            'brt_data' => $this->brtData,
            'deleted_at' => now()->toISOString(),
            'message' => "BRT {$this->brtCode} has been deleted"
        ];
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'brt.deleted';
    }
}
