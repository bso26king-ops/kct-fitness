import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { T, applyTheme, FONT_IMPORT } from './theme';
import BottomNav from './components/BottomNav';

// Pages
import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import Home           from './pages/Home';
import Train          from './pages/Train';
import WorkoutPlayer  from './pages/WorkoutPlayer';
import Progress       from './pages/Progress';
import Nutrition      from './pages/Nutrition';
import More           from './pages/More';
import Goals          from './pages/Goals';
import Leaderboard    from './pages/Leaderboard';
import Kickboxing     from './pages/Kickboxing';
import Shop           from './pages/Shop';
import Calendar       from './pages/Calendar';
import Wearables        from './pages/Wearables';
import AIWorkoutBuilder from './pages/AIWorkoutBuilder';
import PrivacyPolicy    from './pages/PrivacyPolicy';

applyTheme(true); // default dark

// Routes that require auth
function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <Splash />;
  if (!user)  return <Navigate to="/login" replace />;
  return children;
}

function Splash() {
  return (
    <div style={{ minHeight: '100vh', background: T.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 4, color: T.red }}>KCT</div>
        <div style={{ fontSize: 9, letterSpacing: 3, color: T.whiteDim, marginTop: 4 }}>LOADING…</div>
      </div>
    </div>
  );
}

// Shell for authenticated client pages (bottom nav + scroll area)
const NO_NAV = ['/workout', '/login', '/register', '/forgot-password'];

function ClientShell({ children }) {
  const { pathname } = useLocation();
  const showNav = !NO_NAV.some(p => pathname.startsWith(p));
  return (
    <div style={{
      minHeight: '100vh', background: T.black, color: T.white,
      fontFamily: "'Barlow Condensed', Barlow, sans-serif",
      display: 'flex', flexDirection: 'column',
      maxWidth: 480, margin: '0 auto', position: 'relative',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: showNav ? 72 : 0 }}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <style>{`
          ${FONT_IMPORT}
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { height: 100%; width: 100%; overflow: hidden; background: ${T.black}; }
          body { font-family: 'Barlow Condensed', Barlow, sans-serif; color: ${T.white}; }
          ::-webkit-scrollbar { width: 3px; height: 3px; }
          ::-webkit-scrollbar-thumb { background: ${T.line}; }
          input::placeholder, textarea::placeholder { color: ${T.whiteDim} !important; }
          input:-webkit-autofill, input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px ${T.surface} inset !important;
            -webkit-text-fill-color: ${T.white} !important;
          }
          select option { background: ${T.surfaceHi}; color: ${T.white}; }
        `}</style>

        <Routes>
          {/* Public */}
          <Route path="/login"            element={<Login />} />
          <Route path="/register"         element={<Register />} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />

          {/* Protected */}
          <Route path="/" element={
            <RequireAuth>
              <ClientShell><Home /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/train" element={
            <RequireAuth>
              <ClientShell><Train /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/workout" element={
            <RequireAuth>
              <WorkoutPlayer />
            </RequireAuth>
          }/>
          <Route path="/progress" element={
            <RequireAuth>
              <ClientShell><Progress /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/nutrition" element={
            <RequireAuth>
              <ClientShell><Nutrition /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/more" element={
            <RequireAuth>
              <ClientShell><More /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/goals" element={
            <RequireAuth>
              <ClientShell><Goals /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/leaderboard" element={
            <RequireAuth>
              <ClientShell><Leaderboard /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/kickboxing" element={
            <RequireAuth>
              <ClientShell><Kickboxing /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/shop" element={
            <RequireAuth>
              <ClientShell><Shop /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/calendar" element={
            <RequireAuth>
              <ClientShell><Calendar /></ClientShell>
            </RequireAuth>
          }/>
          <Route path="/wearables" element={
            <RequireAuth>
              <ClientShell><Wearables /></ClientShell>
            </RequireAuth>
          }/>

          <Route path="/ai-builder" element={
            <RequireAuth>
              <AIWorkoutBuilder />
            </RequireAuth>
          }/>

          {/* Public utility */}
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
