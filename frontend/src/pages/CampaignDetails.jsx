import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { campaignsApi, customersApi, generateSms } from '../services/api';

const CampaignDetails = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('drafts'); // 'drafts' or 'saved'

    // SMS Generator State
    const [targetAudience, setTargetAudience] = useState([]);
    const [audienceInput, setAudienceInput] = useState('');
    const [drafts, setDrafts] = useState([]);
    const [savedMessages, setSavedMessages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const campaignData = await campaignsApi.getOne(campaignId);
                setCampaign(campaignData);

                if (campaignData.customer_id) {
                    const customerData = await customersApi.getOne(campaignData.customer_id);
                    setCustomer(customerData);
                }

                const saved = await campaignsApi.getMessages(campaignId);
                setSavedMessages(saved);
            } catch (err) {
                console.error("Error fetching campaign details:", err);
                setError("Kampanya detayları yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [campaignId]);

    const handleGenerate = async () => {
        if (!campaign) return;

        setIsGenerating(true);
        setError(null);
        try {
            const apiRequest = {
                website_url: customer?.website_url || '',
                products: campaign.products || [],
                start_date: campaign.start_date || null,
                end_date: campaign.end_date || null,
                discount_rate: campaign.discount_rate || 0,
                message_count: 3,
                target_audience: targetAudience.join(', '),
                phone_number: customer?.phone_number || ''
            };

            const response = await generateSms(apiRequest);
            setDrafts(response.drafts);
            setActiveTab('drafts');
        } catch (err) {
            console.error(err);
            setError("Mesajlar oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveMessage = async (draft) => {
        try {
            const messageData = {
                content: draft.content,
                target_audience: targetAudience.join(', ')
            };
            const saved = await campaignsApi.saveMessage(campaignId, messageData);
            setSavedMessages([saved, ...savedMessages]);
            alert("Mesaj başarıyla kaydedildi!");
        } catch (err) {
            console.error("Failed to save message:", err);
            setError("Mesaj kaydedilemedi.");
        }
    };

    const handleAddAudienceToken = (e) => {
        if (e.key === 'Enter' && audienceInput.trim()) {
            e.preventDefault();
            if (!targetAudience.includes(audienceInput.trim())) {
                setTargetAudience([...targetAudience, audienceInput.trim()]);
            }
            setAudienceInput('');
        }
    };

    const removeAudienceToken = (token) => {
        setTargetAudience(targetAudience.filter(t => t !== token));
    };

    const handleDeleteSaved = async (messageId) => {
        if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
        try {
            await campaignsApi.deleteMessage(campaignId, messageId);
            setSavedMessages(savedMessages.filter(m => m.id !== messageId));
        } catch (err) {
            console.error("Failed to delete message:", err);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Mesaj kopyalandı!");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="p-8 text-center text-slate-500">
                Kampanya bulunamadı.
            </div>
        );
    }

    const calculateDaysRemaining = (endDate) => {
        if (!endDate) return 0;
        const diff = new Date(endDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const daysRemaining = calculateDaysRemaining(campaign.end_date);

    return (
        <div className="flex-1 overflow-y-auto bg-background-light scroll-smooth h-full">
            <main className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-slate-500">
                    <Link to="/campaigns" className="hover:text-primary transition-colors font-medium text-slate-500 no-underline">Kampanyalar</Link>
                    <span className="material-symbols-outlined text-[16px] mx-2 text-slate-400">chevron_right</span>
                    <div className="flex items-center gap-2 font-medium">
                        <span className="text-slate-900 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                            {customer?.name}: {campaign.name}
                        </span>
                    </div>
                </nav>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-sm ring-1 ring-red-100">
                        <span className="material-symbols-outlined text-[20px]">error</span>
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto hover:text-red-800">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                )}

                {/* Campaign Header Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-opacity opacity-50 group-hover:opacity-100"></div>
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="relative w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group/img ring-4 ring-slate-50">
                                {customer?.logo_url ? (
                                    <img src={customer.logo_url} alt={customer.name} className="w-16 h-auto object-contain transition-transform group-hover/img:scale-110" />
                                ) : (
                                    <span className="text-3xl font-extrabold text-primary">{customer?.name?.charAt(0).toUpperCase() || '?'}</span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200/80">
                                        <span className="material-symbols-outlined text-[14px]">storefront</span>
                                        {customer?.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-1.5">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{campaign.name}</h1>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${campaign.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        campaign.status === 'Taslak' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                        {campaign.status === 'Aktif' && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                        )}
                                        {campaign.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg">
                                        <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
                                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) : '-'} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </div>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 hidden md:block"></span>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-bold ${daysRemaining > 0 ? 'text-orange-600 bg-orange-50 border-orange-100 shadow-sm shadow-orange-100/50' : 'text-red-600 bg-red-50 border-red-100'
                                        }`}>
                                        <span className="material-symbols-outlined text-[16px]">{daysRemaining > 0 ? 'schedule' : 'history'}</span>
                                        {daysRemaining > 0 ? `${daysRemaining} gün kaldı` : 'Süre doldu'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => navigate('/campaigns')} // This should eventually open the edit modal
                                className="flex-1 md:flex-none h-12 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                Düzenle
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="flex-1 md:flex-none h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className={`material-symbols-outlined text-[22px] ${isGenerating ? 'animate-spin' : 'group-hover/btn:rotate-12 transition-transform'}`}>auto_awesome</span>
                                {isGenerating ? 'Üretiliyor...' : 'Mesaj Üret'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products & Config Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2 bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all group hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.1em] flex items-center gap-2.5">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <span className="material-symbols-outlined text-[20px] block font-bold">inventory_2</span>
                                </div>
                                KAMPANYA ÜRÜNLERİ
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            {campaign.products?.map((product, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 hover:bg-slate-100/80 transition-colors shadow-sm">
                                    <span className="text-sm font-bold text-slate-700">{product}</span>
                                </div>
                            ))}
                            {(!campaign.products || campaign.products.length === 0) && (
                                <span className="text-sm text-slate-400 italic">Ürün belirtilmemiş.</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all group hover:shadow-md">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.1em] flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-emerald-100/50 rounded-xl text-emerald-600">
                                <span className="material-symbols-outlined text-[20px] block font-bold">percent</span>
                            </div>
                            İNDİRİM ORANI
                        </span>
                        <div className="flex items-baseline gap-2 mt-auto">
                            <span className="text-4xl font-black text-slate-900 leading-none">%{campaign.discount_rate || 0}</span>
                        </div>
                    </div>

                    <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all group hover:shadow-md">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.1em] flex items-center gap-2.5 mb-4">
                            <div className="p-2 bg-indigo-100/50 rounded-xl text-indigo-600">
                                <span className="material-symbols-outlined text-[20px] block font-bold">schedule</span>
                            </div>
                            KALAN SÜRE
                        </span>
                        <div className="flex items-baseline gap-2 mt-auto">
                            <span className={`text-3xl font-black leading-none ${daysRemaining > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                                {daysRemaining > 0 ? daysRemaining : 0}
                            </span>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Gün</span>
                        </div>
                    </div>
                </div>

                {/* Tag Based Audience Selection */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                        <div className="p-2.5 bg-blue-100/50 rounded-xl text-primary">
                            <span className="material-symbols-outlined text-[24px] block font-bold">groups</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Hedef Kitle</h3>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                            Hedef Kitle Özellikleri
                        </label>
                        <div className="flex flex-wrap gap-2.5 p-4 bg-white border-2 border-slate-100 rounded-2xl min-h-[72px] focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-inner items-center">
                            {targetAudience.map((token, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-blue-50 text-primary border border-blue-100/50 rounded-xl px-4 py-2 font-bold text-sm shadow-sm group/tag animate-in zoom-in-95 duration-200">
                                    {token}
                                    <button
                                        onClick={() => removeAudienceToken(token)}
                                        className="text-primary/40 hover:text-primary transition-colors flex items-center"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ))}
                            <input
                                type="text"
                                value={audienceInput}
                                onChange={(e) => setAudienceInput(e.target.value)}
                                onKeyDown={handleAddAudienceToken}
                                placeholder={targetAudience.length === 0 ? "Örn: Gençler, Moda Severler, Açık Hava Sporcuları..." : "Yenisini ekle..."}
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400 min-w-[200px]"
                            />
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 px-1">
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            Kitle özelliklerini yazıp Enter'a basarak ekleyebilirsiniz.
                        </p>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="flex flex-col gap-6 mt-4">
                    <div className="border-b border-slate-200/60">
                        <nav className="-mb-px flex space-x-10">
                            <button
                                onClick={() => setActiveTab('drafts')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-[15px] flex items-center gap-2.5 transition-all focus:outline-none relative ${activeTab === 'drafts' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[22px] ${activeTab === 'drafts' ? 'filled' : ''}`}>auto_awesome</span>
                                Yapay Zeka Taslakları
                                {drafts.length > 0 && (
                                    <span className="bg-primary text-white px-2 py-0.5 rounded-md text-[11px] ml-1 font-black shadow-sm shadow-primary/20">{drafts.length}</span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-[15px] flex items-center gap-2.5 transition-all focus:outline-none relative ${activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[22px] ${activeTab === 'saved' ? 'filled' : ''}`}>bookmark_added</span>
                                Kaydedilen Mesajlar
                                {savedMessages.length > 0 && (
                                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded-md text-[11px] ml-1 font-black shadow-sm shadow-slate-800/20">{savedMessages.length}</span>
                                )}
                            </button>
                        </nav>
                    </div>

                    <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
                        {activeTab === 'drafts' ? (
                            <div className="space-y-6">
                                {isGenerating ? (
                                    <div className="bg-white p-16 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center gap-6 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse">auto_awesome</span>
                                        </div>
                                        <div className="space-y-2 relative">
                                            <p className="text-slate-900 font-bold text-lg">Yapay zeka mesajlarınızı kurguluyor...</p>
                                            <p className="text-slate-400 text-sm font-medium">Bu işlem yaklaşık 5-10 saniye sürebilir.</p>
                                        </div>
                                    </div>
                                ) : drafts.length === 0 ? (
                                    <div className="bg-white p-16 rounded-3xl border border-slate-200 flex flex-col items-center gap-6 text-slate-400 shadow-inner bg-slate-50/30">
                                        <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl opacity-40">chat_bubble_outline</span>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-slate-900 font-bold text-lg">Henüz mesaj üretilmedi</p>
                                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Yukarıdaki "Mesaj Üret" butonuna basarak kampanyan için özelleştirilmiş SMS metinleri oluşturabilirsin.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-5">
                                        {drafts.map((draft, idx) => (
                                            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col md:flex-row gap-8 relative group">
                                                <div className="flex-1 space-y-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
                                                            <span className="material-symbols-outlined text-[16px] mr-1.5">auto_sparkles</span>
                                                            AI TASLAK {idx + 1}
                                                        </span>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                            <span className="material-symbols-outlined text-[16px] mr-1.5">groups</span>
                                                            {targetAudience}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-800 text-[17px] font-medium leading-[1.6] bg-slate-50/80 p-6 rounded-2xl border border-slate-100/50 shadow-inner group-hover:bg-white transition-colors">
                                                        {draft.content}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-5 text-[13px] font-bold text-slate-400">
                                                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg"><span className="material-symbols-outlined text-[18px] text-slate-300">short_text</span> {draft.content.length} Karakter</span>
                                                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg"><span className="material-symbols-outlined text-[18px] text-slate-300">sms</span> {Math.ceil(draft.content.length / 160)} SMS Boyutu</span>
                                                        <span className="flex items-center gap-1.5 text-emerald-600 ml-auto bg-emerald-50 px-3 py-1 rounded-lg">
                                                            <span className="material-symbols-outlined text-[18px]">verified</span>
                                                            İndirim Odaklı
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row md:flex-col items-center justify-center gap-4 md:border-l border-slate-100 md:pl-8 min-w-[160px]">
                                                    <button
                                                        onClick={() => handleSaveMessage(draft)}
                                                        className="flex-1 md:w-full h-12 flex items-center justify-center gap-2.5 px-6 rounded-xl bg-primary text-white font-bold text-[14px] hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                                                        Kaydet
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopy(draft.content)}
                                                        className="h-12 w-12 md:w-full flex items-center justify-center gap-2.5 px-3 rounded-xl border-2 border-slate-100 bg-white text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-slate-50 transition-all font-bold text-sm"
                                                        title="Kopyala"
                                                    >
                                                        <span className="material-symbols-outlined text-[22px]">content_copy</span>
                                                        <span className="hidden md:block">Kopyala</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {savedMessages.length === 0 ? (
                                    <div className="bg-white p-16 rounded-3xl border border-slate-200 flex flex-col items-center gap-6 text-slate-400 shadow-inner bg-slate-50/30">
                                        <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl opacity-40">inventory</span>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-slate-900 font-bold text-lg">Kayıtlı mesajın yok</p>
                                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Beğendiğin taslakları kaydederek burada saklayabilir ve daha sonra düzenleyebilirsin.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-5">
                                        {savedMessages.map((msg) => (
                                            <div key={msg.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                                                <div className="flex-1 space-y-5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                                                            <span className="material-symbols-outlined text-[16px] mr-1.5">verified</span>
                                                            KAYITLI MESAJ
                                                        </span>
                                                        <span className="text-[13px] font-bold text-slate-400 flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[16px]">history</span>
                                                            {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} tarihinde eklendi
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-800 text-[17px] font-medium leading-[1.6] p-6 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
                                                        {msg.content}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-5 text-[13px] font-bold text-slate-400">
                                                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg"><span className="material-symbols-outlined text-[18px] text-slate-300">short_text</span> {msg.content.length} Karakter</span>
                                                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg"><span className="material-symbols-outlined text-[18px] text-slate-300">sms</span> {Math.ceil(msg.content.length / 160)} SMS</span>
                                                        <span className="flex items-center gap-2 text-slate-700 bg-white border border-slate-100 shadow-sm px-4 py-1.5 rounded-xl ml-auto">
                                                            <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                                            Hedef: {msg.target_audience}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row md:flex-col items-center justify-center gap-4 md:border-l border-slate-100 md:pl-8 min-w-[160px]">
                                                    <button
                                                        onClick={() => handleCopy(msg.content)}
                                                        className="flex-1 md:w-full h-12 flex items-center justify-center gap-2.5 px-6 rounded-xl bg-slate-900 text-white font-bold text-[14px] hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                                        Kopyala
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSaved(msg.id)}
                                                        className="h-12 w-12 md:w-full flex items-center justify-center gap-2.5 px-3 rounded-xl border-2 border-red-50 bg-white text-red-400 hover:text-red-700 hover:border-red-200 transition-all font-bold text-sm"
                                                        title="Sil"
                                                    >
                                                        <span className="material-symbols-outlined text-[22px]">delete_sweep</span>
                                                        <span className="hidden md:block">Sil</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Production Trend Section REMOVED */}
            </main>
        </div>
    );
};

export default CampaignDetails;
