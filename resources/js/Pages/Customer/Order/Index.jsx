import React, { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, playstations, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPs, setSelectedPs] = useState(null);

    // Form Inertia
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        ps_id: '',
        tanggal_main: '',
        jam_mulai: '',
        durasi: 60, // Default 60 menit
        catatan: ''
    });

    // Kalkulasi Realtime State
    const [previewInfo, setPreviewInfo] = useState({
        jamSelesai: '-',
        totalHarga: 0,
        dp: 0
    });

    // Handle Flash Message
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

    // Effect untuk update kalkulasi realtime saat form berubah
    useEffect(() => {
        if (selectedPs && data.jam_mulai && data.durasi) {
            // Hitung Jam Selesai
            const [hours, minutes] = data.jam_mulai.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0);
            startDate.setMinutes(startDate.getMinutes() + parseInt(data.durasi));
            
            const endHours = String(startDate.getHours()).padStart(2, '0');
            const endMinutes = String(startDate.getMinutes()).padStart(2, '0');
            
            // Hitung Harga
            const durasiMenit = parseInt(data.durasi) || 0;
            const harga = (durasiMenit / 60) * selectedPs.harga_per_jam;
            const dp = harga * 0.5;

            setPreviewInfo({
                jamSelesai: `${endHours}:${endMinutes}`,
                totalHarga: harga,
                dp: dp
            });
        } else {
            setPreviewInfo({ jamSelesai: '-', totalHarga: 0, dp: 0 });
        }
    }, [data.jam_mulai, data.durasi, selectedPs]);

    // Buka Tutup Modal
    const openModal = (ps) => {
        setSelectedPs(ps);
        setData({
            ...data,
            ps_id: ps.id,
            tanggal_main: new Date().toISOString().split('T')[0], // Default Hari Ini
            jam_mulai: '',
            durasi: 60,
            catatan: ''
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPs(null);
        reset();
    };

    // Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('customer.pesan-ps.store'), {
            onSuccess: () => closeModal(),
        });
    };

    // Handle Pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('customer.pesan-ps.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    return (
        <CustomerLayout user={auth.user}>
            <Head title="Pesan PlayStation" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Pencarian */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Daftar PlayStation Tersedia</h3>
                                <p className="text-sm text-gray-500">Pilih unit PS untuk melakukan pemesanan (Booking).</p>
                            </div>
                            
                            <form onSubmit={handleSearch} className="flex mt-4 md:mt-0 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari Nama PS / Jenis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
                                />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md text-sm font-medium transition-colors">
                                    Cari
                                </button>
                            </form>
                        </div>

                        {/* Tabel Ketersediaan PS */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Nama Unit</th>
                                        <th className="px-4 py-3">Jenis</th>
                                        <th className="px-4 py-3">Spesifikasi TV</th>
                                        <th className="px-4 py-3">Harga / Jam</th>
                                        <th className="px-4 py-3">Status</th> {/* TAMBAHAN KOLOM STATUS */}
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {playstations.data.length > 0 ? (
                                        playstations.data.map((ps) => (
                                            <tr key={ps.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-4 font-bold text-gray-900">{ps.nama_ps}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${ps.jenis === 'PS5' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                                                        {ps.jenis}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">{ps.tv || 'Standar'}</td>
                                                <td className="px-4 py-4 font-semibold text-indigo-700">
                                                    {formatRupiah(ps.harga_per_jam)}
                                                </td>
                                                {/* TAMBAHAN DATA STATUS */}
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                        ps.status === 'tersedia' ? 'bg-green-100 text-green-700' :
                                                        ps.status === 'sedang_bermain' ? 'bg-yellow-100 text-yellow-700' :
                                                        ps.status === 'booking' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {ps.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button 
                                                        onClick={() => openModal(ps)}
                                                        className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-xs font-bold shadow-sm transition-colors"
                                                    >
                                                        Booking
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            {/* UPDATE COLSPAN MENJADI 6 */}
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500 italic">
                                                Tidak ada PlayStation yang tersedia saat ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi */}
                        <div className="mt-5 flex justify-center">
                            {playstations.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (link.url) router.get(link.url);
                                    }}
                                    disabled={!link.url}
                                    className={`px-3 py-1.5 mx-1 border rounded text-xs transition-colors ${
                                        link.active ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-gray-700 hover:bg-gray-50 font-medium'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form Booking */}
            {isModalOpen && selectedPs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl overflow-hidden mt-10 mb-10">
                        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Form Booking: {selectedPs.nama_ps} ({selectedPs.jenis})</h3>
                            <button onClick={closeModal} className="text-blue-100 hover:text-white text-xl font-bold transition-colors">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Kiri: Input Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Bermain</label>
                                        <input 
                                            type="date" 
                                            min={new Date().toISOString().split('T')[0]}
                                            value={data.tanggal_main} 
                                            onChange={e => setData('tanggal_main', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                        {errors.tanggal_main && <span className="text-red-500 text-xs mt-1">{errors.tanggal_main}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                                        <input 
                                            type="time" 
                                            value={data.jam_mulai} 
                                            onChange={e => setData('jam_mulai', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                        {errors.jam_mulai && <span className="text-red-500 text-xs mt-1">{errors.jam_mulai}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Durasi Bermain</label>
                                        <select 
                                            value={data.durasi} 
                                            onChange={e => setData('durasi', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        >
                                            <option value="30">30 Menit</option>
                                            <option value="60">1 Jam (60 Menit)</option>
                                            <option value="90">1.5 Jam (90 Menit)</option>
                                            <option value="120">2 Jam (120 Menit)</option>
                                            <option value="180">3 Jam (180 Menit)</option>
                                            <option value="240">4 Jam (240 Menit)</option>
                                        </select>
                                        {errors.durasi && <span className="text-red-500 text-xs mt-1">{errors.durasi}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                                        <textarea 
                                            rows="2"
                                            value={data.catatan} 
                                            onChange={e => setData('catatan', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Kanan: Ringkasan Kalkulasi Otomatis */}
                                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-2 mb-3">Ringkasan Pemesanan</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Harga / Jam:</span>
                                                <span className="font-semibold">{formatRupiah(selectedPs.harga_per_jam)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Estimasi Selesai:</span>
                                                <span className="font-bold text-gray-900">{previewInfo.jamSelesai}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-blue-200">
                                                <span className="text-gray-600">Total Harga:</span>
                                                <span className="font-bold text-gray-900">{formatRupiah(previewInfo.totalHarga)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 bg-white p-3 rounded border border-blue-200 text-center">
                                        <span className="block text-xs text-gray-500 font-semibold uppercase mb-1">Kewajiban DP (50%)</span>
                                        <span className="block text-2xl font-bold text-blue-700">{formatRupiah(previewInfo.dp)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded text-sm transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing || !data.jam_mulai}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {processing ? 'Memproses...' : 'Lanjutkan ke Pembayaran Xendit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}