import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './application/auth/useAuth';
import { RequireAuth } from './presentation/routing/RequireAuth';

// Páginas Públicas
import { Home } from './presentation/pages/public/Home';
import { Login } from './presentation/pages/public/Login';
import { Register } from './presentation/pages/public/Register';

// Páginas Privadas
import { Dashboard } from './presentation/pages/private/Dashboard';
import { UserDashboard } from './presentation/pages/private/UserDashboard';
import { FlightsPage } from './presentation/pages/private/FlightsPage';
import { BookingsPage } from './presentation/pages/private/BookingsPage';
import { PassengersPage } from './presentation/pages/private/PassengersPage';
import { AirlinesPage } from './presentation/pages/private/AirlinesPage';
import { AirportsPage } from './presentation/pages/private/AirportsPage';
import { CrewPage } from './presentation/pages/private/CrewPage';
import { MaintenancePage } from './presentation/pages/private/MaintenancePage';

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
            path="/admin"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/user"
            element={
              <RequireAuth>
                <UserDashboard />
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
                <AirlinesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/airports"
            element={
              <RequireAuth>
                <AirportsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/crew"
            element={
              <RequireAuth>
                <CrewPage />
              </RequireAuth>
            }
          />
          <Route
            path="/maintenance"
            element={
              <RequireAuth>
                <MaintenancePage />
              </RequireAuth>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
