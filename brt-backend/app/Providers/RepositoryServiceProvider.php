<?php

namespace App\Providers;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Repositories\Contracts\ResourceRepositoryInterface;
use App\Repositories\Contracts\AuditLogRepositoryInterface;
use App\Repositories\Contracts\RateLimitRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Eloquent\RoleRepository;
use App\Repositories\Eloquent\PermissionRepository;
use App\Repositories\Eloquent\ResourceRepository;
use App\Repositories\Eloquent\AuditLogRepository;
use App\Repositories\Eloquent\RateLimitRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // User Repository
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);

        // Role Repository
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);

        // Permission Repository
        $this->app->bind(PermissionRepositoryInterface::class, PermissionRepository::class);

        // Rate Limit Repository
        $this->app->bind(RateLimitRepositoryInterface::class, RateLimitRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
