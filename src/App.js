import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AlbumPage from './pages/AlbumPage';
import Footer from './components/Footer';
import FamilyForm from './pages/FamilyForm';
import FamilyTree from './pages/FamilyTree';
import InteractiveFamilyTreePage from './pages/InteractiveFamilyTreePage';
import Home from './pages/Home';
import Upgrade from './pages/Upgrade';
import PaymentSuccess from './pages/PaymentSuccess';
import Payment from './pages/Payment';
import PaymentStatus from './pages/PaymentStatus';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function PrivatePaidRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user?.isPaid) return <Navigate to="/upgrade" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/upgrade"
              element={
                <PrivateRoute>
                  <Upgrade />
                </PrivateRoute>
              }
            />
            <Route
              path="/upgrade/success"
              element={
                <PrivateRoute>
                  <PaymentSuccess />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment/status"
              element={
                <PrivateRoute>
                  <PaymentStatus />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivatePaidRoute>
                  <Dashboard />
                </PrivatePaidRoute>
              }
            />
            <Route
              path="/album/:category"
              element={
                <PrivatePaidRoute>
                  <AlbumPage />
                </PrivatePaidRoute>
              }
            />
            <Route
              path="/family/form"
              element={
                <PrivatePaidRoute>
                  <FamilyForm />
                </PrivatePaidRoute>
              }
            />
            <Route
              path="/family/tree"
              element={
                <PrivatePaidRoute>
                  <FamilyTree />
                </PrivatePaidRoute>
              }
            />
            <Route
              path="/family/interactive-tree"
              element={
                <PrivatePaidRoute>
                  <InteractiveFamilyTreePage />
                </PrivatePaidRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
