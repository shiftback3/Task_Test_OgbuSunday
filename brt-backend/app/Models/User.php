<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail
{
    use HasFactory, Notifiable, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'is_active',
        'roles',
        'email_verified_at',
        'email_verification_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'roles' => 'array',
            'email_verified_at' => 'datetime',
        ];
    }



    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Get the password for authentication.
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * Roles relationship
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    /**
     * Resources relationship
     */
    // public function resources()
    // {
    //     return $this->hasMany(Resource::class, 'owner_id');
    // }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permission): bool
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists();
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $roleName): bool
    {
        // Check JSON roles first (for testing)
        if (is_array($this->roles) && in_array($roleName, $this->roles)) {
            return true;
        }

        // Fallback to relationship-based roles
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Assign a role to the user (for testing)
     */
    public function assignRole(string $roleName): void
    {
        $roles = $this->roles ?? [];
        if (!in_array($roleName, $roles)) {
            $roles[] = $roleName;
            $this->update(['roles' => $roles]);
        }
    }

    /**
     * Remove a role from the user (for testing)
     */
    public function removeRole(string $roleName): void
    {
        $roles = $this->roles ?? [];
        $roles = array_diff($roles, [$roleName]);
        $this->update(['roles' => array_values($roles)]);
    }

    /**
     * Get user permissions (simplified for testing)
     */
    public function getPermissions(): array
    {
        $roles = $this->roles ?? [];
        $permissions = [];

        foreach ($roles as $role) {
            switch ($role) {
                case 'admin':
                    $permissions = array_merge($permissions, ['manage_users', 'approve_requests', 'view_audit_logs']);
                    break;
                case 'moderator':
                    $permissions = array_merge($permissions, ['approve_requests', 'view_audit_logs']);
                    break;
                case 'user':
                    $permissions = array_merge($permissions, ['create_requests', 'view_own_logs']);
                    break;
            }
        }

        return array_unique($permissions);
    }

    /**
     * Get user's full name attribute
     */
    public function getFullNameAttribute(): string
    {
        return $this->name ?? $this->email;
    }

    /**
     * Get user's initials attribute
     */
    public function getInitialsAttribute(): string
    {
        if (!$this->name) {
            return strtoupper(substr($this->email, 0, 2));
        }

        $names = explode(' ', $this->name);
        if (count($names) >= 2) {
            return strtoupper($names[0][0] . $names[1][0]);
        }

        return strtoupper(substr($names[0], 0, 2));
    }

    /**
     * Scope to filter users with specific role
     */
    public function scopeWithRole($query, string $role)
    {
        return $query->whereJsonContains('roles', $role);
    }

    /**
     * User's BRTs relationship
     */
    public function brts()
    {
        return $this->hasMany(\App\Models\Brt::class);
    }
}
