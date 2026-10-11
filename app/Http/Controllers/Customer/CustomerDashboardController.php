<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Ps;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CustomerDashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();

        // 1. Ringkasan Akun & Status Terkini
        $activeBilling = Billing::with(['ps'])->where('user_id', $userId)->where('status', 'berjalan')->first();
        $availablePs = Ps::where('status', 'tersedia')->get();
        $notifications = Notification::where('user_id', $userId)->where('is_read', false)->latest()->take(5)->get();

        // 2. Query Tabel Booking Saya (Dilengkapi Search & Paginasi 5)
        $query = Booking::with(['ps', 'payments'])->where('user_id', $userId);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_booking', 'like', "%{$search}%")
                  ->orWhereHas('ps', function($sub) use ($search) {
                      $sub->where('nama_ps', 'like', "%{$search}%");
                  });
            });
        }

        $bookings = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('Customer/Dashboard/Index', [
            'auth'         => ['user' => auth()->user()],
            'activeBilling'=> $activeBilling,
            'availablePs'  => $availablePs,
            'notifications'=> $notifications,
            'bookings'     => $bookings,
            'filters'      => $request->only('search'),
            'flash'        => [
                'message'  => session('message'),
                'type'     => session('type')
            ]
        ]);
    }

    public function storeBooking(Request $request)
    {
        $request->validate([
            'ps_id'        => 'required|exists:ps,id',
            'tanggal_main' => 'required|date',
            'jam_mulai'    => 'required',
            'durasi'       => 'required|integer|min:30', // durasi dalam menit
        ]);

        $ps = Ps::findOrFail($request->ps_id);
        
        // Perhitungan total harga berdasarkan harga per jam dan durasi (menit)
        $totalHarga = ($ps->harga_per_jam / 60) * $request->durasi;
        $dp = $totalHarga * 0.5; // DP 50% sesuai aturan bisnis

        $jamMulai = $request->jam_mulai;
        $jamSelesai = date('H:i', strtotime($jamMulai . ' + ' . $request->durasi . ' minutes'));

        $booking = Booking::create([
            'user_id'      => auth()->id(),
            'ps_id'        => $ps->id,
            'kode_booking' => 'BOOK-' . strtoupper(Str::random(8)),
            'tanggal_main' => $request->tanggal_main,
            'jam_mulai'    => $jamMulai,
            'jam_selesai'  => $jamSelesai,
            'durasi'       => $request->durasi,
            'total_harga'  => $totalHarga,
            'dp'           => $dp,
            'status'       => 'menunggu_pembayaran',
            'catatan'      => 'Booking online via web'
        ]);

        // Buat data pembayaran awal (pending / Xendit DP)
        Payment::create([
            'booking_id'        => $booking->id,
            'user_id'           => auth()->id(),
            'jumlah'            => $dp,
            'metode'            => 'xendit',
            'jenis'             => 'dp',
            'status'            => 'pending',
            'payment_reference' => 'XENDIT-' . strtoupper(Str::random(10))
        ]);

        return redirect()->back()->with([
            'message' => 'Booking berhasil dibuat! Silakan lakukan pembayaran DP.',
            'type'    => 'success'
        ]);
    }
}