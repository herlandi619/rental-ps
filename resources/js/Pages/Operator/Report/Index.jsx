import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, data, psList, filters }) {
    const { flash } = usePage().props;

    const [type, setType] = useState(filters.type || 'transaksi');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [psId, setPsId] = useState(filters.ps_id || '');
    const [metode, setMetode] = useState(filters.metode || '');

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

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('operator.reports.index'), {
            type, search: searchTerm, start_date: startDate, end_date: endDate, ps_id: psId, metode
        }, { preserveState: true, replace: true });
    };

    const handleTabChange = (newType) => {
        setType(newType);
        router.get(route('operator.reports.index'), {
            type: newType, start_date: startDate, end_date: endDate
        }, { preserveState: true, replace: true });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    // Build URL untuk PDF Download
    const pdfUrl = route('operator.reports.pdf', {
        type, search: searchTerm, start_date: startDate, end_date: endDate, ps_id: psId, metode
    });

    return (
        <OperatorLayout user={auth.user}>
            <Head title="Laporan Sistem" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Tabs Laporan */}
                    <div className="flex border-b border-gray-200 bg-white px-6 pt-4 rounded-t-lg shadow-sm">
                        <button onClick={() => handleTabChange('transaksi')} className={`py-2 px-4 font-semibold text-sm border-b-2 ${type === 'transaksi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Laporan Transaksi</button>
                        <button onClick={() => handleTabChange('booking')} className={`py-2 px-4 font-semibold text-sm border-b-2 ${type === 'booking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Laporan Booking</button>
                        <button onClick={() => handleTabChange('billing')} className={`py-2 px-4 font-semibold text-sm border-b-2 ${type === 'billing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Laporan Billing & PS</button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-b-lg p-6">
                        {/* Area Filter */}
                        <form onSubmit={handleFilter} className="mb-6 bg-gray-50 p-4 rounded-md border flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Mulai</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-gray-300 rounded-md shadow-sm text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Akhir</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-gray-300 rounded-md shadow-sm text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Filter Unit PS</label>
                                <select value={psId} onChange={e => setPsId(e.target.value)} className="border-gray-300 rounded-md shadow-sm text-sm">
                                    <option value="">Semua PS</option>
                                    {psList.map(ps => <option key={ps.id} value={ps.id}>{ps.nama_ps}</option>)}
                                </select>
                            </div>
                            {type === 'transaksi' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Metode Bayar</label>
                                    <select value={metode} onChange={e => setMetode(e.target.value)} className="border-gray-300 rounded-md shadow-sm text-sm">
                                        <option value="">Semua Metode</option>
                                        <option value="cash">Cash</option>
                                        <option value="qris_manual">QRIS Manual</option>
                                        <option value="xendit">Xendit</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex-grow">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Pencarian</label>
                                <input type="text" placeholder="Cari nama / kode..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm font-medium">Terapkan</button>
                                <a href={pdfUrl} target="_blank" rel="noreferrer" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow text-sm font-medium flex items-center">
                                    Unduh PDF
                                </a>
                            </div>
                        </form>

                        {/* Rendering Tabel Berdasarkan Tipe */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                    {type === 'transaksi' && (
                                        <tr>
                                            <th className="px-4 py-3">Waktu</th>
                                            <th className="px-4 py-3">Referensi & Customer</th>
                                            <th className="px-4 py-3">Metode & Jenis</th>
                                            <th className="px-4 py-3">Nominal</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    )}
                                    {type === 'booking' && (
                                        <tr>
                                            <th className="px-4 py-3">Kode Booking</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Unit PS</th>
                                            <th className="px-4 py-3">Jadwal Bermain</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    )}
                                    {type === 'billing' && (
                                        <tr>
                                            <th className="px-4 py-3">Waktu Bermain</th>
                                            <th className="px-4 py-3">Unit PS</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Durasi</th>
                                            <th className="px-4 py-3">Total Tagihan</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {data.data.length > 0 ? data.data.map((item) => (
                                        <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                            {/* Baris Tabel Transaksi */}
                                            {type === 'transaksi' && (
                                                <>
                                                    <td className="px-4 py-3">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 font-semibold text-gray-900">{item.payment_reference}<br/><span className="text-xs font-normal text-gray-500">{item.user?.name || 'Walk-in'}</span></td>
                                                    <td className="px-4 py-3 uppercase text-xs">{item.metode} ({item.jenis})</td>
                                                    <td className="px-4 py-3 font-bold text-green-600">{formatRupiah(item.jumlah)}</td>
                                                    <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs font-bold bg-gray-200 uppercase">{item.status}</span></td>
                                                </>
                                            )}
                                            
                                            {/* Baris Tabel Booking */}
                                            {type === 'booking' && (
                                                <>
                                                    <td className="px-4 py-3 font-semibold">{item.kode_booking}</td>
                                                    <td className="px-4 py-3">{item.user?.name}</td>
                                                    <td className="px-4 py-3">{item.ps?.nama_ps}</td>
                                                    <td className="px-4 py-3">{item.tanggal_main} <br/> <span className="text-xs">{item.jam_mulai} - {item.jam_selesai}</span></td>
                                                    <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs font-bold bg-gray-200 uppercase">{item.status.replace('_', ' ')}</span></td>
                                                </>
                                            )}

                                            {/* Baris Tabel Billing */}
                                            {type === 'billing' && (
                                                <>
                                                    <td className="px-4 py-3">{new Date(item.waktu_mulai).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 font-semibold">{item.ps?.nama_ps}</td>
                                                    <td className="px-4 py-3">{item.customer?.name || 'Walk-in'}</td>
                                                    <td className="px-4 py-3">{item.durasi} Menit</td>
                                                    <td className="px-4 py-3 font-bold text-gray-800">{formatRupiah(item.total_harga)}</td>
                                                </>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">Data laporan tidak ditemukan untuk filter ini.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia */}
                        <div className="mt-4 flex justify-center">
                            {data.links.map((link, index) => (
                                <button key={index} onClick={(e) => { e.preventDefault(); if (link.url) router.get(link.url); }} disabled={!link.url}
                                    className={`px-3 py-1 mx-1 border rounded text-xs font-medium transition-colors ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </OperatorLayout>
    );
}