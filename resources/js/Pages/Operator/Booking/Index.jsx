import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, bookings, filters }) {
    const { flash } = usePage().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        if (flash?.message) {
            Swal.fire({
                icon: flash.type || 'info',
                title: flash.type === 'error' ? 'Gagal' : 'Berhasil',
                text: flash.message,
                timer: 3000,
                showConfirmButton: false
            });
        }
    }, [flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('operator.bookings.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const openModal = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const handleAction = (actionRoute, actionName) => {
        Swal.fire({
            title: `Konfirmasi ${actionName}`,
            text: `Apakah Anda yakin ingin memproses ${actionName.toLowerCase()} untuk booking ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Lanjutkan!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                if (actionName === 'Mulai Billing') {
                    router.post(actionRoute, {}, {
                        onSuccess: () => closeModal()
                    });
                } else {
                    router.put(actionRoute, {}, {
                        onSuccess: () => closeModal()
                    });
                }
            }
        });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    const statusBadge = (status) => {
        switch(status) {
            case 'dikonfirmasi': return 'bg-blue-100 text-blue-700';
            case 'menunggu_pembayaran': return 'bg-yellow-100 text-yellow-700';
            case 'selesai': return 'bg-green-100 text-green-700';
            case 'dibatalkan': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <OperatorLayout user={auth.user}>
            <Head title="Manajemen Booking" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 md:mb-0">Daftar Booking Customer</h3>
                            
                            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari Kode, Nama, atau PS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-gray-100 border border-l-0 border-gray-300 px-4 py-2 rounded-r-md hover:bg-gray-200 text-sm font-medium">
                                    Cari
                                </button>
                            </form>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Kode Booking</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Unit PS</th>
                                        <th className="px-4 py-3">Jadwal Bermain</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.data.length > 0 ? (
                                        bookings.data.map((book) => (
                                            <tr key={book.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-gray-900">{book.kode_booking}</td>
                                                <td className="px-4 py-3">{book.user?.name}</td>
                                                <td className="px-4 py-3">{book.ps?.nama_ps}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-medium">{book.tanggal_main}</span> <br/>
                                                    <span className="text-xs text-gray-400">{book.jam_mulai} - {book.jam_selesai}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusBadge(book.status)}`}>
                                                        {book.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => openModal(book)}
                                                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-semibold shadow-sm"
                                                    >
                                                        Detail & Tindakan
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

            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                                Detail Booking - {selectedBooking.kode_booking}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Informasi Customer</h4>
                                <table className="w-full">
                                    <tbody>
                                        <tr><td className="py-1 text-gray-500">Nama</td><td className="font-medium">{selectedBooking.user?.name}</td></tr>
                                        <tr><td className="py-1 text-gray-500">No. HP</td><td className="font-medium">{selectedBooking.user?.no_hp || '-'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Jadwal Bermain</h4>
                                <table className="w-full">
                                    <tbody>
                                        <tr><td className="py-1 text-gray-500">Unit PS</td><td className="font-medium">{selectedBooking.ps?.nama_ps}</td></tr>
                                        <tr><td className="py-1 text-gray-500">Tanggal</td><td className="font-medium">{selectedBooking.tanggal_main}</td></tr>
                                        <tr><td className="py-1 text-gray-500">Waktu</td><td className="font-medium">{selectedBooking.jam_mulai} s/d {selectedBooking.jam_selesai}</td></tr>
                                        <tr><td className="py-1 text-gray-500">Durasi</td><td className="font-medium">{selectedBooking.durasi} Menit</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="md:col-span-2">
                                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Status Keuangan</h4>
                                <div className="bg-gray-50 p-4 rounded-lg border grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 text-xs">Total Harga</p>
                                        <p className="font-bold text-lg">{formatRupiah(selectedBooking.total_harga)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">DP Dibayarkan</p>
                                        <p className="font-bold text-lg text-green-600">{formatRupiah(selectedBooking.dp)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 text-xs mb-1">Riwayat Pembayaran Terkait:</p>
                                        {selectedBooking.payments && selectedBooking.payments.length > 0 ? (
                                            <ul className="text-xs space-y-1">
                                                {selectedBooking.payments.map(pay => (
                                                    <li key={pay.id} className="flex justify-between border-b border-gray-200 pb-1">
                                                        <span className="uppercase">{pay.metode} ({pay.jenis})</span>
                                                        <span className={pay.status === 'berhasil' ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>
                                                            {formatRupiah(pay.jumlah)} - {pay.status}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-gray-400">Belum ada pembayaran tercatat.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t flex flex-wrap justify-between gap-3 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                            <div className="flex gap-2">
                                {selectedBooking.status === 'menunggu_pembayaran' && (
                                    <button 
                                        onClick={() => handleAction(route('operator.bookings.konfirmasi', selectedBooking.id), 'Konfirmasi Booking')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors shadow-sm"
                                    >
                                        Konfirmasi Booking (DP Masuk)
                                    </button>
                                )}
                                
                                {selectedBooking.status === 'dikonfirmasi' && (
                                    <button 
                                        onClick={() => handleAction(route('operator.bookings.mulai-billing', selectedBooking.id), 'Mulai Billing')}
                                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors shadow-sm"
                                    >
                                        Verifikasi Datang & Mulai Billing
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex gap-2 ml-auto">
                                {['menunggu_pembayaran', 'dikonfirmasi'].includes(selectedBooking.status) && (
                                    <button 
                                        onClick={() => handleAction(route('operator.bookings.batal', selectedBooking.id), 'Pembatalan Booking')}
                                        className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded text-sm font-medium transition-colors"
                                    >
                                        Batalkan Booking
                                    </button>
                                )}
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="bg-white hover:bg-gray-100 text-gray-800 py-2 px-4 rounded border text-sm font-medium transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </OperatorLayout>
    );
}