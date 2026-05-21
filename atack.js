/*
 * Noble Sync Planner
 * Compatible with TWSDK
 * Screen:
 *   overview_villages&mode=combined
 */

// ═══════════════════════════════════════════════════════
//  twSDK — versão embutida (mesma base do barbarian_farmer)
// ═══════════════════════════════════════════════════════
window.twSDK = window.twSDK || {};
Object.assign(window.twSDK, {
  scriptData: {},
  translations: {},
  allowedMarkets: [],
  allowedScreens: [],
  allowedModes: [],
  enableCountApi: false,
  isDebug: false,
  isMobile: jQuery("#mobileHeader").length > 0,
  delayBetweenRequests: 200,
  market: game_data.market,
  units: game_data.units,
  village: game_data.village,
  coordsRegex: /\d{1,3}\|\d{1,3}/g,

  tt: function (str) {
    const loc = this.translations[game_data.locale];
    if (loc && loc[str] !== undefined) return loc[str];
    const en = this.translations["en_DK"];
    return en && en[str] !== undefined ? en[str] : str;
  },

  calculateDistance: function (from, to) {
    const [x1, y1] = from.split("|").map(Number);
    const [x2, y2] = to.split("|").map(Number);
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  },

  zeroPad: function (num, count) {
    let s = String(num);
    while (s.length < count) s = "0" + s;
    return s;
  },

  getParameterByName: function (name, url = window.location.href) {
    return new URL(url).searchParams.get(name);
  },

  secondsToHms: function (ts) {
    const h = Math.floor(ts / 3600);
    const m = Math.floor((ts % 3600) / 60);
    const s = ts % 60;
    return `${this.zeroPad(h, 2)}:${this.zeroPad(m, 2)}:${this.zeroPad(s, 2)}`;
  },

  addGlobalStyle: function () {
    return `
            .ra-table-container { overflow-y:auto; overflow-x:hidden; max-height:450px; }
            .ra-table th { font-size:13px; }
            .ra-table th, .ra-table td { padding:5px; text-align:center; }
            .ra-table td a { word-break:break-all; }
            .ra-table a:focus { color:blue; }
            .ra-table tr:nth-of-type(2n)   td { background-color:#f0e2be; }
            .ra-table tr:nth-of-type(2n+1) td { background-color:#fff5da; }
            .ra-table-v2 th, .ra-table-v2 td { text-align:left; }
            .ra-mt15 { margin-top:15px !important; }
            .ra-mb10 { margin-bottom:10px !important; }
            .ra-tal  { text-align:left !important; }
            .ra-tac  { text-align:center !important; }
        `;
  },

  renderBoxWidget: function (body, id, cls, customStyle) {
    const gs = this.addGlobalStyle();
    const html = `
            <div class="${cls} ra-box-widget" id="${id}">
                <div class="${cls}-header">
                    <h3>${this.tt(this.scriptData.name)}</h3>
                </div>
                <div class="${cls}-body">${body}</div>
                <div class="${cls}-footer">
                    <small>
                        <strong>${this.tt(this.scriptData.name)} ${this.scriptData.version}</strong> -
                        <a href="${this.scriptData.authorUrl}" target="_blank" rel="noreferrer noopener">${this.scriptData.author}</a> -
                        <a href="${this.scriptData.helpLink}" target="_blank" rel="noreferrer noopener">${this.tt("Help")}</a>
                    </small>
                </div>
            </div>
            <style>
                .${cls} { position:relative; display:block; width:100%; clear:both; margin:10px 0 15px; border:1px solid #603000; box-sizing:border-box; background:#f4e4bc; }
                .${cls} * { box-sizing:border-box; }
                .${cls} > div { padding:10px; }
                .${cls} .btn-confirm-yes { padding:3px; }
                .${cls}-header { display:flex; align-items:center; justify-content:space-between; background-color:#c1a264 !important; background-image:url(/graphic/screen/tableheader_bg3.png); background-repeat:repeat-x; }
                .${cls}-header h3 { margin:0; padding:0; line-height:1; }
                .${cls}-body p { font-size:14px; }
                .${cls}-body label { display:block; font-weight:600; margin-bottom:6px; }
                ${gs}
                ${customStyle || ""}
            </style>`;

    if (jQuery(`#${id}`).length < 1) {
      jQuery("#contentContainer").prepend(html);
      jQuery("#mobileContent").prepend(html);
    } else {
      jQuery(`.${cls}-body`).html(body);
    }
  },

  init: async function (cfg) {
    Object.assign(this, {
      scriptData: cfg.scriptData,
      translations: cfg.translations,
      allowedMarkets: cfg.allowedMarkets,
      allowedScreens: cfg.allowedScreens,
      allowedModes: cfg.allowedModes,
      enableCountApi: cfg.enableCountApi,
      isDebug: cfg.isDebug,
    });
    if (cfg.isDebug) console.debug(`[${cfg.scriptData.name}] init OK`);
  },
});

(() => {
  "use strict";

  // ----------------------------------------------------
  // CONFIG
  // ----------------------------------------------------

  const SCRIPT_INFO = {
    name: "Noble Sync Planner",
    version: "1.0.0",
    author: "Paulo",
    authorUrl: "",
    helpLink: "",
  };

  const CONFIG = {
    nobleAxe: 1000,
    nobleLight: 500,
    nobleCount: 4,
    nobleGapMs: 100,
    clearGapMs: -500,
  };

  // ----------------------------------------------------
  // STATE
  // ----------------------------------------------------

  let villages = [];
  let plans = [];

  // ----------------------------------------------------
  // INIT
  // ----------------------------------------------------

  async function init() {
    if (!validateScreen()) {
      UI.ErrorMessage("Abra em overview_villages&mode=combined");
      return;
    }

    buildUI();
    scanOverview();
    log("info", "Script iniciado.");
  }

  function validateScreen() {
    const screen = twSDK.getParameterByName("screen");
    const mode = twSDK.getParameterByName("mode");

    return screen === "overview_villages" && mode === "combined";
  }

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  function buildUI() {
    const customStyle = `
            .nsp-grid {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:6px;
                margin-bottom:10px;
            }

            .nsp-field {
                display:flex;
                flex-direction:column;
                gap:4px;
                margin-bottom:8px;
            }

            .nsp-field label {
                font-size:11px;
                font-weight:700;
                color:#7a5020;
            }

            .nsp-field input,
            .nsp-field textarea {
                width:100%;
                border:1px solid #bd9c5a;
                border-radius:3px;
                background:#fff8e8;
                padding:4px;
                font-size:12px;
            }

            .nsp-field textarea {
                min-height:90px;
                resize:vertical;
            }

            .nsp-controls {
                display:flex;
                gap:6px;
                margin-top:10px;
                margin-bottom:10px;
            }

            .nsp-controls .btn-confirm-yes {
                flex:1;
                text-align:center;
                padding:4px 0;
            }

            .nsp-log {
                max-height:180px;
                overflow-y:auto;
                border:1px solid #bd9c5a;
                border-radius:3px;
                padding:4px;
                background:#fffdf5;
            }

            .nsp-entry {
                font-size:11px;
                padding:2px 4px;
                border-left:2px solid #ccc;
                margin-bottom:2px;
                color:#555;
            }

            .nsp-entry.success {
                border-color:#5a9a10;
                color:#3a6a00;
            }

            .nsp-entry.error {
                border-color:#cc3020;
                color:#8a1010;
            }

            .nsp-entry.warn {
                border-color:#cc8020;
                color:#7a5000;
            }

            .nsp-entry.info {
                border-color:#5080aa;
                color:#305070;
            }

            .nsp-time {
                opacity:0.6;
                margin-right:4px;
            }

            .nsp-plan {
                margin-top:10px;
                border:1px solid #bd9c5a;
                background:#fffdf5;
                padding:6px;
                max-height:250px;
                overflow:auto;
            }

            .nsp-plan-row {
                font-size:11px;
                padding:4px;
                border-bottom:1px solid #eee;
            }

            .nsp-title {
                font-size:11px;
                font-weight:700;
                color:#7a5020;
                margin-top:10px;
                margin-bottom:5px;
                text-transform:uppercase;
            }
        `;

    const body = `
            <div class="nsp-grid">
                <div class="nsp-field">
                    <label>🏰 Vila Nobre</label>
                    <input type="text" id="nsp-noble" placeholder="500|500">
                </div>

                <div class="nsp-field">
                    <label>🎯 Alvo</label>
                    <input type="text" id="nsp-target" placeholder="550|550">
                </div>
            </div>

            <div class="nsp-field">
                <label>⏰ Chegada Primeiro Nobre</label>
                <input type="text" id="nsp-date" placeholder="21/05/2026 20:00:00.000">
            </div>

            <div class="nsp-field">
                <label>⚔ Vilas FULL</label>
                <textarea id="nsp-fulls" placeholder="501|500&#10;502|500&#10;503|500"></textarea>
            </div>

            <div class="nsp-controls">
                <a href="#" class="btn-confirm-yes" id="nsp-btn-scan">🔍 Escanear</a>
                <a href="#" class="btn-confirm-yes" id="nsp-btn-plan">📋 Planejar</a>
                <a href="#" class="btn-confirm-yes" id="nsp-btn-copy">📄 Copiar</a>
                <a href="#" class="btn-confirm-yes" id="nsp-btn-attack">⚔ Atacar</a>
            </div>

            <div class="nsp-title">📦 Planejamento</div>
            <div class="nsp-plan" id="nsp-plan"></div>

            <div class="nsp-title">📋 Log</div>
            <div class="nsp-log" id="nsp-log"></div>
        `;

    twSDK.renderBoxWidget(body, "nobleSyncPlanner", "nsp", customStyle);

    bindEvents();
  }

  // ----------------------------------------------------
  // EVENTS
  // ----------------------------------------------------

  function bindEvents() {
    jQuery("#nsp-btn-scan").on("click", (e) => {
      e.preventDefault();
      scanOverview();
    });

    jQuery("#nsp-btn-plan").on("click", (e) => {
      e.preventDefault();
      generatePlan();
    });

    jQuery("#nsp-btn-copy").on("click", (e) => {
      e.preventDefault();
      copyPlan();
    });

    jQuery("#nsp-btn-attack").on("click", (e) => {
      e.preventDefault();
      executePlan();
    });
  }

  // ----------------------------------------------------
  // SCAN OVERVIEW
  // ----------------------------------------------------

  function scanOverview() {
    villages = [];

    jQuery("#combined_table tbody tr").each(function () {
      const row = jQuery(this);

      const villageLink = row.find(".quickedit-label");

      if (!villageLink.length) return;

      const villageText = villageLink.text();

      const coords = villageText.match(/\d+\|\d+/);

      if (!coords) return;

      const village = {
        coord: coords[0],
        id: extractVillageId(row.find('a[href*="village="]').attr("href")),
        axe: getUnitAmount(row, "axe"),
        light: getUnitAmount(row, "light"),
        ram: getUnitAmount(row, "ram"),
        noble: getUnitAmount(row, "snob"),
      };

      villages.push(village);
    });

    log("success", `${villages.length} vilas carregadas do overview`);
  }

  // ----------------------------------------------------
  // GENERATE PLAN
  // ----------------------------------------------------

  function generatePlan() {
    plans = [];

    const nobleCoord = jQuery("#nsp-noble").val().trim();
    const targetCoord = jQuery("#nsp-target").val().trim();

    const fulls = jQuery("#nsp-fulls")
      .val()
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);

    const arrivalText = jQuery("#nsp-date").val().trim();

    if (!nobleCoord || !targetCoord || !arrivalText) {
      log("error", "Campos obrigatórios faltando.");
      return;
    }

    const nobleVillage = villages.find((v) => v.coord === nobleCoord);

    if (!nobleVillage) {
      log("error", "Vila nobre não encontrada.");
      return;
    }

    const arrivalDate = parseDate(arrivalText);

    if (!arrivalDate) {
      log("error", "Data inválida.");
      return;
    }

    // FULLS

    fulls.forEach((coord) => {
      const village = villages.find((v) => v.coord === coord);

      if (!village) {
        log("warn", `${coord} não encontrada.`);
        return;
      }

      const travelMs = calculateTravelMs(coord, targetCoord, "axe");

      const arrive = arrivalDate.getTime() + CONFIG.clearGapMs;

      const send = arrive - travelMs;

      plans.push({
        type: "FULL",
        from: coord,
        to: targetCoord,
        send,
        arrive,
      });
    });

    // NOBLES

    for (let i = 0; i < CONFIG.nobleCount; i++) {
      const travelMs = calculateTravelMs(nobleCoord, targetCoord, "snob");

      const arrive = arrivalDate.getTime() + i * CONFIG.nobleGapMs;

      const send = arrive - travelMs;

      plans.push({
        type: `NOBRE ${i + 1}`,
        from: nobleCoord,
        to: targetCoord,
        send,
        arrive,
        units: {
          axe: CONFIG.nobleAxe,
          light: CONFIG.nobleLight,
          snob: 1,
        },
      });
    }

    renderPlan();

    log("success", `${plans.length} ataques planejados`);
  }

  // ----------------------------------------------------
  // RENDER PLAN
  // ----------------------------------------------------

  function renderPlan() {
    let html = "";

    plans.sort((a, b) => a.send - b.send);

    plans.forEach((plan) => {
      html += `
                <div class="nsp-plan-row">
                    <strong>${plan.type}</strong><br>

                    ${plan.from} → ${plan.to}<br>

                    ENVIAR:
                    ${formatDate(plan.send)}<br>

                    CHEGAR:
                    ${formatDate(plan.arrive)}
                </div>
            `;
    });

    jQuery("#nsp-plan").html(html);
  }

  // ----------------------------------------------------
  // COPY
  // ----------------------------------------------------

  async function copyPlan() {
    if (!plans.length) {
      log("warn", "Nenhum planejamento.");
      return;
    }

    let text = "";

    plans.forEach((plan) => {
      text += `[${plan.type}]\n`;
      text += `${plan.from} -> ${plan.to}\n`;
      text += `ENVIAR: ${formatDate(plan.send)}\n`;
      text += `CHEGAR: ${formatDate(plan.arrive)}\n\n`;
    });

    await navigator.clipboard.writeText(text);

    log("success", "Planejamento copiado.");
  }

  // ----------------------------------------------------
  // ATTACK
  // ----------------------------------------------------

  function executePlan() {
    if (!plans.length) {
      log("warn", "Nenhum planejamento.");
      return;
    }

    plans.forEach((plan) => {
      const village = villages.find((v) => v.coord === plan.from);

      if (!village) return;

      const url = `/game.php?village=${village.id}` + `&screen=place`;

      window.open(url, "_blank");
    });

    log("info", "Abas de ataque abertas.");
  }

  // ----------------------------------------------------
  // HELPERS
  // ----------------------------------------------------

  function calculateTravelMs(from, to, unit) {
    const distance = twSDK.calculateDistance(from, to);

    const speed = unitSpeed(unit);

    return distance * speed * 60 * 1000;
  }

  function unitSpeed(unit) {
    const speedMap = {
      axe: 18,
      light: 10,
      ram: 30,
      snob: 35,
    };

    return speedMap[unit] || 18;
  }

  function extractVillageId(url) {
    if (!url) return null;

    const match = url.match(/village=(\d+)/);

    return match ? match[1] : null;
  }

  function getUnitAmount(row, unit) {
    const img = row.find(`img[src*="unit_${unit}"]`);

    if (!img.length) return 0;

    const td = img.closest("td");

    const val = parseInt(td.text().trim());

    return isNaN(val) ? 0 : val;
  }

  function parseDate(str) {
    try {
      const parts = str.match(
        /(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+):(\d+)\.?(\d+)?/,
      );

      if (!parts) return null;

      return new Date(
        parts[3],
        parts[2] - 1,
        parts[1],
        parts[4],
        parts[5],
        parts[6],
        parts[7] || 0,
      );
    } catch {
      return null;
    }
  }

  function formatDate(ts) {
    const d = new Date(ts);

    return (
      `${pad(d.getDate())}/` +
      `${pad(d.getMonth() + 1)}/` +
      `${d.getFullYear()} ` +
      `${pad(d.getHours())}:` +
      `${pad(d.getMinutes())}:` +
      `${pad(d.getSeconds())}.` +
      `${String(d.getMilliseconds()).padStart(3, "0")}`
    );
  }

  function pad(v) {
    return String(v).padStart(2, "0");
  }

  function log(type, text) {
    const time = new Date().toLocaleTimeString();

    jQuery("#nsp-log").prepend(`
            <div class="nsp-entry ${type}">
                <span class="nsp-time">${time}</span>
                ${text}
            </div>
        `);
  }

  // ----------------------------------------------------
  // START
  // ----------------------------------------------------

  init();
})();
