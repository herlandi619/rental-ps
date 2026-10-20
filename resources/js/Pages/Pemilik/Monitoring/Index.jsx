import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PemilikLayout from '@/Layouts/PemilikLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, stats, psList, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPs, setSelectedPs] = useState(null);

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
        router.get(route('pemilik.monitoring.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const openDetailModal = (ps) => {
        setSelectedPs(ps);
        setIsDetailModalOpen(true);
    };

    const closeModals = () => {
        setIsDetailModalOpen(false);
        setSelectedPs(null);
    };

    const statusBadge = (status) => {
        switch(status) {
            case 'tersedia': return 'bg-green-100 text-green-700 border-green-200';
            case 'booking': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'sedang_bermain': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'maintenance': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <PemilikLayout user={auth.user}>
            <Head title="Monitoring Operasional" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Ringkasan Operasional PS */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Unit PS</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total_ps}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-green-600 uppercase font-bold">Tersedia</p>
                            <p className="text-2xl font-bold text-green-700">{stats.ps_tersedia}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-blue-600 uppercase font-bold">Sedang Bermain</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.ps_bermain}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-red-600 uppercase font-bold">Maintenance</p>
                            <p className="text-2xl font-bold text-red-700">{stats.ps_maintenance}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-indigo-600 uppercase font-bold">Billing Aktif</p>
                            <p className="text-2xl font-bold text-indigo-700">{stats.billing_aktif}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-yellow-600 uppercase font-bold">Booking Aktif</p>
                            <p className="text-2xl font-bold text-yellow-700">{stats.booking_aktif}</p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Pencarian */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Kondisi Seluruh PS</h2>
                                <p className="text-sm text-gray-500">Monitoring status *real-time* ketersediaan dan pelanggan aktif.</p>
                            </div>
                            
                            <form onSubmit={handleSearch} className="flex w-full md:w-auto mt-4 md:mt-0">
                                <input
                                    type="text"
                                    placeholder="Cari Kode / Nama PS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-r-md hover:bg-gray-200 text-sm font-medium">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Monitoring PS */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Kode PS</th>
                                        <th className="px-4 py-3">Nama Unit</th>
                                        <th className="px-4 py-3">Spesifikasi</th>
                                        <th className="px-4 py-3">Status Saat Ini</th>
                                        <th className="px-4 py-3">Aktivitas Terkini</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {psList.data.length > 0 ? (
                                        psList.data.map((ps) => (
                                            <tr key={ps.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-gray-900">{ps.kode_ps}</td>
                                                <td className="px-4 py-3 text-gray-900 font-bold">{ps.nama_ps}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold">{ps.jenis}</span> <br/>
                                                    <span className="text-xs text-gray-500">{ps.tv || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${statusBadge(ps.status)}`}>
                                                        {ps.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {ps.status === 'sedang_bermain' && ps.billings?.length > 0 ? (
                                                        <div>
                                                            <span className="text-gray-900 font-semibold">{ps.billings[0].customer?.name || 'Walk-in Customer'}</span><br/>
                                                            <span className="text-xs text-blue-600 font-mono">Selesai: {new Date(ps.billings[0].waktu_selesai).toLocaleTimeString('id-ID')}</span>
                                                        </div>
                                                    ) : ps.status === 'booking' && ps.bookings?.length > 0 ? (
                                                        <div>
                                                            <span className="text-gray-900 font-semibold">{ps.bookings[0].user?.name}</span><br/>
                                                            <span className="text-xs text-yellow-600 font-mono">Jadwal: {ps.bookings[0].jam_mulai}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Tidak ada aktivitas</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => openDetailModal(ps)}
                                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors"
                                                    >
                                                        Cek Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center text-gray-500">Data PS tidak ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia */}
                        <div className="mt-4 flex justify-center">
                            {psList.links.map((link, index) => (
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

            {/* Modal Box Detail Aktivitas (Read-Only) */}
            {isDetailModalOpen && selectedPs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Rincian Aktivitas - {selectedPs.nama_ps}</h3>
                            <button onClick={closeModals} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="space-y-4 text-sm">
                            <div className="bg-gray-50 p-4 rounded-md border">
                                <h4 className="font-semibold text-gray-700 mb-3 border-b pb-1">Informasi Unit</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-gray-500">Kode PS:</span> <span className="font-bold">{selectedPs.kode_ps}</span>
                                    <span className="text-gray-500">Jenis:</span> <span className="font-semibold">{selectedPs.jenis}</span>
                                    <span className="text-gray-500">Status:</span> <span className="uppercase font-bold text-indigo-600">{selectedPs.status.replace('_', ' ')}</span>
                                </div>
                            </div>

                            {selectedPs.status === 'sedang_bermain' && selectedPs.billings?.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                    <h4 className="font-semibold text-blue-800 mb-3 border-b border-blue-200 pb-1">Billing Berjalan</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="text-gray-500">Customer:</span> <span className="font-bold">{selectedPs.billings[0].customer?.name || 'Walk-in'}</span>
                                        <span className="text-gray-500">Durasi:</span> <span className="font-semibold">{selectedPs.billings[0].durasi} Menit</span>
                                        <span className="text-gray-500">Waktu Mulai:</span> <span className="font-mono">{new Date(selectedPs.billings[0].waktu_mulai).toLocaleTimeString('id-ID')}</span>
                                        <span className="text-gray-500">Waktu Selesai:</span> <span className="font-mono text-red-600 font-bold">{new Date(selectedPs.billings[0].waktu_selesai).toLocaleTimeString('id-ID')}</span>
                                        <span className="text-gray-500">Operator:</span> <span className="font-semibold">{selectedPs.billings[0].operator?.name}</span>
                                    </div>
                                </div>
                            )}

                            {selectedPs.status === 'booking' && selectedPs.bookings?.length > 0 && (
                                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                                    <h4 className="font-semibold text-yellow-800 mb-3 border-b border-yellow-200 pb-1">Booking Dikonfirmasi Hari Ini</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="text-gray-500">Kode Booking:</span> <span className="font-bold">{selectedPs.bookings[0].kode_booking}</span>
                                        <span className="text-gray-500">Customer:</span> <span className="font-semibold">{selectedPs.bookings[0].user?.name}</span>
                                        <span className="text-gray-500">Jadwal:</span> <span className="font-mono">{selectedPs.bookings[0].jam_mulai} - {selectedPs.bookings[0].jam_selesai}</span>
                                    </div>
                                </div>
                            )}

                            {['tersedia', 'maintenance'].includes(selectedPs.status) && (
                                <div className="text-center py-4 text-gray-500 italic">
                                    Tidak ada aktivitas pelanggan yang sedang berjalan pada unit ini.
                                </div>
                            )}
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