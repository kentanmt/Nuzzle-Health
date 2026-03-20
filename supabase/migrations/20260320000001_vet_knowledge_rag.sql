-- Enable pgvector extension
create extension if not exists vector;

-- Vet knowledge base for RAG
create table if not exists vet_knowledge (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  source text not null,
  document_type text not null, -- 'lab_reference' | 'symptom' | 'drug_interaction' | 'guideline' | 'pre_analytical'
  species text default 'both',  -- 'dog' | 'cat' | 'both'
  analyte text,                 -- e.g. 'ALT', 'creatinine', 'WBC'
  symptom_cluster text,         -- e.g. 'GI', 'respiratory', 'neurological'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- IVFFlat index for fast cosine similarity search
create index if not exists vet_knowledge_embedding_idx
  on vet_knowledge using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Similarity search function
create or replace function match_vet_knowledge(
  query_embedding vector(1536),
  match_count int default 6,
  filter_species text default null,
  filter_document_type text default null
)
returns table (
  id uuid,
  content text,
  source text,
  document_type text,
  species text,
  analyte text,
  symptom_cluster text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    vk.id,
    vk.content,
    vk.source,
    vk.document_type,
    vk.species,
    vk.analyte,
    vk.symptom_cluster,
    1 - (vk.embedding <=> query_embedding) as similarity
  from vet_knowledge vk
  where
    (filter_species is null or vk.species = filter_species or vk.species = 'both')
    and (filter_document_type is null or vk.document_type = filter_document_type)
    and vk.embedding is not null
  order by vk.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RLS: knowledge base is public read, service-role write only
alter table vet_knowledge enable row level security;
create policy "Public read vet knowledge" on vet_knowledge for select using (true);
create policy "Service role insert vet knowledge" on vet_knowledge for insert with check (true);
create policy "Service role delete vet knowledge" on vet_knowledge for delete using (true);
