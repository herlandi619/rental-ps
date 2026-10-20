import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ payments, pendingBookings, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            Swal.fire('Berhasil!', flash.success, 'success');
        } else if (flash?.error) {
            Swal.fire('Gagal!', flash.error, 'error');
        }
    }, [flash]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('customer.payments.index'), { search }, { preserveState: true, replace: true });
    };

    const openModal = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedBooking(null);
        setIsModalOpen(false);
    };

    const handlePay = (e) => {
        e.preventDefault();
        
        router.post(route('customer.payments.pay', selectedBooking.id), {}, {
            onStart: () => {
                closeModal();
                Swal.fire({
                    title: 'Memproses...',
                    text: 'Mengarahkan ke Xendit Payment Gateway',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
            },
            onFinish: () => {
                Swal.close();
            }
        });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
    };

    // Helper untuk format Tanggal Indonesia (e.g. 10 Okt 2026)
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    // Helper untuk format Jam (e.g. 20:00)
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    return (
        <CustomerLayout>
            <Head title="Pembayaran & Tagihan" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
                
                {/* Bagian Tagihan Menunggu Pembayaran */}
                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-yellow-400">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Tagihan Menunggu Pembayaran</h2>
                    {pendingBookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingBookings.map((booking) => (
                                <div key={booking.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 flex flex-col justify-between shadow-sm">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <span className="font-bold text-gray-800 text-base">{booking.kode_booking}</span>
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full font-semibold">Menunggu DP</span>
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 space-y-1 pt-1">
                                            <p className="flex items-center gap-1">
                                                <span className="font-medium text-gray-700">Tanggal:</span> {formatDate(booking.tanggal_main)}
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <span className="font-medium text-gray-700">Jam Play:</span> {formatTime(booking.jam_mulai)} - {formatTime(booking.jam_selesai)} WIB
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <span className="font-medium text-gray-700">Unit PS:</span> {booking.ps?.nama_ps || '-'}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t flex justify-between items-baseline">
                                            <div>
                                                <span className="text-xs text-gray-500 block">Total Biaya</span>
                                                <span className="text-sm font-semibold text-gray-700">{formatRupiah(booking.total_harga)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-blue-600 font-semibold block">Wajib DP (50%)</span>
                                                <span className="text-lg font-bold text-blue-700">{formatRupiah(booking.dp)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => openModal(booking)}
                                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-md transition shadow-sm"
                                    >
                                        Bayar DP Sekarang
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Tidak ada tagihan yang menunggu pembayaran saat ini.</p>
                    )}
                </div>

                {/* Bagian Riwayat Pembayaran */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Riwayat Pembayaran</h2>
                        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                            <input 
                                type="text" 
                                placeholder="Cari Kode atau Ref..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                            />
                            <button type="submit" className="bg-gray-800 text-white px-4 py-1.5 rounded-md hover:bg-gray-700 text-sm font-medium">
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-sm">
                                    <th className="p-3 border-b">Referensi</th>
                                    <th className="p-3 border-b">Kode Booking</th>
                                    <th className="p-3 border-b">Jenis</th>
                                    <th className="p-3 border-b">Metode</th>
                                    <th className="p-3 border-b">Jumlah</th>
                                    <th className="p-3 border-b">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.data.length > 0 ? (
                                    payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 text-sm text-gray-700 border-b">
                                            <td className="p-3 font-mono font-medium">{payment.payment_reference || '-'}</td>
                                            <td className="p-3 font-medium">{payment.booking?.kode_booking || '-'}</td>
                                            <td className="p-3 uppercase">{payment.jenis}</td>
                                            <td className="p-3 capitalize">{payment.metode.replace('_', ' ')}</td>
                                            <td className="p-3 font-semibold text-gray-900">{formatRupiah(payment.jumlah)}</td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    payment.status === 'berhasil' ? 'bg-green-100 text-green-700' :
                                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {payment.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-500 italic">Data pembayaran tidak ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payments.links && payments.data.length > 0 && (
                        <div className="mt-5 flex flex-wrap justify-center gap-1">
                            {payments.links.map((link, index) => (
                                <Link 
                                    key={index} 
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 border rounded text-xs ${
                                        link.active ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 font-medium'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Pembayaran */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
                    <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Konfirmasi Pembayaran</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handlePay}>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-3">
                                    Anda akan melakukan pembayaran DP untuk kode booking <strong className="text-gray-800">{selectedBooking.kode_booking}</strong>.
                                </p>
                                <div className="bg-blue-50 p-4 rounded-lg mb-3 border border-blue-100 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Tagihan:</span>
                                        <span className="font-semibold text-gray-800">{formatRupiah(selectedBooking.total_harga)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Sisa Pelunasan Nanti:</span>
                                        <span className="font-semibold text-gray-800">{formatRupiah(selectedBooking.total_harga - selectedBooking.dp)}</span>
                                    </div>
                                    <hr className="border-blue-200 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-800 font-bold text-sm">DP yang harus dibayar:</span>
                                        <span className="text-lg font-bold text-blue-700">{formatRupiah(selectedBooking.dp)}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 text-center">Pembayaran akan diteruskan secara otomatis via Gateway Xendit.</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-5">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-bold shadow-sm">Lanjut Bayar</button>
                            </div>
                        </form> 
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}