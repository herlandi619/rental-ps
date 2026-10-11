<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Ps;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorDashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $now = Carbon::now();

        // 1. Data Statistik (Kebutuhan/Fungsi Operator)
        $stats = [
            'booking_hari_ini'       => Booking::whereDate('tanggal_main', $today)->count(),
            'billing_berjalan'       => Billing::where('status', 'berjalan')->count(),
            'ps_tersedia'            => Ps::where('status', 'tersedia')->count(),
            'ps_bermain'             => Ps::where('status', 'sedang_bermain')->count(),
            'ps_maintenance'         => Ps::where('status', 'maintenance')->count(),
            'pembayaran_hari_ini'    => Payment::whereDate('paid_at', $today)->where('status', 'berhasil')->sum('jumlah'),
            'booking_butuh_tindakan' => Booking::where('status', 'menunggu_pembayaran')->count(),
            'billing_hampir_selesai' => Billing::where('status', 'berjalan')
                                               ->where('waktu_selesai', '<=', $now->copy()->addMinutes(15))
                                               ->count(),
        ];

        // 2. Data Tabel Billing Berjalan (Search & Paginate 5)
        $query = Billing::with(['ps', 'customer'])->where('status', 'berjalan');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->whereHas('customer', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhereHas('ps', function($q) use ($search) {
                $q->where('nama_ps', 'like', "%{$search}%");
            });
        }

        $billings = $query->latest()->paginate(5)->withQueryString();

        // 3. Aktivitas Operasional Terbaru (5 Terakhir)
        $activities = ActivityLog::with('user')->latest()->take(5)->get();

        return Inertia::render('Operator/Dashboard/Index', [
            'stats'      => $stats,
            'billings'   => $billings,
            'activities' => $activities,
            'filters'    => $request->only('search'),
            'flash'      => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function selesaikanBilling(Request $request, $id)
    {
        $billing = Billing::findOrFail($id);
        
        // Update status billing menjadi selesai
        $billing->update(['status' => 'selesai']);

        // Update status PS menjadi tersedia kembali
        $ps = Ps::findOrFail($billing->ps_id);
        $ps->update(['status' => 'tersedia']);

        // Mencatat Activity Log
        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Billing Selesai',
            'description' => 'Operator mengakhiri billing ' . $ps->nama_ps,
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Billing PS berhasil diselesaikan.',
            'type'    => 'success'
        ]);
    }
}