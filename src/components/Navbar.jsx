import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const hideOn = ['/login', '/register'];

  const isActive = (to) => pathname.startsWith(to);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (hideOn.includes(pathname)) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-30 bg-gradient-to-r from-[#1E90FF] via-[#8A2BE2] to-[#00FFFF] backdrop-blur-sm bg-opacity-90 shadow-lg">
      <div className="py-4 px-6 flex justify-between items-center">
        <Link to="/" className="text-xl font-extrabold text-white drop-shadow">Family Album</Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-3 items-center">
          {user && !isHome && (
            <>
              <Link
                to="/dashboard"
                className={[
                  'relative group rounded-xl px-4 py-2 border',
                  'border-white/30 bg-white/10 text-white/90 backdrop-blur-sm',
                  'transition shadow-[0_0_20px_rgba(30,144,255,0.0)] hover:shadow-[0_0_24px_rgba(30,144,255,0.6)]',
                  'hover:bg-white/15',
                  isActive('/dashboard') ? 'ring-2 ring-[#00FFFF]/60 text-white' : '',
                ].join(' ')}
              >
                <span className="relative z-10">Dashboard</span>
                <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm bg-gradient-to-r from-[#1E90FF]/30 via-[#8A2BE2]/30 to-[#00FFFF]/30" />
                <span className="pointer-events-none absolute -inset-px rounded-xl border border-[#00FFFF]/30 opacity-0 group-hover:opacity-100 transition duration-300" />
              </Link>

              {/* Family dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setFamilyOpen(true)}
                onMouseLeave={() => setFamilyOpen(false)}
             >
                <button
                  className={[
                    'relative group rounded-xl px-4 py-2 border',
                    'border-white/30 bg-white/10 text-white/90 backdrop-blur-sm',
                    'transition shadow-[0_0_20px_rgba(0,255,255,0.0)] hover:shadow-[0_0_24px_rgba(0,255,255,0.6)]',
                    'hover:bg-white/15 flex items-center gap-2',
                    (isActive('/family/form') || isActive('/family/tree')) ? 'ring-2 ring-[#8A2BE2]/60 text-white' : '',
                  ].join(' ')}
                  onClick={() => setFamilyOpen((v) => !v)}
                >
                  <span className="relative z-10">Family</span>
                  <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 blur-sm bg-gradient-to-r from-[#00FFFF]/30 via-[#8A2BE2]/30 to-[#1E90FF]/30" />
                  <span className="pointer-events-none absolute -inset-px rounded-xl border border-[#8A2BE2]/30 opacity-0 group-hover:opacity-100 transition duration-300" />
                  <svg className="w-4 h-4 text-white/90" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.205l3.71-3.975a.75.75 0 111.08 1.04l-4.24 4.54a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
                </button>
                {familyOpen && (
                  <div
                    className="absolute right-0 top-full z-50 w-56 rounded-2xl bg-white border border-white/60 shadow-2xl p-2"
                  >
                    <Link to="/family/form" className="block rounded-xl px-3 py-2 text-[#1F2937] hover:bg-gradient-to-r hover:from-[#8A2BE2]/10 hover:to-[#00FFFF]/10 hover:shadow-[0_0_18px_rgba(0,255,255,0.35)] transition">
                      Family Form
                    </Link>
                    <Link to="/family/tree" className="block rounded-xl px-3 py-2 text-[#1F2937] hover:bg-gradient-to-r hover:from-[#00FFFF]/10 hover:to-[#1E90FF]/10 hover:shadow-[0_0_18px_rgba(30,144,255,0.35)] transition">
                      Family Tree
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
          {!user ? (
            <>
              <Link to="/login" className="rounded-2xl px-4 py-2 bg-gradient-to-r from-[#8A2BE2] to-[#1E90FF] text-white shadow-md transition transform hover:scale-105 active:scale-95">Login</Link>
              <Link to="/register" className="rounded-2xl px-4 py-2 bg-gradient-to-r from-[#1E90FF] to-[#00FFFF] text-[#1F2937] shadow-md transition transform hover:scale-105 active:scale-95">Register</Link>
            </>
          ) : !isHome ? (
            <button onClick={logout} className="rounded-2xl px-4 py-2 bg-white/20 text-white shadow-md transition transform hover:scale-105 active:scale-95">Logout</button>
          ) : null}
        </div>

        {/* Mobile hamburger (hidden on Home) */}
        {!isHome && (
          <button className="md:hidden text-white" onClick={() => setMobileOpen((s) => !s)} aria-label="Toggle Menu">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        )}
      </div>

      {/* Mobile menu panel (hidden on Home) */}
      {mobileOpen && !isHome && (
        <div className="md:hidden px-4 pb-4">
          {user && !isHome && (
            <div className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md p-2 space-y-1">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2 text-white/90 hover:bg-white/15">Dashboard</Link>
              <details className="rounded-xl overflow-hidden group">
                <summary className="list-none cursor-pointer rounded-xl px-3 py-2 text-white/90 hover:bg-white/15 flex items-center justify-between">
                  <span>Family</span>
                  <svg className="w-4 h-4 text-white/90 transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.205l3.71-3.975a.75.75 0 111.08 1.04l-4.24 4.54a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
                </summary>
                <div className="mt-1 border-t border-white/20">
                  <Link to="/family/form" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-white/90 hover:bg-white/10">Family Form</Link>
                  <Link to="/family/tree" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-white/90 hover:bg-white/10">Family Tree</Link>
                </div>
              </details>
            </div>
          )}
          {!user ? (
            <div className="mt-2 flex gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-2xl px-4 py-2 text-center bg-gradient-to-r from-[#8A2BE2] to-[#1E90FF] text-white shadow-md">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-2xl px-4 py-2 text-center bg-gradient-to-r from-[#1E90FF] to-[#00FFFF] text-[#1F2937] shadow-md">Register</Link>
            </div>
          ) : !isHome ? (
            <button onClick={() => { setMobileOpen(false); logout(); }} className="mt-2 w-full rounded-2xl px-4 py-2 bg-white/20 text-white shadow-md">Logout</button>
          ) : null}
        </div>
      )}
    </nav>
  );
}
