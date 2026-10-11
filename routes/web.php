<?php

use App\Http\Controllers\Customer\CustomerDashboardController;
use App\Http\Controllers\Operator\OperatorDashboardController;
use App\Http\Controllers\Pemilik\PemilikDashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// OPERATOR
Route::middleware(['auth'])->prefix('operator')->name('operator.')->group(function () {
    
    // 1.Menampilkan Dashboard (Statistik, Tabel Billing, & Activity Logs)
    Route::get('/dashboard', [OperatorDashboardController::class, 'index'])->name('dashboard');
    
    // Proses Selesaikan Billing (Aksi CRUD di Modal)
    Route::put('/dashboard/billing/{id}/selesai', [OperatorDashboardController::class, 'selesaikanBilling'])->name('dashboard.selesaikan-billing');
    
    
});

// PEMILIK
Route::middleware(['auth'])->prefix('pemilik')->name('pemilik.')->group(function () {
    
    // DASHBAORD
    // Menampilkan Dashboard, Statistik, dan Tabel Monitoring dalam 1 Halaman
    Route::get('/dashboard', [PemilikDashboardController::class, 'index'])->name('dashboard');
    
});

// CUSTOMER
Route::middleware(['auth'])->prefix('customer')->name('customer.')->group(function () {
    
    // DASHBOARd
    // Halaman utama Dashboard Customer (digabung dalam 1 controller)
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
    
    // Rute aksi untuk pembuatan booking baru melalui form modal
    Route::post('/booking/store', [CustomerDashboardController::class, 'storeBooking'])->name('booking.store');
    
});


require __DIR__.'/auth.php';
