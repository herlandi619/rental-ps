<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ps_id',
        'kode_booking',
        'tanggal_main',
        'jam_mulai',
        'jam_selesai',
        'durasi',
        'total_harga',
        'dp',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_main' => 'date',
        'total_harga' => 'decimal:2',
        'dp' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ps()
    {
        return $this->belongsTo(Ps::class);
    }

    public function billings()
    {
        return $this->hasMany(Billing::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}