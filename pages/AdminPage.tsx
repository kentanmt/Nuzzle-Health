import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, PawPrint, ClipboardList, TrendingUp, LogOut, RefreshCw, Lock } from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const COLORS = ['#4a7c59', '#82b59a', '#c9dfd0', '#e8f4ec'];

interface WaitlistRow {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string | null;
  email: string;
  location: string | null;
  pet_name: string | null;
  species: string | null;
  breed: string | null;
  vet_name: string | null;
  utm_source: string | null;
}

interface Stats {
  totalWaitlist: number;
  totalProfiles: number;
  totalPets: number;
  recentSignups: WaitlistRow[];
  speciesBreakdown: { name: string; value: number }[];
  sourceBreakdown: { name: string; value: number }[];
  signupsByDay: { date: string; count: number }[];
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-3xl font-heading text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { user, loading, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState('');

  const handleSeedKnowledge = async () => {
    setSeeding(true);
    setSeedResult('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-vet-knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      const data = await res.json();
      if (data.success) setSeedResult(`✓ ${data.inserted} chunks seeded`);
      else setSeedResult(`Error: ${data.error}`);
    } catch (e: any) {
      setSeedResult(`Error: ${e.message}`);
    }
    setSeeding(false);
  };

  const isAdmin = !loading && user?.email === ADMIN_EMAIL;
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeedKnowledge = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('seed-vet-knowledge');
      if (error) throw error;
      setSeedResult(`✓ Seeded ${data.inserted} chunks into the knowledge base.`);
    } catch (e: any) {
      setSeedResult(`✗ Seed failed: ${e.message}`);
    }
    setSeeding(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) {
      setLoginError('Invalid email or password.');
    }
    setLoggingIn(false);
  };

  async function fetchStats() {
    setFetching(true);
    const [waitlistRes, profilesRes, petsRes] = await Promise.all([
      supabase.from('waitlist_signups' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('pets').select('id', { count: 'exact', head: true }),
    ]);

    const waitlist: WaitlistRow[] = (waitlistRes.data as WaitlistRow[]) ?? [];

    // Species breakdown
    const speciesMap: Record<string, number> = {};
    waitlist.forEach(w => {
      const s = w.species ?? 'Unknown';
      speciesMap[s] = (speciesMap[s] ?? 0) + 1;
    });
    const speciesBreakdown = Object.entries(speciesMap).map(([name, value]) => ({ name, value }));

    // UTM source breakdown
    const sourceMap: Record<string, number> = {};
    waitlist.forEach(w => {
      const s = w.utm_source ?? 'Direct';
      sourceMap[s] = (sourceMap[s] ?? 0) + 1;
    });
    const sourceBreakdown = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    // Signups by day (last 14 days)
    const dayMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    waitlist.forEach(w => {
      const day = w.created_at?.slice(0, 10);
      if (day && dayMap[day] !== undefined) dayMap[day]++;
    });
    const signupsByDay = Object.entries(dayMap).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      count,
    }));

    setStats({
      totalWaitlist: waitlist.length,
      totalProfiles: profilesRes.count ?? 0,
      totalPets: petsRes.count ?? 0,
      recentSignups: waitlist.slice(0, 20),
      speciesBreakdown,
      sourceBreakdown,
      signupsByDay,
    });
    setFetching(false);
  }

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  if (loading) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm space-y-6 p-8 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-sage-light flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <NuzzleLogo size="sm" />
            <p className="text-sm text-muted-foreground">Admin access only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>
            {loginError && <p className="text-xs text-destructive">{loginError}</p>}
            <Button type="submit" className="w-full h-11" disabled={loggingIn}>
              {loggingIn ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <NuzzleLogo size="sm" />
            <span className="text-sm font-semibold text-muted-foreground border-l border-border pl-3">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchStats} disabled={fetching} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${fetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSeedKnowledge} disabled={seeding} className="gap-1.5 text-xs">
              {seeding ? 'Seeding…' : 'Seed AI Knowledge'}
            </Button>
            {seedResult && <span className="text-xs text-muted-foreground">{seedResult}</span>}
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }} className="gap-1.5 text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10 max-w-6xl mx-auto space-y-10">
        {fetching && !stats ? (
          <div className="text-center py-20 text-muted-foreground">Loading data…</div>
        ) : stats ? (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={ClipboardList} label="Waitlist Signups" value={stats.totalWaitlist} sub="All time" />
              <StatCard icon={Users} label="Registered Users" value={stats.totalProfiles} sub="Supabase profiles" />
              <StatCard icon={PawPrint} label="Pets Added" value={stats.totalPets} sub="Across all users" />
              <StatCard
                icon={TrendingUp}
                label="Last 7 Days"
                value={stats.signupsByDay.slice(-7).reduce((s, d) => s + d.count, 0)}
                sub="New waitlist signups"
              />
            </div>

            {/* Charts row */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Signups over time */}
              <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Waitlist Signups — Last 14 Days</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.signupsByDay} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Species breakdown */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Species Breakdown</h3>
                {stats.speciesBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={stats.speciesBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                        {stats.speciesBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-4">No data yet</p>
                )}
              </div>
            </div>

            {/* Traffic sources */}
            {stats.sourceBreakdown.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Traffic Sources (UTM)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={stats.sourceBreakdown} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent signups table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Recent Waitlist Signups</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      {['Date', 'Name', 'Email', 'Pet', 'Species', 'Location', 'Vet', 'Source'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentSignups.map(row => (
                      <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{new Date(row.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5 font-medium whitespace-nowrap">{row.first_name} {row.last_name ?? ''}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.email}</td>
                        <td className="px-4 py-2.5">{row.pet_name ?? '—'}</td>
                        <td className="px-4 py-2.5 capitalize">{row.species ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.location ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.vet_name ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.utm_source ?? 'Direct'}</td>
                      </tr>
                    ))}
                    {stats.recentSignups.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No signups yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
