<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'ps_id',
        'operator_id',
        'waktu_mulai',
        'waktu_selesai',
        'durasi',
        'total_harga',
        'status',
    ];

    protected $casts = [
        'waktu_mulai' => 'datetime',
        'waktu_selesai' => 'datetime',
        'total_harga' => 'decimal:2',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    // Customer
    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function ps()
    {
        return $this->belongsTo(Ps::class);
    }

    // Operator
    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}