<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'nama_rental',
                'value' => 'Triple A Game Center',
            ],
            [
                'key' => 'alamat',
                'value' => 'Triple A Game Center',
            ],
            [
                'key' => 'no_whatsapp',
                'value' => '081234567890',
            ],
            [
                'key' => 'qris_image',
                'value' => 'settings/qris-triple-a.png',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}