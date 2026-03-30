// app/(auth)/register/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const USERNAME_RE = /^[a-z0-9-]+$/;

// ── Background Canvas ──────────────────────────────────────────────────────────
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

// ── Eye Icon ───────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
    return open
        ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
        : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
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

// ── Password Strength ──────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
    if (!password) return null;
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "#ef4444", "#f59e0b", "#22d3ee", "#22c55e"];

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 99,
                        background: i <= score ? colors[score] : "rgba(148,163,184,0.15)",
                        transition: "background 0.3s",
                    }} />
                ))}
            </div>
            <p style={{ fontSize: 11, color: colors[score], fontWeight: 500 }}>
                {labels[score]}
            </p>
        </div>
    );
}

// ── Field Wrapper ──────────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 7 }}>
                {label}
            </label>
            {children}
            {error && (
                <p style={{ marginTop: 6, fontSize: 12, color: "#f87171", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="12" height="12" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    {error}
                </p>
            )}
            {!error && hint && (
                <p style={{ marginTop: 5, fontSize: 12, color: "#334155" }}>{hint}</p>
            )}
        </div>
    );
}

// ── Register Page ──────────────────────────────────────────────────────────────
export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({ name: "", email: "", username: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoad, setGoogleLoad] = useState(false);
    const [step, setStep] = useState(1);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Full name is required";
        if (!form.email.trim()) errs.email = "Email is required";
        if (!form.username.trim()) errs.username = "Username is required";
        else if (!USERNAME_RE.test(form.username)) errs.username = "Only lowercase letters, numbers, and hyphens";
        if (form.password.length < 8) errs.password = "Minimum 8 characters";
        if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === "username" ? value.toLowerCase().replace(/\s/g, "-") : value,
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, email: form.email, username: form.username, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) { setApiError(data.error || "Registration failed"); setLoading(false); return; }
            const loginRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
            if (loginRes?.ok) router.push("/dashboard");
            else setStep(2);
        } catch {
            setApiError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => { setGoogleLoad(true); await signIn("google", { callbackUrl: "/dashboard" }); };

    // ── CSS ────────────────────────────────────────────────────────────────────
    const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #020817; color: #f1f5f9; overflow-x: hidden; }
    .font-display { font-family: 'Bricolage Grotesque', sans-serif; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    .fade-up { animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
    .d1{animation-delay:0.06s} .d2{animation-delay:0.12s} .d3{animation-delay:0.18s}
    .d4{animation-delay:0.24s} .d5{animation-delay:0.30s} .d6{animation-delay:0.36s}
    @keyframes shimmer {
      0%{background-position:-400px 0} 100%{background-position:400px 0}
    }
    .shimmer-text {
      background: linear-gradient(90deg,#38bdf8 0%,#818cf8 45%,#c084fc 65%,#38bdf8 100%);
      background-size:400px 100%; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
      animation: shimmer 4s linear infinite;
    }
    @keyframes pulse-ring {
      0%{box-shadow:0 0 0 0 rgba(56,189,248,.5)} 70%{box-shadow:0 0 0 10px rgba(56,189,248,0)} 100%{box-shadow:0 0 0 0 rgba(56,189,248,0)}
    }
    .pulse-logo { animation: pulse-ring 2.5s ease-out infinite; }
    .glass-card {
      background: rgba(15,23,42,0.75);
      backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(148,163,184,0.12);
    }
    .input-field {
      width:100%; background:rgba(2,8,23,0.6);
      border:1px solid rgba(148,163,184,0.15); border-radius:12px;
      padding:12px 16px; font-family:'DM Sans',sans-serif; font-size:14px;
      color:#f1f5f9; outline:none; transition:border-color 0.2s,box-shadow 0.2s;
    }
    .input-field::placeholder { color:#334155; }
    .input-field:focus { border-color:rgba(56,189,248,0.5); box-shadow:0 0 0 3px rgba(56,189,248,0.1); }
    .input-error { border-color:rgba(248,113,113,0.5) !important; }
    .input-field:focus.input-error { box-shadow:0 0 0 3px rgba(248,113,113,0.1); }
    .btn-primary {
      width:100%; position:relative; overflow:hidden;
      background:linear-gradient(135deg,#0ea5e9,#6366f1);
      color:white; font-family:'DM Sans',sans-serif; font-weight:600; font-size:15px;
      padding:13px 24px; border-radius:12px; border:none; cursor:pointer;
      transition:transform 0.2s,box-shadow 0.2s;
      display:flex; align-items:center; justify-content:center; gap:8px;
      box-shadow:0 0 28px rgba(99,102,241,0.35);
    }
    .btn-primary::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(135deg,#38bdf8,#818cf8); opacity:0; transition:opacity 0.3s;
    }
    .btn-primary:hover::before { opacity:1; }
    .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(99,102,241,0.45); }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
    .btn-primary > * { position:relative; z-index:1; }
    .btn-google {
      width:100%; background:rgba(255,255,255,0.04);
      border:1px solid rgba(148,163,184,0.15); border-radius:12px;
      padding:13px 24px; font-family:'DM Sans',sans-serif;
      font-weight:500; font-size:14px; color:#cbd5e1; cursor:pointer;
      transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:10px;
    }
    .btn-google:hover { background:rgba(255,255,255,0.08); border-color:rgba(148,163,184,0.3); color:#f1f5f9; }
    .btn-google:disabled { opacity:0.6; cursor:not-allowed; }
    .eye-btn {
      position:absolute; right:14px; top:50%; transform:translateY(-50%);
      background:none; border:none; cursor:pointer; color:#475569;
      padding:2px; display:flex; align-items:center; transition:color 0.2s;
    }
    .eye-btn:hover { color:#94a3b8; }
    .username-prefix {
      background:rgba(2,8,23,0.8); border-right:1px solid rgba(148,163,184,0.15);
      padding:12px 14px; font-size:13px; color:#334155; white-space:nowrap;
      border-radius:12px 0 0 12px; font-family:'DM Sans',sans-serif;
    }
    .username-wrap {
      display:flex; background:rgba(2,8,23,0.6);
      border:1px solid rgba(148,163,184,0.15); border-radius:12px; overflow:hidden;
      transition:border-color 0.2s,box-shadow 0.2s;
    }
    .username-wrap:focus-within {
      border-color:rgba(56,189,248,0.5); box-shadow:0 0 0 3px rgba(56,189,248,0.1);
    }
    .username-input {
      flex:1; background:transparent; border:none; padding:12px 14px;
      font-family:'DM Sans',sans-serif; font-size:14px; color:#f1f5f9; outline:none;
    }
    .username-input::placeholder { color:#334155; }
    ::-webkit-scrollbar { width:6px; }
    ::-webkit-scrollbar-track { background:#020817; }
    ::-webkit-scrollbar-thumb { background:#334155; border-radius:99px; }
  `;

    // ── Success Screen ─────────────────────────────────────────────────────────
    if (step === 2) {
        return (
            <>
                <style>{styles}</style>
                <ThreeBackground />
                <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                    <div className="glass-card fade-up" style={{ borderRadius: 24, padding: "48px 40px", textAlign: "center", maxWidth: 400, width: "100%" }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: "50%",
                            background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
                        }}>
                            <svg width="28" height="28" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="font-display" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: 10 }}>
                            Account <span className="shimmer-text">created!</span>
                        </h2>
                        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, marginBottom: 28, fontWeight: 300 }}>
                            Welcome to ScheduleFlow. Sign in now to set up your first booking link.
                        </p>
                        <Link href="/login" className="btn-primary" style={{ textDecoration: "none" }}>
                            <span>Go to sign in</span>
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    // ── Main Form ──────────────────────────────────────────────────────────────
    return (
        <>
            <style>{styles}</style>
            <ThreeBackground />

            <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

                {/* Navbar */}
                <nav style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div className="pulse-logo" style={{
                            width: 34, height: 34, background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
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
                    <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: "#64748b", textDecoration: "none" }}
                        onMouseOver={e => e.target.style.color = "#94a3b8"} onMouseOut={e => e.target.style.color = "#64748b"}>
                        Already have an account?{" "}
                        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Sign in →</span>
                    </Link>
                </nav>

                {/* Card */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 16px 32px" }}>
                    <div className="glass-card fade-up" style={{ width: "100%", maxWidth: 460, borderRadius: 24, padding: "36px 36px" }}>

                        {/* Header */}
                        <div className="fade-up d1" style={{ textAlign: "center", marginBottom: 28 }}>
                            <div style={{
                                width: 52, height: 52, background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                                borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 18px", boxShadow: "0 0 32px rgba(99,102,241,0.4)",
                            }}>
                                <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h1 className="font-display" style={{ fontSize: "1.7rem", fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: 8 }}>
                                Create your <span className="shimmer-text">account</span>
                            </h1>
                            <p style={{ fontSize: 13, color: "#475569", fontWeight: 300 }}>
                                Free forever · No credit card needed
                            </p>
                        </div>

                        {/* API Error */}
                        {apiError && (
                            <div className="fade-up" style={{
                                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                                borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                                display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <svg width="15" height="15" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                <span style={{ fontSize: 13, color: "#f87171" }}>{apiError}</span>
                            </div>
                        )}

                        {/* Google */}
                        <div className="fade-up d2" style={{ marginBottom: 0 }}>
                            <button onClick={handleGoogle} disabled={googleLoad} className="btn-google">
                                {googleLoad ? <Spinner /> : <GoogleIcon />}
                                Continue with Google
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="fade-up d2" style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(148,163,184,0.1)" }} />
                            <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>or register with email</span>
                            <div style={{ flex: 1, height: 1, background: "rgba(148,163,184,0.1)" }} />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>

                            {/* Name + Email side by side */}
                            <div className="fade-up d3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
                                <Field label="Full name" error={errors.name}>
                                    <input type="text" name="name" value={form.name} onChange={handleChange}
                                        placeholder="Alex Johnson" autoComplete="name"
                                        className={`input-field${errors.name ? " input-error" : ""}`} />
                                </Field>
                                <Field label="Email address" error={errors.email}>
                                    <input type="email" name="email" value={form.email} onChange={handleChange}
                                        placeholder="you@example.com" autoComplete="email"
                                        className={`input-field${errors.email ? " input-error" : ""}`} />
                                </Field>
                            </div>

                            {/* Username */}
                            <div className="fade-up d3">
                                <Field
                                    label="Username"
                                    error={errors.username}
                                    hint={form.username ? `✦ scheduleflow.app/${form.username}` : "Pick a unique username for your booking link"}
                                >
                                    <div className={`username-wrap${errors.username ? " input-error" : ""}`}>
                                        <span className="username-prefix">scheduleflow.app/</span>
                                        <input type="text" name="username" value={form.username} onChange={handleChange}
                                            placeholder="alex" autoComplete="username" className="username-input" />
                                    </div>
                                </Field>
                            </div>

                            {/* Password */}
                            <div className="fade-up d4">
                                <Field label="Password" error={errors.password}>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type={showPass ? "text" : "password"} name="password" value={form.password}
                                            onChange={handleChange} placeholder="Min. 8 characters" autoComplete="new-password"
                                            className={`input-field${errors.password ? " input-error" : ""}`}
                                            style={{ paddingRight: 44 }}
                                        />
                                        <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                                            <EyeIcon open={showPass} />
                                        </button>
                                    </div>
                                    <PasswordStrength password={form.password} />
                                </Field>
                            </div>

                            {/* Confirm Password */}
                            <div className="fade-up d5">
                                <Field label="Confirm password" error={errors.confirmPassword}>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type={showConfirm ? "text" : "password"} name="confirmPassword" value={form.confirmPassword}
                                            onChange={handleChange} placeholder="Repeat password" autoComplete="new-password"
                                            className={`input-field${errors.confirmPassword ? " input-error" : ""}`}
                                            style={{ paddingRight: 44 }}
                                        />
                                        <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)}>
                                            <EyeIcon open={showConfirm} />
                                        </button>
                                    </div>
                                    {/* Match indicator */}
                                    {form.confirmPassword && !errors.confirmPassword && form.password === form.confirmPassword && (
                                        <p style={{ marginTop: 5, fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                                            <svg width="12" height="12" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Passwords match
                                        </p>
                                    )}
                                </Field>
                            </div>

                            {/* Terms */}
                            <p className="fade-up d5" style={{ fontSize: 12, color: "#334155", textAlign: "center", marginBottom: 20 }}>
                                By registering you agree to our{" "}
                                <Link href="/terms" style={{ color: "#38bdf8", textDecoration: "none" }}>Terms</Link>
                                {" "}and{" "}
                                <Link href="/privacy" style={{ color: "#38bdf8", textDecoration: "none" }}>Privacy Policy</Link>.
                            </p>

                            {/* Submit */}
                            <div className="fade-up d6">
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading && <Spinner white />}
                                    {loading ? "Creating your account…" : "Create account"}
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <p className="fade-up d6" style={{ textAlign: "center", fontSize: 13, color: "#334155", marginTop: 20 }}>
                            Already have an account?{" "}
                            <Link href="/login" style={{ color: "#38bdf8", fontWeight: 600, textDecoration: "none" }}>
                                Sign in →
                            </Link>
                        </p>
                    </div>
                </div>

                <p style={{ textAlign: "center", fontSize: 12, color: "#1e293b", padding: "16px 0" }}>
                    © {new Date().getFullYear()} ScheduleFlow. All rights reserved.
                </p>
            </div>
        </>
    );
}