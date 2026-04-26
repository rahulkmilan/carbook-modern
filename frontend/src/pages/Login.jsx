import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { InputField, Button } from '../components/UI';
import { Car, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(1, 'Password is required'),
});

import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('token/', data);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      toast.success('Welcome back!');
      
      const returnUrl = location.state?.returnUrl || '/dashboard';
      const returnState = location.state || {};
      navigate(returnUrl, { state: returnState, replace: true });
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg mb-4">
              <Car className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Welcome back</h1>
            <p className="text-emerald-200 text-sm mt-1">Sign in to your Carbook account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-1">Username</label>
              <input
                {...register('username')}
                placeholder="your_username"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-1">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-emerald-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link to="/forgot-password" className="text-emerald-300 text-sm hover:text-emerald-100 transition-colors">
              Forgot password?
            </Link>
            <p className="text-emerald-200 text-sm">
              Don't have an account? <Link to="/register" className="text-white font-semibold hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
