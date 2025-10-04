import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function PaymentPage() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [amount] = useState(19900); // ₹199 in paisa
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [method, setMethod] = useState('card');
  const [currency] = useState('inr');
  const [upiVpa] = useState('');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);

  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const cardRef = useRef(null);
  const [cardReady, setCardReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Ensure Stripe.js available
        if (!window.Stripe) {
          await loadStripeJs();
        }
        // Fetch publishable key
        const { data } = await api.get('/billing/public-key');
        const pk = data?.publishableKey;
        if (!pk) throw new Error('Payments are not configured');
        stripeRef.current = window.Stripe(pk);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to initialize payments');
      }
    })();
  }, []);

  // Mount/unmount Card Element when card is selected
  useEffect(() => {
    if (method !== 'card') {
      try { cardRef.current?.unmount?.(); } catch {}
      setCardReady(false);
      return;
    }
    if (!stripeRef.current) return;
    if (!elementsRef.current) elementsRef.current = stripeRef.current.elements();
    const card = elementsRef.current.create('card', { hidePostalCode: true });
    const mountEl = document.getElementById('payment-card-element');
    if (mountEl) {
      mountEl.innerHTML = '';
      card.mount(mountEl);
      setCardReady(true);
    }
    card.on('change', (evt) => {
      if (typeof evt.complete === 'boolean') setCardReady(evt.complete);
      if (evt?.error) setError(evt.error.message); else setError('');
    });
    cardRef.current = card;
    return () => {
      try { card.unmount(); } catch {}
    };
  }, [method]);

  const handleProceed = async (e) => {
    e.preventDefault();
    setError('');
    if (!stripeRef.current) {
      setError('Stripe is not ready. Please refresh and try again.');
      return;
    }
    try {
      setLoading(true);
      // 1) create intent on backend
      const { data } = await api.post('/payment/create-intent', { amount, method, currency, coupon });
      const clientSecret = data?.clientSecret;
      const paymentIntentId = data?.paymentIntentId;
      if (!clientSecret) throw new Error('Failed to start payment');

      // 2) confirm payment based on method
      if (method === 'card') {
        if (!cardRef.current) throw new Error('Card is not ready');
        const result = await stripeRef.current.confirmCardPayment(clientSecret, {
          payment_method: { card: cardRef.current },
        });
        if (result.error) throw new Error(result.error.message || 'Payment failed');
        if (result.paymentIntent?.status === 'succeeded') {
          navigate(`/payment/status?pi=${encodeURIComponent(result.paymentIntent.id)}`, { replace: true });
          return;
        }
      } else if (method === 'upi') {
        // Attempt confirm via UPI VPA, fall back to redirect flow
        const result = await (stripeRef.current.confirmPayment
          ? stripeRef.current.confirmPayment({
              clientSecret,
              confirmParams: {
                return_url: `${window.location.origin}/payment/status`,
                payment_method_data: {
                  type: 'upi',
                  upi: upiVpa ? { vpa: upiVpa } : undefined,
                },
              },
            })
          : stripeRef.current.confirmUpiPayment(clientSecret, {
              payment_method: { type: 'upi', upi: { vpa: upiVpa } },
              return_url: `${window.location.origin}/payment/status`,
            }));
        if (result?.error) throw new Error(result.error.message || 'UPI payment failed');
        // For redirect-based flows, status page will handle verification
        if (paymentIntentId) navigate(`/payment/status?pi=${encodeURIComponent(paymentIntentId)}`, { replace: true });
        return;
      } else if (method === 'netbanking') {
        // Likely redirect-based; confirm via generic confirmPayment
        const result = await stripeRef.current.confirmPayment({
          clientSecret,
          confirmParams: { return_url: `${window.location.origin}/payment/status` },
        });
        if (result?.error) throw new Error(result.error.message || 'Netbanking failed');
        if (paymentIntentId) navigate(`/payment/status?pi=${encodeURIComponent(paymentIntentId)}`, { replace: true });
        return;
      }

      // Fallback verify
      if (paymentIntentId) navigate(`/payment/status?pi=${encodeURIComponent(paymentIntentId)}`, { replace: true });
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600 via-purple-600 to-fuchsia-500 opacity-90 animate-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/40" />

      <div className="relative w-full max-w-3xl bg-white/95 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 text-center">Complete Your Payment</h1>
        <p className="text-center text-gray-600 mb-6">Unlock uploads, albums, and Family Tree access.</p>

        {error && <div className="text-center text-red-600 mb-4">{error}</div>}

        <div className="grid md:grid-cols-5 gap-6">
          {/* Summary */}
          <div className="md:col-span-2 bg-white rounded-2xl border p-4 shadow-inner">
            <div className="text-gray-700 font-semibold">Plan</div>
            <div className="text-gray-900">Family Album Pro</div>
            <div className="mt-2 text-gray-500 text-sm">One-time</div>
            <div className="mt-4 text-2xl font-bold text-gray-900">₹{(amount/100).toFixed(2)}</div>
            <div className="mt-3 flex gap-2">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon (e.g., COUPON10)" className="flex-1 border rounded-xl p-2 text-sm" />
              <span className="text-xs text-gray-500 self-center">Applied at checkout</span>
            </div>
          </div>

          {/* Methods */}
          <div className="md:col-span-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <MethodCard selected={method==='card'} onClick={() => setMethod('card')} title="Card" emoji="💳" />
              <MethodCard selected={method==='netbanking'} onClick={() => setMethod('netbanking')} title="Netbanking" emoji="🏦" />
            </div>

            <div className="mt-4 space-y-4">
              {method === 'card' && (
                <div className="bg-white rounded-xl border p-4 shadow-inner">
                  <div id="payment-card-element" className="min-h-[40px]"></div>
                </div>
              )}

              {/* UPI removed */}

              {method === 'netbanking' && (
                <div className="bg-white rounded-xl border p-4 shadow-inner">
                  <div className="text-sm text-gray-600">You will be redirected to your bank to complete the payment securely.</div>
                </div>
              )}

              <button onClick={handleProceed} disabled={loading || (method==='card' && !cardReady)} className="w-full rounded-2xl px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl transition transform hover:scale-105 active:scale-95 animate-glow disabled:opacity-60">
                {loading ? 'Processing…' : 'Proceed to Pay'}
              </button>
              <div className="text-center mt-2">
                <button type="button" onClick={() => navigate('/upgrade')} className="inline-block rounded-2xl px-4 py-2 bg-white text-[#1F2937] border border-indigo-400/40 shadow-sm hover:shadow transition">
                  Prefer embedded card? Try Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodCard({ selected, onClick, title, emoji }) {
  return (
    <button type="button" onClick={onClick} className={[
      'rounded-2xl p-4 text-left border bg-white backdrop-blur shadow-sm transition',
      selected ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.35)]' : 'border-gray-200 hover:shadow-md'
    ].join(' ')}>
      <div className="flex items-center gap-2 text-gray-800">
        <span className="text-xl">{emoji}</span>
        <span className="font-semibold">{title}</span>
      </div>
      {selected && <div className="mt-2 text-[11px] text-indigo-600">Selected</div>}
    </button>
  );
}

function loadStripeJs() {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (existing) { existing.addEventListener('load', resolve); return resolve(); }
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload = resolve; s.onerror = () => reject(new Error('Stripe.js failed to load'));
    document.body.appendChild(s);
  });
}
