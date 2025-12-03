<?php

namespace App\Repositories\Contracts;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;

interface RoleRepositoryInterface
{
    public function findById(int $id): ?Role;
    public function findByName(string $name): ?Role;
    public function create(array $data): Role;
    public function update(int $id, array $data): Role;
    public function delete(int $id): bool;
    public function all(): Collection;
    public function attachPermission(int $roleId, int $permissionId): void;
    public function detachPermission(int $roleId, int $permissionId): void;
}
