import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE CHUNKS — compiled from Cornell AHDC, eClinPath, Merck Vet Manual,
// WSAVA Guidelines, FDA Animal AERS, Frontiers in Veterinary Science
// ─────────────────────────────────────────────────────────────────────────────
const CHUNKS = [

  // ── LAB REFERENCE: HEMATOLOGY (DOGS) ───────────────────────────────────────
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "WBC",
    symptom_cluster: null,
    content: `WBC (White Blood Cell Count) reference range in dogs: 5.5–16.9 x10³/μL. Elevated WBC (leukocytosis): infection, inflammation, stress leukogram (corticosteroid effect: mature neutrophilia + lymphopenia + monocytosis + eosinopenia), neoplasia (lymphoma, mast cell). Decreased WBC (leukopenia): bone marrow suppression, parvovirus (severe neutropenia in young unvaccinated dogs — life-threatening), sepsis (demand exceeds production), immune-mediated neutropenia. Neutrophil left shift (band neutrophils >300/μL) indicates severe acute inflammation or infection. Toxic neutrophils (Döhle bodies, cytoplasmic vacuolation) signal sepsis or endotoxemia — urgent evaluation warranted.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "RBC_HCT",
    symptom_cluster: null,
    content: `RBC, Hematocrit (HCT/PCV), and Hemoglobin reference ranges in dogs: RBC 5.5–8.5 x10⁶/μL; HCT 37–55%; Hemoglobin 12–18 g/dL. Anemia (HCT <37%): classify as regenerative (reticulocyte count >60,000/μL — hemolysis or hemorrhage) vs. non-regenerative (bone marrow disease, chronic disease, renal failure). Regenerative causes: IMHA (immune-mediated hemolytic anemia — spherocytes, autoagglutination), blood loss, Babesia. Non-regenerative: chronic kidney disease (EPO deficiency), iron deficiency, bone marrow suppression. MCV 60–77 fL; low MCV (microcytosis) = iron deficiency, portosystemic shunt (Yorkies, Maltese). MCHC 32–36 g/dL; spuriously elevated MCHC suggests hemolysis or lipemia artifact. Polycythemia (HCT >60%): dehydration, polycythemia vera, high-altitude adaptation.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "platelets",
    symptom_cluster: null,
    content: `Platelet count reference range in dogs: 200–500 x10³/μL. Thrombocytopenia (<150): bleeding risk significant when <50. Causes: immune-mediated thrombocytopenia (ITP/IMTP — most common cause in dogs, usually <30), tick-borne disease (Ehrlichia, Anaplasma — frequently causes thrombocytopenia), DIC (disseminated intravascular coagulation), bone marrow suppression, chemotherapy, estrogen toxicity. Thrombocytosis (>500): reactive (infection, inflammation, iron deficiency, splenectomy). True thrombocythemia rare. Note: EDTA clumping and platelet clumping artifacts can falsely lower count — verify with blood smear.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "BUN_creatinine",
    symptom_cluster: null,
    content: `BUN and Creatinine reference ranges in dogs: BUN 7–27 mg/dL; Creatinine 0.5–1.8 mg/dL. Azotemia classification: Pre-renal (BUN:Cr ratio >30, USG >1.030, urine concentrated) = dehydration, hypovolemia, hypoperfusion. Renal (concurrent poor urine concentration USG <1.030) = primary renal failure, requires >75% nephron loss for creatinine to rise above reference range. Post-renal = urethral obstruction, bladder rupture. Decreased BUN (<7): liver failure (urea cycle impairment), portosystemic shunt, low-protein diet. Creatinine is more specific for GFR than BUN. Muscle mass affects creatinine — emaciated patients may have spuriously low creatinine masking CKD. SDMA rises earlier, detecting 25–40% nephron loss; preferred for early CKD detection.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "SDMA",
    symptom_cluster: null,
    content: `SDMA (Symmetric Dimethylarginine) reference range: <14 μg/dL (dogs and cats). SDMA is a more sensitive early marker of glomerular filtration rate decline than creatinine, detecting CKD when approximately 25–40% of nephron function is lost (vs. >75% loss required before creatinine rises). IRIS (International Renal Interest Society) recommends SDMA as a staging parameter alongside creatinine. Elevated SDMA with normal creatinine = early CKD or subclinical renal disease — recheck in 2–4 weeks, assess urine specific gravity, UPC ratio, and blood pressure. SDMA is not significantly affected by muscle mass, making it particularly valuable in cachectic or heavily muscled patients.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "ALT",
    symptom_cluster: null,
    content: `ALT (Alanine Aminotransferase) reference range in dogs: 12–118 U/L. ALT is liver-specific in dogs (not cats). Elevated ALT indicates hepatocellular damage or leakage. Interpretation by magnitude: mild elevation (1–3x upper limit) = nonspecific, may be due to steroid hepatopathy, NSAID use, recent vigorous exercise, subclinical hepatopathy. Moderate elevation (3–10x) = significant hepatopathy — pancreatitis, hepatitis, hepatic lipidosis, toxin exposure, phenobarbital treatment. Severe elevation (>10x) = acute hepatocellular necrosis, toxin (xylitol, acetaminophen, aflatoxin, blue-green algae), acute hepatitis. Concurrent ALP elevation: suggests cholestatic component. ALT without ALP elevation: more likely hepatocellular. Note: phenobarbital and corticosteroids are common causes of elevated ALT in treated dogs.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "ALP",
    symptom_cluster: null,
    content: `ALP (Alkaline Phosphatase) reference range in dogs: 5–131 U/L. ALP is non-specific in dogs — multiple isoenzymes: liver (LALP), bone (BALP), steroid-induced (SALP). Marked ALP elevation (>3x) with relatively normal ALT is a hallmark of hyperadrenocorticism (Cushing's disease) or corticosteroid administration (steroid-induced isoenzyme unique to dogs). Other causes: cholestasis (bile duct obstruction, cholangiohepatitis), hepatic infiltration, pancreatitis, bone disease (young growing dogs, osteosarcoma), nodular hyperplasia (older dogs — common incidental finding). Young dogs normally have higher ALP due to bone isoenzyme. ALP in cats: reference range 5–75 U/L (much lower) — any elevation in cats is more clinically significant than in dogs.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "glucose",
    symptom_cluster: null,
    content: `Glucose reference range in dogs: 74–143 mg/dL. Hyperglycemia: diabetes mellitus (fasting glucose >200 mg/dL, glucosuria; requires insulin therapy), hyperadrenocorticism (Cushing's — mild, due to glucocorticoid insulin resistance), acromegaly (rare), pancreatitis (temporary), stress (mild elevation, rarely >180 in dogs). Hypoglycemia (<60 mg/dL): insulinoma (functional beta cell tumor — episodic weakness/seizures, Whipple's triad), insulin overdose, juvenile hypoglycemia (toy breeds), Addison's disease, hepatic failure, sepsis, hunting dog hypoglycemia, xylitol toxicity (rapid severe drop). Neonatal/toy breed hypoglycemia: Chihuahuas, Yorkies, Maltese most at risk when skipping meals. Always verify with point-of-care glucose; in-house analyzers may vary.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "electrolytes",
    symptom_cluster: null,
    content: `Electrolyte reference ranges in dogs: Sodium 140–154 mEq/L; Potassium 3.5–5.8 mEq/L; Chloride 105–122 mEq/L. Na:K ratio <27:1 is a hallmark of hypoadrenocorticism (Addison's disease) — concurrent hyponatremia and hyperkalemia. Other causes of hyperkalemia: urethral obstruction (trapped potassium, cardiac risk at K+ >6.5), acute renal failure, acidosis, pseudohyperkalemia (hemolysis, especially Akitas/Shibas with high erythrocyte K+). Hyponatremia causes: Addison's (most important to rule out), SIADH, gastrointestinal loss (vomiting/diarrhea), third-space effusion. Hypokalemia: vomiting/diarrhea, renal loss (CKD, post-obstructive diuresis), hypokalemic nephropathy in cats, insulin therapy, alkalosis.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "thyroid_T4",
    symptom_cluster: null,
    content: `Total T4 (Thyroxine) reference range in dogs: 1.0–4.0 μg/dL. Hypothyroidism: most common endocrine disease in dogs. T4 <1.0 μg/dL with clinical signs (lethargy, weight gain, cold intolerance, bilateral symmetric alopecia, hypercholesterolemia, bradycardia, myxedema). At-risk breeds: Golden Retrievers, Dobermans, Boxers, Cocker Spaniels, Shetland Sheepdogs. Concurrent elevation of cholesterol and ALP is common. Confirm with free T4 by equilibrium dialysis (fT4ed) and endogenous TSH if T4 borderline. Treatment: levothyroxine 0.02 mg/kg q12–24h; recheck T4 4–6 hours post-pill at 4–6 weeks. Non-thyroidal illness (euthyroid sick syndrome) can suppress T4 in sick dogs — do not diagnose hypothyroidism based on T4 alone during acute illness.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "cholesterol",
    symptom_cluster: null,
    content: `Cholesterol reference range in dogs: 110–320 mg/dL. Hypercholesterolemia (>320): hypothyroidism (most common cause in dogs — always screen T4 when cholesterol is elevated), hyperadrenocorticism (Cushing's disease), diabetes mellitus, nephrotic syndrome (protein-losing nephropathy), pancreatitis, post-prandial. Miniature Schnauzers: breed-specific idiopathic hyperlipidemia — elevated cholesterol and triglycerides; predisposed to pancreatitis. Low-fat diet and omega-3 supplementation indicated. Triglycerides reference range: <150 mg/dL. Lipemic samples (triglycerides >200) interfere with multiple assays. Fasting sample preferred for accurate lipid assessment.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "dog",
    analyte: "calcium_phosphorus",
    symptom_cluster: null,
    content: `Calcium reference range in dogs: 7.9–12.0 mg/dL. Phosphorus: 2.5–6.8 mg/dL. Hypercalcemia: hypercalcemia of malignancy (lymphoma most common cause — PTHrP-mediated; also anal sac adenocarcinoma), primary hyperparathyroidism (parathyroid adenoma — usually mild, incidental), hypoadrenocorticism (Addison's), granulomatous disease, Vitamin D toxicity (rodenticide, calcipotriene, over-supplementation), chronic renal failure (less common). Adjusted calcium formula: adjusted Ca = measured Ca − albumin + 3.5. Hypocalcemia: hypoparathyroidism, eclampsia (periparturient tetany in lactating dogs — emergency), pancreatitis (saponification), ethylene glycol toxicity, low albumin (not ionized calcium — may not require treatment). Hyperphosphatemia: renal failure (decreased excretion — restrict in CKD diets), hypoparathyroidism, young animals (normal). Product of Ca × P >55–70 = soft tissue mineralization risk.`,
  },

  // ── LAB REFERENCE: CATS ────────────────────────────────────────────────────
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "cat",
    analyte: "kidney_cats",
    symptom_cluster: null,
    content: `Kidney markers in cats — reference ranges: BUN 15–32 mg/dL; Creatinine 0.6–2.4 mg/dL; SDMA <14 μg/dL; Phosphorus 2.4–8.2 mg/dL. CKD is the most common disease in cats >10 years. IRIS CKD Staging (cats): Stage 1 = SDMA ≥18 with normal creatinine (<1.6); Stage 2 = creatinine 1.6–2.8 (mg/dL); Stage 3 = 2.9–5.0; Stage 4 = >5.0. Start phosphorus restriction from Stage 1. Urine specific gravity <1.035 in a dehydrated cat indicates inadequate concentration — renal concern. UPC ratio (urine protein:creatinine) >0.4 = significant proteinuria. Monitor BP — hypertension common in CKD cats (target <160 mmHg systolic). Post-treatment renal monitoring: starting methimazole for hyperthyroidism can unmask CKD (hyperthyroid state masks renal disease by increasing GFR) — recheck creatinine 4–6 weeks post-treatment.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "cat",
    analyte: "thyroid_cats",
    symptom_cluster: null,
    content: `Feline thyroid (T4) reference range: 0.8–4.0 μg/dL. Hyperthyroidism is the most common endocrine disease in cats, typically affecting cats >10 years. Clinical signs: weight loss despite good/increased appetite, PU/PD, vomiting, diarrhea, tachycardia, hypertension, cardiac murmur, unkempt coat, hyperactivity. T4 >4.0 with clinical signs confirms diagnosis. Borderline T4 (2.5–4.0) with suspicious signs: free T4 by equilibrium dialysis or TT3 suppression test. Treatment options: methimazole (medical), radioactive iodine (curative, preferred), thyroidectomy. Monitor CBC (Heinz body anemia, thrombocytopenia risk with methimazole — q2–4 weeks initially). Concurrent CKD unmasked after treatment — recheck BUN, creatinine, SDMA at 4–6 weeks post-treatment. ALP in cats is far less sensitive than in dogs; any ALP elevation in cats is more clinically significant.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "cat",
    analyte: "glucose_cats",
    symptom_cluster: null,
    content: `Glucose reference range in cats: 64–170 mg/dL. Stress hyperglycemia is very common in cats and can reach 250–400 mg/dL without diabetes — always consider handling stress in the clinic. Diabetes mellitus in cats: typically Type 2 (peripheral insulin resistance); associated with obesity, male sex, inactivity. Diagnosis requires persistent fasting hyperglycemia (>250 mg/dL) plus glucosuria. Fructosamine (<350 μmol/L normal) helps distinguish stress hyperglycemia (normal fructosamine) from diabetes (elevated fructosamine). Diabetic cats on insulin: risk of hypoglycemia, Somogyi rebound. Many diabetic cats achieve remission with weight loss + high-protein low-carbohydrate diet + insulin therapy within 1–4 months.`,
  },
  {
    source: "Cornell AHDC / eClinPath",
    document_type: "lab_reference",
    species: "cat",
    analyte: "liver_cats",
    symptom_cluster: null,
    content: `Liver markers in cats — reference ranges: ALT 12–130 U/L; ALP 5–75 U/L; GGT 0–4 U/L; Total Bilirubin 0–0.4 mg/dL. Hepatic lipidosis (HL): most common severe liver disease in cats. Occurs when obese cats stop eating for ≥2 days — fat mobilized to liver overwhelms hepatic export. Diagnosis: icterus, elevated bilirubin, ALT often markedly elevated. Treatment: aggressive nutritional support (tube feeding). ALP elevation in cats is significant at lower magnitudes than dogs — any ALP >100 in a cat warrants investigation. Cholangitis/cholangiohepatitis complex: common in middle-aged to older cats; often concurrent with IBD and pancreatitis (triaditis). GGT more sensitive than ALP for feline biliary disease. Bilirubin: icterus visible when bilirubin >2 mg/dL; any icteric cat is a serious diagnostic concern.`,
  },
  {
    source: "Cornell AHDC",
    document_type: "lab_reference",
    species: "cat",
    analyte: "CBC_cats",
    symptom_cluster: null,
    content: `CBC reference ranges in cats: WBC 4.0–15.5 x10³/μL; RBC 4.6–10.0 x10⁶/μL; HCT 28–49%; Hemoglobin 9.8–16.2 g/dL; Platelets 150–600 x10³/μL. Anemia in cats: HCT <25% typically causes clinical signs. Common causes: CKD (non-regenerative, EPO deficiency), IMHA (regenerative, spherocytes), FeLV-associated (aplastic), mycoplasma (feline infectious anemia — Mycoplasma haemofelis, detected on PCR or blood smear). Heinz body anemia: toxins (acetaminophen — fatal in cats, onions/garlic, propylene glycol, methimazole). Neutrophilia in cats: infection, stress, FIP (mixed pattern). Lymphocytosis with large granular lymphocytes: intestinal lymphoma. Platelet clumping common artifact in cats — check smear.`,
  },

  // ── PRE-ANALYTICAL FACTORS (eClinPath) ────────────────────────────────────
  {
    source: "eClinPath — Cornell University",
    document_type: "pre_analytical",
    species: "both",
    analyte: null,
    symptom_cluster: null,
    content: `Pre-analytical factors affecting lab results — Hemolysis: caused by difficult venipuncture, prolonged sample transit, freeze-thaw, or breed-specific high erythrocyte potassium (Akita, Shiba Inu, Jindo — hemolysis falsely elevates potassium dramatically in these breeds). Hemolysis falsely elevates: potassium, AST, LDH, bilirubin, ALT (mild). Hemolysis falsely decreases: sodium (dilutional), ALP (inactivation), and can interfere with spectrophotometric assays. Action: note hemolysis grade (mild/moderate/severe); repeat sample from less stressful draw if results unexpected.`,
  },
  {
    source: "eClinPath — Cornell University",
    document_type: "pre_analytical",
    species: "both",
    analyte: null,
    symptom_cluster: null,
    content: `Pre-analytical factors — Lipemia and icterus: Lipemia (triglycerides >200 mg/dL — visibly white/turbid plasma) interferes with spectrophotometric assays. Falsely elevates: total protein, triglycerides, ALT, ALP, bilirubin. Falsely decreases: sodium (pseudohyponatremia via dilutional effect). Lipemic samples: fast animal 12 hours and repeat, or use lipemia clearing (ultracentrifugation). Icterus (yellow plasma from bilirubin >2 mg/dL): interferes with colorimetric assays. Differentiate cause: pre-hepatic (hemolysis — elevated RBC destruction markers), hepatic (elevated ALT + ALP), post-hepatic (obstruction — very high bilirubin, GGT). Sample handling: delay in separating serum from clot causes glucose to decrease (cell consumption), potassium to increase (cell lysis). Always separate serum within 30 minutes of collection.`,
  },

  // ── SYMPTOM-CONDITION MAPPINGS (Merck Vet Manual / Cornell Consultant) ─────
  {
    source: "Merck Veterinary Manual / Cornell Consultant",
    document_type: "symptom",
    species: "dog",
    analyte: null,
    symptom_cluster: "GI",
    content: `Vomiting in dogs — differential diagnosis by presentation: Acute vomiting (onset <3 days): dietary indiscretion ("garbage gut") most common — typically self-limiting within 24–48h with bland diet. Foreign body ingestion: especially Labradors, Goldens — linear foreign bodies (strings, corn cobs) in intestine cause obstruction, require imaging and often surgery. Parvovirus: young unvaccinated dogs — profound bloody diarrhea + vomiting + neutropenia + lethargy + fever = life-threatening emergency. Pancreatitis: vomiting + abdominal pain + elevated lipase/amylase; Miniature Schnauzers, Yorkies, obese dogs at higher risk. Hemorrhagic gastroenteritis (AHDS): acute bloody vomiting + diarrhea with PCV >55%, normal total protein — responds to IV fluids. Emergency red flags: bloated abdomen + unproductive retching = GDV (emergency), continuous vomiting with depression/pain, blood in vomit without obvious cause.`,
  },
  {
    source: "Merck Veterinary Manual / Cornell Consultant",
    document_type: "symptom",
    species: "cat",
    analyte: null,
    symptom_cluster: "GI",
    content: `Vomiting in cats — differential diagnosis: Acute vomiting: hairballs (trichobezoar — typically preceded by retching, produces cylindrical hair mass; manage with laxatone, grooming), dietary indiscretion, foreign body ingestion (linear foreign bodies especially dangerous in cats — string, ribbon, thread — can anchor at base of tongue), pancreatitis. Chronic vomiting: hyperthyroidism (older cats — weight loss + vomiting + polyphagia), IBD/intestinal lymphoma (chronic small intestinal signs — differentiated by histopathology), CKD (uremic gastritis — older cats). CRITICAL: Cat not eating >48 hours — especially obese cats — hepatic lipidosis risk. Obese cats that stop eating due to any stressor (illness, environmental change) can develop rapidly fatal hepatic lipidosis. Nutritional support is primary treatment. Assess hydration status; cats mask dehydration well.`,
  },
  {
    source: "Merck Veterinary Manual",
    document_type: "symptom",
    species: "both",
    analyte: null,
    symptom_cluster: "urinary",
    content: `Urinary signs — straining, dysuria, hematuria: Male cats straining to urinate with no or minimal urine output = URETHRAL OBSTRUCTION — EMERGENCY. Untreated: acute kidney injury, hyperkalemia (K+ >6.5 = cardiac arrhythmia risk, K+ >8 = life-threatening), bladder rupture, death within 24–48h. Most common in young adult male cats, especially castrated males (narrow urethra). Cats with FLUTD (feline lower urinary tract disease): idiopathic cystitis most common cause in cats <10yr — stress-related; struvite uroliths; urethral plugs (matrix + mineral). Treatment includes pain management, enriched environment, dietary moisture. Dogs — dysuria: UTI (females most common, coliforms most frequent; diagnosis by urinalysis + urine culture), urolithiasis (struvite: more common in females; calcium oxalate: males, Miniature Schnauzers, Dachshunds, Bichons), prostate disease (intact male dogs), transitional cell carcinoma (Beagles, Scottish Terriers, Shetland Sheepdogs predisposed — hematuria + dysuria in older dogs).`,
  },
  {
    source: "Merck Veterinary Manual / Cornell Consultant",
    document_type: "symptom",
    species: "both",
    analyte: null,
    symptom_cluster: "endocrine",
    content: `Polyuria/polydipsia (PU/PD) — differential diagnosis: Dogs: diabetes mellitus (glucosuria, hyperglycemia >200), hyperadrenocorticism/Cushing's disease (elevated ALP ± cholesterol, pot-belly, bilateral alopecia, panting — ACTH stimulation or low-dose dex suppression test), CKD (isosthenuria, azotemia), psychogenic polydipsia, diabetes insipidus (central or nephrogenic, dilute urine USG <1.006), pyometra (intact female in diestrus with PU/PD — rule out with imaging), hypercalcemia (any cause), hepatic disease. Cats: hyperthyroidism (most common cause in cats >10yr), diabetes mellitus, CKD, pyometra. Always check urine specific gravity first: concentrated urine (USG >1.030) with PU/PD suggests pre-renal or endocrine cause; dilute urine (USG <1.020) suggests primary renal or endocrine polyuria.`,
  },
  {
    source: "Merck Veterinary Manual / Cornell Consultant",
    document_type: "symptom",
    species: "both",
    analyte: null,
    symptom_cluster: "neurological",
    content: `Neurological signs — differential diagnosis by presentation: Seizures: young-to-middle-age dogs = idiopathic epilepsy most common (genetic predisposition in Beagles, Border Collies, Golden/Labrador Retrievers, German Shepherds). Metabolic causes: hypoglycemia (Whipple's triad — check glucose immediately), hepatic encephalopathy (check NH3, bile acids), hypocalcemia (eclampsia in lactating dogs, hypoparathyroidism). Toxins: xylitol (severe hypoglycemia), organophosphates (muscarinic + nicotinic signs, miosis, hypersalivation), lead, metaldehyde, marijuana. Structural: brain tumor (older dogs, Boxers, Golden Retrievers particularly — often focal neurological signs), encephalitis, distemper. Vestibular syndrome: acute head tilt + nystagmus + ataxia without other CNS signs = idiopathic vestibular disease (excellent prognosis, resolves 2–4 weeks) vs. otitis interna (check ears, Horner's possible) vs. brain stem lesion (multiple CN signs, proprioceptive deficits). IVDD: acute paralysis/paresis in Dachshunds, Corgis, French Bulldogs, Beagles — graded I–V; Grade V (absent deep pain) requires emergency myelography/MRI and surgery.`,
  },
  {
    source: "Merck Veterinary Manual",
    document_type: "symptom",
    species: "both",
    analyte: null,
    symptom_cluster: "respiratory",
    content: `Respiratory signs — differential diagnosis: Dogs: infectious tracheobronchitis ("kennel cough"/CIRD — harsh dry cough, worse with tracheal palpation, good demeanor, group housing history; treat supportively), pneumonia (productive cough, fever, lethargy, crackles on auscultation — bacterial most common; radiographs to confirm), laryngeal paralysis (older large breeds especially Labradors — voice change, inspiratory stridor, exercise intolerance, cyanosis in heat), collapsing trachea (toy breeds — Yorkies, Pomeranians, Chihuahuas — honking cough, worse with excitement/pulling on leash), brachycephalic obstructive airway syndrome (Bulldogs, Frenchies, Pugs — stertor, exercise intolerance, regurgitation). Cats: feline asthma (young to middle-age, Siamese predisposed — wheezing, bronchoconstriction, may open-mouth breathe; diagnose by eosinophilic bronchoalveolar lavage, bronchial pattern on radiographs; treat with corticosteroids ± bronchodilators), pleural effusion (respiratory distress + muffled heart sounds + orthopnea — causes: FIP, lymphoma, chylothorax, CHF; thoracocentesis is diagnostic and therapeutic). Open-mouth breathing in cats is always abnormal — emergency evaluation.`,
  },
  {
    source: "Merck Veterinary Manual / Cornell Consultant",
    document_type: "symptom",
    species: "both",
    analyte: null,
    symptom_cluster: "skin",
    content: `Dermatological signs — differential diagnosis: Pruritus (itching): most common cause = flea allergy dermatitis (FAD — even one flea bite causes response in sensitized animals; distribution: dorsal lumbar, tail base, caudal thighs; diagnose by flea dirt, trial flea control). Atopic dermatitis: environmental allergens; distribution face, feet, ears, axillae, groin; seasonal initially then year-round; Goldens, Labs, Bulldogs, Westies, Boxers predisposed. Food allergy: non-seasonal pruritus; any distribution; elimination diet trial with novel protein for 8–12 weeks required for diagnosis. Sarcoptic mange: highly contagious; intense pruritus; pinnal-pedal reflex positive; diagnose by skin scraping (often negative — treat empirically). Malassezia dermatitis secondary to allergies (greasy skin, musty odor, hyperpigmentation). Alopecia: hypothyroidism (dogs — bilateral symmetric, non-pruritic, hyperpigmentation, tail alopecia "rat tail"), Cushing's (truncal alopecia sparing extremities, comedones, calcinosis cutis), Demodex (follicular casts, comedones — immune-compromised animals).`,
  },
  {
    source: "Merck Veterinary Manual",
    document_type: "symptom",
    species: "both",
    analyte: null,
    symptom_cluster: "cardiac",
    content: `Cardiac signs — differential diagnosis: Syncope (collapse/fainting): differentiate from seizure (consciousness retained, brief, positional, exertion-related vs. seizure = loss of consciousness, post-ictal phase, not exertion-dependent). Arrhythmia (Boxers/Dobermans — Holter for evaluation), vasovagal, severe cardiac disease. Cough in dogs with suspected heart disease: cardiac cough = soft, nocturnal, worse after exertion; pulmonary edema on radiograph; elevated BNP. Cavalier King Charles Spaniels: mitral valve disease nearly universal by age 10 — grade progression by auscultation, echocardiogram. Dobermans: dilated cardiomyopathy (DCM) — often silent until late; Holter + echo screening from age 3. Boxers: ARVC (arrhythmogenic right ventricular cardiomyopathy) — ventricular tachycardia, syncope. Cats with CHF: pleural effusion more common than pulmonary edema; HCM most common cause; Maine Coons, Ragdolls, British Shorthairs, Sphynx genetically predisposed; annual echocardiogram recommended for at-risk breeds.`,
  },

  // ── DRUG-LAB INTERACTIONS (FDA Animal AERS / eClinPath) ──────────────────
  {
    source: "FDA Animal & Veterinary AERS / eClinPath",
    document_type: "drug_interaction",
    species: "both",
    analyte: "ALT_ALP",
    symptom_cluster: null,
    content: `Drug-induced liver enzyme elevation: NSAIDs (carprofen, meloxicam, deracoxib, grapiprant): ALT elevation possible especially with long-term use or idiosyncratic reaction. Monitor ALT/ALP baseline and 2–4 weeks after starting, then every 6 months. Discontinue if ALT >3x upper limit without other cause. Phenobarbital: induces hepatic enzymes — expect ALP and ALT elevation (enzyme induction, not necessarily hepatotoxicity). Assess hepatic function with bile acids rather than ALT/ALP alone in treated epileptic dogs. Corticosteroids (prednisone, dexamethasone): dog-specific steroid-induced ALP isoenzyme causes marked ALP elevation (may reach 5–20x) — generally not clinically significant. Concurrent ALT elevation possible (steroid hepatopathy). Potassium bromide: can cause spuriously elevated chloride on ion-selective electrode analyzers — important artifact to recognize. Antifungals (ketoconazole, itraconazole, fluconazole): hepatotoxic potential — monitor ALT/ALP before treatment and every 30 days. Chemotherapy drugs (doxorubicin, vincristine, cyclophosphamide): bone marrow suppression — CBC with differential critical before each cycle; neutrophil nadir typically 7–10 days post-treatment.`,
  },
  {
    source: "FDA Animal & Veterinary AERS / eClinPath",
    document_type: "drug_interaction",
    species: "cat",
    analyte: "CBC",
    symptom_cluster: null,
    content: `Methimazole (feline hyperthyroidism treatment) drug-lab interactions: Facial pruritus, excoriations (immune-mediated — 2–3% of cats). Heinz body hemolytic anemia (oxidative damage to RBCs). Thrombocytopenia (immune-mediated platelet destruction). Granulocytopenia/agranulocytosis (rare but serious — fever + lethargy on methimazole = emergency CBC). Monitoring protocol: baseline CBC + chemistry before starting; recheck CBC + T4 + chemistry at 2 weeks, 4 weeks, then every 3–6 months. Discontinue and switch to alternative (carbimazole, radioactive iodine, thyroidectomy) if adverse CBC changes. Azathioprine: DO NOT use in cats (cats lack thiopurine methyltransferase — fatal bone marrow suppression). Propylene glycol: found in some foods/medications — causes Heinz body anemia in cats — avoid.`,
  },

  // ── WSAVA / AVMA GUIDELINES ───────────────────────────────────────────────
  {
    source: "WSAVA / AVMA Clinical Guidelines",
    document_type: "guideline",
    species: "both",
    analyte: null,
    symptom_cluster: null,
    content: `WSAVA preventive healthcare guidelines: Annual wellness exam recommended for all dogs and cats. Senior pets (dogs >7yr small/medium, >5yr large/giant breeds; cats >10yr): biannual exam + CBC, chemistry panel, urinalysis, T4 (cats) at minimum. Vaccination core: dogs — DA2PP (distemper, adenovirus, parvovirus, parainfluenza) + rabies; 3-year intervals after completion of initial puppy series and first adult booster. Cats — FVRCP (panleukopenia, herpesvirus, calicivirus) + rabies; 3-year intervals. Non-core vaccines based on lifestyle risk: Leptospirosis (dogs in endemic/outdoor areas — annual), Bordetella (dogs with social exposure — annually or q6m), Lyme (dogs in tick-endemic areas — annually), FeLV (cats with outdoor access — annually after kitten series). Dental disease: preventive home care (brushing) from puppyhood/kittenhood; professional cleaning under anesthesia when Grade 2+ disease (beyond reversible gingivitis). Affects 70%+ of pets over 3 years.`,
  },
  {
    source: "WSAVA / AVMA Clinical Guidelines",
    document_type: "guideline",
    species: "both",
    analyte: null,
    symptom_cluster: null,
    content: `CKD management guidelines (IRIS): IRIS staging drives dietary and medical management. Phosphorus restriction: begin at Stage 1 when SDMA ≥18 or suspected early CKD. Target phosphorus <4.5 mg/dL in Stage 1–2 cats. Protein restriction: moderate in Stage 3–4; avoid over-restriction (muscle wasting). Blood pressure: treat if systolic >160 mmHg persistently (amlodipine first-line in cats; enalapril/benazepril in dogs). Proteinuria: treat when UPC >0.4 cats, >0.5 dogs (ACE inhibitor or ARB). Anemia of CKD: darbepoetin or erythropoietin when HCT <20% in cats. Hydration: encourage water intake (wet food preferred in cats). Anti-nausea treatment (maropitant, ondansetron) for uremic signs. Potassium supplementation when hypokalemia identified (common in cats with CKD — exacerbates muscle weakness and renal function decline). Monitor body weight, BCS, muscle condition score every visit.`,
  },
  {
    source: "WSAVA / AVMA Clinical Guidelines",
    document_type: "guideline",
    species: "dog",
    analyte: null,
    symptom_cluster: null,
    content: `Canine hypothyroidism management (AVMA/WSAVA): Diagnosis confirmed by low T4 (<1.0 μg/dL) + elevated TSH (>0.6 ng/mL) + consistent clinical signs. Treatment: levothyroxine sodium 0.02 mg/kg q12h (every 12 hours preferred initially for stability, some dogs maintained on once daily). Generic levothyroxine: variable bioavailability — stay on same brand/formulation. Monitoring: recheck T4 4–6 hours post-pill at 4–6 weeks; target post-pill T4 in upper half of reference range (2.5–4.0 μg/dL). Adjust dose by 20–25% if below target. Clinical improvement expected within 4–8 weeks for metabolic signs; skin/coat changes 3–6 months. Concurrent hyperlipidemia typically resolves with treatment. At-risk breeds: Golden Retrievers, Dobermans, Boxers, Cocker Spaniels, Irish Setters — screen T4 annually in symptomatic older dogs of these breeds.`,
  },

  // ── HuggingFace Pet Health Symptoms Dataset patterns ─────────────────────
  {
    source: "HuggingFace Pet Health Symptoms Dataset / Merck Vet Manual",
    document_type: "symptom",
    species: "both",
    analyte: null,
    symptom_cluster: "GI",
    content: `Diarrhea classification and management: Small intestinal diarrhea — large volume, less frequent, no urgency or tenesmus, may have weight loss, melena (dark tarry stool from upper GI bleeding). Causes: dietary change, parasites (Giardia — zoonotic, diagnose by fecal PCR or antigen test; Roundworms, Hookworms), viral (parvovirus — young dogs), bacterial (Salmonella, Campylobacter), food intolerance/IBD. Large intestinal diarrhea — small frequent volumes, urgency, tenesmus, mucus, fresh blood (hematochezia), normal body weight usually maintained. Causes: colitis (stress, dietary, Tritrichomonas in cats, Histoplasma in endemic areas), polyps, cancer. Acute hemorrhagic diarrhea syndrome (AHDS) formerly HGE: acute bloody diarrhea + vomiting, PCV >55%, total protein normal — IV fluids mainstay, usually rapid recovery. Fecal exam including flotation + smear + antigen testing recommended for all diarrhea cases. Deworming trial (fenbendazole 50 mg/kg q24h × 3–5 days) appropriate even with negative fecal.`,
  },
  {
    source: "HuggingFace Pet Health Symptoms Dataset / Merck Vet Manual",
    document_type: "symptom",
    species: "both",
    analyte: null,
    symptom_cluster: "musculoskeletal",
    content: `Lameness and musculoskeletal signs — differential diagnosis: Acute lameness (non-weight-bearing): paw injury (laceration, broken nail, foreign body — check between toes), fracture, joint dislocation, acute cruciate ligament rupture (dogs — lateral palpation reveals drawer sign; Labradors, Rottweilers, Boxers at higher risk; obese dogs particularly susceptible). Gradual-onset lameness (weight-bearing): degenerative joint disease/osteoarthritis (most common cause of chronic lameness in older dogs — check hip, elbow, stifle, intervertebral discs), hip dysplasia (large breeds — bilateral, "bunny hopping" gait at exercise, coxofemoral laxity), patellar luxation (medial in small breeds, lateral in large breeds — grades I–IV, skipping gait). Bone pain in large/giant breed dogs >5 years: osteosarcoma first rule-out — distal radius, proximal humerus, distal femur, proximal tibia most common sites; aggressive bone lysis on radiograph. Panosteitis: young large breed dogs (5–12 months) — shifting leg lameness, bone pain on palpation; self-limiting.`,
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const embedKnowledgeUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/embed-knowledge`;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const res = await fetch(embedKnowledgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ chunks: CHUNKS, replace_all: true }),
    });

    const result = await res.json();
    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
