import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import ProductsList, { STORE_CATEGORIES } from '@/components/ProductsList';

const StorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const validIds = STORE_CATEGORIES.map((c) => c.id);
  const initial = searchParams.get('cat');
  const [category, setCategory] = useState(validIds.includes(initial) ? initial : 'all');

  useEffect(() => {
    const cat = searchParams.get('cat');
    setCategory(validIds.includes(cat) ? cat : 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectCategory = (id) => {
    setCategory(id);
    setSearchParams(id === 'all' ? {} : { cat: id });
  };

  return (
    <>
      <Helmet>
        <title>Shop — Netiaxke Agrotech</title>
        <meta name="description" content="Browse vegetable seedlings, propagation media, irrigation systems and greenhouse installation by category." />
      </Helmet>
      <section className="bg-secondary/50 border-b border-border">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 py-14">
          <h1 className="font-display text-4xl font-700 text-foreground">The Store</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Everything you need to grow — browse by category: seedlings, propagation media,
            irrigation systems, and greenhouse installation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[80rem] px-4 sm:px-6 py-14">
        <div className="mb-10 flex flex-wrap gap-3">
          {STORE_CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCategory(c.id)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <ProductsList category={category} />
      </div>
    </>
  );
};

export default StorePage;
