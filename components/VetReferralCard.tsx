import { MapPin, Phone, Clock, ExternalLink, Star } from 'lucide-react';
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

const mockClinics: Record<string, VetClinic[]> = {
  emergency: [
    { name: 'VEG — Veterinary Emergency Group', type: 'emergency', distance: '2.4 mi', rating: 4.8, hours: 'Open 24/7', phone: '(555) 123-4567', address: '123 Main St', isPartner: true },
    { name: 'BluePearl Pet Hospital', type: 'emergency', distance: '5.1 mi', rating: 4.6, hours: 'Open 24/7', phone: '(555) 234-5678', address: '456 Oak Ave', isPartner: true },
  ],
  'vet-soon': [
    { name: 'VEG — Veterinary Emergency Group', type: 'emergency', distance: '2.4 mi', rating: 4.8, hours: 'Open 24/7', phone: '(555) 123-4567', address: '123 Main St', isPartner: true },
    { name: 'PetWell Urgent Care', type: 'urgent-care', distance: '1.8 mi', rating: 4.7, hours: 'Open until 10 PM', phone: '(555) 345-6789', address: '789 Elm Blvd', isPartner: false },
  ],
  'vet-scheduled': [
    { name: 'Nuzzle Partner Clinic', type: 'general', distance: '0.9 mi', rating: 4.9, hours: 'Mon–Sat 8AM–6PM', phone: '(555) 456-7890', address: '321 Park Dr', isPartner: true },
    { name: 'Happy Paws Veterinary', type: 'general', distance: '3.2 mi', rating: 4.5, hours: 'Mon–Fri 9AM–5PM', phone: '(555) 567-8901', address: '654 Pine St', isPartner: false },
  ],
};

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
}

export function VetReferralCard({ urgencyLevel, petName }: VetReferralCardProps) {
  const clinics = mockClinics[urgencyLevel] || mockClinics['vet-scheduled'];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-foreground">
          {urgencyLevel === 'emergency' ? 'Nearest Emergency Vets' : 'Recommended Vets Near You'}
        </h3>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Based on your area
        </span>
      </div>

      <div className="space-y-3">
        {clinics.map((clinic) => (
          <div
            key={clinic.name}
            className="rounded-xl border border-border bg-background p-4 space-y-3 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-foreground">{clinic.name}</p>
                  {clinic.isPartner && (
                    <span className="text-[9px] font-bold text-primary bg-sage-light rounded-full px-2 py-0.5 uppercase tracking-wider">
                      Nuzzle Partner
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBg[clinic.type]}`}>
                    {typeLabels[clinic.type]}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-score-watch text-score-watch" /> {clinic.rating}
                  </span>
                  <span>{clinic.distance}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {clinic.hours}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {clinic.phone}
              </span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-xs gap-1.5 flex-1">
                <Phone className="h-3 w-3" />
                {urgencyLevel === 'emergency' ? 'Call Now' : 'Book Appointment'}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <ExternalLink className="h-3 w-3" /> Directions
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Partner clinics offer priority booking for Nuzzle members.{' '}
        <span className="text-primary font-medium cursor-pointer hover:underline">Learn more</span>
      </p>
    </div>
  );
}
