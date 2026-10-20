<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PemilikBookingController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        // Statistik Booking
        $stats = [
            'total' => Booking::count(),
            'hari_ini' => Booking::whereDate('tanggal_main', $today)->count(),
            'mendatang' => Booking::whereDate('tanggal_main', '>', $today)->count(),
            'selesai' => Booking::where('status', 'selesai')->count(),
            'dibatalkan' => Booking::where('status', 'dibatalkan')->count(),
        ];

        // Query Data Booking beserta Relasi
        $query = Booking::with(['user', 'ps', 'payments']);

        // Fitur Pencarian berdasarkan Kode Booking atau Nama Customer
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_booking', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Fitur Filter Status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Paginasi 5 data per halaman
        $bookings = $query->latest('tanggal_main')->paginate(5)->withQueryString();

        return Inertia::render('Pemilik/Booking/Index', [
            'stats' => $stats,
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status']),
            'flash' => [
                'message' => session('message'),
                'type' => session('type')
            ]
        ]);
    }
}