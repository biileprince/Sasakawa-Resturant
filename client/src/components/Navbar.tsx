import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { useCurrentUser } from '../contexts/CurrentUserContext';

interface NavItem {
  to: string;
  label: string;
  capability?: string; // optional capability flag for conditional rendering
  authOnly?: boolean; // require signed in
  icon?: string; // FontAwesome icon class
}

const getNavItems = (currentUser: any): NavItem[] => {
  const baseItems: NavItem[] = [
    { to: '/', label: 'Home', icon: 'fas fa-home' },
    { to: '/services', label: 'Our Services', icon: 'fas fa-concierge-bell' },
    { to: '/menu', label: 'Menu', icon: 'fas fa-utensils' },
  ];

  // Role-specific navigation
  if (currentUser?.role === 'APPROVER' || currentUser?.role === 'FINANCE_OFFICER') {
    // Approvers and Finance Officers see approval-focused navigation
    baseItems.push(
      { to: '/approvals', label: 'Approval Dashboard', icon: 'fas fa-tasks', authOnly: true },
      { to: '/requests', label: 'Requests List', icon: 'fas fa-list-alt', authOnly: true }
    );
  } else {
    // Regular users (REQUESTER) see request-focused navigation
    baseItems.push(
      { to: '/requests/new', label: 'Request Service', icon: 'fas fa-plus-circle' },
      { to: '/requests', label: 'My Requests', icon: 'fas fa-file-alt', authOnly: true }
    );
  }

  // Finance Officer specific items
  if (currentUser?.role === 'FINANCE_OFFICER') {
    baseItems.push(
      { to: '/users', label: 'User Management', icon: 'fas fa-users-cog', authOnly: true },
      { to: '/invoices', label: 'Invoices', icon: 'fas fa-file-invoice', authOnly: true },
      { to: '/payments', label: 'Payments', icon: 'fas fa-credit-card', authOnly: true }
    );
  }

  baseItems.push({ to: '/sign-in', label: 'Sign In', icon: 'fas fa-sign-in-alt' });
  return baseItems;
};

export default function Navbar() {
  const { isSignedIn } = useUser();
  const currentUser = useCurrentUser();
  const [open, setOpen] = useState(false);

  const navItems = getNavItems(currentUser);

  const filtered = navItems.filter((item: NavItem) => {
    if (item.authOnly && !isSignedIn) return false;
    if (!isSignedIn && item.to === '/sign-in') return true; // show sign-in when logged out
    if (item.capability && !currentUser?.capabilities?.[item.capability]) return false;
    if (isSignedIn && item.to === '/sign-in') return false; // hide sign-in when logged in
    return true;
  });

  const toggle = () => setOpen(o => !o);
  const close = () => setOpen(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-green-100 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="group flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                SR
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-green-600 to-green-700 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur"></div>
            </div>
            <div className="flex flex-col">
              <span className="gradient-text text-lg leading-tight">Sasakawa</span>
              <span className="text-gray-600 text-sm font-medium">Restaurant</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {filtered.map((item: NavItem) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={close}
              className={({ isActive }) => 
                `group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/25' 
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-50/80'
                }`
              }
              end={item.to === '/'}
            >
              {item.icon && (
                <i className={`${item.icon} w-4 text-center`}></i>
              )}
              <span>{item.label}</span>
            </NavLink>
          ))}
          {isSignedIn && (
            <div className="ml-4 pl-4 border-l border-gray-200">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  }
                }}
              />
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          {isSignedIn && (
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-lg shadow-md"
                }
              }}
            />
          )}
          <button 
            aria-label="Toggle navigation" 
            onClick={toggle} 
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-2 max-h-96 overflow-y-auto">
            {filtered.map((item: NavItem) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={close}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' 
                      : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
                  }`
                }
                end={item.to === '/'}
              >
                {item.icon && (
                  <i className={`${item.icon} w-5 text-center`}></i>
                )}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
