/*
    NAME: Support Map
    DESCRIPTION: Mapa de apoio inteligente para a tela de ataques recebidos.
                 Calcula tempo de deslocamento real (spear/sword/heavy) para
                 garantir que a vila de apoio está disponível antes de cada ataque.
                 Botão direto para a praça de reunião da vila defensora.
    VERSION: 2.0.0
    AUTHOR: inaciopjsi
    SCREEN: overview_villages&mode=incomings
*/

// ═══════════════════════════════════════════════════════
//  scriptConfig
// ═══════════════════════════════════════════════════════
var scriptConfig = {
  scriptData: {
    name: "Support Map",
    version: "v2.0.0",
    author: "inaciopjsi",
    authorUrl: "https://github.com/inaciopjsi",
    helpLink: "https://github.com/inaciopjsi/twtest",
  },
  translations: {
    pt_BR: {
      "Support Map": "Mapa de Apoio",
      Help: "Ajuda",
      Generate: "🗺 Gerar Mapa",
      "Copy All": "📋 Copiar Tudo",
      Target: "Alvo (sua vila)",
      Defender: "Defende",
      "Support From": "Apoio de",
      "No attacks": "Nenhum ataque recebido encontrado.",
      Loading: "Carregando...",
      Done: "Concluído!",
      Copied: "Copiado!",
      SendSupport: "🛡 Enviar Apoio",
      Busy: "⏳ ocupada até",
    },
    en_DK: {
      "Support Map": "Support Map",
      Help: "Help",
      Generate: "Generate Map",
      "Copy All": "Copy All",
      Target: "Target",
      Defender: "Defender",
      "Support From": "Support From",
      "No attacks": "No incoming attacks found.",
      Loading: "Loading...",
      Done: "Done!",
      Copied: "Copied!",
      SendSupport: "🛡 Send Support",
      Busy: "⏳ busy until",
    },
  },
  allowedMarkets: ["br"],
  allowedScreens: ["overview_villages"],
  allowedModes: ["incomings"],
  isDebug: false,
  enableCountApi: false,
};

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

// ═══════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ═══════════════════════════════════════════════════════
let unitSpeeds = {}; // { spear: min/campo, sword: min/campo, ... }
let myVillages = []; // vilas do jogador
let smMapData = []; // resultado do buildSupportMap

// ─── Agenda de ocupação: villageCoord → Date (livre a partir de)
// Controla quando cada vila sua fica disponível novamente
const availability = {};

// ═══════════════════════════════════════════════════════
//  VELOCIDADE DAS TROPAS
//  twSDK.getWorldUnitInfo() retorna XML parseado em JSON.
//  O campo speed está em minutos por campo (no mundo base 1×).
//  Mundo com speed multiplier: dividimos pelo fator.
// ═══════════════════════════════════════════════════════
const DEFENSE_UNITS = ["spear", "sword", "heavy"]; // bloco de defesa típico
const FALLBACK_SPEED = { spear: 18, sword: 22, heavy: 14, archer: 18 };

async function loadUnitSpeeds() {
  try {
    const unitInfo = await twSDK.getWorldUnitInfo();
    // unitInfo é { units: { unit: [ {id, speed, ...}, ... ] } }
    const units = unitInfo?.units?.unit || [];
    units.forEach((u) => {
      if (u.id && u.speed) unitSpeeds[u.id] = parseFloat(u.speed);
    });
  } catch (e) {
    console.warn("[SupportMap] Fallback para velocidades padrão:", e);
  }
  // Complementa com fallback para unidades não encontradas
  Object.assign(unitSpeeds, { ...FALLBACK_SPEED, ...unitSpeeds });
}

/** Retorna a velocidade (min/campo) da tropa mais lenta do bloco de defesa */
function defenseSpeed() {
  return Math.max(
    ...DEFENSE_UNITS.map((u) => unitSpeeds[u] || FALLBACK_SPEED[u] || 22),
  );
}

/**
 * Tempo de ida + volta para a distância dada, com a tropa mais lenta.
 * Retorna milissegundos.
 */
function roundTripMs(distCampos) {
  const worldSpeed = parseFloat(game_data.speed) || 1;
  const minPerCampo = defenseSpeed() / worldSpeed;
  return distCampos * minPerCampo * 2 * 60 * 1000; // × 2 (ida+volta) × 60s × 1000ms
}

// ═══════════════════════════════════════════════════════
//  PARSER DA TELA DE INCOMINGS
// ═══════════════════════════════════════════════════════
function extractCoord(text) {
  const m = text.match(/\((\d{1,3})\|(\d{1,3})\)/);
  if (m) return `${m[1]}|${m[2]}`;
  const m2 = text.match(/(\d{1,3})\|(\d{1,3})/);
  return m2 ? `${m2[1]}|${m2[2]}` : null;
}

function getServerNow() {
  const t = jQuery("#serverTime").text().trim();
  const d = jQuery("#serverDate").text().trim();
  const [dd, mm, yyyy] = d.split("/");
  return new Date(`${yyyy}-${mm}-${dd}T${t}`);
}

function parseArrivalDate(text) {
  text = text.trim();
  const now = getServerNow();
  const y = now.getFullYear();

  // "amanhã às HH:MM:SS" / "tomorrow at HH:MM:SS"
  const mTomorrow = text.match(/amanh[aã]|tomorrow/i);
  const mTime = text.match(/(\d{2}):(\d{2}):(\d{2})/);

  // "em DD.MM. às HH:MM:SS" ou "DD.MM. às HH:MM:SS"
  const mFull = text.match(
    /(\d{1,2})\.(\d{1,2})\.\s+(?:às\s+)?(\d{2}):(\d{2}):(\d{2})/,
  );
  if (mFull) {
    const [, dd, mm, hh, mi, ss] = mFull;
    return new Date(
      `${y}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T${hh}:${mi}:${ss}`,
    );
  }

  if (mTime) {
    const [, hh, mi, ss] = mTime;
    const base = new Date(now);
    base.setHours(+hh, +mi, +ss, 0);
    if (mTomorrow) base.setDate(base.getDate() + 1);
    return base;
  }
  return null;
}

function parseIncomingsPage(doc) {
  const rows = [];
  jQuery("#incomings_table tbody tr", doc).each(function () {
    const cells = jQuery("td", this);
    if (cells.length < 5) return;

    // Ignora se não for ataque
    const typeText = cells.eq(0).text();
    if (!/ataque|attack/i.test(typeText)) return;

    // Links de vila: [0] atacante, [1] alvo (sua vila)
    const linkEls = jQuery('a[href*="village="]', this);
    if (linkEls.length < 2) return;

    const attackerText = linkEls.eq(0).text().trim();
    const targetText = linkEls.eq(1).text().trim();
    const targetHref = linkEls.eq(1).attr("href") || "";
    const vmatch = targetHref.match(/village=(\d+)/);
    const targetVillageId = vmatch ? parseInt(vmatch[1]) : null;

    // Extrai data de chegada
    let arrivalDate = null;
    cells.each(function () {
      if (arrivalDate) return;
      const t = jQuery(this).text().trim();
      if (
        /\d{2}:\d{2}:\d{2}/.test(t) &&
        (/\d{1,2}\.\d{1,2}\./.test(t) ||
          /amanh[aã]|amanhã|tomorrow|hoje|today/i.test(t))
      ) {
        arrivalDate = parseArrivalDate(t);
      }
    });

    const targetCoord = extractCoord(targetText);
    const attackerCoord = extractCoord(attackerText);
    if (!targetCoord || !arrivalDate) return;

    rows.push({
      attackerText,
      attackerCoord,
      targetText,
      targetCoord,
      targetVillageId,
      arrivalDate,
    });
  });
  return rows;
}

async function fetchAllIncomings() {
  const attacks = [parseIncomingsPage(document)].flat();

  // Detecta páginas extras via select de paginação
  const extraUrls = [];
  jQuery("#incomings_table")
    .closest(".vis")
    .find("select option")
    .each(function () {
      const v = jQuery(this).val();
      if (v && !window.location.href.includes(v)) extraUrls.push(v);
    });

  for (const url of extraUrls) {
    await new Promise((r) => setTimeout(r, twSDK.delayBetweenRequests + 200));
    try {
      const html = await jQuery.get(url);
      const doc = new DOMParser().parseFromString(html, "text/html");
      attacks.push(...parseIncomingsPage(doc));
    } catch (e) {
      console.warn("[SupportMap] Erro paginação:", e);
    }
  }
  return attacks;
}

// ═══════════════════════════════════════════════════════
//  VILAS DO JOGADOR (via map/village.txt)
// ═══════════════════════════════════════════════════════
async function fetchMyVillages() {
  const villages = [];
  try {
    const txt = await jQuery.get("/map/village.txt");
    const pid = parseInt(game_data.player.id);
    txt
      .trim()
      .split("\n")
      .forEach((line) => {
        const p = line.split(",");
        if (p.length >= 5 && parseInt(p[4]) === pid) {
          villages.push({
            id: parseInt(p[0]),
            name: decodeURIComponent(p[1].replace(/\+/g, " ")),
            x: parseInt(p[2]),
            y: parseInt(p[3]),
            coord: `${p[2]}|${p[3]}`,
          });
        }
      });
  } catch (e) {
    console.warn("[SupportMap] Fallback vila atual:", e);
    villages.push({
      id: parseInt(game_data.village.id),
      name: game_data.village.name,
      x: parseInt(game_data.village.x),
      y: parseInt(game_data.village.y),
      coord: `${game_data.village.x}|${game_data.village.y}`,
    });
  }
  return villages;
}

// ═══════════════════════════════════════════════════════
//  LÓGICA DO MAPA DE APOIO
//
//  Para cada ataque (ordenado por chegada):
//  1. DEFENSORA  = vila minha mais próxima do alvo (≠ alvo)
//                 que esteja disponível antes da chegada do ataque.
//  2. APOIO      = vila minha mais próxima da defensora (≠ defensora, ≠ alvo)
//                 que esteja disponível antes da chegada do ataque.
//
//  "Disponível" significa: freeAt[coord] <= arrivalDate
//  Após atribuir, atualiza freeAt[coord] += roundTrip(dist)
// ═══════════════════════════════════════════════════════
const BUFFER_MARGIN_MS = 5 * 60 * 1000; // 5 min de margem de segurança

// ═══════════════════════════════════════════════════════
//  ANÁLISE DE AMEAÇA POR ATACANTE
//
//  Conta quantas aldeias DISTINTAS do jogador cada aldeia
//  atacante está atacando. Quanto mais alvos, mais diluída
//  a força — logo menor o perigo individual por alvo.
//
//  1 alvo  → PERIGO  🔴  (força concentrada)
//  2 alvos → ATENÇÃO 🟡  (força dividida)
//  3+      → SEGURO  🟢  (força muito diluída)
// ═══════════════════════════════════════════════════════

/**
 * Retorna mapa: attackerCoord → { count, targets: Set<targetCoord>, label, color, icon }
 */
function buildAttackerThreatMap(attacks) {
  const map = {};
  attacks.forEach((atk) => {
    const key = atk.attackerCoord || atk.attackerText;
    if (!map[key]) {
      map[key] = {
        count: 0,
        targets: new Set(),
        attackerText: atk.attackerText,
      };
    }
    map[key].targets.add(atk.targetCoord);
  });

  Object.values(map).forEach((entry) => {
    entry.count = entry.targets.size;
    if (entry.count === 1) {
      entry.level = "danger";
      entry.icon = "🔴";
      entry.label = "Perigo — ataque concentrado";
      entry.color = "#c0392b";
      entry.bg = "#fdecea";
      entry.border = "#c0392b";
    } else if (entry.count === 2) {
      entry.level = "warning";
      entry.icon = "🟡";
      entry.label = "Atenção — força dividida";
      entry.color = "#b7770d";
      entry.bg = "#fffbe6";
      entry.border = "#e0a800";
    } else {
      entry.level = "safe";
      entry.icon = "🟢";
      entry.label = "Seguro — força muito diluída";
      entry.color = "#1a7a3a";
      entry.bg = "#eafaf1";
      entry.border = "#27ae60";
    }
  });

  return map;
}

function buildSupportMap(attacks, villages) {
  if (!attacks.length || !villages.length) return [];

  // Pré-calcula ameaça por atacante
  const threatMap = buildAttackerThreatMap(attacks);

  // Mapa coord → vila
  const byCoord = {};
  villages.forEach((v) => {
    byCoord[v.coord] = v;
  });

  // Inicializa disponibilidade: todas livres desde agora
  const freeAt = {};
  villages.forEach((v) => {
    freeAt[v.coord] = new Date(0);
  });

  // Ordena ataques por chegada
  const sorted = [...attacks].sort((a, b) => a.arrivalDate - b.arrivalDate);

  const result = [];

  sorted.forEach((atk) => {
    const arrival = atk.arrivalDate;
    const needFreeBy = new Date(arrival.getTime() - BUFFER_MARGIN_MS);
    const targetCoord = atk.targetCoord;

    // Candidatas ordenadas por distância ao alvo, excluindo o próprio alvo
    const candidates = villages
      .filter((v) => v.coord !== targetCoord)
      .map((v) => ({
        ...v,
        dist: twSDK.calculateDistance(targetCoord, v.coord),
      }))
      .sort((a, b) => a.dist - b.dist);

    // 1. Defensora: mais próxima disponível a tempo
    const defender =
      candidates.find((v) => freeAt[v.coord] <= needFreeBy) || candidates[0];

    // Atualiza disponibilidade da defensora (ida + volta ao alvo)
    const defTrip = roundTripMs(defender.dist);
    const defFreeAt = new Date(
      arrival.getTime() + defTrip / 2 + BUFFER_MARGIN_MS,
    );
    // A defensora sai para defender e volta depois do ataque (estimativa: fica lá ~30min)
    const defReturnAt = new Date(arrival.getTime() + defTrip / 2);
    if (defReturnAt > (freeAt[defender.coord] || new Date(0))) {
      freeAt[defender.coord] = defReturnAt;
    }

    // 2. Apoio à defensora: mais próxima da defensora, disponível a tempo
    const supportCandidates = villages
      .filter((v) => v.coord !== defender.coord && v.coord !== targetCoord)
      .map((v) => ({
        ...v,
        dist: twSDK.calculateDistance(defender.coord, v.coord),
      }))
      .sort((a, b) => a.dist - b.dist);

    const support =
      supportCandidates.find((v) => freeAt[v.coord] <= needFreeBy) ||
      supportCandidates[0] ||
      null;

    // Atualiza disponibilidade do apoio (ida + volta à defensora)
    if (support) {
      const supTrip = roundTripMs(support.dist);
      const supReturn = new Date(arrival.getTime() + supTrip / 2);
      if (supReturn > (freeAt[support.coord] || new Date(0))) {
        freeAt[support.coord] = supReturn;
      }
    }

    // Avisa se a sugestão foi forçada (nenhuma disponível)
    // Avisa se a sugestão foi forçada (nenhuma disponível)
    const defBusy = freeAt[defender.coord] > needFreeBy && result.length > 0;
    const suppBusy = support && freeAt[support.coord] > needFreeBy;

    // Nível de ameaça do atacante
    const threatKey = atk.attackerCoord || atk.attackerText;
    const threat = threatMap[threatKey] || {
      icon: "🔴",
      label: "?",
      color: "#c0392b",
      bg: "#fdecea",
      border: "#c0392b",
      count: 1,
    };

    result.push({
      atk,
      defender,
      support,
      defBusy,
      suppBusy,
      defFreeAt: freeAt[defender.coord],
      suppFreeAt: support ? freeAt[support.coord] : null,
      threat,
    });
  });

  return result;
}

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
function fmtDate(d) {
  if (!d) return "?";
  const zp = (n) => String(n).padStart(2, "0");
  return `${zp(d.getDate())}/${zp(d.getMonth() + 1)} ${zp(d.getHours())}:${zp(d.getMinutes())}:${zp(d.getSeconds())}`;
}

function renderTable(mapData) {
  if (!mapData.length) return `<p>${twSDK.tt("No attacks")}</p>`;

  const base = `https://${location.host}/game.php`;

  const rows = mapData
    .map(
      ({
        atk,
        defender,
        support,
        defBusy,
        suppBusy,
        defFreeAt,
        suppFreeAt,
        threat,
      }) => {
        const tgt = atk.targetCoord;
        const tgtId = atk.targetVillageId;
        const tgtUrl = `${base}?village=${tgtId}&screen=overview`;

        // Link para a praça da defensora, pré-selecionando o alvo como destino
        const placeUrl = `${base}?village=${defender.id}&screen=place&target=${tgtId}`;
        const defUrl = `${base}?village=${defender.id}&screen=overview`;

        const defDistStr = twSDK
          .calculateDistance(tgt, defender.coord)
          .toFixed(1);
        const suppDistStr = support
          ? twSDK.calculateDistance(defender.coord, support.coord).toFixed(1)
          : "—";

        const defBusyTag = defBusy
          ? `<div class="sm-busy">${twSDK.tt("Busy")} ${fmtDate(defFreeAt)}</div>`
          : "";
        const suppBusyTag =
          suppBusy && support
            ? `<div class="sm-busy">${twSDK.tt("Busy")} ${fmtDate(suppFreeAt)}</div>`
            : "";

        const supportCell = support
          ? `<a href="${base}?village=${support.id}&screen=overview" target="_blank">
                   <strong>${support.name}</strong><br>
                   <small>(${support.coord})</small>
               </a>
               <div class="sm-dist">📏 ${suppDistStr}</div>
               ${suppBusyTag}`
          : '<em style="color:#999">—</em>';

        return `
        <tr>
            <td class="ra-tal">
                <a href="${tgtUrl}" target="_blank">
                    <strong>${atk.targetText.split(" K")[0]}</strong>
                </a>
                <div class="sm-time">🕐 ${fmtDate(atk.arrivalDate)}</div>
                <div class="sm-threat" style="color:${threat.color}; background:${threat.bg}; border-left:3px solid ${threat.border}; padding:2px 6px; border-radius:3px; margin-top:3px; font-size:11px;">
                    ${threat.icon} <strong>${atk.attackerText.split(" K")[0]}</strong>
                    <span class="sm-threat-count">(${threat.count} alvo${threat.count > 1 ? "s" : ""} — ${threat.label.split(" — ")[1]})</span>
                </div>
            </td>
            <td class="ra-tal">
                <a href="${defUrl}" target="_blank">
                    <strong>${defender.name}</strong><br>
                    <small>(${defender.coord})</small>
                </a>
                <div class="sm-dist">📏 ${defDistStr}</div>
                ${defBusyTag}
                <div class="sm-actions">
                    <a href="${placeUrl}" target="_blank" class="btn-confirm-yes sm-btn-place">
                        ${twSDK.tt("SendSupport")}
                    </a>
                </div>
            </td>
            <td class="ra-tal">${supportCell}</td>
        </tr>`;
      },
    )
    .join("");

  // Resumo de ameaças
  const threatSummary = {};
  mapData.forEach(({ threat }) => {
    if (!threatSummary[threat.level])
      threatSummary[threat.level] = { threat, count: 0 };
    threatSummary[threat.level].count++;
  });
  const legendHtml = Object.values(threatSummary)
    .map(
      ({ threat, count }) =>
        `<div class="sm-legend-item" style="background:${threat.bg}; border-color:${threat.border}; color:${threat.color};">
            ${threat.icon} ${threat.label.split(" — ")[0]}: <strong>${count}</strong>
         </div>`,
    )
    .join("");

  return `
        <div class="sm-legend">${legendHtml}</div>
        <div class="ra-table-container">
            <table class="ra-table ra-table-v2" width="100%" cellspacing="1" cellpadding="3">
                <thead>
                    <tr>
                        <th class="ra-tal">${twSDK.tt("Target")}</th>
                        <th class="ra-tal">${twSDK.tt("Defender")} + ação</th>
                        <th class="ra-tal">${twSDK.tt("Support From")}</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

// ═══════════════════════════════════════════════════════
//  TEXTO PARA COPIAR
// ═══════════════════════════════════════════════════════
function buildCopyText(mapData) {
  const base = `https://${location.host}/game.php`;
  const lines = ["=== Mapa de Apoio ===", ""];
  mapData.forEach(({ atk, defender, support }) => {
    const tUrl = `${base}?village=${atk.targetVillageId}&screen=overview`;
    const dUrl = `${base}?village=${defender.id}&screen=overview`;
    lines.push(
      `[${atk.targetText.split(" K")[0]} (${atk.targetCoord})](${tUrl}) ← ataque às ${fmtDate(atk.arrivalDate)}`,
    );
    lines.push(`  ↳ [${defender.name} (${defender.coord})](${dUrl}) DEFENDE`);
    if (support) {
      const sUrl = `${base}?village=${support.id}&screen=overview`;
      lines.push(
        `  ↳ [${support.name} (${support.coord})](${sUrl}) apoia ${defender.name}`,
      );
    }
    lines.push("");
  });
  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════
//  INTERFACE
// ═══════════════════════════════════════════════════════
function buildUI() {
  const customStyle = `
        .sm-controls { display:flex; gap:6px; margin-bottom:10px; }
        .sm-controls .btn-confirm-yes { flex:1; text-align:center; padding:5px 0; font-weight:bold; }
        .sm-status { font-size:12px; color:#7a5020; margin-bottom:8px; min-height:16px; }
        .sm-time { font-size:11px; color:#305070; margin-top:3px; }
        .sm-attacker { font-size:11px; color:#8a1010; margin-top:2px; }
        .sm-dist { font-size:11px; color:#7a5020; margin-top:3px; }
        .sm-busy { font-size:11px; color:#c05000; font-weight:bold; margin-top:3px;
                   background:#fff3e0; border-left:3px solid #e06000; padding:2px 5px; border-radius:2px; }
        .sm-actions { margin-top:5px; }
        .sm-btn-place { font-size:11px !important; padding:3px 8px !important;
                        display:inline-block; white-space:nowrap; }
        .ra-table td { vertical-align:top !important; }
        .sm-threat { line-height:1.4; }
        .sm-threat-count { font-weight:normal; opacity:0.85; }
        .sm-legend { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px; font-size:11px; }
        .sm-legend-item { display:flex; align-items:center; gap:4px; padding:3px 8px;
                          border-radius:12px; font-weight:600; border:1px solid; }
    `;

  const body = `
        <div class="sm-controls">
            <a href="#" class="btn-confirm-yes" id="sm-btn-gen">${twSDK.tt("Generate")}</a>
            <a href="#" class="btn-confirm-yes" id="sm-btn-copy" style="display:none;">${twSDK.tt("Copy All")}</a>
        </div>
        <div class="sm-status" id="sm-status"></div>
        <div id="sm-result"></div>
    `;

  twSDK.renderBoxWidget(body, "supportMap", "sm", customStyle);

  jQuery("#sm-btn-gen").on("click", async function (e) {
    e.preventDefault();
    jQuery("#sm-result").html("");
    jQuery("#sm-btn-copy").hide();
    jQuery("#sm-status").text(twSDK.tt("Loading"));

    try {
      const [attacks, villages] = await Promise.all([
        fetchAllIncomings(),
        fetchMyVillages(),
      ]);
      myVillages = villages;

      if (!attacks.length) {
        jQuery("#sm-result").html(`<p>${twSDK.tt("No attacks")}</p>`);
        jQuery("#sm-status").text("");
        return;
      }

      smMapData = buildSupportMap(attacks, villages);
      jQuery("#sm-result").html(renderTable(smMapData));
      jQuery("#sm-btn-copy").show();
      jQuery("#sm-status").text(
        `${twSDK.tt("Done")} ${attacks.length} ataque(s) · ${villages.length} vila(s) suas.`,
      );
    } catch (err) {
      jQuery("#sm-status").text("Erro: " + err.message);
      console.error("[SupportMap]", err);
    }
  });

  jQuery("#sm-btn-copy").on("click", function (e) {
    e.preventDefault();
    if (!smMapData.length) return;
    navigator.clipboard.writeText(buildCopyText(smMapData)).then(() => {
      jQuery("#sm-status").text(twSDK.tt("Copied"));
      setTimeout(() => jQuery("#sm-status").text(""), 2000);
    });
  });
}

// ═══════════════════════════════════════════════════════
//  ENTRY POINT
// ═══════════════════════════════════════════════════════
(async function () {
  // Carrega o twSDK caso não esteja presente
  if (typeof twSDK === "undefined") {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src =
        "https://cdn.jsdelivr.net/gh/RedAlertTW/Tribal-Wars-Scripts-SDK@main/twSDK.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Falha ao carregar twSDK"));
      document.head.appendChild(s);
    });
  }

  await twSDK.init(scriptConfig);

  // Valida tela
  if (
    twSDK.getParameterByName("screen") !== "overview_villages" ||
    twSDK.getParameterByName("mode") !== "incomings"
  ) {
    UI.ErrorMessage(
      "Execute na tela de Ataques Recebidos (overview_villages&mode=incomings)",
    );
    return;
  }

  // Carrega velocidades das unidades em paralelo com a UI
  await loadUnitSpeeds();
  buildUI();
})();
