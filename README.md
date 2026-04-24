# 🏎️ Carbook

**Carbook** is a production-ready, fully decoupled peer-to-peer car rental platform. Built with a React (Vite) frontend and a Django REST Framework backend, the platform securely connects car owners (Dealers) with renters (Customers).

It is designed to handle real-world edge cases, including payment race conditions, robust date-based pricing engines, and strict cascading data safeguards.

---

## ✨ Features & Architecture

### 🛡️ Advanced Security & Business Logic
*   **Concurrency & Race Condition Locks:** If two users attempt to book the exact same car at the identical millisecond, the backend strictly verifies Razorpay checkout times and immediately refunds the slower user, preventing double-bookings.
*   **Secure Pricing Engine:** To prevent network-payload manipulation, rental durations (`nod`) and pricing are calculated exclusively server-side using secure `datetime` diffing between pickup and dropoff dates.
*   **Cascading Safeguards:** When Admins suspend cars or ban dealers, the database utilizes "Graceful Suspensions" instead of hard deletions. This ensures that active customer bookings are preserved and financial records remain completely intact.
*   **Strict Access Control:** URL masking prevents unauthorized users from manually typing URLs to bypass the UI flow and view hidden cars.

### 👥 Role-Based Portals
*   **Customer Dashboard:** Track active/past bookings, upload Driving License verification, and securely manage profile settings.
*   **Dealer Dashboard:** List new vehicles, dynamically toggle car availability (`Online`/`Offline`), modify pricing, and natively mark cars as "Returned" upon physical key drop-off.
*   **Admin Controls:** Review incoming car listings for approval/rejection, suspend bad actors, and monitor overall platform health.

### 💳 Payments & Media
*   **Razorpay Integration:** Real-time, test-mode payment capture and verification.
*   **Cloudinary Storage:** Scalable cloud-hosting for car photography and RC Book documents.

---

## 🛠️ Tech Stack

**Frontend:**
* React 18 (Vite)
* TailwindCSS (Modern Emerald & Black Aesthetic)
* React Query (Data Fetching & Caching)
* React Router DOM v6
* Lucide React (Icons)

**Backend:**
* Django & Django REST Framework
* SQLite / PostgreSQL (Production)
* SimpleJWT (Authentication)
* Razorpay SDK
* Cloudinary (Media Storage)

---

## 🚀 Quickstart Guide

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Database & Migrations
python manage.py migrate

# Start Server
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables (.env)
Create a `.env` file in your `backend/` directory with the following keys:
```ini
SECRET_KEY=your_django_secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Email Config (For Password Resets & Notifications)
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# Razorpay API
RAZOR_KEY_ID=your_razorpay_key
RAZOR_KEY_SECRET=your_razorpay_secret

# Cloudinary (Optional for Dev, Required for Prod)
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```

---

*Designed and developed as a showcase of Full-Stack Architecture and secure REST API design.*
