<?php
// app/Http/Requests/UpdateVolunteerRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVolunteerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'gender'           => ['sometimes', 'string', 'in:male,female'],
            'governorate_id'   => ['sometimes', 'integer', Rule::exists('governorates', 'id')],
            'education_level'  => ['sometimes', 'string', Rule::in([
                'No Formal Education', 'High School', 'Diploma', "Bachelor's Degree",
            ])],
            'birth_date'       => ['sometimes', 'date', 'before_or_equal:' . now()->subYears(18)->toDateString()],
            'about'            => ['nullable', 'string'],
            'photo'            => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'photo_remove'     => ['sometimes', 'boolean'],
            'skills'           => ['sometimes', 'array', 'min:1'],
            'skills.*'         => ['exists:skills,id'],
        ];
    }
}
