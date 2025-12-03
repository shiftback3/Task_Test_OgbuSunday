<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Events\AuditEvent;
use Illuminate\Database\Eloquent\Collection;

class PermissionService
{
    protected $userRepository;
    protected $roleRepository;
    protected $permissionRepository;

    public function __construct(
        UserRepositoryInterface $userRepository,
        RoleRepositoryInterface $roleRepository,
        PermissionRepositoryInterface $permissionRepository
    ) {
        $this->userRepository = $userRepository;
        $this->roleRepository = $roleRepository;
        $this->permissionRepository = $permissionRepository;
    }

    /**
     * Check if user has specific permission
     */
    public function userHasPermission(User $user, string $permission): bool
    {
        return $user->hasPermission($permission);
    }

    /**
     * Check if user has specific role
     */
    public function userHasRole(User $user, string $roleName): bool
    {
        return $user->hasRole($roleName);
    }

    /**
     * Assign role to user
     */
    public function assignRoleToUser(string $userId, int $roleId, ?User $adminUser = null): void
    {
        $user = $this->userRepository->findById($userId);
        $role = $this->roleRepository->findById($roleId);

        if (!$user || !$role) {
            throw new \InvalidArgumentException('User or role not found');
        }

        $user->roles()->attach($roleId);

        // Dispatch audit event
        if ($adminUser) {
            event(new AuditEvent(
                user: $adminUser,
                action: 'user.role.assigned',
                resourceType: 'User',
                resourceId: $user->id,
                payload: [
                    'role_id' => $roleId,
                    'role_name' => $role->name,
                    'target_user_email' => $user->email
                ]
            ));
        }
    }

    /**
     * Remove role from user
     */
    public function removeRoleFromUser(string $userId, int $roleId, ?User $adminUser = null): void
    {
        $user = $this->userRepository->findById($userId);
        $role = $this->roleRepository->findById($roleId);

        if (!$user || !$role) {
            throw new \InvalidArgumentException('User or role not found');
        }

        $user->roles()->detach($roleId);

        // Dispatch audit event
        if ($adminUser) {
            event(new AuditEvent(
                user: $adminUser,
                action: 'user.role.removed',
                resourceType: 'User',
                resourceId: $user->id,
                payload: [
                    'role_id' => $roleId,
                    'role_name' => $role->name,
                    'target_user_email' => $user->email
                ]
            ));
        }
    }

    /**
     * Create new role
     */
    public function createRole(array $data, ?User $adminUser = null): Role
    {
        $role = $this->roleRepository->create($data);

        // Dispatch audit event
        if ($adminUser) {
            event(new AuditEvent(
                user: $adminUser,
                action: 'role.created',
                resourceType: 'Role',
                resourceId: $role->id,
                payload: [
                    'role_name' => $role->name,
                    'description' => $role->description
                ]
            ));
        }

        return $role;
    }

    /**
     * Create new permission
     */
    public function createPermission(array $data, ?User $adminUser = null): Permission
    {
        $permission = $this->permissionRepository->create($data);

        // Dispatch audit event
        if ($adminUser) {
            event(new AuditEvent(
                user: $adminUser,
                action: 'permission.created',
                resourceType: 'Permission',
                resourceId: $permission->id,
                payload: [
                    'permission_name' => $permission->name,
                    'description' => $permission->description
                ]
            ));
        }

        return $permission;
    }

    /**
     * Assign permission to role
     */
    public function assignPermissionToRole(int $roleId, int $permissionId, ?User $adminUser = null): void
    {
        $role = $this->roleRepository->findById($roleId);
        $permission = $this->permissionRepository->findById($permissionId);

        if (!$role || !$permission) {
            throw new \InvalidArgumentException('Role or permission not found');
        }

        $this->roleRepository->attachPermission($roleId, $permissionId);

        // Dispatch audit event
        if ($adminUser) {
            event(new AuditEvent(
                user: $adminUser,
                action: 'role.permission.assigned',
                resourceType: 'Role',
                resourceId: $role->id,
                payload: [
                    'role_name' => $role->name,
                    'permission_id' => $permissionId,
                    'permission_name' => $permission->name
                ]
            ));
        }
    }

    /**
     * Remove permission from role
     */
    public function removePermissionFromRole(int $roleId, int $permissionId, ?User $adminUser = null): void
    {
        $role = $this->roleRepository->findById($roleId);
        $permission = $this->permissionRepository->findById($permissionId);

        if (!$role || !$permission) {
            throw new \InvalidArgumentException('Role or permission not found');
        }

        $this->roleRepository->detachPermission($roleId, $permissionId);

        // Dispatch audit event
        if ($adminUser) {
            event(new AuditEvent(
                user: $adminUser,
                action: 'role.permission.removed',
                resourceType: 'Role',
                resourceId: $role->id,
                payload: [
                    'role_name' => $role->name,
                    'permission_id' => $permissionId,
                    'permission_name' => $permission->name
                ]
            ));
        }
    }

    /**
     * Get all roles
     */
    public function getAllRoles(): Collection
    {
        return $this->roleRepository->all();
    }

    /**
     * Get paginated roles with permissions
     */
    public function getAllRolesPaginated(int $page = 1, int $perPage = 15)
    {
        return Role::with('permissions')->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get all permissions
     */
    public function getAllPermissions(): Collection
    {
        return $this->permissionRepository->all();
    }

    /**
     * Get user permissions (computed from roles)
     */
    public function getUserPermissions(User $user): Collection
    {
        return $user->roles()
            ->with('permissions')
            ->get()
            ->flatMap(function ($role) {
                return $role->permissions;
            })
            ->unique('id');
    }
}
