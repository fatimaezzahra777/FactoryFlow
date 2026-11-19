import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import { ROLES } from './constants/roles';
import Login from './pages/Login';
import AccesRefuse from './pages/AccesRefuse';
import Dashboard from './pages/admin/Dashboard';
import Install from './pages/Install';
import NotFound from './pages/NotFound';
import MesOrdres from './pages/operateur/MesOrdres';

function App() {

  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/acces-refuse" element={<AccesRefuse />} />
        <Route path="/install" element={<Install />} />

        <Route element={<PrivateRoute roles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<Dashboard />} />
        </Route>

        <Route element={<PrivateRoute roles={[ROLES.OPERATEUR]} />}>
          <Route path="/operateur" element={<MesOrdres />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  )
}

export default App
