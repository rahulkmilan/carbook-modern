import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Navbar from '../components/Navbar';
import CarCard from '../components/CarCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function LandingPage() {
  const [location, setLocation] = useState('');
  const [fuel, setFuel] = useState('');
  const [search, setSearch] = useState('');

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: () => api.get('cars/').then(r => r.data),
  });

  const locations = [...new Set(cars.map(c => c.location))];
  
  const filtered = cars.filter(c => {
    const matchStatus = c.status === 'Accepted';
    const matchLocation = location ? c.location === location : true;
    const matchFuel = fuel ? c.fuel_type === fuel : true;
    const matchSearch = search ? `${c.make} ${c.model}`.toLowerCase().includes(search.toLowerCase()) : true;
    const matchAvailability = !c.booked;
    
    return matchStatus && matchLocation && matchFuel && matchSearch && matchAvailability;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-black text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-black leading-tight">
            Find Your Perfect <span className="text-emerald-400">Ride</span>
          </h1>
          <p className="mt-4 text-emerald-100 text-lg">Browse hundreds of cars available for daily rental.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                className="flex-1 bg-transparent text-white placeholder-emerald-100 focus:outline-none text-sm min-w-0"
                placeholder="Search make or model…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-transparent sm:bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              value={location}
              onChange={e => setLocation(e.target.value)}
            >
              <option value="" className="bg-slate-900 text-white">All Locations</option>
              {locations.map(l => <option key={l} value={l} className="bg-slate-900 text-white">{l}</option>)}
            </select>
            <select
              className="bg-transparent sm:bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              value={fuel}
              onChange={e => setFuel(e.target.value)}
            >
              <option value="" className="bg-slate-900 text-white">All Fuel</option>
              <option value="Petrol" className="bg-slate-900 text-white">Petrol</option>
              <option value="Diesel" className="bg-slate-900 text-white">Diesel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Car Listings */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isLoading ? 'Loading…' : `${filtered.length} Cars Available`}
        </h2>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(car => <CarCard key={car.id} car={car} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <span className="text-6xl">🚘</span>
            <p className="mt-4 text-lg">No cars found for your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
