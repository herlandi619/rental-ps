<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http; // Tambahkan ini

class CustomerPaymentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Mengambil riwayat pembayaran dengan relasi booking dan billing
        $payments = Payment::with(['booking', 'billing'])
            ->where('user_id', auth()->id())
            ->when($search, function ($query, $search) {
                $query->where('payment_reference', 'like', "%{$search}%")
                      ->orWhereHas('booking', function ($q) use ($search) {
                          $q->where('kode_booking', 'like', "%{$search}%");
                      });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->withQueryString();

        // Mengambil daftar booking yang masih menunggu pembayaran DP
        $pendingBookings = Booking::with('ps')
            ->where('user_id', auth()->id())
            ->where('status', 'menunggu_pembayaran')
            ->get();

        return Inertia::render('Customer/Payment/Index', [
            'payments' => $payments,
            'pendingBookings' => $pendingBookings,
            'filters' => $request->only(['search'])
        ]);
    }

    public function pay(Request $request, Booking $booking)
    {
        // Validasi kepemilikan booking
        if ($booking->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $paymentReference = 'XND-' . strtoupper(Str::random(10));
        
        // Pembuatan record payment status pending
        Payment::create([
            'booking_id' => $booking->id,
            'user_id' => auth()->id(),
            'jumlah' => $booking->dp,
            'metode' => 'xendit',
            'jenis' => 'dp',
            'status' => 'pending',
            'payment_reference' => $paymentReference,
        ]);

        // Request ke API Xendit untuk membuat Invoice
        $response = Http::withBasicAuth(env('XENDIT_SECRET_KEY'), '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => $paymentReference,
                'amount' => (int) $booking->dp,
                'payer_email' => auth()->user()->email,
                'description' => 'Pembayaran DP Booking ' . $booking->kode_booking,
                'customer' => [
                    'given_names' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'mobile_number' => auth()->user()->no_hp ?? '',
                ],
                // URL ini akan mengarahkan user kembali ke web setelah berhasil bayar di Xendit
                'success_redirect_url' => route('customer.payments.index'),
                'failure_redirect_url' => route('customer.payments.index'),
            ]);

        // Jika request API sukses
        if ($response->successful()) {
            $invoiceUrl = $response->json('invoice_url');
            return Inertia::location($invoiceUrl);
        }

        // Lihat log detail error dari Xendit di terminal / storage/logs/laravel.log
        \Illuminate\Support\Facades\Log::error('Xendit Error: ' . $response->body());
        
        // Ambil pesan error spesifik dari Xendit jika ada
        $errorMessage = $response->json('message') ?? 'Gagal terhubung ke gateway pembayaran Xendit.';

        return back()->with('error', $errorMessage);
    }
}