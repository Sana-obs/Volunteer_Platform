<?php
// app/Http/Requests/UpdateAdminPasswordRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'currentPassword' => ['required', 'current_password'],
            'newPassword'     => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
