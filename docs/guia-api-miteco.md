# Guía Técnica de la API Oficial de Precios de Carburantes (MITECO)

Esta guía documenta la estructura, funcionamiento y consumo de los servicios REST públicos del **Ministerio para la Transición Ecológica y el Reto Demográfico (MITECO)** del Gobierno de España utilizados por **Combustible Extremadura** (`https://combustible.antoniohorrillo.com/`) para la consulta diaria e histórica de precios de gasolineras en la Comunidad Autónoma de Extremadura.

---

## 1. Marco Legal y Régimen de Apertura de Datos

En España, la publicación de precios de venta al público de carburantes está regulada por la **Orden ITC/2308/2007, de 25 de julio**. Según esta normativa:

- Todos los titulares de estaciones de servicio terrestres y postes marítimos están obligados a remitir por medios telemáticos cualquier modificación de sus precios vigentes.
- La comunicación debe efectuarse en un plazo máximo de **una hora** desde que se aplica el cambio en los surtidores.
- La información es puesta a disposición del público de forma gratuita bajo los principios de la **Ley 19/2013 de Transparencia, Acceso a la Información Pública y Buen Gobierno** y la iniciativa nacional **datos.gob.es**.

---

## 2. Características del Servicio REST

- **URL Base:** `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes`
- **Protocolo:** HTTPS
- **Método HTTP:** `GET`
- **Autenticación:** Ninguna (acceso público sin API Key ni cabeceras privadas).
- **Formatos disponibles:** JSON (`Accept: application/json`) o XML.
- **Frecuencia de actualización en Combustible Extremadura:** El workflow `.github/workflows/deploy.yml` ejecuta cada mañana a las **06:00 AM (Europe/Madrid)** el script `scripts/actualizar_precios_hoy.mjs`, consolidando los datos de las 422 estaciones de servicio de Extremadura para que a las 07:00 AM estén publicados.

---

## 3. Endpoints de Consulta en Tiempo Real (Precios de Hoy)

### 3.1. Estaciones de la Comunidad Autónoma de Extremadura
- **Ruta:** `/EstacionesTerrestres/FiltroCCAA/{ID_CCAA}`
- **ID de Extremadura:** `11`
- **URL completa:**
  ```text
  https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroCCAA/11
  ```

### 3.2. Estaciones de la Provincia de Badajoz
- **Ruta:** `/EstacionesTerrestres/FiltroProvincia/{ID_PROVINCIA}`
- **ID de Badajoz:** `06`
- **URL completa:**
  ```text
  https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/06
  ```

### 3.3. Estaciones de la Provincia de Cáceres
- **Ruta:** `/EstacionesTerrestres/FiltroProvincia/{ID_PROVINCIA}`
- **ID de Cáceres:** `10`
- **URL completa:**
  ```text
  https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/10
  ```

---

## 4. Endpoints de Consulta Histórica por Fecha y Producto

Para construir y actualizar la serie histórica 2025–2026 (`historico_extremadura_2026.json` y `historico_provincias_extremadura_2026.json`), los scripts del proyecto emplean los endpoints históricos del MITECO:

- **Identificadores de producto (`ID_PRODUCTO`):**
  - `1`: Gasolina 95 E5
  - `4`: Gasóleo A (Diésel habitual)
- **Formato de fecha (`FECHA`):** `DD-MM-YYYY` (ej. `02-11-2026`)

### 4.1. Histórico por Comunidad Autónoma y Producto
- **Ruta:** `/EstacionesTerrestresHist/FiltroCCAAProducto/{FECHA}/{ID_CCAA}/{ID_PRODUCTO}`
- **Ejemplo (Gasolina 95 E5 en Extremadura):**
  ```text
  https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/FiltroCCAAProducto/02-11-2026/11/1
  ```

### 4.2. Histórico por Provincia y Producto
- **Ruta:** `/EstacionesTerrestresHist/FiltroProvinciaProducto/{FECHA}/{ID_PROVINCIA}/{ID_PRODUCTO}`
- **Ejemplo (Gasóleo A en Badajoz - Provincia 06):**
  ```text
  https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/FiltroProvinciaProducto/02-11-2026/06/4
  ```

---

## 5. Estructura del JSON de Respuesta

La respuesta del servicio contiene un objeto con metadatos y una matriz `ListaEESSPrecio` que detalla cada estación de servicio:

```json
{
  "Fecha": "02/11/2026 06:00:00",
  "ListaEESSPrecio": [
    {
      "IDEESS": "1234",
      "C.P.": "06001",
      "Dirección": "AVENIDA DE ELVAS, S/N",
      "Horario": "L-D: 24H",
      "Latitud": "38,879194",
      "Longitud (WGS84)": "-6,995833",
      "Localidad": "BADAJOZ",
      "Municipio": "Badajoz",
      "IDMunicipio": "819",
      "Provincia": "BADAJOZ",
      "IDProvincia": "06",
      "IDCCAA": "11",
      "Precio Gasoleo A": "2,119",
      "Precio Gasolina 95 E5": "1,939",
      "Rótulo": "REPSOL",
      "Tipo Venta": "P"
    }
  ],
  "Nota": "Archivo de todos los productos en todas las estaciones de servicio...",
  "ResultadoConsulta": "OK"
}
```

### Particularidades para el parseo de datos:
1. **Coma decimal:** Los precios y coordenadas vienen como cadenas de texto con coma decimal (ej. `"2,119"`). En JavaScript debe sustituirse por punto antes de convertir a número:
   ```javascript
   const precio = parseFloat(estacion["Precio Gasoleo A"].replace(",", "."));
   ```
2. **Campos vacíos y precios nulos:** Si una estación no dispone de un combustible específico, el campo correspondiente contendrá una cadena vacía `""`. Debe filtrarse (`!Number.isNaN(precio) && precio > 0`) antes de calcular medias, mínimos o máximos.
3. **Tipo de venta (`Tipo Venta`):** `"P"` indica venta al público general; `"R"` indica venta restringida a socios o cooperativistas.

---

## 6. Scripts de Extracción Incluidos en el Proyecto

| Script | Comando NPM | Función |
|---|---|---|
| `scripts/actualizar_precios_hoy.mjs` | `npm run actualizar:hoy` | Consulta `FiltroCCAA/11`, procesa las 422 EESS y los 179 municipios y genera `hoy_extremadura.json` en `src/data/` y `public/datos/`. |
| `scripts/actualizar_historico_mes.mjs` | `npm run historico:mes` | Añade o actualiza incrementalmente un rango de fechas o el último mes en los JSON históricos sin volver a descargar toda la serie. |
| `scripts/extractor_extremadura_2025.mjs` | `npm run historico:ext-completo` | Reconstruye la serie histórica diaria autonómica completa 2025–2026 (`historico_extremadura_2026.json`). |
| `scripts/extractor_caceres_badajoz_2025.mjs` | `npm run historico:prov-completo` | Reconstruye la serie histórica diaria provincial completa 2025–2026 (`historico_provincias_extremadura_2026.json`). |
