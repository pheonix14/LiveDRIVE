import React from 'react';
import { UserCheck, Layers, Tv, Shield } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <UserCheck size={24} className="text-gold" />,
      title: 'Zero Friction Anonymous Identity',
      desc: 'No passwords or forms. Every visitor instantly receives a fun pseudonym and persistent color accent stored privately in your browser.',
    },
    {
      icon: <Layers size={24} className="text-mint" />,
      title: 'Draggable Smart Playlist',
      desc: 'Paste any video link, reorder items with native drag & drop, and toggle Loop One, Loop All, or Shuffle modes without page refresh.',
    },
    {
      icon: <Tv size={24} className="text-sky-400" />,
      title: 'Universal Media decoders',
      desc: 'Direct MP4/WebM files, HLS live broadcasts (.m3u8), YouTube, Vimeo, and Google Drive video files play seamlessly in sync.',
    },
    {
      icon: <Shield size={24} className="text-crimson" />,
      title: 'Auto-Expiry & Self-Destruct',
      desc: 'Protect party privacy. Arm timed self-destruct sequences to obliterate rooms and clear session memory automatically.',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16 border-t border-white/5 select-none">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">
          Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-cream">
          HOW LIVEDRIVE WORKS
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div
            key={i}
            className="bg-bg-card/50 border border-white/5 rounded-2xl p-6 flex flex-col items-start gap-4 hover:border-gold/30 transition-colors"
          >
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              {step.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-cream mb-2 font-display tracking-wide">
                {step.title}
              </h3>
              <p className="text-xs text-cream-muted leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
