/**
 * BACKUP: Original hero section from LandingPage.
 * To revert, replace <VideoHero /> in LandingPage.tsx with <HeroOriginal />.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroDog from '@/assets/hero-dog.png';

export function HeroOriginal() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sage-light/40 via-background to-background" />
      <div className="container relative py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-sage-light/60 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Proactive pet health, simplified
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-foreground leading-[1.1]">
              Know your pet's health{' '}
              <span className="text-primary">before</span> it's an emergency.
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Nuzzle aggregates your pet's diagnostics into a simple health score
              with actionable insights to extend their healthspan.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/triage">
                <Button size="lg" className="gap-2 h-12 px-6 text-base shadow-lg shadow-primary/20">
                  Check a Symptom <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/waitlist">
                <Button variant="outline" size="lg" className="h-12 px-6 text-base">
                  Join the Waitlist
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
              <img src={heroDog} alt="Veterinarian caring for a golden retriever" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-4 -left-4 md:-left-8 bg-card rounded-2xl shadow-xl border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-sage-light flex items-center justify-center">
                  <span className="text-lg font-heading text-primary">86</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Bella's Score</p>
                  <p className="text-xs text-score-optimal font-medium">↑ 3 pts · Optimal</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="absolute -top-3 -right-3 md:-right-6 bg-card rounded-2xl shadow-xl border border-border p-3"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-terracotta-light flex items-center justify-center">
                  <Bell className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Vaccine Due</p>
                  <p className="text-[10px] text-muted-foreground">DHPP Booster</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
