<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('volunteers', function (Blueprint $table) {
            $table->foreignId('user_id')->unique()->after('id')->constrained()->cascadeOnDelete();
            $table->string('gender')->after('user_id');
            $table->string('governorate')->after('gender');
            $table->string('education_level')->after('governorate');
            $table->string('photo')->nullable()->after('education_level');
            $table->integer('hours')->default(0)->after('photo');
            $table->text('about')->nullable()->after('hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('volunteers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'gender', 'governorate', 'education_level', 'photo', 'hours', 'about']);
        });
    }
};
