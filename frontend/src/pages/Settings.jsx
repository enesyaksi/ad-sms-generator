import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(
        document.documentElement.classList.contains('dark')
    );

    const toggleDarkMode = () => {
        const isDark = !darkMode;
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kullanıcı Ayarları</h1>
                    <p className="text-slate-500 dark:text-slate-400">Profilinizi ve uygulama tercihlerinizi yönetin.</p>
                </div>

                {/* Profile Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <span className="material-symbols-outlined text-primary">person</span>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profil Bilgileri</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Görünen Ad</label>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium">
                                {user?.displayName || 'Belirtilmedi'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta Adresi</label>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium">
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <span className="material-symbols-outlined text-primary">settings</span>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Uygulama Tercihleri</h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Karanlık Mod</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Uygulama görünümünü değiştirin.</p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-primary ${darkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <span className="material-symbols-outlined text-primary">security</span>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Güvenlik</h2>
                    </div>

                    <button className="text-sm font-semibold text-primary hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                        Şifreyi Değiştir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
