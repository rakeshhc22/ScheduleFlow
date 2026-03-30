"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// ── Background Canvas (same as landing) ───────────────────────────────────────
function ThreeBackground() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let raf, t = 0;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);
        const orbs = [
            { x: 0.1, y: 0.2, r: 340, color: "#3b82f6", speed: 0.00025, phase: 0 },
            { x: 0.9, y: 0.1, r: 260, color: "#6366f1", speed: 0.0003, phase: 1 },
            { x: 0.75, y: 0.85, r: 300, color: "#0ea5e9", speed: 0.00022, phase: 2 },
            { x: 0.25, y: 0.9, r: 200, color: "#8b5cf6", speed: 0.00035, phase: 3 },
        ];
        const draw = () => {
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "#020817"; ctx.fillRect(0, 0, W, H);
            ctx.save();
            ctx.strokeStyle = "rgba(148,163,184,0.04)"; ctx.lineWidth = 1;
            for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
            for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
            ctx.restore();
            orbs.forEach((o) => {
                const drift = Math.sin(t * o.speed * 1000 + o.phase) * 40;
                const cx = W * o.x + drift, cy = H * o.y + drift * 0.6;
                const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
                g.addColorStop(0, o.color + "55"); g.addColorStop(0.4, o.color + "22"); g.addColorStop(1, o.color + "00");
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, o.r, 0, Math.PI * 2); ctx.fill();
            });
            const img = ctx.getImageData(0, 0, W, H), d = img.data;
            for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
            ctx.putImageData(img, 0, 0);
            t++; raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }} />;
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner({ white }) {
    return (
        <div style={{
            width: 16, height: 16, borderRadius: "50%", border: "2px solid",
            borderColor: white ? "rgba(255,255,255,0.3)" : "rgba(148,163,184,0.3)",
            borderTopColor: white ? "#fff" : "#94a3b8",
            animation: "spin 0.7s linear infinite", flexShrink: 0,
        }} />
    );
}

// ── Google Icon ────────────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
export default function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoad, setGoogleLoad] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused] = useState("");

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleCredentials = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
        setLoading(false);
        if (res?.error) setError("Invalid email or password. Please try again.");
        else router.push(callbackUrl);
    };

    const handleGoogle = async () => { setGoogleLoad(true); await signIn("google", { callbackUrl }); };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #020817; color: #f1f5f9; overflow-x: hidden; }
        .font-display { font-family: 'Bricolage Grotesque', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }
        .delay-5 { animation-delay: 0.40s; }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #38bdf8 0%, #818cf8 45%, #c084fc 65%, #38bdf8 100%);
          background-size: 400px 100%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(56,189,248,.5); }
          70%  { box-shadow: 0 0 0 10px rgba(56,189,248,0); }
          100% { box-shadow: 0 0 0 0 rgba(56,189,248,0); }
        }
        .pulse-logo { animation: pulse-ring 2.5s ease-out infinite; }
        .glass-card {
          background: rgba(15,23,42,0.75);
          backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(148,163,184,0.12);
        }
        .input-field {
          width: 100%; background: rgba(2,8,23,0.6);
          border: 1px solid rgba(148,163,184,0.15);
          border-radius: 12px; padding: 12px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
          color: #f1f5f9; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field::placeholder { color: #334155; }
        .input-field:focus {
          border-color: rgba(56,189,248,0.5);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
        }
        .btn-primary {
          width: 100%; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          color: white; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 15px;
          padding: 13px 24px; border-radius: 12px; border: none; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 0 28px rgba(99,102,241,0.35);
        }
        .btn-primary::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          opacity:0; transition:opacity 0.3s;
        }
        .btn-primary:hover::before { opacity:1; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow: 0 8px 32px rgba(99,102,241,0.45); }
        .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .btn-primary > * { position:relative; z-index:1; }
        .btn-google {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(148,163,184,0.15); border-radius: 12px;
          padding: 13px 24px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 14px; color: #cbd5e1; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .btn-google:hover { background: rgba(255,255,255,0.08); border-color: rgba(148,163,184,0.3); color: #f1f5f9; }
        .btn-google:disabled { opacity:0.6; cursor:not-allowed; }
        .eye-btn {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:#475569;
          padding:2px; display:flex; align-items:center;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: #94a3b8; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#020817; }
        ::-webkit-scrollbar-thumb { background:#334155; border-radius:99px; }
      `}</style>

            <ThreeBackground />

            <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

                {/* ── Navbar ──────────────────────────────────────────────────────── */}
                <nav style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div className="pulse-logo" style={{
                            width: 34, height: 34, background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="17" height="17" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px" }}>
                            ScheduleFlow
                        </span>
                    </Link>
                    <Link href="/register" style={{
                        fontSize: 13, fontWeight: 500, color: "#64748b", textDecoration: "none",
                        transition: "color 0.2s",
                    }}
                        onMouseOver={e => e.target.style.color = "#94a3b8"}
                        onMouseOut={e => e.target.style.color = "#64748b"}
                    >
                        No account?{" "}
                        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Sign up free →</span>
                    </Link>
                </nav>

                {/* ── Card ────────────────────────────────────────────────────────── */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
                    <div className="glass-card fade-up" style={{ width: "100%", maxWidth: 420, borderRadius: 24, padding: "40px 36px" }}>

                        {/* Header */}
                        <div className="fade-up delay-1" style={{ textAlign: "center", marginBottom: 32 }}>
                            <div style={{
                                width: 52, height: 52, background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                                borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 20px",
                                boxShadow: "0 0 32px rgba(99,102,241,0.4)",
                            }}>
                                <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h1 className="font-display" style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: 8 }}>
                                Welcome <span className="shimmer-text">back</span>
                            </h1>
                            <p style={{ fontSize: 14, color: "#475569", fontWeight: 300 }}>
                                Sign in to your ScheduleFlow account
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="fade-up" style={{
                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                                borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                                display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <svg width="15" height="15" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                <span style={{ fontSize: 13, color: "#f87171", fontWeight: 400 }}>{error}</span>
                            </div>
                        )}

                        {/* Google */}
                        <div className="fade-up delay-2">
                            <button onClick={handleGoogle} disabled={googleLoad} className="btn-google">
                                {googleLoad ? <Spinner /> : <GoogleIcon />}
                                Continue with Google
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="fade-up delay-3" style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(148,163,184,0.1)" }} />
                            <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>or continue with email</span>
                            <div style={{ flex: 1, height: 1, background: "rgba(148,163,184,0.1)" }} />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCredentials}>

                            {/* Email */}
                            <div className="fade-up delay-3" style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 7 }}>
                                    Email address
                                </label>
                                <input
                                    type="email" name="email" value={form.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocused("email")}
                                    onBlur={() => setFocused("")}
                                    required placeholder="you@example.com"
                                    className="input-field"
                                />
                            </div>

                            {/* Password */}
                            <div className="fade-up delay-4" style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>Password</label>
                                    <Link href="/forgot-password" style={{
                                        fontSize: 12, color: "#38bdf8", fontWeight: 500, textDecoration: "none",
                                        transition: "color 0.2s",
                                    }}>
                                        Forgot password?
                                    </Link>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        name="password" value={form.password}
                                        onChange={handleChange}
                                        onFocus={() => setFocused("password")}
                                        onBlur={() => setFocused("")}
                                        required placeholder="••••••••"
                                        className="input-field"
                                        style={{ paddingRight: 44 }}
                                    />
                                    <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                                        {showPass
                                            ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                            : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="fade-up delay-5">
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading && <Spinner white />}
                                    {loading ? "Signing in..." : "Sign in to dashboard"}
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <p className="fade-up delay-5" style={{ textAlign: "center", fontSize: 13, color: "#334155", marginTop: 24, fontWeight: 400 }}>
                            Don't have an account?{" "}
                            <Link href="/register" style={{ color: "#38bdf8", fontWeight: 600, textDecoration: "none" }}>
                                Create one free →
                            </Link>
                        </p>
                    </div>
                </div>

                {/* ── Footer ──────────────────────────────────────────────────────── */}
                <p style={{ textAlign: "center", fontSize: 12, color: "#1e293b", padding: "20px 0" }}>
                    © {new Date().getFullYear()} ScheduleFlow. All rights reserved.
                </p>
            </div>
        </>
    );
}