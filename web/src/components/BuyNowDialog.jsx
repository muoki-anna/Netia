import React, { useState } from 'react';
import { Smartphone, Banknote } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CashOrderDialog from '@/components/CashOrderDialog';
import MpesaPaymentDialog from '@/components/MpesaPaymentDialog';

/**
 * BuyNowDialog
 * Step 1 – customer picks payment method (M-Pesa or Cash on Delivery)
 * Step 2 – routes to the appropriate dialog
 *
 * Props:
 * - open, onOpenChange
 * - items: [{ title, variant, quantity, price_in_cents }]
 * - totalKes: number
 * - prefillName: string (from auth, optional)
 * - onSuccess: called after order is placed
 */
export default function BuyNowDialog({
  open,
  onOpenChange,
  items = [],
  totalKes = 0,
  prefillName = '',
  onSuccess,
}) {
  const [method, setMethod] = useState(null); // null | 'cash' | 'mpesa'

  const handleClose = () => {
    setMethod(null);
    onOpenChange(false);
  };

  const handleSuccess = () => {
    setMethod(null);
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <>
      {/* Step 1 — Payment method picker */}
      <Dialog open={open && !method} onOpenChange={(next) => !next && handleClose()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">How would you like to pay?</DialogTitle>
            <DialogDescription>
              Choose a payment method to complete your order of{' '}
              <span className="font-semibold text-foreground">
                KES {Number(totalKes).toLocaleString()}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* M-Pesa option */}
            <button
              onClick={() => setMethod('mpesa')}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-5 text-center transition-all hover:border-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Smartphone className="h-6 w-6 text-green-700" />
              </span>
              <span className="text-sm font-semibold text-card-foreground">M-Pesa</span>
              <span className="text-xs text-muted-foreground">Pay via M-Pesa Till</span>
            </button>

            {/* Cash on Delivery option */}
            <button
              onClick={() => setMethod('cash')}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-5 text-center transition-all hover:border-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Banknote className="h-6 w-6 text-green-700" />
              </span>
              <span className="text-sm font-semibold text-card-foreground">Cash on Delivery</span>
              <span className="text-xs text-muted-foreground">Pay when delivered</span>
            </button>
          </div>

          <Button variant="ghost" className="w-full mt-1 text-muted-foreground" onClick={handleClose}>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>

      {/* Step 2a — Cash on Delivery form */}
      <CashOrderDialog
        open={method === 'cash'}
        onOpenChange={(next) => { if (!next) setMethod(null); }}
        items={items}
        totalKes={totalKes}
        prefillName={prefillName}
        onSuccess={handleSuccess}
      />

      {/* Step 2b — M-Pesa payment */}
      <MpesaPaymentDialog
        open={method === 'mpesa'}
        onOpenChange={(next) => { if (!next) setMethod(null); }}
        amount={totalKes}
        orderType="product"
        items={items}
        name={prefillName}
        onSuccess={handleSuccess}
      />
    </>
  );
}
