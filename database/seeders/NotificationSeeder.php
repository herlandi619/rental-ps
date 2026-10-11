<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('role', 'customer')->first();
        $operator = User::where('role', 'operator')->first();
        $pemilik = User::where('role', 'pemilik')->first();

        Notification::create([
            'user_id' => $customer->id,
            'title' => 'Booking Berhasil',
            'message' => 'Booking Anda berhasil dibuat dan menunggu pembayaran.',
            'type' => 'booking',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $customer->id,
            'title' => 'Pembayaran Berhasil',
            'message' => 'Pembayaran DP Anda telah berhasil dikonfirmasi.',
            'type' => 'payment',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $operator->id,
            'title' => 'Booking Baru',
            'message' => 'Terdapat booking baru yang perlu diperiksa.',
            'type' => 'booking',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $pemilik->id,
            'title' => 'Laporan Harian',
            'message' => 'Data transaksi rental hari ini telah tersedia.',
            'type' => 'system',
            'is_read' => false,
        ]);
    }
}