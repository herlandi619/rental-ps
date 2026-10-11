<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
 
class OperatorTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['user', 'booking.ps', 'billing.ps'])
                        ->whereDate('created_at', Carbon::today());

        // Filter Pencarian (Referensi atau Nama Customer)
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('payment_reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        // Filter Tanggal
        if ($request->has('tanggal') && $request->tanggal != '') {
            $query->whereDate('created_at', $request->tanggal);
        }

        // Filter Metode
        if ($request->has('metode') && $request->metode != '') {
            $query->where('metode', $request->metode);
        }

        $payments = $query->latest()->paginate(5)->withQueryString();

       // Total Pendapatan (Hanya yang berhasil)
        $totalPendapatan = Payment::where('status', 'berhasil')->sum('jumlah');

        // Data opsi form Tambah Pembayaran (Menyembunyikan yang sudah lunas/pending pelunasan)
        $bookings = Booking::with(['user', 'ps'])
            ->whereIn('status', ['menunggu_pembayaran', 'dikonfirmasi', 'selesai'])
            ->whereDoesntHave('payments', function ($query) {
                $query->where('jenis', 'pelunasan')
                      ->whereIn('status', ['berhasil', 'pending']);
            })
            ->get();

        $billings = Billing::with(['customer', 'ps'])
            ->whereIn('status', ['berjalan', 'selesai'])
            ->whereDoesntHave('payments', function ($query) {
                $query->where('jenis', 'pelunasan')
                      ->whereIn('status', ['berhasil', 'pending']);
            })
            ->get();

        return Inertia::render('Operator/Transaction/Index', [
            'payments'        => $payments,
            'totalPendapatan' => (float) $totalPendapatan,
            'bookings'        => $bookings,
            'billings'        => $billings,
            'filters'         => $request->only(['search', 'tanggal', 'metode']),
            'flash'           => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'sumber'           => 'required|in:booking,billing',
            'sumber_id'        => 'required|integer',
            'jumlah'           => 'required|numeric|min:1',
            'metode'           => 'required|in:cash,qris_manual',
            'jenis'            => 'required|in:dp,pelunasan',
            'bukti_pembayaran' => 'nullable|file|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $status = $request->metode === 'cash' ? 'berhasil' : 'pending';
        $buktiPath = null;

        if ($request->hasFile('bukti_pembayaran')) {
            $buktiPath = $request->file('bukti_pembayaran')->store('payments', 'public');
        }

        // Cari user_id dari Booking atau Billing
        $userId = null;
        if ($request->sumber === 'booking') {
            $sumberData = Booking::findOrFail($request->sumber_id);
            $userId = $sumberData->user_id;
        } else {
            $sumberData = Billing::findOrFail($request->sumber_id);
            $userId = $sumberData->user_id; // Bisa null jika walk-in
        }

        Payment::create([
            'booking_id'        => $request->sumber === 'booking' ? $request->sumber_id : null,
            'billing_id'        => $request->sumber === 'billing' ? $request->sumber_id : null,
            'user_id'           => $userId,
            'jumlah'            => $request->jumlah,
            'metode'            => $request->metode,
            'jenis'             => $request->jenis,
            'status'            => $status,
            'payment_reference' => strtoupper($request->metode) . '-' . strtoupper(Str::random(8)),
            'bukti_pembayaran'  => $buktiPath,
            'paid_at'           => $status === 'berhasil' ? Carbon::now() : null,
        ]);

        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Pencatatan Pembayaran',
            'description' => "Operator mencatat pembayaran {$request->metode} sebesar Rp" . number_format($request->jumlah, 0, ',', '.'),
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Pembayaran berhasil dicatat.',
            'type'    => 'success'
        ]);
    }

    public function verify(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        
        $payment->update([
            'status'  => 'berhasil',
            'paid_at' => Carbon::now()
        ]);

        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Verifikasi Pembayaran',
            'description' => "Operator memverifikasi pembayaran QRIS dengan ref {$payment->payment_reference}.",
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Pembayaran QRIS berhasil diverifikasi.',
            'type'    => 'success'
        ]);
    }
}