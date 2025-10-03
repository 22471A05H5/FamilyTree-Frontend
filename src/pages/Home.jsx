import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-[80vh]" style={{ fontFamily: 'Nunito, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"' }}>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E90FF] via-[#8A2BE2] to-[#00FFFF] opacity-90 animate-gradient" />
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/40" />

        {/* Energy streaks */}
        <div className="energy-streak blue top-1/4 left-[-20%] w-[60%] h-[6px] animate-pulse" />
        <div className="energy-streak cyan top-1/2 right-[-25%] w-[70%] h-[6px] animate-pulse" />
        <div className="energy-streak violet bottom-1/3 left-[-15%] w-[50%] h-[6px] animate-pulse" />

        <div className="relative container max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
          {/* Copy */}
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg" style={{ fontFamily: 'Poppins, Nunito, system-ui, -apple-system, Segoe UI, Roboto' }}>
              Family Storage Album
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-xl">
              Preserve memories, connect generations. Store your family photos and build a beautiful, multi-generation family tree.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/login"
                className="rounded-2xl px-7 py-3 bg-gradient-to-r from-[#FF6B6B] via-[#F06595] to-[#845EF7] text-white font-semibold transition-all transform hover:scale-105 active:scale-95 animate-glow shadow-[0_10px_30px_rgba(240,101,149,0.45)] hover:shadow-[0_12px_36px_rgba(240,101,149,0.6)]"
                style={{ fontFamily: 'Poppins, Nunito, system-ui' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-2xl px-7 py-3 bg-gradient-to-r from-[#12B886] via-[#20C997] to-[#4DABF7] text-[#0b1324] font-semibold transition-all transform hover:scale-105 active:scale-95 animate-glow shadow-[0_10px_30px_rgba(32,201,151,0.45)] hover:shadow-[0_12px_36px_rgba(32,201,151,0.6)]"
                style={{ fontFamily: 'Poppins, Nunito, system-ui' }}
              >
                Register
              </Link>
            </div>
          </div>

          {/* Collage */}
          <div className="relative grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-2xl animate-float-slow">
              <img
                className="w-full h-40 md:h-56 object-cover hover:scale-105 transition-transform duration-300"
                src="https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1200&auto=format&fit=crop"
                alt="Family gathering"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl animate-float-medium">
              <img
                className="w-full h-40 md:h-56 object-cover hover:scale-105 transition-transform duration-300"
                src="https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?q=80&w=1200&auto=format&fit=crop"
                alt="Wedding"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl animate-float-medium">
              <img
                className="w-full h-40 md:h-56 object-cover hover:scale-105 transition-transform duration-300"
                src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1200&auto=format&fit=crop"
                alt="Birthday"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl animate-float-slow">
              <img
                className="w-full h-40 md:h-56 object-cover hover:scale-105 transition-transform duration-300"
                src="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop"
                alt="Casual moments"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins, Nunito, system-ui' }}>What you can do</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-700" style={{ fontFamily: 'Poppins, Nunito, system-ui' }}>Store Family Photos</h3>
              <p className="mt-2 text-gray-600 text-sm">Upload images to secure cloud storage and keep them organized by occasions like Marriage, Birthday, and more.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-700" style={{ fontFamily: 'Poppins, Nunito, system-ui' }}>Build Your Family Tree</h3>
              <p className="mt-2 text-gray-600 text-sm">Add parents, spouse, children, and siblings. Click on photos to see complete details for each member.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-700" style={{ fontFamily: 'Poppins, Nunito, system-ui' }}>Simple & Private</h3>
              <p className="mt-2 text-gray-600 text-sm">Your data belongs to you. Access it easily after a quick login, and manage all your memories in one place.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Poppins, Nunito, system-ui' }}>How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-pink-500 font-bold">1</div>
              <h3 className="font-semibold text-gray-700" style={{ fontFamily: 'Poppins, Nunito, system-ui' }}>Register & Complete Payment</h3>
              <p className="mt-2 text-gray-600 text-sm">Sign up and finish the quick, secure payment on the Upgrade page. After successful payment, you’ll be taken straight to your Dashboard.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-pink-500 font-bold">2</div>
              <h3 className="font-semibold text-gray-700" style={{ fontFamily: 'Poppins, Nunito, system-ui' }}>Access Dashboard & All Features</h3>
              <p className="mt-2 text-gray-600 text-sm">Once paid, you have full access: Photo Uploads, Albums, and the Family Tree—no repeat payment needed.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-pink-500 font-bold">3</div>
              <h3 className="font-semibold text-gray-700" style={{ fontFamily: 'Poppins, Nunito, system-ui' }}>Build Your Family & Upload Memories</h3>
              <p className="mt-2 text-gray-600 text-sm">Add spouse and children in Family Form, upload photos by category, and view your visual Family Tree instantly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
