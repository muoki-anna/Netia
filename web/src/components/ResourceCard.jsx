import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { generateResourcePdf } from '@/lib/generateResourcePdf';

const ResourceCard = ({ resource }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await Promise.resolve(generateResourcePdf(resource));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          {resource.category}
        </span>
        <h3 className="mt-3 font-display text-lg font-600 text-card-foreground">{resource.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{resource.description}</p>
      </div>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        Download PDF
      </button>
    </div>
  );
};

export default ResourceCard;
