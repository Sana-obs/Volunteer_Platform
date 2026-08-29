<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'type'        => $this->type->value,
            'title'       => $this->title,
            'description' => $this->description,
            'href'        => $this->href,
            'seen'        => $this->seen,
            'createdAt'   => $this->created_at,
        ];
    }
}
