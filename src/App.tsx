import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './application/auth/useAuth';
import { RequireAuth } from './presentation/routing/RequireAuth';

// Páginas Públicas
import { Home } from './presentation/pages/public/Home';
import { Login } from './presentation/pages/public/Login';
import { Register } from './presentation/pages/public/Register';

// Páginas Privadas
import { Dashboard } from './presentation/pages/private/Dashboard';
import { FlightsPage } from './presentation/pages/private/FlightsPage';
import { BookingsPage } from './presentation/pages/private/BookingsPage';
import { PassengersPage } from './presentation/pages/private/PassengersPage';
// import { CatalogPage } from './presentation/pages/private/CatalogPage';
// import { InvoicesPage } from './presentation/pages/private/InvoicesPage';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/flights"
            element={
              <RequireAuth>
                <FlightsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/bookings"
            element={
              <RequireAuth>
                <BookingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/passengers"
            element={
              <RequireAuth>
                <PassengersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/airlines"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/airports"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/crew"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/maintenance"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          {/* 
            NOTA: Las siguientes rutas están deshabilitadas porque los endpoints
            de la Billing/Flights API no están desplegados en el servidor.
            Endpoints no disponibles: /api/catalog/, /api/invoices/, /api/users/, /api/warehouses/
          */}
          {/* <Route
            path="/catalog"
            element={
              <RequireAuth>
                <CatalogPage />
              </RequireAuth>
            }
          />
          <Route
            path="/invoices"
            element={
              <RequireAuth>
                <InvoicesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/warehouses"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          /> */}

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
