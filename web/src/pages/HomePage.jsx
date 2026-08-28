import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Leaf, Warehouse, Droplets, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductsList from '@/components/ProductsList';

const HERO = 'https://images.hostinger.com/6f503c8b-1dc3-4fb8-9708-efcbf8d12d99.png';
const MEDIA = 'https://images.hostinger.com/a29b28b7-d2fd-49f9-b6f5-21c648e95b2e.png';

const categories = [
  { icon: Leaf, title: 'Vegetable Seedlings', desc: 'Healthy, disease-free hybrid seedlings raised for high yields.' },
  { icon: Sprout, title: 'Netia Grow Media', desc: 'Premium propagation media for strong roots and vigorous growth.' },
  { icon: Warehouse, title: 'Greenhouse Installation', desc: 'Turnkey greenhouse design and installation by agronomists.' },
  { icon: Droplets, title: 'Drip Irrigation', desc: 'Efficient drip systems that save water and boost productivity.' },
];

const HomePage = () => (
  <>
    <Helmet>
      <title>Netiaxke — Agrotech Solutions, Seedlings &amp; Greenhouse Systems</title>
      <meta name="description" content="Netiaxke supplies quality vegetable seedlings, Netia Grow propagation media, greenhouse installation and drip irrigation services across Kenya." />
    </Helmet>

    {/* Hero */}
    <section className="relative overflow-hidden">
      <img src={HERO} alt="Thriving greenhouse crops" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
      <div className="relative mx-auto max-w-[80rem] px-4 sm:px-6 py-28 md:py-36">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Sprout className="h-4 w-4" /> Growing farms across Kenya
          </span>
          <h1 className="mt-5 font-display text-4xl font-700 leading-tight sm:text-6xl">
            Smarter farming starts with the right foundation.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
            From certified vegetable seedlings and Netia Grow propagation media to complete
            greenhouse and drip irrigation installation — we equip you to grow more, better.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/store">Shop the store <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/store">Our services</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Categories */}
    <section className="mx-auto max-w-[80rem] px-4 sm:px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-700 text-foreground sm:text-4xl">What we offer</h2>
        <p className="mt-3 text-muted-foreground">Complete agrotech solutions under one roof.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <c.icon className="h-6 w-6" />
            </span>
            <h3 className="font-display text-lg font-600 text-card-foreground">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Media feature */}
    <section className="bg-secondary/50">
      <div className="mx-auto grid max-w-[80rem] items-center gap-10 px-4 sm:px-6 py-20 md:grid-cols-2">
        <img src={MEDIA} alt="Netia Grow propagation media" className="h-80 w-full rounded-2xl object-cover shadow-lg" />
        <div>
          <h2 className="font-display text-3xl font-700 text-foreground">Netia Grow propagation media</h2>
          <p className="mt-4 text-muted-foreground">
            Engineered for exceptional water retention, aeration, and root development.
            Netia Grow gives your seedlings the strongest possible start — for uniform,
            healthy transplants every cycle.
          </p>
          <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/store">Buy Netia Grow <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>

    {/* Featured products */}
    <section className="mx-auto max-w-[80rem] px-4 sm:px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-700 text-foreground sm:text-4xl">Featured</h2>
          <p className="mt-2 text-muted-foreground">Popular seedlings, media and services.</p>
        </div>
        <Link to="/store" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ProductsList limit={6} />
    </section>
  </>
);

export default HomePage;
