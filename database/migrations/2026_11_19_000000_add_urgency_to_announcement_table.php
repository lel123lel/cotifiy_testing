<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcement', function (Blueprint $table) {
            $table->boolean('is_urgent')->default(false);
            $table->unsignedTinyInteger('urgent_days')->nullable();
            $table->timestamp('urgent_until')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('announcement', function (Blueprint $table) {
            $table->dropColumn(['is_urgent', 'urgent_days', 'urgent_until']);
        });
    }
};
