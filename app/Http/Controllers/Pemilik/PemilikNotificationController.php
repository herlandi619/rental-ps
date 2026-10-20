<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PemilikNotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::where('user_id', auth()->id());

        // Filter berdasarkan kategori/tipe notifikasi
        if ($request->has('type') && $request->type != '') {
            $query->where('type', $request->type);
        }

        // Filter pencarian berdasarkan judul atau pesan
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $notifications = $query->latest()->paginate(5)->withQueryString();

        $stats = [
            'total_unread' => Notification::where('user_id', auth()->id())->where('is_read', false)->count(),
        ];

        return Inertia::render('Pemilik/Notifikasi/Index', [
            'notifications' => $notifications,
            'stats'         => $stats,
            'filters'       => $request->only(['search', 'type']),
            'flash'         => [
                'message' => session('message'),
                'type'    => session('type')
            ]
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', auth()->id())->findOrFail($id);
        $notification->update(['is_read' => true]);

        return redirect()->back()->with([
            'message' => 'Notifikasi ditandai sudah dibaca.',
            'type'    => 'success'
        ]);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return redirect()->back()->with([
            'message' => 'Semua notifikasi ditandai sudah dibaca.',
            'type'    => 'success'
        ]);
    }
}