import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import CarDetail from './pages/CarDetail';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/contact', element: <Contact /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:uid/:token', element: <ResetPassword /> },
  { path: '/cars/:id', element: <CarDetail /> },
  {
    path: '/dashboard',
    element: <PrivateRoute><Dashboard /></PrivateRoute>
  },
  {
    path: '/profile',
    element: <PrivateRoute><Profile /></PrivateRoute>
  },
  { path: '*', element: <Navigate to="/" replace /> }
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#1e293b', color: '#fff' } }} />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
