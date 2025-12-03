<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var User|null $user */
        $user = Auth::user();
        return Auth::check() && $user instanceof User && $user->hasPermission('roles:update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255|unique:roles,name,' . $this->route('role'),
            'description' => 'sometimes|nullable|string|max:1000',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'A role with this name already exists',
            'name.max' => 'Role name cannot exceed 255 characters',
            'description.max' => 'Description cannot exceed 1000 characters',
            'permissions.array' => 'Permissions must be provided as an array',
            'permissions.*.integer' => 'Each permission ID must be an integer',
            'permissions.*.exists' => 'One or more permission IDs are invalid',
        ];
    }
}
