# Changelog

Todas las versiones relevantes de **Combustible Extremadura**. El proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [1.3.1] — 2026-11-13

Versión de renovación integral de los recursos gráficos y de identidad visual del portal (isotipo vectorial de alta precisión, componente `<Logo />`, iconos de aplicación PWA/iOS/favicon y tarjeta social Open Graph `1200×630` generados con **Nano Banana**), unificando el lenguaje visual de observatorio de datos con *Embalses de Extremadura* y *Luz Extremadura*.

### Añadido y Mejorado

- **Nuevo Componente Vectorial `<Logo />` e Isotipo SVG de Alta Precisión ([`src/components/Logo.astro`](src/components/Logo.astro), [`public/favicon.svg`](public/favicon.svg), [`public/assets/favicon.svg`](public/assets/favicon.svg), [`public/assets/logo.svg`](public/assets/logo.svg))**:
  - Rediseño del isotipo vectorial sobre contenedor *squircle* oscuro (`#0f172a` → `#040814`) con borde luminoso cian-ámbar, anillo exterior de telemetría graduado, gota volumétrica dorada de carburante con reflejo especular de cristal, silueta de boquilla dispensadora y curva de cotización cian con nodos de datos.
  - Creación del componente reutilizable `Logo.astro` con identificadores únicos de gradiente por instancia e integración directa en [`src/components/Header.astro`](src/components/Header.astro) y [`src/components/Footer.astro`](src/components/Footer.astro).
- **Nuevas Creatividades de Marca con Nano Banana ([`public/assets/icon-512.png`](public/assets/icon-512.png), [`public/assets/icon-192.png`](public/assets/icon-192.png), [`public/assets/apple-touch-icon.png`](public/assets/apple-touch-icon.png), [`public/favicon.ico`](public/favicon.ico), [`public/assets/og-image.png`](public/assets/og-image.png))**:
  - Nuevo icono principal de aplicación con *squircle* transparente (`512×512`, `192×192`, `180×180` y `favicon.ico` multirresolución `16/32/48` px).
  - Nueva tarjeta social Open Graph (`1200×630` px) con estética de observatorio de datos, badge `DATOS OFICIALES MITECO · EXTREMADURA`, tarjeta 3D *glassmorphic* con el mapa provincial de Extremadura, estaciones de servicio iluminadas en los principales corredores viarios, curvas de evolución de Gasolina 95 y Diésel y píldora `422 Gasolineras · 179 Municipios`.

## [1.3.0] — 2026-11-12

Versión de interconexión del ecosistema digital que incorpora la barra de navegación transversal 100% responsiva (`NetworkBar.astro`) y un módulo SEO de red en el pie de página (`Footer.astro`), enlazando los proyectos de datos abiertos y utilidades de Antonio Horrillo (*Combustible*, *Luz*, *Embalses* y *GlucoLuna*).

### Añadido y Mejorado

- **Barra de Navegación de Red Responsive ([`src/components/NetworkBar.astro`](src/components/NetworkBar.astro), [`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro))**:
  - Mini topbar de 36px de alto sobre el encabezado con diseño oscuro `bg-slate-950` y borde inferior sutil.
  - Indicador de proyecto actual con píldora activa (`bg-sky-400/15 text-sky-300 border-sky-400/30`) y badge «Actual» en resoluciones de escritorio.
  - Comportamiento móvil optimizado: fila única con scroll horizontal táctil y sin barra de desplazamiento (`scrollbar-width: none`), títulos compactos y diana táctil ergonómica.
  - Enlace corporativo a `https://antoniohorrillo.com/` con indicador visual dinámico.
  - Exclusión de impresión (`print:hidden`).
- **Módulo de Enlazado de Red en Pie de Página ([`src/components/Footer.astro`](src/components/Footer.astro))**:
  - Reestructuración del grid a 4 columnas responsivas (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
  - Incorporación de la columna «Red de Proyectos» con enlaces limpios `dofollow` y textos de ancla orientados a SEO hacia *Luz Extremadura*, *Embalses de Extremadura*, *GlucoLuna* y el portafolio personal.

## [1.2.2] — 2026-11-09

Versión de optimización SEO y metadatos sociales que desacopla fechas fijas y precios volátiles de los títulos y descripciones HTML, erradica el riesgo de desactualización en snippets de Google SERP, sanea las tarjetas Open Graph y dinamiza el `<lastmod>` del sitemap.

### Corregido y Optimizado

- **Desacoplamiento de Fechas Fijas y Precios en Metadatos SEO ([`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro))**:
  - Sustitución de la interpolación de fechas cerradas `(${HOY_EXTREMADURA.fechaLegible})` y precios diarios en céntimos por un título atemporal de alta relevancia: `Precio del Combustible en Extremadura Hoy | Gasolina 95 y Diésel (Badajoz y Cáceres)`.
  - Redacción de una meta-descripción orientada a intención de búsqueda y maximización de CTR sin riesgo de quedar obsoleta entre ciclos de rastreo de Googlebot.
  - La fecha en curso (`{fechaLegible}`) y el registro MITECO (`{fechaMiteco}`) se mantienen plenamente destacados en el Hero para los visitantes del portal.
- **Sincronización Limpia de Open Graph y Twitter Cards ([`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro))**:
  - Las etiquetas `og:title`, `twitter:title`, `og:description` y `twitter:description` quedan protegidas frente a información caducada al heredar los nuevos valores consolidados.
- **Automatización de `<lastmod>` en Sitemap ([`scripts/actualizar_precios_hoy.mjs`](scripts/actualizar_precios_hoy.mjs), [`public/sitemap.xml`](public/sitemap.xml))**:
  - Inclusión de actualización programada de la etiqueta `<lastmod>` con la fecha del día en curso en cada ejecución de la tarea matinal de las 06:00h, ofreciendo una señal activa de frescura a los rastreadores de motores de búsqueda.

## [1.2.1] — 2026-11-03

Implementación completa de Google Consent Mode v2 delimitado por región y actualización de la política de privacidad y cookies.

### Añadido y Mejorado

- **Google Consent Mode v2 por Región ([`BaseLayout.astro`](src/layouts/BaseLayout.astro))**:
  - Declaración del estado predeterminado `denied` delimitado específicamente a los 30 países del Espacio Económico Europeo (EEE), Reino Unido y Suiza (`region: ['AT', 'BE', ... 'GB', 'CH']`).
  - Habilitación por defecto para tráfico internacional fuera del EEE conforme a las directrices de Google Analytics 4, evitando la penalización de tasa de consentimiento del 0 %.
  - Sincronización inmediata de la decisión previa (`consent update`) en el `<head>` antes de `gtag('config')` para una transición limpia y sin advertencias en Google Tag Assistant.
- **Transmisión Completa de Señales de Consentimiento ([`CookieBanner.astro`](src/components/CookieBanner.astro))**:
  - Actualización del manejador `applyConsent` para enviar el cuarteto completo de señales (`analytics_storage`, `ad_storage`, `ad_user_data` y `ad_personalization`).
  - Texto del banner ajustado para mayor precisión: aclara que solo se guardan cookies y registran métricas con permiso, sin publicidad personalizada ni compartición con terceros.
- **Sección Técnica en Política de Cookies ([`cookies.astro`](src/pages/cookies.astro))**:
  - Incorporada nueva sección detallando la operativa técnica de Consent Mode v2, la navegación sin cookies ante el rechazo y la garantía de ausencia de perfilado comercial.

## [1.2.0] — 2026-11-03

Versión de optimización y simplificación visual de la interfaz: aligera drásticamente la carga de contenidos en portada, transforma la apertura en banners compactos de alta legibilidad, sintetiza el bloque comparativo Badajoz vs. Cáceres y elimina tablas, textos teóricos y gráficos redundantes para priorizar la rapidez y claridad de consulta.

### Añadido

- **Instalación PWA en Chrome Móvil** ([`InstallPrompt.astro`](src/components/InstallPrompt.astro), [`sw.js`](public/sw.js), [`site.webmanifest`](public/site.webmanifest)):
  - Detección del evento nativo `beforeinstallprompt` en Chrome para Android/móvil para invitar al usuario a instalar la app en su pantalla de inicio.
  - Implementación de Service Worker (`public/sw.js`) con soporte offline para cumplir los estándares de instalabilidad PWA de Google.
  - Actualización de `site.webmanifest` con iconos maskable y arranque autónomo (`display: standalone`).

### Cambiado

- **Barra inferior del pie de página simplificada** ([`Footer.astro`](src/components/Footer.astro)):
  - Sustituida por `© 2026 Combustible Extremadura · Creado por Antonio Horrillo` con enlace a `https://antoniohorrillo.com` y distintivo en vivo `Actualización diaria a las 06:00 h` a la derecha.
- **Banners compactos de cotización diaria en apertura** ([`index.astro`](src/pages/index.astro)):
  - Sustitución de las tarjetas verticales de apertura por dos **banners estilizados y compactos** (`Gasolina 95 E5` y `Gasóleo A`), con precio medio en formato destacado, número de estaciones, mínimo regional con municipio y coste medio de 50L.
- **Simplificación del bloque comparativo Badajoz vs. Cáceres** ([`index.astro`](src/pages/index.astro)):
  - Reemplazo de las tres columnas densas por una franja superior de **Veredicto Territorial** (diferencia directa en céntimos y ahorro por depósito) y dos columnas limpias (Badajoz a la izquierda, Cáceres a la derecha) con medias y mínimos provinciales de cada carburante.
  - Eliminación de métricas secundarias y textos de horquilla para evitar la sobrecarga cognitiva.

### Eliminado

- **Sección API Oficial MITECO y Captura de Datos**: retirada la sección completa `#api-miteco`, sus enlaces en la cabecera y el pie de página, y las constantes auxiliares (`API_MITECO`, cURL y comandos de script).
- **Textos teóricos de la Guía Práctica**: eliminados los 6 artículos de contexto logístico (Exolum, peaje en autovías, efecto lunes, frontera con Portugal, cooperativas agrarias y neumáticos) para mantener la sección centrada exclusivamente en la calculadora interactiva de repostaje y ahorro anual.
- **Gráficos y bloques históricos redundantes**: eliminados los gráficos secundarios de *Serie Provincial Cáceres vs. Badajoz* y *Anomalía del Diésel*, el bloque textual de conclusiones 2025–2026 y la tabla consolidada mes a mes, apoyándose directamente en el gráfico principal de evolución y en el gráfico de medias mensuales.
- **Preguntas frecuentes depuradas**: eliminadas 3 preguntas redundantes de `FAQS_SEO` en [`precios.ts`](src/data/precios.ts).
- **Código JS cliente sin uso** ([`spa.ts`](src/scripts/spa.ts)): eliminados los listeners y funciones de renderizado de los componentes retirados (`inicializarTablaHistorica`, conmutadores huérfanos).

## [1.1.0] — 2026-11-02

Nueva versión que incorpora paneles destacados con el Top 5 diario de las dos capitales de provincia (**Badajoz Capital** y **Cáceres Capital**) en la portada principal y renueva por completo la identidad visual, iconos y tarjeta Open Graph generados con Nano Banana.

### Añadido

- **Paneles de Precios y Top 5 Hoy en Badajoz Capital y Cáceres Capital en el bloque principal** ([`index.astro`](src/pages/index.astro), [`spa.ts`](src/scripts/spa.ts)):
  - Dos nuevas cajas interactivas situadas justo debajo de las tres tarjetas principales de Extremadura y encima de la tabla de las 16 principales localidades.
  - Resumen directo del precio medio y mínimo del día de **Gasolina 95** y **Gasóleo A (Diésel)** en la ciudad de **Badajoz** (41 EESS) y en la ciudad de **Cáceres** (15 EESS), junto con el coste medio de un depósito de 50 litros y botón directo al detalle completo de todas sus estaciones.
  - Listado interactivo en formato **Top 5** con pestañas independientes (`Diésel` / `Gasolina 95`) para consultar de un vistazo las 5 gasolineras más baratas hoy en cada capital provincial.
- **Nuevas creatividades de marca, favicon y Open Graph generadas con Nano Banana (`public/assets/`):**
  - Nueva tarjeta social Open Graph ([`og-image.png`](public/assets/og-image.png), `1200×630` px) con diseño oscuro tipo observatorio de datos, tarjeta 3D con el mapa provincial de Extremadura (Badajoz y Cáceres), curvas luminosas de tendencia y distintivo oficial MITECO.
  - Nuevo isotipo y familia completa de iconos de alta resolución ([`icon-512.png`](public/assets/icon-512.png), [`icon-192.png`](public/assets/icon-192.png), [`apple-touch-icon.png`](public/assets/apple-touch-icon.png), [`favicon.ico`](public/favicon.ico), [`favicon.svg`](public/assets/favicon.svg) y [`logo.svg`](public/assets/logo.svg)) combinando gota energética ámbar, boquilla de surtidor y flecha cian de evolución de precios.
  - Integración del icono de alta definición `icon-192.png` en [`Header.astro`](src/components/Header.astro), [`Footer.astro`](src/components/Footer.astro) y [`site.webmanifest`](public/site.webmanifest).

## [1.0.1] — 2026-11-02

Release de mantenimiento y consolidación de despliegue para el dominio personalizado `https://combustible.antoniohorrillo.com/`.

### Añadido

- **Directrices operativas del proyecto ([`AGENTS.md`](AGENTS.md)):** definición de las normas de arquitectura, estándares de accesibilidad WCAG AA/AAA, privacidad RGPD y flujo de preparación de releases sin creación automática de etiquetas Git locales.
- **Paquete de distribución `v1.0.1`:** compilación estática actualizada lista para su publicación en GitHub Releases (`combustible-extremadura-v1.0.1.zip` y checksum SHA256).

### Cambiado

- Sincronización de versión a `1.0.1` en `package.json`, `package-lock.json`, `README.md` y documentación técnica en `docs/`.

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
