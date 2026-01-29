import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
    const { user, updateUserName, changePassword } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswordForm, setShowPasswordForm] = useState(false);


    useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await updateUserName(displayName);
            setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Profil güncellenirken bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Şifreler eşleşmiyor.' });
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setMessage({ type: 'error', text: 'Şifre en az 8 karakter olmalı, en az bir küçük harf, bir büyük harf ve bir özel karakter içermelidir.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await changePassword(newPassword);
            setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi!' });
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/requires-recent-login') {
                setMessage({ type: 'error', text: 'Bu işlem için yakında giriş yapmış olmanız gerekiyor. Lütfen tekrar giriş yapıp deneyin.' });
            } else {
                setMessage({ type: 'error', text: 'Şifre değiştirilirken bir hata oluştu.' });
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kullanıcı Ayarları</h1>
                    <p className="text-slate-500">Profilinizi ve uygulama tercihlerinizi yönetin.</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}>
                        <span className="material-symbols-outlined">
                            {message.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                {/* Profile Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <span className="material-symbols-outlined text-primary">person</span>
                        <h2 className="text-lg font-semibold text-slate-900">Profil Bilgileri</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Görünen Ad</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    maxLength={100}
                                    className="w-full p-3 bg-white rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Adınız Soyadınız"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">E-posta Adresi</label>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 cursor-not-allowed">
                                    {user?.email}
                                </div>
                                <p className="text-[10px] text-slate-400">E-posta adresi değiştirilemez.</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || displayName === user?.displayName}
                                className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>


                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <span className="material-symbols-outlined text-primary">security</span>
                        <h2 className="text-lg font-semibold text-slate-900">Güvenlik</h2>
                    </div>

                    {!showPasswordForm ? (
                        <button
                            onClick={() => setShowPasswordForm(true)}
                            className="text-sm font-semibold text-primary hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                            Şifreyi Değiştir
                        </button>
                    ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Yeni Şifre</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    maxLength={128}
                                    className="w-full p-2.5 bg-white rounded-lg border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    maxLength={128}
                                    className="w-full p-2.5 bg-white rounded-lg border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
