import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error('Password reset error:', err);
            if (err.code === 'auth/user-not-found') {
                setError('Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Geçersiz e-posta adresi.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.');
            } else {
                setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setError('');
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {!success ? (
                    <>
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Şifremi Unuttum</h2>
                            <p className="text-sm text-slate-500 mt-2">
                                E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reset-email">
                                    E-posta Adresi
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                                    </div>
                                    <input
                                        type="email"
                                        id="reset-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@alanadi.com"
                                        required
                                        disabled={loading}
                                        className="block w-full pl-10 pr-4 py-3 border border-slate-200 bg-white rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm disabled:opacity-70"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">send</span>
                                        Bağlantı Gönder
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                onClick={handleClose}
                                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Giriş sayfasına dön
                            </button>
                        </div>
                    </>
                ) : (
                    /* Success state */
                    <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">E-posta Gönderildi!</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Şifre sıfırlama bağlantısı <span className="font-medium text-slate-700">{email}</span> adresine gönderildi.
                            Gelen kutunuzu kontrol edin.
                        </p>
                        <button
                            onClick={handleClose}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Giriş Sayfasına Dön
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
