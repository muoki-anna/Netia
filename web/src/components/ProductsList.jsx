import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { getProducts, getProductQuantities } from '@/api/EcommerceApi';

export const STORE_CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'seedlings', label: 'Seedlings' },
  { id: 'media', label: 'Propagation Media' },
  { id: 'irrigation', label: 'Irrigation Systems' },
  { id: 'greenhouse', label: 'Greenhouse Systems' },
];

export const categorizeProduct = (product) => {
  const t = `${product.title || ''}`.toLowerCase();
  if (t.includes('greenhouse')) return 'greenhouse';
  if (t.includes('irrigation') || t.includes('dripper') || t.includes('drip')) return 'irrigation';
  if (
    t.includes('coco peat') || t.includes('vermiculite') || t.includes('substrate') ||
    t.includes('netia grow') || t.includes('propagation media') || t.includes('grow media')
  ) return 'media';
  if (
    t.includes('seedling') || t.includes('capsicum') || t.includes('pepper') ||
    t.includes('tomato') || t.includes('cabbage') || t.includes('sukuma') ||
    t.includes('spinach') || t.includes('managu') || t.includes('terere') ||
    t.includes('courgette') || t.includes('kale') || t.includes('broccoli') ||
    t.includes('cauliflower') || t.includes('cucumber') || t.includes('beet') ||
    t.includes('egg plant') || t.includes('eggplant') || t.includes('super bell') ||
    t.includes('strawberry') || t.includes('pomegranate') || t.includes('collard')
  ) return 'seedlings';
  return 'other';
};

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTZlY2U0Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzc4OGE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const displayVariant = useMemo(() => product.variants[0], [product]);
  const hasSale = useMemo(() => displayVariant && displayVariant.sale_price_in_cents !== null, [displayVariant]);
  const displayPrice = useMemo(() => hasSale ? displayVariant.sale_price_formatted : displayVariant.price_formatted, [displayVariant, hasSale]);
  const originalPrice = useMemo(() => hasSale ? displayVariant.price_formatted : null, [displayVariant, hasSale]);
  const isService = product.type?.value === 'service';

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants.length > 1) {
      navigate(`/product/${product.id}`);
      return;
    }

    const defaultVariant = product.variants[0];

    try {
      await addToCart(product, defaultVariant, 1, defaultVariant.inventory_quantity);
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [product, addToCart, toast, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
    >
      <Link to={`/product/${product.id}`}>
        <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="relative overflow-hidden">
            <img
              src={product.image || placeholderImage}
              alt={product.title}
              className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow ${isService ? 'bg-accent' : 'bg-primary'}`}>
              {isService ? 'Service' : 'Product'}
            </span>
            {product.ribbon_text && (
              <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary shadow">
                {product.ribbon_text}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-lg font-600 text-card-foreground">{product.title}</h3>
            <p className="mt-1 mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
              {product.subtitle || (product.description ? product.description.replace(/<[^>]*>/g, '') : 'Quality agrotech solution.')}
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                {hasSale && <span className="text-sm text-muted-foreground line-through">{originalPrice}</span>}
                <span className="text-lg font-bold text-primary">{displayPrice}</span>
              </div>
              <Button onClick={handleAddToCart} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <ShoppingCart className="mr-1.5 h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductsList = ({ limit, category = 'all' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsWithQuantities = async () => {
      try {
        setLoading(true);
        setError(null);

        const productsResponse = await getProducts();

        if (productsResponse.products.length === 0) {
          setProducts([]);
          return;
        }

        const productIds = productsResponse.products.map(product => product.id);

        const quantitiesResponse = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: productIds
        });

        const variantQuantityMap = new Map();
        quantitiesResponse.variants.forEach(variant => {
          variantQuantityMap.set(variant.id, variant.inventory_quantity);
        });

        const productsWithQuantities = productsResponse.products.map(product => ({
          ...product,
          variants: product.variants.map(variant => ({
            ...variant,
            inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
          }))
        }));

        setProducts(productsWithQuantities);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsWithQuantities();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Error loading products: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No products available at the moment.</p>
      </div>
    );
  }

  const filtered = category && category !== 'all'
    ? products.filter((p) => categorizeProduct(p) === category)
    : products;

  if (filtered.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No products in this category yet.</p>
      </div>
    );
  }

  const shown = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductsList;
