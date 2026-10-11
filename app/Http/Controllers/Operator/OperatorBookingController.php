<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Billing;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Ps;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorBookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'ps', 'payments']);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('kode_booking', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('ps', function($q) use ($search) {
                      $q->where('nama_ps', 'like', "%{$search}%");
                  });
        }

        $bookings = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('Operator/Booking/Index', [
            'bookings' => $bookings,
            'filters'  => $request->only('search'),
            'flash'    => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function konfirmasi(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update(['status' => 'dikonfirmasi']);

        Notification::create([
            'user_id' => $booking->user_id,
            'title'   => 'Booking Dikonfirmasi',
            'message' => "Booking Anda dengan kode {$booking->kode_booking} telah dikonfirmasi oleh operator.",
            'type'    => 'booking',
        ]);

        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Konfirmasi Booking',
            'description' => "Operator mengonfirmasi booking {$booking->kode_booking}.",
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Booking berhasil dikonfirmasi.',
            'type'    => 'success'
        ]);
    }

    public function batal(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update(['status' => 'dibatalkan']);

        Notification::create([
            'user_id' => $booking->user_id,
            'title'   => 'Booking Dibatalkan',
            'message' => "Booking Anda dengan kode {$booking->kode_booking} telah dibatalkan.",
            'type'    => 'booking',
        ]);

        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Pembatalan Booking',
            'description' => "Operator membatalkan booking {$booking->kode_booking}.",
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Booking berhasil dibatalkan.',
            'type'    => 'success'
        ]);
    }

    public function mulaiBilling(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $ps = Ps::findOrFail($booking->ps_id);
        if ($ps->status === 'maintenance' || $ps->status === 'sedang_bermain') {
            return redirect()->back()->with([
                'message' => 'Gagal memulai billing. PS sedang maintenance atau digunakan.',
                'type'    => 'error'
            ]);
        }

        $waktuMulai = Carbon::now();
        $waktuSelesai = $waktuMulai->copy()->addMinutes($booking->durasi);

        Billing::create([
            'booking_id'    => $booking->id,
            'user_id'       => $booking->user_id,
            'ps_id'         => $booking->ps_id,
            'operator_id'   => auth()->id(),
            'waktu_mulai'   => $waktuMulai,
            'waktu_selesai' => $waktuSelesai,
            'durasi'        => $booking->durasi,
            'total_harga'   => $booking->total_harga,
            'status'        => 'berjalan'
        ]);

        $booking->update(['status' => 'selesai']);
        $ps->update(['status' => 'sedang_bermain']);

        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Open Billing dari Booking',
            'description' => "Operator membuka billing untuk booking {$booking->kode_booking} di {$ps->nama_ps}.",
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Billing berhasil dimulai! Timer sedang berjalan.',
            'type'    => 'success'
        ]);
    }
}