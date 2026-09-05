<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enum\Status;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunity_volunteer', function (Blueprint $table) {
            $table->id();

            $table->foreignId('opportunity_id')
                ->constrained('opportunities')
                ->cascadeOnDelete();

            $table->foreignId('volunteer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('status')->default(Status::Pending->value);

            $table->unsignedInteger('committed_hours');
            $table->unsignedInteger('hours_logged')->nullable();

            $table->string('rejection_reason')->nullable();
            $table->date('withdrawn_date')->nullable();

            $table->timestamp('participated_at')->useCurrent();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opportunity_volunteer');
    }
};
