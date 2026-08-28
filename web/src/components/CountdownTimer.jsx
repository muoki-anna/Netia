import React, { useEffect, useState } from 'react';

const getTimeParts = (targetDate) => {
  const diff = new Date(targetDate).getTime() - Date.now();
  const clamped = Math.max(diff, 0);
  return {
    total: clamped,
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
};

const Unit = ({ value, label }) => (
  <div className="flex flex-col items-center rounded-xl bg-primary-foreground/10 px-3 py-2.5 min-w-[4.25rem]">
    <span className="font-display text-2xl font-700 tabular-nums text-primary-foreground sm:text-3xl">
      {String(value).padStart(2, '0')}
    </span>
    <span className="mt-1 text-[10px] uppercase tracking-wider text-primary-foreground/70">{label}</span>
  </div>
);

const CountdownTimer = ({ targetDate, className = '' }) => {
  const [time, setTime] = useState(() => getTimeParts(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeParts(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (time.total <= 0) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 text-sm font-semibold text-accent ${className}`}>
        Target date reached
      </div>
    );
  }

  return (
    <div className={`flex gap-2 sm:gap-3 ${className}`}>
      <Unit value={time.days} label="Days" />
      <Unit value={time.hours} label="Hrs" />
      <Unit value={time.minutes} label="Min" />
      <Unit value={time.seconds} label="Sec" />
    </div>
  );
};

export default CountdownTimer;
