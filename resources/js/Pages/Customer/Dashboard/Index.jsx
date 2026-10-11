import React, { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, activeBilling, availablePs, notifications, bookings, filters }) {
    const { flash } = usePage().props;
    
    // State Pencarian
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // State Modal Booking
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inertia Form untuk Booking Baru
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        ps_id: '',
        tanggal_main: '',
        jam_mulai: '',
        durasi: '60' // default 1 jam (60 menit)
    });

    // SweetAlert Flash Handler
    useEffect(() => {
        if (flash?.message) {
            Swal.fire({
                icon: flash.type || 'success',
                title: 'Informasi',
                text: flash.message,
                timer: 3000,
                showConfirmButton: false
            });
        }
    }, [flash]);

    // Handle Search via Inertia
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('customer.dashboard'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Modal Control
    const openModal = () => {
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmitBooking = (e) => {
        e.preventDefault();
        post(route('customer.booking.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    return (
        <CustomerLayout user={auth.user}>
            <Head title="Dashboard Customer" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* 1. Informasi Durasi Billing Berjalan (Jika Ada) */}
                    {activeBilling && (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <span className="bg-blue-500 text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">Sesi Bermain Aktif</span>
                                <h3 className="text-xl font-bold mt-2">Unit: {activeBilling.ps?.nama_ps}</h3>
                                <p className="text-sm opacity-90">Selesai pada: {new Date(activeBilling.waktu_selesai).toLocaleTimeString('id-ID')}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm bg-white text-blue-700 px-4 py-2 rounded-lg font-bold shadow">
                                    Durasi: {activeBilling.durasi} Menit
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 2. Ringkasan Akun & Notifikasi Terbaru */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Selamat Datang, {auth.user.name}!</h3>
                            <p className="text-gray-600 text-sm mb-4">Kelola pemesanan PlayStation Anda, lakukan pembayaran DP via Xendit, dan pantau riwayat bermain dengan mudah.</p>
                            <button 
                                onClick={openModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md shadow text-sm transition-colors"
                            >
                                + Buat Booking Baru
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center justify-between">
                                <span>Notifikasi Terbaru</span>
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{notifications.length}</span>
                            </h4>
                            <div className="space-y-3">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="text-xs border-b pb-2">
                                            <p className="font-semibold text-gray-800">{notif.title}</p>
                                            <p className="text-gray-500 truncate">{notif.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400">Tidak ada notifikasi baru.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Informasi Ketersediaan PS */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Daftar PlayStation Tersedia</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            {availablePs.length > 0 ? (
                                availablePs.map(ps => (
                                    <div key={ps.id} className="border rounded-lg p-4 text-center bg-gray-50 hover:shadow transition-shadow">
                                        <p className="font-bold text-gray-900">{ps.nama_ps}</p>
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">{ps.jenis}</span>
                                        <p className="text-xs text-gray-500 mt-2">{formatRupiah(ps.harga_per_jam)}/jam</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 col-span-full">Semua unit PS sedang penuh atau dalam pemeliharaan.</p>
                            )}
                        </div>
                    </div>

                    {/* 4. Tabel Booking Saya (Search & Paginate 5) */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Riwayat & Status Booking Saya</h3>
                            
                            <form onSubmit={handleSearch} className="flex mt-4 md:mt-0">
                                <input
                                    type="text"
                                    placeholder="Cari Kode / PS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-56"
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
                                        <th className="px-4 py-3">Unit PS</th>
                                        <th className="px-4 py-3">Jadwal Main</th>
                                        <th className="px-4 py-3">Total / DP (50%)</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.data.length > 0 ? (
                                        bookings.data.map((book) => (
                                            <tr key={book.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-4 font-bold text-gray-900">{book.kode_booking}</td>
                                                <td className="px-4 py-4">{book.ps?.nama_ps}</td>
                                                <td className="px-4 py-4">{book.tanggal_main} ({book.jam_mulai})</td>
                                                <td className="px-4 py-4">
                                                    {formatRupiah(book.total_harga)} <br/>
                                                    <span className="text-xs text-gray-400">DP: {formatRupiah(book.dp)}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        book.status === 'dikonfirmasi' ? 'bg-green-100 text-green-700' :
                                                        book.status === 'menunggu_pembayaran' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {book.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-4 text-center text-gray-500">Belum ada data booking.</td>
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
                                    className={`px-3 py-1.5 mx-1 border rounded text-xs ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Box: Buat Booking */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Form Booking Online</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmitBooking}>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Pilih Unit PlayStation</label>
                                    <select 
                                        value={data.ps_id} 
                                        onChange={e => setData('ps_id', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                    >
                                        <option value="">-- Pilih Unit PS --</option>
                                        {availablePs.map(ps => (
                                            <option key={ps.id} value={ps.id}>{ps.nama_ps} ({ps.jenis}) - {formatRupiah(ps.harga_per_jam)}/jam</option>
                                        ))}
                                    </select>
                                    {errors.ps_id && <span className="text-red-500 text-xs">{errors.ps_id}</span>}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Tanggal Main</label>
                                    <input 
                                        type="date" 
                                        value={data.tanggal_main} 
                                        onChange={e => setData('tanggal_main', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                    />
                                    {errors.tanggal_main && <span className="text-red-500 text-xs">{errors.tanggal_main}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Jam Mulai</label>
                                        <input 
                                            type="time" 
                                            value={data.jam_mulai} 
                                            onChange={e => setData('jam_mulai', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                        />
                                        {errors.jam_mulai && <span className="text-red-500 text-xs">{errors.jam_mulai}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Durasi</label>
                                        <select 
                                            value={data.durasi} 
                                            onChange={e => setData('durasi', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                        >
                                            <option value="30">30 Menit</option>
                                            <option value="60">1 Jam</option>
                                            <option value="120">2 Jam</option>
                                            <option value="180">3 Jam</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-sm text-sm font-medium disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : 'Buat Booking & DP'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}