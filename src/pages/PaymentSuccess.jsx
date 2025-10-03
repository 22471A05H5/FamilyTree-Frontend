import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      return;
    }
    
    // Verify payment with backend
    const verifyPayment = async () => {
      try {
        const response = await api.post('/billing/confirm-checkout', {
          sessionId
        });
        
        if (response.data.isPaid) {
          setStatus('success');
          // Update local user data
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({
            ...currentUser,
            isPaid: true
          }));
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setStatus('error');
      }
    };
    
    verifyPayment();
  }, [searchParams, navigate]);
  
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E90FF] via-[#8A2BE2] to-[#00FFFF] flex items-center justify-center">
        <div className="bg-white/95 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E90FF] via-[#8A2BE2] to-[#00FFFF] flex items-center justify-center">
        <div className="bg-white/95 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Welcome to Family Album Pro! You now have access to all features.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to dashboard in 3 seconds...
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] text-white px-6 py-2 rounded-xl hover:shadow-lg transition"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E90FF] via-[#8A2BE2] to-[#00FFFF] flex items-center justify-center">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
        <p className="text-gray-600 mb-4">
          There was an issue verifying your payment. Please contact support.
        </p>
        <button
          onClick={() => navigate('/upgrade')}
          className="bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] text-white px-6 py-2 rounded-xl hover:shadow-lg transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
