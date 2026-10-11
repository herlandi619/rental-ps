<?php

use App\Http\Controllers\Customer\CustomerDashboardController;
use App\Http\Controllers\Operator\OperatorBillingController;
use App\Http\Controllers\Operator\OperatorBookingController;
use App\Http\Controllers\Operator\OperatorDashboardController;
use App\Http\Controllers\Operator\OperatorPsController;
use App\Http\Controllers\Operator\OperatorReportController;
use App\Http\Controllers\Operator\OperatorTransactionController;
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
    
    
    //2. Rute CRUD Data PS (Manual)
    Route::get('/ps', [OperatorPsController::class, 'index'])->name('ps.index');
    Route::post('/ps', [OperatorPsController::class, 'store'])->name('ps.store');
    Route::put('/ps/{id}', [OperatorPsController::class, 'update'])->name('ps.update');
    Route::delete('/ps/{id}', [OperatorPsController::class, 'destroy'])->name('ps.destroy');

    // 3.Manajemen Booking
    Route::get('/bookings', [OperatorBookingController::class, 'index'])->name('bookings.index');
    Route::put('/bookings/{id}/konfirmasi', [OperatorBookingController::class, 'konfirmasi'])->name('bookings.konfirmasi');
    Route::put('/bookings/{id}/batal', [OperatorBookingController::class, 'batal'])->name('bookings.batal');
    Route::post('/bookings/{id}/mulai-billing', [OperatorBookingController::class, 'mulaiBilling'])->name('bookings.mulai-billing');

    // 4.Manajemen Billing & Timer Bermain
    Route::get('/billings', [OperatorBillingController::class, 'index'])->name('billings.index');
    Route::post('/billings', [OperatorBillingController::class, 'store'])->name('billings.store');
    Route::put('/billings/{id}/extend', [OperatorBillingController::class, 'extend'])->name('billings.extend');
    Route::put('/billings/{id}/finish', [OperatorBillingController::class, 'finish'])->name('billings.finish');

    // 5.Manajemen Transaksi & Pembayaran
    Route::get('/transactions', [OperatorTransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions', [OperatorTransactionController::class, 'store'])->name('transactions.store');
    Route::put('/transactions/{id}/verify', [OperatorTransactionController::class, 'verify'])->name('transactions.verify');

    // 6.Menu Laporan
    Route::get('/reports', [OperatorReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/pdf', [OperatorReportController::class, 'exportPdf'])->name('reports.pdf');
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
