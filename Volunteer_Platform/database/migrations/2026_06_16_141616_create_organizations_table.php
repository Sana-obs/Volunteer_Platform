<?php
// database/migrations/2026_06_16_141616_create_organizations_table.php

use App\Enum\Status;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enum\OrganizationStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('governorate_id')
                ->nullable()
                ->constrained()
                ->restrictOnDelete();
            $table->string('description')->nullable();
            $table->string('website')->nullable();
            $table->string('contact_person');
            $table->enum('status', OrganizationStatus::toArray())->default(OrganizationStatus::Pending->value);
            $table->dateTime('reviewed_at')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
