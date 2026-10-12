import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, notifications, filters }) {
    const { flash } = usePage().props;
    const [filterType, setFilterType] = useState(filters.type || '');

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

    const handleFilter = (type) => {
        setFilterType(type);
        router.get(route('operator.notifications.index'), { type }, { preserveState: true, replace: true });
    };

    const handleMarkAsRead = (id) => {
        router.put(route('operator.notifications.read', id));
    };

    const handleMarkAllAsRead = () => {
        router.put(route('operator.notifications.readAll'));
    };

    const typeBadge = (type) => {
        switch(type) {
            case 'booking': return 'bg-blue-100 text-blue-700';
            case 'payment': return 'bg-green-100 text-green-700';
            case 'billing': return 'bg-orange-100 text-orange-700';
            default: return 'bg-purple-100 text-purple-700';
        }
    };

    return (
        <OperatorLayout user={auth.user}>
            <Head title="Manajemen Notifikasi" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Filter Kategori */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleFilter('')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Semua</button>
                                <button onClick={() => handleFilter('booking')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'booking' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Booking</button>
                                <button onClick={() => handleFilter('payment')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Payment</button>
                                <button onClick={() => handleFilter('billing')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'billing' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Billing</button>
                                <button onClick={() => handleFilter('system')} className={`px-3 py-1.5 rounded text-xs font-semibold ${filterType === 'system' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>System</button>
                            </div>

                            <button onClick={handleMarkAllAsRead} className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold py-2 px-4 rounded shadow">
                                Tandai Semua Dibaca
                            </button>
                        </div>

                        {/* Daftar List Notifikasi */}
                        <div className="space-y-4">
                            {notifications.data.length > 0 ? (
                                notifications.data.map((notif) => (
                                    <div key={notif.id} className={`p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${notif.is_read ? 'bg-white border-gray-200' : 'bg-blue-50/50 border-blue-200'}`}>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeBadge(notif.type)}`}>
                                                    {notif.type}
                                                </span>
                                                <h4 className="font-bold text-gray-900">{notif.title}</h4>
                                                {!notif.is_read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                                            </div>
                                            <p className="text-sm text-gray-600">{notif.message}</p>
                                            <span className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString('id-ID')}</span>
                                        </div>

                                        {!notif.is_read && (
                                            <button onClick={() => handleMarkAsRead(notif.id)} className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-3 py-1.5 rounded shadow-sm whitespace-nowrap">
                                                Tandai Dibaca
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm">Tidak ada notifikasi ditemukan.</div>
                            )}
                        </div>

                        {/* Paginasi Inertia (5 per Halaman) */}
                        <div className="mt-6 flex justify-center">
                            {notifications.links.map((link, index) => (
                                <button key={index} onClick={(e) => { e.preventDefault(); if (link.url) router.get(link.url); }} disabled={!link.url}
                                    className={`px-3 py-1 mx-1 border rounded text-xs font-medium transition-colors ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </OperatorLayout>
    );
}