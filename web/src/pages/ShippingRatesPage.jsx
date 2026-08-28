import React from 'react';
import { Truck, MapPin } from 'lucide-react';

const rates = [
  { region: 'Nairobi', price: 'KES 250' },
  { region: 'Mombasa', price: 'KES 1,000' },
  { region: 'Kisumu', price: 'KES 700 – 1,000' },
  { region: 'Western Kenya', price: 'KES 700 – 1,000' },
  { region: 'North Eastern', price: 'KES 800 – 1,000' },
  { region: 'Kajiado', price: 'KES 700' },
  { region: 'Kitui', price: 'KES 600' },
  { region: 'Machakos', price: 'KES 500' },
  { region: 'Wote', price: 'KES 600' },
  { region: 'Meru', price: 'KES 600' },
  { region: 'Isiolo', price: 'KES 600' },
];

const ShippingRatesPage = () => {
  return (
    <div className="mx-auto max-w-[64rem] px-4 sm:px-6 py-14">
      <div className="flex flex-col items-center text-center gap-3 mb-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Truck className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-700 text-foreground">
          Shipping Rates
        </h1>
        <p className="text-muted-foreground max-w-xl">
          We deliver seedlings, Netia Grow media, and equipment across Kenya.
          Delivery charges below are estimates by region — exact costs may vary
          based on order size and exact delivery location.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-secondary/60">
              <th className="px-6 py-4 text-sm font-semibold text-secondary-foreground">
                Region
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-secondary-foreground text-right">
                Delivery Fee
              </th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r, i) => (
              <tr
                key={r.region}
                className={i % 2 === 0 ? 'bg-card' : 'bg-muted/40'}
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {r.region}
                </td>
                <td className="px-6 py-4 text-sm text-right text-foreground font-semibold">
                  {r.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-muted-foreground text-center">
        For remote areas not listed above, or bulky/bulk orders, please contact
        us via WhatsApp or phone to confirm the delivery fee before checkout.
      </p>
    </div>
  );
};

export default ShippingRatesPage;
