import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function UpgradeSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [done, setDone] = useState(false);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setError('');
        setVerifying(true);
        const pi = searchParams.get('pi');
        const sessionId = searchParams.get('session_id');
        let updatedUser;
        if (pi) {
          // Elements flow verification
          const res = await api.post('/billing/verify-intent', { paymentIntentId: pi });
          updatedUser = res?.data;
        } else if (sessionId) {
          // Hosted Checkout flow verification
          const res = await api.get(`/billing/confirm`, { params: { session_id: sessionId } });
          updatedUser = res?.data;
        } else {
          setError('Missing payment reference.');
          setVerifying(false);
          return;
        }
        if (updatedUser?.isPaid) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setDone(true);
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        } else {
          setError('Verification failed.');
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    })();
  }, [navigate, searchParams, user]);

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E90FF] via-[#8A2BE2] to-[#00FFFF] opacity-90 animate-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/40" />

      <div className="relative w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-sm text-center">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent mb-3">Payment Successful</h1>
        <p className="text-gray-600 mb-6">Thank you! We are confirming your access now.</p>
        {verifying && <div className="text-gray-600">Verifying your payment…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {done && <div className="text-green-600">Access granted! Redirecting to dashboard…</div>}
      </div>
    </div>
  );
}
