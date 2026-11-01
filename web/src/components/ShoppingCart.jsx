import React, { useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart as ShoppingCartIcon, X, Smartphone, Banknote } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { createOrder, getProductQuantities } from '@/api/StoreApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import MpesaPaymentDialog from '@/components/MpesaPaymentDialog';
import CashOrderDialog from '@/components/CashOrderDialog';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [isMpesaOpen, setIsMpesaOpen] = useState(false);
  const [isCashOpen, setIsCashOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  const hasSubscriptionInCart = useMemo(
    () => cartItems.some(item => item.product?.type?.value === 'subscription'),
    [cartItems]
  );

  const cartTotalKes = useMemo(() => {
    return Math.round(
      cartItems.reduce((total, item) => {
        const priceCents = item.variant.sale_price_in_cents ?? item.variant.price_in_cents;
        return total + priceCents * item.quantity;
      }, 0) / 100
    );
  }, [cartItems]);

  const cartItemsForDialog = useMemo(() =>
    cartItems.map(item => ({
      title: item.product.title,
      variant: item.variant.title,
      quantity: item.quantity,
      price_in_cents: item.variant.sale_price_in_cents ?? item.variant.price_in_cents,
    })),
    [cartItems]
  );

  // ── Guard helper ──────────────────────────────────────────────────────────
  const guardCart = useCallback(() => {
    if (cartItems.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Add some products to your cart before checking out.',
        variant: 'destructive',
      });
      return false;
    }
    if (hasSubscriptionInCart && !currentUser) {
      toast({
        title: 'Please sign in',
        description: 'You need an account to purchase a subscription.',
        variant: 'destructive',
      });
      setIsCartOpen(false);
      navigate('/login');
      return false;
    }
    return true;
  }, [cartItems, hasSubscriptionInCart, currentUser, toast, navigate, setIsCartOpen]);

  // ── M-Pesa (quick open) ───────────────────────────────────────────────────
  const handleMpesaClick = useCallback(() => {
    if (!guardCart()) return;
    setIsMpesaOpen(true);
  }, [guardCart]);

  // ── Cash on Delivery ──────────────────────────────────────────────────────
  const handleCashClick = useCallback(() => {
    if (!guardCart()) return;
    setIsCashOpen(true);
  }, [guardCart]);

  const handleCashSuccess = useCallback(() => {
    clearCart();
    setIsCashOpen(false);
    setIsCartOpen(false);
  }, [clearCart, setIsCartOpen]);

  // ── M-Pesa success ────────────────────────────────────────────────────────
  const handleMpesaSuccess = useCallback(() => {
    clearCart();
    setPendingOrder(null);
    setIsCartOpen(false);
    navigate('/success');
  }, [clearCart, navigate, setIsCartOpen]);

  // ── Proceed to Checkout (creates order then opens M-Pesa) ─────────────────
  const handleCheckout = useCallback(async () => {
    if (!guardCart()) return;

    const items = cartItems
      .filter(item => item?.variant?.id)
      .map(item => ({
        variant_id: item.variant.id,
        quantity: Math.max(1, Number(item.quantity) || 1),
      }));

    if (items.length === 0) {
      toast({
        title: 'Checkout Error',
        description: 'Your cart items are no longer valid. Please clear your cart and add the products again.',
        variant: 'destructive',
      });
      return;
    }

    let validItems = items;
    try {
      const productIds = [...new Set(
        cartItems.filter(item => item?.product?.id).map(item => item.product.id)
      )];

      if (productIds.length > 0) {
        const quantities = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: productIds,
        });
        const validVariantIds = new Set((quantities?.variants || []).map(v => v.id));
        const staleItems = items.filter(i => !validVariantIds.has(i.variant_id));

        if (staleItems.length > 0) {
          staleItems.forEach(i => removeFromCart(i.variant_id));
          validItems = items.filter(i => validVariantIds.has(i.variant_id));

          if (validItems.length === 0) {
            toast({
              title: 'Your cart has been updated',
              description: 'The products in your cart are no longer available. Please add them again from the store.',
              variant: 'destructive',
            });
            return;
          }
          toast({
            title: 'Cart updated',
            description: 'Some outdated items were removed from your cart. Continuing checkout with the remaining items.',
          });
        }
      }
    } catch (validationError) {
      console.warn('Cart validation skipped:', validationError);
    }

    let storeOrder = null;
    try {
      const customer = currentUser
        ? { external_id: currentUser.id, email: currentUser.email, name: currentUser.name }
        : undefined;

      storeOrder = await createOrder({ items: validItems, customer });
    } catch (error) {
      console.error('Checkout failed:', error);
      toast({
        title: 'Checkout Error',
        description: (error && error.message) || 'There was a problem creating your order. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setPendingOrder(storeOrder);
    setIsMpesaOpen(true);
  }, [cartItems, guardCart, clearCart, removeFromCart, toast, currentUser, navigate, setIsCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/60 z-50"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-card text-card-foreground shadow-2xl flex flex-col rounded-l-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-card-foreground">Shopping Cart</h2>
              <Button onClick={() => setIsCartOpen(false)} variant="ghost" size="icon" className="text-card-foreground hover:bg-muted">
                <X />
              </Button>
            </div>

            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <ShoppingCartIcon size={48} className="mb-4" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.variant.id} className="flex items-center gap-4 bg-card border border-border p-3 rounded-lg">
                    <img src={item.product.image} alt={item.product.title} className="w-20 h-20 object-cover rounded-md" />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-card-foreground">{item.product.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                      <p className="text-sm text-primary font-bold">
                        {item.variant.sale_price_formatted}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center border border-border rounded-md">
                        <Button onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))} size="sm" variant="ghost" className="px-2 text-card-foreground hover:bg-muted">-</Button>
                        <span className="px-2 text-card-foreground">{item.quantity}</span>
                        <Button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} size="sm" variant="ghost" className="px-2 text-card-foreground hover:bg-muted">+</Button>
                      </div>
                      <Button onClick={() => removeFromCart(item.variant.id)} size="sm" variant="ghost" className="text-destructive hover:text-destructive/90 text-xs">Remove</Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border space-y-3">
                <div className="flex justify-between items-center text-card-foreground">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-bold">{getCartTotal()}</span>
                </div>

                {/* Proceed to Pay indicator */}
                <div className="pt-2 pb-1 text-center">
                  <p className="text-sm font-semibold tracking-wide uppercase text-primary">
                    Proceed to pay with:
                  </p>
                </div>

                {/* Pay with M-Pesa Till */}
                <Button
                  onClick={handleMpesaClick}
                  variant="outline"
                  className="w-full border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 text-base flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Pay with M-Pesa Till
                </Button>

                {/* Pay with Cash on Delivery */}
                <Button
                  onClick={handleCashClick}
                  variant="outline"
                  className="w-full border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 text-base flex items-center justify-center gap-2"
                >
                  <Banknote className="h-4 w-4" />
                  Pay with Cash on Delivery
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By checking out, you agree to our{' '}
                  <Link to="/terms-of-service" onClick={() => setIsCartOpen(false)} className="text-primary underline underline-offset-2">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" onClick={() => setIsCartOpen(false)} className="text-primary underline underline-offset-2">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* M-Pesa Dialog */}
      <MpesaPaymentDialog
        open={isMpesaOpen}
        onOpenChange={setIsMpesaOpen}
        amount={cartTotalKes}
        orderType={hasSubscriptionInCart ? 'subscription' : 'product'}
        items={cartItemsForDialog}
        email={currentUser?.email || ''}
        name={currentUser?.name || ''}
        userId={currentUser?.id || null}
        storeOrderId={pendingOrder?.id || null}
        onSuccess={handleMpesaSuccess}
      />

      {/* Cash on Delivery Dialog */}
      <CashOrderDialog
        open={isCashOpen}
        onOpenChange={setIsCashOpen}
        items={cartItemsForDialog}
        totalKes={cartTotalKes}
        prefillName={currentUser?.name || ''}
        onSuccess={handleCashSuccess}
      />
    </AnimatePresence>
  );
};

export default ShoppingCart;
