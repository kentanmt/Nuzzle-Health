import { BottomNav } from '@/components/BottomNav';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2, Footprints, Smartphone, Users, Trophy, Bell, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Footprints,
    title: 'Daily Activity Tracking',
    description: 'Monitor steps, distance, active minutes, and rest patterns to keep your pet at their healthiest.',
  },
  {
    icon: Smartphone,
    title: 'Connect Your Device',
    description: 'Sync with popular pet wearables and GPS trackers for automatic, real-time activity data.',
  },
  {
    icon: Users,
    title: 'Community & Friends',
    description: 'Share walks, compare stats, and cheer on friends in your neighborhood pet community.',
  },
  {
    icon: Trophy,
    title: 'Goals & Streaks',
    description: 'Set daily activity goals, earn streaks, and celebrate milestones with your pet.',
  },
  {
    icon: MapPin,
    title: 'Walk Maps & Routes',
    description: 'Track your favorite walking routes, discover new ones, and log outdoor adventures.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Get nudges when your pet needs more movement or when activity patterns change unexpectedly.',
  },
];

export default function ActivityPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-56">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <NuzzleLogo size="sm" />
        </div>
      </header>

      <main className="container py-10 max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Footprints className="h-3.5 w-3.5" />
            Coming Soon
          </div>
          <h1 className="font-heading text-3xl text-foreground">Activity</h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Track your pet's daily movement, connect smart devices, and join a community of pet parents — all in one place.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-sage-light flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-base text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-3"
        >
          <p className="text-sm font-medium text-foreground">We're building this right now 🐾</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Activity tracking, device integrations, and community features are in active development. Stay tuned — your pet's next adventure awaits.
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
