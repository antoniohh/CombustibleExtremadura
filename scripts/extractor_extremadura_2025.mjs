import fs from 'fs/promises';

const ID_EXTREMADURA = "11";
const ID_GASOLINA_95 = "1";
const ID_GASOLEO_A = "3";

// Convierte string "1,549" a float 1.549
function parsePrecio(valor) {
  if (!valor) return null;
  const num = parseFloat(valor.replace(',', '.'));
  return isNaN(num) ? null : num;
}

// Calcula la media de un array
function calcularMedia(arr) {
  if (!arr.length) return null;
  const suma = arr.reduce((acc, curr) => acc + curr, 0);
  return suma / arr.length;
}

// Formatea Date a DD-MM-YYYY
function formatearFecha(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

// Genera la lista de días entre dos fechas
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

// Consulta un producto específico en Extremadura para una fecha concreta
async function obtenerPreciosProducto(fecha, idProducto) {
  const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/FiltroCCAAProducto/${fecha}/${ID_EXTREMADURA}/${idProducto}`;

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) return [];
    const data = await res.json();
    const estaciones = data.ListaEESSPrecio || [];

    const precios = [];
    for (const eess of estaciones) {
      // El campo de precio varía según el producto devuelto
      const precioRaw = eess["PrecioProducto"] || eess["Precio Gasolina 95 E5"] || eess["Precio Gasoleo A"];
      const p = parsePrecio(precioRaw);
      if (p !== null) precios.push(p);
    }
    return precios;
  } catch (err) {
    return [];
  }
}

// Procesa ambos productos para un día
async function procesarDia(fecha) {
  const [preciosG95, preciosGasA] = await Promise.all([
    obtenerPreciosProducto(fecha, ID_GASOLINA_95),
    obtenerPreciosProducto(fecha, ID_GASOLEO_A)
  ]);

  const mediaG95 = calcularMedia(preciosG95);
  const mediaGasA = calcularMedia(preciosGasA);

  return {
    fecha,
    gasolina95_E5: mediaG95 ? Number(mediaG95.toFixed(3)) : null,
    gasoleoA: mediaGasA ? Number(mediaGasA.toFixed(3)) : null,
    estacionesG95: preciosG95.length,
    estacionesGasA: preciosGasA.length
  };
}

async function main() {
  console.log("=== Extracción Diaria Extremadura (Ene 2025 - Sep 2026) ===");

  const fechas = generarRangoFechas("2025-01-01", "2026-09-30");
  console.log(`Días totales a consultar: ${fechas.length}\n`);

  const resultados = [];
  const CONCURRENCIA = 3; // 3 días a la vez (6 peticiones simultáneas)

  for (let i = 0; i < fechas.length; i += CONCURRENCIA) {
    const lote = fechas.slice(i, i + CONCURRENCIA);
    const respuestas = await Promise.all(lote.map(f => procesarDia(f)));
    resultados.push(...respuestas);

    const progreso = Math.min(i + CONCURRENCIA, fechas.length);
    process.stdout.write(`Progreso: ${progreso}/${fechas.length} días... \r`);

    // Pequeña pausa de 100ms para cortesía con el API
    await new Promise(r => setTimeout(r, 100));
  }

  console.log("\n\n¡Completado!");

  const jsonStr = JSON.stringify(resultados, null, 2);
  await fs.writeFile('public/datos/historico_extremadura_2026.json', jsonStr);
  await fs.writeFile('src/data/historico_extremadura_2026.json', jsonStr);
  console.log('Guardado en public/datos/historico_extremadura_2026.json y src/data/historico_extremadura_2026.json');
}

main();
