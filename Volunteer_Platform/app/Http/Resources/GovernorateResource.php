<?php
// app/Http/Resources/GovernorateResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GovernorateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'nameEn'   => $this->name_en,
            'nameAr'   => $this->name_ar,
            'slug'     => $this->slug,
            'isActive' => $this->is_active,
        ];
    }
}
