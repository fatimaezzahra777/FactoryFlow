import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const linkClass = ({ isActive }) =>
  `whitespace-nowrap px-3 py-3 text-sm ${
    isActive ? 'bg-brand font-semibold text-ink' : 'text-muted hover:text-white'
  }`;

export default function AppLayout({ links }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-1 border-b border-line p-4 md:w-60 md:border-r md:border-b-0">
        <span className="mb-4 px-3 text-sm tracking-[0.2em]">FACTORY FLOW</span>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 md:mt-auto">
          <p className="px-3 text-[13px] text-muted">
            {user?.name}
            <span className="block font-mono text-xs uppercase tracking-[0.12em]">{user?.role}</span>
          </p>
          <Button variant="ghost" onClick={logout}>Déconnexion</Button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}