import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-hidden min-h-screen">
            <div className="flex h-screen w-full">
                {/* Sidebar - Desktop */}
                <Sidebar />

                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Mobile Header */}
                    <header className="md:hidden h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-40">
                        <div className="font-bold text-lg text-slate-900 dark:text-white">Reklam Yöneticisi</div>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </header>

                    {/* Mobile Overlay Menu */}
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-50 md:hidden flex justify-end transition-all duration-300">
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                            <div className="relative w-64 bg-surface-light dark:bg-surface-dark shadow-2xl h-full flex flex-col border-l border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                                    <span className="font-bold text-slate-900 dark:text-white">Menü</span>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <Sidebar mobile onClick={() => setIsMobileMenuOpen(false)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark scroll-smooth">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
