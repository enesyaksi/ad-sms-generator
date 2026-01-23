import { useState } from 'react';
import { generateSms } from '../services/api';

export default function Home() {
    const [formData, setFormData] = useState({
        websiteUrl: 'https://myshop.com/summer-sale',
        products: ['Summer Dress', 'Beach Towel'],
        startDate: '',
        endDate: '',
        discountRate: 25,
        messageCount: 3,
        targetAudience: ''
    });

    const [productInput, setProductInput] = useState('');
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

    const handleGenerate = async () => {
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
                target_audience: formData.targetAudience
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
        Short: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
        Urgent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
        Friendly: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    };

    return (
        <div className="p-4 md:p-8 pb-20">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
                <div className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
                            <span className="material-symbols-outlined text-primary">edit_note</span>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Yapılandırma</h3>
                        </div>

                        {/* Website URL */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Web Sitesi URL</label>
                            <div className="flex w-full items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden transition-all">
                                <div className="pl-3 flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined">public</span>
                                </div>
                                <input
                                    name="websiteUrl"
                                    value={formData.websiteUrl}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 h-11 text-sm outline-none px-2"
                                    placeholder="https://www.magazaniz.com"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Ürün detaylarını almak için bu sayfayı tarayacağız.</p>
                        </div>

                        {/* Products */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Satıştaki Ürünler</label>
                            <div className="flex flex-wrap items-center gap-2 w-full p-2 min-h-[48px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                {formData.products.map((p, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 px-2.5 py-1 rounded-md text-sm font-medium">
                                        {p}
                                        <button onClick={() => removeProduct(i)} className="hover:text-blue-700 dark:hover:text-white flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </div>
                                ))}
                                <input
                                    value={productInput}
                                    onChange={(e) => setProductInput(e.target.value)}
                                    onKeyDown={handleProductKeyDown}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 h-8 text-sm min-w-[150px] outline-none"
                                    placeholder="Ürün yazın ve enter'a basın..."
                                />
                            </div>
                        </div>

                        {/* Date & Discount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Kampanya Süresi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        </div>
                                        <input
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="block w-full pl-10 h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm outline-none"
                                            placeholder="Başlangıç Tarihi" type="text"
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
                                            className="block w-full pl-10 h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm outline-none"
                                            placeholder="Bitiş Tarihi" type="text"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">İndirim Oranı</label>
                                    <span className="text-primary font-bold text-sm">%{formData.discountRate}</span>
                                </div>
                                <div className="h-11 flex items-center gap-4 px-1">
                                    <input
                                        name="discountRate"
                                        value={formData.discountRate}
                                        onChange={handleChange}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
                                        max="100" min="0" type="range"
                                    />
                                    <input
                                        name="discountRate"
                                        type="number"
                                        value={formData.discountRate}
                                        onChange={handleChange}
                                        className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center text-sm focus:border-primary focus:ring-primary outline-none py-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message Count Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Oluşturulacak Mesaj Sayısı</label>
                            <div className="flex w-full items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden transition-all">
                                <div className="pl-3 flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined">numbers</span>
                                </div>
                                <input
                                    name="messageCount"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.messageCount}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 h-11 text-sm outline-none px-2"
                                    placeholder="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
                            <span className="material-symbols-outlined text-primary">group</span>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hedef Kitle</h3>
                        </div>
                        <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Kitle Tanımı (İsteğe Bağlı)</label>
                        <textarea
                            name="targetAudience"
                            value={formData.targetAudience}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y min-h-[100px]"
                            placeholder="Örn: 20-30 yaş arası, teknolojiye ilgili, İzmir'de yaşayan üniversite öğrencileri..."
                        />
                    </div>

                    <div className="flex pt-2">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                    <div className="sticky top-28 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">preview</span>
                                Yapay Zeka Taslakları
                            </h3>
                            <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                {drafts.length} Oluşturuldu
                            </span>
                        </div>

                        {drafts.length === 0 ? (
                            <div className="flex flex-col gap-6 items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-400">
                                <span className="material-symbols-outlined text-6xl opacity-20">chat_bubble_outline</span>
                                <p>Henüz mesaj oluşturulmadı.<br />Formu doldurun ve oluştur butonuna basın.</p>
                            </div>
                        ) : (
                            drafts.map((draft, i) => (
                                <div key={i} className="group bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all overflow-hidden relative">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taslak {String.fromCharCode(65 + i)}</span>
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badges[draft.type] || 'bg-slate-100'}`}>
                                            {draft.type}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        {editingIndex === i ? (
                                            <textarea
                                                className="w-full min-h-[100px] p-2 border border-slate-300 rounded-md text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 outline-none"
                                                value={draft.content}
                                                onChange={(e) => handleDraftEditChange(i, e.target.value)}
                                            />
                                        ) : (
                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                {draft.content}
                                            </p>
                                        )}
                                    </div>
                                    <div className="px-4 py-3 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
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
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
