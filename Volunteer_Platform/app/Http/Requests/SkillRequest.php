<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $skillId = $this->route('skill')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('skills', 'name')->ignore($skillId),
            ],
            'category_id' => ['required', 'exists:categories,id'],
        ];
    }
}
