# Directrices para Agentes (AGENTS.md) — Combustible Extremadura

Este documento define las reglas operativas, de arquitectura y de publicación de versiones que cualquier agente de IA debe cumplir estrictamente al trabajar en este repositorio.

---

## 1. Regla Crítica sobre Git Tags y Releases

> **PROHIBIDO CREAR ETIQUETAS GIT (`git tag`) LOCALMENTE.**
> - **NUNCA** ejecutes `git tag` ni `git push --tags`.
> - El usuario gestiona la creación de etiquetas y la publicación de releases manualmente desde su cliente de GitHub o la interfaz web de GitHub.
> - Cuando el usuario pida preparar una nueva release (ej. `v1.0.1`), debes:
>   1. Actualizar la versión en `package.json` y `package-lock.json`.
>   2. Documentar la versión en `CHANGELOG.md`, `README.md` y `docs/`.
>   3. Compilar el proyecto (`npm run check` y `npm run build:fast`).
>   4. Generar en la carpeta `release/` (ignorada por Git):
>      - `release/combustible-extremadura-vX.Y.Z.zip` (con el contenido de `dist/`)
>      - `release/combustible-extremadura-vX.Y.Z.zip.sha256`
>      - `release/RELEASE_NOTES_vX.Y.Z.md`
>   5. Hacer únicamente `git add` y `git commit` en la rama `main` (sin crear ningún tag).

---

## 2. Identidad y Configuración del Proyecto

- **Nombre:** Combustible Extremadura (`combustible-extremadura`)
- **Dominio de producción:** `https://combustible.antoniohorrillo.com` (configurado en `public/CNAME`, `astro.config.mjs` y `src/lib/site.ts`)
- **Repositorio:** `https://github.com/antoniohh/CombustibleExtremadura`
- **Autor:** Antonio Horrillo (`https://antoniohorrillo.com`)
- **Stack:** Astro 7 (`output: "static"`, `trailingSlash: "always"`), Tailwind CSS v4 (`@tailwindcss/vite`), Chart.js 4.5, `@lucide/astro` y TypeScript estricto sobre Node.js `>= 22.23.4` (`.nvmrc`).

---

## 3. Arquitectura de Datos y Actualización Diaria

- Los datos diarios provienen de la API REST oficial del MITECO (`FiltroCCAA/11` para Extremadura).
- `scripts/actualizar_precios_hoy.mjs` (`npm run actualizar:hoy`) descarga las 422 estaciones de servicio, calcula las medias de Extremadura, Badajoz, Cáceres, las 16 localidades principales y los 179 municipios, y guarda el resultado tanto en `src/data/hoy_extremadura.json` como en `public/datos/hoy_extremadura.json`.
- `scripts/actualizar_historico_mes.mjs` (`npm run historico:mes`) actualiza incrementalmente las series históricas 2025–2026 (`historico_extremadura_2026.json` y `historico_provincias_extremadura_2026.json`).
- El workflow `.github/workflows/deploy.yml` se ejecuta automáticamente todos los días a las **06:00 AM (Europe/Madrid)** y en cada `push` a `main`.

---

## 4. Estándares de Interfaz, Accesibilidad y Privacidad

- **Contraste y legibilidad:** Cumplir siempre ratios WCAG AA/AAA, especialmente en cabeceras oscuras (`bg-slate-900` / `bg-slate-950`) y tablas numéricas (`font-variant-numeric: tabular-nums`).
- **Privacidad (RGPD / AEPD):** Mantener Google Consent Mode v2 con `analytics_storage: 'denied'` por defecto en `src/layouts/BaseLayout.astro`, gestión mediante `src/components/CookieBanner.astro` y detalle completo en `src/pages/cookies.astro`.
