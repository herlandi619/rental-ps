<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\ActivityLogSeeder;
use Database\Seeders\BillingSeeder;
use Database\Seeders\BookingSeeder;
use Database\Seeders\NotificationSeeder;
use Database\Seeders\PaymentSeeder;
use Database\Seeders\PsSeeder;
use Database\Seeders\SettingSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Master Data
        |--------------------------------------------------------------------------
        */
        $this->call([
            UserSeeder::class,
            PsSeeder::class,

            /*
            |--------------------------------------------------------------------------
            | Transaksi
            |--------------------------------------------------------------------------
            */
            BookingSeeder::class,
            BillingSeeder::class,
            PaymentSeeder::class,

            /*
            |--------------------------------------------------------------------------
            | Sistem & Log
            |--------------------------------------------------------------------------
            */
            NotificationSeeder::class,
            ActivityLogSeeder::class,
            SettingSeeder::class,
        ]);
    }
}
