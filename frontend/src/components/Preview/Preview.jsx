export default function Preview({ drafts }) {
    if (!drafts || drafts.length === 0) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center text-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400">
                <span className="material-symbols-outlined text-6xl opacity-20">chat_bubble_outline</span>
                <p>No messages generated yet.<br />Fill out the form and click Generate.</p>
            </div>
        );
    }

    const badges = {
        Short: "bg-indigo-100 text-indigo-700",
        Urgent: "bg-rose-100 text-rose-700",
        Friendly: "bg-emerald-100 text-emerald-700"
    };

    return (
        <div className="flex flex-col gap-6 relative">
            <div className="sticky top-28 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">preview</span>
                        AI Drafts
                    </h3>
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {drafts.length} Generated
                    </span>
                </div>

                {drafts.map((draft, index) => (
                    <div key={index} className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:border-primary/50 transition-all overflow-hidden relative">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Draft {String.fromCharCode(65 + index)}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badges[draft.type] || "bg-slate-100"}`}>
                                {draft.type}
                            </span>
                        </div>
                        <div className="p-4">
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                {draft.content}
                            </p>
                        </div>
                        <div className="px-4 py-3 flex gap-2 justify-end border-t border-slate-100 bg-slate-50/50">
                            <button
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                title="Copy"
                                onClick={() => navigator.clipboard.writeText(draft.content)}
                            >
                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                            <button
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                title="Edit"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}
