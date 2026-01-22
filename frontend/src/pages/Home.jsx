import { useState } from 'react';
import AdForm from '../components/Form/AdForm';
import Preview from '../components/Preview/Preview';
import { generateSms } from '../services/api';

export default function Home() {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            // API call to generate SMS
            const response = await generateSms(formData);
            setDrafts(response.drafts);
        } catch (err) {
            console.error(err);
            setError('Failed to generate messages. Please try again.');

            // MOCK DATA FOR DEMO PURPOSES IF API FAILS
            if (import.meta.env.DEV) {
                setTimeout(() => {
                    setDrafts([
                        { type: 'Short', content: 'Summer Sale! Get 25% OFF on Summer Dresses and Beach Towels. Limited time only. Shop at myshop.com/summer-sale' },
                        { type: 'Urgent', content: '[Last Chance] 25% OFF Summer Sale ends soon! Grab your Summer Dress before stock runs out. Link: myshop.com/summer-sale' },
                        { type: 'Friendly', content: 'Hey there! ☀️ Ready for summer? We have a special 25% discount just for you on all Summer Dresses. Check it out: myshop.com/summer-sale' }
                    ]);
                    setLoading(false);
                }, 1000);
                return;
            }
        } finally {
            if (!import.meta.env.DEV) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col">
            <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-center bg-no-repeat bg-cover rounded-lg size-10 shadow-sm" style={{ backgroundImage: 'linear-gradient(135deg, #197fe6 0%, #0d47a1 100%)' }}>
                                <div className="w-full h-full flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal">AdManager</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">AI Marketing Tool</p>
                            </div>
                        </div>
                        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Create New Campaign</h2>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full relative">
                <div className="p-4 md:p-8 pb-20">
                    <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">

                        {/* Left Column: Configuration Form */}
                        <div className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-6">
                            {error && (
                                <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}
                            <AdForm onSubmit={handleGenerate} loading={loading} />
                        </div>

                        {/* Right Column: Preview */}
                        <div className="xl:col-span-5 2xl:col-span-4 flex flex-col gap-6 relative">
                            <Preview drafts={drafts} />
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
