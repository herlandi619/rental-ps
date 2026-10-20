<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerHistoryController extends Controller
{
    public function index(Request $request)
    {
        // Ambil data billing milik customer login beserta relasi PS dan Pembayarannya
        $query = Billing::with(['ps', 'payments', 'booking'])
            ->where('user_id', auth()->id());

        // Fitur Pencarian berdasarkan nama PS atau status billing
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('status', 'like', "%{$search}%")
                  ->orWhereHas('ps', function($qPs) use ($search) {
                      $qPs->where('nama_ps', 'like', "%{$search}%")
                          ->orWhere('jenis', 'like', "%{$search}%");
                  });
            });
        }

        // Paginasi 5 data, diurutkan dari waktu bermain terbaru
        $histories = $query->latest('waktu_mulai')->paginate(5)->withQueryString();

        return Inertia::render('Customer/History/Index', [
            'histories' => $histories,
            'filters'   => $request->only('search'),
            'flash'     => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }
}