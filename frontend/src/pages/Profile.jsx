import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Button, InputField } from '../components/UI';
import { User, Lock, Phone, Mail, Image, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Must be 10 digits').or(z.literal('')),
  password: z.string().min(8, 'Min 8 chars').or(z.literal('')),
});

export default function Profile() {
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState(null);

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('me/').then(r => r.data),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    values: me ? {
      first_name: me.first_name || '',
      last_name: me.last_name || '',
      email: me.email || '',
      phone: me.phone || '',
      password: '',
    } : undefined,
  });

  const onSubmit = async (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (imageFile) {
      const key = me.role === 'customer' ? 'dl_image' : 'ad_image';
      fd.append(key, imageFile);
    }
    try {
      await api.patch('me/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      qc.invalidateQueries(['me']);
      toast.success('Profile updated successfully!');
    } catch (e) {
      toast.error('Failed to update profile.');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">Loading profile…</div>;

  const imageLabel = me?.role === 'customer' ? 'Driving Licence Image' : 'Business/Aadhar Document';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
            <p className="text-gray-400 capitalize text-sm">{me?.role} · @{me?.username}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First Name" {...register('first_name')} error={errors.first_name?.message} />
              <InputField label="Last Name" {...register('last_name')} error={errors.last_name?.message} />
            </div>
            <InputField label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
            <InputField label="Phone Number" placeholder="10-digit phone" {...register('phone')} error={errors.phone?.message} />

            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Lock className="w-3.5 h-3.5" />Change Password</p>
              <InputField label="New Password (leave blank to keep current)" type="password" placeholder="Min 8 characters" {...register('password')} error={errors.password?.message} />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Image className="w-3.5 h-3.5" />Documents</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">{imageLabel}</label>
              
              {me?.document_url && (
                <div className="mb-3">
                  <p className="text-xs text-emerald-600 mb-2 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Currently uploaded document:
                  </p>
                  <img src={me.document_url} alt="Document" className="w-32 h-20 object-cover rounded-lg border border-gray-200 shadow-sm" />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
                className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-500 hover:file:bg-emerald-100 transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-2">Upload a new file only if you want to replace the existing one.</p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full py-3 mt-2">
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
