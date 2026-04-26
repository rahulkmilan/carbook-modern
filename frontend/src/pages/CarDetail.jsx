import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Button, Modal, InputField } from '../components/UI';
import { MapPin, Fuel, Users, Calendar } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { getUser } from '../services/auth';

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state?.fromApp) {
    return <Navigate to="/" replace />;
  }
  
  const [bookOpen, setBookOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (location.state?.openBooking && getUser()) {
      setBookOpen(true);
      navigate(location.pathname, { replace: true, state: { ...location.state, openBooking: false } });
    }
  }, [location.state, navigate, location.pathname]);
  
  // Booking States
  const [pickupLoc, setPickupLoc] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffLoc, setDropoffLoc] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('');

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => api.get(`cars/${id}/`).then(r => r.data),
  });

  const nod = (pickupDate && dropoffDate) 
    ? Math.max(1, differenceInDays(new Date(dropoffDate), new Date(pickupDate))) 
    : 0;
  const totalAmount = nod * (car?.price || 0);

  const handleBook = async () => {
    if (!pickupLoc || !pickupDate || !pickupTime || !dropoffLoc || !dropoffDate || !dropoffTime) {
      return toast.error('Please fill in all pickup and drop-off details.');
    }
    
    setLoading(true);
    try {
      const res = await api.post('bookings/', { 
        car_id: id, 
        pickup_location: pickupLoc,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        dropoff_location: dropoffLoc,
        dropoff_date: dropoffDate,
        dropoff_time: dropoffTime,
        nod: nod 
      });
      
      const { order_id, razorpay_key, amount } = res.data;
      const options = {
        key: razorpay_key,
        amount: amount * 100,
        currency: 'INR',
        order_id,
        name: 'Carbook',
        description: `Booking: ${car.make} ${car.model}`,
        handler: async (response) => {
          try {
            setLoading(true);
            await api.post('bookings/verify_payment/', response);
            toast.success('Payment successful! Booking confirmed.');
            navigate('/dashboard');
          } catch (err) {
            console.error('Payment Verification Error:', err);
            const errMsg = err.response?.data?.detail || 'Payment verification failed. Please contact support if your money was deducted.';
            toast.error(errMsg, { duration: 6000 });
          } finally {
            setLoading(false);
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setBookOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg animate-pulse">Loading car details…</div>;
  if (!car) return <div className="min-h-screen flex items-center justify-center text-red-500">Car not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {car.photos_url ? (
            <img src={car.photos_url} alt={`${car.make} ${car.model}`} className="w-full h-80 object-cover" />
          ) : (
            <div className="w-full h-80 bg-emerald-50 flex items-center justify-center text-8xl">🚗</div>
          )}
          <div className="p-8">
            <div className="flex flex-wrap gap-4 items-start justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-900">{car.year} {car.make} {car.model}</h1>
                <p className="text-gray-400 font-mono mt-1">{car.regno}</p>
                <p className="text-sm text-gray-500 mt-1">Listed by <span className="text-emerald-500 font-medium">{car.dealer?.username}</span></p>
                
                {car.review_count > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200">
                    ⭐ {car.average_rating} <span className="font-normal opacity-70">({car.review_count} reviews)</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-500">₹{car.price}<span className="text-sm font-medium text-gray-400">/day</span></div>
              </div>
            </div>

            {/* Display Reviews Preview if any */}
            {car.reviews?.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {car.reviews.slice(0, 3).map(rev => (
                    <div key={rev.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900">{rev.customer_name}</span>
                        <span className="text-yellow-500 text-sm">{'⭐'.repeat(rev.rating)}</span>
                      </div>
                      {rev.comment && <p className="text-gray-600 text-sm">{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3"><MapPin className="w-4 h-4 text-emerald-500" />{car.location}</div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3"><Fuel className="w-4 h-4 text-emerald-500" />{car.fuel_type}</div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3"><Users className="w-4 h-4 text-emerald-500" />{car.seats} Seats</div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3"><Calendar className="w-4 h-4 text-emerald-500" />{car.year}</div>
            </div>
            
            <div className="mt-8">
              {car.booked ? (
                <p className="text-red-500 font-semibold text-center py-4 bg-red-50 rounded-xl">This car is currently booked.</p>
              ) : car.status === 'Accepted' ? (
                <Button 
                  onClick={() => {
                    if (getUser()) {
                      setBookOpen(true);
                    } else {
                      navigate('/login', { state: { returnUrl: location.pathname, openBooking: true, fromApp: true } });
                    }
                  }} 
                  className="w-full py-4 text-base"
                >
                  Book This Car
                </Button>
              ) : (
                <p className="text-gray-400 text-center">This car is not available for booking.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Complete Your Booking" maxWidth="max-w-2xl">
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup Section */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1">🟢 Pickup Details</h4>
              <InputField label="Location" value={pickupLoc} onChange={e => setPickupLoc(e.target.value)} placeholder="e.g. Airport" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <InputField label="Date" type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                 <InputField label="Time" type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} />
              </div>
            </div>

            {/* Drop-off Section */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1">🔴 Drop-off Details</h4>
              <InputField label="Location" value={dropoffLoc} onChange={e => setDropoffLoc(e.target.value)} placeholder="e.g. Hotel" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <InputField label="Date" type="date" value={dropoffDate} onChange={e => setDropoffDate(e.target.value)} min={pickupDate || new Date().toISOString().split('T')[0]} />
                 <InputField label="Time" type="time" value={dropoffTime} onChange={e => setDropoffTime(e.target.value)} />
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            {pickupDate && dropoffDate ? (
              <>
                <p className="text-sm text-gray-500">Total Amount ({nod} {nod === 1 ? 'day' : 'days'})</p>
                <p className="text-3xl font-black text-emerald-500">₹{totalAmount}</p>
              </>
            ) : (
              <p className="text-sm text-emerald-700 py-2 font-medium">Select rental dates to see total price</p>
            )}
          </div>
          
          <div title={(!pickupDate || !dropoffDate) ? "Please select rental dates" : ""}>
            <Button onClick={handleBook} disabled={loading || !pickupDate || !dropoffDate} className="w-full py-3">
              {loading ? 'Processing…' : 'Proceed to Pay'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
