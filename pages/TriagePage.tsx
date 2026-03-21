import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, AlertTriangle, AlertCircle, CheckCircle, Stethoscope, Sparkles, Phone, Clock, Loader2, LayoutDashboard, Home as HomeIcon, XCircle, Save } from 'lucide-react';
import { VetReferralCard } from '@/components/VetReferralCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SignupDialog } from '@/components/SignupDialog';
import { LoginDialog } from '@/components/LoginDialog';
// ── Types ──────────────────────────────────────────────

type Step = 'species' | 'symptoms' | 'followUp' | 'behavioral' | 'history' | 'petInfo' | 'loading' | 'result';

interface PetInfo {
  species: string;
  name: string;
  breed: string;
  age: string;
  sex: string;
  weight: string;
  zipCode: string;
}

interface NearbyVet {
  name: string;
  address: string;
  phone: string;
  distance: string;
  type: 'emergency' | 'urgent-care' | 'general';
}

interface FollowUpAnswer {
  question: string;
  answer: string;
}

interface State {
  petInfo: PetInfo;
  symptoms: string[];
  followUps: FollowUpAnswer[];
  currentFollowUpIndex: number;
  behavioral: string[];
  historyFlags: string[];
}

// ── Symptom Data ───────────────────────────────────────

const symptomCategories = [
  {
    label: 'Digestive',
    items: ['Vomiting', 'Diarrhea', 'Not eating / loss of appetite', 'Eating less than usual', 'Constipation', 'Blood in stool'],
  },
  {
    label: 'Energy & Behavior',
    items: ['Lethargy / low energy', 'Hiding or withdrawing', 'Restlessness / pacing', 'Whimpering or crying', 'Aggression (unusual)'],
  },
  {
    label: 'Skin & Coat',
    items: ['Scratching / itching', 'Hair loss / bald patches', 'Rash or redness', 'Lumps or bumps', 'Hot spots'],
  },
  {
    label: 'Eyes, Ears & Mouth',
    items: ['Eye discharge or redness', 'Squinting or pawing at eye', 'Ear shaking / scratching', 'Bad breath', 'Drooling excessively', 'Swollen face or jaw'],
  },
  {
    label: 'Breathing & Movement',
    items: ['Coughing', 'Sneezing', 'Labored breathing', 'Limping / favoring a leg', 'Difficulty standing or walking', 'Stiffness'],
  },
  {
    label: 'Urinary & Other',
    items: ['Drinking more water than usual', 'Urinating more frequently', 'Straining to urinate', 'Blood in urine', 'Weight loss (unexplained)', 'Weight gain (unexplained)', 'Scooting / dragging rear', 'Swollen abdomen'],
  },
];

// ── Follow-up Questions per Symptom ────────────────────

interface FollowUpQuestion {
  question: string;
  options: string[];
}

const symptomFollowUps: Record<string, FollowUpQuestion[]> = {
  'Vomiting': [
    { question: 'How often is the vomiting happening?', options: ['Once or twice', 'Several times today', 'Multiple times over several days', 'Continuously / can\'t keep anything down'] },
    { question: 'What does the vomit look like?', options: ['Undigested food', 'Yellow or bile', 'Foamy or white', 'Contains blood or dark material', 'Not sure'] },
    { question: 'Is your pet still drinking water?', options: ['Yes, drinking normally', 'Drinking a little', 'Not drinking at all', 'Drinking much more than usual'] },
  ],
  'Diarrhea': [
    { question: 'What does the stool look like?', options: ['Soft but formed', 'Watery / liquid', 'Contains mucus', 'Contains blood', 'Very dark or tarry'] },
    { question: 'How frequent is the diarrhea?', options: ['1–2 times today', '3–5 times today', 'Nearly constant / very frequent', 'On and off over several days'] },
    { question: 'Any changes in diet recently?', options: ['Yes — new food or treats', 'Possible garbage or foreign object', 'No changes', 'Not sure'] },
  ],
  'Not eating / loss of appetite': [
    { question: 'How long has it been since they last ate a full meal?', options: ['Skipped one meal', 'About 1 day', '2 days', '3 or more days'] },
    { question: 'Will they eat treats or special food?', options: ['Yes — will eat treats but not regular food', 'Only if hand-fed', 'Refuses everything including treats', 'Tries to eat but seems unable'] },
    { question: 'Is your pet still drinking water?', options: ['Yes, drinking normally', 'Drinking less than usual', 'Not drinking at all', 'Drinking much more than usual'] },
  ],
  'Eating less than usual': [
    { question: 'How much less are they eating?', options: ['About half their normal amount', 'Just picking at food', 'Only eating treats', 'Varies day to day'] },
    { question: 'How long has this been going on?', options: ['Just today', '2–3 days', 'About a week', 'Longer than a week'] },
  ],
  'Lethargy / low energy': [
    { question: 'How would you describe the change?', options: ['Sleeping more but still responsive', 'Less interested in walks / play', 'Very difficult to get up or move', 'Barely responsive or won\'t move'] },
    { question: 'How long has the lethargy lasted?', options: ['Just today', '1–2 days', '3–7 days', 'More than a week'] },
    { question: 'Any other symptoms alongside lethargy?', options: ['Not eating', 'Vomiting or diarrhea', 'Labored breathing', 'No other noticeable symptoms'] },
  ],
  'Scratching / itching': [
    { question: 'Where is the itching focused?', options: ['Ears', 'Paws / between toes', 'Belly or underside', 'All over / generalized', 'Base of tail / rear'] },
    { question: 'Do you see any skin changes?', options: ['Redness or irritation', 'Hair loss in the area', 'Bumps, scabs, or sores', 'Skin looks normal', 'Flaky / dry skin'] },
    { question: 'Is your pet on flea/tick prevention?', options: ['Yes, up to date', 'Overdue or inconsistent', 'No', 'Not sure'] },
  ],
  'Limping / favoring a leg': [
    { question: 'Which leg seems affected?', options: ['Front left', 'Front right', 'Back left', 'Back right', 'Hard to tell / alternating'] },
    { question: 'Did something happen?', options: ['Jumped or fell', 'Ran or played hard', 'I noticed it suddenly with no clear cause', 'It\'s been gradual'] },
    { question: 'Can your pet put weight on the leg?', options: ['Yes but favoring it', 'Barely touching it down', 'Not using the leg at all', 'Only sometimes'] },
  ],
  'Coughing': [
    { question: 'What does the cough sound like?', options: ['Dry, hacking cough', 'Wet / productive cough', 'Honking sound', 'Gagging or retching at the end', 'Wheezing'] },
    { question: 'When does the coughing happen?', options: ['After exercise or excitement', 'When pulling on leash', 'At night / when lying down', 'Throughout the day', 'After eating or drinking'] },
    { question: 'Has your pet been around other animals recently?', options: ['Yes — dog park, boarding, daycare', 'Yes — new pet at home', 'No recent contact', 'Not sure'] },
  ],
  'Drinking more water than usual': [
    { question: 'How much more are they drinking?', options: ['Slightly more', 'Noticeably more — refilling bowl frequently', 'Excessively — drinking constantly', 'Hard to tell exactly'] },
    { question: 'How long has this been happening?', options: ['Just noticed today', '2–3 days', 'About a week', 'Weeks / longer'] },
    { question: 'Are they also urinating more?', options: ['Yes, much more frequently', 'Yes, larger amounts', 'Having accidents in the house', 'Not that I\'ve noticed'] },
  ],
  'Labored breathing': [
    { question: 'How would you describe the breathing?', options: ['Panting more than usual', 'Fast, shallow breaths', 'Noisy / raspy breathing', 'Belly heaving with each breath', 'Open-mouth breathing (cats)'] },
    { question: 'When did this start?', options: ['Just now / very recently', 'A few hours ago', 'Today', 'It\'s been going on for days'] },
    { question: 'Are their gums a normal color?', options: ['Yes — pink', 'Pale or white', 'Blue or purple', 'Bright red', 'Not sure / can\'t check'] },
  ],
  'Eye discharge or redness': [
    { question: 'Which eye is affected?', options: ['Left eye', 'Right eye', 'Both eyes'] },
    { question: 'What does the discharge look like?', options: ['Clear and watery', 'Thick, yellow, or green', 'Crusty / dried around eye', 'Bloody'] },
    { question: 'Is the eye itself affected?', options: ['Eye looks normal besides discharge', 'Eye is red / bloodshot', 'Eye looks cloudy', 'Eye appears swollen or bulging', 'Squinting or keeping it closed'] },
  ],
  'Blood in stool': [
    { question: 'What does the blood look like?', options: ['Bright red streaks', 'Dark red or maroon mixed in', 'Very dark / black tarry stool', 'Just a small amount on the outside'] },
    { question: 'How many times has this happened?', options: ['Just once', '2–3 times', 'Every bowel movement today', 'On and off for several days'] },
  ],
  'Straining to urinate': [
    { question: 'Is any urine coming out?', options: ['Yes but very small amounts', 'Just drops', 'Nothing at all', 'Normal amount but seems painful'] },
    { question: 'How long has this been happening?', options: ['Just started today', '1–2 days', 'Several days', 'On and off'] },
    { question: 'Any blood visible in the urine?', options: ['Yes', 'No', 'Not sure'] },
  ],
  'Swollen abdomen': [
    { question: 'How quickly did the swelling appear?', options: ['Very suddenly (hours)', 'Over a day or two', 'Gradually over a week+', 'Not sure'] },
    { question: 'Is your pet in distress?', options: ['Pacing, panting, restless', 'Trying to vomit but nothing comes up', 'Seems uncomfortable but not frantic', 'Seems normal otherwise'] },
  ],
};

// Default follow-ups for symptoms without specific ones
const defaultFollowUps: FollowUpQuestion[] = [
  { question: 'How long has this been going on?', options: ['Just started today', '1–2 days', '3–7 days', 'More than a week', 'On and off for a while'] },
  { question: 'How would you rate the severity?', options: ['Mild — pet is mostly acting normal', 'Moderate — noticeable change in behavior', 'Severe — very concerning / pet is in distress'] },
];

// ── Behavioral assessment ──────────────────────────────

const behavioralChecks = [
  'Still playful or interested in toys',
  'Responding to name / commands normally',
  'Eating and drinking normally',
  'Gums are pink and moist',
  'No signs of pain when touched',
  'Breathing at normal rate',
  'Moving around without difficulty',
  'Normal body temperature (not hot ears/nose)',
];

// ── Result styling ─────────────────────────────────────

const resultConfig = {
  emergency: { icon: AlertTriangle, color: 'text-score-elevated', bg: 'bg-score-elevated/10 border-score-elevated/30', urgencyBg: 'bg-score-elevated text-primary-foreground' },
  'vet-soon': { icon: AlertCircle, color: 'text-score-watch', bg: 'bg-score-watch/10 border-score-watch/30', urgencyBg: 'bg-score-watch text-foreground' },
  'vet-scheduled': { icon: Stethoscope, color: 'text-primary', bg: 'bg-sage-light border-primary/20', urgencyBg: 'bg-primary text-primary-foreground' },
  monitor: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-secondary border-border', urgencyBg: 'bg-secondary text-foreground' },
  home: { icon: CheckCircle, color: 'text-score-optimal', bg: 'bg-sage-light border-primary/20', urgencyBg: 'bg-score-optimal text-primary-foreground' },
};

// ── Component ──────────────────────────────────────────

export default function TriagePage() {
  const [step, setStep] = useState<Step>('species');
  const [result, setResult] = useState<{ level: string; urgency: string; title: string; description: string; possibleCauses: string[]; actions: string[]; homeCare?: { summary: string; steps: { title: string; detail: string; duration: string }[]; monitoring: string[]; doNotDo: string[] }; warnings: string[]; reasoning?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nearbyVets, setNearbyVets] = useState<NearbyVet[]>([]);
  const [vetsLoading, setVetsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({
    petInfo: { species: '', name: '', breed: '', age: '', sex: '', weight: '', zipCode: '' },
    symptoms: [],
    followUps: [],
    currentFollowUpIndex: 0,
    behavioral: [],
    historyFlags: [],
  });

  // Compute all follow-up questions for selected symptoms
  const allFollowUps = state.symptoms.flatMap(s => {
    const qs = symptomFollowUps[s] || defaultFollowUps;
    return qs.map(q => ({ ...q, symptom: s }));
  });

  const totalFollowUps = allFollowUps.length;
  const currentFU = allFollowUps[state.currentFollowUpIndex];

  const steps: Step[] = ['species', 'symptoms', 'followUp', 'behavioral', 'history', 'petInfo', 'loading', 'result'];
  const currentIndex = steps.indexOf(step);

  let progress = 0;
  if (step === 'species') progress = 0;
  else if (step === 'symptoms') progress = 15;
  else if (step === 'followUp') progress = 15 + (totalFollowUps > 0 ? (state.currentFollowUpIndex / totalFollowUps) * 40 : 40);
  else if (step === 'behavioral') progress = 60;
  else if (step === 'history') progress = 75;
  else if (step === 'petInfo') progress = 90;
  else progress = 100;

  const update = (fn: (s: State) => State) => setState(fn);

  const toggleSymptom = (s: string) => {
    update(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s],
    }));
  };

  const toggleBehavioral = (b: string) => {
    update(prev => ({
      ...prev,
      behavioral: prev.behavioral.includes(b) ? prev.behavioral.filter(x => x !== b) : [...prev.behavioral, b],
    }));
  };

  const toggleHistory = (h: string) => {
    update(prev => ({
      ...prev,
      historyFlags: prev.historyFlags.includes(h) ? prev.historyFlags.filter(x => x !== h) : [...prev.historyFlags, h],
    }));
  };

  const answerFollowUp = (answer: string) => {
    update(prev => {
      const newFollowUps = [...prev.followUps, { question: currentFU.question, answer }];
      const nextIndex = prev.currentFollowUpIndex + 1;
      return { ...prev, followUps: newFollowUps, currentFollowUpIndex: nextIndex };
    });
    // Auto-advance if last follow-up
    if (state.currentFollowUpIndex + 1 >= totalFollowUps) {
      setStep('behavioral');
    }
  };

  const goBack = () => {
    if (step === 'followUp' && state.currentFollowUpIndex > 0) {
      update(prev => ({
        ...prev,
        followUps: prev.followUps.slice(0, -1),
        currentFollowUpIndex: prev.currentFollowUpIndex - 1,
      }));
    } else {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        if (step === 'followUp') {
          update(prev => ({ ...prev, followUps: [], currentFollowUpIndex: 0 }));
        }
        setStep(prevStep);
      }
    }
  };

  const fetchNearbyVets = async (zipCode: string, urgencyLevel: string) => {
    if (!zipCode || zipCode.length !== 5) return;
    setVetsLoading(true);
    try {
      // Step 1: Geocode zip via Nominatim (public API, no key needed)
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=US&format=json&limit=1`,
        { headers: { 'User-Agent': 'NuzzleHealth/1.0 (nuzzlehealth.pet)' } },
      );
      if (!geoRes.ok) return;
      const geoData = await geoRes.json();
      if (!geoData.length) return;

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      const radiusMeters = 24000; // ~15 miles

      // Step 2: Query Overpass for vet clinics (public API, no key needed)
      const query = `[out:json][timeout:15];(node["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});way["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});node["healthcare"="veterinary"](around:${radiusMeters},${lat},${lon}););out center body;`;
      const ovRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!ovRes.ok) return;
      const ovData = await ovRes.json();

      const haversine = (la1: number, lo1: number, la2: number, lo2: number) => {
        const R = 3958.8;
        const dLat = (la2 - la1) * Math.PI / 180;
        const dLon = (lo2 - lo1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const isEmergency = urgencyLevel === 'emergency' || urgencyLevel === 'vet-soon';
      const vets: NearbyVet[] = (ovData.elements || [])
        .map((el: any) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          if (!elLat || !elLon) return null;
          const tags = el.tags || {};
          const name = tags.name || 'Veterinary Clinic';
          const dist = haversine(lat, lon, elLat, elLon);
          const nameLC = name.toLowerCase();
          const type: NearbyVet['type'] = (nameLC.includes('emergency') || nameLC.includes('24') || tags.opening_hours === '24/7')
            ? 'emergency' : nameLC.includes('urgent') ? 'urgent-care' : 'general';
          const address = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state']].filter(Boolean).join(' ');
          return { name, address, phone: tags.phone || tags['contact:phone'] || '', distance: `${dist.toFixed(1)} mi`, distNum: dist, type };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => {
          if (isEmergency) {
            if (a.type === 'emergency' && b.type !== 'emergency') return -1;
            if (a.type !== 'emergency' && b.type === 'emergency') return 1;
          }
          return a.distNum - b.distNum;
        })
        .slice(0, 5)
        .map(({ distNum, ...rest }: any) => rest);

      setNearbyVets(vets);
    } catch (err) {
      console.error('Failed to fetch nearby vets:', err);
    } finally {
      setVetsLoading(false);
    }
  };

  const runAIAssessment = async () => {
    setStep('loading');
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petInfo: state.petInfo,
          symptoms: state.symptoms,
          followUps: state.followUps,
          behavioral: state.behavioral,
          historyFlags: state.historyFlags,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        toast({ title: 'Assessment Error', description: data?.error || 'Could not complete assessment', variant: 'destructive' });
        setStep('history');
        return;
      }

      setResult(data);
      setStep('result');

      // Fetch nearby vets if zip code provided
      if (state.petInfo.zipCode) {
        fetchNearbyVets(state.petInfo.zipCode, data.level);
      }
    } catch (err) {
      console.error('AI assessment error:', err);
      toast({ title: 'Something went wrong', description: 'Could not complete assessment. Please try again.', variant: 'destructive' });
      setStep('history');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const config = result ? resultConfig[result.level as keyof typeof resultConfig] : null;

  const OptionButton = ({ selected, onClick, children, multi = false }: { selected: boolean; onClick: () => void; children: React.ReactNode; multi?: boolean }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm font-medium ${
        selected
          ? 'border-primary bg-sage-light text-foreground shadow-sm'
          : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-sage-light/30'
      }`}
    >
      <div className="flex items-center gap-3">
        {multi && (
          <div className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
            selected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
          }`}>
            {selected && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
          </div>
        )}
        <span>{children}</span>
      </div>
    </button>
  );

  const NavButtons = ({ canContinue, onNext, nextLabel = 'Continue' }: { canContinue: boolean; onNext: () => void; nextLabel?: string }) => (
    <div className="flex gap-3 pt-2">
      <Button variant="outline" onClick={goBack} className="h-12 px-6">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button onClick={onNext} disabled={!canContinue} className="flex-1 h-12 gap-2">
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <NuzzleLogo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" /> My Pet's Health
              </Button>
            </Link>
            <Button size="sm" className="gap-1.5" onClick={() => setShowSignup(true)}>
              <Sparkles className="h-3.5 w-3.5" /> Free Health Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10 max-w-xl mx-auto">
        {step !== 'result' && step !== 'loading' && (
          <div className="mb-8">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={`${step}-${state.currentFollowUpIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* Step 1: Species */}
            {step === 'species' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading text-foreground mb-2">Let's figure out what's going on.</h2>
                  <p className="text-muted-foreground">First, what kind of pet do you have?</p>
                </div>
                <div className="rounded-xl bg-score-watch/10 border border-score-watch/20 p-4 flex items-start gap-3">
                  <Stethoscope className="h-5 w-5 text-score-watch flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">This is a triage tool, not a diagnosis.</strong> It helps you understand urgency and gives at-home guidance — but it should <strong>never replace advice from your veterinarian</strong>. When in doubt, always see your vet.
                  </p>
                </div>
                <div className="space-y-3">
                  <OptionButton selected={state.petInfo.species === 'dog'} onClick={() => update(s => ({ ...s, petInfo: { ...s.petInfo, species: 'dog' } }))}>🐕 Dog</OptionButton>
                  <OptionButton selected={state.petInfo.species === 'cat'} onClick={() => update(s => ({ ...s, petInfo: { ...s.petInfo, species: 'cat' } }))}>🐱 Cat</OptionButton>
                </div>
                <Button onClick={() => setStep('symptoms')} disabled={!state.petInfo.species} className="w-full h-12 gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Pet Info (optional but helpful) */}
            {step === 'petInfo' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading text-foreground mb-2">Tell us about your {state.petInfo.species}</h2>
                  <p className="text-muted-foreground">This helps us give more accurate guidance. All fields are optional.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Pet's name</label>
                    <Input
                      value={state.petInfo.name}
                      onChange={e => update(s => ({ ...s, petInfo: { ...s.petInfo, name: e.target.value } }))}
                      placeholder={state.petInfo.species === 'dog' ? 'e.g. Bella' : 'e.g. Luna'}
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Breed</label>
                      <Input
                        value={state.petInfo.breed}
                        onChange={e => update(s => ({ ...s, petInfo: { ...s.petInfo, breed: e.target.value } }))}
                        placeholder="e.g. Golden Retriever"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Weight (lbs)</label>
                      <Input
                        value={state.petInfo.weight}
                        onChange={e => update(s => ({ ...s, petInfo: { ...s.petInfo, weight: e.target.value } }))}
                        placeholder="e.g. 65"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Age</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Under 1 year', '1–3 years', '4–7 years', '8–10 years', '11+ years'].map(age => (
                        <button
                          key={age}
                          onClick={() => update(s => ({ ...s, petInfo: { ...s.petInfo, age } }))}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                            state.petInfo.age === age ? 'border-primary bg-sage-light text-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Sex</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Male', 'Female'].map(sex => (
                        <button
                          key={sex}
                          onClick={() => update(s => ({ ...s, petInfo: { ...s.petInfo, sex } }))}
                          className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                            state.petInfo.sex === sex ? 'border-primary bg-sage-light text-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {sex}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Zip code <span className="text-muted-foreground/60">(for nearby vet results)</span></label>
                    <Input
                      value={state.petInfo.zipCode}
                      onChange={e => update(s => ({ ...s, petInfo: { ...s.petInfo, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) } }))}
                      placeholder="e.g. 90210"
                      className="h-11"
                      inputMode="numeric"
                      maxLength={5}
                    />
                  </div>
                </div>
                <NavButtons canContinue onNext={runAIAssessment} nextLabel="See Assessment" />
                <p className="text-xs text-muted-foreground text-center">You can skip any field — we'll still do our best.</p>
              </div>
            )}

            {/* Step 3: Symptoms (multi-select) */}
            {step === 'symptoms' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading text-foreground mb-2">What symptoms are you noticing?</h2>
                  <p className="text-muted-foreground">Select all that apply. The more you share, the better our guidance.</p>
                </div>
                {symptomCategories.map(cat => (
                  <div key={cat.label} className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{cat.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {cat.items.map(s => (
                        <OptionButton key={s} selected={state.symptoms.includes(s)} onClick={() => toggleSymptom(s)} multi>
                          {s}
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                ))}
                <NavButtons
                  canContinue={state.symptoms.length > 0}
                  onNext={() => {
                    update(s => ({ ...s, followUps: [], currentFollowUpIndex: 0 }));
                    if (allFollowUps.length > 0) setStep('followUp');
                    else setStep('behavioral');
                  }}
                />
              </div>
            )}

            {/* Step 4: Follow-up questions */}
            {step === 'followUp' && currentFU && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-sage-light px-3 py-1 text-xs font-medium text-primary mb-3">
                    Regarding: {(currentFU as any).symptom}
                  </div>
                  <h2 className="text-2xl font-heading text-foreground mb-2">{currentFU.question}</h2>
                  <p className="text-xs text-muted-foreground">
                    Question {state.currentFollowUpIndex + 1} of {totalFollowUps}
                  </p>
                </div>
                <div className="space-y-2.5">
                  {currentFU.options.map(opt => (
                    <OptionButton key={opt} selected={false} onClick={() => answerFollowUp(opt)}>
                      {opt}
                    </OptionButton>
                  ))}
                </div>
                <Button variant="outline" onClick={goBack} className="h-12 px-6">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              </div>
            )}

            {/* Step 5: Behavioral assessment */}
            {step === 'behavioral' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading text-foreground mb-2">How is {state.petInfo.name || `your ${state.petInfo.species}`} acting otherwise?</h2>
                  <p className="text-muted-foreground">Check everything that's still <strong>normal</strong>. This helps us understand overall wellbeing.</p>
                </div>
                <div className="space-y-2.5">
                  {behavioralChecks.map(b => (
                    <OptionButton key={b} selected={state.behavioral.includes(b)} onClick={() => toggleBehavioral(b)} multi>
                      {b}
                    </OptionButton>
                  ))}
                </div>
                <NavButtons canContinue onNext={() => setStep('history')} />
              </div>
            )}

            {/* Step 6: History */}
            {step === 'history' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading text-foreground mb-2">Any relevant history?</h2>
                  <p className="text-muted-foreground">Check any that apply. This is optional but helps us give better guidance.</p>
                </div>
                <div className="space-y-2.5">
                  {[
                    'Has a chronic condition',
                    'Currently on medication',
                    'Recently had surgery',
                    'Spayed/neutered',
                    'Up to date on vaccines',
                    'Recently boarded or at daycare',
                    'Recently changed food or diet',
                    'Possible exposure to toxin or foreign object',
                  ].map(h => (
                    <OptionButton key={h} selected={state.historyFlags.includes(h)} onClick={() => toggleHistory(h)} multi>
                      {h}
                    </OptionButton>
                  ))}
                </div>
                <NavButtons canContinue onNext={() => setStep('petInfo')} />
              </div>
            )}

            {/* Loading */}
            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-sage-light flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-heading text-foreground">Analyzing symptoms…</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Our AI veterinary assistant is reviewing {state.petInfo.name || 'your pet'}'s symptoms, follow-up details, and health history to generate a personalized assessment.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Powered by Nuzzle AI</span>
                </div>
              </div>
            )}

            {/* Result */}
            {step === 'result' && result && config && (
              <div className="space-y-6">
                {/* Urgency banner */}
                <div className={`rounded-xl px-5 py-3 text-center font-semibold text-sm ${config.urgencyBg}`}>
                  {result.urgency}
                </div>

                {/* Main result */}
                <div className={`rounded-2xl border-2 ${config.bg} p-8 space-y-4`}>
                  <config.icon className={`h-10 w-10 ${config.color}`} />
                  <h2 className="text-2xl font-heading text-foreground">{result.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{result.description}</p>
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="space-y-2">
                    {result.warnings.map((w, i) => (
                      <div key={i} className="rounded-xl bg-score-elevated/10 border border-score-elevated/30 p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-score-elevated flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground leading-relaxed">{w}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Possible causes */}
                {result.possibleCauses.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <h3 className="font-heading text-lg text-foreground">Possible causes to discuss with your vet</h3>
                    <ul className="space-y-2">
                      {result.possibleCauses.map((cause, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                          <span className="flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground italic">These are possibilities, not a diagnosis. Only a vet can examine and diagnose your pet.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <h3 className="font-heading text-lg text-foreground">Recommended next steps</h3>
                  <ul className="space-y-3">
                    {result.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-sage-light flex items-center justify-center text-xs font-semibold text-primary">{i + 1}</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* At-Home Care Plan */}
                {result.homeCare && (
                  <div className="rounded-2xl border-2 border-primary/20 bg-sage-light/30 p-6 space-y-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <HomeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg text-foreground">At-Home Care Plan</h3>
                        <p className="text-xs text-muted-foreground">{result.homeCare.summary}</p>
                      </div>
                    </div>

                    {/* Care steps */}
                    <div className="space-y-3">
                      {result.homeCare.steps.map((step, i) => (
                        <div key={i} className="rounded-xl bg-card border border-border p-4 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">{step.title}</p>
                            <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5">{step.duration}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                        </div>
                      ))}
                    </div>

                    {/* Watch for these signs */}
                    {result.homeCare.monitoring.length > 0 && (
                      <div className="rounded-xl bg-score-watch/10 border border-score-watch/30 p-4 space-y-2">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-score-watch" />
                          Escalate to a vet if you notice
                        </p>
                        <ul className="space-y-1">
                          {result.homeCare.monitoring.map((sign, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-score-watch" />
                              {sign}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Do NOT do */}
                    {result.homeCare.doNotDo.length > 0 && (
                      <div className="rounded-xl bg-score-elevated/5 border border-score-elevated/20 p-4 space-y-2">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5 text-score-elevated" />
                          Do NOT do
                        </p>
                        <ul className="space-y-1">
                          {result.homeCare.doNotDo.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="flex-shrink-0 mt-1 h-1 w-1 rounded-full bg-score-elevated" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Vet Referral */}
                {(result.level === 'emergency' || result.level === 'vet-soon' || result.level === 'vet-scheduled') && (
                  <VetReferralCard
                    urgencyLevel={result.level}
                    petName={state.petInfo.name || undefined}
                    nearbyVets={nearbyVets}
                    vetsLoading={vetsLoading}
                    zipCode={state.petInfo.zipCode || undefined}
                  />
                )}

                {/* CTA — conversion point */}
                {!user ? (
                  <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-score-optimal/10 px-3 py-1.5 text-xs font-medium text-score-optimal">
                      <Sparkles className="h-3.5 w-3.5" />
                      100% free · No credit card needed
                    </div>
                    <h3 className="font-heading text-xl text-foreground">
                      Get {state.petInfo.name || 'your pet'}'s free health dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Unlock a personalized health score, AI-powered insights, biomarker tracking, and early warning alerts — all free for {state.petInfo.name || 'your pet'}.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button size="lg" className="gap-2 w-full sm:w-auto h-12 px-8 text-base" onClick={() => setShowSignup(true)}>
                        Unlock Free Health Dashboard <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Already have an account?{' '}
                      <button onClick={() => setShowLogin(true)} className="text-primary font-medium hover:underline">
                        Sign in
                      </button>
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        setStep('species');
                        setNearbyVets([]);
                        setState({
                          petInfo: { species: '', name: '', breed: '', age: '', sex: '', weight: '', zipCode: '' },
                          symptoms: [],
                          followUps: [],
                          currentFollowUpIndex: 0,
                          behavioral: [],
                          historyFlags: [],
                        });
                      }}
                    >
                      Check Another Symptom
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 text-center space-y-5">
                    <h3 className="font-heading text-xl text-foreground">
                      Keep {state.petInfo.name || 'your pet'}'s health on track
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      View your dashboard for ongoing health tracking, personalized insights, and early warning alerts.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button size="lg" className="gap-2 w-full sm:w-auto h-12 px-8 text-base" onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        setStep('species');
                        setNearbyVets([]);
                        setState({
                          petInfo: { species: '', name: '', breed: '', age: '', sex: '', weight: '', zipCode: '' },
                          symptoms: [],
                          followUps: [],
                          currentFollowUpIndex: 0,
                          behavioral: [],
                          historyFlags: [],
                        });
                      }}
                    >
                      Check Another Symptom
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  This tool provides general guidance only and is not a substitute for professional veterinary advice.
                  When in doubt, always consult your veterinarian.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <SignupDialog
        open={showSignup}
        onOpenChange={setShowSignup}
        onSuccess={() => { setShowSignup(false); navigate('/dashboard'); }}
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
        petData={state.petInfo.name ? {
          name: state.petInfo.name,
          species: state.petInfo.species,
          breed: state.petInfo.breed,
          age: state.petInfo.age,
          sex: state.petInfo.sex,
          weight: state.petInfo.weight,
        } : null}
        contextMessage={result ? `Unlock ${state.petInfo.name || 'your pet'}'s free health dashboard with personalized insights and tracking` : undefined}
      />
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onSuccess={() => { setShowLogin(false); navigate('/dashboard'); }}
        onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
      />
    </div>
  );
}
