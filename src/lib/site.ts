export const SITE = "https://combustible.antoniohorrillo.com";
export const BASE = "";

export const SITE_NAME = "Combustible Extremadura";
export const SITE_TAGLINE = "Precio de la Gasolina 95 y Diésel en Extremadura Hoy (Badajoz y Cáceres)";
export const SITE_DESCRIPTION =
  "Precio diario actualizado a las 06:00h de Gasolina 95 E5 y Gasóleo A (Diésel) en Extremadura: comparativa hoy entre Badajoz y Cáceres, buscador de los 179 municipios, evolución histórica 2025-2026 y datos oficiales MITECO.";
export const SITE_KEYWORDS = [
  "precio combustible extremadura hoy",
  "precio gasolina 95 extremadura",
  "precio gasoleo a extremadura hoy",
  "gasolineras baratas badajoz hoy",
  "gasolineras baratas caceres hoy",
  "precio diesel merida plasencia don benito",
  "comparativa precio gasolina badajoz caceres",
  "evolucion precio carburantes extremadura 2025 2026",
  "api miteco carburantes extremadura"
];
export const AUTHOR_NAME = "Antonio Horrillo";
export const AUTHOR_URL = "https://antoniohorrillo.com";
export const GITHUB_URL = "https://github.com/antoniohh/CombustibleExtremadura";

export function withBase(path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${clean}` : "/";
}

export function absoluteUrl(path = ""): string {
  return new URL(withBase(path), SITE).href;
}
