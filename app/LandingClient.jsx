"use client";
// app/LandingClient.jsx  ← Client Component
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Floating 3D Orb Canvas ────────────────────────────────────────────────────
function ThreeBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let raf;
        let t = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const orbs = [
            { x: 0.15, y: 0.2, r: 380, color: "#3b82f6", speed: 0.00025, phase: 0 },
            { x: 0.85, y: 0.15, r: 280, color: "#6366f1", speed: 0.0003, phase: 1 },
            { x: 0.7, y: 0.8, r: 340, color: "#0ea5e9", speed: 0.00022, phase: 2 },
            { x: 0.3, y: 0.9, r: 220, color: "#8b5cf6", speed: 0.00035, phase: 3 },
        ];

        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);

            ctx.fillStyle = "#020817";
            ctx.fillRect(0, 0, W, H);

            ctx.save();
            ctx.strokeStyle = "rgba(148,163,184,0.04)";
            ctx.lineWidth = 1;
            const gap = 60;
            for (let x = 0; x < W; x += gap) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            for (let y = 0; y < H; y += gap) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }
            ctx.restore();

            orbs.forEach((o) => {
                const drift = Math.sin(t * o.speed * 1000 + o.phase) * 40;
                const cx = W * o.x + drift;
                const cy = H * o.y + drift * 0.6;
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
                grad.addColorStop(0, o.color + "55");
                grad.addColorStop(0.4, o.color + "22");
                grad.addColorStop(1, o.color + "00");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
                ctx.fill();
            });

            const img = ctx.getImageData(0, 0, W, H);
            const d = img.data;
            for (let i = 0; i < d.length; i += 4) {
                const noise = (Math.random() - 0.5) * 12;
                d[i] += noise; d[i + 1] += noise; d[i + 2] += noise;
            }
            ctx.putImageData(img, 0, 0);

            t++;
            raf = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full"
            style={{ zIndex: 0 }}
        />
    );
}

function FloatingCard({ style, children, delay = "0s" }) {
    return (
        <div style={{ ...style, animationDelay: delay }} className="absolute animate-float pointer-events-none">
            {children}
        </div>
    );
}

export default function LandingClient() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const move = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,600;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #020817; color: #f1f5f9; overflow-x: hidden; }
        .font-display { font-family: 'Bricolage Grotesque', sans-serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(1deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(.16,1,.3,1) both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #38bdf8 0%, #818cf8 40%, #c084fc 60%, #38bdf8 100%);
          background-size: 400px 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        @keyframes pulse-ring {
          0%   { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(56,189,248,.6); }
          70%  { transform: scale(1);   box-shadow: 0 0 0 16px rgba(56,189,248,0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(56,189,248,0); }
        }
        .pulse-ring { animation: pulse-ring 2.5s ease-out infinite; }

        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .glass-card {
          background: rgba(15,23,42,0.7);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(148,163,184,0.1);
        }

        .btn-primary {
          position: relative; background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 15px;
          padding: 14px 32px; border-radius: 14px; border: none; cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden; display: inline-flex; align-items: center; gap: 8px;
          text-decoration: none; box-shadow: 0 0 32px rgba(99,102,241,0.4);
        }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #38bdf8, #818cf8); opacity: 0; transition: opacity 0.3s;
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(99,102,241,0.5); }
        .btn-primary span, .btn-primary svg { position: relative; z-index: 1; }

        .btn-ghost {
          background: transparent; color: #94a3b8; font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 15px; padding: 14px 28px; border-radius: 14px;
          border: 1px solid rgba(148,163,184,0.2); cursor: pointer;
          transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .btn-ghost:hover { background: rgba(148,163,184,0.08); color: #f1f5f9; border-color: rgba(148,163,184,0.35); }

        .feature-card { position: relative; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .feature-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(56,189,248,0.06), rgba(99,102,241,0.06));
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .feature-card:hover::before { opacity: 1; }

        .stat-number {
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 2.5rem;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #020817; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }
      `}</style>

            <ThreeBackground />

            <div style={{ position: "relative", zIndex: 1 }} className="min-h-screen flex flex-col">

                {/* Cursor glow */}
                <div style={{
                    position: "fixed", left: mousePos.x - 200, top: mousePos.y - 200,
                    width: 400, height: 400,
                    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                    borderRadius: "50%", pointerEvents: "none", zIndex: 2,
                    transition: "left 0.15s ease, top 0.15s ease",
                }} />

                {/* Navbar */}
                <nav className="glass fade-up" style={{
                    position: "sticky", top: 16, margin: "16px auto 0",
                    borderRadius: 20, padding: "14px 28px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    maxWidth: 1100, width: "calc(100% - 48px)", zIndex: 50,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="pulse-ring" style={{
                            width: 36, height: 36, background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px" }}>
                            ScheduleFlow
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Link href="/login" className="btn-ghost" style={{ padding: "10px 20px", fontSize: 14 }}>Sign in</Link>
                        <Link href="/register" className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>
                            <span>Get started</span>
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </nav>

                {/* Hero */}
                <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px 60px", textAlign: "center", position: "relative" }}>

                    <FloatingCard style={{ left: "4%", top: "8%", zIndex: 3 }} delay="0s">
                        <div className="glass-card" style={{ padding: "14px 18px", borderRadius: 16, fontSize: 13, color: "#94a3b8", minWidth: 180 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <div style={{ width: 8, height: 8, background: "#22d3ee", borderRadius: "50%", boxShadow: "0 0 8px #22d3ee" }} />
                                <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 12 }}>Meeting confirmed</span>
                            </div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>Thu, 12 Jun · 3:00 PM IST</div>
                            <div style={{ marginTop: 6, padding: "6px 10px", background: "rgba(34,211,238,0.08)", borderRadius: 8, color: "#22d3ee", fontSize: 11, fontWeight: 500 }}>
                                📅 Added to Google Cal
                            </div>
                        </div>
                    </FloatingCard>

                    <FloatingCard style={{ right: "5%", top: "12%", zIndex: 3 }} delay="1.5s">
                        <div className="glass-card" style={{ padding: "14px 18px", borderRadius: 16, fontSize: 13, minWidth: 160 }}>
                            <div style={{ color: "#64748b", fontSize: 11, marginBottom: 6 }}>Available slots</div>
                            {["9:00 AM", "11:30 AM", "2:00 PM"].map((t, i) => (
                                <div key={t} style={{
                                    padding: "5px 10px", marginBottom: 4, borderRadius: 8, fontSize: 12, fontWeight: 500,
                                    background: i === 1 ? "linear-gradient(135deg, rgba(14,165,233,0.3), rgba(99,102,241,0.3))" : "rgba(148,163,184,0.06)",
                                    color: i === 1 ? "#38bdf8" : "#94a3b8",
                                    border: i === 1 ? "1px solid rgba(56,189,248,0.3)" : "1px solid transparent",
                                }}>{t}</div>
                            ))}
                        </div>
                    </FloatingCard>

                    <FloatingCard style={{ left: "2%", bottom: "20%", zIndex: 3 }} delay="3s">
                        <div className="glass-card" style={{ padding: "12px 16px", borderRadius: 14, fontSize: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#a78bfa" }}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                                </svg>
                                <span style={{ fontWeight: 600 }}>Auto timezone</span>
                            </div>
                            <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>Showing: IST (UTC+5:30)</div>
                        </div>
                    </FloatingCard>

                    {/* Badge */}
                    <div className="fade-up delay-100" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
                        borderRadius: 99, padding: "6px 16px", marginBottom: 28, fontSize: 12, fontWeight: 600, color: "#a5b4fc",
                    }}>
                        <span style={{ width: 6, height: 6, background: "#22d3ee", borderRadius: "50%", boxShadow: "0 0 6px #22d3ee", display: "inline-block" }} />
                        Free forever · No credit card needed · Loved by 10k+ teams
                    </div>

                    {/* Headline */}
                    <h1 className="font-display fade-up delay-200" style={{
                        fontSize: "clamp(2.8rem, 7vw, 5.2rem)", fontWeight: 800, lineHeight: 1.08,
                        letterSpacing: "-2px", maxWidth: 820, marginBottom: 24, color: "#f8fafc",
                    }}>
                        Scheduling that{" "}
                        <span className="shimmer-text">actually works</span>
                        <br />for modern teams
                    </h1>

                    {/* Subheadline */}
                    <p className="fade-up delay-300" style={{
                        fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "#64748b", maxWidth: 540,
                        lineHeight: 1.7, marginBottom: 44, fontWeight: 300,
                    }}>
                        Share your booking link, let others pick a time —
                        no back-and-forth, no double bookings, no stress.
                        Works seamlessly with Google Calendar & Outlook.
                    </p>

                    {/* CTA */}
                    <div className="fade-up delay-400" style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}>
                        <Link href="/register" className="btn-primary">
                            <span>Create free account</span>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                        <Link href="/login" className="btn-ghost">Sign in to dashboard</Link>
                    </div>

                    {/* Stats */}
                    <div className="fade-up delay-500" style={{
                        display: "flex", gap: 0, marginBottom: 80,
                        background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)",
                        border: "1px solid rgba(148,163,184,0.1)", borderRadius: 20, overflow: "hidden",
                    }}>
                        {[
                            { value: "10k+", label: "Active users" },
                            { value: "2M+", label: "Bookings made" },
                            { value: "99.9%", label: "Uptime SLA" },
                            { value: "<1s", label: "Page load" },
                        ].map((s, i) => (
                            <div key={s.label} style={{
                                padding: "24px 40px", textAlign: "center",
                                borderRight: i < 3 ? "1px solid rgba(148,163,184,0.08)" : "none",
                            }}>
                                <div className="stat-number">{s.value}</div>
                                <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Feature cards */}
                    <div className="fade-up delay-600" style={{
                        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 20, maxWidth: 980, width: "100%",
                    }}>
                        {features.map(({ icon, title, desc, accent }) => (
                            <div key={title} className="glass-card feature-card" style={{ padding: 28, borderRadius: 20, textAlign: "left" }}>
                                <div style={{
                                    width: 46, height: 46, borderRadius: 14, marginBottom: 18,
                                    background: `${accent}18`, border: `1px solid ${accent}33`,
                                    display: "flex", alignItems: "center", justifyContent: "center", color: accent,
                                }}>
                                    {icon}
                                </div>
                                <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8, letterSpacing: "-0.3px" }}>
                                    {title}
                                </h3>
                                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, fontWeight: 300 }}>{desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* How it works */}
                    <div style={{ marginTop: 100, maxWidth: 880, width: "100%" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                            How it works
                        </div>
                        <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#f8fafc", letterSpacing: "-1px", marginBottom: 56 }}>
                            Up and running in 3 steps
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28 }}>
                            {steps.map(({ num, title, desc }) => (
                                <div key={num} className="glass-card" style={{ padding: 28, borderRadius: 20, textAlign: "left", position: "relative", overflow: "hidden" }}>
                                    <div style={{
                                        position: "absolute", top: 16, right: 20, fontSize: "4rem",
                                        fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 800,
                                        color: "rgba(99,102,241,0.06)", lineHeight: 1,
                                    }}>{num}</div>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 99,
                                        background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 13, fontWeight: 700, color: "white", marginBottom: 16,
                                    }}>{num}</div>
                                    <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8, letterSpacing: "-0.3px" }}>{title}</h3>
                                    <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, fontWeight: 300 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div style={{
                        marginTop: 100, maxWidth: 700, width: "100%",
                        background: "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.16))",
                        border: "1px solid rgba(99,102,241,0.25)", borderRadius: 28, padding: "56px 40px",
                        textAlign: "center", backdropFilter: "blur(20px)",
                    }}>
                        <h2 className="font-display" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, color: "#f8fafc", letterSpacing: "-1px", marginBottom: 16 }}>
                            Ready to reclaim your time?
                        </h2>
                        <p style={{ color: "#64748b", fontSize: 15, marginBottom: 32, lineHeight: 1.6, fontWeight: 300 }}>
                            Join thousands who've ditched the email ping-pong.<br />
                            Your first booking link is live in under 60 seconds.
                        </p>
                        <Link href="/register" className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
                            <span>Start for free today</span>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </main>

                {/* Footer */}
                <footer style={{ textAlign: "center", padding: "32px 24px", borderTop: "1px solid rgba(148,163,184,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 24, height: 24, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-display" style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>ScheduleFlow</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#334155" }}>© {new Date().getFullYear()} ScheduleFlow. Built with Next.js & ❤️</p>
                </footer>
            </div>
        </>
    );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const features = [
    {
        title: "Instant booking links",
        desc: "Get a personalised page at scheduleflow.app/yourname in seconds. Share it anywhere — email, Slack, LinkedIn.",
        accent: "#38bdf8",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
    },
    {
        title: "Two-way calendar sync",
        desc: "Connects with Google Calendar & Outlook. Blocks your busy time automatically — zero double bookings.",
        accent: "#818cf8",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
        title: "Smart timezone detection",
        desc: "Guests always see times in their local timezone. No mental math, no missed meetings.",
        accent: "#c084fc",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" /></svg>,
    },
    {
        title: "AI scheduling assistant",
        desc: "Let AI suggest the best meeting times based on patterns, preferences, and your team's rhythm.",
        accent: "#34d399",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
    },
    {
        title: "Automated reminders",
        desc: "Email confirmations and reminders sent automatically. Reduce no-shows without lifting a finger.",
        accent: "#fb923c",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
    },
    {
        title: "Custom event types",
        desc: "30-min calls, 1-hour deep dives, group workshops — set up any format with custom questions and buffers.",
        accent: "#f472b6",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
    },
];

const steps = [
    { num: 1, title: "Connect your calendar", desc: "Link Google Calendar or Outlook in one click. We read your availability in real time." },
    { num: 2, title: "Create your event types", desc: "Set up meeting types, durations, and custom questions. Takes less than 2 minutes." },
    { num: 3, title: "Share & get booked", desc: "Send your link. Guests pick a time. You both get a confirmation. Done." },
];