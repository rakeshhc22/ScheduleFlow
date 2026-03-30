export default function StatsCard({
    title,
    value,
    helper,
    icon,
    tone = "sky",
}) {
    const toneMap = {
        sky: "from-sky-500/20 to-cyan-400/10 text-sky-300 ring-sky-400/20",
        violet: "from-violet-500/20 to-indigo-400/10 text-violet-300 ring-violet-400/20",
        emerald: "from-emerald-500/20 to-teal-400/10 text-emerald-300 ring-emerald-400/20",
        slate: "from-slate-400/10 to-slate-200/5 text-slate-300 ring-white/10",
    };

    const toneClass = toneMap[tone] || toneMap.sky;

    return (
        <div className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                        {value}
                    </h3>
                    {helper ? (
                        <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>
                    ) : null}
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClass} ring-1`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
