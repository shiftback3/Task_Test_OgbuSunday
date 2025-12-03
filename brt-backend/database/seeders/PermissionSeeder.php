<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // User Management Permissions
            ['name' => 'users:create', 'description' => 'Create new users'],
            ['name' => 'users:read', 'description' => 'View user information'],
            ['name' => 'users:update', 'description' => 'Update user information'],
            ['name' => 'users:delete', 'description' => 'Delete users'],
            ['name' => 'users:list', 'description' => 'List all users'],

            // Role Management Permissions
            ['name' => 'roles:create', 'description' => 'Create new roles'],
            ['name' => 'roles:read', 'description' => 'View role information'],
            ['name' => 'roles:update', 'description' => 'Update role information'],
            ['name' => 'roles:delete', 'description' => 'Delete roles'],
            ['name' => 'roles:list', 'description' => 'List all roles'],

            // Permission Management Permissions
            ['name' => 'permissions:create', 'description' => 'Create new permissions'],
            ['name' => 'permissions:read', 'description' => 'View permission information'],
            ['name' => 'permissions:update', 'description' => 'Update permission information'],
            ['name' => 'permissions:delete', 'description' => 'Delete permissions'],
            ['name' => 'permissions:list', 'description' => 'List all permissions'],

            // Resource Management Permissions
            ['name' => 'resources:create', 'description' => 'Create new resources'],
            ['name' => 'resources:read', 'description' => 'View resource information'],
            ['name' => 'resources:update', 'description' => 'Update resource information'],
            ['name' => 'resources:delete', 'description' => 'Delete resources'],
            ['name' => 'resources:list', 'description' => 'List all resources'],

            // Audit Log Permissions
            ['name' => 'audit:read', 'description' => 'View audit logs'],
            ['name' => 'audit:list', 'description' => 'List audit logs'],
            ['name' => 'audit:export', 'description' => 'Export audit logs'],

            // Access Request Permissions
            ['name' => 'access-requests:create', 'description' => 'Create access requests'],
            ['name' => 'access-requests:read', 'description' => 'View access requests'],
            ['name' => 'access-requests:update', 'description' => 'Update access requests'],
            ['name' => 'access-requests:delete', 'description' => 'Delete access requests'],
            ['name' => 'access-requests:list', 'description' => 'List access requests'],
            ['name' => 'access-requests:approve', 'description' => 'Approve access requests'],
            ['name' => 'access-requests:reject', 'description' => 'Reject access requests'],

            // System Administration Permissions
            ['name' => 'system:admin', 'description' => 'Full system administration access'],
            ['name' => 'system:backup', 'description' => 'Create system backups'],
            ['name' => 'system:restore', 'description' => 'Restore system from backup'],
            ['name' => 'system:maintenance', 'description' => 'Put system in maintenance mode'],

            // Security Permissions
            ['name' => 'security:manage', 'description' => 'Manage security settings'],
            ['name' => 'security:view-logs', 'description' => 'View security logs'],
            ['name' => 'security:export-data', 'description' => 'Export security data'],

            // Reports and Analytics
            ['name' => 'reports:view', 'description' => 'View system reports'],
            ['name' => 'reports:export', 'description' => 'Export reports'],
            ['name' => 'analytics:view', 'description' => 'View system analytics'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                ['description' => $permission['description']]
            );
        }

        $this->command->info('Permissions seeded successfully!');
    }
}
