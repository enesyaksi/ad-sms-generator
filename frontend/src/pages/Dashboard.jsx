import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customersApi } from '../services/api';
import CustomerCard from '../components/CustomerCard';

const Dashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await customersApi.getAll();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartCampaign = (customer) => {
        navigate('/generator', { state: { customer } });
    };

    const handleEdit = (customer) => {
        // This will be implemented in Issue #9 with CustomerModal
        console.log("Edit customer:", customer);
        // navigate(`/customers/edit/${customer.id}`); 
    };

    const handleDelete = async (id) => {
        // This will be implemented in Issue #9 with a confirmation dialog
        if (window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
            try {
                await customersApi.delete(id);
                setCustomers(customers.filter(c => c.id !== id));
            } catch (error) {
                console.error("Failed to delete customer:", error);
            }
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.website_url?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 transition-all duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Ana Sayfa</Link>
                        </li>
                        <li>
                            <span className="text-slate-300 dark:text-slate-600">/</span>
                        </li>
                        <li>
                            <span aria-current="page" className="font-medium text-slate-900 dark:text-slate-100">Müşteri Seçimi</span>
                        </li>
                    </ol>
                </nav>

                {/* Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2 text-left">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Müşterilerimiz</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-light">Lütfen kampanya oluşturmak için bir müşteri seçin.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/customers/new"
                            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/25 whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Yeni Müşteri Ekle</span>
                        </Link>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-surface-light dark:bg-surface-dark p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full text-left">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="İsim, marka veya URL ile müşteri ara..."
                            className="block w-full pl-10 pr-3 py-2.5 border-none bg-transparent rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 sm:text-sm outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                    <div className="flex items-center gap-2 w-full sm:w-auto px-2">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Filtrele
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">sort</span>
                            Sırala
                        </button>
                    </div>
                </div>

                {/* Customer Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-[180px] animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCustomers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCustomers.map((customer) => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                onStartCampaign={handleStartCampaign}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                        {/* "Add New" Card */}
                        <Link
                            to="/customers/new"
                            className="group bg-background-light dark:bg-background-dark rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-5 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-full min-h-[180px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">add</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-primary">Yeni Ekle</span>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-surface-light dark:bg-surface-dark rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-400 text-4xl">search_off</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Müşteri Bulunamadı</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Aramanızla eşleşen bir müşteri bulunamadı veya henüz müşteri eklenmedi.</p>
                        <Link
                            to="/customers/new"
                            className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm"
                        >
                            Yeni Müşteri Ekle
                        </Link>
                    </div>
                )}

                {/* Pagination Info */}
                {!loading && filteredCustomers.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Toplam <span className="font-medium text-slate-900 dark:text-white">{filteredCustomers.length}</span> müşteriden <span className="font-medium text-slate-900 dark:text-white">1-{filteredCustomers.length}</span> arası gösteriliyor
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-400" disabled>
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
