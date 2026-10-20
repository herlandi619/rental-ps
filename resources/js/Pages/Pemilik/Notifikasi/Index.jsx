import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PemilikLayout from '@/Layouts/PemilikLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, notifications, stats, filters }) {
    const { flash } = usePage().props;
    
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterType, setFilterType] = useState(filters.type || '');
    
    // State Modal Detail
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);

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
        router.get(route('pemilik.notifications.index'), { 
            search: searchTerm, 
            type: filterType 
        }, { preserveState: true, replace: true });
    };

    const handleFilterType = (type) => {
        setFilterType(type);
        router.get(route('pemilik.notifications.index'), { 
            search: searchTerm, 
            type: type 
        }, { preserveState: true, replace: true });
    };

    const markAsRead = (id) => {
        router.put(route('pemilik.notifications.read', id), {}, { preserveScroll: true });
    };

    const markAllAsRead = () => {
        router.put(route('pemilik.notifications.readAll'), {}, { preserveScroll: true });
    };

    const openDetailModal = (notif) => {
        setSelectedNotif(notif);
        setIsModalOpen(true);
        if (!notif.is_read) {
            markAsRead(notif.id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNotif(null);
    };

    const typeBadge = (type) => {
        switch(type) {
            case 'booking': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'payment': return 'bg-green-100 text-green-700 border-green-200';
            case 'billing': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-purple-100 text-purple-700 border-purple-200';
        }
    };

    return (
        <PemilikLayout user={auth.user}>
            <Head title="Pusat Notifikasi Pemilik" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Ringkasan & Aksi Cepat */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Pusat Notifikasi & Sistem</h2>
                            <p className="text-sm text-gray-500">Anda memiliki <span className="font-bold text-red-600">{stats.total_unread}</span> notifikasi belum dibaca.</p>
                        </div>
                        {stats.total_unread > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded shadow transition"
                            >
                                Tandai Semua Dibaca
                            </button>
                        )}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Filter Kategori & Search Bar */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleFilterType('')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === '' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Semua</button>
                                <button onClick={() => handleFilterType('booking')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'booking' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Booking</button>
                                <button onClick={() => handleFilterType('payment')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'payment' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Payment</button>
                                <button onClick={() => handleFilterType('billing')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'billing' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Billing</button>
                                <button onClick={() => handleFilterType('system')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'system' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>System</button>
                            </div>

                            <form onSubmit={handleSearch} className="flex w-full lg:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari Pesan..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-indigo-500 rounded-l-md shadow-sm text-sm w-full lg:w-60"
                                />
                                <button type="submit" className="bg-gray-100 border border-l-0 border-gray-300 px-4 py-2 rounded-r-md hover:bg-gray-200 text-sm font-medium">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Notifikasi */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 w-40">Waktu</th>
                                        <th className="px-4 py-3 w-28">Kategori</th>
                                        <th className="px-4 py-3">Judul & Pesan</th>
                                        <th className="px-4 py-3 text-center w-24">Status</th>
                                        <th className="px-4 py-3 text-center w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.data.length > 0 ? (
                                        notifications.data.map((notif) => (
                                            <tr key={notif.id} className={`border-b hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-indigo-50/40 font-semibold' : 'bg-white text-gray-600'}`}>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                                    {new Date(notif.created_at).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${typeBadge(notif.type)}`}>
                                                        {notif.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 cursor-pointer" onClick={() => openDetailModal(notif)}>
                                                    <p className="text-gray-900 font-bold">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-md">{notif.message}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {!notif.is_read ? (
                                                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">Belum</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Dibaca</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => openDetailModal(notif)}
                                                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition"
                                                    >
                                                        Lihat
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-gray-500 italic">Tidak ada notifikasi ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia (5 per Halaman) */}
                        <div className="mt-4 flex justify-center">
                            {notifications.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (link.url) router.get(link.url);
                                    }}
                                    disabled={!link.url}
                                    className={`px-3 py-1 mx-1 border rounded text-xs font-medium transition-colors ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Detail Notifikasi (Read-Only) */}
            {isModalOpen && selectedNotif && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10 px-4">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Detail Notifikasi</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${typeBadge(selectedNotif.type)}`}>
                                    {selectedNotif.type}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">{new Date(selectedNotif.created_at).toLocaleString('id-ID')}</span>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-base text-gray-900 mb-1">{selectedNotif.title}</h4>
                                <div className="p-4 bg-gray-50 border rounded-md text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                    {selectedNotif.message}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
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
        </PemilikLayout>
    );
}