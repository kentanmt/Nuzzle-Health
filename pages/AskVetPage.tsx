import { BottomNav } from '@/components/BottomNav';
import { MessageCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AskVetPage() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-56">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container h-14 flex items-center">
          <h1 className="text-lg font-heading text-foreground">Ask a Vet</h1>
        </div>
      </header>

      <main className="container py-12 max-w-lg mx-auto flex flex-col items-center text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-24 w-24 rounded-full bg-sage-light flex items-center justify-center"
        >
          <MessageCircle className="h-12 w-12 text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-heading text-foreground">Vet Concierge</h2>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-sage-light rounded-full px-3 py-1">
            Coming Soon
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground leading-relaxed max-w-sm"
        >
          Get personalized answers from licensed veterinarians who can review your pet's health data, lab results, and history — all within Nuzzle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6 w-full space-y-4"
        >
          <h3 className="text-sm font-semibold text-foreground">What you'll get</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Direct messaging with licensed vets
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Lab result interpretation & guidance
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Personalized care recommendations
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Follow-up support for chronic conditions
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="outline" className="gap-2" disabled>
            <Bell className="h-4 w-4" />
            Notify Me When Available
          </Button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
