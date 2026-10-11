<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Ps;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'transaksi'); // transaksi, booking, billing
        $psList = Ps::all();

        $data = $this->getReportData($request, $type, true);

        return Inertia::render('Operator/Report/Index', [
            'data'    => $data,
            'psList'  => $psList,
            'filters' => $request->only(['type', 'search', 'start_date', 'end_date', 'ps_id', 'metode']),
            'flash'   => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function exportPdf(Request $request)
    {
        $type = $request->get('type', 'transaksi');
        $data = $this->getReportData($request, $type, false);

        $pdf = Pdf::loadView('reports.pdf', [
            'data'    => $data,
            'type'    => $type,
            'filters' => $request->only(['start_date', 'end_date'])
        ]);

        return $pdf->download("Laporan_{$type}_" . date('Ymd') . ".pdf");
    }

    private function getReportData(Request $request, $type, $isPaginated = true)
    {
        $search = $request->search;
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $psId = $request->ps_id;
        $metode = $request->metode;

        if ($type === 'booking') {
            $query = Booking::with(['user', 'ps']);
            
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('kode_booking', 'like', "%{$search}%")
                      ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
                });
            }
            if ($startDate && $endDate) {
                $query->whereBetween('tanggal_main', [$startDate, $endDate]);
            }
            if ($psId) {
                $query->where('ps_id', $psId);
            }
            
            return $isPaginated ? $query->latest()->paginate(5)->withQueryString() : $query->latest()->get();
        }

        if ($type === 'billing') {
            $query = Billing::with(['customer', 'ps']);
            
            if ($search) {
                $query->whereHas('customer', fn($u) => $u->where('name', 'like', "%{$search}%"));
            }
            if ($startDate && $endDate) {
                $query->whereDate('waktu_mulai', '>=', $startDate)
                      ->whereDate('waktu_mulai', '<=', $endDate);
            }
            if ($psId) {
                $query->where('ps_id', $psId);
            }
            
            return $isPaginated ? $query->latest()->paginate(5)->withQueryString() : $query->latest()->get();
        }

        // Default: transaksi (payments)
        $query = Payment::with(['user', 'booking.ps', 'billing.ps']);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('payment_reference', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
        }
        if ($metode) {
            $query->where('metode', $metode);
        }
        if ($psId) {
            $query->where(function($q) use ($psId) {
                $q->whereHas('booking', fn($b) => $b->where('ps_id', $psId))
                  ->orWhereHas('billing', fn($b) => $b->where('ps_id', $psId));
            });
        }
        
        return $isPaginated ? $query->latest()->paginate(5)->withQueryString() : $query->latest()->get();
    }
}