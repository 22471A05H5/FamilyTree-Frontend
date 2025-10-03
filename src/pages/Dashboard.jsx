import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HeartIcon, CakeIcon, SparklesIcon, UserGroupIcon, DocumentPlusIcon } from '@heroicons/react/24/solid';
import api from '../api';

const Card = ({ to, title, Icon, description }) => (
  <Link to={to} className="group rounded-2xl bg-white shadow-2xl hover:shadow-[0_0_24px_rgba(30,144,255,0.35)] transition transform hover:scale-105 text-center p-6 cursor-pointer border border-transparent hover:border-[#1E90FF]/30">
    <div className="flex flex-col items-center gap-3">
      <Icon className="w-12 h-12 text-[#8A2BE2] group-hover:text-[#1E90FF] transition" />
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </Link>
);

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const upgradeStatus = searchParams.get('upgrade');
    const sessionId = searchParams.get('session_id');

    // Handle free upgrade success
    if (upgradeStatus === 'success') {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setSearchParams({});
        setShowSuccessMessage(false);
      }, 5000);
      return;
    }

    // Handle Stripe payment success
    if (paymentStatus === 'success' && sessionId) {
      // Verify payment and update user
      const verifyPayment = async () => {
        try {
          const response = await api.post('/billing/confirm-checkout', { sessionId });
          if (response.data.isPaid) {
            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
              ...currentUser,
              isPaid: true
            }));
            
            // Show success message
            setShowSuccessMessage(true);
            
            // Clean URL after 3 seconds
            setTimeout(() => {
              setSearchParams({});
              setShowSuccessMessage(false);
            }, 5000);
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
        }
      };
      
      verifyPayment();
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-8">
      {/* Payment Success Banner */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <div className="text-green-500 text-2xl mr-3">🎉</div>
            <div>
              <h3 className="text-green-800 font-semibold">Payment Successful!</h3>
              <p className="text-green-600 text-sm">Welcome to Family Album Pro! You now have access to all features.</p>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent">Dashboard</h1>
      
      {/* Family Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Family Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card to="/family/tree" title="Family Tree" Icon={UserGroupIcon} description="View your family tree" />
          <Card to="/family/form" title="Family Form" Icon={DocumentPlusIcon} description="Add family members" />
        </div>
      </div>

      {/* Photos Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Photo Albums</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card to="/album/marriage" title="Marriage" Icon={HeartIcon} description="Wedding memories" />
          <Card to="/album/birthday" title="Birthday" Icon={CakeIcon} description="Birthday celebrations" />
          <Card to="/album/other" title="Other Occasion" Icon={SparklesIcon} description="Special moments" />
        </div>
      </div>
    </div>
  );
}
