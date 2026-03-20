import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;

  try {
    const { chunks, replace_all } = await req.json();
    // chunks: Array<{ content, source, document_type, species?, analyte?, symptom_cluster?, metadata? }>

    if (replace_all) {
      await supabase.from("vet_knowledge").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    let inserted = 0;
    const errors: string[] = [];

    for (const chunk of chunks) {
      try {
        const embeddingRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "models/text-embedding-004",
              content: { parts: [{ text: chunk.content }] },
            }),
          }
        );

        if (!embeddingRes.ok) {
          const err = await embeddingRes.text();
          errors.push(`Embedding failed for chunk: ${err}`);
          continue;
        }

        const embeddingData = await embeddingRes.json();
        const embedding = embeddingData.embedding.values;

        const { error } = await supabase.from("vet_knowledge").insert({
          content: chunk.content,
          embedding,
          source: chunk.source,
          document_type: chunk.document_type,
          species: chunk.species || "both",
          analyte: chunk.analyte || null,
          symptom_cluster: chunk.symptom_cluster || null,
          metadata: chunk.metadata || {},
        });

        if (error) errors.push(error.message);
        else inserted++;
      } catch (e) {
        errors.push(e.message);
      }
    }

    return new Response(JSON.stringify({ inserted, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
