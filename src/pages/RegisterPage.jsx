import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function RegisterPage() {
  const [name, setName] = useState('');
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
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Go to embedded upgrade page
      navigate('/upgrade');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
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
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent mb-6 text-center">Create your account</h1>
        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300" value={name} onChange={(e)=>setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="w-full rounded-2xl px-4 py-3 bg-gradient-to-r from-[#8A2BE2] to-[#1E90FF] text-white shadow-xl transition transform hover:scale-105 active:scale-95 animate-glow disabled:opacity-60">
            {loading ? 'Redirecting to payment…' : 'Register & Pay'}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4 text-sm">
          Already have an account? <Link to="/login" className="text-pink-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
