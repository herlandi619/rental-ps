<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'billing_id',
        'user_id',
        'jumlah',
        'metode',
        'jenis',
        'status',
        'payment_reference',
        'bukti_pembayaran',
        'paid_at',
    ];

    protected $casts = [
        'jumlah' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function billing()
    {
        return $this->belongsTo(Billing::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}