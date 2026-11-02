import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const ID_EXTREMADURA = '11';
const PROVINCIAS = { BADAJOZ: '06', CACERES: '10' };
const PRODUCTOS = { GASOLINA_95: '1', GASOLEO_A: '3' };

function parsePrecio(valor) {
  if (!valor) return null;
  const num = parseFloat(valor.replace(',', '.'));
  return Number.isNaN(num) ? null : num;
}

function calcularMedia(arr) {
  if (!arr.length) return null;
  const suma = arr.reduce((acc, curr) => acc + curr, 0);
  return Number((suma / arr.length).toFixed(3));
}

function formatearFechaMiteco(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

function parseFechaDDMMYYYY(str) {
  const [d, m, y] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function generarRangoFechas(inicioDate, finDate) {
  const fechas = [];
  const actual = new Date(inicioDate);
  while (actual <= finDate) {
    fechas.push(formatearFechaMiteco(actual));
    actual.setDate(actual.getDate() + 1);
  }
  return fechas;
}

async function obtenerPreciosCCAA(fecha, idProducto) {
  const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/FiltroCCAAProducto/${fecha}/${ID_EXTREMADURA}/${idProducto}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const estaciones = data.ListaEESSPrecio || [];
    const precios = [];
    for (const eess of estaciones) {
      const precioRaw = eess['PrecioProducto'] || eess['Precio Gasolina 95 E5'] || eess['Precio Gasoleo A'];
      const p = parsePrecio(precioRaw);
      if (p !== null) precios.push(p);
    }
    return precios;
  } catch {
    return [];
  }
}

async function obtenerPreciosProvincia(fecha, idProvincia, idProducto) {
  const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/FiltroProvinciaProducto/${fecha}/${idProvincia}/${idProducto}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const estaciones = data.ListaEESSPrecio || [];
    const precios = [];
    for (const eess of estaciones) {
      const precioRaw = eess['PrecioProducto'] || eess['Precio Gasolina 95 E5'] || eess['Precio Gasoleo A'];
      const p = parsePrecio(precioRaw);
      if (p !== null) precios.push(p);
    }
    return precios;
  } catch {
    return [];
  }
}

async function procesarDiaCompleto(fecha) {
  const [extG95, extGasA, badG95, badGasA, cacG95, cacGasA] = await Promise.all([
    obtenerPreciosCCAA(fecha, PRODUCTOS.GASOLINA_95),
    obtenerPreciosCCAA(fecha, PRODUCTOS.GASOLEO_A),
    obtenerPreciosProvincia(fecha, PROVINCIAS.BADAJOZ, PRODUCTOS.GASOLINA_95),
    obtenerPreciosProvincia(fecha, PROVINCIAS.BADAJOZ, PRODUCTOS.GASOLEO_A),
    obtenerPreciosProvincia(fecha, PROVINCIAS.CACERES, PRODUCTOS.GASOLINA_95),
    obtenerPreciosProvincia(fecha, PROVINCIAS.CACERES, PRODUCTOS.GASOLEO_A)
  ]);

  return {
    regional: {
      fecha,
      gasolina95_E5: calcularMedia(extG95),
      gasoleoA: calcularMedia(extGasA),
      estacionesG95: extG95.length,
      estacionesGasA: extGasA.length
    },
    provincial: {
      fecha,
      badajoz: {
        gasolina95_E5: calcularMedia(badG95),
        gasoleoA: calcularMedia(badGasA),
        estaciones: badG95.length
      },
      caceres: {
        gasolina95_E5: calcularMedia(cacG95),
        gasoleoA: calcularMedia(cacGasA),
        estaciones: cacG95.length
      }
    }
  };
}

async function main() {
  const pathExtPublic = path.join(ROOT_DIR, 'public', 'datos', 'historico_extremadura_2026.json');
  const pathProvPublic = path.join(ROOT_DIR, 'public', 'datos', 'historico_provincias_extremadura_2026.json');
  const pathExtSrc = path.join(ROOT_DIR, 'src', 'data', 'historico_extremadura_2026.json');
  const pathProvSrc = path.join(ROOT_DIR, 'src', 'data', 'historico_provincias_extremadura_2026.json');

  const histExt = JSON.parse(await fs.readFile(pathExtPublic, 'utf-8'));
  const histProv = JSON.parse(await fs.readFile(pathProvPublic, 'utf-8'));

  const ultimaFechaStr = histExt[histExt.length - 1]?.fecha || '30-09-2026';
  const ultimaFecha = parseFechaDDMMYYYY(ultimaFechaStr);

  // Permite pasar rango por argumentos: node scripts/actualizar_historico_mes.mjs 2026-10-01 2026-10-31
  const argInicio = process.argv[2];
  const argFin = process.argv[3];

  let fechaInicio;
  if (argInicio) {
    fechaInicio = new Date(argInicio);
  } else {
    fechaInicio = new Date(ultimaFecha);
    fechaInicio.setDate(fechaInicio.getDate() + 1);
  }

  let fechaFin;
  if (argFin) {
    fechaFin = new Date(argFin);
  } else {
    fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() - 1); // Hasta ayer cerrado
  }

  const fechas = generarRangoFechas(fechaInicio, fechaFin);
  if (!fechas.length) {
    console.log(`El histórico ya está al día (última fecha registrada: ${ultimaFechaStr}).`);
    return;
  }

  console.log(`=== Actualización incremental del histórico (${fechas[0]} -> ${fechas[fechas.length - 1]}) ===`);
  console.log(`Total de días a descargar manualmente: ${fechas.length}`);

  const mapaExt = new Map(histExt.map(item => [item.fecha, item]));
  const mapaProv = new Map(histProv.map(item => [item.fecha, item]));

  for (let i = 0; i < fechas.length; i++) {
    const f = fechas[i];
    const { regional, provincial } = await procesarDiaCompleto(f);
    if (regional.gasolina95_E5 !== null || regional.gasoleoA !== null) {
      mapaExt.set(f, regional);
    }
    if (provincial.badajoz.gasolina95_E5 !== null || provincial.caceres.gasolina95_E5 !== null) {
      mapaProv.set(f, provincial);
    }
    process.stdout.write(`Progreso: ${i + 1}/${fechas.length} (${f})...\r`);
    await new Promise(r => setTimeout(r, 150));
  }

  const nuevoExt = Array.from(mapaExt.values());
  const nuevoProv = Array.from(mapaProv.values());

  await fs.writeFile(pathExtPublic, JSON.stringify(nuevoExt, null, 2));
  await fs.writeFile(pathProvPublic, JSON.stringify(nuevoProv, null, 2));
  await fs.writeFile(pathExtSrc, JSON.stringify(nuevoExt, null, 2));
  await fs.writeFile(pathProvSrc, JSON.stringify(nuevoProv, null, 2));

  console.log(`\n✓ Histórico actualizado con éxito (${nuevoExt.length} días registrados).`);
}

main();
