import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, histories, filters }) {
    const { flash } = usePage().props;
    
    // State Pencarian
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // State Modal Detail Riwayat
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);

    // SweetAlert Flash Message
    useEffect(() => {
        if (flash?.message) {
            Swal.fire({
                icon: flash.type || 'info',
                title: flash.type === 'error' ? 'Peringatan' : 'Berhasil',
                text: flash.message,
                timer: 3000,
                showConfirmButton: false
            });
        }
    }, [flash]);

    // Handle Pencarian Inertia
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('customer.history.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Buka Tutup Modal Detail
    const openDetailModal = (history) => {
        setSelectedHistory(history);
        setIsDetailModalOpen(true);
    };

    const closeModal = () => {
        setIsDetailModalOpen(false);
        setSelectedHistory(null);
    };

    // Helpers Format Rupiah & Badge Status
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    const statusBadge = (status) => {
        switch(status) {
            case 'berjalan': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'selesai': return 'bg-green-100 text-green-700 border border-green-200';
            case 'dibatalkan': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <CustomerLayout user={auth.user}>
            <Head title="Riwayat Bermain" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Pencarian */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Riwayat Bermain</h3>
                                <p className="text-sm text-gray-500">Daftar sesi penggunaan PlayStation Anda.</p>
                            </div>
                            
                            <form onSubmit={handleSearch} className="flex mt-4 md:mt-0 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari Nama PS / Status..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm font-medium transition-colors">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Riwayat Billing */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Tanggal Bermain</th>
                                        <th className="px-4 py-3">Unit PS</th>
                                        <th className="px-4 py-3">Durasi</th>
                                        <th className="px-4 py-3">Total Biaya</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {histories.data.length > 0 ? (
                                        histories.data.map((history) => (
                                            <tr key={history.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-4 font-medium text-gray-900">
                                                    {formatDateTime(history.waktu_mulai)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="font-semibold text-indigo-700">{history.ps?.nama_ps}</span><br />
                                                    <span className="text-xs text-gray-500">{history.ps?.jenis}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-gray-900 font-medium">{history.durasi} Menit</span>
                                                </td>
                                                <td className="px-4 py-4 font-bold text-gray-900">
                                                    {formatRupiah(history.total_harga)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusBadge(history.status)}`}>
                                                        {history.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button 
                                                        onClick={() => openDetailModal(history)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs border border-indigo-200 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors shadow-sm"
                                                    >
                                                        Lihat Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500 italic">
                                                Belum ada riwayat bermain yang ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia */}
                        <div className="mt-5 flex justify-center">
                            {histories.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (link.url) router.get(link.url);
                                    }}
                                    disabled={!link.url}
                                    className={`px-3 py-1.5 mx-1 border rounded text-xs transition-colors ${
                                        link.active ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-gray-700 hover:bg-gray-50 font-medium'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal Detail Riwayat (Read-Only) */}
            {isDetailModalOpen && selectedHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto px-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                Detail Riwayat Bermain
                                <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge(selectedHistory.status)}`}>
                                    {selectedHistory.status}
                                </span>
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            {/* Rincian Permainan */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Rincian Waktu & Unit</h4>
                                <ul className="space-y-1 mt-2">
                                    <li className="flex justify-between"><span className="text-gray-500">PlayStation:</span> <span className="font-bold text-indigo-700">{selectedHistory.ps?.nama_ps} ({selectedHistory.ps?.jenis})</span></li>
                                    <li className="flex justify-between"><span className="text-gray-500">Mulai:</span> <span className="font-medium">{formatDateTime(selectedHistory.waktu_mulai)}</span></li>
                                    <li className="flex justify-between"><span className="text-gray-500">Selesai:</span> <span className="font-medium">{formatDateTime(selectedHistory.waktu_selesai)}</span></li>
                                    <li className="flex justify-between"><span className="text-gray-500">Durasi:</span> <span className="font-bold text-gray-900">{selectedHistory.durasi} Menit</span></li>
                                </ul>
                            </div>

                            {/* Rincian Transaksi */}
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                <h4 className="font-bold text-blue-800 mb-2 border-b border-blue-200 pb-1">Ringkasan Biaya</h4>
                                <div className="mt-2 text-center bg-white border border-blue-200 py-3 rounded">
                                    <span className="block text-gray-500 text-xs font-semibold uppercase">Total Harga Billing</span>
                                    <span className="font-bold text-blue-700 text-2xl">{formatRupiah(selectedHistory.total_harga)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabel Riwayat Pembayaran Terkait Billing ini */}
                        <div className="mt-4 border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-800 mb-3">Riwayat Pembayaran (Payment Logs)</h4>
                            {selectedHistory.payments && selectedHistory.payments.length > 0 ? (
                                <div className="overflow-x-auto border rounded-md">
                                    <table className="w-full text-xs text-left text-gray-600">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="px-3 py-2">Waktu Pembayaran</th>
                                                <th className="px-3 py-2">Jenis</th>
                                                <th className="px-3 py-2">Metode</th>
                                                <th className="px-3 py-2 text-right">Jumlah</th>
                                                <th className="px-3 py-2 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedHistory.payments.map(payment => (
                                                <tr key={payment.id} className="border-b bg-white last:border-0">
                                                    <td className="px-3 py-2">{formatDateTime(payment.paid_at || payment.created_at)}</td>
                                                    <td className="px-3 py-2 font-bold uppercase">{payment.jenis}</td>
                                                    <td className="px-3 py-2 capitalize">{payment.metode.replace('_', ' ')}</td>
                                                    <td className="px-3 py-2 font-semibold text-right">{formatRupiah(payment.jumlah)}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${payment.status === 'berhasil' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border p-3 rounded text-center text-sm text-red-500 italic">
                                    Belum ada transaksi pembayaran yang dicatat untuk sesi ini.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t flex justify-end">
                            <button 
                                type="button" 
                                onClick={closeModal} 
                                className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded text-sm transition-colors shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}