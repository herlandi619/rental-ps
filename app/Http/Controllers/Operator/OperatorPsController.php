<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Ps;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorPsController extends Controller
{
    public function index(Request $request)
    {
        $query = Ps::query();

        // Fitur Pencarian berdasarkan kode atau nama PS
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('kode_ps', 'like', "%{$search}%")
                  ->orWhere('nama_ps', 'like', "%{$search}%");
        }

        // Paginasi 5 data per halaman
        $psList = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('Operator/Ps/Index', [
            'psList'  => $psList,
            'filters' => $request->only('search'),
            'flash'   => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_ps'       => 'required|string|max:50|unique:ps,kode_ps',
            'nama_ps'       => 'required|string|max:100',
            'jenis'         => 'required|in:PS4,PS5',
            'tv'            => 'nullable|string|max:50',
            'harga_per_jam' => 'required|numeric|min:0',
            'status'        => 'required|in:tersedia,booking,sedang_bermain,maintenance',
            'keterangan'    => 'nullable|string'
        ]);

        Ps::create($request->all());

        return redirect()->back()->with([
            'message' => 'Data PS berhasil ditambahkan.',
            'type'    => 'success'
        ]);
    }

    public function update(Request $request, $id)
    {
        $ps = Ps::findOrFail($id);
        
        $request->validate([
            'kode_ps'       => 'required|string|max:50|unique:ps,kode_ps,' . $ps->id,
            'nama_ps'       => 'required|string|max:100',
            'jenis'         => 'required|in:PS4,PS5',
            'tv'            => 'nullable|string|max:50',
            'harga_per_jam' => 'required|numeric|min:0',
            'status'        => 'required|in:tersedia,booking,sedang_bermain,maintenance',
            'keterangan'    => 'nullable|string'
        ]);

        $ps->update($request->all());

        return redirect()->back()->with([
            'message' => 'Data PS berhasil diperbarui.',
            'type'    => 'success'
        ]);
    }

    public function destroy($id)
    {
        try {
            $ps = Ps::findOrFail($id);
            $ps->delete();
            
            return redirect()->back()->with([
                'message' => 'Data PS berhasil dihapus.',
                'type'    => 'success'
            ]);
        } catch (QueryException $e) {
            // Mencegah error 500 jika PS sedang terikat pada transaksi/booking
            return redirect()->back()->with([
                'message' => 'Gagal menghapus! PS sedang digunakan dalam riwayat booking atau billing.',
                'type'    => 'error'
            ]);
        }
    }
}