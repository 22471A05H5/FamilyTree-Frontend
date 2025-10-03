import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Upgrade() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const cardRef = useRef(null);
  const [diag, setDiag] = useState({ stripeLoaded: false, elementsReady: false, clientSecretSet: false });
  const initOnceRef = useRef(false);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);

  useEffect(() => {
    if (user?.isPaid) {
      navigate('/dashboard', { replace: true });
      return;
    }
    (async () => {
      if (initOnceRef.current) return; // Prevent double init (StrictMode/dev)
      initOnceRef.current = true;
      try {
        setLoading(true);
        setError('');
        // 1) fetch publishable key
        const pkRes = await api.get('/billing/public-key');
        const pk = pkRes?.data?.publishableKey;
        if (!pk) throw new Error('Payments are not configured');
        // 2) create payment intent (only once)
        const piRes = await api.post('/billing/create-payment-intent', { amount: 19900, currency: 'inr' });
        const cs = piRes?.data?.clientSecret;
        if (!cs) throw new Error('Failed to start payment');
        setClientSecret(cs);
        setDiag((d) => ({ ...d, clientSecretSet: true }));
        // 3) load Stripe.js script if not loaded
        if (!window.Stripe) {
          await loadStripeJs();
        }
        // 4) init Stripe instance
        stripeRef.current = window.Stripe(pk);
        setDiag((d) => ({ ...d, stripeLoaded: !!stripeRef.current }));
        // 5) create elements (no clientSecret needed for Card Element) and mount card
        elementsRef.current = stripeRef.current.elements();
        setDiag((d) => ({ ...d, elementsReady: !!elementsRef.current }));
        const card = elementsRef.current.create('card', { hidePostalCode: true });
        const mountEl = document.getElementById('card-element');
        if (mountEl) {
          // Clear any placeholder children before mount to avoid duplicates
          mountEl.innerHTML = '';
          card.mount(mountEl);
          // Mark ready right after mount as a fallback
          setCardReady(true);
        }
        card.on('ready', () => setCardReady(true));
        card.on('change', (evt) => {
          // Enable button only when card input is complete
          if (typeof evt.complete === 'boolean') setCardReady(evt.complete);
          if (evt?.error) setError(evt.error.message);
          else setError('');
        });
        cardRef.current = card;
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      try { cardRef.current?.unmount?.(); } catch {}
    };
  }, [navigate, user]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripeRef.current || !cardRef.current || !clientSecret) {
      setError('Card is not ready. Please wait a moment and try again.');
      return;
    }
    try {
      setProcessing(true);
      setError('');
      const result = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardRef.current },
      });
      if (result.error) {
        setError(result.error.message || 'Payment failed');
        setProcessing(false);
        return;
      }
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Move to success page for verification + final redirect
        const piId = result.paymentIntent.id;
        navigate(`/upgrade/success?pi=${encodeURIComponent(piId)}`, { replace: true });
        return;
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E90FF] via-[#8A2BE2] to-[#00FFFF] opacity-90 animate-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/40" />

      <div className="relative w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent mb-6 text-center">Upgrade to Family Album Pro</h1>
        <p className="text-center text-gray-600 mb-6">Unlock uploads and Family Tree features for a one-time fee.</p>

        {loading && <div className="text-center text-gray-600">Initializing payment…</div>}
        {error && <div className="text-center text-red-600 mb-4">{error}</div>}

        {!loading && !error && (
          <form onSubmit={handlePay} className="space-y-4">
            <div className="bg-white rounded-xl border p-4 shadow-inner">
              <div id="card-element" className="min-h-[40px]"></div>
            </div>
            <button type="submit" disabled={processing || !cardReady} aria-busy={processing} className="w-full rounded-2xl px-4 py-3 bg-gradient-to-r from-[#8A2BE2] to-[#1E90FF] text-white shadow-xl transition transform hover:scale-105 active:scale-95 animate-glow disabled:opacity-60">
              {processing ? 'Processing…' : 'Pay ₹199.00'}
            </button>
            <p className="text-xs text-gray-500 text-center">You will get instant access after successful payment.</p>
            <div className="text-center">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setProcessing(true);
                    const r = await api.post('/billing/create-checkout-session', { amount: 19900, currency: 'inr' });
                    if (r?.data?.url) {
                      window.location.href = r.data.url;
                    } else {
                      setError('Could not start secure checkout.');
                    }
                  } catch (e) {
                    setError(e?.response?.data?.message || 'Secure checkout failed');
                  } finally {
                    setProcessing(false);
                  }
                }}
                className="mt-2 inline-block rounded-2xl px-4 py-2 bg-white text-[#1F2937] border border-[#1E90FF]/40 shadow-sm hover:shadow transition"
              >
                Pay with Secure Checkout
              </button>
            </div>
            <div className="text-[11px] text-gray-400 text-center mt-2">
              Stripe: {String(diag.stripeLoaded)} · Elements: {String(diag.elementsReady)} · ClientSecret: {String(diag.clientSecretSet)} · CardReady: {String(cardReady)}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function loadStripeJs() {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      if (window.Stripe) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Stripe.js failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Stripe.js failed to load'));
    document.body.appendChild(script);
  });
}
