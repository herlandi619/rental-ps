<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $operator = User::where('role', 'operator')->first();
        $pemilik = User::where('role', 'pemilik')->first();

        ActivityLog::create([
            'user_id' => $operator->id,
            'activity' => 'Open Billing',
            'description' => 'Operator membuka billing PS03.',
            'ip_address' => '127.0.0.1',
        ]);

        ActivityLog::create([
            'user_id' => $operator->id,
            'activity' => 'Pembayaran',
            'description' => 'Operator menerima pembayaran cash.',
            'ip_address' => '127.0.0.1',
        ]);

        ActivityLog::create([
            'user_id' => $operator->id,
            'activity' => 'Billing Selesai',
            'description' => 'Operator mengakhiri billing PS03.',
            'ip_address' => '127.0.0.1',
        ]);

        ActivityLog::create([
            'user_id' => $pemilik->id,
            'activity' => 'Monitoring',
            'description' => 'Pemilik melihat dashboard monitoring.',
            'ip_address' => '127.0.0.1',
        ]);
    }
}