<?php
// database/migrations/2026_06_16_141617_create_volunteers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteers', function (Blueprint $table) {
            $table->id();
            $table->string('gender')->nullable();
            $table->foreignId('governorate_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('education_level')->nullable();
            $table->date('birth_date')->nullable();
            $table->text('about')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteers');
    }
};
