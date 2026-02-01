import React, { useState, useEffect } from 'react';

const CampaignModal = ({ isOpen, onClose, onSave, campaign, customers = [], lockedCustomerId = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        customer_id: '',
        start_date: '',
        end_date: '',
        products: [],
        discount_rate: 0,
        status: 'Taslak'
    });
    const [productInput, setProductInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Helper to get local date string YYYY-MM-DD
    const getLocalDateString = (addDays = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + addDays);
        return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    };

    useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name || '',
                customer_id: campaign.customer_id || '',
                start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
                end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
                products: campaign.products || [],
                discount_rate: campaign.discount_rate || 0,
                status: campaign.status || 'Taslak'
            });
        } else {
            setFormData({
                name: '',
                customer_id: lockedCustomerId || '',
                start_date: getLocalDateString(0), // Today local
                end_date: getLocalDateString(7),   // Next week local
                products: [],
                discount_rate: 0,
                status: 'Taslak'
            });
        }
        setProductInput('');
        setError('');
    }, [campaign, isOpen, lockedCustomerId]);

    // Validation
    const validateDates = (start, end) => {
        const today = getLocalDateString(0);

        // Rule 1: Start date must be today or future
        // Note: For editing existing campaigns, allow past dates ONLY if it matches the original start date.
        // (i.e. we can't change it to a DIFFERENT past date, but we can keep the existing one)
        const originalStart = campaign?.start_date?.split('T')[0];

        if (start < today && start !== originalStart) {
            return "Başlangıç tarihi geçmişte olamaz.";
        }

        // Rule 2: End date must be after start date
        if (end <= start) {
            return "Bitiş tarihi başlangıç tarihinden sonra olmalıdır.";
        }
        return "";
    };

    if (!isOpen) return null;

    const handleProductKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmedValue = productInput.trim();
            if (trimmedValue && !formData.products.includes(trimmedValue)) {
                setFormData({ ...formData, products: [...formData.products, trimmedValue] });
                setProductInput('');
            }
        }
    };

    const removeProduct = (productToRemove) => {
        setFormData({
            ...formData,
            products: formData.products.filter(p => p !== productToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.customer_id || !formData.start_date || !formData.end_date) {
            setError('Lütfen zorunlu alanları doldurun.');
            return;
        }

        const dateError = validateDates(formData.start_date, formData.end_date);
        if (dateError) {
            setError(dateError);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                products: formData.products,
                customer_id: formData.customer_id
            };
            await onSave(payload);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const todayVal = getLocalDateString(0);
    const originalStart = campaign?.start_date?.split('T')[0];
    // If editing a campaign with a past start date, allow that date. Otherwise, min is Today.
    const minStart = (originalStart && originalStart < todayVal) ? originalStart : todayVal;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900">
                        {campaign ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Oluştur'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5 text-left">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Müşteri *</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 bg-white disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                            required
                            disabled={!!lockedCustomerId}
                        >
                            <option value="">Müşteri Seçin</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Kampanya Adı *</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400"
                            placeholder="Örn: Bahar İndirimi 2024"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Başlangıç Tarihi *</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                min={minStart}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Bitiş Tarihi *</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                min={formData.start_date}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Ürünler</label>
                        <div className="w-full px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all min-h-[80px]">
                            <div className="flex flex-wrap gap-2">
                                {formData.products.map((product, index) => (
                                    <span
                                        key={index}
                                        className="bg-slate-100 text-slate-700 rounded-lg px-2 py-1 flex items-center gap-1 text-sm"
                                    >
                                        {product}
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(product)}
                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    className="flex-1 min-w-[150px] outline-none text-slate-900 placeholder:text-slate-400 py-1"
                                    placeholder="Ürün adı yazıp Enter'a basın..."
                                    value={productInput}
                                    onChange={(e) => setProductInput(e.target.value)}
                                    onKeyDown={handleProductKeyDown}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">İndirim Oranı (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                                    value={formData.discount_rate}
                                    onChange={(e) => setFormData({ ...formData, discount_rate: parseInt(e.target.value) || 0 })}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                            </div>
                        </div>

                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 active:scale-[0.98] transition-all"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    <span>{campaign ? 'Güncelle' : 'Kaydet'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CampaignModal;
