<?php

namespace Database\Seeders;

use App\Models\Billing;
use App\Models\Booking;
use App\Models\Ps;
use App\Models\User;
use Illuminate\Database\Seeder;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('role', 'customer')->first();
        $operator = User::where('role', 'operator')->first();

        $booking = Booking::where('status', 'selesai')->first();

        $ps3 = Ps::where('kode_ps', 'PS03')->first();
        $ps4 = Ps::where('kode_ps', 'PS04')->first();

        // Billing dari Booking
        Billing::create([
            'booking_id' => $booking->id,
            'user_id' => $customer->id,
            'ps_id' => $ps3->id,
            'operator_id' => $operator->id,
            'waktu_mulai' => now()->subDay()->setTime(18, 0),
            'waktu_selesai' => now()->subDay()->setTime(20, 0),
            'durasi' => 120,
            'total_harga' => 36000,
            'status' => 'selesai',
        ]);

        // Billing Walk-in
        Billing::create([
            'booking_id' => null,
            'user_id' => $customer->id,
            'ps_id' => $ps4->id,
            'operator_id' => $operator->id,
            'waktu_mulai' => now()->subHours(3),
            'waktu_selesai' => now()->subHour(),
            'durasi' => 120,
            'total_harga' => 20000,
            'status' => 'selesai',
        ]);
    }
}