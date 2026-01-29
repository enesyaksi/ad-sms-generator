import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { campaignsApi, customersApi } from '../services/api';
import CampaignModal from '../components/CampaignModal';

const Campaigns = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerFilter, setCustomerFilter] = useState('Tüm Müşteriler');
    const [statusFilter, setStatusFilter] = useState('Tüm Durumlar');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [campaignsData, customersData] = await Promise.all([
                    campaignsApi.getAll(),
                    customersApi.getAll()
                ]);
                setCampaigns(campaignsData);
                setCustomers(customersData);
            } catch (error) {
                console.error("Error fetching campaigns data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
        const customer = customers.find(c => c.id === campaign.customer_id);
        const matchesCustomer = customerFilter === 'Tüm Müşteriler' || customer?.name === customerFilter;
        const matchesStatus = statusFilter === 'Tüm Durumlar' || campaign.status === statusFilter;
        return matchesSearch && matchesCustomer && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const clearFilters = () => {
        setSearchTerm('');
        setCustomerFilter('Tüm Müşteriler');
        setStatusFilter('Tüm Durumlar');
        setCurrentPage(1);
    };

    const handleEditClick = (campaign) => {
        setEditingCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleCreateClick = () => {
        setEditingCampaign(null);
        setIsModalOpen(true);
    };

    const handleSaveCampaign = async (formData) => {
        try {
            if (editingCampaign) {
                const updated = await campaignsApi.update(editingCampaign.id, formData);
                setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await campaignsApi.create(formData);
                setCampaigns([...campaigns, created]);
            }
        } catch (error) {
            console.error("Failed to save campaign:", error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background-light relative w-full">
            <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-left">
                        <h2 className="text-[#0e141b] text-3xl font-black leading-tight tracking-[-0.033em]">Kampanyalar</h2>
                        <p className="text-[#4e7397] text-base font-normal mt-1">Tüm pazarlama aktivitelerinizi tek bir listeden izleyin ve yönetin.</p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="bg-primary hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all self-start md:self-auto"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Yeni Kampanya
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <div className="relative w-full lg:w-96 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-slate-700 placeholder-slate-400 transition-all"
                            placeholder="Kampanya adı ile ara..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative">
                            <select
                                className="appearance-none pl-3 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-primary bg-white cursor-pointer min-w-[160px] hover:border-slate-300 transition-colors"
                                value={customerFilter}
                                onChange={(e) => { setCustomerFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option>Tüm Müşteriler</option>
                                {customers.map(customer => (
                                    <option key={customer.id}>{customer.name}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">keyboard_arrow_down</span>
                        </div>
                        <div className="relative">
                            <select
                                className="appearance-none pl-3 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-primary bg-white cursor-pointer min-w-[160px] hover:border-slate-300 transition-colors"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option>Tüm Durumlar</option>
                                <option>Aktif</option>
                                <option>Taslak</option>
                                <option>Planlandı</option>
                                <option>Tamamlandı</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">keyboard_arrow_down</span>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="p-2.5 text-slate-500 hover:text-primary border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            title="Filtreleri Temizle"
                        >
                            <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                                    <th className="px-6 py-4 tracking-wider w-1/3">Kampanya Adı</th>
                                    <th className="px-6 py-4 tracking-wider">Müşteri</th>
                                    <th className="px-6 py-4 tracking-wider text-center">Durum</th>
                                    <th className="px-6 py-4 tracking-wider">Tarih Aralığı</th>
                                    <th className="px-6 py-4 tracking-wider text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {paginatedCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 whitespace-nowrap">Herhangi bir kampanya bulunamadı.</td>
                                    </tr>
                                ) : (
                                    paginatedCampaigns.map(campaign => {
                                        const customer = customers.find(c => c.id === campaign.customer_id);
                                        return (
                                            <tr key={campaign.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-900 block truncate" title={campaign.name}>{campaign.name}</span>
                                                    <span className="text-xs text-slate-400">ID: #{campaign.id.slice(0, 8).toUpperCase()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold ring-2 ring-white shadow-sm overflow-hidden">
                                                            {customer?.logo_url ? (
                                                                <img src={customer.logo_url} alt={customer.name} className="w-full h-full object-contain" />
                                                            ) : (
                                                                customer?.name?.charAt(0).toUpperCase() || '?'
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-slate-700 whitespace-nowrap">{customer?.name || 'Bilinmeyen Müşteri'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${campaign.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                        campaign.status === 'Taslak' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            campaign.status === 'Planlandı' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                        {campaign.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    {new Date(campaign.start_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {new Date(campaign.end_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-right transition-colors shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-md transition-all"
                                                            title="Görüntüle"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(campaign)}
                                                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-md transition-all"
                                                            title="Düzenle"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <p className="text-sm text-slate-500 text-left">
                                Toplam <span className="font-bold text-slate-700">{filteredCampaigns.length}</span> kampanya arasından <span className="font-bold text-slate-700">
                                    {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCampaigns.length)}-{Math.min(currentPage * itemsPerPage, filteredCampaigns.length)}
                                </span> arası gösteriliyor
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCampaign}
                campaign={editingCampaign}
                customers={customers}
            />
        </div>
    );
};

export default Campaigns;
