# Changelog

Todas las versiones relevantes de **Combustible Extremadura**. El proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] — 2026-11-02

Primera release oficial de producción de **Combustible Extremadura** (`https://combustible.antoniohorrillo.com/`), portal estático para la consulta diaria e histórica del precio de la **Gasolina 95 E5** y el **Gasóleo A (Diésel)** en Badajoz, Cáceres y los 179 municipios con estación de servicio de Extremadura.

### Añadido

- **Panel en vivo de precios del día y principales localidades** ([`index.astro`](src/pages/index.astro), [`precios.ts`](src/data/precios.ts)):
  - Medias autonómicas diarias de Gasolina 95 E5 y Gasóleo A calculadas sobre las **422 estaciones de servicio** activas en Extremadura (API oficial MITECO `FiltroCCAA/11`).
  - Coste real de llenado de un depósito de 50 litros, diferencial diario entre diésel y gasolina, y estaciones con el precio mínimo y máximo del día en la región.
  - Tabla comparativa de las **16 principales localidades de Extremadura** (Badajoz, Cáceres, Mérida, Plasencia, Don Benito, Almendralejo, Villanueva de la Serena, Navalmoral de la Mata, Zafra, Montijo, Trujillo, Villafranca de los Barros, Miajadas, Coria, Olivenza y Jerez de los Caballeros) con estación más económica de cada municipio.
- **Comparativa provincial en tiempo real: Badajoz vs. Cáceres** ([`index.astro`](src/pages/index.astro)):
  - Medias provinciales del día (273 estaciones en Badajoz y 149 en Cáceres), ahorro directo en depósito de 50 litros y porcentaje de surtidores por debajo de la media regional.
  - Top 5 de gasolineras más baratas hoy en la provincia de Badajoz y en la provincia de Cáceres para ambos carburantes.
- **Explorador interactivo de los 179 municipios con gasolinera** ([`index.astro`](src/pages/index.astro), [`spa.ts`](src/scripts/spa.ts)):
  - Buscador en tiempo real por nombre de localidad o código postal.
  - Filtros combinables por provincia (Todas / Badajoz / Cáceres), índice alfabético de la A a la Z y ordenación dinámica (alfabética, Gasolina 95 más barata, Diésel más barato o mayor número de estaciones).
  - Desplegable detallado en cada municipio con todas sus estaciones de servicio, rótulo, dirección, código postal, horario y precios individuales.
- **Serie histórica completa 2025–2026 y visualización con Chart.js 4.5** ([`spa.ts`](src/scripts/spa.ts), `public/datos/`):
  - Consolidación de más de **630 jornadas diarias** (desde el 1 de enero de 2025) en `historico_extremadura_2026.json` y `historico_provincias_extremadura_2026.json`.
  - **4 gráficos interactivos**:
    1. Evolución diaria con selectores por periodo (`Todo 2025-2026`, `Año 2026`, `Año 2025`, `Últimos 90 días`) y ámbito territorial (`Extremadura`, `Badajoz`, `Cáceres`).
    2. Comparativa histórica provincial Badajoz vs. Cáceres.
    3. Evolución de la brecha o prima del Gasóleo A frente a la Gasolina 95 E5.
    4. Histograma de medias mensuales consolidadas.
  - Tarjetas de récords históricos (mínimos y máximos absolutos de la serie) y tabla resumen mensual.
- **Guía práctica de ahorro y calculadora interactiva de repostaje** ([`index.astro`](src/pages/index.astro), [`spa.ts`](src/scripts/spa.ts)):
  - Calculadora interactiva según litros del depósito, repostajes mensuales y tipo de carburante, comparando la gasolinera más barata, la media regional y la más cara.
  - Análisis técnico sobre calidad de combustibles y logística de **Exolum** (plantas de Mérida y Badajoz), recargos en autovías **A-5** y **A-66**, comparativa fiscal con la **frontera de Portugal** (Elvas, Campo Maior, Marvão, Termas de Monfortinho) y el papel de las **cooperativas agrarias** en Extremadura.
- **Automatización de datos y scripts de extracción MITECO** (`scripts/`):
  - [`actualizar_precios_hoy.mjs`](scripts/actualizar_precios_hoy.mjs): descarga diaria de las 422 EESS de Extremadura y generación de `hoy_extremadura.json`.
  - [`actualizar_historico_mes.mjs`](scripts/actualizar_historico_mes.mjs): actualización incremental por rango de fechas o mes vencido sobre los JSON históricos.
  - Extractores históricos completos para 2025 y 2026 (`extractor_extremadura*.mjs` y `extractor_caceres_badajoz*.mjs`).
- **Privacidad, RGPD y Google Consent Mode v2** ([`BaseLayout.astro`](src/layouts/BaseLayout.astro), [`CookieBanner.astro`](src/components/CookieBanner.astro), [`cookies.astro`](src/pages/cookies.astro)):
  - Integración de Google Analytics 4 (`G-YSZC0MQCHF`) con bloqueo analítico por defecto (`analytics_storage: 'denied'`) e IP anonimizada.
  - Banner flotante accesible y modal de configuración de preferencias con persistencia en `localStorage` (`combustible_extremadura_cookie_consent`).
  - Página dedicada de **Política de Cookies y Privacidad** (`/cookies/`).
- **SEO técnico, activos de marca y despliegue continuo**:
  - Dominio personalizado configurado en `public/CNAME` (`combustible.antoniohorrillo.com`) y `public/.nojekyll`.
  - Marcado estructurado JSON-LD Schema.org (`WebSite`, `WebPage`, `Dataset`, `ItemList` y `FAQPage` dinámica).
  - Activos vectoriales y Open Graph (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `logo.svg`, `og-image.png`, `robots.txt`, `sitemap.xml` y `site.webmanifest`).
  - Workflows de GitHub Actions: actualización y despliegue diario a las 06:00 AM (`.github/workflows/deploy.yml`) y empaquetado automático de releases (`.github/workflows/release.yml`).
