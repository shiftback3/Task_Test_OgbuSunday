<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RateLimit extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'key',
        'count',
        'last_attempt',
    ];

    protected function casts(): array
    {
        return [
            'last_attempt' => 'datetime',
        ];
    }
}
