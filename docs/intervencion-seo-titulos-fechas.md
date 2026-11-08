# Informe Técnico de Intervención: Optimización SEO y Metadatos Sociales (v1.2.2)

- **Fecha:** 9 de noviembre de 2026
- **Proyecto:** Combustible Extremadura (`combustible-extremadura`)
- **Dominio:** `https://combustible.antoniohorrillo.com`
- **Motivo de la intervención:** Prevención y resolución del desfase de fecha fija y precios congelados en las SERPs de Google (`Precio del Combustible en Extremadura Hoy (2 de noviembre de...`), protegiendo el CTR y el tráfico orgánico.

---

## 1. Diagnóstico del Problema y Causa Raíz

### 1.1. Inyección de Fecha Cerrada y Precios Volátiles en Cabecera
En `src/layouts/BaseLayout.astro`, las variables `defaultTitle` y `defaultDesc` se generaban interpolando la fecha del build y los precios medios del día:

```astro
const defaultTitle = `Precio del Combustible en Extremadura Hoy (${HOY_EXTREMADURA.fechaLegible}) | Gasolina 95: ${g95Hoy} € · Diésel: ${gasAHoy} €`;
const defaultDesc = `Precio actualizado hoy (${HOY_EXTREMADURA.fechaLegible}) en las ${HOY_EXTREMADURA.extremadura.totalEstaciones} gasolineras de Extremadura: Gasolina 95 E5 a ${g95Hoy} €/L y Gasóleo A a ${gasAHoy} €/L. Comparativa Badajoz vs Cáceres, buscador de los ${HOY_EXTREMADURA.totalMunicipiosConEstacion} municipios e histórico 2025-2026.`;
```

Dado que la portada `src/pages/index.astro` no sobrescribía estos valores, el HTML estático de producción quedaba sellado con la fecha de la última compilación (ej. *"2 de noviembre de 2026"*).

### 1.2. Comportamiento de Googlebot y Desplome de CTR
1. Googlebot rastreó e indexó la portada el 2 de noviembre.
2. Como los rastreadores no re-indexan diariamente todos los portales estáticos, durante los días siguientes el resultado mostrado en las búsquedas orgánicas de Google continuó mostrando:
   `Precio del Combustible en Extremadura Hoy (2 de noviembre de 2026) | Gasolina 95: 1,738 € · Diésel: 1,928 €`
3. Para los usuarios que buscan hoy precio de carburantes, ver una fecha pasada y precios desfasados genera desconfianza y un desvío inmediato hacia la competencia, reduciendo drásticamente el CTR (Click-Through Rate) y degradando el ranking orgánico.
4. Las tarjetas de redes sociales (WhatsApp, Telegram, X / Twitter, LinkedIn, Facebook) reproducían la misma información caducada a través de `og:title`, `og:description`, `twitter:title` y `twitter:description`.

---

## 2. Modificaciones Implementadas

### 2.1. Adopción de Título y Descripción *Evergreen*
En `src/layouts/BaseLayout.astro`, se establecieron valores atemporales enfocados puramente en intención de búsqueda:

- **`<title>`:** `Precio del Combustible en Extremadura Hoy | Gasolina 95 y Diésel (Badajoz y Cáceres)`
  - Destaca los términos clave de mayor volumen: *"Precio del Combustible Extremadura Hoy"*, *"Gasolina 95"*, *"Diésel"*, *"Badajoz"* y *"Cáceres"*.
  - El modificador temporal **"Hoy"** asegura máxima relevancia cualquier día del año sin riesgo de caducidad en el índice de Google.
- **`<meta name="description">`:** `Consulta el precio de la gasolina 95 y diésel hoy en las 422 gasolineras de Extremadura. Compara precios entre Badajoz y Cáceres, encuentra la gasolinera más barata de tu municipio y consulta el histórico oficial MITECO.`
  - Llamada a la acción orientada a ahorro y utilidad local sin valores monetarios efímeros.

### 2.2. Preservación de la Frescura Visual en el Portal
Dentro del Hero de `src/pages/index.astro`, la fecha del día (`{fechaLegible}`) y el registro oficial de la descarga MITECO (`{fechaMiteco}`) se mantienen como badges en vivo junto a las cotizaciones actualizadas a las 06:00 h, garantizando total transparencia informativa al usuario que entra.

### 2.3. Saneamiento de Tarjetas Open Graph y Twitter Cards
Al heredar los nuevos valores de `title` y `description`, las previsualizaciones en plataformas de mensajería y redes sociales quedan blindadas frente a información caducada.

### 2.4. Automatización de `<lastmod>` en el Sitemap
Se actualizó `scripts/actualizar_precios_hoy.mjs` para reescribir `public/sitemap.xml` incorporando la etiqueta `<lastmod>` con la fecha del día en curso (`YYYY-MM-DD`) en cada descarga diaria de las 06:00h, notificando formalmente a los motores de búsqueda de la presencia de datos nuevos.

---

## 3. Protocolo de Verificación y Purgado de Caché

### 3.1. Google Search Console
1. Acceder a [Google Search Console](https://search.google.com/search-console).
2. Introducir `https://combustible.antoniohorrillo.com/` en **Inspección de URLs**.
3. Solicitar indexación para acelerar la actualización del snippet en la SERP.
4. Reenviar `https://combustible.antoniohorrillo.com/sitemap.xml` en la sección de sitemaps.

### 3.2. Purgado en Redes Sociales
- En Meta / WhatsApp: forzar recarga mediante [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
- En LinkedIn: inspeccionar mediante [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

---

## 4. Estado Final del Repositorio
- Versión actualizada a **`1.2.2`** en `package.json`, `package-lock.json`, `CHANGELOG.md`, `README.md` y notas de versión.
- Paquete ZIP compilado en `release/combustible-extremadura-v1.2.2.zip` con su correspondiente suma SHA-256 en `release/combustible-extremadura-v1.2.2.zip.sha256`.
- Regla operativa cumplida: **sin crear ni manipular etiquetas `git tag`**.
