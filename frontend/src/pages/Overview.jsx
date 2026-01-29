import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { customersApi, campaignsApi } from '../services/api';
import CampaignModal from '../components/CampaignModal';

const Overview = () => {
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        messagesThisMonth: 0,
        activeCustomers: 0,
        totalCustomers: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customers, campaigns] = await Promise.all([
                    customersApi.getAll(),
                    campaignsApi.getAll()
                ]);

                setCustomers(customers);

                // Calculate stats
                const activeCustomersCount = customers.length; // Simplified for now
                const totalCampaignsCount = campaigns.length;

                // For messages, we'd need to fetch messages for each campaign or have a separate meta API
                // For now, let's use some illustrative numbers or fetch counts if possible
                // Recent 5 activities
                const recent = campaigns.slice(0, 5).map(c => {
                    const customer = customers.find(cust => cust.id === c.customer_id);
                    return {
                        ...c,
                        customerName: customer?.name || 'Bilinmeyen Müşteri',
                        customerInitial: customer?.name ? customer.name[0].toUpperCase() : '?'
                    };
                });

                setStats({
                    totalCampaigns: totalCampaignsCount,
                    messagesThisMonth: 2854, // Placeholder as per design until meta API exists
                    activeCustomers: activeCustomersCount,
                    totalCustomers: customers.length
                });
                setRecentActivities(recent);
            } catch (error) {
                console.error("Error fetching overview data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateClick = () => {
        setEditingCampaign(null);
        setIsModalOpen(true);
    };

    const handleSaveCampaign = async (formData) => {
        try {
            const created = await campaignsApi.create(formData);
            // Refresh recent activities by prepending the new one
            const activity = {
                ...created,
                customerName: customers.find(c => c.id === created.customer_id)?.name || 'Bilinmeyen Müşteri',
                customerInitial: customers.find(c => c.id === created.customer_id)?.name[0].toUpperCase() || '?'
            };
            setRecentActivities([activity, ...recentActivities.slice(0, 4)]);
            setStats(prev => ({ ...prev, totalCampaigns: prev.totalCampaigns + 1 }));
        } catch (error) {
            console.error("Failed to save campaign:", error);
            throw error;
        }
    };

    const StatCard = ({ title, value, icon, color, trend, trendLabel }) => (
        <div className="flex flex-col justify-between rounded-xl p-6 bg-white border border-slate-300 shadow-sm transition-all hover:shadow-md group relative overflow-hidden">
            <div className={`absolute right-0 top-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-${color}-600`}>
                <span className="material-symbols-outlined text-[100px]">{icon}</span>
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
                <div className={`bg-${color}-50 text-${color}-600 p-2 rounded-lg`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
            </div>
            <div className="relative z-10">
                <div className="flex items-baseline gap-2">
                    <p className="text-slate-900 text-3xl font-bold leading-tight">{value}</p>
                    {trend && (
                        <span className="text-emerald-600 text-sm font-medium flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
                            {trend}
                        </span>
                    )}
                </div>
                <p className="text-slate-400 text-xs mt-1">{trendLabel}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 flex flex-col gap-10 min-h-full pb-12">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[#0e141b] text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">İş Akışı Odaklı Genel Bakış</h2>
                    <p className="text-[#4e7397] text-base font-normal mt-1">Operasyonel süreçler ve üretim metriklerinin anlık takibi.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 order-last sm:order-first">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        {new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                        onClick={() => navigate('/customers')}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Müşteri Ekle
                    </button>
                    <button
                        onClick={handleCreateClick}
                        className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Yeni Kampanya
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Toplam Kampanya"
                    value={stats.totalCampaigns}
                    icon="campaign"
                    color="blue"
                    trend="+12%"
                    trendLabel="Geçen aya göre"
                />
                <StatCard
                    title="Bu Ay Üretilen Mesaj"
                    value={stats.messagesThisMonth.toLocaleString()}
                    icon="forum"
                    color="purple"
                    trend="+24%"
                    trendLabel="1.200 hedef üzerine"
                />
                <StatCard
                    title="Aktif Müşteriler"
                    value={stats.activeCustomers}
                    icon="group"
                    color="orange"
                    trendLabel={`${stats.totalCustomers} toplam müşteri`}
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="xl:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[#0e141b] text-xl font-bold">Son Kampanya Aktiviteleri</h3>
                        <NavLink to="/campaigns" className="text-sm font-medium text-primary hover:text-blue-700 flex items-center gap-1 transition-colors">
                            Tümünü Gör
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </NavLink>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden h-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                                        <th className="px-6 py-4 tracking-wider">Kampanya</th>
                                        <th className="px-6 py-4 tracking-wider">Müşteri</th>
                                        <th className="px-6 py-4 tracking-wider">Tarih</th>
                                        <th className="px-6 py-4 tracking-wider text-center">Durum</th>
                                        <th className="px-6 py-4 tracking-wider text-right">Eylem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-400">Yükleniyor...</td>
                                        </tr>
                                    ) : recentActivities.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-400">Henüz kampanya bulunmuyor.</td>
                                        </tr>
                                    ) : (
                                        recentActivities.map(activity => (
                                            <tr key={activity.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">{activity.name}</span>
                                                        <span className="text-xs text-slate-500">{activity.products?.join(', ')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                                                            {activity.customerInitial}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700">{activity.customerName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {new Date(activity.created_at).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' :
                                                        activity.status === 'Taslak' ? 'bg-yellow-100 text-yellow-800' :
                                                            activity.status === 'Planlandı' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-slate-100 text-slate-800'
                                                        }`}>
                                                        {activity.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/campaigns/${activity.id}`)}
                                                            className="text-slate-400 hover:text-primary transition-colors"
                                                            title="Yönet"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">settings_accessibility</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Weekly Trend */}
                <div className="xl:col-span-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[#0e141b] text-xl font-bold">Haftalık Üretim Trendi</h3>
                        <button className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-6 flex flex-col h-full min-h-[400px]">
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Günlük Mesaj Üretimi</h4>
                            <p className="text-2xl font-bold text-slate-900 mt-1">840 Mesaj</p>
                            <p className="text-sm text-green-600 mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                Bu hafta %15 artış
                            </p>
                        </div>
                        <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-4 border-b border-slate-100 pb-2">
                            {[
                                { day: 'Pzt', val: '40%', num: 120 },
                                { day: 'Sal', val: '55%', num: 165 },
                                { day: 'Çar', val: '35%', num: 105 },
                                { day: 'Per', val: '60%', num: 180 },
                                { day: 'Cum', val: '75%', num: 225 },
                                { day: 'Cmt', val: '20%', num: 45, highlight: true }
                            ].map((d, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                    <div
                                        className={`w-full ${d.highlight ? 'bg-primary' : 'bg-purple-100 group-hover:bg-purple-200'} rounded-t-sm relative transition-all shadow-sm`}
                                        style={{ height: d.val }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {d.num}
                                        </div>
                                    </div>
                                    <span className={`text-xs ${d.highlight ? 'font-bold text-slate-700' : 'text-slate-400'}`}>{d.day}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500">En Verimli Gün</span>
                                <span className="text-sm font-semibold text-slate-800">Cuma</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-300 pt-8 pb-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">verified</span>
                        <p>© 2026 Reklam Yönetim Paneli A.Ş. Tüm hakları saklıdır.</p>
                    </div>
                    <div className="flex gap-6 font-medium">
                        <a className="hover:text-primary transition-colors" href="#">Gizlilik Politikası</a>
                        <a className="hover:text-primary transition-colors" href="#">Kullanım Şartları</a>
                        <a className="hover:text-primary transition-colors" href="#">Yardım Merkezi</a>
                    </div>
                </div>
            </footer>

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

export default Overview;
