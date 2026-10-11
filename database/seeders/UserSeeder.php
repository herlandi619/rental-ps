<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Customer
        User::create([
            'name' => 'Customer Demo',
            'email' => 'customer@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'no_hp' => '081234567890',
            'status' => 'aktif',
        ]);

        // Operator
        User::create([
            'name' => 'Operator Triple A',
            'email' => 'operator@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'operator',
            'no_hp' => '081234567891',
            'status' => 'aktif',
        ]);

        // Pemilik
        User::create([
            'name' => 'Pemilik Triple A',
            'email' => 'pemilik@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'pemilik',
            'no_hp' => '081234567892',
            'status' => 'aktif',
        ]);
    }
}