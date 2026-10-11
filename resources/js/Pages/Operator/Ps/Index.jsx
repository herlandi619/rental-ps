import React, { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, psList, filters }) {
    const { flash } = usePage().props;

    // State Search
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form Inertia (tanpa Fetch API)
    const { data, setData, post, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        kode_ps: '',
        nama_ps: '',
        jenis: 'PS5',
        tv: '',
        harga_per_jam: '',
        status: 'tersedia',
        keterangan: ''
    });

    // Alert Flash Session
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

    // Handle Pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('operator.ps.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Buka Modal Tambah
    const openAddModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // Buka Modal Edit
    const openEditModal = (ps) => {
        setIsEditMode(true);
        setEditingId(ps.id);
        setData({
            kode_ps: ps.kode_ps,
            nama_ps: ps.nama_ps,
            jenis: ps.jenis,
            tv: ps.tv || '',
            harga_per_jam: ps.harga_per_jam,
            status: ps.status,
            keterangan: ps.keterangan || ''
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    // Handle Simpan (Create & Update)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('operator.ps.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('operator.ps.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    // Handle Konfirmasi Hapus
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Unit PS?',
            text: "Data ini tidak dapat dikembalikan setelah dihapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('operator.ps.destroy', id));
            }
        });
    };

    // Format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    // Badge Warna Status
    const statusColor = (status) => {
        switch(status) {
            case 'tersedia': return 'bg-green-100 text-green-700';
            case 'booking': return 'bg-blue-100 text-blue-700';
            case 'sedang_bermain': return 'bg-purple-100 text-purple-700';
            case 'maintenance': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <OperatorLayout user={auth.user}>
            <Head title="Manajemen Data PS" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Header, Tombol Tambah, Form Cari */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <button 
                                onClick={openAddModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm transition-colors mb-4 md:mb-0"
                            >
                                + Tambah Unit PS
                            </button>
                            
                            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari Kode atau Nama PS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-gray-100 border border-l-0 border-gray-300 px-4 py-2 rounded-r-md hover:bg-gray-200 text-sm font-medium">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Data PS */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Kode PS</th>
                                        <th className="px-4 py-3">Nama Unit</th>
                                        <th className="px-4 py-3">Jenis & TV</th>
                                        <th className="px-4 py-3">Tarif / Jam</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {psList.data.length > 0 ? (
                                        psList.data.map((ps) => (
                                            <tr key={ps.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-gray-900">{ps.kode_ps}</td>
                                                <td className="px-4 py-3 text-gray-900">{ps.nama_ps}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold">{ps.jenis}</span> <br/>
                                                    <span className="text-xs text-gray-400">{ps.tv || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-blue-600">{formatRupiah(ps.harga_per_jam)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusColor(ps.status)}`}>
                                                        {ps.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(ps)}
                                                        className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1.5 rounded text-xs font-semibold shadow-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(ps.id)}
                                                        className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs font-semibold shadow-sm"
                                                    >
                                                        Hapus
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

                        {/* Paginasi Inertia (5 per Halaman) */}
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

            {/* Modal Box Form Tambah & Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                                {isEditMode ? 'Edit Data PlayStation' : 'Tambah PlayStation Baru'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Kode PS</label>
                                        <input 
                                            type="text" 
                                            value={data.kode_ps} 
                                            onChange={e => setData('kode_ps', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                            placeholder="Cth: PS01"
                                        />
                                        {errors.kode_ps && <span className="text-red-500 text-xs">{errors.kode_ps}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Nama Unit</label>
                                        <input 
                                            type="text" 
                                            value={data.nama_ps} 
                                            onChange={e => setData('nama_ps', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                            placeholder="Cth: PS 1"
                                        />
                                        {errors.nama_ps && <span className="text-red-500 text-xs">{errors.nama_ps}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Jenis Konsol</label>
                                        <select 
                                            value={data.jenis} 
                                            onChange={e => setData('jenis', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                        >
                                            <option value="PS4">PS4</option>
                                            <option value="PS5">PS5</option>
                                        </select>
                                        {errors.jenis && <span className="text-red-500 text-xs">{errors.jenis}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Ukuran TV (Opsional)</label>
                                        <input 
                                            type="text" 
                                            value={data.tv} 
                                            onChange={e => setData('tv', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                            placeholder="Cth: 43 Inch"
                                        />
                                        {errors.tv && <span className="text-red-500 text-xs">{errors.tv}</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Harga per Jam (Rp)</label>
                                        <input 
                                            type="number" 
                                            value={data.harga_per_jam} 
                                            onChange={e => setData('harga_per_jam', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                            placeholder="15000"
                                        />
                                        {errors.harga_per_jam && <span className="text-red-500 text-xs">{errors.harga_per_jam}</span>}
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Status Unit</label>
                                        <select 
                                            value={data.status} 
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                        >
                                            <option value="tersedia">Tersedia</option>
                                            <option value="booking">Di-Booking</option>
                                            <option value="sedang_bermain">Sedang Bermain</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                        {errors.status && <span className="text-red-500 text-xs">{errors.status}</span>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Keterangan Khusus</label>
                                    <textarea 
                                        rows="2"
                                        value={data.keterangan} 
                                        onChange={e => setData('keterangan', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                        placeholder="Tuliskan catatan kondisi PS jika ada..."
                                    ></textarea>
                                    {errors.keterangan && <span className="text-red-500 text-xs">{errors.keterangan}</span>}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border text-sm font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-sm text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah PS Baru')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </OperatorLayout>
    );
}