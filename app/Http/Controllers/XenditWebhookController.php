<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Booking;
use App\Models\Ps;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class XenditWebhookController extends Controller
{
    public function handleInvoice(Request $request)
    {
        // 1. Verifikasi Callback Token (Opsional tapi sangat direkomendasikan)
        // Dapatkan token ini di Dashboard Xendit -> Settings -> Callbacks
        $xenditXCallbackToken = env('XENDIT_CALLBACK_TOKEN');
        $reqToken = $request->header('x-callback-token');

        if ($xenditXCallbackToken && $reqToken !== $xenditXCallbackToken) {
            Log::warning('Xendit Webhook: Token mismatch.');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Ambil payload dari Xendit
        $status = $request->input('status');
        $externalId = $request->input('external_id');

        // Jika pembayaran berhasil (PAID)
        if ($status === 'PAID') {
            $payment = Payment::where('payment_reference', $externalId)->first();

            if ($payment && $payment->status === 'pending') {
                
                // Langkah 1: Update tabel PAYMENTS
                $payment->update([
                    'status' => 'berhasil',
                    'paid_at' => now(),
                ]);

                // Langkah 2: Update tabel BOOKINGS
                $booking = Booking::find($payment->booking_id);
                if ($booking) {
                    $booking->update([
                        'status' => 'dikonfirmasi'
                    ]);

                    // Langkah 3: Update tabel PS (Kondisional)
                    // Ubah status PS jika jadwal mainnya adalah hari ini
                    if ($booking->tanggal_main == today()->toDateString()) {
                        Ps::where('id', $booking->ps_id)->update([
                            'status' => 'booking'
                        ]);
                    }

                    // Langkah 4: Create NOTIFICATIONS
                    Notification::create([
                        'user_id' => $booking->user_id,
                        'title' => 'Pembayaran Berhasil',
                        'message' => "Pembayaran DP Booking {$booking->kode_booking} berhasil dikonfirmasi.",
                        'type' => 'payment',
                        'is_read' => false,
                    ]);
                }
                
                Log::info("Xendit Webhook: Payment {$externalId} berhasil diproses.");
            }
        }

        // Response 200 OK wajib dikembalikan agar Xendit tahu callback sukses diterima
        return response()->json(['message' => 'Success'], 200);
    }
}