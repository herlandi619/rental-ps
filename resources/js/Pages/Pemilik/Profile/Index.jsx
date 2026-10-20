import React, { useState, useEffect } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import PemilikLayout from '@/Layouts/PemilikLayout';
import Swal from 'sweetalert2';

export default function Index({ auth }) {
    const { flash } = usePage().props;
    const user = auth.user;

    // Modal States
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Form Inertia untuk Update Profil
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        no_hp: user.no_hp || '',
    });

    // Form Inertia untuk Update Password
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
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

    // Handlers untuk Profil
    const openProfileModal = () => {
        profileForm.setData({
            name: user.name || '',
            email: user.email || '',
            no_hp: user.no_hp || '',
        });
        profileForm.clearErrors();
        setIsProfileModalOpen(true);
    };

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.put(route('pemilik.profile.update'), {
            preserveScroll: true,
            onSuccess: () => setIsProfileModalOpen(false),
        });
    };

    // Handlers untuk Password
    const openPasswordModal = () => {
        passwordForm.reset();
        passwordForm.clearErrors();
        setIsPasswordModalOpen(true);
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('pemilik.profile.password'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsPasswordModalOpen(false);
                passwordForm.reset();
            },
        });
    };

    return (
        <PemilikLayout user={user}>
            <Head title="Profil Saya" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Kartu Informasi Profil */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b pb-6">
                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-4xl shadow-md">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-500 font-medium">{user.email}</p>
                                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-100 text-blue-700">
                                    Role: {user.role}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Nomor HP / WhatsApp</h4>
                                <p className="text-gray-900 font-medium text-lg">{user.no_hp || <span className="text-gray-400 italic">Belum diatur</span>}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Status Akun</h4>
                                <p className="text-gray-900 font-medium text-lg capitalize">
                                    <span className={`px-2 py-1 rounded text-sm text-white font-bold ${user.status === 'aktif' ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {user.status}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Bergabung Sejak</h4>
                                <p className="text-gray-900 font-medium">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t flex flex-wrap gap-4">
                            <button 
                                onClick={openProfileModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-sm text-sm transition-colors"
                            >
                                Ubah Informasi Profil
                            </button>
                            <button 
                                onClick={openPasswordModal}
                                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded shadow-sm text-sm transition-colors"
                            >
                                Ubah Password
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal Box: Ubah Profil */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10 px-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Ubah Profil</h3>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={submitProfile}>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.data.name} 
                                        onChange={e => profileForm.setData('name', e.target.value)}
                                        className="w-full border-gray-300 focus:border-blue-500 rounded-md shadow-sm"
                                    />
                                    {profileForm.errors.name && <span className="text-red-500 text-xs mt-1 block">{profileForm.errors.name}</span>}
                                </div>
                                
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        value={profileForm.data.email} 
                                        onChange={e => profileForm.setData('email', e.target.value)}
                                        className="w-full border-gray-300 focus:border-blue-500 rounded-md shadow-sm"
                                    />
                                    {profileForm.errors.email && <span className="text-red-500 text-xs mt-1 block">{profileForm.errors.email}</span>}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Nomor Handphone (Opsional)</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.data.no_hp} 
                                        onChange={e => profileForm.setData('no_hp', e.target.value)}
                                        className="w-full border-gray-300 focus:border-blue-500 rounded-md shadow-sm"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                    {profileForm.errors.no_hp && <span className="text-red-500 text-xs mt-1 block">{profileForm.errors.no_hp}</span>}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border text-sm font-medium">Batal</button>
                                <button type="submit" disabled={profileForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-sm text-sm font-medium disabled:opacity-50">
                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Profil'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Box: Ubah Password */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto pt-10 px-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-900">Ubah Password</h3>
                            <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>
                        
                        <form onSubmit={submitPassword}>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Password Saat Ini</label>
                                    <input 
                                        type="password" 
                                        value={passwordForm.data.current_password} 
                                        onChange={e => passwordForm.setData('current_password', e.target.value)}
                                        className="w-full border-gray-300 focus:border-blue-500 rounded-md shadow-sm"
                                    />
                                    {passwordForm.errors.current_password && <span className="text-red-500 text-xs mt-1 block">{passwordForm.errors.current_password}</span>}
                                </div>
                                
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Password Baru</label>
                                    <input 
                                        type="password" 
                                        value={passwordForm.data.password} 
                                        onChange={e => passwordForm.setData('password', e.target.value)}
                                        className="w-full border-gray-300 focus:border-blue-500 rounded-md shadow-sm"
                                    />
                                    {passwordForm.errors.password && <span className="text-red-500 text-xs mt-1 block">{passwordForm.errors.password}</span>}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                                    <input 
                                        type="password" 
                                        value={passwordForm.data.password_confirmation} 
                                        onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="w-full border-gray-300 focus:border-blue-500 rounded-md shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded border text-sm font-medium">Batal</button>
                                <button type="submit" disabled={passwordForm.processing} className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded shadow-sm text-sm font-medium disabled:opacity-50">
                                    {passwordForm.processing ? 'Menyimpan...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PemilikLayout>
    );
}