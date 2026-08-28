import React from 'react';
import { Sprout, Truck, Stethoscope, MapPin, Gift, Leaf } from 'lucide-react';
import PlansList from '@/components/PlansList.jsx';

const benefits = [
  {
    icon: Sprout,
    title: '100 vegetable seedlings a year',
    description:
      'Sukuma, spinach, managu, terere, courgette, curly kale, broccoli, cauliflower, cucumber, beet root, egg plant, cabbage, Hybrid Collard Ahadi F1 and more.',
  },
  {
    icon: Leaf,
    title: '10 coloured capsicum seedlings',
    description: 'Includes Super Bell F1 coloured capsicum seedlings, 10 pieces every year.',
  },
  {
    icon: Truck,
    title: 'Two seasonal deliveries',
    description: 'Your full seedling allocation is delivered to you twice a year, on schedule.',
  },
  {
    icon: Stethoscope,
    title: 'Free online agronomic support',
    description: 'Unlimited access to our agronomists for growing advice, all year round.',
  },
  {
    icon: MapPin,
    title: 'Farm visit upon confirmation',
    description: 'Book an in-person farm visit from our team whenever you need hands-on help.',
  },
  {
    icon: Gift,
    title: 'Loyalty points on every purchase',
    description:
      'Every seedling or growing-media purchase you make earns redeemable points towards future orders.',
  },
];

export default function PlansPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
          Kitchen Garden Farmer Subscription
        </span>
        <h1 className="mt-5 font-display text-4xl text-foreground sm:text-5xl">
          A full year of home-grown vegetables, sorted.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          One annual membership covering seedlings, delivery, agronomic support, farm visits and
          loyalty rewards — everything a kitchen garden farmer needs to grow with confidence.
        </p>
      </header>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-secondary/60 p-8 sm:p-12">
        <div className="mx-auto max-w-md">
          <h2 className="text-center font-display text-2xl text-foreground">
            Choose your membership
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            KES 6,000 billed yearly, covers 12 months of seedlings, support and rewards.
          </p>
          <div className="mt-8">
            <PlansList className="grid gap-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
