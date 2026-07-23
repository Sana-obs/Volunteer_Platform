<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Organization extends Model implements HasMedia
{
    //
    use InteractsWithMedia;
    protected $fillable = [
        'name',
        'city',
        'description',
        'website',
        'user_id',
    ];
    public function user()
{
    return $this->belongsTo(User::class);
}
    public function opportunity(){
        return $this->hasMany(Opportunity::class);
    }
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile_image')
            ->singleFile() // يمسح القديمة تلقائياً وياخد الجديدة بدلها
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

        $this->addMediaCollection('verification_documents')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'application/pdf']);
    }
}
