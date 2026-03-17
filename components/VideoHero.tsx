import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';

import { HeroHealthScore } from '@/components/HeroHealthScore';
import heroVideo1 from '@/assets/hero-video-1.mp4';
import heroVideo2 from '@/assets/hero-video-2.mp4';
import heroVideo3 from '@/assets/hero-video-3.mp4';

const VIDEO_SOURCES = [heroVideo1, heroVideo2, heroVideo3];
const CYCLE_DURATION = 6000;

interface VideoHeroProps {
  onDashboardClick?: () => void;
}

export function VideoHero({ onDashboardClick }: VideoHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % VIDEO_SOURCES.length);
    }, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === activeIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  return (
    <section className="relative h-[100vh] min-h-[600px] max-h-[900px] overflow-hidden pt-16 bg-foreground">
      {/* Videos */}
      {VIDEO_SOURCES.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
        >
          <video
            ref={(el) => { videoRefs.current[i] = el; }}
            src={src}
            muted
            playsInline
            loop
            preload={i === 0 ? 'auto' : 'metadata'}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'brightness(0.55) contrast(1.1) saturate(0.7) sepia(0.15)',
            }}
          />
        </div>
      ))}

      {/* Warm color wash — single clean gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(175deg, hsla(28, 35%, 12%, 0.45) 0%, hsla(156, 25%, 10%, 0.35) 50%, hsla(28, 20%, 8%, 0.7) 100%)',
        }}
      />

      {/* Bottom fade for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsla(28, 12%, 6%, 0.85) 0%, transparent 55%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
              Proactive pet health, simplified
            </div>

            <h1 className="font-heading text-4xl leading-[1.08] text-white md:text-5xl lg:text-6xl tracking-tight">
              Know your pet's health{' '}
              <span className="text-accent">before</span> it's an emergency.
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-white/75">
              Nuzzle aggregates your pet's diagnostics into a simple health score
              with actionable insights to extend their healthspan.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/triage">
                <Button size="lg" className="h-12 gap-2 px-6 text-base shadow-lg shadow-primary/30">
                  Check a Symptom <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                className="h-12 gap-2 px-6 text-base bg-white text-foreground border-white hover:bg-white/90 hover:text-foreground"
                onClick={onDashboardClick}
              >
                <Heart className="h-4 w-4" /> See My Pet's Health
              </Button>
            </div>
          </motion.div>

          {/* Health Score Card — desktop only */}
          <div className="hidden lg:block flex-shrink-0 mb-4">
            <HeroHealthScore />
          </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex max-w-2xl gap-8 border-t border-white/20 pt-6 md:gap-12"
          >
            {[
              { stat: 'Health Intelligence', label: 'Personalized insights for your pet' },
              { stat: 'Lower Costs', label: 'Earn credits on wellness visits' },
              { stat: 'Instant Triage', label: 'Symptom checks in seconds' },
            ].map((item) => (
              <div key={item.stat}>
                <p className="font-heading text-lg text-white md:text-xl">{item.stat}</p>
                <p className="text-xs text-white/55 md:text-sm">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        {VIDEO_SOURCES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="relative h-1 w-8 overflow-hidden rounded-full bg-white/25"
          >
            {i === activeIndex && (
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: CYCLE_DURATION / 1000, ease: 'linear' }}
                key={activeIndex}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
