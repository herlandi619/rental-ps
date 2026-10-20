<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PemilikTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['user', 'booking.ps', 'billing.ps']);

        // Filter Berdasarkan Periode (Tanggal)
        if ($request->has('start_date') && $request->start_date != '') {
            $query->whereDate('paid_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date != '') {
            $query->whereDate('paid_at', '<=', $request->end_date);
        }

        // Fitur Pencarian (Referensi Pembayaran atau Nama Customer)
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payment_reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Paginasi 5 data per halaman
        $transactions = $query->latest('paid_at')->paginate(5)->withQueryString();

        // Query terpisah untuk statistik (hanya menghitung transaksi berhasil sesuai periode filter jika ada)
        $statQuery = Payment::where('status', 'berhasil');
        if ($request->has('start_date') && $request->start_date != '') {
            $statQuery->whereDate('paid_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date != '') {
            $statQuery->whereDate('paid_at', '<=', $request->end_date);
        }

        // Kloning query dasar statistik untuk agregasi data
        $stats = [
            'total_pendapatan' => (clone $statQuery)->sum('jumlah'),
            'total_dp'         => (clone $statQuery)->where('jenis', 'dp')->sum('jumlah'),
            'total_pelunasan'  => (clone $statQuery)->where('jenis', 'pelunasan')->sum('jumlah'),
            'total_cash'       => (clone $statQuery)->where('metode', 'cash')->sum('jumlah'),
            'total_xendit'     => (clone $statQuery)->where('metode', 'xendit')->sum('jumlah'),
            'total_qris'       => (clone $statQuery)->where('metode', 'qris_manual')->sum('jumlah'),
        ];

        return Inertia::render('Pemilik/Transaksi/Index', [
            'stats' => $stats,
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'start_date', 'end_date']),
            'flash' => [
                'message' => session('message'),
                'type' => session('type')
            ]
        ]);
    }
}