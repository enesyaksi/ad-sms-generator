import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { campaignsApi, customersApi, generateSms } from '../services/api';
import CampaignModal from '../components/CampaignModal';

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
    const [messageCount, setMessageCount] = useState(3);
    const [drafts, setDrafts] = useState([]);
    const [savedMessages, setSavedMessages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingDraftIdx, setEditingDraftIdx] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);

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

                // Fetch customers for the edit modal
                const customersList = await customersApi.getAll();
                setCustomers(customersList);
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
                message_count: messageCount,
                target_audience: targetAudience.join(', '),
                phone_number: customer?.phone_number || ''
            };
            const response = await generateSms(apiRequest);
            const audienceString = targetAudience.length > 0 ? targetAudience.join(', ') : 'Genel Kitle';
            const draftsWithAudience = response.drafts.map(d => ({
                ...d,
                target_audience: audienceString
            }));
            setDrafts(draftsWithAudience);
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
                target_audience: draft.target_audience,
                type: draft.type
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
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex-1 md:flex-none h-12 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                Düzenle
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products & Config Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Products - Reduced size */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all group hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-symbols-outlined text-[18px] block font-bold">inventory_2</span>
                                </div>
                                ÜRÜNLER
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 overflow-y-auto max-h-[72px] no-scrollbar">
                            {campaign.products?.map((product, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 hover:bg-slate-100/80 transition-colors">
                                    <span className="text-[12px] font-bold text-slate-700">{product}</span>
                                </div>
                            ))}
                            {(!campaign.products || campaign.products.length === 0) && (
                                <span className="text-[11px] text-slate-400 italic font-medium">Yok</span>
                            )}
                        </div>
                    </div>

                    {/* Discount */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-1 hover:border-primary/30 transition-all group hover:shadow-md">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-emerald-100/50 rounded-lg text-emerald-600">
                                <span className="material-symbols-outlined text-[18px] block font-bold">percent</span>
                            </div>
                            İNDİRİM
                        </span>
                        <div className="flex items-baseline gap-1 mt-auto">
                            <span className="text-3xl font-black text-slate-900 leading-none">%{campaign.discount_rate || 0}</span>
                        </div>
                    </div>

                    {/* Tag Based Audience - Inside Grid */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col hover:border-primary/30 transition-all group hover:shadow-md">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-blue-100/50 rounded-lg text-primary">
                                <span className="material-symbols-outlined text-[18px] block font-bold">group_add</span>
                            </div>
                            HEDEF KİTLE
                        </span>
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-xl min-h-[44px] max-h-[84px] overflow-y-auto focus-within:bg-white focus-within:border-primary/30 transition-all items-center no-scrollbar group-focus-within:border-primary/30">
                                {targetAudience.map((token, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-white text-primary border border-primary/20 rounded-lg px-2 py-0.5 font-bold text-[10px] shadow-sm whitespace-nowrap">
                                        {token}
                                        <button
                                            onClick={() => removeAudienceToken(token)}
                                            className="text-primary/40 hover:text-primary transition-colors flex items-center"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    value={audienceInput}
                                    onChange={(e) => setAudienceInput(e.target.value)}
                                    onKeyDown={handleAddAudienceToken}
                                    placeholder={targetAudience.length === 0 ? "Kitle yaz..." : ""}
                                    className="flex-1 bg-transparent border-none outline-none text-[12px] font-medium text-slate-700 placeholder-slate-400 min-w-[60px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message Count */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col hover:border-primary/30 transition-all group hover:shadow-md">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-amber-100/50 rounded-lg text-amber-600">
                                <span className="material-symbols-outlined text-[18px] block font-bold">chat_bubble</span>
                            </div>
                            MESAJ SAYISI
                        </span>
                        <div className="flex items-center gap-3 mt-auto">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={messageCount}
                                onChange={(e) => setMessageCount(parseInt(e.target.value) || 1)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-2xl font-black text-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                            />
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => setMessageCount(prev => Math.min(prev + 1, 10))}
                                    className="p-1 bg-slate-50 border border-slate-100 rounded-md hover:bg-slate-100 text-slate-400 hover:text-primary transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px] block">keyboard_arrow_up</span>
                                </button>
                                <button
                                    onClick={() => setMessageCount(prev => Math.max(prev - 1, 1))}
                                    className="p-1 bg-slate-50 border border-slate-100 rounded-md hover:bg-slate-100 text-slate-400 hover:text-primary transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px] block">keyboard_arrow_down</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 animate-in fade-in duration-500 slide-in-from-bottom-2">
                    {/* Yapay Zeka Taslakları Column */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
                                Yapay Zeka Taslakları
                                {drafts.length > 0 && (
                                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-[12px] font-black">{drafts.length}</span>
                                )}
                            </h2>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="h-10 px-5 rounded-xl bg-primary text-white font-bold text-[13px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                <span className={`material-symbols-outlined text-[18px] ${isGenerating ? 'animate-spin' : ''}`}>auto_awesome</span>
                                {isGenerating ? 'Üretiliyor...' : 'Mesaj Üret'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {isGenerating ? (
                                <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center gap-6 relative overflow-hidden">
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
                                <div className="bg-white p-12 rounded-3xl border border-slate-200 flex flex-col items-center gap-6 text-slate-400 shadow-inner bg-slate-50/30">
                                    <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl opacity-40">chat_bubble_outline</span>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-slate-900 font-bold text-lg">Henüz mesaj üretilmedi</p>
                                        <p className="text-slate-400 text-sm max-w-xs mx-auto">"Mesaj Üret" butonuna basarak kampanyan için SMS metinleri oluşturabilirsin.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5">
                                    {drafts.map((draft, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col gap-5 relative group">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-primary border border-primary/20 shadow-sm capitalize">
                                                        <span className="material-symbols-outlined text-[16px] mr-1.5">style</span>
                                                        {draft.type}
                                                    </span>
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                        <span className="material-symbols-outlined text-[16px] mr-1.5">groups</span>
                                                        {draft.target_audience}
                                                    </span>
                                                </div>
                                                {editingDraftIdx === idx ? (
                                                    <textarea
                                                        value={editedContent}
                                                        onChange={(e) => setEditedContent(e.target.value)}
                                                        className="w-full text-slate-800 text-[16px] font-medium leading-[1.6] bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-inner focus:border-primary outline-none min-h-[120px] transition-all"
                                                    />
                                                ) : (
                                                    <p className="text-slate-800 text-[16px] font-medium leading-[1.6] bg-slate-50/80 p-5 rounded-2xl border border-slate-100/50 shadow-inner group-hover:bg-white transition-colors">
                                                        {draft.content}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-5 text-[12px] font-bold text-slate-400">
                                                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg">
                                                        <span className="material-symbols-outlined text-[18px] text-slate-300">short_text</span>
                                                        {editingDraftIdx === idx ? editedContent.length : draft.content.length} Karakter
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => handleSaveMessage(editingDraftIdx === idx ? { ...draft, content: editedContent } : draft)}
                                                    className="flex-1 h-11 flex items-center justify-center gap-2.5 px-6 rounded-xl bg-primary text-white font-bold text-[13px] hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                                                    Kaydet
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (editingDraftIdx === idx) {
                                                            const newDrafts = [...drafts];
                                                            newDrafts[idx].content = editedContent;
                                                            setDrafts(newDrafts);
                                                            setEditingDraftIdx(null);
                                                        } else {
                                                            setEditingDraftIdx(idx);
                                                            setEditedContent(draft.content);
                                                        }
                                                    }}
                                                    className={`h-11 px-4 rounded-xl border-2 transition-all font-bold text-[13px] flex items-center gap-2 ${editingDraftIdx === idx
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                                        : 'border-slate-100 bg-white text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">{editingDraftIdx === idx ? 'check' : 'edit_note'}</span>
                                                    {editingDraftIdx === idx && "Tamam"}
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(editingDraftIdx === idx ? editedContent : draft.content)}
                                                    className="h-11 px-4 rounded-xl border-2 border-slate-100 bg-white text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-slate-50 transition-all font-bold text-[13px]"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Saved Messages Column - Phone Style */}
                    <div className="flex flex-col gap-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5 px-2">
                            <span className="material-symbols-outlined text-slate-700 text-[24px]">smartphone</span>
                            Saved Messages
                            {savedMessages.length > 0 && (
                                <span className="bg-slate-800/10 text-slate-800 px-2.5 py-0.5 rounded-lg text-[12px] font-black">{savedMessages.length}</span>
                            )}
                        </h2>

                        {/* Phone Frame */}
                        <div className="bg-slate-900 rounded-[40px] p-3 shadow-2xl shadow-slate-400/30 mx-auto w-full max-w-[380px]">
                            {/* Phone Notch */}
                            <div className="bg-slate-900 rounded-t-[32px] pt-2 pb-3 px-6 flex items-center justify-center">
                                <div className="w-24 h-6 bg-black rounded-full flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                    <div className="w-10 h-1 rounded-full bg-slate-700"></div>
                                </div>
                            </div>

                            {/* Phone Screen */}
                            <div className="bg-gradient-to-b from-slate-100 to-slate-50 rounded-[28px] overflow-hidden">
                                {/* Status Bar */}
                                <div className="bg-white/80 backdrop-blur-sm px-5 py-2 flex items-center justify-between border-b border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-500">
                                        {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] text-slate-400">signal_cellular_alt</span>
                                        <span className="material-symbols-outlined text-[14px] text-slate-400">wifi</span>
                                        <span className="material-symbols-outlined text-[14px] text-slate-400">battery_full</span>
                                    </div>
                                </div>

                                {/* Chat Header - Recipient View */}
                                <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-100 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/30">
                                        {customer?.name?.charAt(0).toUpperCase() || 'M'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 text-[14px]">{customer?.name || 'Marka'}</p>
                                        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Kampanya SMS
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 text-[22px]">more_vert</span>
                                </div>

                                {/* Messages Area - Oldest at top, newest at bottom */}
                                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] no-scrollbar flex flex-col-reverse">
                                    {savedMessages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-3xl opacity-40">chat_bubble_outline</span>
                                            </div>
                                            <p className="text-sm font-medium text-center">No saved messages yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {[...savedMessages].reverse().map((msg) => (
                                                <div key={msg.id} className="flex flex-col items-start gap-1 group">
                                                    {/* Type & Audience Tags - Above message */}
                                                    <div className="flex items-center gap-1.5 px-1 mb-0.5">
                                                        {msg.type && (
                                                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded capitalize">
                                                                {msg.type}
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {msg.target_audience}
                                                        </span>
                                                    </div>

                                                    {/* Message Bubble - Received style (left aligned, gray) */}
                                                    <div className="relative max-w-[85%] bg-white text-slate-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-slate-100">
                                                        <p className="text-[14px] leading-relaxed font-medium">
                                                            {msg.content}
                                                        </p>
                                                        {/* Bubble tail */}
                                                        <div className="absolute -bottom-0 -left-1 w-3 h-3 bg-white border-l border-b border-slate-100 rounded-br-full"></div>
                                                    </div>

                                                    {/* Message Meta */}
                                                    <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopy(msg.content)}
                                                            className="text-slate-400 hover:text-primary transition-colors"
                                                            title="Copy"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSaved(msg.id)}
                                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="bg-white px-3 py-3 border-t border-slate-100 flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 flex items-center">
                                        <span className="text-[13px] text-slate-400 font-medium">Type a message...</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                        <span className="material-symbols-outlined text-[20px]">send</span>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Home Indicator */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Campaign Modal */}
            <CampaignModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={async (data) => {
                    const updated = await campaignsApi.update(campaignId, data);
                    setCampaign(updated);
                }}
                campaign={campaign}
                customers={customers}
                lockedCustomerId={campaign?.customer_id}
            />
        </div>
    );
};

export default CampaignDetails;
