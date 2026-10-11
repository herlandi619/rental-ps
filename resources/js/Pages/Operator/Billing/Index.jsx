import React, { useState, useEffect, useRef } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import OperatorLayout from '@/Layouts/OperatorLayout';
import Swal from 'sweetalert2';

export default function Index({ auth, billings, availablePs, customers, filters }) {
    const { flash } = usePage().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    
    // Modal States
    const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [selectedBilling, setSelectedBilling] = useState(null);

    // Live Timers State
    const [now, setNow] = useState(new Date().getTime());

    // Ref untuk mencatat ID billing yang alarm-nya sudah berbunyi
    const playedAlarmsRef = useRef(new Set());

    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = new Date().getTime();
            setNow(currentTime);

            // Logika untuk membunyikan alarm
            billings.data.forEach(bill => {
                if (bill.status === 'berjalan') {
                    const endTime = new Date(bill.waktu_selesai).getTime();
                    
                    // Jika waktu habis dan alarm untuk ID billing ini belum pernah dibunyikan
                    if (endTime <= currentTime && !playedAlarmsRef.current.has(bill.id)) {
                        // Panggil file audio dari folder public/audio/alarm.mp3
                        const audio = new Audio('/audio/alarm.mp3');
                        
                        // Mainkan suara
                        audio.play().catch(err => {
                            console.log("Browser memblokir autoplay audio. Operator harus melakukan klik di halaman terlebih dahulu.", err);
                        });
                        
                        // Masukkan ID ke dalam Set agar suara tidak me-loop setiap detik
                        playedAlarmsRef.current.add(bill.id);
                    }
                }
            });

        }, 1000);
        return () => clearInterval(interval);
    }, [billings.data]);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setNow(new Date().getTime());
    //     }, 1000);
    //     return () => clearInterval(interval);
    // }, []);

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

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('operator.billings.index'), { search: searchTerm }, { preserveState: true, replace: true });
    };

    // Forms
    const walkInForm = useForm({
        ps_id: '',
        user_id: '', // Boleh kosong (walk-in tanpa akun)
        durasi: '60',
    });

    const extendForm = useForm({
        tambahan_waktu: '30',
    });

    const openWalkInModal = () => {
        walkInForm.reset();
        walkInForm.clearErrors();
        setIsWalkInModalOpen(true);
    };

    const openExtendModal = (billing) => {
        setSelectedBilling(billing);
        extendForm.reset();
        extendForm.clearErrors();
        setIsExtendModalOpen(true);
    };

    const submitWalkIn = (e) => {
        e.preventDefault();
        walkInForm.post(route('operator.billings.store'), {
            onSuccess: () => setIsWalkInModalOpen(false),
        });
    };

    const submitExtend = (e) => {
        e.preventDefault();
        extendForm.put(route('operator.billings.extend', selectedBilling.id), {
            onSuccess: () => {
                setIsExtendModalOpen(false);
                setSelectedBilling(null);
            },
        });
    };

    const handleFinish = (id, namaPs) => {
        Swal.fire({
            title: 'Akhiri Sesi?',
            text: `Anda yakin ingin mengakhiri sesi bermain untuk ${namaPs}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Selesaikan!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('operator.billings.finish', id));
            }
        });
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
    };

    // Logika Penghitung Waktu Mundur
    const getTimerData = (waktuSelesai, status) => {
        if (status !== 'berjalan') return { text: '-', color: 'text-gray-500' };

        const endTime = new Date(waktuSelesai).getTime();
        const diff = endTime - now;

        if (diff <= 0) {
            return { text: 'WAKTU HABIS', color: 'text-red-600 font-bold bg-red-100 px-2 rounded animate-pulse' };
        }

        const minutes = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (minutes < 10) {
            return { text: `${minutes}m ${seconds}s`, color: 'text-orange-600 font-bold bg-orange-100 px-2 rounded' };
        }
        
        return { text: `${minutes}m ${seconds}s`, color: 'text-blue-600 font-medium' };
    };

    return (
        <OperatorLayout user={auth.user}>
            <Head title="Manajemen Billing & Timer" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <button 
                                onClick={openWalkInModal}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-sm text-sm transition-colors mb-4 md:mb-0"
                            >
                                + Open Billing (Walk-in)
                            </button>
                            
                            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Cari PS atau Customer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-gray-300 focus:border-blue-500 rounded-l-md shadow-sm text-sm w-full md:w-64"
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
                                        <th className="px-4 py-3">Total Durasi</th>
                                        <th className="px-4 py-3">Total Harga</th>
                                        <th className="px-4 py-3 text-center">Sisa Waktu</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billings.data.length > 0 ? (
                                        billings.data.map((bill) => {
                                            const timer = getTimerData(bill.waktu_selesai, bill.status);
                                            return (
                                                <tr key={bill.id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-4 py-4 font-bold text-gray-900">{bill.ps?.nama_ps}</td>
                                                    <td className="px-4 py-4">{bill.customer?.name || 'Walk-in'}</td>
                                                    <td className="px-4 py-4">{bill.durasi} Menit</td>
                                                    <td className="px-4 py-4 font-semibold text-gray-800">{formatRupiah(bill.total_harga)}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        {bill.status === 'berjalan' ? (
                                                            <span className={timer.color}>{timer.text}</span>
                                                        ) : (
                                                            <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs uppercase">{bill.status}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {bill.status === 'berjalan' && (
                                                            <div className="flex justify-center gap-2">
                                                                <button 
                                                                    onClick={() => openExtendModal(bill)}
                                                                    className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1.5 rounded text-xs font-semibold shadow-sm"
                                                                >
                                                                    Tambah Waktu
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleFinish(bill.id, bill.ps?.nama_ps)}
                                                                    className="text-white bg-red-500 hover:bg-red-600 px-2 py-1.5 rounded text-xs font-semibold shadow-sm"
                                                                >
                                                                    Selesai
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center text-gray-500">Data billing tidak ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-center">
                            {billings.links.map((link, index) => (
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

            {/* Modal Box: Open Billing (Walk-in) */}
            {isWalkInModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Mulai Sesi (Walk-in)</h3>
                            <button onClick={() => setIsWalkInModalOpen(false)} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={submitWalkIn}>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Pilih Unit PlayStation</label>
                                    <select 
                                        value={walkInForm.data.ps_id} 
                                        onChange={e => walkInForm.setData('ps_id', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                    >
                                        <option value="">-- Pilih Unit PS Tersedia --</option>
                                        {availablePs.map(ps => (
                                            <option key={ps.id} value={ps.id}>{ps.nama_ps} ({ps.jenis}) - {formatRupiah(ps.harga_per_jam)}/jam</option>
                                        ))}
                                    </select>
                                    {walkInForm.errors.ps_id && <span className="text-red-500 text-xs">{walkInForm.errors.ps_id}</span>}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Customer (Opsional jika sudah punya akun)</label>
                                    <select 
                                        value={walkInForm.data.user_id} 
                                        onChange={e => walkInForm.setData('user_id', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                    >
                                        <option value="">Walk-in (Tidak Punya Akun)</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Durasi Bermain</label>
                                    <select 
                                        value={walkInForm.data.durasi} 
                                        onChange={e => walkInForm.setData('durasi', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                    >
                                        <option value="1">1 Menit (Tes/Cepat)</option>
                                        <option value="30">30 Menit</option>
                                        <option value="60">1 Jam</option>
                                        <option value="120">2 Jam</option>
                                        <option value="180">3 Jam</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsWalkInModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border text-sm font-medium">Batal</button>
                                <button type="submit" disabled={walkInForm.processing} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow-sm text-sm font-medium disabled:opacity-50">
                                    {walkInForm.processing ? 'Memproses...' : 'Mulai Timer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Box: Perpanjang Waktu */}
            {isExtendModalOpen && selectedBilling && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Perpanjang Waktu Bermain</h3>
                            <button onClick={() => { setIsExtendModalOpen(false); setSelectedBilling(null); }} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={submitExtend}>
                            <div className="space-y-4 text-sm">
                                <div className="bg-gray-50 p-3 rounded border text-gray-700">
                                    <p><strong>PS:</strong> {selectedBilling.ps?.nama_ps}</p>
                                    <p><strong>Customer:</strong> {selectedBilling.customer?.name || 'Walk-in'}</p>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Tambah Durasi</label>
                                    <select 
                                        value={extendForm.data.tambahan_waktu} 
                                        onChange={e => extendForm.setData('tambahan_waktu', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                    >
                                        <option value="15">15 Menit</option>
                                        <option value="30">30 Menit</option>
                                        <option value="60">1 Jam</option>
                                        <option value="120">2 Jam</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => { setIsExtendModalOpen(false); setSelectedBilling(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border text-sm font-medium">Batal</button>
                                <button type="submit" disabled={extendForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-sm text-sm font-medium disabled:opacity-50">
                                    {extendForm.processing ? 'Menyimpan...' : 'Tambah Waktu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </OperatorLayout>
    );
}