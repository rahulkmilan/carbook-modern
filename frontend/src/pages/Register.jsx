import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { Car, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  role: z.enum(['customer', 'dealer']),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  username: z.string().min(3, 'Min 3 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  password: z.string().min(8, 'Min 8 characters'),
});

import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) {
      formData.append(data.role === 'customer' ? 'dl_image' : 'ad_image', imageFile);
    }
    try {
      await api.post('register/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (e) {
      const msgs = e.response?.data;
      const errorMsg = msgs ? Object.values(msgs).flat().join(' ') : 'Registration failed.';
      toast.error(errorMsg);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all";
  const errCls = "text-red-400 text-xs mt-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden py-12">
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg mb-3">
              <Car className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Create Account</h1>
            <p className="text-emerald-200 text-sm mt-1">Join Carbook today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {['customer', 'dealer'].map(r => (
                  <label key={r} className={`flex items-center justify-center gap-2 cursor-pointer py-2.5 rounded-xl border transition-all ${role === r ? 'border-emerald-400 bg-emerald-500/20 text-white' : 'border-white/20 text-emerald-200'}`}>
                    <input type="radio" value={r} {...register('role')} className="hidden" />
                    <span className="capitalize font-semibold">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input {...register('first_name')} placeholder="First Name" className={inputCls} />
                {errors.first_name && <p className={errCls}>{errors.first_name.message}</p>}
              </div>
              <div>
                <input {...register('last_name')} placeholder="Last Name" className={inputCls} />
                {errors.last_name && <p className={errCls}>{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <input {...register('username')} placeholder="Username" className={inputCls} />
              {errors.username && <p className={errCls}>{errors.username.message}</p>}
            </div>
            <div>
              <input {...register('email')} type="email" placeholder="Email Address" className={inputCls} />
              {errors.email && <p className={errCls}>{errors.email.message}</p>}
            </div>
            <div>
              <input {...register('phone')} placeholder="Phone (10 digits)" className={inputCls} />
              {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
            </div>
            <div className="relative">
              <input 
                {...register('password')} 
                type={showPassword ? "text" : "password"} 
                placeholder="Password (min 8 chars)" 
                className={`${inputCls} pr-12`} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-emerald-300 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && <p className={errCls}>{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-1">
                {role === 'customer' ? 'Driving Licence (optional)' : 'Business Document (optional)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
                className="text-sm text-emerald-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-emerald-200 text-sm text-center mt-5">
            Already have an account? <Link to="/login" className="text-white font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
