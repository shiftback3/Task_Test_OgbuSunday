<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuditEvent
{
    use Dispatchable, SerializesModels;

    public User $user;
    public string $action;
    public ?string $resourceType;
    public ?string $resourceId;
    public array $payload;
    public ?string $ip;
    public ?string $userAgent;

    /**
     * Create a new event instance.
     */
    public function __construct(
        User $user,
        string $action,
        ?string $resourceType = null,
        ?string $resourceId = null,
        array $payload = [],
        ?string $ip = null,
        ?string $userAgent = null
    ) {
        $this->user = $user;
        $this->action = $action;
        $this->resourceType = $resourceType;
        $this->resourceId = $resourceId;
        $this->payload = $payload;
        $this->ip = $ip ?? request()->ip();
        $this->userAgent = $userAgent ?? request()->userAgent();
    }
}
