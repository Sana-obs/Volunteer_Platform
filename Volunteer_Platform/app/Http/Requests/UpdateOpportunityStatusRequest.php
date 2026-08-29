<?php
// app/Http/Requests/UpdateOpportunityStatusRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOpportunityStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Only these two states can be toggled — section 3.1
            'status' => ['required', Rule::in(['registration_open', 'registration_closed'])],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'The status is required.',
            'status.in' => 'You can only toggle between "registration open" and "registration closed".',
        ];
    }
}
