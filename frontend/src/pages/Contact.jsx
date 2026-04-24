import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Button, InputField } from '../components/UI';
import { CheckCircle, Mail, Phone, MapPin } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject required'),
  message: z.string().min(10, 'Message too short (min 10 chars)'),
});

export default function Contact() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    await api.post('contact/', data);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-10">We'd love to hear from you. Send us a message!</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Message Sent!</h3>
                <p className="text-gray-500 mt-2">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InputField label="Your Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
                <InputField label="Email Address" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
                <InputField label="Subject" placeholder="How can we help?" error={errors.subject?.message} {...register('subject')} />
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="Tell us more…"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full py-3">
                  {isSubmitting ? 'Sending…' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
          <div className="space-y-4">
            {[
              { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'carbook.demo@gmail.com' },
              { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: '+91 00000 00000' },
              { icon: <MapPin className="w-5 h-5" />, label: 'Location', value: 'India' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">{item.icon}</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                  <p className="text-gray-800 font-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
