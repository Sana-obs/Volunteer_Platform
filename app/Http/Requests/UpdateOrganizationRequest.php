<?php
// app/Http/Requests/UpdateOrganizationRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes', 'required', 'string', 'min:3', 'max:255',
                Rule::unique('organizations', 'name')->ignore($this->route('organization')?->id),
            ],
            'description'     => ['sometimes', 'required', 'string', 'min:20', 'max:3000'],
            'governorate_id'  => ['sometimes', 'nullable','integer', Rule::exists('governorates', 'id')],
            'website'         => ['nullable', 'url:https,http', 'max:255'],
            'contact_person'  => ['sometimes', 'required', 'string', 'max:255'],
            'photo'           => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'photo_remove'    => ['sometimes', 'boolean'],
        ];
    }
}
