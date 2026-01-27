import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { customersApi } from '../services/api';
import CustomerCard from '../components/CustomerCard';
import CustomerModal from '../components/CustomerModal';

const Dashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuth();
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 8;

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

    const handleAddClick = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (selectedCustomer) {
                const updated = await customersApi.update(selectedCustomer.id, formData);
                setCustomers(customers.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await customersApi.create(formData);
                setCustomers([created, ...customers]);
            }
        } catch (error) {
            console.error("Failed to save customer:", error);
            throw error; // Let modal handle the error display
        }
    };

    const handleDelete = async (id) => {
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

    // Pagination calculations
    // Add 1 to total count for the "Add New" card
    const totalItems = filteredCustomers.length + 1;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    // Show "Add New" card if there's space on current page
    const showAddCard = paginatedCustomers.length < ITEMS_PER_PAGE && currentPage === totalPages;

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link to="/" className="text-slate-500 hover:text-primary transition-colors">Ana Sayfa</Link>
                        </li>
                        <li>
                            <span className="text-slate-300">/</span>
                        </li>
                        <li>
                            <span aria-current="page" className="font-medium text-slate-900">Müşteri Seçimi</span>
                        </li>
                    </ol>
                </nav>

                {/* Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2 text-left">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                            Hoş Geldin, {user?.displayName || 'Kullanıcı'} 👋
                        </h2>
                        <p className="text-slate-500 text-lg font-light">Lütfen kampanya oluşturmak için bir müşteri seçin.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAddClick}
                            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/25 whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Yeni Müşteri Ekle</span>
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-surface-light p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full text-left">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400">search</span>
                        </div>
                        <input
                            type="text"
                            placeholder="İsim, marka veya URL ile müşteri ara..."
                            className="block w-full pl-10 pr-3 py-2.5 border-none bg-transparent rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 sm:text-sm outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                    <div className="flex items-center gap-2 w-full sm:w-auto px-2">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Filtrele
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">sort</span>
                            Sırala
                        </button>
                    </div>
                </div>

                {/* Customer Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-surface-light rounded-xl border border-slate-200 p-5 h-[180px] animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-200"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCustomers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedCustomers.map((customer) => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                onStartCampaign={handleStartCampaign}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                        {/* "Add New" Card - Only show on last page with available space */}
                        {showAddCard && (
                            <div
                                onClick={handleAddClick}
                                className="group bg-background-light rounded-xl border-2 border-dashed border-slate-300 p-5 hover:border-primary hover:bg-slate-50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-full min-h-[180px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">add</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-600 group-hover:text-primary">Yeni Ekle</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-surface-light rounded-2xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-400 text-4xl">search_off</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Müşteri Bulunamadı</h3>
                        <p className="text-slate-500 mt-2">Aramanızla eşleşen bir müşteri bulunamadı veya henüz müşteri eklenmedi.</p>
                        <button
                            onClick={handleAddClick}
                            className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm"
                        >
                            Yeni Müşteri Ekle
                        </button>
                    </div>
                )}

                {/* Pagination Info */}
                {!loading && filteredCustomers.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                        <div className="text-sm text-slate-500">
                            Toplam <span className="font-medium text-slate-900">{filteredCustomers.length}</span> müşteriden <span className="font-medium text-slate-900">{startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)}</span> arası gösteriliyor
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <span className="text-sm font-medium text-slate-700 min-w-[60px] text-center">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                customer={selectedCustomer}
            />
        </div>
    );
};

export default Dashboard;
