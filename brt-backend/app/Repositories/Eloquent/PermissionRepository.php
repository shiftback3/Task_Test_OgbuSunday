<?php

namespace App\Repositories\Eloquent;

use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class PermissionRepository implements PermissionRepositoryInterface
{
    public function findById(int $id): ?Permission
    {
        return Permission::find($id);
    }

    public function findByName(string $name): ?Permission
    {
        return Permission::where('name', $name)->first();
    }

    public function create(array $data): Permission
    {
        return Permission::create($data);
    }

    public function update(int $id, array $data): Permission
    {
        $permission = Permission::findOrFail($id);
        $permission->update($data);
        return $permission->fresh();
    }

    public function delete(int $id): bool
    {
        return Permission::destroy($id) > 0;
    }

    public function all(): Collection
    {
        return Permission::all();
    }
}
