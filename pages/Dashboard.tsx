import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HealthScoreRing } from '@/components/HealthScoreRing';
import { InsightCard } from '@/components/InsightCard';
import { WeightChart } from '@/components/WeightChart';
import { BottomNav } from '@/components/BottomNav';
import { mockPet, mockHealthScore, mockInsights, mockWeightEntries, mockActivityEntries, mockLabResults, mockCareEvents } from '@/lib/mock-data';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { PawPrint, Calendar, Activity, Droplets, TrendingUp, AlertTriangle, CheckCircle, Clock, UserPlus, Plus, Sparkles, Loader2, RefreshCw, LogOut, Upload, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { MarkerChart } from '@/components/MarkerChart';
import { ConnectedDevices } from '@/components/ConnectedDevices';
import { Link } from 'react-router-dom';
import { AddPetDialog } from '@/components/AddPetDialog';
import { usePetData } from '@/hooks/usePetData';
import { useAIHealth } from '@/hooks/useAIHealth';
import { UploadLabDialog } from '@/components/UploadLabDialog';
import type { Pet, Insight } from '@/lib/types';

export default function Dashboard() {
  const [showAddPet, setShowAddPet] = useState(false);
  const [showUploadLab, setShowUploadLab] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { pet: userPet, petRecords, parsedLabs, isRealPet, refetch, weightHistory } = usePetData();
  const { data: aiHealth, loading: aiLoading, error: aiError, refetch: refetchAI } = useAIHealth(
    isRealPet,
    isRealPet // run AI as soon as a real pet exists, regardless of lab data
  );

  // Gate: redirect to landing if not authenticated
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const pet = userPet || mockPet;

  // AI-powered score for real pets, fallback to generated score
  const score = aiHealth?.health_score
    ? {
        overall: aiHealth.health_score.overall,
        category: aiHealth.health_score.category,
        change: aiHealth.health_score.change,
        breakdown: {
          bloodwork: aiHealth.health_score.breakdown.bloodwork.score,
          weight: aiHealth.health_score.breakdown.weight.score,
          activity: aiHealth.health_score.breakdown.preventive_care.score,
          age: aiHealth.health_score.breakdown.age_conditions.score,
        },
      }
    : isRealPet
    ? generateHealthScore(userPet!)
    : mockHealthScore;

  const breakdownLabels = aiHealth?.health_score?.breakdown
    ? {
        bloodwork: aiHealth.health_score.breakdown.bloodwork.label,
        weight: aiHealth.health_score.breakdown.weight.label,
        activity: aiHealth.health_score.breakdown.preventive_care.label,
        age: aiHealth.health_score.breakdown.age_conditions.label,
      }
    : null;

  const breakdownKeys = [
    { key: 'bloodwork', label: 'Bloodwork' },
    { key: 'weight', label: 'Weight' },
    { key: 'activity', label: 'Preventive Care' },
    { key: 'age', label: 'Age & Conditions' },
  ];

  // AI insights for real pets, mock for demo
  const insights: Insight[] = aiHealth?.insights
    ? aiHealth.insights.map(i => ({
        id: i.id,
        petId: pet.id,
        title: i.title,
        description: i.description,
        riskLevel: i.riskLevel,
        action: i.action,
      }))
    : !isRealPet
    ? mockInsights
    : [];

  const overdueEvents = mockCareEvents.filter(e => e.status === 'overdue');
  const upcomingEvents = mockCareEvents.filter(e => e.status === 'upcoming').slice(0, 3);

  const labsWithMarkers = parsedLabs.filter(l => l.markers && l.markers.length > 0);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-56">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <NuzzleLogo size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-sage-light px-3 py-1.5">
              <PawPrint className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{pet.name}</span>
              {isRealPet && (
                <span className="text-[10px] bg-primary/10 text-primary rounded-full px-1.5">Your pet</span>
              )}
            </div>
            <Link to="/waitlist" className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90 transition-colors">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm font-medium">Join Waitlist</span>
            </Link>
            {isRealPet && (
              <button
                onClick={() => setShowUploadLab(true)}
                className="flex items-center gap-1.5 rounded-full bg-sage-light px-3 py-1.5 text-primary hover:bg-primary/10 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Upload PDF</span>
              </button>
            )}
            <button
              onClick={() => setShowAddPet(true)}
              className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">{isRealPet ? 'Update Pet' : 'Add My Pet'}</span>
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-score-elevated transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8 max-w-6xl mx-auto">
        {/* Real pet banner */}
        {isRealPet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Viewing {pet.name}'s personalized dashboard
              </p>
              <p className="text-xs text-muted-foreground">
                {pet.breed} · {pet.age ? `${pet.age} yrs · ` : ''}{pet.weight} lbs
                {pet.existingConditions.length > 0 && ` · Conditions: ${pet.existingConditions.join(', ')}`}
                {pet.medications.length > 0 && ` · Meds: ${pet.medications.join(', ')}`}
              </p>
            </div>
          </motion.div>
        )}

        {!isRealPet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-muted/50 p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => setShowAddPet(true)}
          >
            <PawPrint className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                You're viewing a demo dashboard with sample data
              </p>
              <p className="text-xs text-muted-foreground">
                Click "Add My Pet" to see your pet's personalized health dashboard
              </p>
            </div>
          </motion.div>
        )}

        {/* Top row: Score + Breakdown + Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Health Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 relative"
          >
            {aiHealth && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-primary bg-sage-light rounded-full px-2 py-0.5">
                <Sparkles className="h-3 w-3" />
                Health Intelligence
              </div>
            )}
            {/* Show skeleton while AI is loading for real pets */}
            {isRealPet && aiLoading && !aiHealth ? (
              <div className="flex flex-col items-center gap-4 w-full animate-pulse">
                <div className="h-36 w-36 rounded-full border-[10px] border-muted" />
                <div className="h-4 w-24 bg-muted rounded-full" />
                <div className="h-3 w-48 bg-muted rounded-full" />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Analyzing {pet.name}'s health data...
                </p>
              </div>
            ) : (
              <>
                <HealthScoreRing score={score.overall} category={score.category} change={score.change} />
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  {aiHealth?.health_score?.summary || (isRealPet
                    ? `Based on ${pet.name}'s profile, labs & conditions`
                    : 'Based on bloodwork, weight, activity & age benchmarks')}
                </p>
                {/* Mock data disclaimer near health score */}
                {isRealPet && parsedLabs.length === 0 && (
                  <div className="mt-4 w-full rounded-xl border border-score-watch/30 bg-score-watch/5 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-score-watch flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Sample score — upload labs for accuracy</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">This score is estimated from {pet.name}'s profile. Upload bloodwork to get a real, personalized health score.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUploadLab(true)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium py-2 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload Bloodwork PDF
                    </button>
                  </div>
                )}
                {!isRealPet && (
                  <div className="mt-4 w-full rounded-xl border border-border bg-muted/30 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">This is a demo score with sample data. Add your pet to see their real health score.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 rounded-2xl border border-border bg-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-foreground">Score Breakdown</h3>
              {isRealPet && aiHealth && (
                <button onClick={refetchAI} className="text-muted-foreground hover:text-primary transition-colors" title="Refresh AI analysis">
                  <RefreshCw className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
            {isRealPet && aiLoading && !aiHealth ? (
              <div className="space-y-4 animate-pulse">
                {breakdownKeys.map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <div className="h-4 w-8 bg-muted rounded" />
                    </div>
                    <div className="h-2 bg-secondary rounded-full" />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" /> Calculating...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {breakdownKeys.map(({ key, label }) => {
                  const val = score.breakdown[key as keyof typeof score.breakdown];
                  const aiLabel = breakdownLabels?.[key as keyof typeof breakdownLabels];
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className="text-sm font-semibold text-foreground">{val}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: val >= 80 ? 'hsl(var(--score-optimal))' : val >= 60 ? 'hsl(var(--score-watch))' : 'hsl(var(--score-elevated))' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                      {aiLabel && (
                        <p className="text-[10px] text-muted-foreground leading-tight">{aiLabel}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 space-y-4"
          >
            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Activity</p>
                <p className="text-xl font-heading text-foreground">
                  {Math.round(mockActivityEntries.reduce((s, e) => s + (e.minutes ?? 0), 0) / mockActivityEntries.length)} min/day
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-xl font-heading text-foreground">{pet.weight} lbs</p>
                <p className="text-xs text-muted-foreground">
                  {isRealPet ? pet.breed : 'Breed avg: 55–65 lbs'}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isRealPet && petRecords.length > 0 ? 'Last Upload' : 'Last Bloodwork'}
                </p>
                <p className="text-xl font-heading text-foreground">
                  {isRealPet && petRecords.length > 0
                    ? new Date(petRecords[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : new Date(mockLabResults[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRealPet && petRecords.length > 0
                    ? petRecords[0].title
                    : mockLabResults[0].vetName}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pet Info Cards (real pet only) */}
        {isRealPet && (pet.existingConditions.length > 0 || pet.medications.length > 0 || pet.allergies.length > 0) && (
          <div className="grid sm:grid-cols-3 gap-4">
            {pet.existingConditions.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Conditions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pet.existingConditions.map((c, i) => (
                    <span key={i} className="text-xs bg-score-elevated/10 text-score-elevated rounded-full px-2 py-0.5">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {pet.medications.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Medications</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pet.medications.map((m, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{m}</span>
                  ))}
                </div>
              </div>
            )}
            {pet.allergies.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Allergies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pet.allergies.map((a, i) => (
                    <span key={i} className="text-xs bg-score-watch/10 text-score-watch rounded-full px-2 py-0.5">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== INSIGHTS & RECOMMENDATIONS (moved ABOVE records) ===== */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {isRealPet ? `${pet.name}'s Health Insights` : 'Insights & Recommendations'}
              </h3>
              {isRealPet && aiHealth && (
                <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  Generated from {pet.name}'s data
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </motion.div>
        )}

        {/* AI loading state for insights */}
        {isRealPet && aiLoading && insights.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Building {pet.name}'s health insights...</p>
          </div>
        )}

        {/* AI error state */}
        {isRealPet && aiError && !aiLoading && insights.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Couldn't generate insights right now.</p>
            <button
              onClick={refetchAI}
              className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="h-3 w-3" /> Try again
            </button>
          </div>
        )}

        {/* Upcoming Care (demo only) */}
        {!isRealPet && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-3 space-y-4">
              <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Care
              </h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {overdueEvents.map(event => (
                  <div key={event.id} className="rounded-xl border border-score-elevated/30 bg-terracotta-light/30 p-4 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-score-elevated flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-score-elevated font-medium">Overdue</p>
                    </div>
                  </div>
                ))}
                {upcomingEvents.map(event => (
                  <div key={event.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Records (real pet only) — now BELOW insights */}
        {isRealPet && petRecords.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Uploaded Records
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {petRecords.map((record) => (
                <div key={record.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-sage-light flex items-center justify-center flex-shrink-0">
                    <Droplets className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{record.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity + Weight Row */}
        {!isRealPet ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading text-lg text-foreground">This Week's Activity</h3>
              <div className="flex gap-2 items-end h-32">
                {mockActivityEntries.map((entry) => (
                  <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-foreground">{entry.minutes}m</span>
                    <motion.div
                      className="w-full rounded-lg"
                      style={{
                        backgroundColor: `hsl(var(--primary) / ${0.3 + entry.score * 0.14})`,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${entry.score * 20 + 12}px` }}
                      transition={{ duration: 0.5 }}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <WeightChart entries={mockWeightEntries} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 space-y-4">
              <h3 className="font-heading text-lg text-foreground">This Week's Activity</h3>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Connect a device to track {pet.name}'s activity</p>
                <p className="text-xs text-muted-foreground mt-1">Device integrations coming soon</p>
              </div>
            </div>
            {weightHistory.length > 1 ? (
              <WeightChart entries={weightHistory} />
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-heading text-lg text-foreground">{pet.name}'s Weight</h3>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-3xl font-heading text-foreground">
                      {weightHistory.length === 1 ? weightHistory[0].weight : pet.weight} {weightHistory.length === 1 ? (parsedLabs[0]?.weightUnit || 'lbs') : 'lbs'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Current weight · {pet.breed}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">Upload more records to see weight trends</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Biomarker Trends */}
        {!isRealPet && (
          <div className="space-y-4">
            <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Key Biomarker Trends
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <MarkerChart markerName="Creatinine" results={mockLabResults} />
              <MarkerChart markerName="ALT" results={mockLabResults} />
            </div>
          </div>
        )}

        {isRealPet && labsWithMarkers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {pet.name}'s Key Biomarkers
              </h3>
              <Link
                to="/diagnostics"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View all labs →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {(() => {
                const allNames = [...new Set(labsWithMarkers.flatMap(r => r.markers.map(m => m.name)))];
                const latestMarkers = labsWithMarkers[0]?.markers || [];
                // Score each marker: out-of-range = 100, near edge = 50, trending wrong direction = +20, in range = 0
                const scored = allNames.map(name => {
                  const latest = latestMarkers.find(m => m.name === name);
                  let priority = 0;
                  if (latest) {
                    const inRange = latest.value >= latest.referenceMin && latest.value <= latest.referenceMax;
                    if (!inRange) {
                      priority = 100;
                    } else {
                      const range = latest.referenceMax - latest.referenceMin;
                      if (range > 0) {
                        const pct = (latest.value - latest.referenceMin) / range;
                        if (pct < 0.15 || pct > 0.85) priority = 50;
                      }
                    }
                    // Bonus for markers with historical data (worth tracking longitudinally)
                    const historicalCount = labsWithMarkers.filter(r => r.markers.some(m => m.name === name)).length;
                    if (historicalCount > 1) priority += 10;
                  }
                  return { name, priority };
                });
                scored.sort((a, b) => b.priority - a.priority);
                return scored.slice(0, 6).map(({ name }) => (
                  <MarkerChart key={name} markerName={name} results={labsWithMarkers} />
                ));
              })()}
            </div>
          </div>
        )}

        <ConnectedDevices isRealPet={isRealPet} petName={pet.name} />
      </main>

      <BottomNav />
      <AddPetDialog open={showAddPet} onOpenChange={setShowAddPet} onPetAdded={refetch} />
      <UploadLabDialog
        open={showUploadLab}
        onOpenChange={setShowUploadLab}
        petId={userPet?.id ?? null}
        petName={pet.name}
        onSuccess={refetch}
      />
    </div>
  );
}

/** Fallback health score when AI is unavailable */
function generateHealthScore(pet: Pet) {
  let weightScore = 80;
  let ageScore = 90;
  let conditionsScore = 95;

  if (pet.age > 10) ageScore = 65;
  else if (pet.age > 7) ageScore = 75;
  else if (pet.age > 4) ageScore = 85;

  if (pet.existingConditions.length > 0) {
    conditionsScore = Math.max(50, 95 - pet.existingConditions.length * 15);
  }

  const overall = Math.round((80 + weightScore + ageScore + conditionsScore) / 4);
  const category: 'optimal' | 'watch' | 'elevated' = overall >= 80 ? 'optimal' : overall >= 60 ? 'watch' : 'elevated';

  return {
    overall,
    category,
    change: 0,
    breakdown: {
      bloodwork: 80,
      weight: weightScore,
      activity: 80,
      age: ageScore,
    },
  };
}
