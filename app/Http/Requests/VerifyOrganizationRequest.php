<?php

namespace App\Http\Requests;

use App\Enum\OrganizationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class VerifyOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                new Enum(OrganizationStatus::class),
            ],
            'reason' => [
                'required_if:status,rejected',
                'required_if:status,suspended',
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required'    => 'The verification status is required.',
            'reason.required_if' => 'A reason is required when rejecting or suspending the organization.',
        ];
    }
}
