<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\User;
use App\Models\Ps;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('role', 'customer')->first();

        $ps1 = Ps::where('kode_ps', 'PS01')->first();
        $ps2 = Ps::where('kode_ps', 'PS02')->first();
        $ps3 = Ps::where('kode_ps', 'PS03')->first();

        Booking::create([
            'user_id' => $customer->id,
            'ps_id' => $ps1->id,
            'kode_booking' => 'BOOK-' . strtoupper(Str::random(8)),
            'tanggal_main' => now()->addDay()->toDateString(),
            'jam_mulai' => '19:00',
            'jam_selesai' => '21:00',
            'durasi' => 120,
            'total_harga' => 30000,
            'dp' => 15000,
            'status' => 'dikonfirmasi',
            'catatan' => 'Booking 2 jam PS5',
        ]);

        Booking::create([
            'user_id' => $customer->id,
            'ps_id' => $ps2->id,
            'kode_booking' => 'BOOK-' . strtoupper(Str::random(8)),
            'tanggal_main' => now()->addDays(2)->toDateString(),
            'jam_mulai' => '20:00',
            'jam_selesai' => '22:00',
            'durasi' => 120,
            'total_harga' => 30000,
            'dp' => 15000,
            'status' => 'menunggu_pembayaran',
            'catatan' => 'Menunggu pembayaran DP',
        ]);

        Booking::create([
            'user_id' => $customer->id,
            'ps_id' => $ps3->id,
            'kode_booking' => 'BOOK-' . strtoupper(Str::random(8)),
            'tanggal_main' => now()->subDay()->toDateString(),
            'jam_mulai' => '18:00',
            'jam_selesai' => '20:00',
            'durasi' => 120,
            'total_harga' => 36000,
            'dp' => 18000,
            'status' => 'selesai',
            'catatan' => 'Booking selesai',
        ]);
    }
}