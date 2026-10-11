import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PemilikLayout from '@/Layouts/PemilikLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, stats, payments, filters }) {
    const { flash } = usePage().props;
    
    // State Pencarian
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // State Modal Detail
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

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
        router.get(route('pemilik.dashboard'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Modal Control
    const openModal = (payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    return (
        <PemilikLayout user={auth.user}>
            <Head title="Dashboard Pemilik Rental" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* 1. Ringkasan Statistik Bisnis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs font-semibold uppercase">Pendapatan Hari Ini</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{formatRupiah(stats.pendapatan_hari_ini)}</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs font-semibold uppercase">Transaksi Hari Ini</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.transaksi_hari_ini} Sesi</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs font-semibold uppercase">Booking Hari Ini</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.booking_hari_ini} Antrean</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs font-semibold uppercase">Total Customer</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.jumlah_customer} Orang</p>
                        </div>
                    </div>

                    {/* 2. Monitoring Status PlayStation & Billing */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500 text-xs">PS Sedang Digunakan</p>
                            <p className="text-xl font-bold text-orange-600">{stats.ps_digunakan} Unit</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500 text-xs">PS Tersedia</p>
                            <p className="text-xl font-bold text-green-600">{stats.ps_tersedia} Unit</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500 text-xs">PS Maintenance</p>
                            <p className="text-xl font-bold text-red-600">{stats.ps_maintenance} Unit</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500 text-xs">Billing Aktif</p>
                            <p className="text-xl font-bold text-blue-600">{stats.billing_berjalan} Sesi</p>
                        </div>
                    </div>

                    {/* 3. Tabel Transaksi / Laporan (Search & Paginate 5) */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Laporan & Riwayat Transaksi</h3>
                            
                            <form onSubmit={handleSearch} className="flex mt-4 md:mt-0">
                                <input
                                    type="text"
                                    placeholder="Cari Customer / Ref..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-60"
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
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Metode</th>
                                        <th className="px-4 py-3">Jenis</th>
                                        <th className="px-4 py-3">Jumlah</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.length > 0 ? (
                                        payments.data.map((pay) => (
                                            <tr key={pay.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-4 font-semibold text-gray-900">{pay.user?.name || 'Walk-in'}</td>
                                                <td className="px-4 py-4 uppercase text-xs font-bold text-indigo-600">{pay.metode}</td>
                                                <td className="px-4 py-4 uppercase text-xs">{pay.jenis}</td>
                                                <td className="px-4 py-4 font-bold text-gray-800">{formatRupiah(pay.jumlah)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        pay.status === 'berhasil' ? 'bg-green-100 text-green-700' :
                                                        pay.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {pay.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button 
                                                        onClick={() => openModal(pay)}
                                                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-semibold shadow-sm"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center text-gray-500">Data transaksi tidak ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia */}
                        <div className="mt-4 flex justify-center">
                            {payments.links.map((link, index) => (
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

            {/* Modal Box: Detail Transaksi (Read-Only untuk Pemilik) */}
            {isModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Rincian Transaksi</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Customer</span>
                                <span className="font-semibold text-gray-900">{selectedPayment.user?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Metode Pembayaran</span>
                                <span className="font-semibold uppercase text-gray-900">{selectedPayment.metode}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Jenis Pembayaran</span>
                                <span className="font-semibold uppercase text-gray-900">{selectedPayment.jenis}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Nominal</span>
                                <span className="font-bold text-green-600">{formatRupiah(selectedPayment.jumlah)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Status</span>
                                <span className="font-semibold uppercase text-gray-800">{selectedPayment.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Waktu Bayar</span>
                                <span className="font-semibold text-gray-800">{selectedPayment.paid_at ? new Date(selectedPayment.paid_at).toLocaleString('id-ID') : '-'}</span>
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                            <button 
                                type="button" 
                                onClick={closeModal} 
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border text-sm font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PemilikLayout>
    );
}