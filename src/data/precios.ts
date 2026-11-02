import hoyRaw from "./hoy_extremadura.json";
import historicoExtRaw from "./historico_extremadura_2026.json";
import historicoProvRaw from "./historico_provincias_extremadura_2026.json";

export interface EstacionResumen {
  ideess?: string;
  rotulo: string;
  direccion: string;
  municipio?: string;
  localidad?: string;
  provincia?: string;
  codigoProvincia?: string;
  cp?: string;
  horario: string;
  tipoVenta: string;
  precio: number;
}

export interface EstacionMunicipio {
  rotulo: string;
  direccion: string;
  localidad: string;
  cp: string;
  horario: string;
  tipoVenta: string;
  gasolina95: number | null;
  gasoleoA: number | null;
  gasoleoPremium: number | null;
  gasolina98: number | null;
}

export interface PoblacionDatos {
  municipio: string;
  idMunicipio: string;
  provincia: string;
  codigoProvincia: string;
  cp: string;
  numEstaciones: number;
  estacionesPublicas: number;
  mediaGasolina95: number | null;
  mediaGasoleoA: number | null;
  minGasolina95: number | null;
  maxGasolina95: number | null;
  minGasoleoA: number | null;
  maxGasoleoA: number | null;
  mejorEstacionGasolina95: {
    rotulo: string;
    direccion: string;
    precio: number;
    horario: string;
    tipoVenta: string;
  } | null;
  mejorEstacionGasoleoA: {
    rotulo: string;
    direccion: string;
    precio: number;
    horario: string;
    tipoVenta: string;
  } | null;
  diferenciaMediaRegionalG95: number | null;
  diferenciaMediaRegionalGasA: number | null;
  estaciones: EstacionMunicipio[];
}

export interface MesConsolidado {
  clave: string; // YYYY-MM
  anio: string;
  mesNum: number;
  mesCorto: string;
  mesLargo: string;
  etiqueta: string;
  diasComputados: number;
  extremadura: {
    gasolina95: number;
    gasoleoA: number;
    diferencial: number;
  };
  badajoz: {
    gasolina95: number;
    gasoleoA: number;
    diferencial: number;
  };
  caceres: {
    gasolina95: number;
    gasoleoA: number;
    diferencial: number;
  };
  brechaProvincialG95: number; // caceres - badajoz
  brechaProvincialGasA: number;
}

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function fmtPrecio(val: number | null | undefined, decimales = 3): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "—";
  return val.toFixed(decimales).replace(".", ",");
}

export function fmtFechaCorta(fechaDDMMYYYY: string): string {
  if (!fechaDDMMYYYY) return "";
  const [dd, mm, yyyy] = fechaDDMMYYYY.split("-");
  const m = MESES_CORTOS[Number(mm) - 1] || mm;
  return `${dd} ${m} ${yyyy}`;
}

// Procesar serie histórica diaria 2025-2026
interface RegistroExt {
  fecha: string;
  gasolina95_E5: number | null;
  gasoleoA: number | null;
  estacionesG95?: number;
  estacionesGasA?: number;
}

interface RegistroProv {
  fecha: string;
  badajoz?: { gasolina95_E5: number | null; gasoleoA: number | null; estaciones?: number };
  caceres?: { gasolina95_E5: number | null; gasoleoA: number | null; estaciones?: number };
}

const serieExt = (historicoExtRaw as RegistroExt[]).filter(
  (d) => d && d.fecha && typeof d.gasolina95_E5 === "number" && typeof d.gasoleoA === "number"
);

const serieProv = (historicoProvRaw as RegistroProv[]).filter(
  (d) => d && d.fecha && d.badajoz && d.caceres
);

const mapaProvPorFecha = new Map<string, RegistroProv>();
for (const p of serieProv) {
  mapaProvPorFecha.set(p.fecha, p);
}

// Agrupación mensual completa 2025 y 2026
const acumuladorMensual = new Map<
  string,
  {
    extG95: number[];
    extGasA: number[];
    badG95: number[];
    badGasA: number[];
    cacG95: number[];
    cacGasA: number[];
  }
>();

for (const d of serieExt) {
  const [, mm, yyyy] = d.fecha.split("-");
  if (!yyyy || !mm) continue;
  const clave = `${yyyy}-${mm}`;
  if (!acumuladorMensual.has(clave)) {
    acumuladorMensual.set(clave, {
      extG95: [],
      extGasA: [],
      badG95: [],
      badGasA: [],
      cacG95: [],
      cacGasA: []
    });
  }
  const grupo = acumuladorMensual.get(clave)!;
  if (typeof d.gasolina95_E5 === "number") grupo.extG95.push(d.gasolina95_E5);
  if (typeof d.gasoleoA === "number") grupo.extGasA.push(d.gasoleoA);

  const provDia = mapaProvPorFecha.get(d.fecha);
  if (provDia?.badajoz?.gasolina95_E5) grupo.badG95.push(provDia.badajoz.gasolina95_E5);
  if (provDia?.badajoz?.gasoleoA) grupo.badGasA.push(provDia.badajoz.gasoleoA);
  if (provDia?.caceres?.gasolina95_E5) grupo.cacG95.push(provDia.caceres.gasolina95_E5);
  if (provDia?.caceres?.gasoleoA) grupo.cacGasA.push(provDia.caceres.gasoleoA);
}

function mediaArr(arr: number[]): number {
  if (!arr.length) return 0;
  return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3));
}

export const MESES_HISTORICO: MesConsolidado[] = Array.from(acumuladorMensual.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([clave, g]) => {
    const [anio, mesStr] = clave.split("-");
    const mesNum = Number(mesStr);
    const extG95 = mediaArr(g.extG95);
    const extGasA = mediaArr(g.extGasA);
    const badG95 = mediaArr(g.badG95);
    const badGasA = mediaArr(g.badGasA);
    const cacG95 = mediaArr(g.cacG95);
    const cacGasA = mediaArr(g.cacGasA);

    return {
      clave,
      anio,
      mesNum,
      mesCorto: `${MESES_CORTOS[mesNum - 1]} ${anio.slice(2)}`,
      mesLargo: `${MESES_LARGOS[mesNum - 1]} ${anio}`,
      etiqueta: `${MESES_LARGOS[mesNum - 1]} de ${anio}`,
      diasComputados: g.extG95.length,
      extremadura: {
        gasolina95: extG95,
        gasoleoA: extGasA,
        diferencial: Number((extGasA - extG95).toFixed(3))
      },
      badajoz: {
        gasolina95: badG95,
        gasoleoA: badGasA,
        diferencial: Number((badGasA - badG95).toFixed(3))
      },
      caceres: {
        gasolina95: cacG95,
        gasoleoA: cacGasA,
        diferencial: Number((cacGasA - cacG95).toFixed(3))
      },
      brechaProvincialG95: Number((cacG95 - badG95).toFixed(3)),
      brechaProvincialGasA: Number((cacGasA - badGasA).toFixed(3))
    };
  });

// Récords históricos 2025-2026
const diaMinG95 = serieExt.reduce((a, b) => ((b.gasolina95_E5 ?? 99) < (a.gasolina95_E5 ?? 99) ? b : a));
const diaMaxG95 = serieExt.reduce((a, b) => ((b.gasolina95_E5 ?? 0) > (a.gasolina95_E5 ?? 0) ? b : a));
const diaMinGasA = serieExt.reduce((a, b) => ((b.gasoleoA ?? 99) < (a.gasoleoA ?? 99) ? b : a));
const diaMaxGasA = serieExt.reduce((a, b) => ((b.gasoleoA ?? 0) > (a.gasoleoA ?? 0) ? b : a));

const mesMinG95 = MESES_HISTORICO.reduce((a, b) =>
  b.extremadura.gasolina95 < a.extremadura.gasolina95 ? b : a
);
const mesMaxG95 = MESES_HISTORICO.reduce((a, b) =>
  b.extremadura.gasolina95 > a.extremadura.gasolina95 ? b : a
);
const mesMinGasA = MESES_HISTORICO.reduce((a, b) =>
  b.extremadura.gasoleoA < a.extremadura.gasoleoA ? b : a
);
const mesMaxGasA = MESES_HISTORICO.reduce((a, b) =>
  b.extremadura.gasoleoA > a.extremadura.gasoleoA ? b : a
);

const meses2025 = MESES_HISTORICO.filter((m) => m.anio === "2025");
const meses2026 = MESES_HISTORICO.filter((m) => m.anio === "2026");

const media2025G95 = mediaArr(meses2025.map((m) => m.extremadura.gasolina95));
const media2025GasA = mediaArr(meses2025.map((m) => m.extremadura.gasoleoA));
const media2026G95 = mediaArr(meses2026.map((m) => m.extremadura.gasolina95));
const media2026GasA = mediaArr(meses2026.map((m) => m.extremadura.gasoleoA));

export const RESUMEN_HISTORICO = {
  totalDiasAnalizados: serieExt.length,
  fechaInicio: fmtFechaCorta(serieExt[0]?.fecha || "01-01-2025"),
  fechaFin: fmtFechaCorta(serieExt[serieExt.length - 1]?.fecha || "30-09-2026"),
  diaMinG95: { fecha: fmtFechaCorta(diaMinG95.fecha), precio: diaMinG95.gasolina95_E5! },
  diaMaxG95: { fecha: fmtFechaCorta(diaMaxG95.fecha), precio: diaMaxG95.gasolina95_E5! },
  diaMinGasA: { fecha: fmtFechaCorta(diaMinGasA.fecha), precio: diaMinGasA.gasoleoA! },
  diaMaxGasA: { fecha: fmtFechaCorta(diaMaxGasA.fecha), precio: diaMaxGasA.gasoleoA! },
  mesMinG95,
  mesMaxG95,
  mesMinGasA,
  mesMaxGasA,
  media2025G95,
  media2025GasA,
  media2026G95,
  media2026GasA,
  oscilacionDeposito50LG95: Number(((diaMaxG95.gasolina95_E5! - diaMinG95.gasolina95_E5!) * 50).toFixed(2)),
  oscilacionDeposito50LGasA: Number(((diaMaxGasA.gasoleoA! - diaMinGasA.gasoleoA!) * 50).toFixed(2))
};

// Rankings de municipios más baratos hoy
const todasPoblaciones = (hoyRaw.todasLasPoblaciones || []) as PoblacionDatos[];

export const TOP_MUNICIPIOS_BARATOS_G95 = [...todasPoblaciones]
  .filter((p) => p.mediaGasolina95 !== null)
  .sort((a, b) => (a.mediaGasolina95 ?? 99) - (b.mediaGasolina95 ?? 99))
  .slice(0, 6);

export const TOP_MUNICIPIOS_BARATOS_GASA = [...todasPoblaciones]
  .filter((p) => p.mediaGasoleoA !== null)
  .sort((a, b) => (a.mediaGasoleoA ?? 99) - (b.mediaGasoleoA ?? 99))
  .slice(0, 6);

export const HOY_EXTREMADURA = {
  fechaMiteco: hoyRaw.fechaMiteco,
  fechaLegible: hoyRaw.fechaLegible,
  actualizadoEn: hoyRaw.actualizadoEn,
  totalMunicipiosConEstacion: hoyRaw.totalMunicipiosConEstacion,
  extremadura: hoyRaw.extremadura,
  provincias: hoyRaw.provincias,
  comparativaHoy: hoyRaw.comparativaHoy,
  principalesLocalidades: (hoyRaw.principalesLocalidades || []) as PoblacionDatos[],
  todasLasPoblaciones: todasPoblaciones
};

// Endpoints oficiales MITECO
export const API_MITECO = {
  baseUrl: "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes",
  endpoints: [
    {
      nombre: "Estaciones de Extremadura en tiempo real (CCAA 11)",
      metodo: "GET",
      url: "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroCCAA/11",
      descripcion: "Devuelve todas las gasolineras activas hoy en Extremadura con precios vigentes de Gasolina 95 E5, Gasóleo A, coordenadas, horario y rótulo.",
      formato: "JSON / XML"
    },
    {
      nombre: "Estaciones de la provincia de Badajoz hoy (ID 06)",
      metodo: "GET",
      url: "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/06",
      descripcion: "Filtra exclusivamente las estaciones de servicio situadas en los municipios de la provincia de Badajoz.",
      formato: "JSON / XML"
    },
    {
      nombre: "Estaciones de la provincia de Cáceres hoy (ID 10)",
      metodo: "GET",
      url: "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/10",
      descripcion: "Filtra exclusivamente las estaciones de servicio situadas en los municipios de la provincia de Cáceres.",
      formato: "JSON / XML"
    },
    {
      nombre: "Histórico por Fecha, CCAA y Producto (Serie 2025-2026)",
      metodo: "GET",
      url: "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/FiltroCCAAProducto/{DD-MM-YYYY}/11/{ID_PRODUCTO}",
      descripcion: "Permite reconstruir la serie histórica día a día para Gasolina 95 E5 (ID_PRODUCTO = 1) y Gasóleo A (ID_PRODUCTO = 3) en Extremadura.",
      formato: "JSON / XML"
    },
    {
      nombre: "Histórico por Fecha, Provincia y Producto",
      metodo: "GET",
      url: "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHist/FiltroProvinciaProducto/{DD-MM-YYYY}/{06|10}/{1|3}",
      descripcion: "Endpoint utilizado por nuestros scripts en /scripts para extraer las series provinciales comparadas de Badajoz (06) y Cáceres (10).",
      formato: "JSON / XML"
    }
  ]
};

// FAQs dinámicas enriquecidas con los datos reales del día y del histórico 2025-2026
const extHoy = HOY_EXTREMADURA.extremadura;
const badHoy = HOY_EXTREMADURA.provincias.badajoz;
const cacHoy = HOY_EXTREMADURA.provincias.caceres;
const minG95Hoy = extHoy.minGasolina95;
const minGasAHoy = extHoy.minGasoleoA;

export const FAQS_SEO = [
  {
    categoria: "Precios de Hoy",
    pregunta: `¿Cuál es el precio medio de la Gasolina 95 y el Diésel hoy (${HOY_EXTREMADURA.fechaLegible}) en Extremadura?`,
    respuesta: `Hoy, ${HOY_EXTREMADURA.fechaLegible}, el precio medio de la Gasolina 95 E5 en Extremadura es de ${fmtPrecio(extHoy.mediaGasolina95)} €/litro (calculado sobre ${extHoy.estacionesGasolina95} estaciones), mientras que el Gasóleo A (diésel) registra una media autonómica de ${fmtPrecio(extHoy.mediaGasoleoA)} €/litro en ${extHoy.estacionesGasoleoA} surtidores activos. Llenar un depósito estándar de 50 litros cuesta hoy de media ${fmtPrecio(extHoy.costeDeposito50L.gasolina95Media, 2)} € en gasolina 95 y ${fmtPrecio(extHoy.costeDeposito50L.gasoleoAMedia, 2)} € en diésel.`
  },
  {
    categoria: "Precios de Hoy",
    pregunta: "¿Cuál es la gasolinera más barata hoy en Extremadura para echar Gasolina 95 y Gasóleo A?",
    respuesta: `Según los registros oficiales remitidos hoy al MITECO, el surtidor público más económico de Extremadura para Gasolina 95 E5 está en ${minG95Hoy?.municipio} (${minG95Hoy?.provincia}), en la estación ${minG95Hoy?.rotulo} (${minG95Hoy?.direccion}), con un precio de ${fmtPrecio(minG95Hoy?.precio)} €/litro. En cuanto al Gasóleo A (diésel), el precio más bajo de hoy se encuentra en ${minGasAHoy?.municipio} (${minGasAHoy?.provincia}), en ${minGasAHoy?.rotulo} (${minGasAHoy?.direccion}), a ${fmtPrecio(minGasAHoy?.precio)} €/litro.`
  },
  {
    categoria: "Comparativa Provincial",
    pregunta: "¿Dónde es más barato repostar hoy, en la provincia de Badajoz o en la de Cáceres?",
    respuesta: `En la jornada de hoy (${HOY_EXTREMADURA.fechaLegible}), la provincia de Badajoz registra una media de ${fmtPrecio(badHoy.mediaGasolina95)} €/L en Gasolina 95 y ${fmtPrecio(badHoy.mediaGasoleoA)} €/L en Gasóleo A (${badHoy.totalEstaciones} estaciones), frente a los ${fmtPrecio(cacHoy.mediaGasolina95)} €/L en Gasolina 95 y ${fmtPrecio(cacHoy.mediaGasoleoA)} €/L en Gasóleo A de la provincia de Cáceres (${cacHoy.totalEstaciones} estaciones). En diésel, repostar hoy en Badajoz supone un ahorro medio de ${fmtPrecio(Math.abs(HOY_EXTREMADURA.comparativaHoy.diferenciaGasoleoACentimos), 1)} céntimos por litro (${fmtPrecio(HOY_EXTREMADURA.comparativaHoy.ahorroDeposito50LGasoleoA, 2)} € por depósito de 50 L).`
  },
  {
    categoria: "Localidades",
    pregunta: "¿Cuánto cuesta hoy la gasolina y el diésel en Badajoz capital, Cáceres, Mérida, Plasencia y Don Benito?",
    respuesta: `En las principales ciudades extremeñas los promedios de hoy son: Badajoz capital (${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Badajoz")?.mediaGasolina95)} €/L en G95 y ${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Badajoz")?.mediaGasoleoA)} €/L en diésel), Cáceres capital (${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Cáceres")?.mediaGasolina95)} €/L y ${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Cáceres")?.mediaGasoleoA)} €/L), Mérida (${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Mérida")?.mediaGasolina95)} €/L y ${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Mérida")?.mediaGasoleoA)} €/L), Plasencia (${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Plasencia")?.mediaGasolina95)} €/L y ${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Plasencia")?.mediaGasoleoA)} €/L) y Don Benito (${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Don Benito")?.mediaGasolina95)} €/L y ${fmtPrecio(HOY_EXTREMADURA.principalesLocalidades.find(p => p.municipio === "Don Benito")?.mediaGasoleoA)} €/L).`
  },
  {
    categoria: "Histórico 2025–2026",
    pregunta: "¿Cómo ha evolucionado el precio del combustible en Extremadura entre 2025 y 2026?",
    respuesta: `El análisis de los ${RESUMEN_HISTORICO.totalDiasAnalizados} días monitorizados entre enero de 2025 y finales de 2026 muestra dos etapas muy marcadas: durante 2025 el precio medio anual en Extremadura se mantuvo contenido en ${fmtPrecio(RESUMEN_HISTORICO.media2025G95)} €/L para la gasolina 95 y ${fmtPrecio(RESUMEN_HISTORICO.media2025GasA)} €/L para el diésel (tocando suelo en mayo de 2025 y junio de 2026 en torno a ${fmtPrecio(RESUMEN_HISTORICO.diaMinG95.precio)} €/L). Sin embargo, en el tercer trimestre de 2026 se produjo una fuerte escalada hasta alcanzar máximos el ${RESUMEN_HISTORICO.diaMaxG95.fecha} con ${fmtPrecio(RESUMEN_HISTORICO.diaMaxG95.precio)} €/L en gasolina 95 y ${fmtPrecio(RESUMEN_HISTORICO.diaMaxGasA.precio)} €/L en gasóleo A.`
  },
  {
    categoria: "Anomalía del Diésel",
    pregunta: "¿Por qué el Gasóleo A (diésel) es más caro que la Gasolina 95 en Extremadura?",
    respuesta: `Hoy el litro de Gasóleo A en Extremadura supera al de Gasolina 95 E5 en +${fmtPrecio((extHoy.diferencialDieselGasolina ?? 0) * 100, 1)} céntimos por litro (${fmtPrecio(extHoy.mediaGasoleoA)} €/L frente a ${fmtPrecio(extHoy.mediaGasolina95)} €/L). Esta inversión respecto al patrón histórico se explica por la menor capacidad europea de refino de destilados medios, la fuerte demanda de transporte pesado y maquinaria agraria en campañas de regadío en las Vegas del Guadiana, y el consumo estacional de calefacción en comarcas del norte cacereño.`
  },
  {
    categoria: "Calidad y Ahorro",
    pregunta: "¿Existe diferencia de calidad entre las gasolineras low-cost y las marcas tradicionales en Extremadura?",
    respuesta: "Todo el combustible que se comercializa en las estaciones de servicio de Badajoz y Cáceres procede de las mismas plantas logísticas de Exolum (antigua CLH, con centros de almacenamiento en Mérida y Badajoz) y cumple obligatoriamente las normas técnicas europeas EN 228 (Gasolina 95) y EN 590 (Gasóleo A). El producto base es exactamente idéntico y seguro para cualquier motor moderno; la diferencia radica en los paquetes de aditivos detergentes y antiespumantes que añaden las cadenas abanderadas y en los costes operativos de las estaciones automatizadas."
  },
  {
    categoria: "Actualización y Datos",
    pregunta: "¿A qué hora se actualizan los precios de las gasolineras en esta web?",
    respuesta: "Los precios de todas las estaciones de Extremadura se capturan y compilan automáticamente todos los días a las 06:00 de la mañana (hora peninsular española) conectando directamente con el servicio REST oficial del Ministerio para la Transición Ecológica y el Reto Demográfico (MITECO), regulado por la Orden ITC/2308/2007. Así, antes de las 07:00 AM cualquier conductor que salga a trabajar dispone de las tarifas vigentes del día."
  }
];
