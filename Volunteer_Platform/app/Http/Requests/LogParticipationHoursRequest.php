<?php
// app/Http/Requests/LogParticipationHoursRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LogParticipationHoursRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hours' => ['required', 'integer', 'min:0'],
        ];
    }
}
