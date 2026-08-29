<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VolunteerRequest extends FormRequest
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
            'gender' => ['required','string','in:male,female'],
            'governorate_id' => ['required', 'integer', Rule::exists('governorates', 'id')],
            'education_level' => ['required', 'string', Rule::in([
                'No Formal Education', 'High School', 'Diploma', "Bachelor's Degree",
                ])],
            'birth_date' => 'required|date|before_or_equal:' . now()->subYears(18)->toDateString(),
            'about' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'skills' => 'required|array|min:1',
            'skills.*' => 'exists:skills,id',
        ];
    }
}
