import React, { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, stats, billings, activities, filters }) {
    const { flash } = usePage().props;
    
    // State Pencarian
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBilling, setSelectedBilling] = useState(null);

    // Form Handle untuk aksi Selesaikan Billing
    const { put, processing } = useForm();

    // SweetAlert untuk Flash Message dari Inertia
    useEffect(() => {
        if (flash?.message) {
            Swal.fire({
                icon: flash.type || 'success',
                title: 'Informasi',
                text: flash.message,
                timer: 2500,
                showConfirmButton: false
            });
        }
    }, [flash]);

    // Handle form pencarian via Inertia
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('operator.dashboard'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Buka & Tutup Modal Box
    const openModal = (billing) => {
        setSelectedBilling(billing);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBilling(null);
    };

    // Handle Submit Selesaikan Billing
    const handleSelesaikan = (e) => {
        e.preventDefault();
        put(route('operator.dashboard.selesaikan-billing', selectedBilling.id), {
            onSuccess: () => closeModal(),
        });
    };

    // Format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    return (
        <OperatorLayout user={auth.user}>
            <Head title="Dashboard Operator" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Grid Statistik 3 Kolom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm">Billing Berjalan</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.billing_berjalan} Sesi</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm">Booking Hari Ini</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.booking_hari_ini} Antrean</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm">Status PS (Sedia / Main)</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.ps_tersedia} / {stats.ps_bermain}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-sm">Pendapatan Hari Ini</p>
                            <p className="text-2xl font-bold text-green-600">{formatRupiah(stats.pembayaran_hari_ini)}</p>
                        </div>
                    </div>

                    {/* Alert Butuh Tindakan / Hampir Selesai */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.booking_butuh_tindakan > 0 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
                                <p className="text-sm text-yellow-700 font-semibold">Terdapat {stats.booking_butuh_tindakan} booking butuh tindakan (Verifikasi DP).</p>
                            </div>
                        )}
                        {stats.billing_hampir_selesai > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                                <p className="text-sm text-red-700 font-semibold">Perhatian! Ada {stats.billing_hampir_selesai} PS yang waktunya akan habis (&lt; 15 menit).</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tabel Monitoring Billing (Mengambil 2/3 layar) */}
                        <div className="lg:col-span-2 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-800">Sesi PS Berjalan</h3>
                                    
                                    <form onSubmit={handleSearch} className="flex mt-4 md:mt-0">
                                        <input
                                            type="text"
                                            placeholder="Cari Customer/PS..."
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
                                                <th className="px-4 py-3">Unit PS</th>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3">Durasi</th>
                                                <th className="px-4 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {billings.data.length > 0 ? (
                                                billings.data.map((billing) => (
                                                    <tr key={billing.id} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-4 py-4 font-bold text-gray-900">{billing.ps?.nama_ps}</td>
                                                        <td className="px-4 py-4">{billing.customer?.name || 'Walk-in'}</td>
                                                        <td className="px-4 py-4">{billing.durasi} Menit</td>
                                                        <td className="px-4 py-4 text-center">
                                                            <button 
                                                                onClick={() => openModal(billing)}
                                                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-semibold shadow-sm"
                                                            >
                                                                Selesaikan
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">Tidak ada sesi PS yang berjalan.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="mt-4 flex justify-center">
                                    {billings.links.map((link, index) => (
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

                        {/* List Aktivitas Terbaru (Mengambil 1/3 layar) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Aktivitas Terbaru</h3>
                            <ul className="space-y-4">
                                {activities.length > 0 ? (
                                    activities.map(log => (
                                        <li key={log.id} className="text-sm">
                                            <p className="font-semibold text-gray-800">{log.activity}</p>
                                            <p className="text-gray-500 text-xs">{log.description}</p>
                                            <span className="text-xs text-blue-500">{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Belum ada aktivitas.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Box: Selesaikan Billing */}
            {isModalOpen && selectedBilling && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Konfirmasi Selesai</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>
                        
                        <form onSubmit={handleSelesaikan}>
                            <div className="space-y-3 mb-6 text-sm">
                                <p className="text-gray-600">Anda yakin ingin mengakhiri sesi billing ini?</p>
                                <div className="bg-gray-50 p-3 rounded border">
                                    <p><strong>PS:</strong> {selectedBilling.ps?.nama_ps}</p>
                                    <p><strong>Customer:</strong> {selectedBilling.customer?.name || 'Walk-in'}</p>
                                    <p><strong>Total Tagihan:</strong> {formatRupiah(selectedBilling.total_harga)}</p>
                                </div>
                                <p className="text-xs text-red-500 font-semibold">
                                    *Pastikan customer sudah membayar lunas sebelum mengakhiri.
                                </p>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded border border-gray-300 text-sm"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-sm text-sm disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : 'Ya, Selesaikan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </OperatorLayout>
    );
}