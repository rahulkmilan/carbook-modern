import { Link } from 'react-router-dom';
import { MapPin, Fuel, Users, Star } from 'lucide-react';
import { Badge } from './UI';

export default function CarCard({ car }) {
  const isAvailable = car.status === 'Accepted' && !car.booked;
  const statusLabel = isAvailable ? 'Available' : car.booked ? 'Booked' : car.status === 'Pending' ? 'Pending' : 'Unavailable';
  const statusColor = isAvailable ? 'green' : car.booked ? 'red' : car.status === 'Pending' ? 'yellow' : 'red';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative">
        {car.photos_url ? (
          <img src={car.photos_url} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-100 flex items-center justify-center">
            <span className="text-5xl">🚗</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge color={statusColor}>{statusLabel}</Badge>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-gray-900">{car.year} {car.make} {car.model}</h3>
        <p className="text-xs text-gray-400 mt-0.5 font-mono">{car.regno}</p>
        {car.review_count > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold text-gray-700">{car.average_rating}</span>
            <span className="text-xs text-gray-400">({car.review_count} reviews)</span>
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{car.location}</span>
          <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{car.fuel_type}</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{car.seats} Seats</span>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-emerald-500">₹{car.price}</span>
            <span className="text-xs text-gray-400">/day</span>
          </div>
          {car.status === 'Accepted' && !car.booked && (
            <Link
              to={`/cars/${car.id}`}
              state={{ fromApp: true }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow"
            >
              Book Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
