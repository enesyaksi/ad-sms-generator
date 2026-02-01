import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyEmail = () => {
    const { user, sendVerificationEmail, logout } = useAuth();
    const navigate = useNavigate();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);

    // Check verification status periodically
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.emailVerified) {
            navigate('/');
            return;
        }

        // Check every 3 seconds
        const interval = setInterval(async () => {
            await user.reload();
            if (user.emailVerified) {
                navigate('/');
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [user, navigate]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0) return;

        setSending(true);
        setMessage('');
        setError('');

        try {
            await sendVerificationEmail();
            setMessage('Doğrulama e-postası gönderildi! Gelen kutunuzu kontrol edin.');
            setCooldown(60); // 60 second cooldown
        } catch (err) {
            console.error('Error sending verification email:', err);
            if (err.code === 'auth/too-many-requests') {
                setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.');
            } else {
                setError('E-posta gönderilirken bir hata oluştu.');
            }
        } finally {
            setSending(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-amber-600 text-5xl">mail</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 text-center">E-postanızı Doğrulayın</h1>
                    <p className="text-slate-500 mt-2 text-center max-w-sm">
                        <span className="font-medium text-slate-700">{user.email}</span> adresine bir doğrulama bağlantısı gönderdik.
                    </p>
                </div>

                <div className="bg-surface-light rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-blue-600 text-[20px] mt-0.5">info</span>
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Doğrulama Adımları:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                                        <li>E-posta gelen kutunuzu kontrol edin</li>
                                        <li>Spam/Gereksiz klasörünü de kontrol edin</li>
                                        <li>Doğrulama bağlantısına tıklayın</li>
                                        <li>Bu sayfa otomatik olarak yenilenecektir</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleResend}
                            disabled={sending || cooldown > 0}
                            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Gönderiliyor...
                                </>
                            ) : cooldown > 0 ? (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">timer</span>
                                    Tekrar Gönder ({cooldown}s)
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                    Tekrar Gönder
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                onClick={handleLogout}
                                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Farklı bir hesapla giriş yap
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500">
                    © 2026 Reklam Yöneticisi Admin Paneli
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
