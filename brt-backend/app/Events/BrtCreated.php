<?php

namespace App\Events;

use App\Models\Brt;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BrtCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Brt $brt;

    /**
     * Create a new event instance.
     */
    public function __construct(Brt $brt)
    {
        $this->brt = $brt->load('user');
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
            new Channel('brt.created'),
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
            'created_at' => $this->brt->created_at->toISOString(),
            'message' => "New BRT {$this->brt->brt_code} created with {$this->brt->reserved_amount} BLUME COIN [\$BLU]"
        ];
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'brt.created';
    }
}
