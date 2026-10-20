<?php

use App\Http\Controllers\Customer\CustomerBookingController;
use App\Http\Controllers\Customer\CustomerDashboardController;
use App\Http\Controllers\Customer\CustomerHistoryController;
use App\Http\Controllers\Customer\CustomerNotificationController;
use App\Http\Controllers\Customer\CustomerOrderController;
use App\Http\Controllers\Customer\CustomerPaymentController;
use App\Http\Controllers\Customer\CustomerProfileController;
use App\Http\Controllers\Customer\CustomerPsController;
use App\Http\Controllers\Operator\OperatorActivityLogController;
use App\Http\Controllers\Operator\OperatorBillingController;
use App\Http\Controllers\Operator\OperatorBookingController;
use App\Http\Controllers\Operator\OperatorDashboardController;
use App\Http\Controllers\Operator\OperatorNotificationController;
use App\Http\Controllers\Operator\OperatorProfileController;
use App\Http\Controllers\Operator\OperatorPsController;
use App\Http\Controllers\Operator\OperatorReportController;
use App\Http\Controllers\Operator\OperatorTransactionController;
use App\Http\Controllers\Pemilik\PemilikBookingController;
use App\Http\Controllers\Pemilik\PemilikDashboardController;
use App\Http\Controllers\Pemilik\PemilikMonitoringController;
use App\Http\Controllers\Pemilik\PemilikNotificationController;
use App\Http\Controllers\Pemilik\PemilikProfileController;
use App\Http\Controllers\Pemilik\PemilikReportController;
use App\Http\Controllers\Pemilik\PemilikStatisticController;
use App\Http\Controllers\Pemilik\PemilikTransactionController;
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

    // 7.Menu Notifikasi
    Route::get('/notifications', [OperatorNotificationController::class, 'index'])->name('notifications.index');
    Route::put('/notifications/{id}/read', [OperatorNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::put('/notifications/read-all', [OperatorNotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // 8.Menu Activity Log
    Route::get('/activity-logs', [OperatorActivityLogController::class, 'index'])->name('activity-logs.index');

    // 9.Menu Profil
    Route::get('/profile', [OperatorProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile/update', [OperatorProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [OperatorProfileController::class, 'updatePassword'])->name('profile.password');
});

// PEMILIK
Route::middleware(['auth'])->prefix('pemilik')->name('pemilik.')->group(function () {
    
    // 1.DASHBAORD
    // Menampilkan Dashboard, Statistik, dan Tabel Monitoring dalam 1 Halaman
    Route::get('/dashboard', [PemilikDashboardController::class, 'index'])->name('dashboard');

    // 2.Rute Monitoring Pemilik
    Route::get('/monitoring', [PemilikMonitoringController::class, 'index'])->name('monitoring.index');

    // 3.Rute Monitoring Booking Pemilik
    Route::get('/bookings', [PemilikBookingController::class, 'index'])->name('bookings.index');

    // 4.Rute Transaksi Pemilik
    Route::get('/transactions', [PemilikTransactionController::class, 'index'])->name('transactions.index');

    // 5.Rute Laporan Pemilik
    Route::get('/reports', [PemilikReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/pdf', [PemilikReportController::class, 'exportPdf'])->name('reports.pdf');

    // 6.Rute Statistik Pemilik
    Route::get('/statistics', [PemilikStatisticController::class, 'index'])->name('statistics.index');

    // 7.Menu Notifikasi Pemilik
    Route::get('/notifications', [PemilikNotificationController::class, 'index'])->name('notifications.index');
    Route::put('/notifications/{id}/read', [PemilikNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::put('/notifications/read-all', [PemilikNotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // 8.Menu Profil
    Route::get('/profile', [PemilikProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile/update', [PemilikProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [PemilikProfileController::class, 'updatePassword'])->name('profile.password');
    
});

// CUSTOMER
Route::middleware(['auth'])->prefix('customer')->name('customer.')->group(function () {
    
    // 1.DASHBOARd
    // Halaman utama Dashboard Customer (digabung dalam 1 controller)
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
    
    // Rute aksi untuk pembuatan booking baru melalui form modal
    Route::post('/booking/store', [CustomerDashboardController::class, 'storeBooking'])->name('booking.store');

    // 2.Rute Daftar PS untuk Customer
    // Route::get('/ps', [CustomerPsController::class, 'index'])->name('ps.index');

    // 3.Rute Menu Booking Saya
    Route::get('/bookings', [CustomerBookingController::class, 'index'])->name('bookings.index');
    Route::put('/bookings/{id}/cancel', [CustomerBookingController::class, 'cancel'])->name('bookings.cancel');

    // PAYMENT
    // 7.Menu Pemesanan / Booking PS
    Route::get('/pesan-ps', [CustomerOrderController::class, 'index'])->name('pesan-ps.index');
    Route::post('/pesan-ps', [CustomerOrderController::class, 'store'])->name('pesan-ps.store');

    // 8.Menu Pembayaran
    Route::get('/payments', [CustomerPaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments/booking/{booking}/pay', [CustomerPaymentController::class, 'pay'])->name('payments.pay');


    // 4.Rute Riwayat Bermain
    Route::get('/riwayat-bermain', [CustomerHistoryController::class, 'index'])->name('history.index');

    // 5.Menu Notifikasi Customer
    Route::get('/notifications', [CustomerNotificationController::class, 'index'])->name('notifications.index');
    Route::put('/notifications/{id}/read', [CustomerNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::put('/notifications/read-all', [CustomerNotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // 6.Menu Profil
    Route::get('/profile', [CustomerProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile/update', [CustomerProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [CustomerProfileController::class, 'updatePassword'])->name('profile.password');
    
});



require __DIR__.'/auth.php';
