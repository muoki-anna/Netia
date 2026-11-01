import React, { useState, useCallback } from 'react';
import { Banknote, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const WHATSAPP_NUMBER = '254724471075';

/**
 * Cash on Delivery dialog.
 * Collects customer name, phone, and delivery location then
 * opens WhatsApp with a pre-filled order summary message.
 *
 * Props:
 * - open, onOpenChange
 * - items: [{ title, variant, quantity, price_in_cents }]
 * - totalKes: number
 * - prefillName, prefillEmail: optional strings from auth context
 * - onSuccess: called after WhatsApp is opened
 */
export default function CashOrderDialog({
  open,
  onOpenChange,
  items = [],
  totalKes = 0,
  prefillName = '',
  onSuccess,
}) {
  const [name, setName] = useState(prefillName);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState('form'); // form | done

  const resetAndClose = useCallback(() => {
    setStage('form');
    setPhone('');
    setLocation('');
    setName(prefillName);
    onOpenChange(false);
  }, [onOpenChange, prefillName]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Build the WhatsApp message
      const itemLines = items
        .map((i) => {
          const price = i.price_in_cents != null
            ? `KES ${(i.price_in_cents / 100).toLocaleString()}`
            : '';
          return `  • ${i.quantity}x ${i.title}${i.variant && i.variant !== 'Default' ? ` (${i.variant})` : ''} ${price}`;
        })
        .join('\n');

      const message = [
        '🛒 *New Cash on Delivery Order*',
        '',
        `*Customer:* ${name}`,
        `*Phone:* ${phone}`,
        `*Delivery Location:* ${location}`,
        '',
        '*Items:*',
        itemLines,
        '',
        `*Total: KES ${Number(totalKes).toLocaleString()}*`,
        '',
        '_Payment: Cash on Delivery_',
      ].join('\n');

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setStage('done');
      onSuccess?.();
    },
    [name, phone, location, items, totalKes, onSuccess]
  );

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? resetAndClose() : onOpenChange(next))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Banknote className="h-5 w-5 text-primary" />
            Pay with Cash on Delivery
          </DialogTitle>
          <DialogDescription>
            {stage === 'form' &&
              `Fill in your details and we'll confirm your order of KES ${Number(totalKes).toLocaleString()} via WhatsApp.`}
          </DialogDescription>
        </DialogHeader>

        {stage === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cash-name">Full Name</Label>
              <Input
                id="cash-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash-phone">Phone Number</Label>
              <Input
                id="cash-phone"
                type="tel"
                inputMode="numeric"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash-location">Delivery Location</Label>
              <Input
                id="cash-location"
                type="text"
                placeholder="e.g. Nairobi, Westlands, House No. 12"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Confirm Order via WhatsApp
            </Button>
          </form>
        )}

        {stage === 'done' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="text-foreground font-medium">Order sent to WhatsApp!</p>
            <p className="text-sm text-muted-foreground">
              We've opened WhatsApp with your order details. Our team will confirm your delivery shortly.
            </p>
            <Button
              onClick={resetAndClose}
              className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

