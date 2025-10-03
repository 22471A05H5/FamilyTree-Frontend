import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending'); // pending | succeeded | failed

  useEffect(() => {
    (async () => {
      try {
        setError('');
        setStatus('pending');
        const pi = searchParams.get('pi');
        if (!pi) {
          setError('Missing payment reference.');
          setStatus('failed');
          return;
        }
        const { data } = await api.post('/payment/verify-intent', { paymentIntentId: pi });
        const payment = data?.payment;
        const updatedUser = data?.user;
        if (payment?.status === 'succeeded') {
          setStatus('succeeded');
          if (updatedUser) localStorage.setItem('user', JSON.stringify(updatedUser));
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        } else if (payment?.status === 'failed') {
          setStatus('failed');
        } else {
          setStatus('pending');
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Verification failed');
        setStatus('failed');
      }
    })();
  }, [navigate, searchParams, user]);

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600 via-purple-600 to-fuchsia-500 opacity-90 animate-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/40" />

      <div className="relative w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-sm text-center">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">Payment Status</h1>
        {status === 'pending' && <div className="text-gray-600">Verifying your payment…</div>}
        {status === 'succeeded' && <div className="text-green-600">Payment successful! Redirecting to dashboard…</div>}
        {status === 'failed' && <div className="text-red-600">Payment failed. {error || 'Please try again.'}</div>}
        {status === 'failed' && (
          <div className="mt-4">
            <button onClick={() => navigate('/payment', { replace: true })} className="rounded-2xl px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
