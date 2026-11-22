import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import { ROLES } from './constants/roles';
import Login from './pages/Login';
import AccesRefuse from './pages/AccesRefuse';
import Dashboard from './pages/admin/Dashboard';
import Install from './pages/Install';
import NotFound from './pages/NotFound';
import MesOrdres from './pages/operateur/MesOrdres';
import Historique from './pages/operateur/Historique';
import AppLayout from './layouts/AppLayout';
import Matieres from './pages/admin/Matieres';
import Produits from './pages/admin/Produits';
import Ordres from './pages/admin/Ordres';
import OrdreNouveau from './pages/admin/OrdreNouveau';


function App() {
  const ADMIN_LINKS = [
    { to: '/admin', label: 'Tableau de bord', end: true },
    { to: '/admin/matieres', label: 'Matières premières' },
    { to: '/admin/produits', label: 'Produits' },
    { to: '/admin/ordres', label: 'Ordres' },
  ];
  const OPERATEUR_LINKS = [
    { to: '/operateur', label: 'Mes ordres', end: true },
    { to: '/operateur/historique', label: 'Historique' },
  ];

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

        <Route element={<PrivateRoute roles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AppLayout links={ADMIN_LINKS} />}>
            <Route index element={<Dashboard />} />
            <Route path="matieres" element={<Matieres />} />
            <Route path="produits" element={<Produits />} />
            <Route path="ordres" element={<Ordres />} />
    <Route path="ordres/nouveau" element={<OrdreNouveau />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute roles={[ROLES.OPERATEUR]} />}>
          <Route path="/operateur" element={<AppLayout links={OPERATEUR_LINKS} />}>
            <Route index element={<MesOrdres />} />
            <Route path="historique" element={<Historique />} />
          </Route>
        </Route>
      </Routes>
  )
}

export default App
