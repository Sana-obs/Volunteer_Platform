<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrganizationRequest extends FormRequest
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
            'name'=>[
                'required',
                'string',
                'min:3',
                'max:255',
                Rule::unique('organizations', 'name')
                    ->ignore(optional($this->organization)->id),
            ],
            'description'=>'required|string|min:20|max:3000',
            'city'=>'required|string|min:3|max:500',
            'website'=>'nullable|url:https,http|max:255',
        ];
    }
}
