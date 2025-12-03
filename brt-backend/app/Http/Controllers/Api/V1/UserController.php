<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserController extends Controller
{
    protected $userRepository;
    protected $permissionService;

    public function __construct(
        UserRepositoryInterface $userRepository,
        PermissionService $permissionService
    ) {
        $this->userRepository = $userRepository;
        $this->permissionService = $permissionService;
    }

    /**
     * List all users (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $page = $request->get('page', 1);
            $perPage = min($request->get('per_page', 15), 50); // Limit to 50 per page

            $users = $this->userRepository->all($page, $perPage);

            return ApiHelper::validResponse('Users retrieved successfully', [
                'users' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'last_page' => $users->lastPage(),
                ]
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to retrieve users', 500, $request, $e);
        }
    }

    /**
     * Get specific user by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = $this->userRepository->findById($id);

            if (!$user) {
                return ApiHelper::notFoundResponse('User not found');
            }

            return ApiHelper::validResponse('User retrieved successfully', [
                'user' => $user->load('roles.permissions')
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to retrieve user', 500, null, $e);
        }
    }

    /**
     * Create new user
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['password_hash'] = Hash::make($data['password']);
            unset($data['password']);

            $user = $this->userRepository->create($data);

            return ApiHelper::createdResponse('User created successfully', $user);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to create user', 500, $request, $e);
        }
    }

    /**
     * Update existing user
     */
    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        try {
            $user = $this->userRepository->findById($id);

            if (!$user) {
                return ApiHelper::notFoundResponse('User not found');
            }

            $data = $request->validated();

            if (isset($data['password'])) {
                $data['password_hash'] = Hash::make($data['password']);
                unset($data['password']);
            }

            $updatedUser = $this->userRepository->update($id, $data);

            return ApiHelper::validResponse('User updated successfully', [
                'user' => $updatedUser->load('roles.permissions')
            ]);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to update user', 500, $request, $e);
        }
    }

    /**
     * Delete user
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = $this->userRepository->findById($id);

            if (!$user) {
                return ApiHelper::notFoundResponse('User not found');
            }

            $deleted = $this->userRepository->delete($id);

            if ($deleted) {
                return ApiHelper::validResponse('User deleted successfully');
            }

            return ApiHelper::problemResponse('Failed to delete user', 500);

        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to delete user', 500, null, $e);
        }
    }

    /**
     * Assign role to user
     */
    public function assignRole(Request $request, string $userId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'role_id' => 'required|integer|exists:roles,id',
            ]);

            if ($validator->fails()) {
                return ApiHelper::inputErrorResponse(
                    'Validation failed',
                    422,
                    $request,
                    new ValidationException($validator)
                );
            }

            $adminUser = JWTAuth::user();
            $this->permissionService->assignRoleToUser(
                $userId,
                $request->role_id,
                $adminUser
            );

            return ApiHelper::validResponse('Role assigned successfully');

        } catch (\InvalidArgumentException $e) {
            return ApiHelper::notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to assign role', 500, $request, $e);
        }
    }

    /**
     * Remove role from user
     */
    public function removeRole(Request $request, string $userId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'role_id' => 'required|integer|exists:roles,id',
            ]);

            if ($validator->fails()) {
                return ApiHelper::inputErrorResponse(
                    'Validation failed',
                    422,
                    $request,
                    new ValidationException($validator)
                );
            }

            $adminUser = JWTAuth::user();
            $this->permissionService->removeRoleFromUser(
                $userId,
                $request->role_id,
                $adminUser
            );

            return ApiHelper::validResponse('Role removed successfully');

        } catch (\InvalidArgumentException $e) {
            return ApiHelper::notFoundResponse($e->getMessage());
        } catch (\Exception $e) {
            return ApiHelper::problemResponse('Failed to remove role', 500, $request, $e);
        }
    }
}
