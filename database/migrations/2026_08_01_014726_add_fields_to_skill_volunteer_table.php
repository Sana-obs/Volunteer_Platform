<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('skill_volunteer', function (Blueprint $table) {
            $table->foreignId('volunteer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('skill_volunteer', function (Blueprint $table) {
            $table->dropForeign(['volunteer_id']);
            $table->dropForeign(['skill_id']);
            $table->dropColumn(['volunteer_id', 'skill_id']);
        });
    }
};