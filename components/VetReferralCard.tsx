import { MapPin, Phone, Clock, ExternalLink, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VetClinic {
  name: string;
  type: 'emergency' | 'urgent-care' | 'general';
  distance: string;
  rating: number;
  hours: string;
  phone: string;
  address: string;
  isPartner: boolean;
}

interface NearbyVet {
  name: string;
  address: string;
  phone: string;
  distance: string;
  type: 'emergency' | 'urgent-care' | 'general';
}

const typeLabels = {
  emergency: '24/7 Emergency',
  'urgent-care': 'Urgent Care',
  general: 'General Practice',
};

const typeBg = {
  emergency: 'bg-score-elevated/10 text-score-elevated',
  'urgent-care': 'bg-score-watch/10 text-score-watch',
  general: 'bg-sage-light text-primary',
};

interface VetReferralCardProps {
  urgencyLevel: string;
  petName?: string;
  nearbyVets?: NearbyVet[];
  vetsLoading?: boolean;
  zipCode?: string;
}

function RealVetCard({ vet, urgencyLevel }: { vet: NearbyVet; urgencyLevel: string }) {
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(vet.name + ' ' + vet.address)}`;
  const callUrl = vet.phone ? `tel:${vet.phone.replace(/\D/g, '')}` : undefined;

  return (
    <div className="rounded-xl border border-border bg-background p-4 space-y-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{vet.name}</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBg[vet.type] || typeBg.general}`}>
              {typeLabels[vet.type] || 'Veterinary'}
            </span>
            {vet.distance && <span>{vet.distance}</span>}
          </div>
          {vet.address && (
            <p className="text-[11px] text-muted-foreground truncate">{vet.address}</p>
          )}
        </div>
      </div>

      {vet.phone && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Phone className="h-3 w-3" /> {vet.phone}
        </div>
      )}

      <div className="flex gap-2">
        {callUrl && (
          <Button size="sm" className="h-8 text-xs gap-1.5 flex-1" asChild>
            <a href={callUrl}>
              <Phone className="h-3 w-3" />
              {urgencyLevel === 'emergency' ? 'Call Now' : 'Call'}
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1" asChild>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" /> Directions
          </a>
        </Button>
      </div>
    </div>
  );
}

export function VetReferralCard({ urgencyLevel, petName, nearbyVets, vetsLoading, zipCode }: VetReferralCardProps) {
  const hasRealVets = nearbyVets && nearbyVets.length > 0;
  const noZip = !zipCode;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-foreground">
          {urgencyLevel === 'emergency' ? 'Nearest Emergency Vets' : 'Recommended Vets Near You'}
        </h3>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {hasRealVets ? `Based on zip code ${zipCode}` : 'Based on your area'}
        </span>
      </div>

      <div className="space-y-3">
        {vetsLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Finding vets near you…
          </div>
        )}

        {!vetsLoading && noZip && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Enter your zip code in the pet info step to find emergency vets near you.
          </p>
        )}

        {!vetsLoading && zipCode && !hasRealVets && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No results found for zip code <span className="font-medium text-foreground">{zipCode}</span>. Try a nearby zip or search Google Maps for "emergency vet near me".
          </p>
        )}

        {!vetsLoading && hasRealVets && nearbyVets.map((vet, i) => (
          <RealVetCard key={i} vet={vet} urgencyLevel={urgencyLevel} />
        ))}
      </div>

      {hasRealVets && (
        <p className="text-[10px] text-muted-foreground text-center">
          Results from OpenStreetMap. Always call ahead to confirm availability.
        </p>
      )}
    </div>
  );
}
