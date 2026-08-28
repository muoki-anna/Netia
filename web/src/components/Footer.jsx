import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { TikTok } from './icons/TikTok';

const Footer = () => (
  <footer className="mt-24 bg-primary text-primary-foreground">
    <div className="mx-auto max-w-[80rem] px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-5">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <Sprout className="h-6 w-6" />
          <span className="font-display text-2xl font-700">NetiaX Limited</span>
        </div>
        <p className="text-primary-foreground/80 max-w-sm text-sm leading-relaxed">
          Agrotech solutions for the modern farmer — quality seedlings, Netia Grow
          propagation media, and expert greenhouse &amp; drip irrigation installation.
        </p>
      </div>
      <div>
        <h4 className="font-display text-lg mb-3">Shop</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/80">
          <li><Link to="/store" className="hover:text-accent">All Products</Link></li>
          <li><Link to="/store" className="hover:text-accent">Seedlings</Link></li>
          <li><Link to="/store" className="hover:text-accent">Netia Grow Media</Link></li>
          <li><Link to="/store" className="hover:text-accent">Installation Services</Link></li>
          <li><Link to="/blog" className="hover:text-accent">Farming Insights</Link></li>
          <li><Link to="/shipping" className="hover:text-accent">Shipping Rates</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-lg mb-3">Legal</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/80">
          <li><Link to="/terms-of-service" className="hover:text-accent">Terms of Service</Link></li>
          <li><Link to="/privacy-policy" className="hover:text-accent">Privacy Policy</Link></li>
          <li><Link to="/return-refund-policy" className="hover:text-accent">Return &amp; Refund Policy</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-lg mb-3">Contact</h4>
        <ul className="space-y-2 text-sm text-primary-foreground/80">
          <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 0725000250</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> netiaxke@gmail.com</li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <a
              href="https://maps.app.goo.gl/6ryukPUobFmTSEpf7"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              283-01001, Juja
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-primary-foreground/15 py-8">
      <div className="mx-auto max-w-[80rem] px-4 sm:px-6 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <a
            href="https://facebook.com/netiaxke"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
            aria-label="NetiaX on Facebook"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="https://twitter.com/netiax_ke"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
            aria-label="NetiaX on X (Twitter)"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com/netiaxke"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
            aria-label="NetiaX on Instagram"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://tiktok.com/@netiaxke"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
            aria-label="NetiaX on TikTok"
          >
            <TikTok className="h-5 w-5" />
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-primary-foreground/70">
          <Link to="/terms-of-service" className="hover:text-accent">Terms of Service</Link>
          <span className="opacity-40">&middot;</span>
          <Link to="/privacy-policy" className="hover:text-accent">Privacy Policy</Link>
          <span className="opacity-40">&middot;</span>
          <Link to="/return-refund-policy" className="hover:text-accent">Return &amp; Refund Policy</Link>
        </div>
        <div className="text-center text-xs text-primary-foreground/70">
          &copy; {new Date().getFullYear()} NetiaX Limited. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
