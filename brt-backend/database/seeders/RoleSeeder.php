<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define roles with their permissions
        $rolesData = [
            'Super Admin' => [
                'description' => 'Full system access with all permissions',
                'permissions' => [
                    'users:*', 'roles:*', 'permissions:*', 'resources:*',
                    'audit:*', 'access-requests:*', 'system:*',
                    'security:*', 'reports:*', 'analytics:*'
                ]
            ],
            'Administrator' => [
                'description' => 'Administrative access to most system functions',
                'permissions' => [
                    'users:create', 'users:read', 'users:update', 'users:list',
                    'roles:read', 'roles:list',
                    'permissions:read', 'permissions:list',
                    'resources:create', 'resources:read', 'resources:update', 'resources:delete', 'resources:list',
                    'audit:read', 'audit:list',
                    'access-requests:read', 'access-requests:update', 'access-requests:list', 'access-requests:approve', 'access-requests:reject',
                    'reports:view', 'reports:export'
                ]
            ],
            'Manager' => [
                'description' => 'Management access with approval permissions',
                'permissions' => [
                    'users:read', 'users:list',
                    'roles:read', 'roles:list',
                    'resources:read', 'resources:list',
                    'audit:read', 'audit:list',
                    'access-requests:read', 'access-requests:list', 'access-requests:approve', 'access-requests:reject',
                    'reports:view'
                ]
            ],
            'HR Manager' => [
                'description' => 'Human Resources management with user oversight',
                'permissions' => [
                    'users:create', 'users:read', 'users:update', 'users:list',
                    'roles:read', 'roles:list',
                    'audit:read', 'audit:list',
                    'access-requests:read', 'access-requests:list', 'access-requests:approve',
                    'reports:view'
                ]
            ],
            'Team Lead' => [
                'description' => 'Team leadership with limited administrative access',
                'permissions' => [
                    'users:read', 'users:list',
                    'resources:read', 'resources:create', 'resources:update', 'resources:list',
                    'access-requests:read', 'access-requests:list', 'access-requests:approve',
                    'reports:view'
                ]
            ],
            'Developer' => [
                'description' => 'Development access with resource management',
                'permissions' => [
                    'resources:create', 'resources:read', 'resources:update', 'resources:list',
                    'access-requests:create', 'access-requests:read', 'access-requests:list'
                ]
            ],
            'Analyst' => [
                'description' => 'Data analysis and reporting access',
                'permissions' => [
                    'resources:read', 'resources:list',
                    'audit:read', 'audit:list', 'audit:export',
                    'reports:view', 'reports:export',
                    'analytics:view'
                ]
            ],
            'Auditor' => [
                'description' => 'Audit and compliance access',
                'permissions' => [
                    'audit:read', 'audit:list', 'audit:export',
                    'security:view-logs',
                    'reports:view', 'reports:export'
                ]
            ],
            'User' => [
                'description' => 'Basic user access',
                'permissions' => [
                    'access-requests:create', 'access-requests:read'
                ]
            ],
            'Guest' => [
                'description' => 'Limited read-only access',
                'permissions' => [
                    'resources:read'
                ]
            ]
        ];

        foreach ($rolesData as $roleName => $roleInfo) {
            $role = Role::firstOrCreate(
                ['name' => $roleName],
                ['description' => $roleInfo['description']]
            );

            // Attach permissions to role
            $permissionIds = [];
            foreach ($roleInfo['permissions'] as $permissionPattern) {
                if (str_ends_with($permissionPattern, '*')) {
                    // Handle wildcard permissions (e.g., 'users:*')
                    $prefix = str_replace('*', '', $permissionPattern);
                    $permissions = Permission::where('name', 'like', $prefix . '%')->get();
                } else {
                    // Handle specific permissions
                    $permissions = Permission::where('name', $permissionPattern)->get();
                }

                foreach ($permissions as $permission) {
                    $permissionIds[] = $permission->id;
                }
            }

            // Sync permissions (this will remove any existing and add new ones)
            $role->permissions()->sync(array_unique($permissionIds));
        }

        $this->command->info('Roles seeded successfully!');
    }
}
