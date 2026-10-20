import React, { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, psList, filters }) {
    const { flash } = usePage().props;
    
    // State Pencarian
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // State Modal Detail PS
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPs, setSelectedPs] = useState(null);

    // Menampilkan flash message menggunakan SweetAlert2
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

    // Handle Pencarian dengan Inertia Router
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('customer.ps.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Control Modal
    const openModal = (ps) => {
        setSelectedPs(ps);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPs(null);
    };

    // Format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    // Pewarnaan Badge Status
    const getStatusBadge = (status) => {
        switch (status) {
            case 'tersedia': return 'bg-green-100 text-green-700';
            case 'booking': return 'bg-yellow-100 text-yellow-700';
            case 'sedang_bermain': return 'bg-blue-100 text-blue-700';
            case 'maintenance': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <CustomerLayout user={auth.user}>
            <Head title="Daftar PlayStation" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Daftar PlayStation Tersedia</h3>
                            
                            <form onSubmit={handleSearch} className="flex mt-4 md:mt-0 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari jenis, nama, atau status..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm font-medium transition">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Daftar PS */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Nama</th>
                                        <th className="px-4 py-3">Jenis</th>
                                        <th className="px-4 py-3">Harga/Jam</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {psList.data.length > 0 ? (
                                        psList.data.map((ps) => (
                                            <tr key={ps.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-4 font-semibold text-gray-900">{ps.nama_ps}</td>
                                                <td className="px-4 py-4 font-bold text-indigo-600">{ps.jenis}</td>
                                                <td className="px-4 py-4">{formatRupiah(ps.harga_per_jam)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusBadge(ps.status)}`}>
                                                        {ps.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button 
                                                        onClick={() => openModal(ps)}
                                                        className="text-white bg-teal-500 hover:bg-teal-600 px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition"
                                                    >
                                                        Lihat Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                                Tidak ada PlayStation yang ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Data */}
                        <div className="mt-4 flex justify-center">
                            {psList.links.map((link, index) => (
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

            {/* Modal Detail PS */}
            {isModalOpen && selectedPs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto px-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Detail Spesifikasi {selectedPs.kode_ps}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Nama Unit</span>
                                <span className="font-semibold text-gray-900">{selectedPs.nama_ps}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Jenis Konsol</span>
                                <span className="font-bold text-indigo-600">{selectedPs.jenis}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Spesifikasi TV</span>
                                <span className="font-semibold text-gray-900">{selectedPs.tv || 'Standar'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Harga Per Jam</span>
                                <span className="font-bold text-gray-900">{formatRupiah(selectedPs.harga_per_jam)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Status Saat Ini</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${getStatusBadge(selectedPs.status)}`}>
                                    {selectedPs.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex flex-col pt-1">
                                <span className="text-gray-500 mb-1">Keterangan Khusus:</span>
                                <p className="text-gray-800 bg-gray-50 p-2 rounded border">
                                    {selectedPs.keterangan || 'Tidak ada keterangan spesifik.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button 
                                type="button" 
                                onClick={closeModal} 
                                className="bg-white hover:bg-gray-100 text-gray-700 py-2 px-4 rounded border text-sm font-medium transition"
                            >
                                Tutup
                            </button>
                            {selectedPs.status === 'tersedia' && (
                                <Link 
                                    href={route('customer.dashboard')} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition shadow-sm"
                                >
                                    Pesan Sekarang
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}