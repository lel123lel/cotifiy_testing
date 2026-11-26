<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcement', function (Blueprint $table) {
            $table->boolean('gallery_enabled')->default(false);
            $table->json('gallery_images')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('announcement', function (Blueprint $table) {
            $table->dropColumn(['gallery_enabled', 'gallery_images']);
        });
    }
};
