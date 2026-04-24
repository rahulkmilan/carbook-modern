import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Button, InputField } from '../components/UI';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Valid email required'),
});

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    await api.post('password-reset/', data);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
              <p className="text-gray-500 mt-2">We sent a password reset link to your email address.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Forgot Password?</h2>
              <p className="text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InputField label="Email Address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                <Button type="submit" disabled={isSubmitting} className="w-full py-3">
                  {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
