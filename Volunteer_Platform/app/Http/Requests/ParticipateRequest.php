<?php
// app/Http/Requests/ParticipateRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ParticipateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // الفحص الفعلي بالـ controller متل باقي الميثودز عندك
    }

    public function rules(): array
    {
        $opportunity = $this->route('opportunity');

        return [
            'committed_hours' => [
                'required',
                'integer',
                'min:' . $opportunity->min_hours,
                'max:' . $opportunity->max_hours,
            ],
        ];
    }

    public function messages(): array
    {
        $opportunity = $this->route('opportunity');

        return [
            'committed_hours.min' => "Please commit to a number between {$opportunity->min_hours} and {$opportunity->max_hours} hours.",
            'committed_hours.max' => "Please commit to a number between {$opportunity->min_hours} and {$opportunity->max_hours} hours.",
        ];
    }
}
