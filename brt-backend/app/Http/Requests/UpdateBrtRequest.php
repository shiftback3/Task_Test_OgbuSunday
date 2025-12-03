<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBrtRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reserved_amount' => 'sometimes|numeric|min:0.01|max:999999999999.99',
            'status' => 'sometimes|in:active,expired,redeemed',
            'brt_code' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('tickets', 'brt_code')->ignore($this->route('id'))
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'reserved_amount.numeric' => 'Reserved amount must be a valid number',
            'reserved_amount.min' => 'Reserved amount must be at least 0.01',
            'reserved_amount.max' => 'Reserved amount is too large',
            'status.in' => 'Status must be one of: active, expired, redeemed',
            'brt_code.unique' => 'This BRT code is already taken',
            'brt_code.max' => 'BRT code must not exceed 255 characters',
        ];
    }
}
