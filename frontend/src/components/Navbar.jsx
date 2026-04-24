import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../services/auth';
import { Car, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkCls = 'text-sm text-gray-600 hover:text-emerald-500 transition-colors font-medium';

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5">
          <Car className="w-6 h-6 text-black" />
          <span className="text-2xl font-black tracking-tight uppercase">
            <span className="text-black">Car</span><span className="text-emerald-500">book</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className={linkCls}>Browse Cars</Link>
          <Link to="/contact" className={linkCls}>Contact</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`flex items-center gap-1 ${linkCls}`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/profile" className={`flex items-center gap-1 ${linkCls}`}>
                <User className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkCls}>Login</Link>
              <Link to="/register" className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md hover:-translate-y-0.5">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-emerald-500 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 shadow-lg">
          <Link to="/" className={linkCls} onClick={() => setMenuOpen(false)}>Browse Cars</Link>
          <Link to="/contact" className={linkCls} onClick={() => setMenuOpen(false)}>Contact</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`flex items-center gap-2 ${linkCls}`} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/profile" className={`flex items-center gap-2 ${linkCls}`} onClick={() => setMenuOpen(false)}>
                <User className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  navigate('/login');
                }}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkCls} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="inline-block text-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
