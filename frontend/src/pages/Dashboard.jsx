import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Button, Modal, InputField, StatsCard, Badge } from '../components/UI';
import CarCard from '../components/CarCard';
import { Car, Plus, CheckCircle, XCircle, Trash2, Power, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: pendingCars = [] } = useQuery({ queryKey: ['pendingCars'], queryFn: () => api.get('cars/?status=Pending').then(r => r.data) });
  const { data: allBookings = [] } = useQuery({ queryKey: ['allBookings'], queryFn: () => api.get('bookings/').then(r => r.data) });
  const { data: allUsers = [] } = useQuery({ queryKey: ['allUsers'], queryFn: () => api.get('users/').then(r => r.data) });
  const { data: allCars = [] } = useQuery({ queryKey: ['allCars'], queryFn: () => api.get('cars/').then(r => r.data) });

  const acceptCar = async (id) => { await api.post(`cars/${id}/review/`, { decision: 'accept' }); qc.invalidateQueries(['pendingCars', 'allCars']); };
  const rejectCar = async () => { await api.post(`cars/${rejectModal}/review/`, { decision: 'reject', reason: rejectReason }); qc.invalidateQueries(['pendingCars', 'allCars']); setRejectModal(null); setRejectReason(''); };
  const suspendCar = async (id) => { if (confirm('Suspend this car?')) { await api.post(`cars/${id}/suspend/`); qc.invalidateQueries(['allCars']); } };
  const deactivateUser = async (id) => { if (confirm('Permanently deactivate this user?')) { await api.post(`users/${id}/deactivate/`); qc.invalidateQueries(['allUsers']); } };

  const dealers = allUsers.filter(u => u.role === 'dealer');
  const customers = allUsers.filter(u => u.role === 'customer');

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Pending Approvals" value={pendingCars.length} color="yellow" />
        <StatsCard title="Total Bookings" value={allBookings.length} color="sky" />
        <StatsCard title="Dealers" value={dealers.length} color="indigo" />
        <StatsCard title="Customers" value={customers.length} color="green" />
      </div>

      {/* Pending Cars */}
      {pendingCars.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-yellow-500" /> Pending Car Approvals</h2>
          <div className="space-y-3">
            {pendingCars.map(car => (
              <div key={car.id} className="bg-white rounded-2xl p-4 border border-yellow-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{car.year} {car.make} {car.model} <span className="text-gray-400 font-mono text-sm">({car.regno})</span></p>
                  <p className="text-sm text-gray-500">by {car.dealer?.username} — {car.location}, ₹{car.price}/day</p>
                  <div className="mt-2 flex gap-3 text-xs font-semibold">
                    {car.rc_image ? <a href={car.rc_image} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">📄 View RC Doc</a> : <span className="text-gray-400">No RC provided</span>}
                    {car.photos ? <a href={car.photos} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">🖼️ View Photos</a> : <span className="text-gray-400">No Photos</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => acceptCar(car.id)}><CheckCircle className="w-4 h-4" />Accept</Button>
                  <Button variant="danger" onClick={() => setRejectModal(car.id)}><XCircle className="w-4 h-4" />Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Cars */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">All Cars</h2>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {allCars.map(car => (
            <div key={car.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-800">{car.year} {car.make} {car.model}</p>
                <p className="text-xs text-gray-400">{car.regno} — <Badge color={car.status === 'Accepted' ? 'green' : 'yellow'}>{car.status}</Badge></p>
              </div>
              <Button variant="danger" onClick={() => suspendCar(car.id)}><Trash2 className="w-4 h-4" />Suspend</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Users */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Users</h2>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {allUsers.filter(u => u.role !== 'admin').map(u => (
            <div key={u.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-800">{u.first_name} {u.last_name} <span className="text-gray-400 text-sm">(@{u.username})</span></p>
                <p className="text-xs text-gray-400">{u.email} — <Badge color={u.role === 'dealer' ? 'sky' : 'green'}>{u.role}</Badge></p>
              </div>
              <Button variant="danger" onClick={() => deactivateUser(u.id)}><Trash2 className="w-4 h-4" />Deactivate</Button>
            </div>
          ))}
        </div>
      </section>

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Car">
        <div className="space-y-4">
          <InputField label="Reason for rejection" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Incomplete documents" />
          <Button variant="danger" onClick={rejectCar} className="w-full">Confirm Rejection</Button>
        </div>
      </Modal>
    </div>
  );
}

function DealerDashboard({ username }) {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editCar, setEditCar] = useState(null); // holds {id, price, location}
  const [form, setForm] = useState({ make: '', model: '', year: '', regno: '', location: '', seats: '', fuel_type: 'Petrol', price: '' });
  const [files, setFiles] = useState({ rc: null, photos: null });

  const { data: myCars = [] } = useQuery({ queryKey: ['myCars'], queryFn: () => api.get('cars/?my_cars=true').then(r => r.data) });
  const { data: myBookings = [] } = useQuery({ queryKey: ['dealerBookings'], queryFn: () => api.get('bookings/').then(r => r.data) });

  const addCar = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (files.rc) fd.append('rc_image', files.rc);
    if (files.photos) fd.append('photos', files.photos);
    await api.post('cars/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    qc.invalidateQueries(['myCars']);
    setAddOpen(false);
    setForm({ make: '', model: '', year: '', regno: '', location: '', seats: '', fuel_type: 'Petrol', price: '' });
  };

  const saveEdit = async () => {
    await api.patch(`cars/${editCar.id}/edit_fields/`, { price: editCar.price, location: editCar.location });
    qc.invalidateQueries(['myCars']);
    setEditCar(null);
  };

  const toggleAvailability = async (id) => { await api.post(`cars/${id}/toggle_availability/`); qc.invalidateQueries(['myCars']); };
  const deleteCar = async (id) => { if (confirm('Delete car?')) { await api.delete(`cars/${id}/`); qc.invalidateQueries(['myCars']); } };
  const markReturned = async (id) => {
    if (confirm('Mark this booking as returned? The car will become available again.')) {
      await api.post(`bookings/${id}/mark_returned/`);
      qc.invalidateQueries(['dealerBookings', 'myCars']);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatsCard title="My Cars" value={myCars.length} color="sky" />
        <StatsCard title="Active Bookings" value={myBookings.filter(b => b.paid).length} color="indigo" />
        <StatsCard title="Pending Approval" value={myCars.filter(c => c.status === 'Pending').length} color="yellow" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">My Cars</h2>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Car</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {myCars.map(car => (
          <div key={car.id} className="relative">
            <CarCard car={car} />
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <button onClick={() => setEditCar({ id: car.id, price: car.price, location: car.location })} className="flex-1 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1">
                ✏️ Edit
              </button>
              <button onClick={() => toggleAvailability(car.id)} className="flex-1 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1">
                <Power className="w-3 h-3" />{car.availability ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => deleteCar(car.id)} className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">Bookings For My Cars</h2>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y">
        {myBookings.length === 0 ? <p className="text-gray-400 text-center py-8">No bookings yet.</p> : myBookings.map(b => (
          <div key={b.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-gray-800">{b.car?.make} {b.car?.model} — {b.customer?.username}</p>
              <p className="text-xs text-gray-400 mt-1">
                {b.pickup_date && `Pickup: ${b.pickup_date} at ${b.pickup_time} · `}Drop: {b.dropoff_date} at {b.dropoff_time} · {b.nod} days · ₹{b.amount} · <Badge color={b.returned ? 'green' : b.paid ? 'sky' : 'yellow'}>{b.returned ? 'Returned' : b.paid ? 'Paid' : 'Pending'}</Badge>
              </p>
            </div>
            {b.paid && !b.returned && (
              <Button variant="secondary" onClick={() => markReturned(b.id)}>✅ Mark Returned</Button>
            )}
          </div>
        ))}
      </div>

      {/* Add Car Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Car">
        <div className="grid grid-cols-2 gap-3">
          {['make', 'model', 'year', 'regno', 'location', 'seats', 'price'].map(k => (
            <InputField key={k} label={k.charAt(0).toUpperCase()+k.slice(1)} value={form[k]} onChange={e => setForm(p => ({...p, [k]: e.target.value}))} placeholder={k} />
          ))}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Fuel Type</label>
            <select value={form.fuel_type} onChange={e => setForm(p => ({...p, fuel_type: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
              <option>Petrol</option><option>Diesel</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">RC Book Image</label>
            <input type="file" accept="image/*" onChange={e => setFiles(p => ({...p, rc: e.target.files[0]}))} className="text-sm text-gray-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Car Photo</label>
            <input type="file" accept="image/*" onChange={e => setFiles(p => ({...p, photos: e.target.files[0]}))} className="text-sm text-gray-500" />
          </div>
          <div className="col-span-2">
            <Button onClick={addCar} className="w-full">Submit Car for Approval</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Car Modal */}
      <Modal open={!!editCar} onClose={() => setEditCar(null)} title="Edit Car Details">
        <div className="space-y-4">
          <InputField label="Price per Day (₹)" type="number" value={editCar?.price || ''} onChange={e => setEditCar(p => ({...p, price: e.target.value}))} />
          <InputField label="Location" value={editCar?.location || ''} onChange={e => setEditCar(p => ({...p, location: e.target.value}))} />
          <Button onClick={saveEdit} className="w-full">Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
}


function CustomerDashboard() {
  const qc = useQueryClient();
  const [reviewCarId, setReviewCarId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  
  const { data: bookings = [] } = useQuery({ queryKey: ['myBookings'], queryFn: () => api.get('bookings/').then(r => r.data) });

  const cancelBooking = async (id) => {
    if (confirm('Cancel this booking? A refund will be initiated.')) {
      try {
        await api.post(`bookings/${id}/cancel/`);
        qc.invalidateQueries(['myBookings']);
        toast.success('Booking cancelled successfully.');
      } catch (e) {
        toast.error(e.response?.data?.detail || 'Cancellation failed.');
      }
    }
  };

  const submitReview = async () => {
    try {
      await api.post(`cars/${reviewCarId}/rate/`, reviewForm);
      toast.success('Thank you! Review submitted successfully.');
      setReviewCarId(null);
      setReviewForm({ rating: 5, comment: '' });
      qc.invalidateQueries(['myBookings']); // re-fetch so has_reviewed updates
      qc.invalidateQueries(['cars']);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to submit review.');
    }
  };

  return (
    <div>
      <StatsCard title="My Bookings" value={bookings.length} color="sky" />
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">My Bookings</h2>
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">🚗</p>
            <p>No bookings yet. <a href="/" className="text-emerald-500 hover:underline">Browse cars</a></p>
          </div>
        ) : bookings.map(b => {
          // Check if the dropoff date+time has already passed (overdue)
          const isOverdue = b.paid && !b.returned && new Date(`${b.dropoff_date}T${b.dropoff_time}`) < new Date();
          return (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900">{b.car?.make} {b.car?.model} <span className="font-mono text-gray-400 text-sm">({b.car?.regno})</span></p>
              <div className="text-sm text-gray-500 mt-2 space-y-1">
                {b.pickup_date && <p>🟢 <span className="font-medium">Pickup:</span> {b.pickup_location} ({b.pickup_date} at {b.pickup_time})</p>}
                <p>🔴 <span className="font-medium">Dropoff:</span> {b.dropoff_location} ({b.dropoff_date} at {b.dropoff_time})</p>
                <p className="font-medium mt-2">{b.nod} {b.nod === 1 ? 'day' : 'days'} · <span className="text-emerald-500 font-bold text-base">₹{b.amount}</span></p>
              </div>
              <div className="mt-1">
                {b.returned ? (
                  <Badge color="green">Completed &amp; Returned</Badge>
                ) : isOverdue ? (
                  <Badge color="orange">⚠️ Overdue — Pending Return</Badge>
                ) : (
                  <Badge color={b.paid ? 'sky' : 'yellow'}>{b.paid ? 'Active / Paid' : 'Payment Pending'}</Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {b.returned ? (
                b.has_reviewed ? (
                  <span className="text-sm text-green-600 font-semibold flex items-center gap-1">✓ Reviewed</span>
                ) : (
                  <Button variant="primary" onClick={() => setReviewCarId(b.car.id)}>Leave a Review</Button>
                )
              ) : b.paid ? (
                <Button variant="danger" onClick={() => cancelBooking(b.id)}>Cancel &amp; Refund</Button>
              ) : (
                <Button variant="secondary" onClick={() => cancelBooking(b.id)}>Discard Pending</Button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      <Modal open={!!reviewCarId} onClose={() => setReviewCarId(null)} title="Rate Your Experience">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5" value={reviewForm.rating} onChange={e => setReviewForm(p => ({...p, rating: e.target.value}))}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)} - {r} Stars</option>)}
            </select>
          </div>
          <InputField label="Comment (optional)" value={reviewForm.comment} onChange={e => setReviewForm(p => ({...p, comment: e.target.value}))} />
          <Button onClick={submitReview} className="w-full">Submit Review</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function Dashboard() {
  const { data: me, isLoading } = useQuery({ queryKey: ['me'], queryFn: () => api.get('me/').then(r => r.data) });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">Loading dashboard…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Welcome, <span className="text-emerald-500">{me?.first_name || me?.username}</span> 👋</h1>
          <p className="text-gray-500 mt-1 capitalize">{me?.role} Dashboard</p>
        </div>
        {me?.role === 'admin' && <AdminDashboard />}
        {me?.role === 'dealer' && <DealerDashboard username={me?.username} />}
        {me?.role === 'customer' && <CustomerDashboard />}
      </div>
    </div>
  );
}
