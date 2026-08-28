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

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 25; // ~75s

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
  onSuccess,
}) {
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState('form'); // form | waiting | success | error
  const [errorMessage, setErrorMessage] = useState('');
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
    onOpenChange(false);
  }, [onOpenChange]);

  const pollStatus = useCallback((checkoutRequestId) => {
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      try {
        const res = await apiServerClient.fetch(`/mpesa/status/${checkoutRequestId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'paid') {
            clearInterval(pollRef.current);
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
          name,
          userId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Could not start M-Pesa payment.');
      }

      const data = await res.json();
      pollCountRef.current = 0;
      pollStatus(data.checkoutRequestId);
    } catch (err) {
      setStage('error');
      setErrorMessage(err.message || 'Could not start M-Pesa payment.');
    }
  }, [phone, amount, orderType, items, email, name, userId, pollStatus]);

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
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Send payment request
            </Button>
          </form>
        )}

        {stage === 'waiting' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-foreground font-medium">Check your phone</p>
            <p className="text-sm text-muted-foreground">
              Enter your M-Pesa PIN on the prompt sent to {phone} to complete the payment of KES {Number(amount).toLocaleString()}.
            </p>
          </div>
        )}

        {stage === 'success' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="text-foreground font-medium">Payment received!</p>
            <p className="text-sm text-muted-foreground">
              Thank you — a confirmation has been sent to your email.
            </p>
            <Button onClick={resetAndClose} className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
