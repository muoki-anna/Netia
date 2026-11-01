import React, { useState, useCallback } from 'react';
import { Banknote, CheckCircle2, Loader2 } from 'lucide-react';
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
import { apiServerClient } from '@/lib/apiServerClient';

const WHATSAPP_NUMBER = '254724471075';

/**
 * Cash on Delivery dialog.
 * Saves the order to PocketBase (via backend /orders) so it shows in the dashboard,
 * then opens WhatsApp with pre-filled details for the customer.
 */
export default function CashOrderDialog({
  open,
  onOpenChange,
  items = [],
  totalKes = 0,
  prefillName = '',
  prefillEmail = '',
  userId = null,
  onSuccess,
}) {
  const [name, setName] = useState(prefillName);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState('form'); // form | done
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const resetAndClose = useCallback(() => {
    setStage('form');
    setPhone('');
    setLocation('');
    setName(prefillName);
    setCreatedOrderId(null);
    setSubmitting(false);
    onOpenChange(false);
  }, [onOpenChange, prefillName]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);

      let orderId = null;

      // 1. Save the order to PocketBase through the backend
      try {
        const itemsSnapshot = items.map((i) => ({
          title: i.title,
          variant: i.variant,
          quantity: i.quantity,
          unit_price_in_cents: i.price_in_cents || 0,
        }));

        const totalInCents = Math.round(Number(totalKes) * 100);

        const res = await apiServerClient.fetch('/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items_snapshot: itemsSnapshot,
            total_in_cents: totalInCents,
            currency: 'KES',
            customer_email: prefillEmail || '',
            customer_name: name || '',
            user: userId || null,
            phone: phone || '',
            delivery_location: location || '',
            payment_method: 'cash',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          orderId = data?.id;
          setCreatedOrderId(orderId);
        }
      } catch (err) {
        console.warn('Could not record cash order in database:', err);
      }

      // 2. Build the WhatsApp message
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
        orderId ? `*Order ID:* ${orderId}` : '',
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
      ].filter(Boolean).join('\n');

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setSubmitting(false);
      setStage('done');
      onSuccess?.();
    },
    [name, phone, location, items, totalKes, prefillEmail, userId, onSuccess]
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
              `Fill in your delivery details to confirm your order of KES ${Number(totalKes).toLocaleString()}.`}
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
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Order...
                </>
              ) : (
                'Confirm Order via WhatsApp'
              )}
            </Button>
          </form>
        )}

        {stage === 'done' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="text-foreground font-medium">Order Confirmed!</p>
            {createdOrderId && (
              <p className="text-xs text-muted-foreground font-mono">
                Order Ref: #{createdOrderId}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Your order has been recorded and WhatsApp has opened with your order details.
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
