# Registro de Sesión: Desarrollo y Lanzamiento de Combustible Extremadura v1.0.1

- **Fecha:** 2 de noviembre de 2026
- **Proyecto:** Combustible Extremadura (`combustible-extremadura`)
- **Versión de lanzamiento:** `v1.0.1`
- **Dominio de producción:** `https://combustible.antoniohorrillo.com/`
- **Repositorio oficial:** `https://github.com/antoniohh/CombustibleExtremadura`
- **Autor y Titular:** Antonio Horrillo ([antoniohorrillo.com](https://antoniohorrillo.com))
- **Licencia:** MIT

---

## 1. Contexto y Objetivos del Proyecto

Se ha diseñado y desarrollado **Combustible Extremadura**, una aplicación web estática (SPA) de alto rendimiento, transparencia de datos abiertos y optimización SEO exhaustiva alojada en el subdominio `https://combustible.antoniohorrillo.com/`, siguiendo la arquitectura estática y flujo de publicación con GitHub Pages y releases empaquetadas de **GlucoLuna**.

### Objetivos clave alcanzados:
1. **Monitorización diaria automatizada (06:00 AM):** Captura diaria de las **422 estaciones de servicio** de Extremadura desde la API REST del MITECO (`FiltroCCAA/11`) mediante GitHub Actions para ofrecer a primera hora de la mañana los precios vigentes de **Gasolina 95 E5** y **Gasóleo A (Diésel)**.
2. **Cobertura territorial completa:** Desglose autonómico, comparativa provincial **Badajoz vs. Cáceres**, tabla en vivo de las **16 principales localidades** y buscador interactivo de los **179 municipios** con estación de servicio en Extremadura.
3. **Serie histórica consolidada (2025–2026):** Más de **630 días** de registros diarios procesados con 4 gráficos interactivos en Chart.js, récords históricos y tabla mensual.
4. **Utilidad práctica para el conductor extremeño:** Calculadora interactiva de ahorro anual y guía detallada sobre logística de Exolum (Mérida y Badajoz), autovías A-5 y A-66, frontera con Portugal y cooperativas agrarias.
5. **Privacidad (RGPD / AEPD) y SEO técnico:** Google Consent Mode v2 con bloqueo analítico por defecto, página `/cookies/`, marcado estructurado Schema.org (`WebSite`, `WebPage`, `Dataset`, `ItemList`, `FAQPage`), `CNAME`, `sitemap.xml` y `robots.txt`.

---

## 2. Pila Tecnológica

- **Framework:** Astro 7.4.2 (`output: "static"`, `trailingSlash: "always"`).
- **Estilos:** Tailwind CSS 4.3.3 (`@tailwindcss/vite`) y sistema de diseño propio en `src/styles/base.css`.
- **Visualización de datos:** Chart.js 4.5.1.
- **Iconografía:** `@lucide/astro` 1.62.0 y activos vectoriales SVG a medida.
- **Tipado:** TypeScript 5.9.3 en modo estricto.
- **Entorno Node.js:** `>= 22.23.4` (fijado en `.nvmrc`).
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml` y `.github/workflows/release.yml`).

---

## 3. Arquitectura del Proyecto

```text
CombustibleExtremadura/
├── .github/
│   └── workflows/
│       ├── deploy.yml                             # Actualización diaria 06:00 AM y despliegue en GitHub Pages
│       └── release.yml                            # Generación automática de release y ZIP en etiquetas v*
├── docs/
│   ├── guia-api-miteco.md                         # Documentación técnica de los endpoints MITECO
│   └── sesion-desarrollo.md                       # Registro técnico del desarrollo y lanzamiento v1.0.0
├── public/
│   ├── assets/
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.svg
│   │   ├── logo.svg
│   │   ├── og-image.png
│   │   └── og-image.svg
│   ├── datos/
│   │   ├── hoy_extremadura.json                   # Precios del día actual (422 EESS, 179 municipios)
│   │   ├── historico_extremadura_2026.json        # Serie histórica diaria Extremadura 2025-2026
│   │   └── historico_provincias_extremadura_2026.json
│   ├── .nojekyll
│   ├── CNAME                                      # Dominio personalizado: combustible.antoniohorrillo.com
│   ├── favicon.ico
│   ├── robots.txt
│   ├── site.webmanifest
│   └── sitemap.xml
├── release/                                       # Paquete ZIP y notas de la release v1.0.0 (ignorado en git)
│   ├── RELEASE_NOTES_v1.0.0.md
│   ├── combustible-extremadura-v1.0.0.zip
│   └── combustible-extremadura-v1.0.0.zip.sha256
├── scripts/
│   ├── actualizar_precios_hoy.mjs                 # Captura diaria de las 422 EESS de Extremadura
│   ├── actualizar_historico_mes.mjs               # Actualización incremental mensual del histórico
│   ├── extractor_extremadura.mjs
│   ├── extractor_extremadura_2025.mjs
│   ├── extractor_caceres_badajoz.mjs
│   └── extractor_caceres_badajoz_2025.mjs
├── src/
│   ├── components/
│   │   ├── CookieBanner.astro                     # Banner y modal RGPD con Google Consent Mode v2
│   │   ├── Footer.astro
│   │   └── Header.astro
│   ├── data/
│   │   ├── hoy_extremadura.json
│   │   ├── historico_extremadura_2026.json
│   │   ├── historico_provincias_extremadura_2026.json
│   │   └── precios.ts                             # Modelos, agregaciones, récords y FAQs dinámicas
│   ├── layouts/
│   │   └── BaseLayout.astro                       # Metaetiquetas SEO, Open Graph, Consent Mode y JSON-LD
│   ├── lib/
│   │   └── site.ts                                # Configuración canónica de combustible.antoniohorrillo.com
│   ├── pages/
│   │   ├── cookies.astro                          # Política de cookies y privacidad (/cookies/)
│   │   └── index.astro                            # SPA principal en 7 secciones
│   ├── scripts/
│   │   └── spa.ts                                 # Buscador de 179 municipios, 4 gráficos Chart.js y calculadora
│   └── styles/
│       ├── base.css
│       └── global.css
├── .gitignore
├── .nvmrc
├── AGENTS.md
├── CHANGELOG.md
├── LICENSE
├── README.md
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 4. Secciones de la Aplicación (`src/pages/index.astro` y `src/pages/cookies.astro`)

1. **Precio del Combustible Hoy y 16 Principales Localidades (`#precios-hoy`):**
   - Tarjetas en vivo de Gasolina 95 E5 y Gasóleo A con media autonómica, coste de depósito de 50L, surtidor más barato y más caro de Extremadura hoy, diferencial diésel-gasolina y tabla de las 16 localidades más pobladas.
2. **Comparativa Hoy: Badajoz vs. Cáceres (`#comparativa-provincias`):**
   - Medias provinciales del día, brecha por litro y por depósito de 50L, porcentaje de estaciones económicas y top 5 de gasolineras más baratas hoy en cada provincia.
3. **Explorador Interactivo de los 179 Municipios (`#todas-las-poblaciones`):**
   - Buscador instantáneo por nombre o código postal, filtro provincial, filtro por letra inicial (A–Z), ordenación por precio y desplegable con todas las estaciones de cada municipio.
4. **Evolución Histórica 2025 y 2026 (`#historico`):**
   - 4 gráficos interactivos en Chart.js (curva diaria con filtros de año y provincia, comparativa Badajoz vs. Cáceres, prima histórica del diésel e histograma mensual), tarjetas de récords y tabla mensual consolidada.
5. **Guía Práctica de Ahorro y Calculadora (`#guia-ahorro`):**
   - Calculadora interactiva de repostaje y ahorro anual, trazabilidad de Exolum en Mérida y Badajoz, análisis de autovías A-5/A-66, frontera con Portugal y cooperativas agrarias.
6. **Preguntas Frecuentes Dinámicas (`#preguntas-frecuentes`):**
   - 8 preguntas frecuentes alimentadas dinámicamente con los precios y estaciones más baratas del día e inyectadas en Schema.org `FAQPage`.
7. **Documentación de la API Oficial del MITECO (`#api-miteco`):**
   - Endpoints REST públicos y ejemplos de uso con los scripts del repositorio.
8. **Política de Cookies y Privacidad (`/cookies/`):**
   - Detalle de almacenamiento técnico (`combustible_extremadura_cookie_consent`) y analítico opcional (`_ga`, `_ga_YSZC0MQCHF`), con gestión de consentimiento en cualquier momento.

---

## 5. Preparación de la Release `v1.0.1` y Despliegue

- Se ha establecido la versión `1.0.1` en `package.json`, `package-lock.json`, `CHANGELOG.md` y `README.md`.
- Se ha incorporado `AGENTS.md` con las directrices operativas del proyecto y la regla estricta de no crear etiquetas Git locales (`git tag`).
- Se ha añadido `public/CNAME` con el dominio `combustible.antoniohorrillo.com` y `public/.nojekyll`.
- Se ha compilado el proyecto verificando la generación de `dist/index.html`, `dist/cookies/index.html`, `dist/CNAME`, `dist/.nojekyll` y `dist/datos/*.json`.
- Se ha generado el paquete distribuible `release/combustible-extremadura-v1.0.1.zip` junto con su suma de verificación `release/combustible-extremadura-v1.0.1.zip.sha256` y las notas de lanzamiento `release/RELEASE_NOTES_v1.0.1.md`.
