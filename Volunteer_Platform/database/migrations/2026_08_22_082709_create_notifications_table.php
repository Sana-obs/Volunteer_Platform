<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('href')->nullable();
            $table->boolean('seen')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'seen']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
