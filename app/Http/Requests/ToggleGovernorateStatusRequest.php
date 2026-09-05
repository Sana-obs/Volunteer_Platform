<?php
// app/Http/Requests/ToggleGovernorateStatusRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ToggleGovernorateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'isActive' => ['required', 'boolean'],
        ];
    }
}
