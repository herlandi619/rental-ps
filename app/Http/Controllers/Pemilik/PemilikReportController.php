<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Ps;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PemilikReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type', 'transaksi');
        $data = null;
        $stats = ['total_nominal' => 0, 'total_data' => 0];

        // Ambil data unit PS untuk filter dropdown
        $psList = Ps::select('id', 'nama_ps', 'jenis')->get();

        if ($type === 'transaksi') {
            $query = Payment::with(['user', 'booking.ps', 'billing.ps'])->where('status', 'berhasil');

            if ($request->filled('start_date')) $query->whereDate('paid_at', '>=', $request->start_date);
            if ($request->filled('end_date')) $query->whereDate('paid_at', '<=', $request->end_date);
            if ($request->filled('metode')) $query->where('metode', $request->metode);
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('payment_reference', 'like', "%{$search}%")
                      ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
                });
            }

            $stats['total_nominal'] = (clone $query)->sum('jumlah');
            $stats['total_data'] = (clone $query)->count();
            $data = $query->latest('paid_at')->paginate(5)->withQueryString();

        } elseif ($type === 'booking') {
            $query = Booking::with(['user', 'ps']);

            if ($request->filled('start_date')) $query->whereDate('tanggal_main', '>=', $request->start_date);
            if ($request->filled('end_date')) $query->whereDate('tanggal_main', '<=', $request->end_date);
            if ($request->filled('ps_id')) $query->where('ps_id', $request->ps_id);
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('kode_booking', 'like', "%{$search}%")
                      ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
                });
            }

            $stats['total_nominal'] = (clone $query)->where('status', 'selesai')->sum('total_harga');
            $stats['total_data'] = (clone $query)->count();
            $data = $query->latest('tanggal_main')->paginate(5)->withQueryString();

        } elseif ($type === 'billing') {
            $query = Billing::with(['customer', 'ps']);

            if ($request->filled('start_date')) $query->whereDate('waktu_mulai', '>=', $request->start_date);
            if ($request->filled('end_date')) $query->whereDate('waktu_mulai', '<=', $request->end_date);
            if ($request->filled('ps_id')) $query->where('ps_id', $request->ps_id);
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('customer', fn($u) => $u->where('name', 'like', "%{$search}%"));
            }

            $stats['total_nominal'] = (clone $query)->where('status', 'selesai')->sum('total_harga');
            $stats['total_data'] = (clone $query)->count();
            $data = $query->latest('waktu_mulai')->paginate(5)->withQueryString();
        }

        return Inertia::render('Pemilik/Laporan/Index', [
            'type' => $type,
            'dataLaporan' => $data,
            'stats' => $stats,
            'psList' => $psList,
            'filters' => $request->only(['type', 'start_date', 'end_date', 'metode', 'ps_id', 'search']),
        ]);
    }

    public function exportPdf(Request $request)
    {
        $type = $request->input('type', 'transaksi');
        $data = collect();

        if ($type === 'transaksi') {
            $query = Payment::with(['user', 'booking.ps', 'billing.ps'])->where('status', 'berhasil');
            if ($request->filled('start_date')) $query->whereDate('paid_at', '>=', $request->start_date);
            if ($request->filled('end_date')) $query->whereDate('paid_at', '<=', $request->end_date);
            if ($request->filled('metode')) $query->where('metode', $request->metode);
            $data = $query->latest('paid_at')->get();
        } elseif ($type === 'booking') {
            $query = Booking::with(['user', 'ps']);
            if ($request->filled('start_date')) $query->whereDate('tanggal_main', '>=', $request->start_date);
            if ($request->filled('end_date')) $query->whereDate('tanggal_main', '<=', $request->end_date);
            if ($request->filled('ps_id')) $query->where('ps_id', $request->ps_id);
            $data = $query->latest('tanggal_main')->get();
        } elseif ($type === 'billing') {
            $query = Billing::with(['customer', 'ps']);
            if ($request->filled('start_date')) $query->whereDate('waktu_mulai', '>=', $request->start_date);
            if ($request->filled('end_date')) $query->whereDate('waktu_mulai', '<=', $request->end_date);
            if ($request->filled('ps_id')) $query->where('ps_id', $request->ps_id);
            $data = $query->latest('waktu_mulai')->get();
        }

        $pdf = Pdf::loadView('reports.pdf', [
            'type' => $type,
            'data' => $data,
            'filters' => $request->all()
        ]);

        return $pdf->stream('Laporan_'.$type.'_'.date('Ymd').'.pdf');
    }
}