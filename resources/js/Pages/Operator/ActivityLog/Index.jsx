import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, logs, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // SweetAlert Flash Message
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

    // Handle Search Filter via Inertia
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('operator.activity-logs.index'), { 
            search: searchTerm 
        }, { preserveState: true, replace: true });
    };

    return (
        <OperatorLayout user={auth.user}>
            <Head title="Activity Log" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Filter Pencarian */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Riwayat Aktivitas</h3>
                                <p className="text-sm text-gray-500">Log sistem terkait perubahan data, transaksi, dan billing.</p>
                            </div>
                            
                            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari user / aktivitas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-blue-600 border border-transparent text-white px-4 py-2 rounded-r-md hover:bg-blue-700 text-sm font-medium transition-colors">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Data Activity Log */}
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Waktu</th>
                                        <th className="px-4 py-3">Aktor (Operator/User)</th>
                                        <th className="px-4 py-3">Aktivitas</th>
                                        <th className="px-4 py-3">Deskripsi</th>
                                        <th className="px-4 py-3 text-center">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="font-semibold text-gray-800">{new Date(log.created_at).toLocaleDateString('id-ID')}</span> <br/>
                                                    <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-blue-600">
                                                    {log.user?.name || 'Sistem / Anonim'}
                                                </td>
                                                <td className="px-4 py-3 font-bold uppercase text-xs tracking-wider text-gray-700">
                                                    {log.activity}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {log.description || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-xs bg-gray-50">
                                                    {log.ip_address || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-gray-500">Data aktivitas belum ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia (5 per Halaman) */}
                        <div className="mt-4 flex justify-center">
                            {logs.links.map((link, index) => (
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
        </OperatorLayout>
    );
}