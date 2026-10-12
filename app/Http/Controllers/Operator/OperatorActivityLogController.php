<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')->latest();

        // Fitur Pencarian (berdasarkan nama user, aktivitas, atau deskripsi)
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('activity', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Paginasi 5 Data
        $logs = $query->paginate(5)->withQueryString();

        return Inertia::render('Operator/ActivityLog/Index', [
            'logs'    => $logs,
            'filters' => $request->only('search'),
            'flash'   => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }
}