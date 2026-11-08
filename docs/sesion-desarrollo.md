# Registro de Sesión: Desarrollo, Identidad Visual y Releases de Combustible Extremadura (`v1.0.0` → `v1.2.0`)

- **Fecha de la sesión:** 2 y 3 de noviembre de 2026
- **Proyecto:** Combustible Extremadura (`combustible-extremadura`)
- **Versión vigente al cierre:** `v1.2.0`
- **Dominio de producción:** `https://combustible.antoniohorrillo.com/`
- **Repositorio oficial:** `https://github.com/antoniohh/CombustibleExtremadura`
- **Autor y Titular:** Antonio Horrillo ([antoniohorrillo.com](https://antoniohorrillo.com))
- **Licencia:** MIT

---

## 1. Contexto y Objetivos del Proyecto

Se ha diseñado, desarrollado y desplegado en producción **Combustible Extremadura**, una aplicación web estática (SPA) de alto rendimiento, transparencia de datos abiertos y optimización SEO exhaustiva alojada en el subdominio `https://combustible.antoniohorrillo.com/`, siguiendo la arquitectura estática en Astro 7 y el flujo de publicación automatizada en GitHub Pages de **GlucoLuna**.

### Objetivos clave alcanzados:
1. **Monitorización diaria automatizada (06:00 AM):** Captura diaria de las **422 estaciones de servicio** de Extremadura desde la API REST del MITECO (`FiltroCCAA/11`) mediante GitHub Actions para publicar cada mañana los precios vigentes de **Gasolina 95 E5** y **Gasóleo A (Diésel)**.
2. **Cobertura territorial completa y foco en las dos capitales:**
   - Medias autonómicas y Top 5 general de Extremadura.
   - Dos paneles destacados en portada para las dos capitales de provincia: **Badajoz Capital · Top 5 Hoy** (`41 EESS`) y **Cáceres Capital · Top 5 Hoy** (`15 EESS`), con precios medios/mínimos y selector interactivo Diésel / Gasolina 95.
   - Tabla en vivo de las **16 principales localidades extremeñas**, comparativa provincial **Badajoz vs. Cáceres** y buscador interactivo de los **179 municipios** con estación de servicio.
3. **Serie histórica consolidada (2025–2026):** Más de **630 días** de registros diarios procesados con 4 gráficos interactivos en Chart.js, récords históricos y tabla mensual.
4. **Utilidad práctica para el conductor extremeño:** Calculadora interactiva de ahorro anual y guía detallada sobre logística de Exolum (Mérida y Badajoz), autovías A-5 y A-66, frontera con Portugal y cooperativas agrarias.
5. **Identidad visual con Nano Banana, Privacidad (RGPD / AEPD) y SEO técnico:**
   - Nuevas creatividades de marca, icono/favicon (`icon-512.png`, `icon-192.png`, `apple-touch-icon.png`, `favicon.ico`, `favicon.svg`, `logo.svg`) y tarjeta social Open Graph (`og-image.png`, `1200×630` px) generadas con **Nano Banana**.
   - Google Consent Mode v2 con bloqueo analítico por defecto, página `/cookies/`, marcado estructurado Schema.org (`WebSite`, `WebPage`, `Dataset`, `ItemList`, `FAQPage`), `CNAME`, `sitemap.xml` y `robots.txt`.

---

## 2. Pila Tecnológica

- **Framework:** Astro 7.4.2 (`output: "static"`, `trailingSlash: "always"`).
- **Estilos:** Tailwind CSS 4.3.3 (`@tailwindcss/vite`) y sistema de diseño propio en `src/styles/base.css`.
- **Visualización de datos:** Chart.js 4.5.1.
- **Iconografía y Marca:** `@lucide/astro` 1.62.0, activos vectoriales SVG y creatividades de alta resolución generadas con **Nano Banana**.
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
│   └── sesion-desarrollo.md                       # Registro completo de la sesión de desarrollo y releases
├── public/
│   ├── assets/
│   │   ├── apple-touch-icon.png                   # Icono iOS 180x180 (Nano Banana)
│   │   ├── favicon.svg                            # Isotipo vectorial SVG
│   │   ├── icon-192.png                           # Icono PWA / Cabecera 192x192 (Nano Banana)
│   │   ├── icon-512.png                           # Icono PWA 512x512 (Nano Banana)
│   │   ├── logo.svg                               # Logotipo horizontal vectorial
│   │   └── og-image.png                           # Creatividad Open Graph 1200x630 (Nano Banana)
│   ├── datos/
│   │   ├── hoy_extremadura.json                   # Precios del día actual (422 EESS, 179 municipios)
│   │   ├── historico_extremadura_2026.json        # Serie histórica diaria Extremadura 2025-2026
│   │   └── historico_provincias_extremadura_2026.json
│   ├── .nojekyll
│   ├── CNAME                                      # Dominio personalizado: combustible.antoniohorrillo.com
│   ├── favicon.ico                                # Favicon multirresolución 16/32/48/64 px
│   ├── robots.txt
│   ├── site.webmanifest
│   └── sitemap.xml
├── release/                                       # Paquetes ZIP y notas de release (ignorado en git)
│   ├── RELEASE_NOTES_v1.0.0.md
│   ├── RELEASE_NOTES_v1.0.1.md
│   ├── RELEASE_NOTES_v1.1.0.md
│   ├── combustible-extremadura-v1.0.0.zip
│   ├── combustible-extremadura-v1.0.0.zip.sha256
│   ├── combustible-extremadura-v1.0.1.zip
│   ├── combustible-extremadura-v1.0.1.zip.sha256
│   ├── combustible-extremadura-v1.1.0.zip
│   └── combustible-extremadura-v1.1.0.zip.sha256
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
│   │   └── spa.ts                                 # Buscador de 179 municipios, pestañas Top 5, Chart.js y calculadora
│   └── styles/
│       ├── base.css
│       └── global.css
├── .gitignore
├── .nvmrc
├── AGENTS.md                                      # Directrices operativas (prohibición de crear tags locales)
├── CHANGELOG.md
├── LICENSE
├── README.md
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 4. Secciones de la Aplicación (`src/pages/index.astro` y `src/pages/cookies.astro`)

1. **Precio del Combustible Hoy, Top 5 en Capitales y 16 Principales Localidades (`#precios-hoy`):**
   - Tres tarjetas superiores en vivo: **Gasolina 95 E5 · Hoy**, **Gasóleo A (Diésel) · Hoy** y **Top 5 Más Baratas Hoy en Extremadura**.
   - Dos cajas específicas justo debajo para las dos capitales de provincia:
     - **Badajoz Capital · Top 5 Hoy (`41 EESS`):** media y mínimo de Gasolina 95 (`1,752 €/L` / mín `1,690 €`) y Gasóleo A (`1,907 €/L` / mín `1,790 €`), Top 5 interactivo (`Diésel` / `Gasolina 95`), coste de 50L y botón directo a las 41 EESS.
     - **Cáceres Capital · Top 5 Hoy (`15 EESS`):** media y mínimo de Gasolina 95 (`1,738 €/L` / mín `1,689 €`) y Gasóleo A (`1,969 €/L` / mín `1,848 €`), Top 5 interactivo (`Diésel` / `Gasolina 95`), coste de 50L y botón directo a las 15 EESS.
   - Tabla en vivo de las **16 principales localidades de Extremadura**.
2. **Comparativa Hoy: Badajoz vs. Cáceres (`#comparativa-provincias`):**
   - Medias provinciales del día (273 EESS en Badajoz y 149 en Cáceres), brecha por litro y por depósito de 50L, porcentaje de estaciones bajo la media regional y tablas cara a cara con las 5 gasolineras más baratas de cada provincia.
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

## 5. Cronología de Releases Publicadas en la Sesión

### 5.1. Release `v1.0.0` (`6d8ec5c`)
- Configuración del dominio personalizado `combustible.antoniohorrillo.com` (`public/CNAME` y `public/.nojekyll`), `.nvmrc` (`22.23.4`) y workflows `deploy.yml` y `release.yml`.
- Creación de `CHANGELOG.md`, actualización de `README.md` y generación del paquete `release/combustible-extremadura-v1.0.0.zip`.

### 5.2. Release `v1.0.1` (`40e3819`)
- Incorporación de **`AGENTS.md`** en la raíz del proyecto con la regla permanente de **no crear etiquetas Git (`git tag`) localmente** para que el usuario gestione los tags y releases directamente desde su cliente de GitHub.
- Generación del paquete `release/combustible-extremadura-v1.0.1.zip` y publicación de la primera release automática en GitHub Actions al subir el tag `v1.0.1`.

### 5.3. Release `v1.1.0` (`2b2eb37`)
- Generación con **Nano Banana** e integración de las nuevas creatividades de marca:
  - Tarjeta social Open Graph `public/assets/og-image.png` (`1200×630` px) con mapa provincial de Extremadura, curvas luminosas de precios e indicador MITECO.
  - Familia de iconos `icon-512.png`, `icon-192.png`, `apple-touch-icon.png`, `favicon.ico`, `favicon.svg` y `logo.svg`.
- Creación de las dos cajas destacadas en portada para **Badajoz Capital · Top 5 Hoy** (`41 EESS`) y **Cáceres Capital · Top 5 Hoy** (`15 EESS`) justo encima de la tabla de las 16 principales localidades.
- Empaquetado final en `release/combustible-extremadura-v1.1.0.zip` (`SHA256: 833fce3d40161484bade4fc283a5433b50d2424a6a9dcb199b8135f79e95626f`) y `release/RELEASE_NOTES_v1.1.0.md`.

### 5.4. Release `v1.2.0`
- **Simplificación y desaturación visual de la interfaz:**
  - Banners de cotización media diaria compactos para `Gasolina 95 E5` y `Gasóleo A (Diésel)` sustituyendo a las tres cajas voluminosas de apertura.
  - Veredicto territorial directo en el bloque comparativo de Badajoz vs. Cáceres con duelo cara a cara en dos columnas limpias.
  - Retirada de la sección `#api-miteco` y sus enlaces en navegación y pie de página.
  - Retirada de los artículos teóricos de la guía práctica para dejar el protagonismo exclusivo a la calculadora de repostaje.
  - Retirada de los gráficos secundarios y tabla mensual consolidada en el bloque histórico, conservando el gráfico de evolución diaria interactivo y el histograma de medias mensuales.
  - Depuración de preguntas frecuentes secundarias y limpieza de código JS cliente huérfano en `spa.ts`.
  - Nueva barra inferior del footer: `© 2026 Combustible Extremadura · Creado por Antonio Horrillo` con distintivo de actualización diaria a las 06:00 h.
  - Soporte e invitación nativa para instalar la aplicación en Chrome móvil mediante Service Worker y prompt PWA.
- Empaquetado final en `release/combustible-extremadura-v1.2.0.zip` (`SHA256: 8a2c0dcbfac8f754e46f3e276504e8a11569e47c37cc322d43bc4d6a5d3442a0`) y `release/RELEASE_NOTES_v1.2.0.md`.

### 5.5. Release `v1.2.1`
- Implementación de Google Consent Mode v2 delimitado por región (bloqueo estricto por defecto en los 30 territorios del EEE, Reino Unido y Suiza).
- Cuarteto completo de señales (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) en el banner de cookies y documentación técnica en `/cookies/`.
- Empaquetado final en `release/combustible-extremadura-v1.2.1.zip` y `release/RELEASE_NOTES_v1.2.1.md`.

### 5.6. Release `v1.2.2`
- Desacoplamiento de fechas fijas y precios diarios en `<title>` y `<meta name="description">` en `src/layouts/BaseLayout.astro`.
- Erradicación de la obsolescencia temporal en Google SERPs que provocaba snippets congelados en fechas del pasado y penalización de CTR.
- Saneamiento y blindaje atemporal de las tarjetas Open Graph y Twitter Cards.
- Automatización de `<lastmod>` dinámico en `public/sitemap.xml` tras cada descarga matinal en `scripts/actualizar_precios_hoy.mjs`.
- Empaquetado final en `release/combustible-extremadura-v1.2.2.zip` y `release/RELEASE_NOTES_v1.2.2.md`.
