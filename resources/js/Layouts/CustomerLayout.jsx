import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function CustomerLayout({ children }) {
    const { auth } = usePage().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Daftar Menu untuk Role Customer berdasarkan modul sistem
    const menuItems = [
        { name: 'Dashboard', route: 'customer.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
       
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Overlay untuk Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Terkiri */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-16 bg-slate-950 border-b border-slate-800">
                    <span className="text-xl font-bold tracking-wider">TRIPLE A GAME</span>
                </div>
                
                <div className="px-4 py-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Menu Utama
                    </p>
                    <nav className="space-y-1">
                        {menuItems.map((item, index) => {
                            // Cek apakah route saat ini aktif
                            // const isActive = route().current(item.route); // Gunakan ini jika Ziggy terpasang
                            const isActive = false; // Hapus ini jika menggunakan Ziggy di atas

                            return (
                                <Link
                                    key={index}
                                    href={route(item.route)} // Pastikan route ini sudah Anda buat di web.php
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                                        isActive 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                    </svg>
                                    <span className="font-medium text-sm">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            {/* Area Utama (Top Navbar + Konten) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
                    <div className="flex items-center">
                        {/* Tombol Hamburger Mobile */}
                        <button 
                            className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden mr-4"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
                            Customer Workspace
                        </h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Tombol Notifikasi */}
                        <button className="text-gray-400 hover:text-blue-500 transition-colors relative">
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* Profil Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    {auth.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'O'}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    {auth.user?.name || 'Customer'}
                                </span>
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Isi Dropdown Profil */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{auth.user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{auth.user?.email}</p>
                                    </div>
                                    <Link href={route('profile.edit')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                        Profil Saya
                                    </Link>
                                    <Link href={route('logout')} method="post" as="button" className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors">
                                        Logout
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content (Disini children dari halaman-halaman akan di-render) */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}