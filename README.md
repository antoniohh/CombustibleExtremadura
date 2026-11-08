# Combustible Extremadura

[![Versión](https://img.shields.io/badge/versi%C3%B3n-1.2.2-0284c7?style=for-the-badge)](CHANGELOG.md)
[![Astro](https://img.shields.io/badge/Astro-7.4.2-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5.1-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-0f172a?style=for-the-badge&logo=github&logoColor=white)](https://combustible.antoniohorrillo.com/)

Aplicación web estática (SPA) para la consulta diaria e histórica del **precio del combustible en Extremadura (Gasolina 95 E5 y Gasóleo A / Diésel)** en las provincias de Badajoz y Cáceres y sus 179 municipios con estación de servicio.

- **Sitio web en producción:** [https://combustible.antoniohorrillo.com](https://combustible.antoniohorrillo.com)
- **Repositorio:** [https://github.com/antoniohh/CombustibleExtremadura](https://github.com/antoniohh/CombustibleExtremadura)
- **Autor:** Antonio Horrillo ([antoniohorrillo.com](https://antoniohorrillo.com))

---

## 🎯 Características Principales

1. **Cotización Diaria en Banners Compactos, Top 5 en Badajoz y Cáceres y Principales Localidades:**
   - Captura diaria de las **422 estaciones de servicio** de Extremadura desde la API oficial del MITECO (`FiltroCCAA/11`).
   - Compilación automática todos los días a las **06:00 AM** mediante GitHub Actions (`.github/workflows/deploy.yml`) para que a primera hora de la mañana estén publicadas las tarifas del día.
   - Banners compactos y directos de cotización media regional para **Gasolina 95 E5** y **Gasóleo A (Diésel)** con mínimo diario y coste de 50L.
   - Dos paneles específicos para las capitales de provincia (**Badajoz Capital** con 41 EESS y **Cáceres Capital** con 15 EESS) con sus precios medios/mínimos y su **Top 5 hoy** (selector interactivo Diésel / Gasolina 95).
   - Tabla en vivo de las **16 principales localidades de Extremadura** (Badajoz, Cáceres, Mérida, Plasencia, Don Benito, Almendralejo, Villanueva de la Serena, Navalmoral de la Mata, Zafra, Montijo, Trujillo, Villafranca de los Barros, Miajadas, Coria, Olivenza y Jerez de los Caballeros).
2. **Comparativa Hoy Badajoz vs. Cáceres (Veredicto y Cara a Cara):**
   - Veredicto superior territorial directo con la brecha por litro y el ahorro estimado por depósito entre ambas provincias.
   - Duelo cara a cara simplificado con medias, mínimos y tablas de las 5 estaciones más económicas de cada provincia.
3. **Explorador Interactivo de los 179 Municipios:**
   - Buscador instantáneo por municipio o código postal, filtros por provincia e inicial alfabética, ordenación por precio más barato y desplegable con todas las gasolineras y horarios de cada localidad.
4. **Serie Histórica Consolidada (2025 y 2026):**
   - Más de 630 días de registros diarios consolidados en `public/datos/historico_extremadura_2026.json` y `public/datos/historico_provincias_extremadura_2026.json`.
   - Gráfico interactivo con Chart.js de evolución diaria (filtros por periodo y ámbito provincial) y gráfico comparativo de medias mensuales.
5. **Calculadora Interactiva de Repostaje y Ahorro:**
   - Ajuste de litros, consumo y kilometraje anual para calcular el ahorro real repostando en las estaciones más económicas frente a la media.
6. **SEO Técnico y Privacidad (RGPD / AEPD):**
   - Marcado estructurado Schema.org (`WebSite`, `WebPage`, `Dataset`, `ItemList` y `FAQPage` dinámica con los precios del día).
   - Activos vectoriales y Open Graph (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `logo.svg`, `og-image.png`, `robots.txt`, `sitemap.xml`, `site.webmanifest` y `CNAME`).
   - Cumplimiento de privacidad con **Google Consent Mode v2** (bloqueo analítico previo por defecto), banner y modal de configuración (`CookieBanner.astro`) y página de [Política de Cookies](/cookies/) (`src/pages/cookies.astro`).

---

## 🛠️ Comandos de Desarrollo y Scripts de Datos

```bash
# Instalar dependencias (requiere Node.js >= 22.23.4)
npm install

# Actualizar los precios del día actual desde la API de MITECO
npm run actualizar:hoy

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción (actualiza precios de hoy + genera dist/)
npm run build

# Compilar rápidamente usando los JSON actuales en disco
npm run build:fast

# Previsualizar el sitio compilado localmente
npm run preview

# Actualizar manualmente los JSON históricos al cambiar de mes (incremental)
npm run historico:mes
# O indicando un rango de fechas específico:
node scripts/actualizar_historico_mes.mjs 2026-10-01 2026-10-31

# Regenerar series históricas completas manualmente si fuera necesario:
npm run historico:ext-completo
npm run historico:prov-completo
```

---

## 📁 Estructura del Proyecto

```text
CombustibleExtremadura/
├── .github/
│   └── workflows/
│       ├── deploy.yml                             # Build diario a las 06:00 AM y despliegue en GitHub Pages
│       └── release.yml                            # Empaquetado ZIP y publicación de release en tags v*
├── docs/
│   ├── guia-api-miteco.md                         # Documentación técnica de la API REST del MITECO
│   └── sesion-desarrollo.md                       # Registro técnico del desarrollo y arquitectura
├── public/
│   ├── assets/
│   │   ├── apple-touch-icon.png
│   │   ├── favicon.svg
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   ├── logo.svg
│   │   └── og-image.png
│   ├── datos/
│   │   ├── hoy_extremadura.json                   # Precios del día actual (422 EESS, 179 municipios)
│   │   ├── historico_extremadura_2026.json        # Histórico diario Extremadura 2025-2026
│   │   └── historico_provincias_extremadura_2026.json
│   ├── .nojekyll
│   ├── CNAME                                      # Dominio personalizado: combustible.antoniohorrillo.com
│   ├── favicon.ico
│   ├── robots.txt
│   ├── site.webmanifest
│   └── sitemap.xml
├── scripts/
│   ├── actualizar_precios_hoy.mjs                 # Captura diaria de las 422 EESS de Extremadura
│   ├── actualizar_historico_mes.mjs               # Actualización incremental mensual del histórico
│   ├── extractor_extremadura.mjs
│   ├── extractor_extremadura_2025.mjs
│   ├── extractor_caceres_badajoz.mjs
│   └── extractor_caceres_badajoz_2025.mjs
├── src/
│   ├── components/
│   │   ├── CookieBanner.astro                     # Aviso y configuración de cookies (Consent Mode v2)
│   │   ├── Footer.astro
│   │   └── Header.astro
│   ├── data/
│   │   ├── hoy_extremadura.json
│   │   ├── historico_extremadura_2026.json
│   │   ├── historico_provincias_extremadura_2026.json
│   │   └── precios.ts                             # Procesamiento de datos, récords y FAQs dinámicas
│   ├── layouts/
│   │   └── BaseLayout.astro                       # SEO, Open Graph, Consent Mode v2 y JSON-LD Schema.org
│   ├── lib/
│   │   └── site.ts                                # Constantes canónicas y dominio
│   ├── pages/
│   │   ├── cookies.astro                          # Página de Política de Cookies y Privacidad (/cookies/)
│   │   └── index.astro                            # SPA principal
│   ├── scripts/
│   │   └── spa.ts                                 # Buscador de municipios, Chart.js y calculadora
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

## 🌐 Despliegue en GitHub Pages (`combustible.antoniohorrillo.com`)

El repositorio está configurado para desplegarse automáticamente bajo el dominio personalizado `https://combustible.antoniohorrillo.com/`:

1. Sube los cambios a la rama `main`.
2. En GitHub, entra en **Settings → Pages** y en **Build and deployment** selecciona **GitHub Actions**.
3. Configura un registro DNS `CNAME` para `combustible.antoniohorrillo.com` apuntando a `antoniohh.github.io`.
4. El workflow `.github/workflows/deploy.yml` se ejecuta automáticamente en cada `push` a `main` y todos los días a las **06:00 AM (Europe/Madrid)**, actualizando los precios desde el MITECO y publicando `dist/` con el archivo `CNAME` incluido.

Si necesitas cambiar el dominio en el futuro, actualiza `src/lib/site.ts`, `astro.config.mjs`, `public/CNAME`, `public/robots.txt` y `public/sitemap.xml`.

---

## 📦 Control de Versiones

Versión actual: **1.2.2** · [Historial completo en CHANGELOG.md](CHANGELOG.md)

| Versión | Fecha | Cambios principales |
|---|---|---|
| **1.2.2** | 2026-11-09 | Desacoplamiento de fechas fijas y precios en `<title>` y `<meta description>`, prevención de desfase en SERPs de Google, tarjetas Open Graph perennes y automatización de `<lastmod>` en el sitemap |
| 1.2.1 | 2026-11-03 | Implementación de Google Consent Mode v2 delimitado por región (bloqueo estricto por defecto en el EEE) y actualización de la política de privacidad y cookies |
| 1.2.0 | 2026-11-03 | Simplificación y aligeramiento visual de portada con apertura compacta, soporte de instalación PWA en Chrome móvil y optimización de rendimiento |
| 1.1.0 | 2026-11-02 | Nuevas cajas de precios y Top 5 hoy para Badajoz Capital y Cáceres Capital en portada, e identidad visual completa (icono, favicon y tarjeta Open Graph `1200×630`) generada con Nano Banana |
| 1.0.1 | 2026-11-02 | Incorporación de `AGENTS.md`, consolidación del flujo de publicación en GitHub Releases y paquete de distribución `v1.0.1` |
| 1.0.0 | 2026-11-02 | Lanzamiento inicial en `combustible.antoniohorrillo.com`: precios diarios en 422 EESS, comparativa Badajoz vs Cáceres, buscador de 179 municipios, serie histórica 2025-2026 con 4 gráficos Chart.js, calculadora de ahorro, Consent Mode v2 y actualización diaria automatizada a las 06:00 AM |

El workflow `.github/workflows/release.yml` compila el sitio y adjunta automáticamente `combustible-extremadura-v1.2.2.zip` al publicar una etiqueta `v*` en GitHub. Además, los paquetes precompilados locales se encuentran disponibles en `release/`.

---

## 📄 Licencia y Autoría

Desarrollado por **[Antonio Horrillo](https://antoniohorrillo.com)** ([github.com/antoniohh](https://github.com/antoniohh)).

Este proyecto se distribuye bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles. Los datos de precios de carburantes proceden del catálogo de datos abiertos de la Sede Electrónica del MITECO (Orden ITC/2308/2007).
