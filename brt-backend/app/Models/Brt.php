<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Brt extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tickets';

    protected $fillable = [
        'user_id',
        'brt_code',
        'reserved_amount',
        'status',
    ];

    protected $casts = [
        'reserved_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($brt) {
            if (empty($brt->brt_code)) {
                $brt->brt_code = self::generateUniqueBrtCode();
            }
        });
    }

    /**
     * Generate unique BRT code
     */
    public static function generateUniqueBrtCode(): string
    {
        do {
            $code = 'BRT-' . strtoupper(Str::random(8));
        } while (self::where('brt_code', $code)->exists());

        return $code;
    }

    /**
     * User relationship
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if BRT is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if BRT is expired
     */
    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    /**
     * Check if BRT is redeemed
     */
    public function isRedeemed(): bool
    {
        return $this->status === 'redeemed';
    }

    /**
     * Mark BRT as expired
     */
    public function markAsExpired(): bool
    {
        return $this->update(['status' => 'expired']);
    }

    /**
     * Mark BRT as redeemed
     */
    public function markAsRedeemed(): bool
    {
        return $this->update(['status' => 'redeemed']);
    }

    /**
     * Scope for active BRTs
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for expired BRTs
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    /**
     * Scope for redeemed BRTs
     */
    public function scopeRedeemed($query)
    {
        return $query->where('status', 'redeemed');
    }
}
