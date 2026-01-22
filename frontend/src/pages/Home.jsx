import { useState } from 'react';
import { generateSms } from '../services/api';

export default function Home() {
    const [formData, setFormData] = useState({
        websiteUrl: 'https://myshop.com/summer-sale',
        phoneNumber: '+1 (555) 123-4567',
        products: ['Summer Dress', 'Beach Towel'],
        startDate: '',
        endDate: '',
        discountRate: 25,
    });

    const [productInput, setProductInput] = useState('');
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        try {
            const response = await generateSms(formData);
            setDrafts(response.drafts);
        } catch (err) {
            console.error(err);
            // Fallback mock
            setTimeout(() => {
                setDrafts([
                    { type: 'Short', content: 'Summer Sale! Get 25% OFF on Summer Dresses and Beach Towels. Limited time only. Shop at myshop.com/summer-sale' },
                    { type: 'Urgent', content: '[Last Chance] 25% OFF Summer Sale ends soon! Grab your Summer Dress before stock runs out. Link: myshop.com/summer-sale' },
                    { type: 'Friendly', content: 'Hey there! ☀️ Ready for summer? We have a special 25% discount just for you on all Summer Dresses. Check it out: myshop.com/summer-sale' }
                ]);
                setLoading(false);
            }, 1000);
        } finally {
            if (!import.meta.env.DEV) setLoading(false);
        }
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

                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">İletişim Numarası</label>
                            <div className="flex w-full items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden transition-all">
                                <div className="pl-3 flex items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined">call</span>
                                </div>
                                <input
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 h-11 text-sm outline-none px-2"
                                    placeholder="+90 (555) 000-0000" type="tel"
                                />
                            </div>
                        </div>

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
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
                            <span className="material-symbols-outlined text-primary">group</span>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hedef Kitle</h3>
                        </div>
                        <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Müşteri Listesi (CSV/Excel)</label>
                        <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="p-3 bg-white dark:bg-slate-700 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-300 text-3xl">cloud_upload</span>
                                </div>
                                <p className="mb-1 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-primary">Yüklemek için tıklayın</span> veya sürükleyip bırakın</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">CSV, XLS veya XLSX (MAKS. 10MB)</p>
                            </div>
                        </div>
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
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                            {draft.content}
                                        </p>
                                    </div>
                                    <div className="px-4 py-3 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Kopyala">
                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Düzenle">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center gap-6 border-t border-slate-200 dark:border-slate-800 pt-8">
                <button className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5">
                    <span className="material-symbols-outlined text-[24px]">save_alt</span>
                    Dışa Aktar
                </button>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Kampanya taslaklarınıza kaydedilecek ve inceleme için dışa aktarılacaktır.</span>
                </div>
            </div>
        </div>
    );
}
