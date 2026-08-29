<?php
// app/Http/Requests/StoreOpportunityRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OpportunityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'governorate_id' => ['required', 'integer', Rule::exists('governorates', 'id')],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'skills' => ['required', 'array', 'min:1'],
            'skills.*' => ['integer', Rule::exists('skills', 'id')],

            'start_date' => ['required', 'date', 'after:now'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'register_start_at' => ['nullable', 'date', 'after:now', 'before:start_date'],
            'register_end_at' => ['nullable', 'date', 'after:register_start_at', 'before:start_date'],

            'min_hours' => ['required', 'integer', 'min:1'],
            'max_hours' => ['required', 'integer', 'gte:min_hours'],
            'total_hours' => ['required', 'integer', 'min:1', 'gte:max_hours'],
            'min_volunteers' => ['required', 'integer', 'min:1'],
            'max_volunteers' => ['required', 'integer', 'gte:min_volunteers', 'min:1'],

            'is_group'=>['sometimes','boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'The opportunity title is required.',
            'description.required' => 'The opportunity description is required.',
            'location.required' => 'The location is required.',
            'category_id.required' => 'The category is required.',
            'category_id.exists' => 'The selected category does not exist.',
            'skills.required' => 'Please select at least one skill.',
            'skills.*.exists' => 'One of the selected skills does not exist.',
            'start_date.required' => 'The opportunity start date is required.',
            'start_date.after' => 'The start date must be in the future.',
            'end_date.required' => 'The opportunity end date is required.',
            'end_date.after' => 'The end date must be after the start date.',
            'register_end_at.before' => 'The registration deadline must be before the opportunity start date.',
            'min_hours.required' => 'The minimum volunteer hours is required.',
            'max_hours.gte' => 'The maximum hours must be greater than or equal to the minimum hours.',
            'max_volunteers.required' => 'The maximum number of volunteers is required.',
            'image.image' => 'The uploaded file must be an image.',
            'image.max' => 'The image size must not exceed 2MB.',
        ];
    }
}
