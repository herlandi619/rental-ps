<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Ps;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
  
class CustomerOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Ps::where('status', '!=', 'maintenance');

        // Fitur Pencarian Nama PS atau Jenis
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_ps', 'like', "%{$search}%")
                  ->orWhere('jenis', 'like', "%{$search}%");
            });
        }

        // Paginasi 5 Data
        $playstations = $query->paginate(5)->withQueryString();

        return Inertia::render('Customer/Order/Index', [
            'playstations' => $playstations,
            'filters'      => $request->only('search'),
            'flash'        => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ps_id'        => 'required|exists:ps,id',
            'tanggal_main' => 'required|date|after_or_equal:today',
            'jam_mulai'    => 'required|date_format:H:i',
            'durasi'       => 'required|integer|min:30', // Minimal 30 Menit
        ]);

        $ps = Ps::findOrFail($request->ps_id);
        $jam_mulai = $request->jam_mulai;
        $durasi = $request->durasi;
        
        // Kalkulasi Jam Selesai
        $jam_selesai = Carbon::parse($jam_mulai)->addMinutes((int) $durasi)->format('H:i:s');
        
        // Cek Ketersediaan (Mencegah Jadwal Bentrok)
        $isBooked = Booking::where('ps_id', $ps->id)
            ->where('tanggal_main', $request->tanggal_main)
            ->whereIn('status', ['menunggu_pembayaran', 'dikonfirmasi'])
            ->where(function($q) use ($jam_mulai, $jam_selesai) {
                $q->where(function($q2) use ($jam_mulai, $jam_selesai) {
                    $q2->where('jam_mulai', '<', $jam_selesai)
                       ->where('jam_selesai', '>', $jam_mulai);
                });
            })->exists();

        if ($isBooked) {
            return redirect()->back()->with([
                'message' => 'Maaf, PS ini sudah dibooking pada jam tersebut.',
                'type'    => 'error'
            ]);
        }

        // Kalkulasi Harga (Durasi dalam menit / 60 * Harga per jam)
        $total_harga = ($durasi / 60) * $ps->harga_per_jam;
        $dp = $total_harga * 0.5;

        // Generate Kode Booking
        $kode_booking = 'BKG-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        DB::beginTransaction();
        try {
            // 1. Buat Booking
            $booking = Booking::create([
                'user_id'      => auth()->id(),
                'ps_id'        => $ps->id,
                'kode_booking' => $kode_booking,
                'tanggal_main' => $request->tanggal_main,
                'jam_mulai'    => $jam_mulai,
                'jam_selesai'  => $jam_selesai,
                'durasi'       => $durasi,
                'total_harga'  => $total_harga,
                'dp'           => $dp,
                'status'       => 'menunggu_pembayaran',
                'catatan'      => $request->catatan,
            ]);

            // 2. Buat Data Pembayaran DP (Simulasi Xendit Pending)
            Payment::create([
                'booking_id' => $booking->id,
                'user_id'    => auth()->id(),
                'jumlah'     => $dp,
                'metode'     => 'xendit',
                'jenis'      => 'dp',
                'status'     => 'pending',
                'payment_reference' => 'XND-' . time(),
            ]);

            // 3. Buat Notifikasi
            Notification::create([
                'user_id' => auth()->id(),
                'title'   => 'Booking Menunggu Pembayaran',
                'message' => "Booking {$kode_booking} berhasil dibuat. Segera lakukan pembayaran DP sebesar Rp" . number_format($dp, 0, ',', '.') . " melalui Xendit.",
                'type'    => 'booking',
            ]);

            DB::commit();

            return redirect()->route('customer.pesan-ps.index')->with([
                'message' => 'Booking berhasil dibuat! Silakan lanjutkan ke pembayaran Xendit.',
                'type'    => 'success'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with([
                'message' => 'Terjadi kesalahan sistem saat membuat booking.',
                'type'    => 'error'
            ]);
        }
    }
}