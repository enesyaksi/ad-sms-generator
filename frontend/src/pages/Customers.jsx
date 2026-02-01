import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { customersApi, campaignsApi } from '../services/api';
import CustomerCard from '../components/CustomerCard';
import CustomerModal from '../components/CustomerModal';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('alphabetical');
    const [filterOption, setFilterOption] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuth();
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [customersData, campaignsData] = await Promise.all([
                customersApi.getAll(),
                campaignsApi.getAll()
            ]);
            setCustomers(customersData);
            setCampaigns(campaignsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Get campaigns for a customer
    const getCustomerCampaigns = (customerId) => {
        return campaigns.filter(c => c.customer_id === customerId);
    };

    // Helper: Check if customer has campaigns with specific status
    const hasStatusCampaign = (customerId, status) => {
        return campaigns.some(c => c.customer_id === customerId && c.status === status);
    };

    // Helper: Get most recent campaign activity date for a customer
    const getLastActivityDate = (customerId) => {
        const customerCampaigns = getCustomerCampaigns(customerId);
        if (customerCampaigns.length === 0) return null;
        const dates = customerCampaigns.map(c => new Date(c.updated_at || c.created_at));
        return Math.max(...dates);
    };

    const handleStartCampaign = (customer) => {
        navigate(`/customers/${customer.id}`);
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
                setCustomers([...customers, created]);
            }
        } catch (error) {
            console.error("Failed to save customer:", error);
            throw error;
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

    // Filter customers
    const filteredCustomers = customers.filter(customer => {
        // Search filter
        const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.website_url?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Campaign status filter
        const customerCampaigns = getCustomerCampaigns(customer.id);

        switch (filterOption) {
            case 'with_campaigns':
                return customerCampaigns.length > 0;
            case 'without_campaigns':
                return customerCampaigns.length === 0;
            case 'active':
                return hasStatusCampaign(customer.id, 'Aktif');
            case 'planned':
                return hasStatusCampaign(customer.id, 'Planlandı');
            case 'draft':
                return hasStatusCampaign(customer.id, 'Taslak');
            case 'completed':
                return hasStatusCampaign(customer.id, 'Tamamlandı');
            default:
                return true;
        }
    });

    // Sort customers
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        switch (sortOption) {
            case 'alphabetical':
                return (a.name || '').localeCompare(b.name || '', 'tr');
            case 'recently_added':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'first_added':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'recently_operated':
                const dateA = getLastActivityDate(a.id) || new Date(a.created_at);
                const dateB = getLastActivityDate(b.id) || new Date(b.created_at);
                return dateB - dateA;
            default:
                return 0;
        }
    });

    // Pagination calculations
    const totalItems = sortedCustomers.length + 1;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

    const showAddCard = paginatedCustomers.length < ITEMS_PER_PAGE && currentPage === totalPages;

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortOption, filterOption]);

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto flex flex-col min-h-full space-y-4">
                {/* Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2 text-left">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                            Müşteriler
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
                        {/* Filter Dropdown */}
                        <div className="relative flex-1 sm:flex-none">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">filter_list</span>
                            </div>
                            <select
                                value={filterOption}
                                onChange={(e) => setFilterOption(e.target.value)}
                                className="appearance-none w-full pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 bg-transparent hover:bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-colors"
                            >
                                <option value="all">Tüm Müşteriler</option>
                                <option value="with_campaigns">Kampanyalı</option>
                                <option value="without_campaigns">Kampanyasız</option>
                                <option value="active">Aktif Kampanyalı</option>
                                <option value="planned">Planlanmış Kampanyalı</option>
                                <option value="draft">Taslak Kampanyalı</option>
                                <option value="completed">Tamamlanmış Kampanyalı</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
                            </div>
                        </div>
                        {/* Sort Dropdown */}
                        <div className="relative flex-1 sm:flex-none">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">sort</span>
                            </div>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="appearance-none w-full pl-10 pr-8 py-2 rounded-lg text-sm font-medium text-slate-600 bg-transparent hover:bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-colors"
                            >
                                <option value="alphabetical">Alfabetik</option>
                                <option value="recently_added">En Son Eklenen</option>
                                <option value="first_added">İlk Eklenen</option>
                                <option value="recently_operated">Son İşlem Yapılan</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Grid */}
                {/* Customer Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-surface-light rounded-xl border border-slate-200 p-5 h-[270px] animate-pulse">
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
                    ) : (
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
                            {/* "Add New" Card */}
                            {showAddCard && (
                                <div
                                    onClick={handleAddClick}
                                    className="group bg-background-light rounded-xl border-2 border-dashed border-slate-300 p-5 hover:border-primary hover:bg-slate-50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-full min-h-[270px]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">add</span>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-primary">Yeni Ekle</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination Info */}
                {!loading && (
                    <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-auto">
                        <div className="text-sm text-slate-500">
                            Toplam <span className="font-medium text-slate-900">{filteredCustomers.length}</span> müşteriden <span className="font-medium text-slate-900">
                                {filteredCustomers.length > 0 && paginatedCustomers.length > 0
                                    ? `${Math.min(startIndex + 1, filteredCustomers.length)}-${Math.min(endIndex, filteredCustomers.length)}`
                                    : filteredCustomers.length === 0
                                        ? "0"
                                        : "-"
                                }
                            </span> arası gösteriliyor
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

export default Customers;
