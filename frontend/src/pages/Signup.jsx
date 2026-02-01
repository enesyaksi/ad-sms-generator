import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, updateUserName, sendVerificationEmail, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const validateForm = () => {
        if (!name.trim()) {
            setError('Lütfen adınızı ve soyadınızı girin.');
            return false;
        }

        // Password strength: min 8 chars, 1 lowercase, 1 uppercase, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Şifre en az 8 karakter olmalı, en az bir küçük harf, bir büyük harf ve bir özel karakter içermelidir.');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Şifreler birbiriyle eşleşmiyor.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            // 1. Create User
            await register(email, password);

            // 2. Update Display Name
            await updateUserName(name.trim());

            // 3. Send verification email
            await sendVerificationEmail();

            // Navigate to verify email page
            navigate('/verify-email');
        } catch (err) {
            console.error("Signup error:", err);
            // Map Firebase error codes to Turkish messages
            if (err.code === 'auth/email-already-in-use') {
                setError('Bu e-posta adresi zaten kullanımda.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Geçersiz bir e-posta adresi girdiniz.');
            } else if (err.code === 'auth/weak-password') {
                setError('Şifre çok zayıf.');
            } else {
                setError('Kayıt yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                        <span className="material-symbols-outlined text-white text-4xl">campaign</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Yeni Hesap Oluştur</h1>
                    <p className="text-slate-500 mt-2">AdManager'a katılın</p>
                </div>

                <div className="bg-surface-light rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="name">Ad Soyad</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 bg-white rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                    id="name"
                                    name="name"
                                    placeholder="Ad Soyad"
                                    required
                                    type="text"
                                    maxLength={100}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">E-posta</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 bg-white rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                    id="email"
                                    name="email"
                                    placeholder="ornek@alanadi.com"
                                    required
                                    type="email"
                                    maxLength={254}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">Şifre</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 bg-white rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                    maxLength={128}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">En az 8 karakter, küçük ve büyük harf ve özel karakter (.,!).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="confirmPassword">Şifre Tekrar</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">lock_reset</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 bg-white rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                    maxLength={128}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Zaten bir hesabınız var mı?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                Giriş Yapın
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500">
                    © 2026 Reklam Yöneticisi Admin Paneli
                </p>
            </div>
        </div>
    );
};

export default Signup;
