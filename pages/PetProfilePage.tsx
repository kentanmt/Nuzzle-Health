import { BottomNav } from '@/components/BottomNav';
import { usePetData } from '@/hooks/usePetData';
import { mockPet } from '@/lib/mock-data';
import { PawPrint, Heart, Pill, AlertTriangle } from 'lucide-react';

export default function PetProfilePage() {
  const { pet: realPet, isRealPet } = usePetData();
  const pet = realPet || mockPet;

  const details = [
    { label: 'Species', value: pet.species === 'dog' ? '🐕 Dog' : '🐱 Cat' },
    { label: 'Breed', value: pet.breed || '—' },
    { label: 'Age', value: pet.age ? `${pet.age} years` : '—' },
    { label: 'Weight', value: pet.weight ? `${pet.weight} lbs` : '—' },
    { label: 'Sex', value: pet.sex === 'male' ? 'Male' : 'Female' },
    { label: 'Spayed/Neutered', value: pet.spayedNeutered ? 'Yes' : 'No' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-56">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container h-14 flex items-center">
          <h1 className="text-lg font-heading text-foreground">Pet Profile</h1>
          {!isRealPet && (
            <span className="ml-3 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">Demo</span>
          )}
        </div>
      </header>

      <main className="container py-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-24 w-24 rounded-full bg-sage-light flex items-center justify-center">
            <PawPrint className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-heading text-foreground">{pet.name}</h2>
            <p className="text-sm text-muted-foreground">
              {pet.breed || 'Unknown breed'}{pet.age ? ` · ${pet.age} yrs` : ''}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {details.map(d => (
            <div key={d.label} className="flex items-center justify-between p-3.5">
              <span className="text-sm text-muted-foreground">{d.label}</span>
              <span className="text-sm font-medium text-foreground">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Existing Conditions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {pet.existingConditions.length > 0 ? pet.existingConditions.join(', ') : 'None reported'}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Pill className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Medications</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {pet.medications.length > 0 ? pet.medications.join(', ') : 'None'}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Allergies</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {pet.allergies.length > 0 ? pet.allergies.join(', ') : 'None known'}
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
