import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, bookings, filters }) {
    const { flash } = usePage().props;
    
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    
    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

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

    // Handle Pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('customer.bookings.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Buka Tutup Modal
    const openDetailModal = (booking) => {
        setSelectedBooking(booking);
        setIsDetailModalOpen(true);
    };

    const closeModal = () => {
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
    };

    // Aksi Batal Booking
    const handleCancel = (id) => {
        Swal.fire({
            title: 'Batalkan Booking?',
            text: 'Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak bisa dikembalikan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Batalkan!',
            cancelButtonText: 'Kembali'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('customer.bookings.cancel', id), {}, {
                    onSuccess: () => closeModal()
                });
            }
        });
    };

    // Helpers
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    const statusBadge = (status) => {
        switch(status) {
            case 'menunggu_pembayaran': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'dikonfirmasi': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'selesai': return 'bg-green-100 text-green-700 border border-green-200';
            case 'dibatalkan': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <CustomerLayout user={auth.user}>
            <Head title="Booking Saya" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Pencarian */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Riwayat Booking Saya</h3>
                            
                            <form onSubmit={handleSearch} className="flex mt-4 md:mt-0 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari Kode atau Nama PS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm font-medium transition-colors">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Booking */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Kode Booking</th>
                                        <th className="px-4 py-3">Unit PS</th>
                                        <th className="px-4 py-3">Jadwal Bermain</th>
                                        <th className="px-4 py-3">Total Tagihan</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.data.length > 0 ? (
                                        bookings.data.map((booking) => (
                                            <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-4 font-bold text-gray-900">{booking.kode_booking}</td>
                                                <td className="px-4 py-4">
                                                    <span className="font-semibold text-indigo-700">{booking.ps?.nama_ps}</span><br />
                                                    <span className="text-xs text-gray-500">{booking.ps?.jenis}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="font-medium text-gray-800">{new Date(booking.tanggal_main).toLocaleDateString('id-ID')}</span><br />
                                                    <span className="text-xs text-gray-500">{booking.jam_mulai} - {booking.jam_selesai} ({booking.durasi} Menit)</span>
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-gray-900">
                                                    {formatRupiah(booking.total_harga)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusBadge(booking.status)}`}>
                                                        {booking.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button 
                                                        onClick={() => openDetailModal(booking)}
                                                        className="text-white bg-teal-500 hover:bg-teal-600 px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition"
                                                    >
                                                        Lihat Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500 italic">
                                                Belum ada riwayat booking ditemukan.
                                            </td>
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
                                    className={`px-3 py-1.5 mx-1 border rounded text-xs transition ${
                                        link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal Detail Booking (Read-Only & Action Cancel) */}
            {isDetailModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto px-4">
                    <div className="bg-white rounded-lg w-full max-w-xl p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Detail Kode: {selectedBooking.kode_booking}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div className="bg-gray-50 p-4 rounded-md border">
                                <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">Detail PlayStation</h4>
                                <p><span className="text-gray-500">Unit PS:</span> <span className="font-bold text-indigo-700">{selectedBooking.ps?.nama_ps}</span></p>
                                <p><span className="text-gray-500">Jenis:</span> <span className="font-semibold">{selectedBooking.ps?.jenis}</span></p>
                                <p><span className="text-gray-500">TV:</span> <span className="font-semibold">{selectedBooking.ps?.tv || 'Standar'}</span></p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md border">
                                <h4 className="font-semibold text-gray-700 mb-2 border-b pb-1">Jadwal Bermain</h4>
                                <p><span className="text-gray-500">Tanggal:</span> <span className="font-semibold">{new Date(selectedBooking.tanggal_main).toLocaleDateString('id-ID')}</span></p>
                                <p><span className="text-gray-500">Waktu:</span> <span className="font-semibold">{selectedBooking.jam_mulai} - {selectedBooking.jam_selesai}</span></p>
                                <p><span className="text-gray-500">Durasi:</span> <span className="font-semibold text-gray-900">{selectedBooking.durasi} Menit</span></p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                            <h4 className="font-semibold text-blue-800 mb-2 border-b border-blue-200 pb-1">Rincian Pembayaran</h4>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                    <span className="block text-gray-500 text-xs">Total Harga</span>
                                    <span className="font-bold text-gray-900 text-base">{formatRupiah(selectedBooking.total_harga)}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs">Kewajiban DP (50%)</span>
                                    <span className="font-bold text-blue-700 text-base">{formatRupiah(selectedBooking.dp)}</span>
                                </div>
                            </div>

                            <span className="text-xs font-bold text-gray-500 uppercase">Riwayat Transaksi:</span>
                            {selectedBooking.payments && selectedBooking.payments.length > 0 ? (
                                <ul className="mt-1 space-y-1">
                                    {selectedBooking.payments.map((payment) => (
                                        <li key={payment.id} className="text-xs border border-gray-200 bg-white p-2 rounded flex justify-between items-center">
                                            <span>
                                                <strong className="uppercase">{payment.jenis}</strong> via {payment.metode} 
                                            </span>
                                            <span className={`font-bold ${payment.status === 'berhasil' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {formatRupiah(payment.jumlah)} - {payment.status.toUpperCase()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-red-500 italic mt-1">Belum ada transaksi pembayaran yang tercatat.</p>
                            )}
                        </div>

                        {selectedBooking.catatan && (
                            <div className="mb-4">
                                <span className="text-xs font-bold text-gray-500 uppercase">Catatan:</span>
                                <p className="text-sm bg-gray-50 p-2 rounded border mt-1">{selectedBooking.catatan}</p>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t flex justify-between items-center">
                            <div>
                                {selectedBooking.status === 'menunggu_pembayaran' && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleCancel(selectedBooking.id)}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium py-2 px-4 rounded text-sm transition shadow-sm"
                                    >
                                        Batalkan Pesanan
                                    </button>
                                )}
                            </div>
                            <button 
                                type="button" 
                                onClick={closeModal} 
                                className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded text-sm transition shadow-sm"
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