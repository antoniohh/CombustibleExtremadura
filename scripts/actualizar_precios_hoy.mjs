import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const URL_MITECO_EXTREMADURA =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroCCAA/11';

const PRINCIPALES_MUNICIPIOS = [
  'Badajoz',
  'Cáceres',
  'Mérida',
  'Plasencia',
  'Don Benito',
  'Almendralejo',
  'Villanueva de la Serena',
  'Navalmoral de la Mata',
  'Zafra',
  'Montijo',
  'Trujillo',
  'Villafranca de los Barros',
  'Miajadas',
  'Coria',
  'Olivenza',
  'Jerez de los Caballeros'
];

function parsePrecio(valor) {
  if (!valor || typeof valor !== 'string') return null;
  const limpio = valor.trim().replace(',', '.');
  if (!limpio) return null;
  const num = parseFloat(limpio);
  return Number.isFinite(num) && num > 0 ? Number(num.toFixed(3)) : null;
}

function parseCoord(valor) {
  if (!valor || typeof valor !== 'string') return null;
  const num = parseFloat(valor.trim().replace(',', '.'));
  return Number.isFinite(num) ? Number(num.toFixed(5)) : null;
}

function calcularMedia(valores) {
  if (!valores.length) return null;
  const suma = valores.reduce((acc, v) => acc + v, 0);
  return Number((suma / valores.length).toFixed(3));
}

function normalizarTexto(str) {
  if (!str) return '';
  return str.trim();
}

function formatearFechaLegible(fechaMiteco) {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  try {
    const [parteFecha] = (fechaMiteco || '').split(' ');
    const [dia, mes, anio] = parteFecha.split('/').map(Number);
    if (dia && mes && anio) {
      return `${dia} de ${meses[mes - 1]} de ${anio}`;
    }
  } catch {
    // fallback
  }
  const hoy = new Date();
  return hoy.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Madrid'
  });
}

function resumirEstacion(e, campoPrecio) {
  if (!e) return null;
  return {
    ideess: e.ideess,
    rotulo: e.rotulo,
    direccion: e.direccion,
    municipio: e.municipio,
    localidad: e.localidad,
    provincia: e.provincia,
    codigoProvincia: e.codigoProvincia,
    cp: e.cp,
    horario: e.horario,
    tipoVenta: e.tipoVenta,
    precio: e[campoPrecio]
  };
}

function calcularEstadisticasGrupo(estaciones) {
  // Preferimos estaciones de venta al público ("P") para rankings de más baratas,
  // pero si en un municipio solo hay restringida ("R"), usamos todas como fallback.
  const publicas = estaciones.filter(e => e.tipoVenta === 'P');
  const baseG95 = publicas.some(e => e.gasolina95 !== null) ? publicas : estaciones;
  const baseGasA = publicas.some(e => e.gasoleoA !== null) ? publicas : estaciones;

  const conG95 = estaciones.filter(e => e.gasolina95 !== null);
  const conGasA = estaciones.filter(e => e.gasoleoA !== null);

  const conG95Rank = baseG95.filter(e => e.gasolina95 !== null).sort((a, b) => a.gasolina95 - b.gasolina95);
  const conGasARank = baseGasA.filter(e => e.gasoleoA !== null).sort((a, b) => a.gasoleoA - b.gasoleoA);

  const mediaGasolina95 = calcularMedia(conG95.map(e => e.gasolina95));
  const mediaGasoleoA = calcularMedia(conGasA.map(e => e.gasoleoA));

  const minG95Est = conG95Rank[0] || null;
  const maxG95Est = conG95Rank[conG95Rank.length - 1] || null;
  const minGasAEst = conGasARank[0] || null;
  const maxGasAEst = conGasARank[conGasARank.length - 1] || null;

  const diferencial =
    mediaGasoleoA !== null && mediaGasolina95 !== null
      ? Number((mediaGasoleoA - mediaGasolina95).toFixed(3))
      : null;

  return {
    totalEstaciones: estaciones.length,
    estacionesPublicas: publicas.length,
    estacionesGasolina95: conG95.length,
    estacionesGasoleoA: conGasA.length,
    mediaGasolina95,
    mediaGasoleoA,
    diferencialDieselGasolina: diferencial,
    minGasolina95: resumirEstacion(minG95Est, 'gasolina95'),
    maxGasolina95: resumirEstacion(maxG95Est, 'gasolina95'),
    minGasoleoA: resumirEstacion(minGasAEst, 'gasoleoA'),
    maxGasoleoA: resumirEstacion(maxGasAEst, 'gasoleoA'),
    topBaratasGasolina95: conG95Rank.slice(0, 6).map(e => resumirEstacion(e, 'gasolina95')),
    topBaratasGasoleoA: conGasARank.slice(0, 6).map(e => resumirEstacion(e, 'gasoleoA')),
    topCarasGasolina95: [...conG95Rank].reverse().slice(0, 3).map(e => resumirEstacion(e, 'gasolina95')),
    topCarasGasoleoA: [...conGasARank].reverse().slice(0, 3).map(e => resumirEstacion(e, 'gasoleoA')),
    costeDeposito50L: {
      gasolina95Media: mediaGasolina95 ? Number((mediaGasolina95 * 50).toFixed(2)) : null,
      gasoleoAMedia: mediaGasoleoA ? Number((mediaGasoleoA * 50).toFixed(2)) : null,
      gasolina95Min: minG95Est ? Number((minG95Est.gasolina95 * 50).toFixed(2)) : null,
      gasoleoAMin: minGasAEst ? Number((minGasAEst.gasoleoA * 50).toFixed(2)) : null,
      ahorroMaxGasolina95_50L:
        minG95Est && maxG95Est
          ? Number(((maxG95Est.gasolina95 - minG95Est.gasolina95) * 50).toFixed(2))
          : null,
      ahorroMaxGasoleoA_50L:
        minGasAEst && maxGasAEst
          ? Number(((maxGasAEst.gasoleoA - minGasAEst.gasoleoA) * 50).toFixed(2))
          : null,
      ahorroVsMediaGasolina95_50L:
        minG95Est && mediaGasolina95
          ? Number(((mediaGasolina95 - minG95Est.gasolina95) * 50).toFixed(2))
          : null,
      ahorroVsMediaGasoleoA_50L:
        minGasAEst && mediaGasoleoA
          ? Number(((mediaGasoleoA - minGasAEst.gasoleoA) * 50).toFixed(2))
          : null
    }
  };
}

async function main() {
  console.log('=== Descargando precios del día en Extremadura (MITECO CCAA 11) ===');
  const outSrcPath = path.join(ROOT_DIR, 'src', 'data', 'hoy_extremadura.json');
  const outPublicPath = path.join(ROOT_DIR, 'public', 'datos', 'hoy_extremadura.json');

  try {
    const res = await fetch(URL_MITECO_EXTREMADURA, {
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al consultar MITECO`);
    }

    const raw = await res.json();
    const listaRaw = raw.ListaEESSPrecio || [];
    if (!listaRaw.length) {
      throw new Error('La respuesta de MITECO no contiene estaciones en ListaEESSPrecio');
    }

    const estaciones = listaRaw
      .map(item => {
        const codigoProvincia = normalizarTexto(item['IDProvincia']);
        const provincia = codigoProvincia === '06' ? 'Badajoz' : codigoProvincia === '10' ? 'Cáceres' : normalizarTexto(item['Provincia']);
        return {
          ideess: normalizarTexto(item['IDEESS']),
          rotulo: normalizarTexto(item['Rótulo']) || 'SIN RÓTULO',
          direccion: normalizarTexto(item['Dirección']),
          localidad: normalizarTexto(item['Localidad']),
          municipio: normalizarTexto(item['Municipio']),
          idMunicipio: normalizarTexto(item['IDMunicipio']),
          provincia,
          codigoProvincia,
          cp: normalizarTexto(item['C.P.']),
          horario: normalizarTexto(item['Horario']),
          tipoVenta: normalizarTexto(item['Tipo Venta']) || 'P',
          gasolina95: parsePrecio(item['Precio Gasolina 95 E5']),
          gasoleoA: parsePrecio(item['Precio Gasoleo A']),
          gasoleoPremium: parsePrecio(item['Precio Gasoleo Premium']),
          gasolina98: parsePrecio(item['Precio Gasolina 98 E5']),
          gasoleoB: parsePrecio(item['Precio Gasoleo B']),
          adblue: parsePrecio(item['Precio Adblue']),
          lat: parseCoord(item['Latitud']),
          lon: parseCoord(item['Longitud (WGS84)'])
        };
      })
      .filter(e => e.gasolina95 !== null || e.gasoleoA !== null);

    const statsExtremadura = calcularEstadisticasGrupo(estaciones);
    const estBadajoz = estaciones.filter(e => e.codigoProvincia === '06');
    const estCaceres = estaciones.filter(e => e.codigoProvincia === '10');

    const statsBadajoz = calcularEstadisticasGrupo(estBadajoz);
    const statsCaceres = calcularEstadisticasGrupo(estCaceres);

    // Agrupar por municipio
    const mapaMunicipios = new Map();
    for (const est of estaciones) {
      const clave = est.municipio;
      if (!mapaMunicipios.has(clave)) {
        mapaMunicipios.set(clave, []);
      }
      mapaMunicipios.get(clave).push(est);
    }

    const todasLasPoblaciones = [];
    for (const [municipio, listaEst] of mapaMunicipios.entries()) {
      const statsMun = calcularEstadisticasGrupo(listaEst);
      const primera = listaEst[0];
      const difRegionalG95 =
        statsMun.mediaGasolina95 !== null && statsExtremadura.mediaGasolina95 !== null
          ? Number((statsMun.mediaGasolina95 - statsExtremadura.mediaGasolina95).toFixed(3))
          : null;
      const difRegionalGasA =
        statsMun.mediaGasoleoA !== null && statsExtremadura.mediaGasoleoA !== null
          ? Number((statsMun.mediaGasoleoA - statsExtremadura.mediaGasoleoA).toFixed(3))
          : null;

      todasLasPoblaciones.push({
        municipio,
        idMunicipio: primera.idMunicipio,
        provincia: primera.provincia,
        codigoProvincia: primera.codigoProvincia,
        cp: primera.cp,
        numEstaciones: listaEst.length,
        estacionesPublicas: statsMun.estacionesPublicas,
        mediaGasolina95: statsMun.mediaGasolina95,
        mediaGasoleoA: statsMun.mediaGasoleoA,
        minGasolina95: statsMun.minGasolina95?.precio ?? null,
        maxGasolina95: statsMun.maxGasolina95?.precio ?? null,
        minGasoleoA: statsMun.minGasoleoA?.precio ?? null,
        maxGasoleoA: statsMun.maxGasoleoA?.precio ?? null,
        mejorEstacionGasolina95: statsMun.minGasolina95
          ? {
              rotulo: statsMun.minGasolina95.rotulo,
              direccion: statsMun.minGasolina95.direccion,
              precio: statsMun.minGasolina95.precio,
              horario: statsMun.minGasolina95.horario,
              tipoVenta: statsMun.minGasolina95.tipoVenta
            }
          : null,
        mejorEstacionGasoleoA: statsMun.minGasoleoA
          ? {
              rotulo: statsMun.minGasoleoA.rotulo,
              direccion: statsMun.minGasoleoA.direccion,
              precio: statsMun.minGasoleoA.precio,
              horario: statsMun.minGasoleoA.horario,
              tipoVenta: statsMun.minGasoleoA.tipoVenta
            }
          : null,
        diferenciaMediaRegionalG95: difRegionalG95,
        diferenciaMediaRegionalGasA: difRegionalGasA,
        estaciones: listaEst
          .sort((a, b) => (a.gasoleoA ?? 99) - (b.gasoleoA ?? 99))
          .map(e => ({
            rotulo: e.rotulo,
            direccion: e.direccion,
            localidad: e.localidad,
            cp: e.cp,
            horario: e.horario,
            tipoVenta: e.tipoVenta,
            gasolina95: e.gasolina95,
            gasoleoA: e.gasoleoA,
            gasoleoPremium: e.gasoleoPremium,
            gasolina98: e.gasolina98
          }))
      });
    }

    todasLasPoblaciones.sort((a, b) => a.municipio.localeCompare(b.municipio, 'es'));

    const principalesLocalidades = PRINCIPALES_MUNICIPIOS.map(nombre =>
      todasLasPoblaciones.find(p => p.municipio.toLowerCase() === nombre.toLowerCase())
    ).filter(Boolean);

    // Calcular cuántas estaciones están por debajo de la media autonómica en cada provincia
    const badajozBajoMediaG95 = estBadajoz.filter(
      e => e.gasolina95 !== null && e.gasolina95 < statsExtremadura.mediaGasolina95
    ).length;
    const badajozBajoMediaGasA = estBadajoz.filter(
      e => e.gasoleoA !== null && e.gasoleoA < statsExtremadura.mediaGasoleoA
    ).length;
    const caceresBajoMediaG95 = estCaceres.filter(
      e => e.gasolina95 !== null && e.gasolina95 < statsExtremadura.mediaGasolina95
    ).length;
    const caceresBajoMediaGasA = estCaceres.filter(
      e => e.gasoleoA !== null && e.gasoleoA < statsExtremadura.mediaGasoleoA
    ).length;

    const difProvG95 = Number((statsCaceres.mediaGasolina95 - statsBadajoz.mediaGasolina95).toFixed(3));
    const difProvGasA = Number((statsCaceres.mediaGasoleoA - statsBadajoz.mediaGasoleoA).toFixed(3));

    const ahoraMadrid = new Date().toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const resultado = {
      fechaMiteco: raw.Fecha,
      fechaLegible: formatearFechaLegible(raw.Fecha),
      actualizadoEn: ahoraMadrid,
      fechaISO: new Date().toISOString(),
      totalMunicipiosConEstacion: todasLasPoblaciones.length,
      extremadura: statsExtremadura,
      provincias: {
        badajoz: {
          nombre: 'Badajoz',
          codigo: '06',
          totalMunicipios: todasLasPoblaciones.filter(p => p.codigoProvincia === '06').length,
          bajoMediaRegionalG95: badajozBajoMediaG95,
          bajoMediaRegionalGasA: badajozBajoMediaGasA,
          ...statsBadajoz
        },
        caceres: {
          nombre: 'Cáceres',
          codigo: '10',
          totalMunicipios: todasLasPoblaciones.filter(p => p.codigoProvincia === '10').length,
          bajoMediaRegionalG95: caceresBajoMediaG95,
          bajoMediaRegionalGasA: caceresBajoMediaGasA,
          ...statsCaceres
        }
      },
      comparativaHoy: {
        diferenciaGasolina95Litro: difProvG95,
        diferenciaGasoleoALitro: difProvGasA,
        diferenciaGasolina95Centimos: Number((difProvG95 * 100).toFixed(1)),
        diferenciaGasoleoACentimos: Number((difProvGasA * 100).toFixed(1)),
        ahorroDeposito50LGasolina95: Number((Math.abs(difProvG95) * 50).toFixed(2)),
        ahorroDeposito50LGasoleoA: Number((Math.abs(difProvGasA) * 50).toFixed(2)),
        provinciaMasBarataGasolina95: difProvG95 >= 0 ? 'Badajoz' : 'Cáceres',
        provinciaMasBarataGasoleoA: difProvGasA >= 0 ? 'Badajoz' : 'Cáceres'
      },
      principalesLocalidades,
      todasLasPoblaciones
    };

    await fs.mkdir(path.dirname(outSrcPath), { recursive: true });
    await fs.mkdir(path.dirname(outPublicPath), { recursive: true });
    const jsonString = JSON.stringify(resultado, null, 2);
    await fs.writeFile(outSrcPath, jsonString, 'utf-8');
    await fs.writeFile(outPublicPath, jsonString, 'utf-8');

    // Actualizar sitemap.xml con lastmod para avisar a motores de búsqueda del refresco diario
    const sitemapPath = path.join(ROOT_DIR, 'public', 'sitemap.xml');
    try {
      const fechaHoyISO = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://combustible.antoniohorrillo.com/</loc>
    <lastmod>${fechaHoyISO}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://combustible.antoniohorrillo.com/cookies/</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
`;
      await fs.writeFile(sitemapPath, sitemapXml, 'utf-8');
      console.log(`✓ Sitemap actualizado con lastmod: ${fechaHoyISO}`);
    } catch (errSitemap) {
      console.warn('⚠ No se pudo actualizar el sitemap:', errSitemap.message);
    }

    console.log(`✓ Datos del día actualizados correctamente (${raw.Fecha})`);
    console.log(`  - Estaciones procesadas: ${estaciones.length} en ${todasLasPoblaciones.length} municipios`);
    console.log(`  - Media Extremadura Gasolina 95 E5: ${statsExtremadura.mediaGasolina95} €/L | Gasóleo A: ${statsExtremadura.mediaGasoleoA} €/L`);
    console.log(`  - Media Badajoz: G95 ${statsBadajoz.mediaGasolina95} €/L | Diésel ${statsBadajoz.mediaGasoleoA} €/L (${estBadajoz.length} est.)`);
    console.log(`  - Media Cáceres: G95 ${statsCaceres.mediaGasolina95} €/L | Diésel ${statsCaceres.mediaGasoleoA} €/L (${estCaceres.length} est.)`);
  } catch (error) {
    console.error('⚠ Error al consultar MITECO en tiempo real:', error.message);
    try {
      await fs.access(outSrcPath);
      console.log('→ Se mantiene el último archivo hoy_extremadura.json disponible para no interrumpir el build.');
    } catch {
      process.exit(1);
    }
  }
}

main();
