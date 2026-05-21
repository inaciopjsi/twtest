/*
    NAME: Support Map
    DESCRIPTION: Mapa de apoio inteligente para a tela de ataques recebidos.
                 Calcula tempo de deslocamento real (spear/sword/heavy),
                 garante disponibilidade das vilas de apoio e indica o nível
                 de ameaça por aldeia atacante via código de cor.
    VERSION: 2.1.0
    AUTHOR: inaciopjsi
    SCREEN: overview_villages&mode=incomings
*/

// ═══════════════════════════════════════════════════════
//  scriptConfig
// ═══════════════════════════════════════════════════════
var scriptConfig = {
  scriptData: {
    name: "Support Map",
    version: "v2.1.0",
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

// =====================================================
// ESTADO GLOBAL
// =====================================================
const SM = {
  unitSpeeds: {},
  myVillages: [],
  mapData: [],
  distanceCache: {},
};

const DEFENSE_UNITS = ["spear", "sword", "heavy"];
const FALLBACK_SPEED = {
  spear: 18,
  sword: 22,
  heavy: 11,
  archer: 18,
};

const BUFFER_MS = 5 * 60 * 1000;

// =====================================================
// UTILITÁRIOS
// =====================================================
function extractCoord(text) {
  const m = String(text).match(/(\d{1,3})\|(\d{1,3})/);
  return m ? `${m[1]}|${m[2]}` : null;
}

function fmtDate(d) {
  if (!d) return "?";

  const pad = (n) => String(n).padStart(2, "0");

  return (
    pad(d.getDate()) +
    "/" +
    pad(d.getMonth() + 1) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds())
  );
}

function getDistance(a, b) {
  const key = a < b ? `${a}:${b}` : `${b}:${a}`;

  if (SM.distanceCache[key] === undefined) {
    SM.distanceCache[key] = twSDK.calculateDistance(a, b);
  }

  return SM.distanceCache[key];
}

function getServerNow() {
  const time = jQuery("#serverTime").text().trim();
  const date = jQuery("#serverDate").text().trim();

  const [day, month, year] = date.split("/");

  return new Date(`${year}-${month}-${day}T${time}`);
}

function parseArrivalDate(text) {
  text = text.trim();

  const now = getServerNow();
  const currentYear = now.getFullYear();

  const isTomorrow = /amanh[aã]|tomorrow/i.test(text);

  const full = text.match(
    /(\d{1,2})\.(\d{1,2})\.\s+(?:às\s+)?(\d{2}):(\d{2}):(\d{2})/,
  );

  if (full) {
    const day = full[1].padStart(2, "0");
    const month = full[2].padStart(2, "0");

    return new Date(
      `${currentYear}-${month}-${day}T${full[3]}:${full[4]}:${full[5]}`,
    );
  }

  const onlyTime = text.match(/(\d{2}):(\d{2}):(\d{2})/);

  if (onlyTime) {
    const dt = new Date(now);
    dt.setHours(+onlyTime[1], +onlyTime[2], +onlyTime[3], 0);

    if (isTomorrow) {
      dt.setDate(dt.getDate() + 1);
    }

    return dt;
  }

  return null;
}

// =====================================================
// VELOCIDADE
// =====================================================
async function loadUnitSpeeds() {
  try {
    const unitInfo = await twSDK.getWorldUnitInfo();
    const units = unitInfo?.units?.unit || [];

    units.forEach((u) => {
      if (u.id && u.speed) {
        SM.unitSpeeds[u.id] = parseFloat(u.speed);
      }
    });
  } catch (e) {
    console.warn("[SupportMap] Usando fallback de velocidades", e);
  }

  Object.keys(FALLBACK_SPEED).forEach((unit) => {
    if (!SM.unitSpeeds[unit]) {
      SM.unitSpeeds[unit] = FALLBACK_SPEED[unit];
    }
  });
}

function defenseSpeed() {
  return Math.max(
    ...DEFENSE_UNITS.map(
      (unit) => SM.unitSpeeds[unit] || FALLBACK_SPEED[unit] || 22,
    ),
  );
}

function tripMs(distance) {
  const speedFactor =
    (parseFloat(game_data.speed) || 1) *
    (parseFloat(game_data.unit_speed) || 1);

  const minutesPerField = defenseSpeed() / speedFactor;

  return distance * minutesPerField * 60 * 1000;
}

function roundTripMs(distance) {
  return tripMs(distance) * 2;
}

// =====================================================
// VILAS DO JOGADOR
// =====================================================
async function fetchMyVillages() {
  const villages = [];

  try {
    const txt = await jQuery.get("/map/village.txt");
    const playerId = parseInt(game_data.player.id, 10);

    txt
      .trim()
      .split("\n")
      .forEach((line) => {
        const parts = line.split(",");

        if (parts.length >= 5 && parseInt(parts[4], 10) === playerId) {
          villages.push({
            id: parseInt(parts[0], 10),
            name: decodeURIComponent(parts[1].replace(/\+/g, " ")),
            x: parseInt(parts[2], 10),
            y: parseInt(parts[3], 10),
            coord: `${parts[2]}|${parts[3]}`,
          });
        }
      });
  } catch (e) {
    villages.push({
      id: parseInt(game_data.village.id, 10),
      name: game_data.village.name,
      x: parseInt(game_data.village.x, 10),
      y: parseInt(game_data.village.y, 10),
      coord: `${game_data.village.x}|${game_data.village.y}`,
    });
  }

  return villages;
}

// =====================================================
// ATAQUES RECEBIDOS
// =====================================================
function parseIncomingsPage(doc, myCoordSet) {
  const attacks = [];

  jQuery("#incomings_table tbody tr", doc).each(function () {
    const rowText = jQuery(this).text();

    if (!/(Ataque|Attack)/i.test(rowText)) {
      return;
    }

    const links = jQuery('a[href*="village="]', this);

    if (!links.length) return;

    let targetText = "";
    let targetCoord = null;
    let targetVillageId = null;

    let attackerText = "";
    let attackerCoord = null;

    links.each(function () {
      const txt = jQuery(this).text().trim();
      const coord = extractCoord(txt);

      if (!coord) return;

      const href = jQuery(this).attr("href") || "";
      const m = href.match(/village=(\d+)/);
      const villageId = m ? parseInt(m[1], 10) : null;

      if (myCoordSet.has(coord)) {
        targetText = txt;
        targetCoord = coord;
        targetVillageId = villageId;
      } else {
        attackerText = txt;
        attackerCoord = coord;
      }
    });

    let arrivalDate = null;

    jQuery("td", this).each(function () {
      if (arrivalDate) return;

      const txt = jQuery(this).text().trim();

      if (/\d{2}:\d{2}:\d{2}/.test(txt)) {
        const parsed = parseArrivalDate(txt);
        if (parsed) arrivalDate = parsed;
      }
    });

    if (!targetCoord || !arrivalDate) return;

    attacks.push({
      attackerText,
      attackerCoord,
      targetText,
      targetCoord,
      targetVillageId,
      arrivalDate,
    });
  });

  return attacks;
}

async function fetchAllIncomings(myCoordSet) {
  let attacks = parseIncomingsPage(document, myCoordSet);

  const urls = new Set();

  jQuery("#incomings_table")
    .closest(".vis")
    .find("select option")
    .each(function () {
      const value = jQuery(this).val();

      if (value && !window.location.href.includes(value)) {
        urls.add(value);
      }
    });

  for (const url of urls) {
    try {
      const html = await jQuery.get(url);
      const doc = new DOMParser().parseFromString(html, "text/html");

      attacks = attacks.concat(parseIncomingsPage(doc, myCoordSet));
    } catch (e) {
      console.warn("Erro ao processar paginação", e);
    }
  }

  return attacks;
}

// =====================================================
// AMEAÇA
// =====================================================
function attackerKey(atk) {
  return atk.attackerCoord || atk.attackerText;
}

function buildThreatMap(attacks) {
  const map = {};

  attacks.forEach((atk) => {
    const key = attackerKey(atk);

    if (!map[key]) {
      map[key] = {
        targets: {},
      };
    }

    map[key].targets[atk.targetCoord] = true;
  });

  Object.keys(map).forEach((key) => {
    const count = Object.keys(map[key].targets).length;

    map[key].count = count;

    if (count === 1) {
      Object.assign(map[key], {
        level: "danger",
        icon: "🔴",
        color: "#922b21",
        bg: "#fdecea",
        border: "#c0392b",
        desc: "Perigo",
      });
    } else if (count === 2) {
      Object.assign(map[key], {
        level: "warning",
        icon: "🟡",
        color: "#7d6608",
        bg: "#fefde7",
        border: "#d4ac0d",
        desc: "Atenção",
      });
    } else {
      Object.assign(map[key], {
        level: "safe",
        icon: "🟢",
        color: "#1e8449",
        bg: "#eafaf1",
        border: "#27ae60",
        desc: "Seguro",
      });
    }
  });

  return map;
}

// =====================================================
// LÓGICA DE APOIO
// =====================================================
function buildSupportMap(attacks, villages) {
  if (!attacks.length || !villages.length) return [];

  const threatMap = buildThreatMap(attacks);

  const freeAt = {};

  villages.forEach((v) => {
    freeAt[v.coord] = new Date(0);
  });

  const sorted = attacks.slice().sort((a, b) => a.arrivalDate - b.arrivalDate);

  const result = [];

  sorted.forEach((atk) => {
    const arrival = atk.arrivalDate;
    const needFreeBy = new Date(arrival.getTime() - BUFFER_MS);
    const targetCoord = atk.targetCoord;

    const candidates = villages
      .filter((v) => v.coord !== targetCoord)
      .map((v) => ({
        ...v,
        dist: getDistance(targetCoord, v.coord),
      }))
      .sort((a, b) => a.dist - b.dist);

    let defender = null;
    let defForced = false;

    for (const v of candidates) {
      const travel = tripMs(v.dist);
      const latestDeparture = arrival.getTime() - travel;

      if (freeAt[v.coord].getTime() <= latestDeparture) {
        defender = v;
        break;
      }
    }

    if (!defender && candidates.length) {
      defender = candidates[0];
      defForced = true;
    }

    if (!defender) return;

    const defenderFreeAt = new Date(
      arrival.getTime() + roundTripMs(defender.dist),
    );

    freeAt[defender.coord] = defenderFreeAt;

    const supportCandidates = villages
      .filter((v) => v.coord !== targetCoord && v.coord !== defender.coord)
      .map((v) => ({
        ...v,
        dist: getDistance(defender.coord, v.coord),
      }))
      .sort((a, b) => a.dist - b.dist);

    let support = null;
    let suppForced = false;

    for (const v of supportCandidates) {
      const travel = tripMs(v.dist);
      const latestDeparture = arrival.getTime() - travel;

      if (freeAt[v.coord].getTime() <= latestDeparture) {
        support = v;
        break;
      }
    }

    if (!support && supportCandidates.length) {
      support = supportCandidates[0];
      suppForced = true;
    }

    let supportFreeAt = null;

    if (support) {
      supportFreeAt = new Date(arrival.getTime() + roundTripMs(support.dist));

      freeAt[support.coord] = supportFreeAt;
    }

    result.push({
      atk,
      defender,
      support,
      defForced,
      suppForced,
      defFreeAt: defenderFreeAt,
      suppFreeAt: supportFreeAt,
      threat: threatMap[attackerKey(atk)],
    });
  });

  return result;
}

// =====================================================
// RENDER
// =====================================================
function renderTable(mapData) {
  if (!mapData.length) {
    return `<p>${twSDK.tt("No attacks")}</p>`;
  }

  const base = `https://${location.host}/game.php`;

  const rows = mapData
    .map((e) => {
      const atk = e.atk;
      const defender = e.defender;
      const support = e.support;
      const threat = e.threat;

      const placeUrl = `${base}?village=${defender.id}&screen=place&target=${atk.targetVillageId}`;

      const supportText = support ? `${support.name} (${support.coord})` : "—";

      return `
          <tr>
            <td class="ra-tal">
              <strong>${atk.targetText}</strong><br>
              <small>${fmtDate(atk.arrivalDate)}</small><br>
              <div style="background:${threat.bg};border-left:4px solid ${threat.border};padding:4px;margin-top:4px;color:${threat.color};">
                ${threat.icon} ${atk.attackerText || atk.attackerCoord || "?"}
                <br>
                <small>${threat.desc} (${threat.count} alvo${threat.count > 1 ? "s" : ""})</small>
              </div>
            </td>
            <td class="ra-tal">
              <strong>${defender.name}</strong><br>
              <small>(${defender.coord})</small><br>
              <a href="${placeUrl}" target="_blank" class="btn-confirm-yes" style="margin-top:4px;display:inline-block;">
                ${twSDK.tt("SendSupport")}
              </a>
            </td>
            <td class="ra-tal">${supportText}</td>
          </tr>
        `;
    })
    .join("");

  return `
      <div class="ra-table-container">
        <table class="ra-table ra-table-v2" width="100%">
          <thead>
            <tr>
              <th>${twSDK.tt("Target")}</th>
              <th>${twSDK.tt("Defender")}</th>
              <th>${twSDK.tt("Support From")}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
}

function buildCopyText(mapData) {
  const lines = ["=== Mapa de Apoio ===", ""];

  mapData.forEach((e) => {
    lines.push(
      `${e.threat.icon} ${e.atk.targetText} <- ${e.atk.attackerText || e.atk.attackerCoord}`,
    );
    lines.push(`  DEF: ${e.defender.name} (${e.defender.coord})`);

    if (e.support) {
      lines.push(`  SUP: ${e.support.name} (${e.support.coord})`);
    }

    lines.push("");
  });

  return lines.join("\n");
}

// =====================================================
// UI
// =====================================================
function buildUI() {
  const body = `
      <div style="margin-bottom:10px;display:flex;gap:6px;">
        <a href="#" id="sm-btn-gen" class="btn-confirm-yes" style="flex:1;">
          ${twSDK.tt("Generate")}
        </a>
        <a href="#" id="sm-btn-copy" class="btn-confirm-yes" style="display:none;">
          ${twSDK.tt("Copy All")}
        </a>
      </div>
      <div id="sm-status" style="margin-bottom:8px;"></div>
      <div id="sm-result"></div>
    `;

  twSDK.renderBoxWidget(body, "supportMap", "sm");

  jQuery("#sm-btn-gen").on("click", async function (e) {
    e.preventDefault();

    jQuery("#sm-status").text(twSDK.tt("Loading"));
    jQuery("#sm-result").html("");
    jQuery("#sm-btn-copy").hide();

    try {
      SM.myVillages = await fetchMyVillages();

      const myCoordSet = new Set(SM.myVillages.map((v) => v.coord));

      const attacks = await fetchAllIncomings(myCoordSet);

      SM.mapData = buildSupportMap(attacks, SM.myVillages);

      jQuery("#sm-result").html(renderTable(SM.mapData));
      jQuery("#sm-status").text(
        `${twSDK.tt("Done")} ${attacks.length} ataque(s).`,
      );

      if (SM.mapData.length) {
        jQuery("#sm-btn-copy").show();
      }
    } catch (err) {
      console.error(err);
      jQuery("#sm-status").text(`Erro: ${err.message}`);
    }
  });

  jQuery("#sm-btn-copy").on("click", function (e) {
    e.preventDefault();

    navigator.clipboard.writeText(buildCopyText(SM.mapData)).then(() => {
      jQuery("#sm-status").text(twSDK.tt("Copied"));
    });
  });
}

// =====================================================
// ENTRY POINT
// =====================================================
(async function () {
  await twSDK.init(scriptConfig);

  if (
    twSDK.getParameterByName("screen") !== "overview_villages" ||
    twSDK.getParameterByName("mode") !== "incomings"
  ) {
    UI.ErrorMessage("Execute na tela overview_villages&mode=incomings");
    return;
  }

  await loadUnitSpeeds();
  buildUI();
})();
