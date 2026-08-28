import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { MapPin, Ruler, CheckCircle2, Circle, Clock, Images } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import { projects } from '@/data/projectsData';

const statusMeta = {
  in_progress: { label: 'In Progress', dot: 'bg-accent' },
  completed: { label: 'Completed', dot: 'bg-primary' },
  planned: { label: 'Planned', dot: 'bg-muted-foreground' },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

const ProjectCard = ({ project, index }) => {
  const meta = statusMeta[project.status] || statusMeta.planned;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="grid gap-0 lg:grid-cols-5">
        <div className="relative h-64 lg:col-span-2 lg:h-full">
          <img
            src={project.heroImage}
            alt={project.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent lg:bg-gradient-to-r" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>

        <div className="p-6 sm:p-8 lg:col-span-3">
          <h3 className="font-display text-2xl font-700 text-card-foreground">{project.title}</h3>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              {project.location}, {project.county} County
            </span>
            <span className="flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-primary" />
              {project.scope}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{project.description}</p>

          {/* Progress */}
          <div className="mt-6">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Project progress</span>
              <span className="text-foreground">{project.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Milestones */}
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {project.milestones.map((m) => (
              <li key={m.label} className="flex items-start gap-2 text-sm">
                {m.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                )}
                <span className={m.done ? 'text-foreground' : 'text-muted-foreground'}>{m.label}</span>
              </li>
            ))}
          </ul>

          {/* Timeline */}
          <div className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {project.status === 'completed'
              ? <>Started {formatDate(project.startDate)} &middot; Completed {formatDate(project.targetDate)}</>
              : <>Started {formatDate(project.startDate)} &middot; Target completion {formatDate(project.targetDate)}</>}
          </div>
        </div>
      </div>

      {/* Gallery */}
      {project.gallery?.length > 0 && (
        <div className="border-t border-border px-6 py-8 sm:px-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Images className="h-4 w-4 text-primary" />
            Project photos
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {project.gallery.map((photo, i) => (
              <figure key={i} className="group overflow-hidden rounded-lg border border-border bg-secondary/30">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-2 text-[11px] leading-snug text-muted-foreground">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Countdown / completion band */}
      {project.status === 'completed' ? (
        <div className="bg-primary px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
            <div>
              <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Project completed</p>
              <p className="mt-1 font-display text-lg font-600 text-primary-foreground">
                {formatDate(project.targetDate)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-primary px-6 py-6 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Countdown to target completion</p>
              <p className="mt-1 font-display text-lg font-600 text-primary-foreground">
                {formatDate(project.targetDate)}
              </p>
            </div>
            <CountdownTimer targetDate={project.targetDate} />
          </div>
        </div>
      )}
    </motion.article>
  );
};

const ProjectsPage = () => (
  <>
    <Helmet>
      <title>Projects — NetiaX Agrotech Solutions</title>
      <meta
        name="description"
        content="See NetiaX's ongoing irrigation and greenhouse installation projects across Kenya, including live progress, milestones and countdown timers."
      />
    </Helmet>

    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto max-w-[80rem] px-4 sm:px-6 py-16 sm:py-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          Our Work
        </span>
        <h1 className="mt-5 font-display text-4xl font-700 text-foreground sm:text-5xl">
          Projects &amp; Installations
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A live look at NetiaX irrigation, propagation and greenhouse projects underway across
          Kenyan farms — location, scope, milestones and time remaining to completion.
        </p>
      </div>
    </section>

    <section className="mx-auto max-w-[80rem] px-4 sm:px-6 py-16 sm:py-20">
      <div className="grid gap-8">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          New projects will appear here soon.
        </div>
      )}
    </section>
  </>
);

export default ProjectsPage;
