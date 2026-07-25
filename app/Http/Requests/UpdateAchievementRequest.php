<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAchievementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'    => 'sometimes|string|max:255',
            'type'    => 'sometimes|string|max:255',
            'date'    => 'sometimes|date',
            'volu_id' => 'sometimes|exists:volunteers,volu_id',
        ];
    }
}