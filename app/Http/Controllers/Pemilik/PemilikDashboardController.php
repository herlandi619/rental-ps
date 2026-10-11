<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Ps;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PemilikDashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        // 1. Statistik & Informasi Bisnis Pemilik
        $stats = [
            'pendapatan_hari_ini'   => Payment::whereDate('paid_at', $today)->where('status', 'berhasil')->sum('jumlah'),
            'transaksi_hari_ini'    => Payment::whereDate('paid_at', $today)->where('status', 'berhasil')->count(),
            'booking_hari_ini'      => Booking::whereDate('tanggal_main', $today)->count(),
            'jumlah_customer'       => User::where('role', 'customer')->count(),
            'ps_digunakan'          => Ps::where('status', 'sedang_bermain')->count(),
            'ps_tersedia'           => Ps::where('status', 'tersedia')->count(),
            'ps_maintenance'        => Ps::where('status', 'maintenance')->count(),
            'billing_berjalan'      => Billing::where('status', 'berjalan')->count(),
        ];

        // 2. Query Tabel Transaksi/Billing untuk Monitoring (Dilengkapi Search & Paginasi 5)
        $query = Payment::with(['booking.ps', 'billing.ps', 'user']);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('payment_reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function($sub) use ($search) {
                      $sub->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('Pemilik/Dashboard/Index', [
            'stats'   => $stats,
            'payments'=> $payments,
            'filters' => $request->only('search'),
            'flash'   => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }
}