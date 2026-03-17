/**
 * Breed-specific health benchmarks for dogs and cats.
 *
 * Sources:
 * - AKC Breed Standards (akc.org/dog-breeds) — weight ranges, group classification
 * - UFAW Genetic Welfare Problems Database (ufaw.org.uk) — breed predispositions
 * - Banfield Pet Hospital State of Pet Health Report — lifespan, senior age data
 * - AAHA Life Stage Guidelines 2019 — senior/geriatric age thresholds
 * - Merck Veterinary Manual — breed-specific disease prevalence
 * - TICA / CFA breed profiles — cat breed standards
 */

export interface BreedBenchmark {
  breed: string;
  species: 'dog' | 'cat';
  weightRange: { min: number; max: number; unit: 'lbs' };
  seniorAge: number; // age in years when considered senior
  lifeExpectancy: { min: number; max: number };
  sizeClass: 'toy' | 'small' | 'medium' | 'large' | 'giant';
  predispositions: string[];
  screeningNotes: string[];
}

export const breedBenchmarks: BreedBenchmark[] = [
  // ===== DOGS =====
  { breed: 'Labrador Retriever', species: 'dog', weightRange: { min: 55, max: 80, unit: 'lbs' }, seniorAge: 7, lifeExpectancy: { min: 10, max: 12 }, sizeClass: 'large', predispositions: ['Hip dysplasia', 'Elbow dysplasia', 'Obesity', 'Exercise-induced collapse', 'Progressive retinal atrophy'], screeningNotes: ['Annual hip evaluation after age 2', 'Monitor weight closely — breed prone to obesity', 'Eye exam recommended annually'] },
  { breed: 'Golden Retriever', species: 'dog', weightRange: { min: 55, max: 75, unit: 'lbs' }, seniorAge: 7, lifeExpectancy: { min: 10, max: 12 }, sizeClass: 'large', predispositions: ['Cancer (hemangiosarcoma, lymphoma)', 'Hip dysplasia', 'Heart disease (SAS)', 'Hypothyroidism', 'Allergies'], screeningNotes: ['Cancer screening recommended after age 6', 'Annual cardiac exam', 'Thyroid panel with routine bloodwork'] },
  { breed: 'German Shepherd', species: 'dog', weightRange: { min: 50, max: 90, unit: 'lbs' }, seniorAge: 7, lifeExpectancy: { min: 9, max: 13 }, sizeClass: 'large', predispositions: ['Hip dysplasia', 'Degenerative myelopathy', 'Exocrine pancreatic insufficiency', 'Bloat (GDV)', 'Allergies'], screeningNotes: ['Hip and elbow evaluation by age 2', 'GDV awareness — avoid exercise after meals', 'Fecal elastase if chronic loose stool'] },
  { breed: 'French Bulldog', species: 'dog', weightRange: { min: 16, max: 28, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 10, max: 12 }, sizeClass: 'small', predispositions: ['Brachycephalic airway syndrome', 'Intervertebral disc disease', 'Allergies/atopic dermatitis', 'Heatstroke', 'Cherry eye'], screeningNotes: ['Avoid overheating — monitor in warm weather', 'Spinal health monitoring', 'Skin allergy management plan recommended'] },
  { breed: 'Bulldog', species: 'dog', weightRange: { min: 40, max: 50, unit: 'lbs' }, seniorAge: 7, lifeExpectancy: { min: 8, max: 10 }, sizeClass: 'medium', predispositions: ['Brachycephalic airway syndrome', 'Hip dysplasia', 'Cherry eye', 'Skin fold dermatitis', 'Heart disease'], screeningNotes: ['Respiratory assessment annually', 'Skin fold care and monitoring', 'Weight management critical'] },
  { breed: 'Poodle', species: 'dog', weightRange: { min: 40, max: 70, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'medium', predispositions: ['Hip dysplasia', 'Progressive retinal atrophy', 'Addisons disease', 'Bloat (GDV)', 'Epilepsy'], screeningNotes: ['Eye exam annually', 'Monitor for signs of Addisons (lethargy, vomiting)'] },
  { breed: 'Miniature Poodle', species: 'dog', weightRange: { min: 10, max: 15, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 14, max: 17 }, sizeClass: 'small', predispositions: ['Patellar luxation', 'Progressive retinal atrophy', 'Legg-Calve-Perthes', 'Epilepsy'], screeningNotes: ['Knee evaluation', 'Annual eye exam'] },
  { breed: 'Beagle', species: 'dog', weightRange: { min: 20, max: 30, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'medium', predispositions: ['Obesity', 'Epilepsy', 'Hypothyroidism', 'Intervertebral disc disease', 'Cherry eye'], screeningNotes: ['Strict weight management', 'Thyroid screening with routine bloodwork'] },
  { breed: 'Rottweiler', species: 'dog', weightRange: { min: 80, max: 135, unit: 'lbs' }, seniorAge: 7, lifeExpectancy: { min: 8, max: 10 }, sizeClass: 'large', predispositions: ['Osteosarcoma', 'Hip dysplasia', 'Cruciate ligament disease', 'Aortic stenosis', 'Bloat (GDV)'], screeningNotes: ['Bone cancer awareness after age 5', 'Annual cardiac screening', 'Joint evaluation'] },
  { breed: 'German Shorthaired Pointer', species: 'dog', weightRange: { min: 45, max: 70, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 12, max: 14 }, sizeClass: 'large', predispositions: ['Hip dysplasia', 'Bloat (GDV)', 'Lymphedema', 'Cone degeneration'], screeningNotes: ['Hip evaluation by age 2', 'GDV prevention awareness'] },
  { breed: 'Dachshund', species: 'dog', weightRange: { min: 16, max: 32, unit: 'lbs' }, seniorAge: 9, lifeExpectancy: { min: 12, max: 16 }, sizeClass: 'small', predispositions: ['Intervertebral disc disease (IVDD)', 'Obesity', 'Patellar luxation', 'Diabetes', 'Cushing disease'], screeningNotes: ['Spinal health critical — avoid jumping', 'Weight management essential', 'Blood glucose monitoring after age 7'] },
  { breed: 'Pembroke Welsh Corgi', species: 'dog', weightRange: { min: 25, max: 30, unit: 'lbs' }, seniorAge: 9, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'medium', predispositions: ['Intervertebral disc disease', 'Hip dysplasia', 'Degenerative myelopathy', 'Obesity', 'Progressive retinal atrophy'], screeningNotes: ['Weight management crucial', 'Spinal health monitoring', 'Eye exams'] },
  { breed: 'Australian Shepherd', species: 'dog', weightRange: { min: 40, max: 65, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'medium', predispositions: ['Hip dysplasia', 'Epilepsy', 'MDR1 drug sensitivity', 'Cataracts', 'Autoimmune thyroiditis'], screeningNotes: ['MDR1 genetic test recommended', 'Eye exam annually', 'Thyroid screening'] },
  { breed: 'Yorkshire Terrier', species: 'dog', weightRange: { min: 4, max: 7, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 13, max: 16 }, sizeClass: 'toy', predispositions: ['Patellar luxation', 'Portosystemic shunt', 'Tracheal collapse', 'Dental disease', 'Hypoglycemia'], screeningNotes: ['Dental care critical — professional cleaning annually', 'Bile acids test if poor growth', 'Monitor for low blood sugar'] },
  { breed: 'Cavalier King Charles Spaniel', species: 'dog', weightRange: { min: 12, max: 18, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 9, max: 14 }, sizeClass: 'small', predispositions: ['Mitral valve disease', 'Syringomyelia', 'Patellar luxation', 'Keratoconjunctivitis sicca', 'Episodic falling'], screeningNotes: ['Annual cardiac auscultation — echocardiogram by age 5', 'Neurological monitoring for SM signs'] },
  { breed: 'Doberman Pinscher', species: 'dog', weightRange: { min: 60, max: 100, unit: 'lbs' }, seniorAge: 7, lifeExpectancy: { min: 10, max: 12 }, sizeClass: 'large', predispositions: ['Dilated cardiomyopathy', 'Von Willebrand disease', 'Wobbler syndrome', 'Hypothyroidism', 'Bloat (GDV)'], screeningNotes: ['Annual cardiac screening with echo + Holter after age 3', 'vWD genetic test', 'Thyroid panel'] },
  { breed: 'Miniature Schnauzer', species: 'dog', weightRange: { min: 11, max: 20, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'small', predispositions: ['Pancreatitis', 'Hyperlipidemia', 'Urolithiasis', 'Diabetes', 'Cataracts'], screeningNotes: ['Low-fat diet recommended', 'Lipid panel with bloodwork', 'Monitor for pancreatitis signs'] },
  { breed: 'Boxer', species: 'dog', weightRange: { min: 50, max: 80, unit: 'lbs' }, seniorAge: 7, lifeExpectancy: { min: 10, max: 12 }, sizeClass: 'large', predispositions: ['Aortic stenosis', 'Boxer cardiomyopathy (ARVC)', 'Mast cell tumors', 'Hip dysplasia', 'Bloat (GDV)'], screeningNotes: ['Annual cardiac evaluation', 'Skin lump checks — biopsy suspicious masses', 'Cancer screening after age 5'] },
  { breed: 'Great Dane', species: 'dog', weightRange: { min: 110, max: 175, unit: 'lbs' }, seniorAge: 5, lifeExpectancy: { min: 7, max: 10 }, sizeClass: 'giant', predispositions: ['Bloat (GDV)', 'Dilated cardiomyopathy', 'Osteosarcoma', 'Hip dysplasia', 'Wobblers syndrome'], screeningNotes: ['Prophylactic gastropexy strongly recommended', 'Annual cardiac screening', 'Joint supplements early'] },
  { breed: 'Siberian Husky', species: 'dog', weightRange: { min: 35, max: 60, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 12, max: 14 }, sizeClass: 'medium', predispositions: ['Cataracts', 'Corneal dystrophy', 'Hip dysplasia', 'Hypothyroidism', 'Zinc-responsive dermatosis'], screeningNotes: ['Annual eye exam', 'Thyroid screening'] },
  { breed: 'Bernese Mountain Dog', species: 'dog', weightRange: { min: 70, max: 115, unit: 'lbs' }, seniorAge: 6, lifeExpectancy: { min: 7, max: 10 }, sizeClass: 'giant', predispositions: ['Histiocytic sarcoma', 'Hip/elbow dysplasia', 'Bloat (GDV)', 'Progressive retinal atrophy', 'Von Willebrand disease'], screeningNotes: ['Cancer screening recommended from age 4', 'Joint evaluation early', 'Shorter lifespan — proactive senior care'] },
  { breed: 'Shih Tzu', species: 'dog', weightRange: { min: 9, max: 16, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 10, max: 16 }, sizeClass: 'small', predispositions: ['Brachycephalic airway syndrome', 'Keratoconjunctivitis sicca', 'Patellar luxation', 'Dental disease', 'Intervertebral disc disease'], screeningNotes: ['Eye care and tear production monitoring', 'Dental cleaning annually', 'Respiratory assessment'] },
  { breed: 'Chihuahua', species: 'dog', weightRange: { min: 3, max: 6, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 14, max: 18 }, sizeClass: 'toy', predispositions: ['Patellar luxation', 'Hydrocephalus', 'Tracheal collapse', 'Dental disease', 'Heart murmur/MVD'], screeningNotes: ['Dental care critical', 'Cardiac auscultation annually', 'Patellar evaluation'] },
  { breed: 'Pomeranian', species: 'dog', weightRange: { min: 3, max: 7, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 16 }, sizeClass: 'toy', predispositions: ['Patellar luxation', 'Tracheal collapse', 'Alopecia X', 'Dental disease', 'Hypoglycemia'], screeningNotes: ['Dental care essential', 'Coat and endocrine monitoring'] },
  { breed: 'Border Collie', species: 'dog', weightRange: { min: 30, max: 55, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'medium', predispositions: ['Hip dysplasia', 'Epilepsy', 'Collie eye anomaly', 'MDR1 drug sensitivity', 'Osteochondritis dissecans'], screeningNotes: ['MDR1 genetic test', 'Eye exam', 'Joint evaluation'] },
  { breed: 'Goldendoodle', species: 'dog', weightRange: { min: 45, max: 75, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 10, max: 15 }, sizeClass: 'large', predispositions: ['Hip dysplasia', 'Allergies/atopic dermatitis', 'Progressive retinal atrophy', 'Addisons disease', 'Heart disease (SAS)'], screeningNotes: ['Hip evaluation', 'Skin allergy management', 'Eye exam'] },
  { breed: 'Labradoodle', species: 'dog', weightRange: { min: 30, max: 65, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 12, max: 14 }, sizeClass: 'medium', predispositions: ['Hip dysplasia', 'Allergies', 'Progressive retinal atrophy', 'Addisons disease'], screeningNotes: ['Hip and eye evaluation', 'Allergy management'] },
  { breed: 'Cocker Spaniel', species: 'dog', weightRange: { min: 20, max: 30, unit: 'lbs' }, seniorAge: 9, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'medium', predispositions: ['Ear infections', 'Cherry eye', 'Cataracts', 'Hypothyroidism', 'Autoimmune hemolytic anemia'], screeningNotes: ['Ear cleaning and monitoring biweekly', 'Eye exam annually', 'Thyroid panel'] },
  { breed: 'Maltese', species: 'dog', weightRange: { min: 4, max: 7, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'toy', predispositions: ['Dental disease', 'Patellar luxation', 'Portosystemic shunt', 'White shaker syndrome', 'Collapsed trachea'], screeningNotes: ['Dental care priority', 'Liver function testing if poor growth'] },
  { breed: 'Mixed Breed', species: 'dog', weightRange: { min: 20, max: 70, unit: 'lbs' }, seniorAge: 8, lifeExpectancy: { min: 10, max: 14 }, sizeClass: 'medium', predispositions: ['Varies — hybrid vigor generally reduces breed-specific risk', 'Dental disease', 'Obesity'], screeningNotes: ['Standard preventive care', 'Weight monitoring', 'Dental care'] },

  // ===== CATS =====
  { breed: 'Domestic Shorthair', species: 'cat', weightRange: { min: 8, max: 11, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 18 }, sizeClass: 'medium', predispositions: ['Obesity', 'Dental disease', 'Lower urinary tract disease (FLUTD)', 'Diabetes', 'Chronic kidney disease'], screeningNotes: ['Weight management', 'Dental care annually', 'Senior bloodwork from age 7', 'Urinalysis annually from age 7'] },
  { breed: 'Domestic Longhair', species: 'cat', weightRange: { min: 8, max: 11, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 18 }, sizeClass: 'medium', predispositions: ['Obesity', 'Hairballs/GI issues', 'Dental disease', 'Chronic kidney disease'], screeningNotes: ['Regular grooming to prevent matting', 'Weight monitoring', 'Senior bloodwork from age 7'] },
  { breed: 'Maine Coon', species: 'cat', weightRange: { min: 10, max: 25, unit: 'lbs' }, seniorAge: 9, lifeExpectancy: { min: 10, max: 13 }, sizeClass: 'large', predispositions: ['Hypertrophic cardiomyopathy (HCM)', 'Hip dysplasia', 'Spinal muscular atrophy', 'Polycystic kidney disease'], screeningNotes: ['Echocardiogram screening for HCM annually', 'Hip evaluation', 'Kidney screening'] },
  { breed: 'Ragdoll', species: 'cat', weightRange: { min: 10, max: 20, unit: 'lbs' }, seniorAge: 9, lifeExpectancy: { min: 12, max: 17 }, sizeClass: 'large', predispositions: ['Hypertrophic cardiomyopathy', 'Bladder stones', 'Feline infectious peritonitis (FIP) susceptibility'], screeningNotes: ['HCM screening', 'Urinalysis monitoring', 'Cardiac auscultation annually'] },
  { breed: 'British Shorthair', species: 'cat', weightRange: { min: 9, max: 17, unit: 'lbs' }, seniorAge: 9, lifeExpectancy: { min: 12, max: 17 }, sizeClass: 'medium', predispositions: ['Hypertrophic cardiomyopathy', 'Polycystic kidney disease', 'Obesity', 'Hemophilia B'], screeningNotes: ['HCM screening', 'PKD genetic test or ultrasound', 'Weight management'] },
  { breed: 'Siamese', species: 'cat', weightRange: { min: 6, max: 14, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 15, max: 20 }, sizeClass: 'medium', predispositions: ['Amyloidosis', 'Asthma', 'Megaesophagus', 'Progressive retinal atrophy', 'Mast cell tumors'], screeningNotes: ['Respiratory monitoring', 'Liver/kidney function checks', 'Watch for chronic vomiting'] },
  { breed: 'Persian', species: 'cat', weightRange: { min: 7, max: 12, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 17 }, sizeClass: 'medium', predispositions: ['Polycystic kidney disease', 'Brachycephalic airway syndrome', 'Progressive retinal atrophy', 'Dental disease', 'Dermatitis'], screeningNotes: ['PKD screening ultrasound', 'Eye care', 'Facial fold care', 'Dental cleaning annually'] },
  { breed: 'Bengal', species: 'cat', weightRange: { min: 8, max: 15, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 16 }, sizeClass: 'medium', predispositions: ['Hypertrophic cardiomyopathy', 'Progressive retinal atrophy', 'Patellar luxation', 'Flat-chested kitten syndrome'], screeningNotes: ['HCM screening', 'Eye exam', 'Cardiac auscultation annually'] },
  { breed: 'Sphynx', species: 'cat', weightRange: { min: 6, max: 12, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'medium', predispositions: ['Hypertrophic cardiomyopathy', 'Skin conditions (urticaria pigmentosa)', 'Respiratory infections', 'Dental disease'], screeningNotes: ['HCM screening essential', 'Weekly skin baths', 'Dental care'] },
  { breed: 'Abyssinian', species: 'cat', weightRange: { min: 6, max: 10, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 15 }, sizeClass: 'medium', predispositions: ['Renal amyloidosis', 'Progressive retinal atrophy', 'Pyruvate kinase deficiency', 'Gingivitis'], screeningNotes: ['Kidney function monitoring', 'Eye exam', 'Dental care'] },
  { breed: 'Scottish Fold', species: 'cat', weightRange: { min: 6, max: 13, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 11, max: 14 }, sizeClass: 'medium', predispositions: ['Osteochondrodysplasia (cartilage/bone disorder)', 'Polycystic kidney disease', 'Cardiomyopathy'], screeningNotes: ['Joint health monitoring — arthritis common', 'PKD screening', 'Cardiac evaluation'] },
  { breed: 'Mixed Breed', species: 'cat', weightRange: { min: 8, max: 12, unit: 'lbs' }, seniorAge: 10, lifeExpectancy: { min: 12, max: 18 }, sizeClass: 'medium', predispositions: ['Dental disease', 'Obesity', 'Chronic kidney disease', 'Hyperthyroidism (older cats)'], screeningNotes: ['Standard preventive care', 'Senior bloodwork from age 7', 'T4 thyroid check from age 8'] },
];

/**
 * Find the best matching breed benchmark. Falls back to species-level Mixed Breed.
 */
export function findBreedBenchmark(breed: string, species: 'dog' | 'cat'): BreedBenchmark {
  const normalized = breed.toLowerCase().trim();

  // Exact match first
  let match = breedBenchmarks.find(
    b => b.species === species && b.breed.toLowerCase() === normalized
  );
  if (match) return match;

  // Partial match
  match = breedBenchmarks.find(
    b => b.species === species && (
      normalized.includes(b.breed.toLowerCase()) ||
      b.breed.toLowerCase().includes(normalized)
    )
  );
  if (match) return match;

  // Doodle/mix heuristics
  if (normalized.includes('doodle') || normalized.includes('poo')) {
    match = breedBenchmarks.find(b => b.breed === 'Goldendoodle' && b.species === species);
    if (match) return match;
  }

  // Fallback to Mixed Breed for this species
  return breedBenchmarks.find(b => b.breed === 'Mixed Breed' && b.species === species)!;
}

/**
 * Format breed benchmark data for injection into AI prompts.
 */
export function formatBreedContext(benchmark: BreedBenchmark): string {
  return `BREED HEALTH PROFILE (${benchmark.breed}, ${benchmark.species}):
- Ideal weight: ${benchmark.weightRange.min}–${benchmark.weightRange.max} lbs
- Size class: ${benchmark.sizeClass}
- Life expectancy: ${benchmark.lifeExpectancy.min}–${benchmark.lifeExpectancy.max} years
- Senior age threshold: ${benchmark.seniorAge} years
- Known predispositions: ${benchmark.predispositions.join('; ')}
- Screening recommendations: ${benchmark.screeningNotes.join('; ')}`;
}
