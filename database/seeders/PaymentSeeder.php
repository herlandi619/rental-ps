<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Booking;
use App\Models\Billing;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('role', 'customer')->first();
        $booking = Booking::where('status', 'selesai')->first();
        $billing = Billing::where('booking_id', $booking->id)->first();

        // Pembayaran DP Xendit
        Payment::create([
            'booking_id' => $booking->id,
            'billing_id' => $billing->id,
            'user_id' => $customer->id,
            'jumlah' => 18000,
            'metode' => 'xendit',
            'jenis' => 'dp',
            'status' => 'berhasil',
            'payment_reference' => 'XENDIT-DEMO-001',
            'bukti_pembayaran' => null,
            'paid_at' => now()->subDay()->subHours(3),
        ]);

        // Pelunasan Cash
        Payment::create([
            'booking_id' => $booking->id,
            'billing_id' => $billing->id,
            'user_id' => $customer->id,
            'jumlah' => 18000,
            'metode' => 'cash',
            'jenis' => 'pelunasan',
            'status' => 'berhasil',
            'payment_reference' => null,
            'bukti_pembayaran' => null,
            'paid_at' => now()->subDay(),
        ]);

        // Contoh QRIS Manual untuk Walk-in
        $walkInBilling = Billing::whereNull('booking_id')->first();
        Payment::create([
            'booking_id' => null,
            'billing_id' => $walkInBilling->id,
            'user_id' => $customer->id,
            'jumlah' => 20000,
            'metode' => 'qris_manual',
            'jenis' => 'pelunasan',
            'status' => 'berhasil',
            'payment_reference' => null,
            'bukti_pembayaran' => 'payments/demo-qris.jpg',
            'paid_at' => now()->subHour(),
        ]);
    }
}