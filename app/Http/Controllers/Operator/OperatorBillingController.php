<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Billing;
use App\Models\Ps;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
 
class OperatorBillingController extends Controller
{
    public function index(Request $request)
    {
        $query = Billing::with(['ps', 'customer'])
                        ->whereDate('created_at', Carbon::today());

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->whereHas('ps', function($q) use ($search) {
                $q->where('nama_ps', 'like', "%{$search}%");
            })->orWhereHas('customer', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Urutkan yang masih berjalan di atas, lalu berdasarkan waktu terbaru
        $billings = $query->orderByRaw("
                    CASE status 
                        WHEN 'berjalan' THEN 1 
                        WHEN 'selesai' THEN 2 
                        WHEN 'dibatalkan' THEN 3 
                        ELSE 4 
                    END
                  ")
                  ->latest()
                  ->paginate(5)
                  ->withQueryString();

        $availablePs = Ps::where('status', 'tersedia')->get();
        $customers = User::where('role', 'customer')->get();

        return Inertia::render('Operator/Billing/Index', [
            'billings'    => $billings,
            'availablePs' => $availablePs,
            'customers'   => $customers,
            'filters'     => $request->only('search'),
            'flash'       => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ps_id'   => 'required|exists:ps,id',
            'user_id' => 'nullable|exists:users,id',
            'durasi'  => 'required|integer|min:1',
        ]);

        $ps = Ps::findOrFail($request->ps_id);
        
        if ($ps->status !== 'tersedia') {
            return redirect()->back()->with([
                'message' => 'PS sedang tidak tersedia.',
                'type'    => 'error'
            ]);
        }

        $waktuMulai = Carbon::now();
        $waktuSelesai = $waktuMulai->copy()->addMinutes((int) $request->durasi);
        $totalHarga = ($ps->harga_per_jam / 60) * $request->durasi;

        Billing::create([
            'booking_id'    => null, // Walk-in
            'user_id'       => $request->user_id,
            'ps_id'         => $ps->id,
            'operator_id'   => auth()->id(),
            'waktu_mulai'   => $waktuMulai,
            'waktu_selesai' => $waktuSelesai,
            'durasi'        => $request->durasi,
            'total_harga'   => $totalHarga,
            'status'        => 'berjalan'
        ]);

        $ps->update(['status' => 'sedang_bermain']);

        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Open Billing Walk-in',
            'description' => "Operator membuka billing untuk {$ps->nama_ps} selama {$request->durasi} menit.",
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Sesi bermain berhasil dimulai.',
            'type'    => 'success'
        ]);
    }

    public function extend(Request $request, $id)
    {
        $request->validate([
            'tambahan_waktu' => 'required|integer|min:15',
        ]);

        $billing = Billing::findOrFail($id);
        $ps = Ps::findOrFail($billing->ps_id);

        $waktuSelesaiBaru = Carbon::parse($billing->waktu_selesai)->addMinutes((int) $request->tambahan_waktu);
        $tambahanHarga = ($ps->harga_per_jam / 60) * $request->tambahan_waktu;

        $billing->update([
            'waktu_selesai' => $waktuSelesaiBaru,
            'durasi'        => $billing->durasi + $request->tambahan_waktu,
            'total_harga'   => $billing->total_harga + $tambahanHarga,
        ]);

        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Perpanjangan Waktu',
            'description' => "Operator menambah waktu {$request->tambahan_waktu} menit untuk {$ps->nama_ps}.",
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Waktu bermain berhasil diperpanjang.',
            'type'    => 'success'
        ]);
    }

    public function finish(Request $request, $id)
    {
        $billing = Billing::findOrFail($id);
        $ps = Ps::findOrFail($billing->ps_id);

        $billing->update(['status' => 'selesai']);
        $ps->update(['status' => 'tersedia']);

        ActivityLog::create([
            'user_id'     => auth()->id(),
            'activity'    => 'Billing Selesai',
            'description' => "Operator menyelesaikan billing untuk {$ps->nama_ps}.",
            'ip_address'  => $request->ip()
        ]);

        return redirect()->back()->with([
            'message' => 'Billing selesai. Jangan lupa catat pembayaran jika belum lunas.',
            'type'    => 'success'
        ]);
    }
}