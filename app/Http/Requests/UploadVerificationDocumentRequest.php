<?php
// app/Http/Requests/UploadVerificationDocumentRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadVerificationDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'verification_document' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'verification_document.required' => 'The verification document is required.',
            'verification_document.mimes' => 'Unsupported file format (allowed: PDF or image).',
            'verification_document.max' => 'The file size must not exceed 5MB.',
        ];
    }
}
