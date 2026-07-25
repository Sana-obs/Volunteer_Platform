<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteer_achievement', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('volunteer_id');
            $table->unsignedBigInteger('achievement_id');
            $table->boolean('unlocked')->default(false);
            $table->date('earned_date')->nullable();
            $table->timestamps();

            $table->unique(['volunteer_id', 'achievement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_achievement');
    }
};