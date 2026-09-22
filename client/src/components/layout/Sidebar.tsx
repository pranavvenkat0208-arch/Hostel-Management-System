import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  UserCog,
  Wrench,
  Receipt,
  Wallet,
  BarChart3,
  Bell,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import type { Role } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'resident'] },
  { to: '/rooms', label: 'Rooms', icon: DoorOpen, roles: ['admin', 'staff'] },
  { to: '/residents', label: 'Residents', icon: Users, roles: ['admin', 'staff'] },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['admin'] },
  { to: '/my-room', label: 'My Room', icon: DoorOpen, roles: ['resident'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['admin', 'staff', 'resident'] },
  { to: '/billing', label: 'Billing', icon: Receipt, roles: ['admin', 'staff', 'resident'] },
  { to: '/expenses', label: 'Expenses', icon: Wallet, roles: ['admin', 'staff'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'staff', 'resident'] },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const items = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="px-5 py-5">
        <p className="text-lg font-semibold text-slate-900">Wayne Towers</p>
        <p className="text-xs capitalize text-slate-500">{user.role} panel</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100',
                isActive && 'bg-indigo-50 text-indigo-700'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
