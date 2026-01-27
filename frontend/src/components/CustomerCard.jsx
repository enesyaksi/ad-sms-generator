import React from 'react';

const CustomerCard = ({ customer, onStartCampaign, onEdit, onDelete }) => {
    return (
        <div className="group bg-surface-light rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative overflow-hidden text-left">
            {/* Quick Actions (Edit/Delete) - Visible on hover */}
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
                    className="p-1.5 rounded-lg bg-white/80 text-slate-400 hover:text-primary hover:bg-white shadow-sm transition-all"
                    title="Düzenle"
                >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(customer.id); }}
                    className="p-1.5 rounded-lg bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white shadow-sm transition-all"
                    title="Sil"
                >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {/* Logo Area */}
                <div className="w-20 h-20 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {customer.logo_url ? (
                        <img src={customer.logo_url} alt={customer.name} className="w-full h-full object-contain p-2.5" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10 text-2xl font-bold">
                            {customer.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Info Area */}
                <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                        {customer.name}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1">
                        <a
                            href={customer.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-500 hover:underline truncate flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="material-symbols-outlined text-[14px]">link</span>
                            {customer.website_url?.replace(/^https?:\/\//, '')}
                        </a>
                        {customer.phone_number && (
                            <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]">call</span>
                                {customer.phone_number}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                    onClick={(e) => { e.stopPropagation(); onStartCampaign(customer); }}
                    className="text-xs text-slate-400 font-medium group-hover:text-primary flex items-center gap-1 transition-colors hover:bg-primary/5 px-2 py-1 rounded-md"
                >
                    Kampanya Başlat
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default CustomerCard;
