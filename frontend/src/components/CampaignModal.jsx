import React, { useState, useEffect } from 'react';

const CampaignModal = ({ isOpen, onClose, onSave, campaign, customerId }) => {
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        products: '',
        discount_rate: 0,
        status: 'Taslak'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name || '',
                start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
                end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
                products: campaign.products ? campaign.products.join(', ') : '',
                discount_rate: campaign.discount_rate || 0,
                status: campaign.status || 'Taslak'
            });
        } else {
            setFormData({
                name: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                products: '',
                discount_rate: 0,
                status: 'Taslak'
            });
        }
        setError('');
    }, [campaign, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.start_date || !formData.end_date) {
            setError('Lütfen zorunlu alanları doldurun.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                products: formData.products.split(',').map(p => p.trim()).filter(p => p !== ''),
                customer_id: customerId || campaign?.customer_id
            };
            await onSave(payload);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

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
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Ürünler (Virgülle ayırın)</label>
                        <textarea
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400 min-h-[80px] resize-none"
                            placeholder="Süt, Peynir, Yoğurt..."
                            value={formData.products}
                            onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                        />
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
                        <div className="space-y-1.5 text-left">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Durum</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 bg-white"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Taslak">Taslak</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Planlandı">Planlandı</option>
                                <option value="Tamamlandı">Tamamlandı</option>
                            </select>
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
