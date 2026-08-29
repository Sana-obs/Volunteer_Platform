<?php
// app/Http/Requests/GovernorateRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GovernorateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $governorate = $this->route('governorate');

        return [
            'name_en' => [
                'required', 'string', 'max:255',
                Rule::unique('governorates', 'name_en')->ignore($governorate),
            ],
            'name_ar' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
