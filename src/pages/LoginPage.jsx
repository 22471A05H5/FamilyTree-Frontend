import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect based on payment status
      if (data.user?.isPaid) {
        navigate('/dashboard');
      } else {
        navigate('/upgrade');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background like Home */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E90FF] via-[#8A2BE2] to-[#00FFFF] opacity-90 animate-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/40" />

      <div className="relative w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent mb-6 text-center">Login</h1>
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="w-full rounded-2xl px-4 py-3 bg-gradient-to-r from-[#8A2BE2] to-[#1E90FF] text-white shadow-xl transition transform hover:scale-105 active:scale-95 animate-glow disabled:opacity-60">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4 text-sm">
          Don&apos;t have an account? <Link to="/register" className="text-pink-500 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
