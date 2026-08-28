import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Facebook, Twitter, Instagram, User, LogOut } from 'lucide-react';
import { TikTok } from './icons/TikTok';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/store', label: 'Shop' },
  { to: '/store?cat=seedlings', label: 'Seedlings' },
  { to: '/store?cat=irrigation', label: 'Irrigation' },
  { to: '/blog', label: 'Blog' },
  { to: '/projects', label: 'Projects' },
  { to: '/plans', label: 'Membership' },
  { to: '/shipping', label: 'Shipping' },
];

const Header = ({ onCartOpen }) => {
  const { cartItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const count = cartItems.reduce((n, i) => n + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-[80rem] px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img
            src="https://images.hostinger.com/bb255e78-128b-47e5-bd96-fa47fe96fc3e.png"
            alt="NetiaX Agrotech Solutions"
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to.split('?')[0] ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://facebook.com/netiaxke"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
            aria-label="NetiaX on Facebook"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a
            href="https://twitter.com/netiax_ke"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
            aria-label="NetiaX on X (Twitter)"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href="https://instagram.com/netiaxke"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
            aria-label="NetiaX on Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href="https://tiktok.com/@netiaxke"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
            aria-label="NetiaX on TikTok"
          >
            <TikTok className="h-4 w-4" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/rewards"
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Rewards
              </Link>
              <Link
                to="/subscriptions"
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <User className="h-4 w-4" />
              </Link>
              <button
                onClick={logout}
                aria-label="Log out"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
