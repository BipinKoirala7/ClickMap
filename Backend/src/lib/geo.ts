import path from "node:path";
import maxmind, { type CityResponse, Reader } from "maxmind";

let reader: Reader<CityResponse> | null = null;

export async function initGeo(): Promise<void> {
  const dbPath = path.resolve(process.cwd(), "data/GeoLite2-City.mmdb");
  reader = await maxmind.open<CityResponse>(dbPath);
}

export function lookupGeo(ip: string | null | undefined) {
  if (!ip || !reader || !maxmind.validate(ip)) {
    return { country: null, city: null };
  }
  const res = reader.get(ip);
  return {
    country: res?.country?.iso_code ?? null, // e.g. "NP"
    city: res?.city?.names?.en ?? null,
  };
}
