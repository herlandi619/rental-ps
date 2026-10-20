import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PemilikLayout from '@/Layouts/PemilikLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, stats, bookings, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    
    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

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
        router.get(route('pemilik.bookings.index'), { search: searchTerm, status: statusFilter }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatusFilter(newStatus);
        router.get(route('pemilik.bookings.index'), { search: searchTerm, status: newStatus }, { preserveState: true, replace: true });
    };

    const openDetailModal = (booking) => {
        setSelectedBooking(booking);
        setIsDetailModalOpen(true);
    };

    const closeModals = () => {
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
    };

    const statusBadge = (status) => {
        switch(status) {
            case 'menunggu_pembayaran': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'dikonfirmasi': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'selesai': return 'bg-green-100 text-green-700 border-green-200';
            case 'dibatalkan': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    };

    return (
        <PemilikLayout user={auth.user}>
            <Head title="Monitoring Booking" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Statistik Booking */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Booking</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-blue-600 uppercase font-bold">Booking Hari Ini</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.hari_ini}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-indigo-600 uppercase font-bold">Booking Mendatang</p>
                            <p className="text-2xl font-bold text-indigo-700">{stats.mendatang}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-green-600 uppercase font-bold">Selesai</p>
                            <p className="text-2xl font-bold text-green-700">{stats.selesai}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-red-600 uppercase font-bold">Dibatalkan</p>
                            <p className="text-2xl font-bold text-red-700">{stats.dibatalkan}</p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header, Filter & Pencarian */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Riwayat Booking</h2>
                                <p className="text-sm text-gray-500">Monitoring seluruh pesanan pelanggan.</p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
                                <select 
                                    value={statusFilter} 
                                    onChange={handleStatusChange} 
                                    className="border-gray-300 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                                    <option value="dikonfirmasi">Dikonfirmasi</option>
                                    <option value="selesai">Selesai</option>
                                    <option value="dibatalkan">Dibatalkan</option>
                                </select>

                                <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Cari Kode / Customer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                    />
                                    <button type="submit" className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-r-md hover:bg-gray-200 text-sm font-medium">
                                        Cari
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Tabel Monitoring Booking */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Kode Booking</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Unit PS</th>
                                        <th className="px-4 py-3">Jadwal Main</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.data.length > 0 ? (
                                        bookings.data.map((booking) => (
                                            <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-gray-900">{booking.kode_booking}</td>
                                                <td className="px-4 py-3 text-gray-900 font-bold">{booking.user?.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold">{booking.ps?.nama_ps}</span> <br/>
                                                    <span className="text-xs text-gray-500">{booking.ps?.jenis}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold">{new Date(booking.tanggal_main).toLocaleDateString('id-ID')}</span> <br/>
                                                    <span className="text-xs text-gray-500">{booking.jam_mulai} - {booking.jam_selesai} ({booking.durasi} Menit)</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${statusBadge(booking.status)}`}>
                                                        {booking.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => openDetailModal(booking)}
                                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center text-gray-500">Data booking tidak ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia */}
                        <div className="mt-4 flex justify-center">
                            {bookings.links.map((link, index) => (
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

            {/* Modal Box Detail Booking (Read-Only) */}
            {isDetailModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Detail Booking - {selectedBooking.kode_booking}</h3>
                            <button onClick={closeModals} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div className="bg-gray-50 p-4 rounded-md border">
                                <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">Informasi Pelanggan</h4>
                                <p><span className="text-gray-500">Nama:</span> <span className="font-bold">{selectedBooking.user?.name}</span></p>
                                <p><span className="text-gray-500">No. HP:</span> <span className="font-semibold">{selectedBooking.user?.no_hp || '-'}</span></p>
                                <p><span className="text-gray-500">Email:</span> <span className="font-semibold">{selectedBooking.user?.email}</span></p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md border">
                                <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">Informasi Jadwal</h4>
                                <p><span className="text-gray-500">Unit PS:</span> <span className="font-bold">{selectedBooking.ps?.nama_ps} ({selectedBooking.ps?.jenis})</span></p>
                                <p><span className="text-gray-500">Tanggal Main:</span> <span className="font-semibold">{new Date(selectedBooking.tanggal_main).toLocaleDateString('id-ID')}</span></p>
                                <p><span className="text-gray-500">Waktu:</span> <span className="font-semibold">{selectedBooking.jam_mulai} - {selectedBooking.jam_selesai} ({selectedBooking.durasi} Menit)</span></p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                            <h4 className="font-semibold text-blue-800 mb-2 border-b border-blue-200 pb-1">Status Pembayaran</h4>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <span className="text-gray-600">Total Harga:</span> <span className="font-bold text-gray-900">{formatRupiah(selectedBooking.total_harga)}</span>
                                <span className="text-gray-600">Wajib DP (50%):</span> <span className="font-bold text-gray-900">{formatRupiah(selectedBooking.dp)}</span>
                            </div>
                            
                            {selectedBooking.payments && selectedBooking.payments.length > 0 ? (
                                <div className="mt-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Riwayat Transaksi:</span>
                                    <ul className="mt-1 space-y-1">
                                        {selectedBooking.payments.map((payment) => (
                                            <li key={payment.id} className="text-xs border border-gray-200 bg-white p-2 rounded flex justify-between">
                                                <span><strong className="uppercase">{payment.jenis}</strong> ({payment.metode}) - {payment.payment_reference || '-'}</span>
                                                <span className={`font-bold ${payment.status === 'berhasil' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {formatRupiah(payment.jumlah)} - {payment.status.toUpperCase()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="mt-3 text-xs text-red-500 italic font-semibold">Belum ada riwayat pembayaran yang tercatat.</div>
                            )}
                        </div>

                        {selectedBooking.catatan && (
                            <div className="mb-4">
                                <span className="text-xs font-bold text-gray-500 uppercase">Catatan:</span>
                                <p className="text-sm bg-gray-50 p-2 rounded border mt-1">{selectedBooking.catatan}</p>
                            </div>
                        )}

                        <div className="flex justify-end">
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