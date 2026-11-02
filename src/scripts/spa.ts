import Chart from "chart.js/auto";

interface EstacionMun {
  rotulo: string;
  direccion: string;
  localidad: string;
  cp: string;
  horario: string;
  tipoVenta: string;
  gasolina95: number | null;
  gasoleoA: number | null;
}

interface PoblacionItem {
  municipio: string;
  provincia: string;
  codigoProvincia: string;
  cp: string;
  numEstaciones: number;
  mediaGasolina95: number | null;
  mediaGasoleoA: number | null;
  minGasolina95: number | null;
  minGasoleoA: number | null;
  mejorEstacionGasolina95: { rotulo: string; direccion: string; precio: number } | null;
  mejorEstacionGasoleoA: { rotulo: string; direccion: string; precio: number } | null;
  estaciones: EstacionMun[];
}

interface RegExt {
  fecha: string;
  gasolina95_E5: number | null;
  gasoleoA: number | null;
}

interface RegProv {
  fecha: string;
  badajoz: { gasolina95_E5: number | null; gasoleoA: number | null };
  caceres: { gasolina95_E5: number | null; gasoleoA: number | null };
}

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const FUENTE_GRAFICO = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function fmtPrecio(val: number | null | undefined, dec = 3): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "—";
  return `${val.toFixed(dec).replace(".", ",")} €/L`;
}

function fmtNum(val: number | null | undefined, dec = 3): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "—";
  return val.toFixed(dec).replace(".", ",");
}

function fmtFechaEje(fecha: string): string {
  if (!fecha) return "";
  const [dd, mm, yyyy] = fecha.split("-");
  const m = MESES_CORTOS[Number(mm) - 1] || mm;
  return `${dd} ${m} ${yyyy ? yyyy.slice(2) : ""}`;
}

function normalizarBusqueda(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ============================================================
// 1. CONMUTADOR TOP BARATAS HOY (GASOLINA 95 vs DIÉSEL)
// ============================================================
function inicializarTabsTopHoy() {
  const btns = document.querySelectorAll<HTMLButtonElement>("[data-top-tab]");
  const panels = document.querySelectorAll<HTMLElement>("[data-top-panel]");
  if (btns.length) {
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-top-tab");
        btns.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        panels.forEach((p) => {
          if (p.getAttribute("data-top-panel") === target) {
            p.classList.remove("hidden");
          } else {
            p.classList.add("hidden");
          }
        });
      });
    });
  }

  // Conmutadores independientes por provincia (Badajoz / Cáceres)
  const groups = document.querySelectorAll<HTMLElement>("[data-top-group]");
  groups.forEach((group) => {
    const groupBtns = group.querySelectorAll<HTMLButtonElement>("[data-group-tab]");
    const groupPanels = group.querySelectorAll<HTMLElement>("[data-group-panel]");
    groupBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-group-tab");
        groupBtns.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        groupPanels.forEach((p) => {
          if (p.getAttribute("data-group-panel") === target) {
            p.classList.remove("hidden");
          } else {
            p.classList.add("hidden");
          }
        });
      });
    });
  });
}

// ============================================================
// 2. EXPLORADOR INTERACTIVO DE LAS 179 POBLACIONES
// ============================================================
function inicializarExploradorPoblaciones() {
  const dataScript = document.getElementById("poblaciones-json-data");
  const tbody = document.getElementById("poblaciones-tbody");
  const contadorEl = document.getElementById("poblaciones-contador");
  const paginacionEl = document.getElementById("poblaciones-paginacion");
  const inputBusqueda = document.getElementById("poblaciones-search") as HTMLInputElement | null;
  const selectOrden = document.getElementById("poblaciones-sort") as HTMLSelectElement | null;
  const btnsProvincia = document.querySelectorAll<HTMLButtonElement>("[data-prov-filter]");
  const btnsLetra = document.querySelectorAll<HTMLButtonElement>("[data-letter-filter]");

  if (!dataScript || !tbody) return;

  let poblaciones: PoblacionItem[] = [];
  try {
    poblaciones = JSON.parse(dataScript.textContent || "[]");
  } catch (e) {
    console.error("Error parseando datos de poblaciones:", e);
    return;
  }

  let filtroTexto = "";
  let filtroProvincia = "todas";
  let filtroLetra = "todas";
  let ordenActual = "alfabetico";
  let paginaActual = 1;
  const POR_PAGINA = 15;
  let municipioAbierto: string | null = null;

  function obtenerFiltradas(): PoblacionItem[] {
    const q = normalizarBusqueda(filtroTexto);

    const filtradas = poblaciones.filter((item) => {
      if (filtroProvincia !== "todas" && item.codigoProvincia !== filtroProvincia) {
        return false;
      }
      if (filtroLetra !== "todas") {
        const inicial = normalizarBusqueda(item.municipio).charAt(0).toUpperCase();
        if (inicial !== filtroLetra) return false;
      }
      if (q) {
        const matchMun = normalizarBusqueda(item.municipio).includes(q);
        const matchCp = (item.cp || "").includes(q);
        const matchProv = normalizarBusqueda(item.provincia).includes(q);
        return matchMun || matchCp || matchProv;
      }
      return true;
    });

    filtradas.sort((a, b) => {
      if (ordenActual === "g95-asc") {
        return (a.minGasolina95 ?? 99) - (b.minGasolina95 ?? 99);
      }
      if (ordenActual === "diesel-asc") {
        return (a.minGasoleoA ?? 99) - (b.minGasoleoA ?? 99);
      }
      if (ordenActual === "estaciones-desc") {
        return b.numEstaciones - a.numEstaciones || a.municipio.localeCompare(b.municipio, "es");
      }
      return a.municipio.localeCompare(b.municipio, "es");
    });

    return filtradas;
  }

  function renderizarTabla() {
    if (!tbody) return;
    const lista = obtenerFiltradas();
    const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    if (paginaActual > totalPaginas) paginaActual = 1;

    const inicio = (paginaActual - 1) * POR_PAGINA;
    const paginaItems = lista.slice(inicio, inicio + POR_PAGINA);

    if (contadorEl) {
      contadorEl.textContent = `Mostrando ${paginaItems.length} de ${lista.length} municipios encontrados`;
    }

    if (!paginaItems.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-10 text-center text-slate-700 font-medium">
            No se encontraron localidades con ese criterio. Prueba a limpiar el filtro o buscar otro municipio.
          </td>
        </tr>
      `;
      if (paginacionEl) paginacionEl.innerHTML = "";
      return;
    }

    tbody.innerHTML = paginaItems
      .map((p) => {
        const isOpen = municipioAbierto === p.municipio;
        const badgeProv =
          p.codigoProvincia === "06"
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-900">Badajoz</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900">Cáceres</span>`;

        const mejorEstacionTexto = p.mejorEstacionGasoleoA
          ? `${p.mejorEstacionGasoleoA.rotulo} (${p.mejorEstacionGasoleoA.direccion})`
          : p.mejorEstacionGasolina95
          ? `${p.mejorEstacionGasolina95.rotulo} (${p.mejorEstacionGasolina95.direccion})`
          : "—";

        const detalleFilas = p.estaciones
          .map(
            (e) => `
            <tr class="border-t border-slate-200/80 text-xs">
              <td class="py-2.5 pr-3 font-bold text-slate-900">
                ${e.rotulo}
                ${
                  e.tipoVenta === "R"
                    ? `<span class="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-slate-200 text-slate-800 font-semibold" title="Venta restringida a socios/cooperativistas">Coop.</span>`
                    : ""
                }
              </td>
              <td class="py-2.5 px-3 text-slate-700">${e.direccion} <span class="text-slate-600">(${e.cp})</span></td>
              <td class="py-2.5 px-3 text-slate-700">${e.horario || "—"}</td>
              <td class="py-2.5 px-3 text-right font-bold text-sky-800 num-tabular">${fmtPrecio(e.gasolina95)}</td>
              <td class="py-2.5 pl-3 text-right font-bold text-amber-900 num-tabular">${fmtPrecio(e.gasoleoA)}</td>
            </tr>
          `
          )
          .join("");

        return `
          <tr class="hover:bg-slate-100/80 transition-colors cursor-pointer group" data-mun-row="${p.municipio}">
            <td class="px-4 sm:px-6 py-3.5 font-bold text-slate-900">
              <div class="flex items-center gap-2">
                <span>${p.municipio}</span>
                <span class="text-xs font-normal text-slate-600">(${p.cp})</span>
              </div>
            </td>
            <td class="px-3 py-3.5">${badgeProv}</td>
            <td class="px-3 py-3.5 text-center font-semibold text-slate-700 num-tabular">${p.numEstaciones}</td>
            <td class="px-3 py-3.5 text-right">
              <span class="font-bold text-sky-800 num-tabular">${fmtPrecio(p.mediaGasolina95)}</span>
              ${
                p.minGasolina95 && p.numEstaciones > 1
                  ? `<span class="block text-[11px] text-slate-600 num-tabular">Mín: ${fmtNum(p.minGasolina95)} €</span>`
                  : ""
              }
            </td>
            <td class="px-3 py-3.5 text-right">
              <span class="font-bold text-amber-900 num-tabular">${fmtPrecio(p.mediaGasoleoA)}</span>
              ${
                p.minGasoleoA && p.numEstaciones > 1
                  ? `<span class="block text-[11px] text-slate-600 num-tabular">Mín: ${fmtNum(p.minGasoleoA)} €</span>`
                  : ""
              }
            </td>
            <td class="px-4 sm:px-6 py-3.5 text-right">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-800 group-hover:border-sky-600 group-hover:text-sky-800 transition-colors"
                aria-expanded="${isOpen}"
              >
                <span>${isOpen ? "Ocultar" : "Ver"} (${p.numEstaciones})</span>
              </button>
            </td>
          </tr>
          <tr class="${isOpen ? "" : "hidden"} bg-slate-100/90" data-mun-detail="${p.municipio}">
            <td colspan="6" class="px-4 sm:px-6 py-4">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold text-slate-900">
                  Surtidores en ${p.municipio} (${p.provincia}) · Más económica hoy: ${mejorEstacionTexto}
                </span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="text-[11px] font-bold uppercase text-slate-700 border-b border-slate-300">
                      <th class="pb-2 pr-3">Rótulo</th>
                      <th class="pb-2 px-3">Dirección</th>
                      <th class="pb-2 px-3">Horario</th>
                      <th class="pb-2 px-3 text-right">Gasolina 95</th>
                      <th class="pb-2 pl-3 text-right">Gasóleo A</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${detalleFilas}
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    // Eventos de fila para expandir/contraer estaciones del municipio
    tbody.querySelectorAll<HTMLTableRowElement>("[data-mun-row]").forEach((row) => {
      row.addEventListener("click", () => {
        const nombre = row.getAttribute("data-mun-row");
        if (!nombre) return;
        municipioAbierto = municipioAbierto === nombre ? null : nombre;
        renderizarTabla();
      });
    });

    // Renderizar paginación
    if (paginacionEl) {
      if (totalPaginas <= 1) {
        paginacionEl.innerHTML = "";
      } else {
        const botones: string[] = [];
        botones.push(`
          <button type="button" data-page="${Math.max(1, paginaActual - 1)}" ${paginaActual === 1 ? "disabled" : ""}
            class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 disabled:opacity-40 hover:bg-slate-100">
            Anterior
          </button>
        `);

        for (let p = 1; p <= totalPaginas; p++) {
          if (p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 1) {
            const activo = p === paginaActual;
            botones.push(`
              <button type="button" data-page="${p}"
                class="px-3 py-1.5 rounded-lg border text-xs font-bold num-tabular ${
                  activo
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
                }">
                ${p}
              </button>
            `);
          } else if (Math.abs(p - paginaActual) === 2) {
            botones.push(`<span class="px-1 text-xs text-slate-600">…</span>`);
          }
        }

        botones.push(`
          <button type="button" data-page="${Math.min(totalPaginas, paginaActual + 1)}" ${
          paginaActual === totalPaginas ? "disabled" : ""
        }
            class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 disabled:opacity-40 hover:bg-slate-100">
            Siguiente
          </button>
        `);

        paginacionEl.innerHTML = botones.join("");
        paginacionEl.querySelectorAll<HTMLButtonElement>("[data-page]").forEach((b) => {
          b.addEventListener("click", () => {
            const p = Number(b.getAttribute("data-page"));
            if (p && p !== paginaActual) {
              paginaActual = p;
              renderizarTabla();
            }
          });
        });
      }
    }
  }

  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", () => {
      filtroTexto = inputBusqueda.value;
      paginaActual = 1;
      renderizarTabla();
    });
  }

  if (selectOrden) {
    selectOrden.addEventListener("change", () => {
      ordenActual = selectOrden.value;
      paginaActual = 1;
      renderizarTabla();
    });
  }

  btnsProvincia.forEach((btn) => {
    btn.addEventListener("click", () => {
      filtroProvincia = btn.getAttribute("data-prov-filter") || "todas";
      btnsProvincia.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      paginaActual = 1;
      renderizarTabla();
    });
  });

  btnsLetra.forEach((btn) => {
    btn.addEventListener("click", () => {
      filtroLetra = btn.getAttribute("data-letter-filter") || "todas";
      btnsLetra.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      paginaActual = 1;
      renderizarTabla();
    });
  });

  // Botones desde la tabla de "Principales Localidades" para saltar y desplegar ese municipio
  document.querySelectorAll<HTMLButtonElement>("[data-jump-municipio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mun = btn.getAttribute("data-jump-municipio");
      if (!mun) return;
      filtroTexto = mun;
      filtroProvincia = "todas";
      filtroLetra = "todas";
      paginaActual = 1;
      municipioAbierto = mun;
      if (inputBusqueda) inputBusqueda.value = mun;
      btnsProvincia.forEach((b) =>
        b.setAttribute("aria-selected", String(b.getAttribute("data-prov-filter") === "todas"))
      );
      btnsLetra.forEach((b) =>
        b.setAttribute("aria-selected", String(b.getAttribute("data-letter-filter") === "todas"))
      );
      renderizarTabla();
      const seccion = document.getElementById("todas-las-poblaciones");
      seccion?.scrollIntoView({ behavior: "smooth" });
    });
  });

  renderizarTabla();
}

// ============================================================
// 3. GRÁFICOS HISTÓRICOS 2025-2026 (CHART.JS)
// ============================================================
async function inicializarGraficosHistoricos() {
  const canvasEvolucion = document.getElementById("chart-evolucion-diaria") as HTMLCanvasElement | null;
  const canvasProvincias = document.getElementById("chart-comparativa-provincias") as HTMLCanvasElement | null;
  const canvasDiferencial = document.getElementById("chart-diferencial") as HTMLCanvasElement | null;
  const canvasMensual = document.getElementById("chart-medias-mensuales") as HTMLCanvasElement | null;

  if (!canvasEvolucion) return;

  try {
    const [resExt, resProv] = await Promise.all([
      fetch("/datos/historico_extremadura_2026.json"),
      fetch("/datos/historico_provincias_extremadura_2026.json")
    ]);

    if (!resExt.ok || !resProv.ok) return;

    const rawExt: RegExt[] = (await resExt.json()).filter(
      (d: RegExt) => d && d.fecha && typeof d.gasolina95_E5 === "number" && typeof d.gasoleoA === "number"
    );
    const rawProv: RegProv[] = (await resProv.json()).filter(
      (d: RegProv) => d && d.fecha && d.badajoz && d.caceres
    );

    const mapaProv = new Map<string, RegProv>();
    rawProv.forEach((p) => mapaProv.set(p.fecha, p));

    let rangoActual = "todo"; // todo | 2025 | 2026 | 90d
    let regionActual = "extremadura"; // extremadura | badajoz | caceres
    let chartEvolucion: Chart | null = null;
    let chartProv: Chart | null = null;

    function filtrarSeriePorRango<T extends { fecha: string }>(arr: T[]): T[] {
      if (rangoActual === "2025") return arr.filter((d) => d.fecha.endsWith("-2025"));
      if (rangoActual === "2026") return arr.filter((d) => d.fecha.endsWith("-2026"));
      if (rangoActual === "90d") return arr.slice(-90);
      return arr;
    }

    function renderizarEvolucion() {
      if (!canvasEvolucion) return;
      const filtrados = filtrarSeriePorRango(rawExt);
      const etiquetas = filtrados.map((d) => fmtFechaEje(d.fecha));

      const serieG95 = filtrados.map((d) => {
        if (regionActual === "extremadura") return d.gasolina95_E5;
        const p = mapaProv.get(d.fecha);
        return regionActual === "badajoz" ? p?.badajoz?.gasolina95_E5 ?? null : p?.caceres?.gasolina95_E5 ?? null;
      });

      const serieGasA = filtrados.map((d) => {
        if (regionActual === "extremadura") return d.gasoleoA;
        const p = mapaProv.get(d.fecha);
        return regionActual === "badajoz" ? p?.badajoz?.gasoleoA ?? null : p?.caceres?.gasoleoA ?? null;
      });

      if (chartEvolucion) chartEvolucion.destroy();

      chartEvolucion = new Chart(canvasEvolucion, {
        type: "line",
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: "Gasóleo A (Diésel)",
              data: serieGasA,
              borderColor: "#b45309",
              backgroundColor: "rgba(180, 83, 9, 0.10)",
              borderWidth: 2.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.25,
              fill: true
            },
            {
              label: "Gasolina 95 E5",
              data: serieG95,
              borderColor: "#0369a1",
              backgroundColor: "rgba(3, 105, 161, 0.10)",
              borderWidth: 2.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              tension: 0.25,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: {
                font: { family: FUENTE_GRAFICO, size: 12, weight: 600 },
                color: "#0f172a",
                boxWidth: 28,
                boxHeight: 10
              }
            },
            tooltip: {
              backgroundColor: "#0f172a",
              titleColor: "#f8fafc",
              bodyColor: "#e2e8f0",
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${fmtPrecio(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#334155", font: { family: FUENTE_GRAFICO, size: 11 }, maxTicksLimit: 9 }
            },
            y: {
              grid: { color: "#e2e8f0" },
              ticks: {
                color: "#334155",
                font: { family: FUENTE_GRAFICO, size: 11 },
                callback: (v) => `${Number(v).toFixed(2).replace(".", ",")} €`
              }
            }
          }
        }
      });
    }

    // Controles de filtro del Gráfico 1
    document.querySelectorAll<HTMLButtonElement>("[data-chart-range]").forEach((btn) => {
      btn.addEventListener("click", () => {
        rangoActual = btn.getAttribute("data-chart-range") || "todo";
        document
          .querySelectorAll<HTMLButtonElement>("[data-chart-range]")
          .forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        renderizarEvolucion();
      });
    });

    document.querySelectorAll<HTMLButtonElement>("[data-chart-region]").forEach((btn) => {
      btn.addEventListener("click", () => {
        regionActual = btn.getAttribute("data-chart-region") || "extremadura";
        document
          .querySelectorAll<HTMLButtonElement>("[data-chart-region]")
          .forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        renderizarEvolucion();
      });
    });

    renderizarEvolucion();

    // Gráfico 2: Comparativa histórica Badajoz vs Cáceres
    let combProvActual: "gasoleo" | "gasolina" = "gasoleo";

    function renderizarComparativaProv() {
      if (!canvasProvincias) return;
      if (chartProv) chartProv.destroy();

      const etiquetas = rawProv.map((d) => fmtFechaEje(d.fecha));
      const esGasoleo = combProvActual === "gasoleo";

      const datosBadajoz = rawProv.map((d) =>
        esGasoleo ? d.badajoz?.gasoleoA : d.badajoz?.gasolina95_E5
      );
      const datosCaceres = rawProv.map((d) =>
        esGasoleo ? d.caceres?.gasoleoA : d.caceres?.gasolina95_E5
      );

      chartProv = new Chart(canvasProvincias, {
        type: "line",
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: `Cáceres (${esGasoleo ? "Gasóleo A" : "Gasolina 95"})`,
              data: datosCaceres,
              borderColor: esGasoleo ? "#92400e" : "#1e3a8a",
              borderDash: [4, 4],
              borderWidth: 2.2,
              pointRadius: 0,
              tension: 0.25,
              fill: false
            },
            {
              label: `Badajoz (${esGasoleo ? "Gasóleo A" : "Gasolina 95"})`,
              data: datosBadajoz,
              borderColor: esGasoleo ? "#f59e0b" : "#0284c7",
              borderWidth: 2.2,
              pointRadius: 0,
              tension: 0.25,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: { font: { family: FUENTE_GRAFICO, size: 12, weight: 600 }, color: "#0f172a" }
            },
            tooltip: {
              backgroundColor: "#0f172a",
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${fmtPrecio(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#334155", font: { family: FUENTE_GRAFICO, size: 11 }, maxTicksLimit: 7 }
            },
            y: {
              grid: { color: "#e2e8f0" },
              ticks: {
                color: "#334155",
                font: { family: FUENTE_GRAFICO, size: 11 },
                callback: (v) => `${Number(v).toFixed(2).replace(".", ",")} €`
              }
            }
          }
        }
      });
    }

    document.querySelectorAll<HTMLButtonElement>("[data-prov-fuel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        combProvActual = (btn.getAttribute("data-prov-fuel") as "gasoleo" | "gasolina") || "gasoleo";
        document
          .querySelectorAll<HTMLButtonElement>("[data-prov-fuel]")
          .forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        renderizarComparativaProv();
      });
    });

    renderizarComparativaProv();

    // Gráfico 3: Diferencial Diésel − Gasolina (céntimos/litro)
    if (canvasDiferencial) {
      const etiquetas = rawExt.map((d) => fmtFechaEje(d.fecha));
      const datosDif = rawExt.map((d) =>
        d.gasoleoA !== null && d.gasolina95_E5 !== null
          ? Number(((d.gasoleoA - d.gasolina95_E5) * 100).toFixed(1))
          : null
      );

      new Chart(canvasDiferencial, {
        type: "line",
        data: {
          labels: etiquetas,
          datasets: [
            {
              label: "Sobrecoste del Diésel frente a Gasolina 95 (cts/L)",
              data: datosDif,
              borderColor: "#334155",
              backgroundColor: "rgba(51, 65, 85, 0.12)",
              borderWidth: 2.2,
              pointRadius: 0,
              tension: 0.25,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: { font: { family: FUENTE_GRAFICO, size: 12, weight: 600 }, color: "#0f172a" }
            },
            tooltip: {
              backgroundColor: "#0f172a",
              callbacks: {
                label: (ctx) => ` Diferencial: +${fmtNum(ctx.parsed.y, 1)} cts/L`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#334155", font: { family: FUENTE_GRAFICO, size: 11 }, maxTicksLimit: 7 }
            },
            y: {
              grid: { color: "#e2e8f0" },
              ticks: {
                color: "#334155",
                font: { family: FUENTE_GRAFICO, size: 11 },
                callback: (v) => `+${Number(v).toFixed(0)} cts`
              }
            }
          }
        }
      });
    }

    // Gráfico 4: Barras de Medias Mensuales (2025 - 2026)
    if (canvasMensual) {
      const agrupado = new Map<string, { g: number[]; d: number[] }>();
      rawExt.forEach((r) => {
        const [, mm, yyyy] = r.fecha.split("-");
        const k = `${yyyy}-${mm}`;
        if (!agrupado.has(k)) agrupado.set(k, { g: [], d: [] });
        const item = agrupado.get(k)!;
        if (r.gasolina95_E5) item.g.push(r.gasolina95_E5);
        if (r.gasoleoA) item.d.push(r.gasoleoA);
      });

      const claves = Array.from(agrupado.keys()).sort();
      const labelsMes = claves.map((k) => {
        const [y, m] = k.split("-");
        return `${MESES_CORTOS[Number(m) - 1]} ${y.slice(2)}`;
      });
      const mediasG = claves.map((k) => {
        const arr = agrupado.get(k)!.g;
        return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3));
      });
      const mediasD = claves.map((k) => {
        const arr = agrupado.get(k)!.d;
        return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3));
      });

      new Chart(canvasMensual, {
        type: "bar",
        data: {
          labels: labelsMes,
          datasets: [
            {
              label: "Gasolina 95 E5 (Media mensual)",
              data: mediasG,
              backgroundColor: "#0369a1",
              borderRadius: 4,
              maxBarThickness: 16
            },
            {
              label: "Gasóleo A (Media mensual)",
              data: mediasD,
              backgroundColor: "#b45309",
              borderRadius: 4,
              maxBarThickness: 16
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "top",
              align: "start",
              labels: { font: { family: FUENTE_GRAFICO, size: 12, weight: 600 }, color: "#0f172a" }
            },
            tooltip: {
              backgroundColor: "#0f172a",
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${fmtPrecio(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#334155", font: { family: FUENTE_GRAFICO, size: 11 } }
            },
            y: {
              min: 1.3,
              grid: { color: "#e2e8f0" },
              ticks: {
                color: "#334155",
                font: { family: FUENTE_GRAFICO, size: 11 },
                callback: (v) => `${Number(v).toFixed(2).replace(".", ",")} €`
              }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error("Error inicializando gráficos históricos:", err);
  }
}

// ============================================================
// 4. FILTRO DE AÑO EN TABLA MENSUAL HISTÓRICA
// ============================================================
function inicializarTablaHistorica() {
  const btns = document.querySelectorAll<HTMLButtonElement>("[data-hist-year]");
  const filas = document.querySelectorAll<HTMLTableRowElement>("[data-row-year]");
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const anio = btn.getAttribute("data-hist-year") || "todos";
      btns.forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      filas.forEach((fila) => {
        const filaAnio = fila.getAttribute("data-row-year");
        if (anio === "todos" || filaAnio === anio) {
          fila.classList.remove("hidden");
        } else {
          fila.classList.add("hidden");
        }
      });
    });
  });
}

// ============================================================
// 5. CALCULADORA INTERACTIVA DE REPOSTAJE Y AHORRO ANUAL
// ============================================================
function inicializarCalculadoraAhorro() {
  const form = document.getElementById("calculadora-repostaje");
  if (!form) return;

  const inputLitros = document.getElementById("calc-litros") as HTMLInputElement | null;
  const inputKmAnual = document.getElementById("calc-km") as HTMLInputElement | null;
  const inputConsumo = document.getElementById("calc-consumo") as HTMLInputElement | null;
  const selectComb = document.getElementById("calc-combustible") as HTMLSelectElement | null;

  const outCosteMedio = document.getElementById("calc-out-medio");
  const outCosteMin = document.getElementById("calc-out-min");
  const outAhorroDep = document.getElementById("calc-out-ahorro-dep");
  const outAhorroAnual = document.getElementById("calc-out-ahorro-anual");

  const mediaG95 = Number(form.getAttribute("data-media-g95") || 1.738);
  const minG95 = Number(form.getAttribute("data-min-g95") || 1.519);
  const mediaGasA = Number(form.getAttribute("data-media-gasa") || 1.928);
  const minGasA = Number(form.getAttribute("data-min-gasa") || 1.47);

  function recalcular() {
    const litros = Math.max(10, Math.min(120, Number(inputLitros?.value || 50)));
    const kmAnual = Math.max(1000, Math.min(150000, Number(inputKmAnual?.value || 15000)));
    const consumo = Math.max(2, Math.min(25, Number(inputConsumo?.value || 6.2)));
    const tipo = selectComb?.value || "gasoleo";

    const precioMedio = tipo === "gasoleo" ? mediaGasA : mediaG95;
    const precioMin = tipo === "gasoleo" ? minGasA : minG95;

    const costeMedio = litros * precioMedio;
    const costeMin = litros * precioMin;
    const ahorroDeposito = Math.max(0, costeMedio - costeMin);

    const litrosAnuales = (kmAnual / 100) * consumo;
    const ahorroAnual = Math.max(0, litrosAnuales * (precioMedio - precioMin));

    if (outCosteMedio) outCosteMedio.textContent = `${fmtNum(costeMedio, 2)} €`;
    if (outCosteMin) outCosteMin.textContent = `${fmtNum(costeMin, 2)} €`;
    if (outAhorroDep) outAhorroDep.textContent = `${fmtNum(ahorroDeposito, 2)} €`;
    if (outAhorroAnual) outAhorroAnual.textContent = `${fmtNum(ahorroAnual, 0)} €/año`;
  }

  [inputLitros, inputKmAnual, inputConsumo, selectComb].forEach((el) => {
    el?.addEventListener("input", recalcular);
    el?.addEventListener("change", recalcular);
  });

  recalcular();
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarTabsTopHoy();
  inicializarExploradorPoblaciones();
  inicializarGraficosHistoricos();
  inicializarTablaHistorica();
  inicializarCalculadoraAhorro();
});
