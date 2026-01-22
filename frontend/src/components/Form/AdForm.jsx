import { useState } from 'react';

export default function AdForm({ onSubmit, loading }) {
    const [formData, setFormData] = useState({
        websiteUrl: 'https://myshop.com/summer-sale',
        phoneNumber: '+1 (555) 123-4567',
        products: ['Summer Dress', 'Beach Towel'],
        startDate: '',
        endDate: '',
        discountRate: 25,
    });

    const [productInput, setProductInput] = useState('');

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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-2">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Configuration</h3>
            </div>

            {/* Website URL */}
            <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Website URL</label>
                <div className="flex w-full items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden transition-all">
                    <div className="pl-3 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">public</span>
                    </div>
                    <input
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 h-11 text-sm outline-none px-2"
                        placeholder="https://www.myshop.com"
                    />
                </div>
                <p className="text-xs text-slate-500">We will crawl this page to extract product details.</p>
            </div>

            {/* Contact Number */}
            <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Contact Number</label>
                <div className="flex w-full items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden transition-all">
                    <div className="pl-3 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">call</span>
                    </div>
                    <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 h-11 text-sm outline-none px-2"
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                    />
                </div>
            </div>

            {/* Products */}
            <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Products on Sale</label>
                <div className="flex flex-wrap items-center gap-2 w-full p-2 min-h-[48px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    {formData.products.map((product, index) => (
                        <div key={index} className="flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 px-2.5 py-1 rounded-md text-sm font-medium">
                            {product}
                            <button
                                type="button"
                                onClick={() => removeProduct(index)}
                                className="hover:text-blue-700 dark:hover:text-white flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>
                    ))}
                    <input
                        value={productInput}
                        onChange={(e) => setProductInput(e.target.value)}
                        onKeyDown={handleProductKeyDown}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 h-8 text-sm min-w-[150px] outline-none"
                        placeholder="Type product and press Enter..."
                    />
                </div>
            </div>

            {/* Campaign Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Campaign Duration</label>
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
                                placeholder="Start Date"
                                type="text"
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
                                placeholder="End Date"
                                type="text"
                            />
                        </div>
                    </div>
                </div>

                {/* Discount Rate */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-slate-700 dark:text-slate-300 text-sm font-medium">Discount Rate</label>
                        <span className="text-primary font-bold text-sm">%{formData.discountRate}</span>
                    </div>
                    <div className="h-11 flex items-center gap-4 px-1">
                        <input
                            type="range"
                            name="discountRate"
                            min="0"
                            max="100"
                            value={formData.discountRate}
                            onChange={handleChange}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
                        />
                        <input
                            type="number"
                            name="discountRate"
                            value={formData.discountRate}
                            onChange={handleChange}
                            className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center text-sm focus:border-primary focus:ring-primary outline-none py-2"
                        />
                    </div>
                </div>
            </div>

            <div className="flex pt-2">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">auto_awesome</span>
                            Generate Messages
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
