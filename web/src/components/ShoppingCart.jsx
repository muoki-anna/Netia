import React, { useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart as ShoppingCartIcon, X, Smartphone } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { createOrder, getProductQuantities } from '@/api/StoreApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import MpesaPaymentDialog from '@/components/MpesaPaymentDialog';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [isMpesaOpen, setIsMpesaOpen] = useState(false);
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

  const handleMpesaClick = useCallback(() => {
    if (cartItems.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Add some products to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    if (hasSubscriptionInCart && !currentUser) {
      toast({
        title: 'Please sign in',
        description: 'You need an account to purchase a subscription. Sign in or create one to continue.',
        variant: 'destructive',
      });
      setIsCartOpen(false);
      navigate('/login');
      return;
    }

    setIsMpesaOpen(true);
  }, [cartItems, hasSubscriptionInCart, currentUser, toast, navigate, setIsCartOpen]);

  const handleMpesaSuccess = useCallback(() => {
    clearCart();
    setPendingOrder(null);
    setIsCartOpen(false);
    navigate('/success');
  }, [clearCart, navigate, setIsCartOpen]);

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Add some products to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    const hasSubscription = cartItems.some(
      item => item.product?.type?.value === 'subscription'
    );

    if (hasSubscription && !currentUser) {
      toast({
        title: 'Please sign in',
        description: 'You need an account to purchase a subscription. Sign in or create one to continue.',
        variant: 'destructive',
      });
      setIsCartOpen(false);
      navigate('/login');
      return;
    }

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

    // Reconcile the persisted cart against the live catalogue so stale variant
    // ids (after a catalogue update) are dropped automatically instead of
    // failing the whole checkout with an "out of date" error.
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
      // If validation itself fails (e.g. network hiccup), continue with the
      // cart as-is rather than blocking checkout.
      console.warn('Cart validation skipped:', validationError);
    }

    // Check out entirely locally: create a pending order in our own
    // database, then open the M-Pesa payment dialog. No Hostinger checkout.
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
  }, [cartItems, clearCart, removeFromCart, toast, currentUser, navigate, setIsCartOpen]);

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
              <div className="p-6 border-t border-border">
                <div className="flex justify-between items-center mb-4 text-card-foreground">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-bold">{getCartTotal()}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base">
                  Proceed to Checkout
                </Button>
                <div className="my-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Button
                  onClick={handleMpesaClick}
                  variant="outline"
                  className="w-full border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 text-base flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Pay with M-Pesa Till
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
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
      <MpesaPaymentDialog
        open={isMpesaOpen}
        onOpenChange={setIsMpesaOpen}
        amount={cartTotalKes}
        orderType={hasSubscriptionInCart ? 'subscription' : 'product'}
        items={cartItems.map(item => ({
          title: item.product.title,
          variant: item.variant.title,
          quantity: item.quantity,
          price_in_cents: item.variant.sale_price_in_cents ?? item.variant.price_in_cents,
        }))}
        email={currentUser?.email || ''}
        name={currentUser?.name || ''}
        userId={currentUser?.id || null}
        storeOrderId={pendingOrder?.id || null}
        onSuccess={handleMpesaSuccess}
      />
    </AnimatePresence>
  );
};

export default ShoppingCart;