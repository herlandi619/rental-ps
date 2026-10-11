import React, { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, payments, totalPendapatan, bookings, billings, filters }) {
    const { flash } = usePage().props;

    // Filter States
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterTanggal, setFilterTanggal] = useState(filters.tanggal || '');
    const [filterMetode, setFilterMetode] = useState(filters.metode || '');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Form Inertia untuk Tambah Pembayaran
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        sumber: 'billing',
        sumber_id: '',
        jumlah: '',
        metode: 'cash',
        jenis: 'pelunasan',
        bukti_pembayaran: null,
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

    // Handle Filters Search via Inertia
    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('operator.transactions.index'), { 
            search: searchTerm,
            tanggal: filterTanggal,
            metode: filterMetode
        }, { preserveState: true, replace: true });
    };

    // Modal Handlers
    const openAddModal = () => {
        reset();
        clearErrors();
        setIsAddModalOpen(true);
    };

    const openDetailModal = (payment) => {
        setSelectedPayment(payment);
        setIsDetailModalOpen(true);
    };

    const closeModals = () => {
        setIsAddModalOpen(false);
        setIsDetailModalOpen(false);
        setSelectedPayment(null);
        reset();
    };

    // Handle Submit Tambah Pembayaran
    const handleSubmitPayment = (e) => {
        e.preventDefault();
        post(route('operator.transactions.store'), {
            forceFormData: true, // Wajib true agar file bukti_pembayaran bisa terkirim
            onSuccess: () => closeModals(),
        });
    };

    // Handle Verifikasi Pembayaran
    const handleVerify = (id) => {
        Swal.fire({
            title: 'Verifikasi Pembayaran?',
            text: "Apakah dana sudah masuk dan bukti valid?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Verifikasi!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('operator.transactions.verify', id), {}, {
                    onSuccess: () => closeModals()
                });
            }
        });
    };


    // Fungsi untuk memproses autofill nominal pembayaran
const handlePilihSumber = (e) => {
        const selectedId = e.target.value;
        let nominalOtomatis = '';

        if (selectedId) {
            if (data.sumber === 'billing') {
                // Cari data billing yang dipilih, lalu ambil total_harga
                const selectedBilling = billings.find(b => b.id.toString() === selectedId);
                if (selectedBilling) {
                    nominalOtomatis = selectedBilling.total_harga;
                }
            } else if (data.sumber === 'booking') {
                // Cari data booking yang dipilih
                const selectedBooking = bookings.find(b => b.id.toString() === selectedId);
                if (selectedBooking) {
                    // Jika jenisnya DP, isi nominal DP. Jika pelunasan, isi sisa tagihan (Total - DP)
                    nominalOtomatis = data.jenis === 'dp' 
                        ? selectedBooking.dp 
                        : (selectedBooking.total_harga - selectedBooking.dp);
                }
            }
        }

        // Update state sumber_id sekaligus mengisi jumlah (nominal)
        setData(prevData => ({
            ...prevData,
            sumber_id: selectedId,
            jumlah: nominalOtomatis
        }));
    };

    // Format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    // Badge Warna Status
    const statusBadge = (status) => {
        switch(status) {
            case 'berhasil': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'gagal': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <OperatorLayout user={auth.user}>
            <Head title="Manajemen Transaksi" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Ringkasan Pendapatan */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-sm p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-semibold uppercase tracking-wider opacity-80">Total Pendapatan Terverifikasi</h2>
                            <p className="text-3xl font-bold mt-1">{formatRupiah(totalPendapatan)}</p>
                        </div>
                        <div className="hidden md:block">
                            <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Header & Filter */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                            <button 
                                onClick={openAddModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm transition-colors"
                            >
                                + Catat Pembayaran
                            </button>
                            
                            <form onSubmit={handleFilter} className="flex flex-wrap gap-2 w-full md:w-auto">
                                <input
                                    type="date"
                                    value={filterTanggal}
                                    onChange={(e) => setFilterTanggal(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                />
                                <select
                                    value={filterMetode}
                                    onChange={(e) => setFilterMetode(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                >
                                    <option value="">Semua Metode</option>
                                    <option value="cash">Cash</option>
                                    <option value="qris_manual">QRIS Manual</option>
                                    <option value="xendit">Xendit</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Cari Customer/Ref..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-md shadow-sm text-sm"
                                />
                                <button type="submit" className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
                                    Filter
                                </button>
                            </form>
                        </div>

                        {/* Tabel Data Transaksi */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Waktu</th>
                                        <th className="px-4 py-3">Customer & Referensi</th>
                                        <th className="px-4 py-3">Metode & Jenis</th>
                                        <th className="px-4 py-3">Nominal</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.length > 0 ? (
                                        payments.data.map((pay) => (
                                            <tr key={pay.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {new Date(pay.created_at).toLocaleDateString('id-ID')} <br/>
                                                    <span className="text-xs text-gray-400">{new Date(pay.created_at).toLocaleTimeString('id-ID')}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-gray-900">{pay.user?.name || 'Walk-in'}</span> <br/>
                                                    <span className="text-xs font-mono text-gray-500">{pay.payment_reference || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3 uppercase">
                                                    <span className="font-semibold">{pay.metode}</span> <br/>
                                                    <span className="text-xs text-gray-500">{pay.jenis}</span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-gray-800">
                                                    {formatRupiah(pay.jumlah)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusBadge(pay.status)}`}>
                                                        {pay.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => openDetailModal(pay)}
                                                        className="text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded text-xs font-semibold shadow-sm"
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

                        {/* Paginasi Inertia (5 per Halaman) */}
                        <div className="mt-4 flex justify-center">
                            {payments.links.map((link, index) => (
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

            {/* Modal Box Form Tambah Pembayaran */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Catat Pembayaran Manual</h3>
                            <button onClick={closeModals} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmitPayment}>
                            <div className="space-y-4 text-sm">
                                
                                <div className="grid grid-cols-2 gap-4">
    <div>
        <label className="block font-medium text-gray-700 mb-1">Sumber Tagihan</label>
        <select 
            value={data.sumber} 
            onChange={e => setData(prevData => ({ ...prevData, sumber: e.target.value, sumber_id: '', jumlah: '' }))} // Reset data saat ganti sumber
            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
        >
            <option value="billing">Billing (Main Langsung)</option>
            <option value="booking">Booking (Reservasi)</option>
        </select>
    </div>
    <div>
        <label className="block font-medium text-gray-700 mb-1">Pilih Data {data.sumber === 'billing' ? 'Billing' : 'Booking'}</label>
        <select 
            value={data.sumber_id} 
            onChange={handlePilihSumber} // Panggil fungsi otomatis di sini
            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
        >
            <option value="">-- Pilih --</option>
            {data.sumber === 'billing' 
                ? billings.map(b => <option key={b.id} value={b.id}>PS: {b.ps?.nama_ps} - {b.customer?.name || 'Walk-in'}</option>)
                : bookings.map(b => <option key={b.id} value={b.id}>{b.kode_booking} - {b.user?.name}</option>)
            }
        </select>
        {errors.sumber_id && <span className="text-red-500 text-xs">{errors.sumber_id}</span>}
    </div>
</div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Jenis Pembayaran</label>
                                        <select 
                                            value={data.jenis} 
                                            onChange={e => setData('jenis', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                        >
                                            <option value="pelunasan">Pelunasan</option>
                                            <option value="dp">DP (Down Payment)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">Metode Bayar</label>
                                        <select 
                                            value={data.metode} 
                                            onChange={e => setData('metode', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                        >
                                            <option value="cash">Uang Tunai (Cash)</option>
                                            <option value="qris_manual">Transfer / QRIS Manual</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Nominal Pembayaran (Rp)</label>
                                    <input 
                                        type="number" 
                                        value={data.jumlah} 
                                        onChange={e => setData('jumlah', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm font-bold"
                                        placeholder="Contoh: 50000"
                                    />
                                    {errors.jumlah && <span className="text-red-500 text-xs">{errors.jumlah}</span>}
                                </div>

                                {data.metode === 'qris_manual' && (
                                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                        <label className="block font-medium text-blue-800 mb-1">Upload Bukti Transfer/QRIS</label>
                                        <input 
                                            type="file" 
                                            onChange={e => setData('bukti_pembayaran', e.target.files[0])}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                            accept="image/jpeg, image/png, image/jpg"
                                        />
                                        {errors.bukti_pembayaran && <span className="text-red-500 text-xs block mt-1">{errors.bukti_pembayaran}</span>}
                                        <p className="text-xs text-blue-600 mt-2">*Pembayaran QRIS akan masuk dalam status <strong>Pending</strong> hingga diverifikasi oleh Anda.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={closeModals} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border text-sm font-medium">Batal</button>
                                <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-sm text-sm font-medium disabled:opacity-50">
                                    {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Box Detail Transaksi & Verifikasi */}
            {isDetailModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Rincian Transaksi</h3>
                            <button onClick={closeModals} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">No. Referensi</span>
                                <span className="font-mono text-gray-900 font-bold">{selectedPayment.payment_reference || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Customer</span>
                                <span className="font-semibold text-gray-900">{selectedPayment.user?.name || 'Walk-in Customer'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Terkait</span>
                                <span className="text-gray-900 text-right">
                                    {selectedPayment.booking ? `Booking (${selectedPayment.booking.kode_booking})` : ''}
                                    {selectedPayment.billing ? `Billing (PS: ${selectedPayment.billing.ps?.nama_ps})` : ''}
                                </span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Tipe / Metode</span>
                                <span className="uppercase font-semibold text-indigo-600">{selectedPayment.jenis} - {selectedPayment.metode}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Nominal</span>
                                <span className="font-bold text-green-600 text-lg">{formatRupiah(selectedPayment.jumlah)}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Status</span>
                                <span className={`uppercase font-bold ${selectedPayment.status === 'berhasil' ? 'text-green-600' : selectedPayment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {selectedPayment.status}
                                </span>
                            </div>

                            {selectedPayment.metode === 'qris_manual' && selectedPayment.bukti_pembayaran && (
                                <div className="mt-4">
                                    <p className="text-gray-500 text-xs font-semibold mb-2">Bukti Pembayaran Terlampir:</p>
                                    <div className="bg-gray-100 p-2 rounded flex justify-center border">
                                        <img 
                                            src={`/storage/${selectedPayment.bukti_pembayaran}`} 
                                            alt="Bukti Transfer" 
                                            className="max-h-64 object-contain rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t flex justify-between gap-3">
                            {selectedPayment.status === 'pending' ? (
                                <button 
                                    onClick={() => handleVerify(selectedPayment.id)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded shadow-sm text-sm w-full transition-colors"
                                >
                                    Verifikasi Pembayaran Valid
                                </button>
                            ) : (
                                <div className="text-xs text-gray-400 italic my-auto">Transaksi ini sudah diselesaikan.</div>
                            )}
                            
                            <button type="button" onClick={closeModals} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-6 rounded border text-sm font-medium">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </OperatorLayout>
    );
}