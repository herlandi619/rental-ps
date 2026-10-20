import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PemilikLayout from '@/Layouts/PemilikLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, stats, transactions, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    
    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

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
        router.get(route('pemilik.transactions.index'), { 
            search: searchTerm, 
            start_date: startDate, 
            end_date: endDate 
        }, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        router.get(route('pemilik.transactions.index'), {}, { preserveState: true, replace: true });
    };

    const openDetailModal = (transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailModalOpen(true);
    };

    const closeModals = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    };

    const statusBadge = (status) => {
        switch(status) {
            case 'berhasil': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'gagal': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <PemilikLayout user={auth.user}>
            <Head title="Monitoring Transaksi" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Statistik Pendapatan */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-emerald-500 p-4 rounded-lg shadow-sm border text-center text-white col-span-2 md:col-span-3 lg:col-span-2">
                            <p className="text-xs uppercase font-bold opacity-80">Total Pendapatan</p>
                            <p className="text-2xl font-bold">{formatRupiah(stats.total_pendapatan)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-blue-600 uppercase font-bold">Total DP</p>
                            <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.total_dp)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-indigo-600 uppercase font-bold">Pelunasan</p>
                            <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.total_pelunasan)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-green-600 uppercase font-bold">Cash</p>
                            <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.total_cash)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-purple-600 uppercase font-bold">Xendit / QRIS</p>
                            <p className="text-lg font-bold text-gray-900">{formatRupiah(Number(stats.total_xendit) + Number(stats.total_qris))}</p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Filter */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                            <div className="mb-4 lg:mb-0">
                                <h2 className="text-lg font-bold text-gray-900">Riwayat Transaksi</h2>
                                <p className="text-sm text-gray-500">Melihat daftar seluruh transaksi rental berdasarkan periode.</p>
                            </div>
                            
                            <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                />
                                <span className="self-center text-gray-500">s/d</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Cari Ref / Customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-md shadow-sm text-sm w-full sm:w-48"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-indigo-600 border border-transparent px-4 py-2 rounded-md hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                                        Filter
                                    </button>
                                    <button type="button" onClick={resetFilter} className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Tabel Monitoring Transaksi */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Waktu Bayar</th>
                                        <th className="px-4 py-3">Ref & Customer</th>
                                        <th className="px-4 py-3">Jenis & Metode</th>
                                        <th className="px-4 py-3">Nominal</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.length > 0 ? (
                                        transactions.data.map((trx) => (
                                            <tr key={trx.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-mono text-xs">
                                                    {trx.paid_at ? new Date(trx.paid_at).toLocaleString('id-ID') : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-gray-900">{trx.payment_reference || 'MANUAL-TRX'}</span> <br/>
                                                    <span className="text-xs text-gray-500">{trx.user?.name || 'Walk-in Customer'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold uppercase text-gray-800">{trx.jenis}</span> <br/>
                                                    <span className="text-xs text-gray-500 uppercase">{trx.metode.replace('_', ' ')}</span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-gray-900">
                                                    {formatRupiah(trx.jumlah)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${statusBadge(trx.status)}`}>
                                                        {trx.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => openDetailModal(trx)}
                                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center text-gray-500">Data transaksi tidak ditemukan pada periode ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia */}
                        <div className="mt-4 flex justify-center">
                            {transactions.links.map((link, index) => (
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
            {isDetailModalOpen && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Rincian Transaksi</h3>
                            <button onClick={closeModals} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="space-y-4 text-sm">
                            <div className="bg-gray-50 p-4 rounded-md border text-center">
                                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Nominal Pembayaran</p>
                                <p className="text-3xl font-bold text-gray-900">{formatRupiah(selectedTransaction.jumlah)}</p>
                                <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${statusBadge(selectedTransaction.status)}`}>
                                    {selectedTransaction.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Referensi</p>
                                    <p className="font-semibold">{selectedTransaction.payment_reference || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Waktu Bayar</p>
                                    <p className="font-semibold">{selectedTransaction.paid_at ? new Date(selectedTransaction.paid_at).toLocaleString('id-ID') : 'Belum dibayar'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Metode Pembayaran</p>
                                    <p className="font-semibold uppercase">{selectedTransaction.metode.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Jenis</p>
                                    <p className="font-semibold uppercase">{selectedTransaction.jenis}</p>
                                </div>
                                <div className="col-span-2 border-t pt-3 mt-1">
                                    <p className="text-xs text-gray-500 font-bold uppercase">Customer</p>
                                    <p className="font-semibold">{selectedTransaction.user?.name || 'Customer Walk-in / Tamu'}</p>
                                </div>
                                
                                {selectedTransaction.booking && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Terkait Booking</p>
                                        <p className="font-semibold">{selectedTransaction.booking.kode_booking} - {selectedTransaction.booking.ps?.nama_ps}</p>
                                    </div>
                                )}
                                
                                {selectedTransaction.billing && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Terkait Billing (Walk-in)</p>
                                        <p className="font-semibold">Sesi bermain di {selectedTransaction.billing.ps?.nama_ps}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button type="button" onClick={closeModals} className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded text-sm transition-colors shadow-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PemilikLayout>
    );
}