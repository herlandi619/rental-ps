<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PemilikStatisticController extends Controller
{
    public function index(Request $request)
    {
        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;

        // 1. Jumlah Customer Aktif
        $totalCustomer = User::where('role', 'customer')->count();

        // 2. Total Pendapatan & Perbandingan (Bulan Ini vs Bulan Lalu)
        $pendapatanBulanIni = Payment::where('status', 'berhasil')
            ->whereMonth('paid_at', $bulanIni)
            ->whereYear('paid_at', $tahunIni)
            ->sum('jumlah');

        $pendapatanBulanLalu = Payment::where('status', 'berhasil')
            ->whereMonth('paid_at', Carbon::now()->subMonth()->month)
            ->whereYear('paid_at', Carbon::now()->subMonth()->year)
            ->sum('jumlah');

        // 3. Jumlah Booking Bulan Ini
        $bookingBulanIni = Booking::whereMonth('created_at', $bulanIni)
            ->whereYear('created_at', $tahunIni)
            ->count();

        // 4. PS Paling Sering Digunakan
        $psTerlaris = Billing::select('ps_id', DB::raw('count(*) as total_main'))
            ->with('ps')
            ->groupBy('ps_id')
            ->orderByDesc('total_main')
            ->take(5)
            ->get();

        // 5. Penggunaan PS4 vs PS5
        $penggunaanJenis = Billing::join('ps', 'billings.ps_id', '=', 'ps.id')
            ->select('ps.jenis', DB::raw('count(*) as total'))
            ->groupBy('ps.jenis')
            ->get();

        // 6. Metode Pembayaran Paling Banyak
        $metodePembayaran = Payment::where('status', 'berhasil')
            ->select('metode', DB::raw('count(*) as total'))
            ->groupBy('metode')
            ->get();

        // 7. Tabel Transaksi Sukses untuk Paginasi & Search
        $query = Payment::with(['user', 'booking.ps', 'billing.ps'])->where('status', 'berhasil');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('payment_reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $recentPayments = $query->latest('paid_at')->paginate(5)->withQueryString();

        $stats = [
            'total_customer' => $totalCustomer,
            'pendapatan_bulan_ini' => $pendapatanBulanIni,
            'pendapatan_bulan_lalu' => $pendapatanBulanLalu,
            'booking_bulan_ini' => $bookingBulanIni,
            'ps_terlaris' => $psTerlaris,
            'penggunaan_jenis' => $penggunaanJenis,
            'metode_pembayaran' => $metodePembayaran,
        ];

        return Inertia::render('Pemilik/Statistik/Index', [
            'stats' => $stats,
            'recentPayments' => $recentPayments,
            'filters' => $request->only('search'),
            'flash' => [
                'message' => session('message'),
                'type' => session('type')
            ]
        ]);
    }
}