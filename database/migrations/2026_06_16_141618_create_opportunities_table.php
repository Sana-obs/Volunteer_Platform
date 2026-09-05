<?php
// database/migrations/2026_06_16_141618_create_opportunities_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('governorate_id')->constrained()->restrictOnDelete();

            $table->string('title');
            $table->text('description');

            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->dateTime('register_start_at')->nullable();
            $table->dateTime('register_end_at')->nullable();

            $table->unsignedInteger('min_hours');
            $table->unsignedInteger('max_hours');
            $table->unsignedInteger('total_hours')->default(0);
            $table->unsignedInteger('min_volunteers')->default(1);
            $table->unsignedInteger('max_volunteers')->default(1);

            $table->boolean('registration_closed_manually')->default(false);
            $table->boolean('is_group')->default(false);
            $table->string('registration_closed_reason')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
