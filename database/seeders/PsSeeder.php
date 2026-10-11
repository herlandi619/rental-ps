<?php

namespace Database\Seeders;

use App\Models\Ps;
use Illuminate\Database\Seeder;

class PsSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'kode_ps' => 'PS01',
                'nama_ps' => 'PS 1',
                'jenis' => 'PS5',
                'tv' => '43 Inch',
                'harga_per_jam' => 15000,
                'status' => 'tersedia',
                'keterangan' => 'PlayStation 5 kondisi baik',
            ],
            [
                'kode_ps' => 'PS02',
                'nama_ps' => 'PS 2',
                'jenis' => 'PS5',
                'tv' => '43 Inch',
                'harga_per_jam' => 15000,
                'status' => 'tersedia',
                'keterangan' => 'PlayStation 5 kondisi baik',
            ],
            [
                'kode_ps' => 'PS03',
                'nama_ps' => 'PS 3',
                'jenis' => 'PS5',
                'tv' => '50 Inch',
                'harga_per_jam' => 18000,
                'status' => 'tersedia',
                'keterangan' => 'PlayStation 5 premium',
            ],
            [
                'kode_ps' => 'PS04',
                'nama_ps' => 'PS 4',
                'jenis' => 'PS4',
                'tv' => '32 Inch',
                'harga_per_jam' => 10000,
                'status' => 'tersedia',
                'keterangan' => 'PlayStation 4 kondisi baik',
            ],
            [
                'kode_ps' => 'PS05',
                'nama_ps' => 'PS 5',
                'jenis' => 'PS4',
                'tv' => '32 Inch',
                'harga_per_jam' => 10000,
                'status' => 'maintenance',
                'keterangan' => 'Sedang dalam maintenance',
            ],
            [
                'kode_ps' => 'PS06',
                'nama_ps' => 'PS 6',
                'jenis' => 'PS5',
                'tv' => '43 Inch',
                'harga_per_jam' => 15000,
                'status' => 'tersedia',
                'keterangan' => 'PlayStation 5 kondisi baik',
            ],
        ];

        foreach ($data as $item) {
            Ps::create($item);
        }
    }
}