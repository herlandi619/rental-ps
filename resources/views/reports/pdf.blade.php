<!DOCTYPE html>
<html>
<head>
    <title>Laporan {{ ucfirst($type) }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; text-transform: uppercase; font-size: 11px; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
    </style>
</head>
<body>

    <div class="header">
        <h2>Laporan {{ ucfirst($type) }} Rental PS</h2>
        <p>
            Periode: {{ $filters['start_date'] ?? 'Awal' }} s/d {{ $filters['end_date'] ?? 'Sekarang' }}
        </p>
    </div>

    <table>
        <thead>
            @if($type === 'transaksi')
                <tr>
                    <th>Waktu</th>
                    <th>Referensi</th>
                    <th>Customer</th>
                    <th>Metode & Jenis</th>
                    <th>Nominal (Rp)</th>
                    <th>Status</th>
                </tr>
            @elseif($type === 'booking')
                <tr>
                    <th>Kode Booking</th>
                    <th>Customer</th>
                    <th>Unit PS</th>
                    <th>Tgl Main</th>
                    <th>Waktu</th>
                    <th>Status</th>
                </tr>
            @elseif($type === 'billing')
                <tr>
                    <th>Waktu Mulai</th>
                    <th>Unit PS</th>
                    <th>Customer</th>
                    <th>Durasi (Menit)</th>
                    <th>Total (Rp)</th>
                </tr>
            @endif
        </thead>
        <tbody>
            @php $totalNominal = 0; @endphp

            @forelse($data as $item)
                @if($type === 'transaksi')
                    @php $totalNominal += $item->jumlah; @endphp
                    <tr>
                        <td>{{ $item->created_at ? $item->created_at->format('d/m/Y H:i') : '-' }}</td>
                        <td>{{ $item->payment_reference ?? '-' }}</td>
                        <td>{{ $item->user->name ?? 'Walk-in' }}</td>
                        <td>{{ $item->metode ? strtoupper($item->metode) : '-' }} ({{ $item->jenis ? ucfirst($item->jenis) : '-' }})</td>
                        <td>{{ number_format($item->jumlah ?? 0, 0, ',', '.') }}</td>
                        <td>{{ $item->status ? strtoupper($item->status) : '-' }}</td>
                    </tr>
                @elseif($type === 'booking')
                    <tr>
                        <td>{{ $item->kode_booking ?? '-' }}</td>
                        <td>{{ $item->user->name ?? '-' }}</td>
                        <td>{{ $item->ps->nama_ps ?? '-' }}</td>
                        <td>{{ $item->tanggal_main ?? '-' }}</td>
                        <td>{{ ($item->jam_mulai && $item->jam_selesai) ? $item->jam_mulai . ' - ' . $item->jam_selesai : '-' }}</td>
                        <td>{{ $item->status ? strtoupper(str_replace('_', ' ', $item->status)) : '-' }}</td>
                    </tr>
                @elseif($type === 'billing')
                    @php $totalNominal += $item->total_harga; @endphp
                    <tr>
                        <td>{{ $item->waktu_mulai ? date('d/m/Y H:i', strtotime($item->waktu_mulai)) : '-' }}</td>
                        <td>{{ $item->ps->nama_ps ?? '-' }}</td>
                        <td>{{ $item->customer->name ?? 'Walk-in' }}</td>
                        <td>{{ $item->durasi ?? '-' }}</td>
                        <td>{{ number_format($item->total_harga ?? 0, 0, ',', '.') }}</td>
                    </tr>
                @endif
            @empty
                <tr>
                    <td colspan="{{ $type === 'booking' ? 6 : 5 }}" style="text-align: center;">Data laporan tidak ditemukan.</td>
                </tr>
            @endforelse
        </tbody>

        {{-- Baris Total Nominal khusus untuk Laporan Transaksi dan Billing --}}
        @if(($type === 'transaksi' || $type === 'billing') && count($data) > 0)
            <tfoot>
                <tr>
                    <td colspan="{{ $type === 'transaksi' ? 4 : 4 }}" class="font-bold text-right">TOTAL KESELURUHAN:</td>
                    <td colspan="2" class="font-bold">
                        Rp {{ number_format($totalNominal, 0, ',', '.') }}
                    </td>
                </tr>
            </tfoot>
        @endif
    </table>

</body>
</html>