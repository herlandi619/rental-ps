import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PemilikLayout from '@/Layouts/PemilikLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, stats, recentPayments, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    
    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        if (flash?.message) {
            Swal.fire({
                icon: flash.type || 'info',
                title: 'Informasi',
                text: flash.message,
                timer: 3000,
                showConfirmButton: false
            });
        }
    }, [flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('pemilik.statistics.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const openDetailModal = (payment) => {
        setSelectedPayment(payment);
        setIsDetailModalOpen(true);
    };

    const closeModals = () => {
        setIsDetailModalOpen(false);
        setSelectedPayment(null);
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number || 0);
    };

    const getPersentaseKenaikan = (sekarang, lalu) => {
        if (lalu == 0) return sekarang > 0 ? 100 : 0;
        return (((sekarang - lalu) / lalu) * 100).toFixed(1);
    };
    
    const trenPendapatan = getPersentaseKenaikan(stats.pendapatan_bulan_ini, stats.pendapatan_bulan_lalu);

    return (
        <PemilikLayout user={auth.user}>
            <Head title="Statistik & Analitik" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Ringkasan Analitik Utama */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-600 p-5 rounded-lg shadow-sm border text-white relative overflow-hidden">
                            <p className="text-sm uppercase font-bold opacity-80">Pendapatan Bulan Ini</p>
                            <p className="text-3xl font-bold mt-2">{formatRupiah(stats.pendapatan_bulan_ini)}</p>
                            <div className="mt-4 flex items-center text-sm font-medium">
                                <span className={`px-2 py-1 rounded bg-white bg-opacity-20 ${trenPendapatan >= 0 ? 'text-green-100' : 'text-red-200'}`}>
                                    {trenPendapatan >= 0 ? '▲' : '▼'} {Math.abs(trenPendapatan)}% vs Bulan Lalu
                                </span>
                            </div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg shadow-sm border text-center flex flex-col justify-center">
                            <p className="text-xs text-blue-600 uppercase font-bold">Total Booking (Bulan Ini)</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stats.booking_bulan_ini}</p>
                            <p className="text-xs text-gray-400 mt-1">Reservasi sukses</p>
                        </div>

                        <div className="bg-white p-5 rounded-lg shadow-sm border text-center flex flex-col justify-center">
                            <p className="text-xs text-indigo-600 uppercase font-bold">Total Customer</p>
                            <p className="text-4xl font-black text-gray-900 mt-2">{stats.total_customer}</p>
                            <p className="text-xs text-gray-400 mt-1">Akun pelanggan terdaftar</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Grafik Sederhana: PS Terlaris */}
                        <div className="bg-white p-5 rounded-lg shadow-sm border col-span-1 lg:col-span-2">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Top 5 PS Paling Sering Digunakan</h3>
                            <div className="space-y-4">
                                {stats.ps_terlaris.length > 0 ? stats.ps_terlaris.map((item, index) => {
                                    const maxVal = stats.ps_terlaris[0].total_main;
                                    const widthPercent = (item.total_main / maxVal) * 100;
                                    return (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-24 text-sm font-semibold text-gray-700 truncate">{item.ps?.nama_ps}</div>
                                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${widthPercent}%` }}></div>
                                            </div>
                                            <div className="w-16 text-right text-sm font-bold text-gray-900">{item.total_main} Sesi</div>
                                        </div>
                                    )
                                }) : <p className="text-sm text-gray-500 italic">Belum ada data permainan.</p>}
                            </div>
                        </div>

                        {/* Grafik Sederhana: Jenis & Metode */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-lg shadow-sm border">
                                <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Penggunaan PS4 vs PS5</h3>
                                <div className="flex justify-around items-end h-24 gap-4">
                                    {['PS4', 'PS5'].map(jenis => {
                                        const dt = stats.penggunaan_jenis.find(x => x.jenis === jenis);
                                        const total = dt ? dt.total : 0;
                                        const maxTotal = Math.max(...stats.penggunaan_jenis.map(x => x.total), 1);
                                        const heightPercent = (total / maxTotal) * 100;
                                        
                                        return (
                                            <div key={jenis} className="flex flex-col items-center w-1/2">
                                                <span className="text-xs font-bold mb-1">{total}</span>
                                                <div className={`w-full max-w-[40px] rounded-t-md ${jenis === 'PS5' ? 'bg-indigo-500' : 'bg-gray-400'}`} style={{ height: `${heightPercent}%`, minHeight: '10%' }}></div>
                                                <span className="text-xs font-semibold mt-2">{jenis}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-lg shadow-sm border">
                                <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Metode Pembayaran</h3>
                                <div className="space-y-3">
                                    {stats.metode_pembayaran.length > 0 ? stats.metode_pembayaran.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                            <span className="capitalize font-semibold text-gray-700">{item.metode.replace('_', ' ')}</span>
                                            <span className="font-bold bg-gray-100 px-2 py-1 rounded">{item.total} Trx</span>
                                        </div>
                                    )) : <p className="text-sm text-gray-500 italic">Belum ada data.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Histori Pembayaran Berhasil</h2>
                                <p className="text-sm text-gray-500">Log rincian pendapatan operasional terbaru.</p>
                            </div>
                            
                            <form onSubmit={handleSearch} className="flex w-full md:w-auto mt-4 md:mt-0">
                                <input
                                    type="text"
                                    placeholder="Cari Referensi / Nama..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-r-md hover:bg-gray-200 text-sm font-medium">
                                    Cari
                                </button>
                            </form>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Waktu Bayar</th>
                                        <th className="px-4 py-3">Referensi & Metode</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Nominal</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPayments.data.length > 0 ? (
                                        recentPayments.data.map((pay) => (
                                            <tr key={pay.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-mono text-xs">{new Date(pay.paid_at).toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-gray-900">{pay.payment_reference || 'MANUAL-TRX'}</span> <br/>
                                                    <span className="text-xs uppercase text-blue-600 font-bold">{pay.metode.replace('_', ' ')} - {pay.jenis}</span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{pay.user?.name || 'Walk-in'}</td>
                                                <td className="px-4 py-3 font-bold text-emerald-600">{formatRupiah(pay.jumlah)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => openDetailModal(pay)} className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-xs font-semibold transition">
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-4 text-center text-gray-500">Tidak ada riwayat pembayaran yang cocok.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi */}
                        <div className="mt-4 flex justify-center">
                            {recentPayments.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (link.url) router.get(link.url);
                                    }}
                                    disabled={!link.url}
                                    className={`px-3 py-1 mx-1 border rounded text-xs font-medium transition-colors ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Box Detail Transaksi (Read-Only) */}
            {isDetailModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Rincian Pendapatan</h3>
                            <button onClick={closeModals} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="space-y-4 text-sm">
                            <div className="bg-emerald-50 p-4 rounded-md border border-emerald-100 text-center mb-4">
                                <p className="text-emerald-700 text-xs font-bold uppercase mb-1">Total Masuk</p>
                                <p className="text-3xl font-black text-emerald-900">{formatRupiah(selectedPayment.jumlah)}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Waktu</p>
                                    <p className="font-semibold">{new Date(selectedPayment.paid_at).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Customer</p>
                                    <p className="font-semibold">{selectedPayment.user?.name || 'Tamu / Walk-in'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Metode</p>
                                    <p className="font-semibold uppercase">{selectedPayment.metode.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Jenis Tagihan</p>
                                    <p className="font-semibold uppercase">{selectedPayment.jenis}</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-md border mt-2">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Terkait Transaksi</p>
                                {selectedPayment.booking ? (
                                    <p className="font-semibold text-gray-900">Booking: {selectedPayment.booking.kode_booking} - {selectedPayment.booking.ps?.nama_ps}</p>
                                ) : selectedPayment.billing ? (
                                    <p className="font-semibold text-gray-900">Billing (Sewa Langsung) - {selectedPayment.billing.ps?.nama_ps}</p>
                                ) : (
                                    <p className="text-gray-500 italic">Tidak ada detail relasi</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button type="button" onClick={closeModals} className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded text-sm transition shadow-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PemilikLayout>
    );
}