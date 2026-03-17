Design system: Sage green primary, warm cream bg, terracotta accent, DM Serif Display + Inter fonts.
Brand tokens defined in index.css: --sage, --cream, --terracotta, --score-optimal/watch/elevated.
Custom tailwind colors: sage, cream, terracotta, warm-gray, score.
Mobile-first layout with BottomNav component for app pages.
Pages: LandingPage (/), Dashboard (/dashboard), DiagnosticsPage (/diagnostics), PetProfilePage (/pet), TimelinePage (/timeline), RecordsPage (/records), AskVetPage (/ask-vet), MembershipPage (/membership).
Data layer: shared usePetData hook fetches real pet, records, and parsed labs from DB. Falls back to mock data in src/lib/mock-data.ts.
Types in src/lib/types.ts.
PDF lab parsing: edge function parse-lab-pdf uses Lovable AI (gemini-2.5-flash) to extract biomarkers from uploaded PDFs, stores in parsed_lab_results table.
Auth: auto-confirm enabled. profiles, pets, pet_records, parsed_lab_results tables with RLS.
Storage: pet-records bucket (private) for PDF uploads.
