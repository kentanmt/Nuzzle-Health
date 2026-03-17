import { motion } from 'framer-motion';
import { AlertCircle, Stethoscope, Phone, Sparkles, Home, XCircle } from 'lucide-react';

/** A stylized preview of a symptom checker result for the landing page. */
export function TriageResultPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="rounded-3xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden max-w-md mx-auto"
    >
      {/* Fake top bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-card/80">
        <div className="h-3 w-3 rounded-full bg-score-elevated/40" />
        <div className="h-3 w-3 rounded-full bg-score-watch/40" />
        <div className="h-3 w-3 rounded-full bg-score-optimal/40" />
        <span className="ml-2 text-[10px] text-muted-foreground font-medium">nuzzle.health/triage</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Powered by badge */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Smart Symptom Assessment</span>
        </div>

        {/* Urgency banner */}
        <div className="rounded-xl bg-score-watch px-4 py-2.5 text-center">
          <p className="text-xs font-bold text-foreground">⚡ Vet Visit Recommended Within 24–48 Hours</p>
        </div>

        {/* Main result */}
        <div className="rounded-2xl border-2 border-score-watch/30 bg-score-watch/10 p-5 space-y-2">
          <AlertCircle className="h-7 w-7 text-score-watch" />
          <h3 className="font-heading text-base text-foreground">Persistent Vomiting & Low Appetite</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Based on the symptoms described — repeated vomiting, reduced appetite, and mild lethargy — we recommend a vet visit soon. These signs in a 5-year-old Golden Retriever warrant examination.
          </p>
        </div>

        {/* At-Home Care Plan — the key value-add */}
        <div className="rounded-2xl border-2 border-primary/20 bg-sage-light/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-foreground">At-Home Care Plan</p>
              <p className="text-[9px] text-muted-foreground">While you arrange a vet visit</p>
            </div>
          </div>

          {/* Care steps */}
          <div className="space-y-2">
            {[
              { title: 'Rest the stomach', detail: 'Withhold food for 12 hrs, offer ice chips every 30 min', duration: '12 hours' },
              { title: 'Bland diet reintroduction', detail: 'Boiled chicken + white rice, ¼ cup every 4–6 hrs', duration: '24–48 hrs' },
              { title: 'Monitor hydration', detail: 'Check gum moisture & skin elasticity every few hours', duration: 'Ongoing' },
            ].map((step, i) => (
              <div key={i} className="rounded-lg bg-card border border-border p-2.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-foreground">{step.title}</p>
                  <span className="text-[8px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">{step.duration}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </div>

          {/* Do NOT do */}
          <div className="rounded-lg bg-score-elevated/5 border border-score-elevated/20 p-2.5 space-y-1">
            <p className="text-[9px] font-semibold text-foreground flex items-center gap-1">
              <XCircle className="h-3 w-3 text-score-elevated" />
              Do NOT do
            </p>
            <p className="text-[9px] text-muted-foreground">Do not give ibuprofen or aspirin — toxic to dogs</p>
            <p className="text-[9px] text-muted-foreground">Do not force-feed if actively vomiting</p>
          </div>
        </div>

        {/* Possible causes — collapsed for space */}
        <div className="rounded-xl border border-border bg-background p-4 space-y-2">
          <p className="text-[10px] font-semibold text-foreground flex items-center gap-1.5">
            <Stethoscope className="h-3 w-3 text-primary" />
            Possible causes to discuss
          </p>
          <ul className="space-y-1">
            {['Dietary indiscretion (ate something unusual)', 'Gastritis or GI inflammation', 'Pancreatitis (breed predisposition)'].map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-primary" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Vet referral callout */}
        <div className="rounded-xl border border-primary/20 bg-sage-light/50 p-3 space-y-2">
          <div className="flex items-start gap-2.5">
            <Phone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-foreground">VEG — Veterinary Emergency Group</p>
              <p className="text-[9px] text-muted-foreground">2.4 mi away · Open 24/7 · <span className="text-primary font-medium">Nuzzle Partner</span></p>
            </div>
          </div>
          <div className="flex gap-1.5 ml-6">
            <span className="text-[8px] bg-primary text-primary-foreground rounded-md px-2 py-0.5 font-medium">Book Now</span>
            <span className="text-[8px] border border-border rounded-md px-2 py-0.5 font-medium text-muted-foreground">Directions</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
