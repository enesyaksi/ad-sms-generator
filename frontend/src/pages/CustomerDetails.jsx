import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, NavLink } from 'react-router-dom';
import { customersApi, campaignsApi } from '../services/api';
import CampaignModal from '../components/CampaignModal';

const CustomerDetails = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tümü');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            console.log("Fetching data for customerId:", customerId);
            setLoading(true);

            // Fetch Customer
            try {
                const customerData = await customersApi.getOne(customerId);
                console.log("Customer data received:", customerData);
                setCustomer(customerData);
            } catch (error) {
                console.error("Error fetching customer details:", error);
            }

            // Fetch Campaigns
            try {
                const campaignsData = await campaignsApi.getAll(customerId);
                console.log("Campaigns data received:", campaignsData);
                setCampaigns(campaignsData);
            } catch (error) {
                console.error("Error fetching campaigns:", error);
                // If it's a 500 error, it might be the Firestore index issue
                if (error.response?.status === 500) {
                    console.warn("Possible missing Firestore index for campaigns query.");
                }
            }

            setLoading(false);
        };

        if (customerId) {
            fetchData();
        }
    }, [customerId]);

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Tümü' || campaign.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleCreateClick = () => {
        setEditingCampaign(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (campaign) => {
        setEditingCampaign(campaign);
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

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-slate-500 font-medium">Müşteri bulunamadı.</p>
                <Link to="/customers" className="text-primary hover:underline">Müşterilere Geri Dön</Link>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link to="/customers" className="hover:text-primary transition-colors">Müşteriler</Link>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span className="font-medium text-slate-900">{customer.name}</span>
                </nav>

                {/* Customer Header Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center w-full">
                            <div className="size-20 md:size-24 rounded-lg border border-slate-100 p-1 flex-shrink-0 bg-white shadow-sm flex items-center justify-center">
                                {customer.logo_url ? (
                                    <img src={customer.logo_url} alt={customer.name} className="w-full h-full object-contain rounded" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold rounded">
                                        {customer.name[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{customer.name}</h2>
                                    <button className="flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-md transition-all">
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        Müşteriyi Düzenle
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                    <a className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium" href={customer.website_url} target="_blank" rel="noopener noreferrer">
                                        <span className="material-symbols-outlined text-[18px]">language</span>
                                        {customer.website_url.replace(/^https?:\/\//, '')}
                                    </a>
                                    {customer.phone_number && (
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <span className="material-symbols-outlined text-[18px]">call</span>
                                            {customer.phone_number}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        Türkiye
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0 text-left">
                            <button
                                onClick={handleCreateClick}
                                className="flex w-full md:w-auto cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-primary/90 transition-colors text-white gap-2 text-sm font-medium shadow-sm shadow-blue-500/20"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span>Yeni Kampanya Oluştur</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:w-80 relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-left">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/50 text-sm placeholder-slate-400 shadow-sm transition-all outline-none"
                            placeholder="Kampanya adı ile ara..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-1 md:pb-0">
                        <div className="relative inline-block text-left flex-shrink-0">
                            <select
                                className="inline-flex justify-center w-full rounded-lg border border-slate-200 shadow-sm px-4 py-2.5 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 appearance-none pr-10"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option>Tümü</option>
                                <option>Aktif</option>
                                <option>Taslak</option>
                                <option>Planlandı</option>
                                <option>Tamamlandı</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" style={{ fontSize: '20px' }}>expand_more</span>
                        </div>
                    </div>
                </div>

                {/* Campaigns Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%]" scope="col">Kampanya Adı</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Tarih Aralığı</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">Durum</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider" scope="col">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {paginatedCampaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-400">Kampanya bulunamadı.</td>
                                    </tr>
                                ) : (
                                    paginatedCampaigns.map(campaign => (
                                        <tr key={campaign.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                        <span className="material-symbols-outlined">local_offer</span>
                                                    </div>
                                                    <div className="ml-4 text-left">
                                                        <div className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">{campaign.name}</div>
                                                        <div className="text-xs text-slate-500">{campaign.products?.join(', ')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <div className="text-sm text-slate-500">
                                                    {new Date(campaign.start_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {new Date(campaign.end_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${campaign.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                    campaign.status === 'Taslak' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                        campaign.status === 'Planlandı' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                            'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(campaign)}
                                                        className="text-slate-400 hover:text-primary p-1.5 rounded-md hover:bg-slate-50 transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                                        className="text-primary hover:text-primary/80 font-medium px-3 py-1.5 rounded-md hover:bg-primary/5 transition-colors"
                                                    >
                                                        Yönet
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="text-sm text-slate-500 text-left">
                                Toplam <span className="font-medium text-slate-900">{filteredCampaigns.length}</span> kampanyadan <span className="font-medium text-slate-900">
                                    {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCampaigns.length)}-{Math.min(currentPage * itemsPerPage, filteredCampaigns.length)}
                                </span> arası gösteriliyor
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Önceki
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sonraki
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
                customers={customer ? [customer] : []}
                lockedCustomerId={customerId}
            />
        </div>
    );
};

export default CustomerDetails;
