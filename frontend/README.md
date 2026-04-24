# Carbook Modern - Frontend Interface

This is the React SPA for the Carbook project, built with Vite and TailwindCSS v4.

## Core Libraries
*   `@tanstack/react-query`: For server-state management, caching, and loading state handling.
*   `react-hook-form` + `zod`: For strict, type-safe form validation (Registration, Profile, Login).
*   `react-router-dom`: SPA Routing.
*   `lucide-react`: Modern vector icons.
*   `axios`: API Client with custom interceptors for JWT token rotation.

## Development
```bash
# Install dependencies
npm install

# Start development server on localhost:5173
npm run dev

# Build for production
npm run build
```

The frontend expects the Django API to be running on `http://localhost:8000`. This is configured in `src/services/api.js`.
