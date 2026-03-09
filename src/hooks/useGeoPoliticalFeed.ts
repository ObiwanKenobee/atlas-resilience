import { useState, useEffect, useRef } from "react";

export interface GeoRiskEvent {
  id: string;
  title: string;
  cityId: string;
  city: string;
  sector: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  url?: string;
  publishedAt: Date;
}

// ─── Keyword → city mapping ───────────────────────────────────────────────────
const CITY_KEYWORDS: { cityId: string; city: string; keywords: string[] }[] = [
  { cityId: "lagos",    city: "Lagos",     keywords: ["lagos", "nigeria", "west africa"] },
  { cityId: "nairobi",  city: "Nairobi",   keywords: ["nairobi", "kenya", "east africa"] },
  { cityId: "cairo",    city: "Cairo",     keywords: ["cairo", "egypt", "nile", "north africa"] },
  { cityId: "mumbai",   city: "Mumbai",    keywords: ["mumbai", "india", "bombay", "south asia"] },
  { cityId: "saopaulo", city: "São Paulo", keywords: ["são paulo", "sao paulo", "brazil", "amazon"] },
  { cityId: "jakarta",  city: "Jakarta",   keywords: ["jakarta", "indonesia", "java"] },
  { cityId: "dhaka",    city: "Dhaka",     keywords: ["dhaka", "bangladesh", "ganges", "brahmaputra"] },
  { cityId: "karachi",  city: "Karachi",   keywords: ["karachi", "pakistan", "sindh", "indus"] },
  { cityId: "kinshasa", city: "Kinshasa",  keywords: ["kinshasa", "congo", "drc", "central africa"] },
  { cityId: "bogota",   city: "Bogotá",    keywords: ["bogotá", "bogota", "colombia", "andes"] },
  { cityId: "manila",   city: "Manila",    keywords: ["manila", "philippines", "luzon", "typhoon"] },
  { cityId: "accra",    city: "Accra",     keywords: ["accra", "ghana", "volta", "kumasi"] },
];

const SECTOR_KEYWORDS: { sector: string; keywords: string[] }[] = [
  { sector: "Water",          keywords: ["water", "flood", "drought", "rain", "river", "reservoir", "groundwater"] },
  { sector: "Energy",         keywords: ["energy", "power", "electricity", "grid", "fuel", "oil", "solar"] },
  { sector: "Food",           keywords: ["food", "hunger", "famine", "crop", "harvest", "grain", "wheat"] },
  { sector: "Finance",        keywords: ["economic", "financial", "currency", "debt", "inflation", "market"] },
  { sector: "Health",         keywords: ["health", "disease", "epidemic", "hospital", "malaria", "outbreak"] },
  { sector: "Infrastructure", keywords: ["infrastructure", "road", "bridge", "housing", "displacement", "refugee"] },
  { sector: "Ecosystem",      keywords: ["climate", "ecosystem", "environment", "fire", "deforestation"] },
];

const SEVERITY_KEYWORDS: { severity: GeoRiskEvent["severity"]; keywords: string[] }[] = [
  { severity: "critical", keywords: ["critical", "emergency", "crisis", "severe", "catastrophe", "collapse", "imminent"] },
  { severity: "high",     keywords: ["warning", "alert", "escalat", "significant", "major", "deadly"] },
  { severity: "medium",   keywords: ["concern", "moderate", "risk", "monitor", "rising", "growing"] },
  { severity: "low",      keywords: ["minor", "low", "stable", "recovery", "improving"] },
];

function classifyTitle(title: string): {
  cityId: string;
  city: string;
  sector: string;
  severity: GeoRiskEvent["severity"];
} {
  const lower = title.toLowerCase();

  const matched = CITY_KEYWORDS.find((c) =>
    c.keywords.some((kw) => lower.includes(kw))
  );
  const cityId = matched?.cityId ?? "lagos";
  const city   = matched?.city   ?? "Lagos";

  const sectorMatch = SECTOR_KEYWORDS.find((s) =>
    s.keywords.some((kw) => lower.includes(kw))
  );
  const sector = sectorMatch?.sector ?? "Infrastructure";

  const sevMatch = SEVERITY_KEYWORDS.find((s) =>
    s.keywords.some((kw) => lower.includes(kw))
  );
  const severity = sevMatch?.severity ?? "medium";

  return { cityId, city, sector, severity };
}

// ─── ReliefWeb API (public, no key required) ─────────────────────────────────
async function fetchReliefWeb(): Promise<GeoRiskEvent[]> {
  const CITIES = ["lagos", "nairobi", "cairo", "mumbai", "jakarta", "brazil",
                  "dhaka", "karachi", "kinshasa", "bogota", "manila", "accra", "ghana"];
  const query = CITIES.map((c) => `"${c}"`).join(" OR ");

  const res = await fetch(
    "https://api.reliefweb.int/v1/reports?appname=atlas-dashboard&limit=10&sort[]=date:desc&filter[field]=headline&fields[include][]=title&fields[include][]=date&fields[include][]=url_alias",
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!res.ok) throw new Error("ReliefWeb fetch failed");
  const json = await res.json();

  return (json.data ?? []).map((item: { id: string; fields: { title?: string; date?: { original?: string }; url_alias?: string } }) => {
    const title = item.fields?.title ?? "Humanitarian update";
    const { cityId, city, sector, severity } = classifyTitle(title);
    return {
      id: `rw-${item.id}`,
      title,
      cityId,
      city,
      sector,
      severity,
      source: "ReliefWeb",
      url: item.fields?.url_alias ? `https://reliefweb.int${item.fields.url_alias}` : undefined,
      publishedAt: new Date(item.fields?.date?.original ?? Date.now()),
    } as GeoRiskEvent;
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGeoPoliticalFeed(enabled = true) {
  const [events, setEvents] = useState<GeoRiskEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReliefWeb();
      if (mountedRef.current) {
        setEvents(data);
        setLastFetch(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError("Live feed unavailable");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return;
    refresh();
    const interval = setInterval(refresh, 5 * 60 * 1000); // refresh every 5 min
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { events, loading, error, lastFetch, refresh };
}
