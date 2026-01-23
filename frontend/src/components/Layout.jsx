import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen w-full flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
            <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-lg size-10 shadow-sm"
                                style={{ backgroundImage: 'linear-gradient(135deg, #197fe6 0%, #0d47a1 100%)' }}
                            >
                                <div className="w-full h-full flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal">AdManager</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">AI Marketing Tool</p>
                            </div>
                        </Link>
                        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Create New Campaign</h2>
                    </div>
                    {/* Added Navigation Links for demo purposes */}
                    <nav className="flex gap-4">
                        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300">Create</Link>
                        <Link to="/saved" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300">Saved</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 w-full relative">
                <Outlet />
            </main>
        </div>
    );
}
