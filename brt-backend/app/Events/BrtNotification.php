<?php

namespace App\Events;

use App\Models\Brt;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BrtNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $brt;
    public $action;
    public $title;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Brt $brt, string $action)
    {
        $this->brt = $brt->load('user');
        $this->action = $action;

        // Generate notification content based on action
        switch ($action) {
            case 'created':
                $this->title = 'New BRT Created!';
                $this->message = "BRT {$brt->brt_code} worth \${$brt->reserved_amount} has been created by {$brt->user->name}";
                break;
            case 'updated':
                $this->title = 'BRT Updated!';
                $this->message = "BRT {$brt->brt_code} has been updated - Status: {$brt->status}";
                break;
            case 'deleted':
                $this->title = 'BRT Deleted!';
                $this->message = "BRT {$brt->brt_code} has been deleted";
                break;
            case 'redeemed':
                $this->title = 'BRT Redeemed!';
                $this->message = "BRT {$brt->brt_code} worth \${$brt->reserved_amount} has been redeemed!";
                break;
            default:
                $this->title = 'BRT Notification';
                $this->message = "BRT {$brt->brt_code} has been {$action}";
        }
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('brt-notifications'),
            new PrivateChannel('user.' . $this->brt->user_id),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => uniqid(),
            'title' => $this->title,
            'message' => $this->message,
            'action' => $this->action,
            'timestamp' => now()->toISOString(),
            'brt' => [
                'id' => $this->brt->id,
                'brt_code' => $this->brt->brt_code,
                'reserved_amount' => $this->brt->reserved_amount,
                'status' => $this->brt->status,
                'user' => [
                    'name' => $this->brt->user->name,
                    'email' => $this->brt->user->email,
                ],
            ],
        ];
    }

    /**
     * Get the event name to broadcast as.
     */
    public function broadcastAs(): string
    {
        return 'brt.notification';
    }
}
