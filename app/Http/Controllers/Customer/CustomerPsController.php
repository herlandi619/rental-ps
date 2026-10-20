<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Ps;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerPsController extends Controller
{
    public function index(Request $request)
    {
        $query = Ps::query();

        // Fitur pencarian berdasarkan nama, jenis, atau status
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('nama_ps', 'like', "%{$search}%")
                  ->orWhere('jenis', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%");
        }

        // Paginasi 5 data per halaman
        $psList = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('Customer/Ps/Index', [
            'psList'  => $psList,
            'filters' => $request->only('search'),
            'flash'   => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }
}