<?php

namespace App\Repositories\Eloquent;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RoleRepository implements RoleRepositoryInterface
{
    public function findById(int $id): ?Role
    {
        return Role::with('permissions')->find($id);
    }

    public function findByName(string $name): ?Role
    {
        return Role::with('permissions')->where('name', $name)->first();
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function update(int $id, array $data): Role
    {
        $role = Role::findOrFail($id);
        $role->update($data);
        return $role->fresh();
    }

    public function delete(int $id): bool
    {
        return Role::destroy($id) > 0;
    }

    public function all(): Collection
    {
        return Role::with('permissions')->get();
    }

    public function attachPermission(int $roleId, int $permissionId): void
    {
        $role = Role::findOrFail($roleId);
        $role->permissions()->attach($permissionId);
    }

    public function detachPermission(int $roleId, int $permissionId): void
    {
        $role = Role::findOrFail($roleId);
        $role->permissions()->detach($permissionId);
    }
}
