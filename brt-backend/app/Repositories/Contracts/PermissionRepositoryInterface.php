<?php

namespace App\Repositories\Contracts;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Collection;

interface PermissionRepositoryInterface
{
    public function findById(int $id): ?Permission;
    public function findByName(string $name): ?Permission;
    public function create(array $data): Permission;
    public function update(int $id, array $data): Permission;
    public function delete(int $id): bool;
    public function all(): Collection;
}
