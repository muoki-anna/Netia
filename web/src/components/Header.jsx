import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, ChevronDown, Moon, Sun } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/blog', label: 'Blog' },
  { to: '/projects', label: 'Projects' },
  { to: '/plans', label: 'Membership' },
  { to: '/shipping', label: 'Shipping' },
];

const shopLinks = [
  { to: '/store?cat=seedlings', label: 'Seedlings' },
  { to: '/store?cat=propagation', label: 'Propagation Media' },
  { to: '/store?cat=irrigation', label: 'Irrigation Systems' },
  { to: '/store?cat=greenhouse', label: 'Greenhouse Systems' },
];

const Header = ({ onCartOpen }) => {
  const { cartItems } = useCart();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('netiax-theme') === 'dark');
  const count = cartItems.reduce((n, i) => n + i.quantity, 0);
  const firstName = currentUser?.name?.trim().split(/\s+/)[0] || currentUser?.email?.split('@')[0] || 'Account';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('netiax-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const isActive = (to) => location.pathname === to;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[80rem] items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center">
          <img src="/assets/img/logo.png" alt="NetiaX Agrotech Solutions" className="h-12 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.slice(0, 1).map((link) => (
            <Link key={link.label} to={link.to} className={`rounded-full px-3 py-2 text-base font-bold transition-colors hover:bg-muted hover:text-primary ${isActive(link.to) ? 'text-primary' : 'text-muted-foreground'}`}>
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-base font-bold transition-colors hover:bg-muted hover:text-primary ${location.pathname === '/store' ? 'text-primary' : 'text-muted-foreground'}`}>
                Shop <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuLabel>Shop by category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/store">All products</Link></DropdownMenuItem>
              {shopLinks.map((link) => <DropdownMenuItem key={link.label} asChild><Link to={link.to}>{link.label}</Link></DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          {navLinks.slice(1).map((link) => (
            <Link key={link.label} to={link.to} className={`rounded-full px-3 py-2 text-base font-bold transition-colors hover:bg-muted hover:text-primary ${isActive(link.to) ? 'text-primary' : 'text-muted-foreground'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={() => setIsDark((value) => !value)} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary" aria-label={isDark ? 'Use light theme' : 'Use dark theme'} title={isDark ? 'Use light theme' : 'Use dark theme'}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="hidden items-center gap-1 sm:flex">
            {isAuthenticated ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary" aria-label="Open account menu">
                  <User className="h-4 w-4" />
                  <span className="max-w-24 truncate">{firstName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Signed in as {firstName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/subscriptions"><User className="h-4 w-4" /> My account</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/rewards">Rewards</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="text-destructive focus:text-destructive"><LogOut className="h-4 w-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <>
              <Link to="/login" className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary">Sign in</Link>
              <Link to="/signup" className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Sign up</Link>
            </>}
          </div>

          <button onClick={onCartOpen} className="relative flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <ShoppingCart className="h-4 w-4" /><span className="hidden xl:inline">Cart</span>
            {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">{count}</span>}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild><button type="button" className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary lg:hidden" aria-label="Open navigation menu"><Menu className="h-5 w-5" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navLinks.map((link) => <DropdownMenuItem key={link.label} asChild><Link to={link.to}>{link.label}</Link></DropdownMenuItem>)}
              <DropdownMenuSeparator /><DropdownMenuLabel>Shop</DropdownMenuLabel>
              {shopLinks.map((link) => <DropdownMenuItem key={link.label} asChild><Link to={link.to}>{link.label}</Link></DropdownMenuItem>)}
              {!isAuthenticated && <><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/login">Sign in</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/signup">Create account</Link></DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
