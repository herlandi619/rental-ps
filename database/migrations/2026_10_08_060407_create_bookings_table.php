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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('ps_id')
                ->constrained('ps')
                ->restrictOnDelete();
            $table->string('kode_booking')->unique();
            $table->date('tanggal_main');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->unsignedInteger('durasi');
            $table->decimal('total_harga', 12, 2);
            $table->decimal('dp', 12, 2)->default(0);
            $table->enum('status', [
                'menunggu_pembayaran',
                'dikonfirmasi',
                'selesai',
                'dibatalkan'
            ])->default('menunggu_pembayaran');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
