import fs from 'fs/promises';

const PROVINCIAS = {
  BADAJOZ: "06",
  CACERES: "10"
};

const PRODUCTOS = {
  GASOLINA_95: "1",
  GASOLEO_A: "3"
};

function parsePrecio(valor) {
  if (!valor) return null;
  const num = parseFloat(valor.replace(',', '.'));
  return isNaN(num) ? null : num;
}

function calcularMedia(arr) {
  if (!arr.length) return null;
  const suma = arr.reduce((acc, curr) => acc + curr, 0);
  return suma / arr.length;
}

function formatearFecha(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

function generarRangoFechas(inicioStr, finStr) {
  const fechas = [];
  let actual = new Date(inicioStr);
  const fin = new Date(finStr);

  while (actual <= fin) {
    fechas.push(formatearFecha(actual));
    actual.setDate(actual.getDate() + 1);
  }
  return fechas;
}

// Obtener precios por fecha, provincia y producto
async function obtenerPrecios(fecha, idProvincia, idProducto) {
  const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/FiltroProvinciaProducto/${fecha}/${idProvincia}/${idProducto}`;

  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return [];

    const data = await res.json();
    const estaciones = data.ListaEESSPrecio || [];

    const precios = [];
    for (const eess of estaciones) {
      const precioRaw = eess["PrecioProducto"] || eess["Precio Gasolina 95 E5"] || eess["Precio Gasoleo A"];
      const p = parsePrecio(precioRaw);
      if (p !== null) precios.push(p);
    }
    return precios;
  } catch (err) {
    return [];
  }
}

// Procesa Badajoz y Cáceres en paralelo para un día
async function procesarDiaProvincial(fecha) {
  const [
    badajozG95, badajozGasA,
    caceresG95, caceresGasA
  ] = await Promise.all([
    obtenerPrecios(fecha, PROVINCIAS.BADAJOZ, PRODUCTOS.GASOLINA_95),
    obtenerPrecios(fecha, PROVINCIAS.BADAJOZ, PRODUCTOS.GASOLEO_A),
    obtenerPrecios(fecha, PROVINCIAS.CACERES, PRODUCTOS.GASOLINA_95),
    obtenerPrecios(fecha, PROVINCIAS.CACERES, PRODUCTOS.GASOLEO_A)
  ]);

  const mBadajozG95 = calcularMedia(badajozG95);
  const mBadajozGasA = calcularMedia(badajozGasA);
  const mCaceresG95 = calcularMedia(caceresG95);
  const mCaceresGasA = calcularMedia(caceresGasA);

  return {
    fecha,
    badajoz: {
      gasolina95_E5: mBadajozG95 ? Number(mBadajozG95.toFixed(3)) : null,
      gasoleoA: mBadajozGasA ? Number(mBadajozGasA.toFixed(3)) : null,
      estaciones: badajozG95.length
    },
    caceres: {
      gasolina95_E5: mCaceresG95 ? Number(mCaceresG95.toFixed(3)) : null,
      gasoleoA: mCaceresGasA ? Number(mCaceresGasA.toFixed(3)) : null,
      estaciones: caceresG95.length
    }
  };
}

async function main() {
  console.log("=== Extrayendo datos diarios de Badajoz y Cáceres (Ene 2025 - Sep 2026) ===");

  const fechas = generarRangoFechas("2025-01-01", "2026-09-30");
  const resultados = [];
  const CONCURRENCIA = 2; // 2 días en paralelo (8 llamadas HTTP a la vez)

  for (let i = 0; i < fechas.length; i += CONCURRENCIA) {
    const lote = fechas.slice(i, i + CONCURRENCIA);
    const respuestas = await Promise.all(lote.map(f => procesarDiaProvincial(f)));
    resultados.push(...respuestas);

    const progreso = Math.min(i + CONCURRENCIA, fechas.length);
    process.stdout.write(`Progreso: ${progreso}/${fechas.length} días... \r`);

    await new Promise(r => setTimeout(r, 100));
  }

  console.log("\n\n¡Completado!");

  const jsonStr = JSON.stringify(resultados, null, 2);
  await fs.writeFile('public/datos/historico_provincias_extremadura_2026.json', jsonStr);
  await fs.writeFile('src/data/historico_provincias_extremadura_2026.json', jsonStr);
  console.log('Guardado en public/datos/historico_provincias_extremadura_2026.json y src/data/historico_provincias_extremadura_2026.json');
}

main();
