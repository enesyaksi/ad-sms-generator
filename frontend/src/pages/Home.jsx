import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { generateSms } from '../services/api';

export default function Home() {
    const location = useLocation();
    const [formData, setFormData] = useState({
        websiteUrl: '',
        products: [],
        startDate: '',
        endDate: '',
        discountRate: 25,
        messageCount: 6,
        targetAudience: [],
        phoneNumber: ''
    });

    useEffect(() => {
        if (location.state?.customer) {
            const { customer } = location.state;
            setFormData(prev => ({
                ...prev,
                websiteUrl: customer.website_url || '',
                phoneNumber: customer.phone_number || '',
                // Add other fields if they exist in customer object
            }));
        }
    }, [location]);

    const [productInput, setProductInput] = useState('');
    const [audienceInput, setAudienceInput] = useState('');
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProductKeyDown = (e) => {
        if (e.key === 'Enter' && productInput.trim()) {
            e.preventDefault();
            setFormData((prev) => ({
                ...prev,
                products: [...prev.products, productInput.trim()],
            }));
            setProductInput('');
        }
    };

    const removeProduct = (index) => {
        setFormData((prev) => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index),
        }));
    };

    const handleAudienceKeyDown = (e) => {
        if (e.key === 'Enter' && audienceInput.trim()) {
            e.preventDefault();
            setFormData((prev) => ({
                ...prev,
                targetAudience: [...prev.targetAudience, audienceInput.trim()],
            }));
            setAudienceInput('');
        }
    };

    const removeAudienceTag = (index) => {
        setFormData((prev) => ({
            ...prev,
            targetAudience: prev.targetAudience.filter((_, i) => i !== index),
        }));
    };

    const handleGenerate = async () => {
        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            setError("Hata: Bitiş tarihi başlangıç tarihinden önce olamaz.");
            return;
        }
        setLoading(true);
        setError(null);
        setEditingIndex(null);
        try {
            const apiRequest = {
                website_url: formData.websiteUrl,
                products: formData.products,
                start_date: formData.startDate || null,
                end_date: formData.endDate || null,
                discount_rate: parseInt(formData.discountRate),
                message_count: parseInt(formData.messageCount),
                target_audience: formData.targetAudience.join(', '),
                phone_number: formData.phoneNumber
            };

            const response = await generateSms(apiRequest);
            setDrafts(response.drafts);
        } catch (err) {
            console.error(err);
            setError("Uyarı: SMS oluşturulamadı. Lütfen Backend'in çalıştığından emin olun.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleEditToggle = (index) => {
        setEditingIndex(editingIndex === index ? null : index);
    };

    const handleDraftEditChange = (index, newValue) => {
        const updatedDrafts = [...drafts];
        updatedDrafts[index].content = newValue;
        setDrafts(updatedDrafts);
    };

    const badges = {
        Short: "bg-indigo-100 text-indigo-700",
        Urgent: "bg-rose-100 text-rose-700",
        Friendly: "bg-emerald-100 text-emerald-700",
        Klasik: "bg-indigo-100 text-indigo-700",
        Acil: "bg-rose-100 text-rose-700",
        Samimi: "bg-emerald-100 text-emerald-700",
        Minimalist: "bg-purple-100 text-purple-700"
    };

    return (
        <div className="h-full overflow-y-auto p-3 md:p-4">
            {/* Breadcrumbs & Header */}
            <div className="max-w-[1400px] mx-auto space-y-3">
                <nav aria-label="Breadcrumb" className="flex">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <Link to="/" className="text-slate-500 hover:text-primary transition-colors font-medium">Müşteri Paneli</Link>
                        </li>
                        <li>
                            <span className="text-slate-300">/</span>
                        </li>
                        <li>
                            <span aria-current="page" className="font-semibold text-slate-900">SMS Oluşturucu</span>
                        </li>
                    </ol>
                </nav>

                {location.state?.customer && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {location.state.customer.logo_url ? (
                                <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                    <img src={location.state.customer.logo_url} alt={location.state.customer.name} className="w-full h-full object-contain p-1.5" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                    {location.state.customer.name?.charAt(0).toUpperCase() || 'M'}
                                </div>
                            )}
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {location.state.customer.name}
                                </h2>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">public</span>
                                    {location.state.customer.website_url}
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/"
                            className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">group</span>
                            Müşteri Değiştir
                        </Link>
                    </div>
                )}
            </div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-2">
                            <span className="material-symbols-outlined text-primary">edit_note</span>
                            <h3 className="text-lg font-semibold text-slate-900">Yapılandırma</h3>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-shake">
                                <span className="material-symbols-outlined text-[20px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Website URL */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 text-sm font-medium">Web Sitesi URL (Kilitli)</label>
                            <div className="flex w-full items-center rounded-lg border border-slate-200 bg-slate-50 focus-within:ring-0 overflow-hidden transition-all group">
                                <div className="pl-3 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                                <input
                                    name="websiteUrl"
                                    value={formData.websiteUrl}
                                    readOnly
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-500 h-11 text-sm outline-none px-2 cursor-not-allowed"
                                    placeholder="https://www.magazaniz.com"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Bu URL müşteri kaydına bağlıdır ve bu sayfada değiştirilemez.</p>
                        </div>

                        {/* Products */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 text-sm font-medium">Satıştaki Ürünler</label>
                            <div className="flex flex-wrap items-center gap-2 w-full p-2 min-h-[48px] rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                {formData.products.map((p, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-medium">
                                        {p}
                                        <button onClick={() => removeProduct(i)} className="hover:text-blue-700 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    value={productInput}
                                    onChange={(e) => setProductInput(e.target.value)}
                                    onKeyDown={handleProductKeyDown}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 h-8 text-sm min-w-[150px] outline-none"
                                    placeholder="Ürün yazın ve enter'a basın..."
                                />
                            </div>
                        </div>

                        {/* Inline Layout: Dates, Discount, Message Count */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Campaign Duration */}
                            <div className="md:col-span-5 flex flex-col gap-2">
                                <label className="text-slate-700 text-sm font-medium">Kampanya Süresi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        </div>
                                        <input
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 h-11 rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm outline-none appearance-none"
                                            type="date"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">event</span>
                                        </div>
                                        <input
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate}
                                            className="block w-full pl-10 pr-3 h-11 rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm outline-none appearance-none"
                                            type="date"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Discount Rate */}
                            <div className="md:col-span-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-slate-700 text-sm font-medium">İndirim Oranı</label>
                                    <span className="text-primary font-bold text-sm">%{formData.discountRate}</span>
                                </div>
                                <div className="h-11 flex items-center gap-4 px-1">
                                    <input
                                        name="discountRate"
                                        value={formData.discountRate}
                                        onChange={handleChange}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        max="100" min="0" type="range"
                                    />
                                    <input
                                        name="discountRate"
                                        type="number"
                                        value={formData.discountRate}
                                        onChange={handleChange}
                                        className="w-20 rounded-lg border border-slate-300 bg-white text-slate-900 text-center text-sm focus:border-primary focus:ring-primary outline-none py-2"
                                    />
                                </div>
                            </div>

                            {/* Message Count */}
                            <div className="md:col-span-3 flex flex-col gap-2">
                                <label className="text-slate-700 text-sm font-medium">Taslak Sayısı</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <span className="material-symbols-outlined text-[18px]">layers</span>
                                    </div>
                                    <input
                                        name="messageCount"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.messageCount}
                                        onChange={handleChange}
                                        className="block w-full pl-10 h-11 rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm outline-none"
                                        placeholder="6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Audience (Tag-based) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-2">
                            <span className="material-symbols-outlined text-primary">group</span>
                            <h3 className="text-lg font-semibold text-slate-900">Hedef Kitle</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 text-sm font-medium">Hedef Kitle Özellikleri</label>
                            <div className="flex flex-wrap items-center gap-2 w-full p-2 min-h-[80px] rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                {formData.targetAudience.map((tag, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-medium">
                                        {tag}
                                        <button onClick={() => removeAudienceTag(i)} className="hover:text-blue-700 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    value={audienceInput}
                                    onChange={(e) => setAudienceInput(e.target.value)}
                                    onKeyDown={handleAudienceKeyDown}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 h-8 text-sm min-w-[200px] outline-none"
                                    placeholder="Örn: Açık Hava Sporcuları..."
                                />
                            </div>
                            <p className="text-xs text-slate-500">Hedef kitle özelliklerini yazıp enter'a basarak ekleyebilirsiniz.</p>
                        </div>
                    </div>

                    <div className="flex pt-2">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-4 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Mesajları Oluştur
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Column (Preview) */}
                <div className="xl:col-span-5 2xl:col-span-4 flex flex-col gap-6 relative">
                    <div className="sticky top-28 flex flex-col gap-4 max-h-[calc(100vh-140px)]">
                        <div className="flex items-center justify-between bg-background-light pb-2 z-10">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">preview</span>
                                Yapı Zeka Taslakları
                            </h3>
                            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {drafts.length} Oluşturuldu
                            </span>
                        </div>

                        {drafts.length === 0 ? (
                            <div className="flex flex-col gap-6 items-center justify-center text-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400">
                                <span className="material-symbols-outlined text-6xl opacity-20">chat_bubble_outline</span>
                                <p>Henüz mesaj oluşturulmadı.<br />Formu doldurun ve oluştur butonuna basın.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-4">
                                {drafts.map((draft, i) => (
                                    <div key={i} className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:border-primary/50 transition-all overflow-hidden shrink-0 relative">
                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taslak {i + 1}</span>
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badges[draft.type] || 'bg-slate-100'}`}>
                                                {draft.type}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            {editingIndex === i ? (
                                                <textarea
                                                    className="w-full min-h-[100px] p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-2 focus:ring-primary/50 outline-none"
                                                    value={draft.content}
                                                    onChange={(e) => handleDraftEditChange(i, e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {draft.content}
                                                </p>
                                            )}
                                        </div>
                                        <div className="px-4 py-3 flex gap-2 justify-end border-t border-slate-100 bg-slate-50/50">
                                            <button
                                                onClick={() => handleCopy(draft.content)}
                                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                                title="Kopyala"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                            </button>
                                            <button
                                                onClick={() => handleEditToggle(i)}
                                                className={`p-1.5 rounded-md transition-colors ${editingIndex === i ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-primary hover:bg-primary/10'}`}
                                                title="Düzenle"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">{editingIndex === i ? 'save' : 'edit'}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
