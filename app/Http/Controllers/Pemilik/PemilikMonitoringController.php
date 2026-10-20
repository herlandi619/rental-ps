<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Ps;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PemilikMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        // Statistik Kondisi PS dan Operasional
        $stats = [
            'total_ps' => Ps::count(),
            'ps_tersedia' => Ps::where('status', 'tersedia')->count(),
            'ps_bermain' => Ps::where('status', 'sedang_bermain')->count(),
            'ps_maintenance' => Ps::where('status', 'maintenance')->count(),
            'booking_aktif' => Booking::whereIn('status', ['menunggu_pembayaran', 'dikonfirmasi'])->count(),
            'billing_aktif' => Billing::where('status', 'berjalan')->count(),
        ];

        // Query Data PS beserta Relasi Billing/Booking yang Sedang Berjalan
        $query = Ps::with([
            'billings' => function ($q) {
                $q->where('status', 'berjalan')->with('customer', 'operator');
            },
            'bookings' => function ($q) use ($today) {
                $q->whereIn('status', ['dikonfirmasi'])
                  ->whereDate('tanggal_main', $today)
                  ->with('user');
            }
        ]);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_ps', 'like', "%{$search}%")
                  ->orWhere('kode_ps', 'like', "%{$search}%");
            });
        }

        // Paginasi 5 data per halaman
        $psList = $query->orderBy('kode_ps', 'asc')->paginate(5)->withQueryString();

        return Inertia::render('Pemilik/Monitoring/Index', [
            'stats' => $stats,
            'psList' => $psList,
            'filters' => $request->only('search'),
            'flash' => [
                'message' => session('message'),
                'type' => session('type')
            ]
        ]);
    }
}