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

// ═══════════════════════════════════════════════════════
//  ESTADO GLOBAL (único bloco — sem duplicatas)
// ═══════════════════════════════════════════════════════
var SM = {
  unitSpeeds: {}, // { spear: min/campo, sword: min/campo, ... }
  myVillages: [],
  mapData: [],
};

// ═══════════════════════════════════════════════════════
//  VELOCIDADE DAS TROPAS
// ═══════════════════════════════════════════════════════
var DEFENSE_UNITS = ["spear", "sword", "heavy"];
var FALLBACK_SPEED = { spear: 18, sword: 22, heavy: 14, archer: 18 };

async function loadUnitSpeeds() {
  try {
    var unitInfo = await twSDK.getWorldUnitInfo();
    var units =
      unitInfo && unitInfo.units && unitInfo.units.unit
        ? unitInfo.units.unit
        : [];
    units.forEach(function (u) {
      if (u.id && u.speed) SM.unitSpeeds[u.id] = parseFloat(u.speed);
    });
  } catch (e) {
    console.warn("[SupportMap] Usando velocidades padrão:", e);
  }
  // Preenche fallback para unidades não retornadas
  Object.keys(FALLBACK_SPEED).forEach(function (k) {
    if (!SM.unitSpeeds[k]) SM.unitSpeeds[k] = FALLBACK_SPEED[k];
  });
}

/** min/campo da tropa mais LENTA do bloco de defesa */
function defenseSpeed() {
  return Math.max.apply(
    null,
    DEFENSE_UNITS.map(function (u) {
      return SM.unitSpeeds[u] || FALLBACK_SPEED[u] || 22;
    }),
  );
}

/** Ida + volta em milissegundos */
function roundTripMs(distCampos) {
  var worldSpeed = parseFloat(game_data.speed) || 1;
  var minPerCampo = defenseSpeed() / worldSpeed;
  return distCampos * minPerCampo * 2 * 60 * 1000;
}

// ═══════════════════════════════════════════════════════
//  PARSER DA TELA DE INCOMINGS
//
//  Estrutura real da linha (confirmada pela screenshot):
//  [checkbox] [ícone+tipo] [ALVO (sua vila)] [ATACANTE] [pts] [chegada] [restante] [N/A]
//
//  Na tabela #incomings_table a célula com link da SUA vila
//  vem ANTES da célula do atacante. Porém o atacante pode
//  não ter link (jogador sem vila visível) — identificamos
//  pela coordenada: sua vila está em myVillageCoords.
// ═══════════════════════════════════════════════════════

function extractCoord(text) {
  // Aceita (XXX|YYY) ou XXX|YYY
  var m = text.match(/\((\d{1,3})\|(\d{1,3})\)/);
  if (m) return m[1] + "|" + m[2];
  var m2 = text.match(/(\d{1,3})\|(\d{1,3})/);
  return m2 ? m2[1] + "|" + m2[2] : null;
}

function getServerNow() {
  var t = jQuery("#serverTime").text().trim(); // HH:MM:SS
  var d = jQuery("#serverDate").text().trim(); // DD/MM/YYYY
  var parts = d.split("/");
  return new Date(parts[2] + "-" + parts[1] + "-" + parts[0] + "T" + t);
}

function parseArrivalDate(text) {
  text = text.trim();
  var now = getServerNow();
  var y = now.getFullYear();
  var isTomorrow = /amanh[aã]|tomorrow/i.test(text);

  // "DD.MM. às HH:MM:SS" ou "em DD.MM. às HH:MM:SS"
  var mFull = text.match(
    /(\d{1,2})\.(\d{1,2})\.\s+(?:às\s+)?(\d{2}):(\d{2}):(\d{2})/,
  );
  if (mFull) {
    return new Date(
      y +
        "-" +
        mFull[2].padStart(2, "0") +
        "-" +
        mFull[1].padStart(2, "0") +
        "T" +
        mFull[3] +
        ":" +
        mFull[4] +
        ":" +
        mFull[5],
    );
  }

  var mTime = text.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (mTime) {
    var base = new Date(now);
    base.setHours(+mTime[1], +mTime[2], +mTime[3], 0);
    if (isTomorrow) base.setDate(base.getDate() + 1);
    return base;
  }
  return null;
}

function parseIncomingsPage(doc, myCoordSet) {
  var rows = [];
  jQuery("#incomings_table tbody tr", doc).each(function () {
    var cells = jQuery("td", this);
    if (cells.length < 5) return;

    // Ignora não-ataques
    if (!/ataque|attack/i.test(cells.eq(0).text())) return;

    // Coleta todos os links de vila
    var linkEls = jQuery('a[href*="village="]', this);
    if (linkEls.length < 1) return;

    var targetText = "",
      targetCoord = null,
      targetVillageId = null;
    var attackerText = "",
      attackerCoord = null;

    // Identifica qual link é SUA vila (alvo) pela coordenada
    linkEls.each(function () {
      var txt = jQuery(this).text().trim();
      var coord = extractCoord(txt);
      var href = jQuery(this).attr("href") || "";
      var vm = href.match(/village=(\d+)/);
      var vid = vm ? parseInt(vm[1]) : null;

      if (coord && myCoordSet.has(coord)) {
        // É sua vila = alvo
        targetText = txt;
        targetCoord = coord;
        targetVillageId = vid;
      } else if (coord) {
        // Coordenada existe mas não é sua = atacante
        attackerText = txt;
        attackerCoord = coord;
      }
    });

    // Fallback: se não identificou pelo set, usa posição
    // (1º link = alvo, 2º = atacante conforme layout TW-BR)
    if (!targetCoord && linkEls.length >= 2) {
      targetText = linkEls.eq(0).text().trim();
      targetCoord = extractCoord(targetText);
      var tHref = linkEls.eq(0).attr("href") || "";
      var tVm = tHref.match(/village=(\d+)/);
      targetVillageId = tVm ? parseInt(tVm[1]) : null;

      attackerText = linkEls.eq(1).text().trim();
      attackerCoord = extractCoord(attackerText);
    } else if (!targetCoord && linkEls.length === 1) {
      targetText = linkEls.eq(0).text().trim();
      targetCoord = extractCoord(targetText);
      var tHref2 = linkEls.eq(0).attr("href") || "";
      var tVm2 = tHref2.match(/village=(\d+)/);
      targetVillageId = tVm2 ? parseInt(tVm2[1]) : null;
    }

    // Atacante sem link: pega do texto da célula (sem link)
    if (!attackerCoord) {
      cells.each(function () {
        if (attackerCoord) return;
        var t = jQuery(this).text().trim();
        var c = extractCoord(t);
        if (c && c !== targetCoord) {
          attackerCoord = c;
          if (!attackerText) attackerText = t;
        }
      });
    }

    // Extrai data de chegada
    var arrivalDate = null;
    cells.each(function () {
      if (arrivalDate) return;
      var t = jQuery(this).text().trim();
      if (
        /\d{2}:\d{2}:\d{2}/.test(t) &&
        (/\d{1,2}\.\d{1,2}\./.test(t) ||
          /amanh[aã]|amanhã|tomorrow|hoje|today/i.test(t))
      ) {
        arrivalDate = parseArrivalDate(t);
      }
    });

    if (!targetCoord || !arrivalDate) return;

    rows.push({
      attackerText: attackerText,
      attackerCoord: attackerCoord, // "XXX|YYY" ou null
      targetText: targetText,
      targetCoord: targetCoord,
      targetVillageId: targetVillageId,
      arrivalDate: arrivalDate,
    });
  });
  return rows;
}

async function fetchAllIncomings(myCoordSet) {
  var attacks = parseIncomingsPage(document, myCoordSet);

  var extraUrls = [];
  jQuery("#incomings_table")
    .closest(".vis")
    .find("select option")
    .each(function () {
      var v = jQuery(this).val();
      if (v && !window.location.href.includes(v)) extraUrls.push(v);
    });

  for (var i = 0; i < extraUrls.length; i++) {
    await new Promise(function (r) {
      setTimeout(r, (twSDK.delayBetweenRequests || 200) + 200);
    });
    try {
      var html = await jQuery.get(extraUrls[i]);
      var doc = new DOMParser().parseFromString(html, "text/html");
      attacks = attacks.concat(parseIncomingsPage(doc, myCoordSet));
    } catch (e) {
      console.warn("[SupportMap] Erro paginação:", e);
    }
  }
  return attacks;
}

// ═══════════════════════════════════════════════════════
//  VILAS DO JOGADOR
// ═══════════════════════════════════════════════════════
async function fetchMyVillages() {
  var villages = [];
  try {
    var txt = await jQuery.get("/map/village.txt");
    var pid = parseInt(game_data.player.id);
    txt
      .trim()
      .split("\n")
      .forEach(function (line) {
        var p = line.split(",");
        if (p.length >= 5 && parseInt(p[4]) === pid) {
          villages.push({
            id: parseInt(p[0]),
            name: decodeURIComponent(p[1].replace(/\+/g, " ")),
            x: parseInt(p[2]),
            y: parseInt(p[3]),
            coord: p[2] + "|" + p[3],
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
      coord: game_data.village.x + "|" + game_data.village.y,
    });
  }
  return villages;
}

// ═══════════════════════════════════════════════════════
//  ANÁLISE DE AMEAÇA POR ATACANTE
//
//  Chave = attackerCoord (ex: "594|215").
//  Se a coord não foi parseada, usa o village ID extraído
//  do href, ou como último recurso o nome sem K-continente.
//
//  1 alvo  → 🔴 PERIGO   (força concentrada)
//  2 alvos → 🟡 ATENÇÃO  (força dividida)
//  3+      → 🟢 SEGURO   (força muito diluída)
// ═══════════════════════════════════════════════════════
function attackerKey(atk) {
  // Preferência: coordenada (mais estável)
  if (atk.attackerCoord) return atk.attackerCoord;
  // Fallback: nome sem continente (ex: "Rolo Compressor !!!")
  return (
    atk.attackerText.replace(/\s*\(\d+\|\d+\)\s*K\d+\s*$/, "").trim() ||
    atk.attackerText
  );
}

function buildThreatMap(attacks) {
  var map = {};
  attacks.forEach(function (atk) {
    var key = attackerKey(atk);
    if (!map[key]) {
      map[key] = {
        targets: {},
        attackerText: atk.attackerText,
        attackerCoord: atk.attackerCoord,
      };
    }
    map[key].targets[atk.targetCoord] = true; // Set via object
  });

  Object.keys(map).forEach(function (key) {
    var count = Object.keys(map[key].targets).length;
    map[key].count = count;
    if (count === 1) {
      map[key].level = "danger";
      map[key].icon = "🔴";
      map[key].desc = "Perigo — ataque concentrado";
      map[key].color = "#922b21";
      map[key].bg = "#fdecea";
      map[key].border = "#c0392b";
    } else if (count === 2) {
      map[key].level = "warning";
      map[key].icon = "🟡";
      map[key].desc = "Atenção — força dividida";
      map[key].color = "#7d6608";
      map[key].bg = "#fefde7";
      map[key].border = "#d4ac0d";
    } else {
      map[key].level = "safe";
      map[key].icon = "🟢";
      map[key].desc = "Seguro — força diluída";
      map[key].color = "#1e8449";
      map[key].bg = "#eafaf1";
      map[key].border = "#27ae60";
    }
  });
  return map;
}

// ═══════════════════════════════════════════════════════
//  LÓGICA DE DISPONIBILIDADE E MAPA DE APOIO
// ═══════════════════════════════════════════════════════
var BUFFER_MS = 5 * 60 * 1000; // 5 min de margem

function buildSupportMap(attacks, villages) {
  if (!attacks.length || !villages.length) return [];

  var threatMap = buildThreatMap(attacks);

  // Disponibilidade: coord → Date (livre a partir de)
  var freeAt = {};
  villages.forEach(function (v) {
    freeAt[v.coord] = new Date(0);
  });

  // Ordena por chegada
  var sorted = attacks.slice().sort(function (a, b) {
    return a.arrivalDate - b.arrivalDate;
  });

  var result = [];

  sorted.forEach(function (atk) {
    var arrival = atk.arrivalDate;
    var needFreeBy = new Date(arrival.getTime() - BUFFER_MS);
    var tgt = atk.targetCoord;

    // Candidatas à defensora: ordenadas por distância ao alvo, exceto o próprio alvo
    var candidates = villages
      .filter(function (v) {
        return v.coord !== tgt;
      })
      .map(function (v) {
        return Object.assign({}, v, {
          dist: parseFloat(twSDK.calculateDistance(tgt, v.coord)),
        });
      })
      .sort(function (a, b) {
        return a.dist - b.dist;
      });

    // 1. Defensora: mais próxima disponível a tempo
    var defender = null;
    for (var i = 0; i < candidates.length; i++) {
      if (freeAt[candidates[i].coord] <= needFreeBy) {
        defender = candidates[i];
        break;
      }
    }
    var defForced = !defender;
    if (!defender) defender = candidates[0]; // forçado

    // Atualiza freeAt da defensora
    var defReturn = new Date(
      arrival.getTime() + roundTripMs(defender.dist) / 2,
    );
    if (defReturn > freeAt[defender.coord]) freeAt[defender.coord] = defReturn;

    // 2. Apoio: mais próxima da defensora, disponível a tempo
    var suppCandidates = villages
      .filter(function (v) {
        return v.coord !== defender.coord && v.coord !== tgt;
      })
      .map(function (v) {
        return Object.assign({}, v, {
          dist: parseFloat(twSDK.calculateDistance(defender.coord, v.coord)),
        });
      })
      .sort(function (a, b) {
        return a.dist - b.dist;
      });

    var support = null,
      suppForced = false;
    for (var j = 0; j < suppCandidates.length; j++) {
      if (freeAt[suppCandidates[j].coord] <= needFreeBy) {
        support = suppCandidates[j];
        break;
      }
    }
    if (!support && suppCandidates.length) {
      support = suppCandidates[0];
      suppForced = true;
    }

    if (support) {
      var suppReturn = new Date(
        arrival.getTime() + roundTripMs(support.dist) / 2,
      );
      if (suppReturn > freeAt[support.coord])
        freeAt[support.coord] = suppReturn;
    }

    var threat = threatMap[attackerKey(atk)] || {
      icon: "🔴",
      desc: "?",
      color: "#922b21",
      bg: "#fdecea",
      border: "#c0392b",
      count: 1,
      level: "danger",
    };

    result.push({
      atk: atk,
      defender: defender,
      support: support,
      defForced: defForced,
      suppForced: suppForced,
      defFreeAt: freeAt[defender.coord],
      suppFreeAt: support ? freeAt[support.coord] : null,
      threat: threat,
    });
  });

  return result;
}

// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
function fmtDate(d) {
  if (!d) return "?";
  var zp = function (n) {
    return String(n).padStart(2, "0");
  };
  return (
    zp(d.getDate()) +
    "/" +
    zp(d.getMonth() + 1) +
    " " +
    zp(d.getHours()) +
    ":" +
    zp(d.getMinutes()) +
    ":" +
    zp(d.getSeconds())
  );
}

function renderTable(mapData) {
  if (!mapData.length) return "<p>" + twSDK.tt("No attacks") + "</p>";

  var base = "https://" + location.host + "/game.php";

  // Legenda de ameaça
  var legendTotals = { danger: 0, warning: 0, safe: 0 };
  mapData.forEach(function (e) {
    if (legendTotals[e.threat.level] !== undefined)
      legendTotals[e.threat.level]++;
  });
  var legendHtml = [
    {
      level: "danger",
      icon: "🔴",
      label: "Perigo",
      color: "#922b21",
      bg: "#fdecea",
      border: "#c0392b",
    },
    {
      level: "warning",
      icon: "🟡",
      label: "Atenção",
      color: "#7d6608",
      bg: "#fefde7",
      border: "#d4ac0d",
    },
    {
      level: "safe",
      icon: "🟢",
      label: "Seguro",
      color: "#1e8449",
      bg: "#eafaf1",
      border: "#27ae60",
    },
  ]
    .filter(function (l) {
      return legendTotals[l.level] > 0;
    })
    .map(function (l) {
      return (
        '<span class="sm-legend-item" style="background:' +
        l.bg +
        ";border-color:" +
        l.border +
        ";color:" +
        l.color +
        ';">' +
        l.icon +
        " " +
        l.label +
        ": <strong>" +
        legendTotals[l.level] +
        "</strong></span>"
      );
    })
    .join("");

  var rows = mapData
    .map(function (e) {
      var atk = e.atk;
      var defender = e.defender;
      var support = e.support;
      var threat = e.threat;

      var tgtId = atk.targetVillageId;
      var tgtUrl = base + "?village=" + tgtId + "&screen=overview";
      var placeUrl =
        base + "?village=" + defender.id + "&screen=place&target=" + tgtId;
      var defUrl = base + "?village=" + defender.id + "&screen=overview";

      var defDist = parseFloat(
        twSDK.calculateDistance(atk.targetCoord, defender.coord),
      ).toFixed(1);

      // Nome limpo do atacante (sem coordenada e continente)
      var atkName =
        atk.attackerText.replace(/\s*\(\d+\|\d+\)\s*K\d+\s*$/, "").trim() ||
        atk.attackerText;
      var atkCoord = atk.attackerCoord ? " (" + atk.attackerCoord + ")" : "";

      var busyTag = function (forced, freeAtDate) {
        return forced
          ? '<div class="sm-busy">⏳ ocupada até ' +
              fmtDate(freeAtDate) +
              "</div>"
          : "";
      };

      var supportCell = support
        ? '<a href="' +
          base +
          "?village=" +
          support.id +
          '&screen=overview" target="_blank">' +
          "<strong>" +
          support.name +
          "</strong><br><small>(" +
          support.coord +
          ")</small></a>" +
          '<div class="sm-dist">📏 ' +
          parseFloat(
            twSDK.calculateDistance(defender.coord, support.coord),
          ).toFixed(1) +
          " campos</div>" +
          busyTag(e.suppForced, e.suppFreeAt)
        : '<em style="color:#999">—</em>';

      var tgtName = atk.targetText.replace(/\s*K\d+\s*$/, "").trim();

      return (
        "<tr>" +
        '<td class="ra-tal">' +
        '<a href="' +
        tgtUrl +
        '" target="_blank"><strong>' +
        tgtName +
        "</strong></a>" +
        '<div class="sm-time">🕐 ' +
        fmtDate(atk.arrivalDate) +
        "</div>" +
        '<div class="sm-threat" style="background:' +
        threat.bg +
        ";border-left:3px solid " +
        threat.border +
        ";color:" +
        threat.color +
        ';">' +
        threat.icon +
        " <strong>" +
        atkName +
        "</strong>" +
        atkCoord +
        '<span class="sm-threat-sub"> · ' +
        threat.count +
        " alvo" +
        (threat.count > 1 ? "s" : "") +
        " · " +
        threat.desc.split(" — ")[1] +
        "</span>" +
        "</div>" +
        "</td>" +
        '<td class="ra-tal">' +
        '<a href="' +
        defUrl +
        '" target="_blank"><strong>' +
        defender.name +
        "</strong><br><small>(" +
        defender.coord +
        ")</small></a>" +
        '<div class="sm-dist">📏 ' +
        defDist +
        " campos</div>" +
        busyTag(e.defForced, e.defFreeAt) +
        '<div class="sm-actions"><a href="' +
        placeUrl +
        '" target="_blank" class="btn-confirm-yes sm-btn-place">' +
        twSDK.tt("SendSupport") +
        "</a></div>" +
        "</td>" +
        '<td class="ra-tal">' +
        supportCell +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  return (
    '<div class="sm-legend">' +
    legendHtml +
    "</div>" +
    '<div class="ra-table-container">' +
    '<table class="ra-table ra-table-v2" width="100%" cellspacing="1" cellpadding="3">' +
    "<thead><tr>" +
    '<th class="ra-tal">' +
    twSDK.tt("Target") +
    "</th>" +
    '<th class="ra-tal">' +
    twSDK.tt("Defender") +
    "</th>" +
    '<th class="ra-tal">' +
    twSDK.tt("Support From") +
    "</th>" +
    "</tr></thead><tbody>" +
    rows +
    "</tbody></table></div>"
  );
}

// ═══════════════════════════════════════════════════════
//  TEXTO PARA COPIAR
// ═══════════════════════════════════════════════════════
function buildCopyText(mapData) {
  var base = "https://" + location.host + "/game.php";
  var lines = ["=== Mapa de Apoio ===", ""];
  mapData.forEach(function (e) {
    var atk = e.atk;
    var tUrl = base + "?village=" + atk.targetVillageId + "&screen=overview";
    var dUrl = base + "?village=" + e.defender.id + "&screen=overview";
    var tgtName = atk.targetText.replace(/\s*K\d+\s*$/, "").trim();
    var atkName = atk.attackerText
      .replace(/\s*\(\d+\|\d+\)\s*K\d+\s*$/, "")
      .trim();
    lines.push(
      e.threat.icon +
        " [" +
        tgtName +
        "](" +
        tUrl +
        ") ← " +
        atkName +
        " · " +
        fmtDate(atk.arrivalDate),
    );
    lines.push(
      "  ↳ [" +
        e.defender.name +
        " (" +
        e.defender.coord +
        ")](" +
        dUrl +
        ") DEFENDE",
    );
    if (e.support) {
      var sUrl = base + "?village=" + e.support.id + "&screen=overview";
      lines.push(
        "  ↳ [" +
          e.support.name +
          " (" +
          e.support.coord +
          ")](" +
          sUrl +
          ") apoia " +
          e.defender.name,
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
  var customStyle = [
    ".sm-controls{display:flex;gap:6px;margin-bottom:10px;}",
    ".sm-controls .btn-confirm-yes{flex:1;text-align:center;padding:5px 0;font-weight:bold;}",
    ".sm-status{font-size:12px;color:#7a5020;margin-bottom:8px;min-height:16px;}",
    ".sm-time{font-size:11px;color:#305070;margin-top:3px;}",
    ".sm-dist{font-size:11px;color:#7a5020;margin-top:3px;}",
    ".sm-threat{font-size:11px;padding:3px 6px;border-radius:3px;margin-top:4px;line-height:1.5;}",
    ".sm-threat-sub{font-weight:normal;opacity:0.85;}",
    ".sm-busy{font-size:11px;color:#c05000;font-weight:bold;margin-top:3px;background:#fff3e0;border-left:3px solid #e06000;padding:2px 5px;border-radius:2px;}",
    ".sm-actions{margin-top:5px;}",
    ".sm-btn-place{font-size:11px!important;padding:3px 8px!important;display:inline-block;white-space:nowrap;}",
    ".sm-legend{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;}",
    ".sm-legend-item{font-size:12px;padding:3px 10px;border-radius:12px;border:1px solid;font-weight:600;}",
    ".ra-table td{vertical-align:top!important;}",
  ].join("\n");

  var body = [
    '<div class="sm-controls">',
    '<a href="#" class="btn-confirm-yes" id="sm-btn-gen">' +
      twSDK.tt("Generate") +
      "</a>",
    '<a href="#" class="btn-confirm-yes" id="sm-btn-copy" style="display:none;">' +
      twSDK.tt("Copy All") +
      "</a>",
    "</div>",
    '<div class="sm-status" id="sm-status"></div>',
    '<div id="sm-result"></div>',
  ].join("");

  twSDK.renderBoxWidget(body, "supportMap", "sm", customStyle);

  jQuery("#sm-btn-gen").on("click", async function (e) {
    e.preventDefault();
    jQuery("#sm-result").html("");
    jQuery("#sm-btn-copy").hide();
    jQuery("#sm-status").text(twSDK.tt("Loading"));

    try {
      SM.myVillages = await fetchMyVillages();
      var myCoordSet = new Set(
        SM.myVillages.map(function (v) {
          return v.coord;
        }),
      );

      var attacks = await fetchAllIncomings(myCoordSet);

      if (!attacks.length) {
        jQuery("#sm-result").html("<p>" + twSDK.tt("No attacks") + "</p>");
        jQuery("#sm-status").text("");
        return;
      }

      SM.mapData = buildSupportMap(attacks, SM.myVillages);
      jQuery("#sm-result").html(renderTable(SM.mapData));
      jQuery("#sm-btn-copy").show();
      jQuery("#sm-status").text(
        twSDK.tt("Done") +
          " " +
          attacks.length +
          " ataque(s) · " +
          SM.myVillages.length +
          " vilas suas.",
      );
    } catch (err) {
      jQuery("#sm-status").text("Erro: " + err.message);
      console.error("[SupportMap]", err);
    }
  });

  jQuery("#sm-btn-copy").on("click", function (e) {
    e.preventDefault();
    if (!SM.mapData.length) return;
    navigator.clipboard.writeText(buildCopyText(SM.mapData)).then(function () {
      jQuery("#sm-status").text(twSDK.tt("Copied"));
      setTimeout(function () {
        jQuery("#sm-status").text("");
      }, 2000);
    });
  });
}

// ═══════════════════════════════════════════════════════
//  ENTRY POINT
// ═══════════════════════════════════════════════════════
(async function () {
  if (typeof twSDK === "undefined") {
    await new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src =
        "https://cdn.jsdelivr.net/gh/RedAlertTW/Tribal-Wars-Scripts-SDK@main/twSDK.js";
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error("Falha ao carregar twSDK"));
      };
      document.head.appendChild(s);
    });
  }

  await twSDK.init(scriptConfig);

  if (
    twSDK.getParameterByName("screen") !== "overview_villages" ||
    twSDK.getParameterByName("mode") !== "incomings"
  ) {
    UI.ErrorMessage(
      "Execute na tela de Ataques Recebidos (overview_villages&mode=incomings)",
    );
    return;
  }

  await loadUnitSpeeds();
  buildUI();
})();
