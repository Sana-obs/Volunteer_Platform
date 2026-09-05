<?php
// app/Http/Requests/UpdateOpportunityRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOpportunityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes',  'string', 'max:255'],
            'description' => ['sometimes','string'],
            'governorate_id' => ['sometimes', 'integer', Rule::exists('governorates', 'id')],
            'category_id' => ['sometimes', 'integer', Rule::exists('categories', 'id')],
            'skills' => ['sometimes', 'array', 'min:1'],
            'skills.*' => ['integer', Rule::exists('skills', 'id')],

            'start_date' => ['sometimes', 'date','after:now'],
            'end_date' => ['sometimes', 'date', 'after:start_date'],
            'register_end_at' => ['nullable', 'date', 'before:start_date'],

            'min_hours' => ['sometimes', 'integer', 'min:1'],
            'max_hours' => ['sometimes', 'integer', 'gte:min_hours'],
            'min_volunteers' => ['sometimes', 'integer', 'min:1'],
            'max_volunteers' => ['sometimes', 'integer', 'gte:min_volunteers', 'min:1'],
            'total_hours' => ['sometimes', 'integer', 'min:1', 'gte:max_hours'],
            'is_group' => ['sometimes','boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
    public function messages(): array
    {
        return [
            'end_date.after' => 'The end date must be after the start date.',
            'register_end_at.before' => 'The registration deadline must be before the opportunity start date.',
            'max_hours.gte' => 'The maximum hours must be greater than or equal to the minimum hours.',
            'category_id.exists' => 'The selected category does not exist.',
            'skills.*.exists' => 'One of the selected skills does not exist.',
            'image.image' => 'The uploaded file must be an image.',
            'image.max' => 'The image size must not exceed 2MB.',
        ];
    }
}
