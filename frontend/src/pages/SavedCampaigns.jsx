import { Link } from 'react-router-dom';

export default function SavedCampaigns() {
    return (
        <div className="p-4 md:p-8 pb-20">
            {/* Just a placeholder copying structure from the HTML, 
            assuming it displays a success modal or a saved list.
            The HTML provided 'ui-design-saved-page-screen.html' mainly showed a success modal.
            This implementation assumes the 'saved' page might list them, but for now matching the success state shown in HTML.
        */}

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-sm w-full transform transition-all scale-100 opacity-100 flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center ring-1 ring-green-100">
                        <span className="material-symbols-outlined text-3xl text-green-600 filled">check_circle</span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">Kampanya Başarıyla Kaydedildi!</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Mesajlarınız oluşturuldu ve dışa aktarıldı. Dosyaları panelinizden inceleyebilirsiniz.
                        </p>
                    </div>
                    <div className="w-full flex flex-col gap-3">
                        <Link to="/" className="w-full py-3.5 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group">
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            <span>Yeni Mesaj Üret</span>
                        </Link>
                        <button className="w-full py-3 px-4 bg-transparent hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-colors">
                            Düzenlemeye Devam Et
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
