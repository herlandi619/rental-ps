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
        Schema::create('ps', function (Blueprint $table) {
            $table->id();
            $table->string('kode_ps')->unique();
            $table->string('nama_ps');
            $table->enum('jenis', ['PS4', 'PS5']);
            $table->string('tv')->nullable();
            $table->decimal('harga_per_jam', 12, 2);
            $table->enum('status', [
                'tersedia',
                'booking',
                'sedang_bermain',
                'maintenance'
            ])->default('tersedia');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ps');
    }
};
