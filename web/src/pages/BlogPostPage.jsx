import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { getPostBySlug, getRelatedPosts, resources } from '@/data/blogData';
import ResourceCard from '@/components/ResourceCard';

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = getRelatedPosts(post);
  const relatedResources = resources.filter((r) => r.category === post.category).slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{post.title} — NetiaX Farming Insights</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <article>
        <section className="relative overflow-hidden">
          <img src={post.image} alt={post.title} className="h-[42vh] min-h-[280px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-[56rem] px-4 sm:px-6 pb-10">
              <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                {post.category}
              </span>
              <h1 className="mt-4 font-display text-3xl font-700 leading-tight text-white sm:text-4xl">{post.title}</h1>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[56rem] px-4 sm:px-6 py-10">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to all articles
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-5 border-b border-border pb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readTime}</span>
          </div>

          <div className="prose-content mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
            {post.content.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {relatedResources.length > 0 && (
            <div className="mt-14 rounded-2xl bg-secondary/60 p-6 sm:p-8">
              <h2 className="font-display text-xl font-700 text-foreground">Related downloads</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">Keep these guides handy in the field.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {relatedResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-xl font-700 text-foreground">Related articles</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    to={`/blog/${related.slug}`}
                    className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <img src={related.image} alt={related.title} className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                    <div>
                      <span className="text-xs font-semibold text-primary">{related.category}</span>
                      <h3 className="mt-1 font-display text-sm font-600 leading-snug text-card-foreground">{related.title}</h3>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
                        Read <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
};

export default BlogPostPage;
