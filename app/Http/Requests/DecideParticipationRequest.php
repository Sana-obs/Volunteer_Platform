<?php
// app/Http/Requests/DecideParticipationRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enum\ParticipationStatus;
use Illuminate\Validation\Rules\Enum;

class DecideParticipationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(ParticipationStatus::class)],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string'],
        ];
    }
}
