<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ps extends Model
{
    use HasFactory;

    protected $table = 'ps';

    protected $fillable = [
        'kode_ps',
        'nama_ps',
        'jenis',
        'tv',
        'harga_per_jam',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'harga_per_jam' => 'decimal:2',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function billings()
    {
        return $this->hasMany(Billing::class);
    }
}