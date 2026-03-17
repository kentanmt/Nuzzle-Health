import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode, urgencyLevel } = await req.json();

    if (!zipCode || typeof zipCode !== "string" || !/^\d{5}$/.test(zipCode.trim())) {
      return new Response(JSON.stringify({ vets: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Geocode zip code using Nominatim
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zipCode.trim()}&country=US&format=json&limit=1`,
      { headers: { "User-Agent": "NuzzleHealth/1.0" } }
    );

    if (!geoRes.ok) {
      console.error("Nominatim error:", geoRes.status);
      return new Response(JSON.stringify({ vets: [], error: "Location lookup failed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let geoData: NominatimResult[];
    try {
      geoData = await geoRes.json();
    } catch {
      return new Response(JSON.stringify({ vets: [], error: "Location lookup failed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!geoData.length) {
      return new Response(JSON.stringify({ vets: [], error: "Could not locate zip code" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // Step 2: Search for veterinary clinics within 15 miles (~24km)
    const radiusMeters = 24000;
    const isEmergency = urgencyLevel === "emergency" || urgencyLevel === "vet-soon";

    // Query for veterinary clinics; try to find emergency ones first for urgent cases
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});
        way["amenity"="veterinary"](around:${radiusMeters},${lat},${lon});
        node["healthcare"="veterinary"](around:${radiusMeters},${lat},${lon});
        way["healthcare"="veterinary"](around:${radiusMeters},${lat},${lon});
      );
      out center body;
    `;

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "NuzzleHealth/1.0" },
    });

    if (!overpassRes.ok) {
      const errorText = await overpassRes.text();
      console.error("Overpass API error:", overpassRes.status, errorText.substring(0, 200));
      return new Response(JSON.stringify({ vets: [], error: "Vet search temporarily unavailable" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const overpassText = await overpassRes.text();
    let overpassData;
    try {
      overpassData = JSON.parse(overpassText);
    } catch {
      console.error("Overpass returned non-JSON:", overpassText.substring(0, 200));
      return new Response(JSON.stringify({ vets: [], error: "Vet search temporarily unavailable" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const elements: OverpassElement[] = overpassData.elements || [];

    // Process and sort by distance
    const vets = elements
      .map((el) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!elLat || !elLon) return null;

        const tags = el.tags || {};
        const name = tags.name || tags["name:en"] || "Veterinary Clinic";
        const dist = haversineDistance(lat, lon, elLat, elLon);

        // Determine type
        const nameLC = name.toLowerCase();
        const isEmergencyVet =
          nameLC.includes("emergency") ||
          nameLC.includes("er ") ||
          nameLC.includes("24") ||
          tags.emergency === "yes" ||
          tags.opening_hours === "24/7";

        const isUrgentCare = nameLC.includes("urgent");

        const type = isEmergencyVet ? "emergency" : isUrgentCare ? "urgent-care" : "general";

        // Build address
        const addr = [
          tags["addr:housenumber"],
          tags["addr:street"],
          tags["addr:city"],
          tags["addr:state"],
          tags["addr:postcode"],
        ].filter(Boolean).join(" ") || "";

        return {
          name,
          address: addr,
          phone: tags.phone || tags["contact:phone"] || "",
          distance: `${dist.toFixed(1)} mi`,
          distanceNum: dist,
          type,
          website: tags.website || tags["contact:website"] || "",
          openingHours: tags.opening_hours || "",
          lat: elLat,
          lon: elLon,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // For emergency, prioritize emergency vets
        if (isEmergency) {
          if (a!.type === "emergency" && b!.type !== "emergency") return -1;
          if (a!.type !== "emergency" && b!.type === "emergency") return 1;
        }
        return a!.distanceNum - b!.distanceNum;
      })
      .slice(0, 5)
      .map(({ distanceNum, ...rest }) => rest);

    return new Response(JSON.stringify({ vets }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("find-nearby-vets error:", e);
    return new Response(
      JSON.stringify({ vets: [], error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
