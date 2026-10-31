// ProductDetailPage.jsx – cleaned up and includes Pay with Cash button
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct, getProductQuantities } from '@/api/StoreApi';
import { Button } from '@/components/ui/button';
import { createOrder } from '@/api/StoreApi';

import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, CheckCircle, Minus, Plus, XCircle } from 'lucide-react';

const placeholderImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToCart } = useCart();
  const { toast } = useToast();

  // ---------- Callbacks ----------
  const handleAddToCart = useCallback(async () => {
    if (product && selectedVariant) {
      const availableQuantity = selectedVariant.inventory_quantity;
      try {
        await addToCart(product, selectedVariant, quantity, availableQuantity);
        toast({
          title: 'Added to Cart! 🛒',
          description: `${quantity} x ${product.title} (${selectedVariant.title}) added.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: error.message,
        });
      }
    }
  }, [product, selectedVariant, quantity, addToCart, toast]);

  const handleCashPay = useCallback(async () => {
    if (!product || !selectedVariant) return;
    try {
      const order = await createOrder({
        items: [{ variant_id: selectedVariant.id, quantity }],
        customer: {},
        paymentMethod: 'cash',
      });
      toast({ title: 'Order placed', description: 'Pay cash on delivery.' });
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Cash payment failed',
        description: err.message,
      });
    }
  }, [product, selectedVariant, quantity, navigate, toast]);

  const handleQuantityChange = useCallback((amount) => {
    setQuantity((prev) => {
      const newQty = prev + amount;
      return newQty < 1 ? 1 : newQty;
    });
  }, []);

  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);
    if (variant.image_url && product?.images?.length) {
      const idx = product.images.findIndex((img) => img.url === variant.image_url);
      if (idx !== -1) setCurrentImageIndex(idx);
    }
  }, [product?.images]);

  // ---------- Data fetching ----------
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetched = await getProduct(id);
        const qtyRes = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: [fetched.id],
        });
        const qtyMap = new Map();
        qtyRes.variants.forEach((v) => qtyMap.set(v.id, v.inventory_quantity));
        const enriched = {
          ...fetched,
          variants: fetched.variants.map((v) => ({
            ...v,
            inventory_quantity: qtyMap.get(v.id) ?? v.inventory_quantity,
          })),
        };
        setProduct(enriched);
        if (enriched.variants?.length) setSelectedVariant(enriched.variants[0]);
      } catch (e) {
        setError(e.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!product) return null;

  const price = selectedVariant?.sale_price_in_cents
    ? `$${(selectedVariant.sale_price_in_cents / 100).toFixed(2)}`
    : `$${(selectedVariant?.price_in_cents / 100).toFixed(2)}`;
  const originalPrice = selectedVariant?.price_in_cents
    ? `$${(selectedVariant.price_in_cents / 100).toFixed(2)}`
    : null;
  const canAddToCart =
    selectedVariant?.inventory_quantity == null || quantity <= selectedVariant.inventory_quantity;
  const isStockManaged = selectedVariant?.manage_inventory;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Helmet>
        <title>{product.title}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      {/* Image carousel */}
      <div className="relative mb-6">
        <img
          src={!product.images?.[currentImageIndex]?.url ? placeholderImage : product.images[currentImageIndex].url}
          alt={`${product.title} ${currentImageIndex + 1}`}
          className="w-full h-96 object-cover rounded"
        />
        {product.images?.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex((i) => (i === 0 ? product.images.length - 1 : i - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentImageIndex((i) => (i === product.images.length - 1 ? 0 : i + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2"
            >
              ›
            </button>
          </>
        )}
      </div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col">
        <h1 className="text-4xl font-bold text-foreground mb-2">{product.title}</h1>
        <p className="text-lg text-muted-foreground mb-4">{product.subtitle}</p>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-4xl font-bold text-primary">{price}</span>
          {selectedVariant?.sale_price_in_cents && (
            <span className="text-2xl text-muted-foreground line-through">{originalPrice}</span>
          )}
        </div>

        <div className="prose text-muted-foreground mb-6" dangerouslySetInnerHTML={{ __html: product.description }} />

        {/* Variant selector */}
        {product.variants.length > 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-2">Style</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <Button
                  key={v.id}
                  variant={selectedVariant?.id === v.id ? 'default' : 'outline'}
                  onClick={() => handleVariantSelect(v)}
                  className={`transition-all ${selectedVariant?.id === v.id ? 'bg-primary border-primary' : 'border-border text-foreground hover:bg-muted'}`}
                >
                  {v.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center border border-border rounded-full p-1">
            <Button onClick={() => handleQuantityChange(-1)} variant="ghost" size="icon" className="rounded-full h-8 w-8 text-foreground hover:bg-muted">
              <Minus size={16} />
            </Button>
            <span className="w-10 text-center text-foreground font-bold">{quantity}</span>
            <Button onClick={() => handleQuantityChange(1)} variant="ghost" size="icon" className="rounded-full h-8 w-8 text-foreground hover:bg-muted">
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto">
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary hover:from-purple-600 hover:to-pink-600 text-foreground font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            disabled={!canAddToCart || !product.purchasable}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>

          <Button
            onClick={handleCashPay}
            size="lg"
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10 font-semibold py-3 text-lg mb-3"
            disabled={!canAddToCart || !product.purchasable}
          >
            Pay with Cash
          </Button>

          {/* Future Mpesa button can be added here */}

          {isStockManaged && canAddToCart && product.purchasable && (
            <p className="text-sm text-green-400 mt-3 flex items-center justify-center gap-2">
              <CheckCircle size={16} /> {selectedVariant.inventory_quantity} in stock!
            </p>
          )}
          {isStockManaged && !canAddToCart && product.purchasable && (
            <p className="text-sm text-yellow-400 mt-3 flex items-center justify-center gap-2">
              <XCircle size={16} /> Not enough stock. Only {selectedVariant.inventory_quantity} left.
            </p>
          )}
          {!product.purchasable && (
            <p className="text-sm text-red-400 mt-3 flex items-center justify-center gap-2">
              <XCircle size={16} /> Currently unavailable
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ProductDetailPage;
