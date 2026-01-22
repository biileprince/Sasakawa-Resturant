import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useCurrentUserContext } from "../contexts/CurrentUserContext";
import { useCart } from "../contexts/CartContext";
import NotificationDropdown from "./NotificationDropdown";
import UCCLogo from "./UCCLogo";

interface NavItem {
  to: string;
  label: string;
  capability?: string; // optional capability flag for conditional rendering
  authOnly?: boolean; // require signed in
  icon?: string; // FontAwesome icon class
  children?: NavItem[]; // for dropdown/submenu items
}

const getNavItems = (currentUser: any): NavItem[] => {
  const baseItems: NavItem[] = [
    { to: "/", label: "Home", icon: "fas fa-home" },
    { to: "/services", label: "Our Services", icon: "fas fa-concierge-bell" },
    { to: "/packages", label: "Order Food", icon: "fas fa-utensils" },
  ];

  // Role-specific navigation
  if (
    currentUser?.role === "APPROVER" ||
    currentUser?.role === "FINANCE_OFFICER"
  ) {
    // Approvers and Finance Officers see approval-focused navigation
    baseItems.push(
      {
        to: "/approvals",
        label: "Approvals",
        icon: "fas fa-tasks",
        authOnly: true,
      },
      {
        to: "/requests",
        label: "All Requests",
        icon: "fas fa-list-alt",
        authOnly: true,
      }
    );
  } else if (currentUser) {
    // Regular users (REQUESTER) see request-focused navigation
    baseItems.push(
      {
        to: "/requests",
        label: "My Requests",
        icon: "fas fa-file-alt",
        authOnly: true,
      }
    );
  }

  // Finance Officer specific items with multi-level navigation
  if (currentUser?.role === "FINANCE_OFFICER") {
    baseItems.push({
      to: "/finance",
      label: "Finance",
      icon: "fas fa-chart-line",
      authOnly: true,
      children: [
        {
          to: "/finance",
          label: "Dashboard Overview",
          icon: "fas fa-tachometer-alt",
        },
        {
          to: "/invoices",
          label: "Manage Invoices",
          icon: "fas fa-file-invoice",
        },
        {
          to: "/payments",
          label: "Track Payments",
          icon: "fas fa-credit-card",
        },
        { to: "/users", label: "User Management", icon: "fas fa-users-cog" },
        {
          to: "/package-management",
          label: "Manage Packages",
          icon: "fas fa-box",
        },
      ],
    });
  } else if (currentUser?.role === "APPROVER") {
    // Approver can also manage packages
    baseItems.push({
      to: "/package-management",
      label: "Manage Packages",
      icon: "fas fa-box",
      authOnly: true,
    });
  }

  baseItems.push({
    to: "/sign-in",
    label: "Sign In",
    icon: "fas fa-sign-in-alt",
  });
  return baseItems;
};

export default function Navbar() {
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUserContext();
  const { getItemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Wait for both Clerk and user data to load before showing role-based navigation
  const isFullyLoaded = isClerkLoaded && (!isSignedIn || (isSignedIn && !isUserLoading));
  
  const navItems = getNavItems(isFullyLoaded ? currentUser : null);
  const cartItemCount = getItemCount();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpen(false);
        setDropdownOpen(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = navItems.filter((item: NavItem) => {
    if (item.authOnly && !isSignedIn) return false;
    if (!isSignedIn && item.to === "/sign-in") return true; // show sign-in when logged out
    if (item.capability && !currentUser?.capabilities?.[item.capability])
      return false;
    if (isSignedIn && item.to === "/sign-in") return false; // hide sign-in when logged in
    return true;
  });

  const toggle = () => setOpen((o) => !o);
  const close = () => {
    setOpen(false);
    setDropdownOpen(null);
  };

  const toggleDropdown = (itemLabel: string) => {
    setDropdownOpen(dropdownOpen === itemLabel ? null : itemLabel);
  };

  const DropdownItem = ({
    item,
    isMobile = false,
  }: {
    item: NavItem;
    isMobile?: boolean;
  }) => {
    if (!item.children) {
      return (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={close}
          className={({ isActive }) =>
            `group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-primary"
                : "text-gray-700 hover:text-primary-700 hover:bg-primary-50/80"
            }`
          }
          end={item.to === "/"}
        >
          {item.icon && <i className={`${item.icon} text-sm`}></i>}
          <span>{item.label}</span>
        </NavLink>
      );
    }

    return (
      <div className="relative">
        <button
          onClick={() => toggleDropdown(item.label)}
          className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full ${
            dropdownOpen === item.label
              ? "bg-green-100 text-green-700"
              : "text-gray-700 hover:text-green-700 hover:bg-green-50/80"
          }`}
        >
          {item.icon && <i className={`${item.icon} text-sm`}></i>}
          <span className="flex-1 text-left">{item.label}</span>
          <i
            className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
              dropdownOpen === item.label ? "rotate-180" : ""
            }`}
          ></i>
        </button>

        {dropdownOpen === item.label && (
          <div
            className={`${
              isMobile
                ? "mt-2 ml-4"
                : "absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
            }`}
          >
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                    isMobile
                      ? "rounded-lg"
                      : "first:rounded-t-xl last:rounded-b-xl"
                  } ${
                    isActive
                      ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                      : "text-gray-600 hover:text-green-700 hover:bg-green-50/50"
                  }`
                }
              >
                {child.icon && <i className={`${child.icon} text-sm w-4`}></i>}
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header
      ref={navRef}
      className="glass-white sticky top-0 z-50 border-b border-primary-100 bg-white/95 backdrop-blur-lg shadow-primary"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="group flex items-center gap-3 text-xl font-bold tracking-tight"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-primary group-hover:shadow-lg transition-all duration-200">
                <UCCLogo size="md" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl opacity-20 group-hover:opacity-25 transition-opacity duration-200 blur"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-primary-600 font-bold text-lg leading-tight">
                Sasakawa
              </span>
              <span className="text-gray-600 text-sm font-medium">
                Restaurant
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {filtered.map((item: NavItem) => (
            <DropdownItem key={item.to} item={item} />
          ))}
          
          {/* Cart Icon */}
          <Link
            to="/checkout"
            className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <i className="fas fa-shopping-cart text-lg"></i>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>
          
          {isSignedIn && (
            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
              <NotificationDropdown />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      "w-10 h-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
                  },
                }}
              />
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Mobile Cart Icon */}
          <Link
            to="/checkout"
            className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <i className="fas fa-shopping-cart text-lg"></i>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>
          
          {isSignedIn && (
            <>
              <NotificationDropdown />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 rounded-lg shadow-md",
                  },
                }}
              />
            </>
          )}
          <button
            aria-label="Toggle navigation"
            onClick={toggle}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            <svg
              className="h-5 w-5 text-gray-700"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
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
              <DropdownItem key={item.to} item={item} isMobile={true} />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
