<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorNotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::where('user_id', auth()->id());

        // Filter berdasarkan kategori/tipe notifikasi
        if ($request->has('type') && $request->type != '') {
            $query->where('type', $request->type);
        }

        $notifications = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('Operator/Notification/Index', [
            'notifications' => $notifications,
            'filters'       => $request->only(['type']),
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