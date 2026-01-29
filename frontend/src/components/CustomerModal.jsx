import React, { useState, useEffect } from 'react';

const CustomerModal = ({ isOpen, onClose, onSave, customer = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        website_url: '',
        phone_number: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                website_url: customer.website_url || '',
                phone_number: customer.phone_number || ''
            });
        } else {
            setFormData({
                name: '',
                website_url: '',
                phone_number: ''
            });
        }
        setErrors({});
    }, [customer, isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Şirket adı gerekli.';
        if (!formData.website_url.trim()) {
            newErrors.website_url = 'Web sitesi adresi gerekli.';
        } else {
            try {
                new URL(formData.website_url);
            } catch (e) {
                newErrors.website_url = 'Geçerli bir URL giriniz (örn: https://magaza.com).';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Save error:", error);
            setErrors({ submit: 'Kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">
                        {customer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-600">
                            {errors.submit}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">
                            Şirket Adı
                        </label>
                        <input
                            id="name"
                            className={`block w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                                }`}
                            placeholder="Örn: ABC Mağazacılık"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={isSubmitting}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="website_url">
                            Web Sitesi URL
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                                https://
                            </div>
                            <input
                                id="website_url"
                                className={`block w-full pl-16 pr-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.website_url ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-primary'
                                    }`}
                                placeholder="www.alanadi.com"
                                value={formData.website_url.replace(/^https?:\/\//, '')}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData({ ...formData, website_url: val ? `https://${val}` : '' });
                                }}
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.website_url && <p className="mt-1 text-xs text-red-500">{errors.website_url}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="phone_number">
                            Telefon Numarası (Opsiyonel)
                        </label>
                        <input
                            id="phone_number"
                            className="block w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Örn: +90 5XX XXX XX XX"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold shadow-sm shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Kaydediliyor...</span>
                                </>
                            ) : (
                                <span>Kaydet</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;
