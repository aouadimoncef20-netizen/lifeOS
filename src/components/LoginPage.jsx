import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(129,140,248,0.06), transparent), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(167,139,250,0.06), transparent), var(--bg-deep)' }}>
      <div className="glass-card w-[400px] max-w-[92vw] p-8 animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl text-accent-purple animate-float">⬡</span>
          <span className="text-2xl font-extrabold tracking-tight text-themed">Life<span className="text-grad-accent">OS</span></span>
        </div>

        <h2 className="text-lg font-bold text-themed text-center mb-6">Welcome back</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="w-full px-3.5 py-2.5 rounded-lg border border-themed bg-themed-input text-themed text-sm outline-none transition-all focus:border-accent-blue/40 focus:shadow-[0_0_0_3px_rgba(129,140,248,0.08)] placeholder:text-themed-muted"
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />

          <input className="w-full px-3.5 py-2.5 rounded-lg border border-themed bg-themed-input text-themed text-sm outline-none transition-all focus:border-accent-blue/40 focus:shadow-[0_0_0_3px_rgba(129,140,248,0.08)] placeholder:text-themed-muted"
            type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />

          {error && <div className="text-xs text-accent-red bg-accent-red/10 px-3 py-2 rounded-lg">{error}</div>}

          <button className="w-full py-2.5 rounded-lg border-none bg-grad-accent text-white text-sm font-semibold cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(129,140,248,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            type="submit" disabled={busy}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-themed-muted text-center mt-6">
          Don't have an account?{' '}
          <button className="text-accent-blue bg-transparent border-none cursor-pointer hover:underline font-inherit text-xs"
            onClick={onSwitch}>Create one</button>
        </p>
      </div>
    </div>
  );
}
