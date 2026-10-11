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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();
            $table->foreignId('billing_id')
                ->nullable()
                ->constrained('billings')
                ->nullOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->decimal('jumlah', 12, 2);
            $table->enum('metode', [
                'xendit',
                'cash',
                'qris_manual'
            ]);
            $table->enum('jenis', [
                'dp',
                'pelunasan'
            ]);
            $table->enum('status', [
                'pending',
                'berhasil',
                'gagal'
            ])->default('pending');
            $table->string('payment_reference')->nullable();
            $table->string('bukti_pembayaran')->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
