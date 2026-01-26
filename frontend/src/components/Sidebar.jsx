import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col justify-between hidden md:flex transition-all duration-300">
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <div
                        className="relative w-10 h-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700 bg-primary/10 flex items-center justify-center text-primary"
                        style={user?.photoURL ? { backgroundImage: `url("${user.photoURL}")` } : {}}
                    >
                        {!user?.photoURL && <span className="material-symbols-outlined">person</span>}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-sm font-bold truncate text-slate-900 dark:text-white">Reklam Yöneticisi</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Admin Paneli</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span className="text-sm font-medium">Genel Bakış</span>
                    </NavLink>
                </nav>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-sm font-medium">Çıkış Yap</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
