<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerBookingController extends Controller
{
    public function index(Request $request)
    {
        // Ambil data booking milik customer yang sedang login beserta relasinya
        $query = Booking::with(['ps', 'payments'])->where('user_id', auth()->id());

        // Fitur Pencarian berdasarkan kode booking atau nama PS
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_booking', 'like', "%{$search}%")
                  ->orWhereHas('ps', function($qPs) use ($search) {
                      $qPs->where('nama_ps', 'like', "%{$search}%");
                  });
            });
        }

        // Paginasi 5 data
        $bookings = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('Customer/Booking/Index', [
            'bookings' => $bookings,
            'filters'  => $request->only('search'),
            'flash'    => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function cancel($id)
    {
        $booking = Booking::where('id', $id)->where('user_id', auth()->id())->firstOrFail();

        // Aturan: Hanya booking dengan status menunggu_pembayaran yang bisa dibatalkan sendiri oleh customer
        if ($booking->status === 'menunggu_pembayaran') {
            $booking->update(['status' => 'dibatalkan']);
            
            return redirect()->back()->with([
                'message' => 'Booking berhasil dibatalkan.',
                'type'    => 'success'
            ]);
        }

        return redirect()->back()->with([
            'message' => 'Booking sudah tidak dapat dibatalkan. Silakan hubungi operator.',
            'type'    => 'error'
        ]);
    }
}