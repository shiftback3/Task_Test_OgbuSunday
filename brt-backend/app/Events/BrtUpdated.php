<?php

namespace App\Events;

use App\Models\Brt;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BrtUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Brt $brt;
    public array $originalData;

    /**
     * Create a new event instance.
     */
    public function __construct(Brt $brt, array $originalData = [])
    {
        $this->brt = $brt->load('user');
        $this->originalData = $originalData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->brt->user_id),
            new Channel('brt.updated'),
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
            'id' => $this->brt->id,
            'brt_code' => $this->brt->brt_code,
            'reserved_amount' => $this->brt->reserved_amount,
            'status' => $this->brt->status,
            'user' => [
                'id' => $this->brt->user->id,
                'name' => $this->brt->user->name,
                'email' => $this->brt->user->email,
            ],
            'updated_at' => $this->brt->updated_at->toISOString(),
            'original_data' => $this->originalData,
            'message' => "BRT {$this->brt->brt_code} updated - Status: {$this->brt->status}, Amount: {$this->brt->reserved_amount} BLUME COIN"
        ];
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'brt.updated';
    }
}
