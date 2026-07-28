<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'account_type' => 'required|in:volunteer,organization',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ];

        if ($this->account_type === 'volunteer') {
            $rules['first_name'] = 'required|string|max:255';
            $rules['last_name'] = 'required|string|max:255';
            $rules['gendre'] = 'required|string|in:male,female';
            $rules['city'] = 'required|string';
            $rules['education_level'] = 'required|string';
            $rules['birth_date'] = 'required|date|before_or_equal:' . now()->subYears(18)->toDateString();
            $rules['about'] = 'nullable|string';
            $rules['photo'] = 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048';
        }

        if ($this->account_type === 'organization') {
            $rules['organization_name'] = 'required|string|min:3|max:255|unique:organizations,name';
            $rules['description'] = 'required|string|min:20|max:3000';
            $rules['city'] = 'required|string|min:3|max:500';
            $rules['website'] = 'nullable|url:https,http|max:255';
            $rules['verification_document'] = 'required|file|mimes:pdf,jpg,png|max:5120';
            $rules['photo'] = 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048';
        }

        return $rules;
    }
}
