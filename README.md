# 🏎️ Carbook: Peer-to-Peer Car Rental Platform

**Carbook** is a production-ready, fully decoupled peer-to-peer car rental platform designed to handle **concurrent bookings, payment integrity, and failure-safe data systems**.

Unlike typical CRUD projects, Carbook handles concurrency conflicts, secure pricing, and cascading data protection at scale.

---

## 📸 Preview

![Carbook Landing Page](./assets/image-1.png)

> **Live Demo:** https://carbook-modern.vercel.app | **Demo Video:** [Walkthrough Recording](./assets/Carbook.mp4)

---

## 🛠️ Tech Stack & Architecture

### Frontend
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)

### Backend
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SimpleJWT](https://img.shields.io/badge/SimpleJWT-F80000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://django-rest-framework-simplejwt.readthedocs.io/)

---

## ⚡ Key Highlights

### 🛡️ Backend Engineering (Core Strength)
*   **Race Condition Protection:** Conflicting transactions are resolved using payment timestamp verification + backend locking, with automatic refunds triggered for failed attempts via Razorpay.
*   **Server-Side Pricing Engine:** Rental duration and pricing are computed securely using backend `datetime` logic—eliminating client-side manipulation risks.
*   **Graceful Data Handling:** Replaces destructive deletes with "Graceful Suspensions," ensuring active bookings and financial records are never compromised even if a car/dealer is removed.
*   **Access Control Enforcement:** Prevents unauthorized resource access through strict backend permission enforcement and route-level validation.

### 👥 Role-Based System
*   **Customers:** Booking history, license verification, and secure profile management.
*   **Dealers:** Vehicle listing, dynamic pricing control, and availability toggling.
*   **Admins:** Comprehensive platform moderation, listing approvals, and system health monitoring.

### 💳 Integrations
*   **Razorpay:** Secure payment handling and automated refund logic for edge-case collisions.
*   **Cloudinary:** Scalable cloud-hosting for vehicle photography and sensitive legal documents (RC Books).

---

## 📊 System Design Considerations

- Designed to handle **concurrent booking collisions** using backend validation + payment verification timing.
- Ensures **idempotent operations** during payment callbacks to avoid duplicate state changes or double bookings.
- Implements **atomic operations** where required to ensure consistency during critical booking and payment flows.
- Uses a **state-driven booking lifecycle** (Pending → Confirmed → Completed → Cancelled) to manage transaction transitions.
- Backend enforces a **single source of truth** for all pricing, availability, and booking validation logic.
- **Trade-off:** Prioritized **data integrity over latency** in critical booking flows to ensure financial correctness.

---

## 📂 Project Structure

```text
carbook-modern/
├── backend/                # Django REST Framework Backend
│   ├── core/               # Application logic (Models, Views, Serializers)
│   ├── backend_api/        # Project settings and core URL routing
│   └── staticfiles/        # Collected static assets for production
├── frontend/               # React (Vite) Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Navbar, Cards, etc.)
│   │   ├── pages/          # Page-level components (Landing, Dashboard, etc.)
│   │   └── services/       # API integration layer (Axios/Auth)
│   └── public/             # Static assets (Favicons, Icons)
└── README.md
```

---

## 📖 API Documentation

The backend is equipped with **drf-spectacular** to provide interactive API documentation.
- **Swagger UI:** [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **Schema (YAML):** [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)

---

## 🚀 Quick Start

### 1. Backend
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables (.env)
Create a `.env` file in the `backend/` directory:

```ini
SECRET_KEY=your_django_secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Razorpay API
RAZOR_KEY_ID=your_razorpay_key
RAZOR_KEY_SECRET=your_razorpay_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```

---

## 🌐 Deployment

- **Frontend:** Vercel / Netlify
- **Backend:** Render / Heroku
- **Database:** PostgreSQL (Production) / SQLite (Dev)

---

## 🎯 Why this project stands out

Carbook isn’t just a feature-based app—it’s built to simulate real production challenges, including:
- **Built with a defensive backend mindset**, assuming all client input is untrusted and validating everything server-side.
- **Handling simultaneous financial transactions** with integrity using transaction locks.
- **Ensuring data consistency** under high concurrency environments.
- **Designing failure-safe backend systems** that preserve historical financial records.

---

*Designed and developed as a showcase of Full-Stack Architecture and secure REST API design.*

