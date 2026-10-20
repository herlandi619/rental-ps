import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PemilikLayout from '@/Layouts/PemilikLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, type, dataLaporan, stats, psList, filters }) {
    const { flash } = usePage().props;
    
    // Filter states
    const [selectedType, setSelectedType] = useState(filters.type || 'transaksi');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [metode, setMetode] = useState(filters.metode || '');
    const [psId, setPsId] = useState(filters.ps_id || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Modal state
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('pemilik.reports.index'), {
            type: selectedType,
            start_date: startDate,
            end_date: endDate,
            metode: metode,
            ps_id: psId,
            search: searchTerm
        }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSelectedType('transaksi');
        setStartDate('');
        setEndDate('');
        setMetode('');
        setPsId('');
        setSearchTerm('');
        router.get(route('pemilik.reports.index'), { type: 'transaksi' });
    };

    const handleExportPDF = () => {
        const queryParams = new URLSearchParams({
            type: selectedType,
            start_date: startDate,
            end_date: endDate,
            metode: metode,
            ps_id: psId,
        }).toString();
        window.open(`${route('pemilik.reports.pdf')}?${queryParams}`, '_blank');
    };

    const openModal = (item) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setIsDetailModalOpen(false);
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number || 0);
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleString('id-ID') : '-';
    };

    return (
        <PemilikLayout user={auth.user}>
            <Head title="Laporan & Monitoring" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Ringkasan Laporan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-indigo-600 p-4 rounded-lg shadow-sm border text-center text-white">
                            <p className="text-xs uppercase font-bold opacity-80">Total Pendapatan (Berdasarkan Filter)</p>
                            <p className="text-3xl font-bold mt-1">{formatRupiah(stats.total_nominal)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Total Record Ditemukan</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_data} Data</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        
                        {/* Area Filter */}
                        <form onSubmit={handleFilter} className="mb-6 space-y-4 bg-gray-50 p-4 rounded-md border">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div className="lg:col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Jenis Laporan</label>
                                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full text-sm border-gray-300 rounded-md">
                                        <option value="transaksi">Transaksi & Pendapatan</option>
                                        <option value="booking">Data Booking</option>
                                        <option value="billing">Data Billing (Sewa)</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mulai Tgl</label>
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sampai Tgl</label>
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                </div>
                                
                                {selectedType === 'transaksi' && (
                                    <div className="lg:col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Metode Bayar</label>
                                        <select value={metode} onChange={(e) => setMetode(e.target.value)} className="w-full text-sm border-gray-300 rounded-md">
                                            <option value="">Semua Metode</option>
                                            <option value="cash">Cash</option>
                                            <option value="xendit">Xendit</option>
                                            <option value="qris_manual">QRIS Manual</option>
                                        </select>
                                    </div>
                                )}

                                {(selectedType === 'booking' || selectedType === 'billing') && (
                                    <div className="lg:col-span-1">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pilih PS</label>
                                        <select value={psId} onChange={(e) => setPsId(e.target.value)} className="w-full text-sm border-gray-300 rounded-md">
                                            <option value="">Semua PS</option>
                                            {psList.map(ps => (
                                                <option key={ps.id} value={ps.id}>{ps.nama_ps} - {ps.jenis}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="lg:col-span-1">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pencarian</label>
                                    <input type="text" placeholder="Cari Kode/Nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                </div>
                                
                                <div className="lg:col-span-1 flex items-end gap-2">
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md text-sm transition">Terapkan</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t mt-4">
                                <button type="button" onClick={handleReset} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Reset Filter</button>
                                <button type="button" onClick={handleExportPDF} className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md text-sm transition flex items-center gap-2">
                                    🖨️ Cetak / Unduh PDF
                                </button>
                            </div>
                        </form>

                        {/* Tabel Data Dinamis */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 border">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                    {type === 'transaksi' && (
                                        <tr>
                                            <th className="px-4 py-3">Waktu Transaksi</th>
                                            <th className="px-4 py-3">Ref & Customer</th>
                                            <th className="px-4 py-3">Jenis & Metode</th>
                                            <th className="px-4 py-3">Nominal</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    )}
                                    {type === 'booking' && (
                                        <tr>
                                            <th className="px-4 py-3">Kode Booking</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Unit PS</th>
                                            <th className="px-4 py-3">Jadwal & Total</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    )}
                                    {type === 'billing' && (
                                        <tr>
                                            <th className="px-4 py-3">Waktu Mulai</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Unit PS</th>
                                            <th className="px-4 py-3">Durasi & Total</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {dataLaporan.data.length > 0 ? (
                                        dataLaporan.data.map((item) => (
                                            <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                                {type === 'transaksi' && (
                                                    <>
                                                        <td className="px-4 py-3">{formatDate(item.paid_at)}</td>
                                                        <td className="px-4 py-3 font-semibold text-gray-900">{item.payment_reference || '-'}<br/><span className="text-xs font-normal text-gray-500">{item.user?.name || 'Walk-in'}</span></td>
                                                        <td className="px-4 py-3 uppercase text-xs font-bold">{item.jenis}<br/><span className="text-gray-500 font-normal">{item.metode.replace('_', ' ')}</span></td>
                                                        <td className="px-4 py-3 font-bold text-gray-900">{formatRupiah(item.jumlah)}</td>
                                                    </>
                                                )}
                                                {type === 'booking' && (
                                                    <>
                                                        <td className="px-4 py-3 font-bold">{item.kode_booking}</td>
                                                        <td className="px-4 py-3 text-gray-900">{item.user?.name}</td>
                                                        <td className="px-4 py-3">{item.ps?.nama_ps} - <span className="text-xs">{item.ps?.jenis}</span></td>
                                                        <td className="px-4 py-3">{formatDate(item.tanggal_main)}<br/><span className="text-xs font-bold">{formatRupiah(item.total_harga)}</span></td>
                                                    </>
                                                )}
                                                {type === 'billing' && (
                                                    <>
                                                        <td className="px-4 py-3">{formatDate(item.waktu_mulai)}</td>
                                                        <td className="px-4 py-3 text-gray-900">{item.customer?.name || 'Walk-in'}</td>
                                                        <td className="px-4 py-3">{item.ps?.nama_ps} - <span className="text-xs">{item.ps?.jenis}</span></td>
                                                        <td className="px-4 py-3">{item.durasi} Menit<br/><span className="text-xs font-bold">{formatRupiah(item.total_harga)}</span></td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => openModal(item)} className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition">
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-gray-500 italic">Data laporan tidak ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginasi Inertia */}
                        <div className="mt-4 flex justify-center">
                            {dataLaporan.links.map((link, index) => (
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

            {/* Modal Detail */}
            {isDetailModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Rincian Data {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                            {type === 'transaksi' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-gray-500">ID Transaksi:</p> <p className="font-bold">{selectedItem.id}</p>
                                    <p className="text-gray-500">Waktu Bayar:</p> <p className="font-semibold">{formatDate(selectedItem.paid_at)}</p>
                                    <p className="text-gray-500">Referensi:</p> <p className="font-semibold">{selectedItem.payment_reference || '-'}</p>
                                    <p className="text-gray-500">Pelanggan:</p> <p className="font-semibold">{selectedItem.user?.name || 'Walk-in Customer'}</p>
                                    <p className="text-gray-500">Jenis Bayar:</p> <p className="font-semibold uppercase">{selectedItem.jenis}</p>
                                    <p className="text-gray-500">Metode:</p> <p className="font-semibold uppercase">{selectedItem.metode.replace('_', ' ')}</p>
                                    <p className="text-gray-500">Nominal:</p> <p className="font-bold text-indigo-600 text-lg">{formatRupiah(selectedItem.jumlah)}</p>
                                </div>
                            )}
                            {type === 'booking' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-gray-500">Kode Booking:</p> <p className="font-bold">{selectedItem.kode_booking}</p>
                                    <p className="text-gray-500">Pelanggan:</p> <p className="font-semibold">{selectedItem.user?.name}</p>
                                    <p className="text-gray-500">Unit PS:</p> <p className="font-semibold">{selectedItem.ps?.nama_ps}</p>
                                    <p className="text-gray-500">Tanggal Main:</p> <p className="font-semibold">{formatDate(selectedItem.tanggal_main)}</p>
                                    <p className="text-gray-500">Jam Bermain:</p> <p className="font-semibold">{selectedItem.jam_mulai} - {selectedItem.jam_selesai}</p>
                                    <p className="text-gray-500">Durasi:</p> <p className="font-semibold">{selectedItem.durasi} Menit</p>
                                    <p className="text-gray-500">Total Harga:</p> <p className="font-bold text-indigo-600">{formatRupiah(selectedItem.total_harga)}</p>
                                </div>
                            )}
                            {type === 'billing' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <p className="text-gray-500">ID Billing:</p> <p className="font-bold">{selectedItem.id}</p>
                                    <p className="text-gray-500">Pelanggan:</p> <p className="font-semibold">{selectedItem.customer?.name || 'Walk-in'}</p>
                                    <p className="text-gray-500">Unit PS:</p> <p className="font-semibold">{selectedItem.ps?.nama_ps}</p>
                                    <p className="text-gray-500">Waktu Mulai:</p> <p className="font-semibold">{formatDate(selectedItem.waktu_mulai)}</p>
                                    <p className="text-gray-500">Waktu Selesai:</p> <p className="font-semibold">{formatDate(selectedItem.waktu_selesai)}</p>
                                    <p className="text-gray-500">Durasi:</p> <p className="font-semibold">{selectedItem.durasi} Menit</p>
                                    <p className="text-gray-500">Total Biaya:</p> <p className="font-bold text-indigo-600">{formatRupiah(selectedItem.total_harga)}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button type="button" onClick={closeModal} className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded text-sm transition-colors shadow-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PemilikLayout>
    );
}