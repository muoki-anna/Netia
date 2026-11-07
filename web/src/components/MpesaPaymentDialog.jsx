import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Smartphone, Loader2, CheckCircle2, XCircle } from 'lucide-react';
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
import apiServerClient from '@/lib/apiServerClient';

const WHATSAPP_NUMBER = '254724471075';

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 36; // ~180s

/**
 * M-Pesa Till payment dialog.
 * Props:
 * - open, onOpenChange
 * - amount: total amount in KES (major units)
 * - orderType: 'product' | 'subscription'
 * - items: array snapshot of what's being purchased (for records)
 * - email, name, userId: optional customer info
 * - onSuccess: called once payment is confirmed paid
 */
export default function MpesaPaymentDialog({
  open,
  onOpenChange,
  amount,
  orderType = 'product',
  items = [],
  email = '',
  name = '',
  userId = null,
  storeOrderId = null,
  onSuccess,
}) {
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState(name);
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState('form'); // form | waiting | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const pollRef = useRef(null);
  const pollCountRef = useRef(0);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const resetAndClose = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    pollCountRef.current = 0;
    setStage('form');
    setErrorMessage('');
    setPaymentResult(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const sendWhatsApp = useCallback(() => {
    const itemLines = items
      .map((i) => {
        const price = i.price_in_cents != null
          ? `KES ${(i.price_in_cents / 100).toLocaleString()}`
          : '';
        return `  • ${i.quantity}x ${i.title}${i.variant && i.variant !== 'Default' ? ` (${i.variant})` : ''} ${price}`;
      })
      .join('\n');

    const receipt = paymentResult?.mpesaReceipt ? `*M-Pesa Receipt:* ${paymentResult.mpesaReceipt}` : '';

    const message = [
      '✅ *M-Pesa Payment Confirmed*',
      receipt,
      '',
      `*Customer:* ${customerName || name}`,
      `*Phone:* ${phone}`,
      location ? `*Delivery Location:* ${location}` : '',
      '',
      '*Items:*',
      itemLines,
      '',
      `*Total Paid: KES ${Number(amount).toLocaleString()}*`,
      '',
      '_Payment Method: M-Pesa Till (Confirmed)_',
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }, [customerName, name, phone, location, items, amount, paymentResult]);

  const pollStatus = useCallback((checkoutRequestId) => {
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      try {
        const res = await apiServerClient.fetch(`/mpesa/status/${checkoutRequestId}?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'paid') {
            clearInterval(pollRef.current);
            setPaymentResult(data);
            setStage('success');
            onSuccess?.(data);
            return;
          }
          if (data.status === 'failed' || data.status === 'cancelled') {
            clearInterval(pollRef.current);
            setStage('error');
            setErrorMessage(data.resultDesc || 'Payment was not completed.');
            return;
          }
        }
      } catch {
        // transient network hiccup — keep polling
      }

      if (pollCountRef.current >= MAX_POLLS) {
        clearInterval(pollRef.current);
        setStage('error');
        setErrorMessage('We have not received confirmation yet. If you approved the prompt, your order will still be processed — check your M-Pesa messages.');
      }
    }, POLL_INTERVAL_MS);
  }, [onSuccess]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      setErrorMessage('Enter a valid Safaricom number, e.g. 0712345678');
      return;
    }

    setStage('waiting');

    try {
      const res = await apiServerClient.fetch('/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: digits,
          amount,
          orderType,
          items,
          email,
          name: customerName || name,
          deliveryLocation: location,
          userId,
          storeOrderId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMessage = typeof data.error === 'object' ? data.error?.message : data.error;
        throw new Error(errMessage || data.message || 'Could not start M-Pesa payment.');
      }

      const data = await res.json();
      pollCountRef.current = 0;
      pollStatus(data.checkoutRequestId);
    } catch (err) {
      setStage('error');
      setErrorMessage(err.message || 'Could not start M-Pesa payment.');
    }
  }, [phone, amount, orderType, items, email, name, customerName, location, userId, storeOrderId, pollStatus]);

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? resetAndClose() : onOpenChange(next))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Smartphone className="h-5 w-5 text-primary" />
            Pay with M-Pesa Till
          </DialogTitle>
          <DialogDescription>
            {stage === 'form' && `You'll pay KES ${Number(amount).toLocaleString()} via NetiaX's M-Pesa till.`}
          </DialogDescription>
        </DialogHeader>

        {stage === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mpesa-name">Full Name</Label>
              <Input
                id="mpesa-name"
                type="text"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mpesa-phone">M-Pesa phone number</Label>
              <Input
                id="mpesa-phone"
                type="tel"
                inputMode="numeric"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mpesa-location">Delivery Location</Label>
              <Input
                id="mpesa-location"
                type="text"
                placeholder="e.g. Nairobi, Westlands, House No. 12"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Send payment request
            </Button>
          </form>
        )}

        {stage === 'waiting' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-semibold text-foreground">Check your phone</p>
            <p className="text-sm text-muted-foreground">
              An M-Pesa prompt has been sent to <span className="font-semibold text-foreground">{phone}</span> to pay <span className="font-semibold text-foreground">KES {Number(amount).toLocaleString()}</span>.
            </p>
            <p className="text-xs text-muted-foreground">
              Please enter your M-Pesa PIN on your phone to complete the purchase.
            </p>
          </div>
        )}

        {stage === 'success' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold text-foreground">Payment Received!</p>
            {paymentResult?.mpesaReceipt && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-1 font-mono text-sm font-semibold text-green-800">
                Receipt: {paymentResult.mpesaReceipt}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Amount Paid: <span className="font-semibold text-foreground">KES {Number(amount).toLocaleString()}</span>
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Your M-Pesa payment has been confirmed! Click below to send your order details and receipt directly to NetiaX on WhatsApp.
            </p>

            <Button
              onClick={sendWhatsApp}
              className="mt-2 w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              💬 Send Order to WhatsApp
            </Button>

            <Button onClick={resetAndClose} variant="ghost" className="w-full mt-1 text-muted-foreground">
              Done
            </Button>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <XCircle className="h-10 w-10 text-destructive" />
            <p className="text-foreground font-medium">Payment not confirmed</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button onClick={() => setStage('form')} variant="outline" className="mt-2 w-full">
              Try again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
