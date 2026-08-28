import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Calendar, Clock } from 'lucide-react';
import { posts, resources, CATEGORIES, BLOG_HERO } from '@/data/blogData';
import ResourceCard from '@/components/ResourceCard';

const ALL = 'All';

const BlogPage = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = activeCategory === ALL || post.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <>
      <Helmet>
        <title>Farming Insights &amp; Resources — NetiaX Agrotech</title>
        <meta
          name="description"
          content="Spray programs, planting techniques and kitchen garden best practices from NetiaX, plus downloadable PDF guides and checklists."
        />
      </Helmet>

      <section className="relative overflow-hidden">
        <img src={BLOG_HERO} alt="Kitchen garden greenhouse at golden hour" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        <div className="relative mx-auto max-w-[80rem] px-4 sm:px-6 py-20 md:py-28">
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur">
            NetiaX Farming Insights
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-700 leading-tight text-primary-foreground sm:text-5xl">
            Practical growing knowledge, straight from our agronomists.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
            Spray programs, planting techniques and best practices for kitchen garden farmers —
            with downloadable guides you can keep in the field.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[80rem] px-4 sm:px-6 py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[ALL, ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-full border border-input bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="mt-14 rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No articles match your search. Try a different keyword or category.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {post.category}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-600 leading-snug text-card-foreground">{post.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-secondary/50">
        <div className="mx-auto max-w-[80rem] px-4 sm:px-6 py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-3xl font-700 text-foreground">Downloadable resources</h2>
            <p className="mt-3 text-muted-foreground">
              Field-ready PDF guides, planting calendars and checklists you can print and keep at the garden.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;
