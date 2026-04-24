import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Button, InputField } from '../components/UI';

const schema = z.object({
  new_password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine(d => d.new_password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await api.post('password-reset/confirm/', { uid, token, new_password: data.new_password });
      navigate('/login');
    } catch {
      setError('This link is expired or invalid. Please request a new one.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-500 mb-6">Enter your new password below.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField label="New Password" type="password" placeholder="••••••••" error={errors.new_password?.message} {...register('new_password')} />
            <InputField label="Confirm Password" type="password" placeholder="••••••••" error={errors.confirm?.message} {...register('confirm')} />
            {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full py-3">
              {isSubmitting ? 'Resetting…' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
