<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VolunteerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'gender' => 'required|string',
            'city' => 'required|string',
            'education_level' => 'required|string',
            'birth_date' => 'required|date|before_or_equal:' . now()->subYears(18)->toDateString(),
            'photo' => 'nullable|string',
            'about' => 'nullable|string',
        ];
    }
}
