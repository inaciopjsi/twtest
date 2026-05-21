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

/*
    NAME: Support Map
    DESCRIPTION: Mapa de apoio inteligente para a tela de ataques recebidos.
                 Calcula tempo de deslocamento real (spear/sword/heavy),
                 garante disponibilidade das vilas de apoio e indica o nível
                 de ameaça por aldeia atacante via código de cor.
    VERSION: 2.2.0
    AUTHOR: inaciopjsi
    SCREEN: overview_villages&mode=incomings

    CORREÇÕES v2.2.0:
    - [BUG] freeAt não é atualizado quando defensora/apoio é forçado (chegará tarde)
    - [BUG] decodeURIComponent sem try/catch em nomes de vilas com encoding ISO
    - [BUG] parseArrivalDate não trata virada de ano
    - [PERF] Usa game_data.villages antes de requisitar village.txt
    - [UX] Badge "chegará tarde" visível na tabela
    - [UX] Coluna "Enviar até" com horário limite de envio
    - [FEAT] Redireciona automaticamente para a tela correta se não estiver nela
    - [ROBUST] Guard para twSDK.getWorldUnitInfo ausente
    - [ROBUST] Paginação busca também links <a> além de <select>
*/

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════
  //  REDIRECIONAMENTO AUTOMÁTICO
  // ═══════════════════════════════════════════════════════
  (function redirectIfNeeded() {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get("screen");
    const mode = params.get("mode");

    if (screen === "overview_villages" && mode === "incomings") return;

    const base = window.location.href.split("?")[0];
    const village =
      typeof game_data !== "undefined" && game_data.village
        ? game_data.village.id
        : params.get("village") || "";

    const target = `${base}?village=${village}&screen=overview_villages&mode=incomings`;

    if (typeof UI !== "undefined" && UI.InfoMessage) {
      UI.InfoMessage(
        "Support Map: redirecionando para a tela de ataques recebidos…",
        2000,
      );
    }

    setTimeout(function () {
      window.location.href = target;
    }, 800);
  })();

  // Se chegou aqui, está na tela certa — prossegue normalmente
  if (
    new URLSearchParams(window.location.search).get("screen") !==
      "overview_villages" ||
    new URLSearchParams(window.location.search).get("mode") !== "incomings"
  ) {
    return; // aguarda o redirecionamento
  }

  // ═══════════════════════════════════════════════════════
  //  scriptConfig
  // ═══════════════════════════════════════════════════════
  var scriptConfig = {
    scriptData: {
      name: "Support Map",
      version: "v2.2.0",
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
        SendUntil: "Enviar até",
        "No attacks": "Nenhum ataque recebido encontrado.",
        Loading: "Carregando…",
        Done: "Concluído!",
        Copied: "Copiado!",
        SendSupport: "🛡 Enviar Apoio",
        Late: "⚠ chegará tarde",
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
        SendUntil: "Send until",
        "No attacks": "No incoming attacks found.",
        Loading: "Loading…",
        Done: "Done!",
        Copied: "Copied!",
        SendSupport: "🛡 Send Support",
        Late: "⚠ will arrive late",
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
  //  ESTADO GLOBAL (encapsulado no IIFE)
  // ═══════════════════════════════════════════════════════
  var SM = {
    unitSpeeds: {},
    myVillages: [],
    mapData: [],
    distanceCache: {},
  };

  var DEFENSE_UNITS = ["spear", "sword", "heavy"];
  var FALLBACK_SPEED = { spear: 18, sword: 22, heavy: 11, archer: 18 };
  var BUFFER_MS = 5 * 60 * 1000;

  // ═══════════════════════════════════════════════════════
  //  UTILITÁRIOS
  // ═══════════════════════════════════════════════════════
  function tt(str) {
    var locale = typeof game_data !== "undefined" ? game_data.locale : "pt_BR";
    var loc = scriptConfig.translations[locale];
    if (loc && loc[str] !== undefined) return loc[str];
    var en = scriptConfig.translations["en_DK"];
    return en && en[str] !== undefined ? en[str] : str;
  }

  function extractCoord(text) {
    var m = String(text).match(/(\d{1,3})\|(\d{1,3})/);
    return m ? m[1] + "|" + m[2] : null;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function fmtDate(d) {
    if (!d) return "?";
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
    var key = a < b ? a + ":" + b : b + ":" + a;
    if (SM.distanceCache[key] === undefined) {
      var pa = a.split("|").map(Number);
      var pb = b.split("|").map(Number);
      SM.distanceCache[key] = Math.sqrt(
        Math.pow(pa[0] - pb[0], 2) + Math.pow(pa[1] - pb[1], 2),
      );
    }
    return SM.distanceCache[key];
  }

  function getServerNow() {
    var time = jQuery("#serverTime").text().trim();
    var date = jQuery("#serverDate").text().trim();
    var parts = date.split("/");
    return new Date(parts[2] + "-" + parts[1] + "-" + parts[0] + "T" + time);
  }

  // ── Correção: virada de ano ──────────────────────────
  function parseArrivalDate(text) {
    text = text.trim();
    var now = getServerNow();
    var currentYear = now.getFullYear();
    var isTomorrow = /amanh[aã]|tomorrow/i.test(text);

    var full = text.match(
      /(\d{1,2})\.(\d{1,2})\.\s+(?:às\s+)?(\d{2}):(\d{2}):(\d{2})/,
    );
    if (full) {
      var day = full[1].padStart(2, "0");
      var month = full[2].padStart(2, "0");
      var dt = new Date(
        currentYear +
          "-" +
          month +
          "-" +
          day +
          "T" +
          full[3] +
          ":" +
          full[4] +
          ":" +
          full[5],
      );
      // Se a data parseada já passou, assume próximo ano
      if (dt < now) dt.setFullYear(dt.getFullYear() + 1);
      return dt;
    }

    var onlyTime = text.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (onlyTime) {
      var dt2 = new Date(now);
      dt2.setHours(+onlyTime[1], +onlyTime[2], +onlyTime[3], 0);
      if (isTomorrow) dt2.setDate(dt2.getDate() + 1);
      // Se ficou no passado (ex.: 23:59 vs now=00:01), avança um dia
      if (dt2 < now && !isTomorrow) dt2.setDate(dt2.getDate() + 1);
      return dt2;
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════
  //  VELOCIDADE
  // ═══════════════════════════════════════════════════════
  async function loadUnitSpeeds() {
    // Guard: SDK pode não ter o método se carregado de versão antiga
    if (
      typeof twSDK !== "undefined" &&
      typeof twSDK.getWorldUnitInfo === "function"
    ) {
      try {
        var unitInfo = await twSDK.getWorldUnitInfo();
        var units =
          unitInfo && unitInfo.config ? Object.entries(unitInfo.config) : [];
        units.forEach(function (entry) {
          var id = entry[0],
            cfg = entry[1];
          if (cfg && cfg.speed) SM.unitSpeeds[id] = parseFloat(cfg.speed);
        });
      } catch (e) {
        console.warn(
          "[SupportMap] getWorldUnitInfo falhou, usando fallback:",
          e,
        );
      }
    } else {
      console.warn(
        "[SupportMap] twSDK.getWorldUnitInfo indisponível — usando fallback de velocidades.",
      );
    }

    // Preenche qualquer unidade ausente com fallback hardcoded
    Object.keys(FALLBACK_SPEED).forEach(function (unit) {
      if (!SM.unitSpeeds[unit]) SM.unitSpeeds[unit] = FALLBACK_SPEED[unit];
    });
  }

  function defenseSpeed() {
    return Math.max.apply(
      null,
      DEFENSE_UNITS.map(function (u) {
        return SM.unitSpeeds[u] || FALLBACK_SPEED[u] || 22;
      }),
    );
  }

  function tripMs(distance) {
    var speedFactor =
      (parseFloat(game_data.speed) || 1) *
      (parseFloat(game_data.unit_speed) || 1);
    var minutesPerField = defenseSpeed() / speedFactor;
    return distance * minutesPerField * 60 * 1000;
  }

  function roundTripMs(distance) {
    return tripMs(distance) * 2;
  }

  // ═══════════════════════════════════════════════════════
  //  VILAS DO JOGADOR
  //  Correção: tenta game_data.villages primeiro (sem requisição de rede)
  //  Correção: decodeURIComponent com try/catch para encoding ISO
  // ═══════════════════════════════════════════════════════
  async function fetchMyVillages() {
    var playerId = parseInt(game_data.player.id, 10);

    // Tentativa 1: objeto em memória (disponível em algumas telas)
    if (game_data.villages && Object.keys(game_data.villages).length > 0) {
      return Object.values(game_data.villages).map(function (v) {
        return {
          id: parseInt(v.id, 10),
          name: v.name || "Vila " + v.id,
          x: parseInt(v.x, 10),
          y: parseInt(v.y, 10),
          coord: v.x + "|" + v.y,
        };
      });
    }

    // Tentativa 2: village.txt (pesado, mas completo)
    var villages = [];
    try {
      var txt = await jQuery.get("/map/village.txt");
      txt
        .trim()
        .split("\n")
        .forEach(function (line) {
          var parts = line.split(",");
          if (parts.length >= 5 && parseInt(parts[4], 10) === playerId) {
            var name;
            try {
              name = decodeURIComponent(parts[1].replace(/\+/g, " "));
            } catch (e) {
              name = parts[1]; // encoding ISO-8859-1 não tratado — usa raw
            }
            villages.push({
              id: parseInt(parts[0], 10),
              name: name,
              x: parseInt(parts[2], 10),
              y: parseInt(parts[3], 10),
              coord: parts[2] + "|" + parts[3],
            });
          }
        });
    } catch (e) {
      // Fallback final: apenas a vila atual
      villages.push({
        id: parseInt(game_data.village.id, 10),
        name: game_data.village.name,
        x: parseInt(game_data.village.x, 10),
        y: parseInt(game_data.village.y, 10),
        coord: game_data.village.x + "|" + game_data.village.y,
      });
    }
    return villages;
  }

  // ═══════════════════════════════════════════════════════
  //  ATAQUES RECEBIDOS
  // ═══════════════════════════════════════════════════════
  function parseIncomingsPage(doc, myCoordSet) {
    var attacks = [];

    jQuery("#incomings_table tbody tr", doc).each(function () {
      var rowText = jQuery(this).text();
      if (!/(Ataque|Attack)/i.test(rowText)) return;

      var links = jQuery('a[href*="village="]', this);
      if (!links.length) return;

      var targetText = "",
        targetCoord = null,
        targetVillageId = null;
      var attackerText = "",
        attackerCoord = null;

      links.each(function () {
        var txt = jQuery(this).text().trim();
        var coord = extractCoord(txt);
        if (!coord) return;

        var href = jQuery(this).attr("href") || "";
        var m = href.match(/village=(\d+)/);
        var villageId = m ? parseInt(m[1], 10) : null;

        if (myCoordSet.has(coord)) {
          targetText = txt;
          targetCoord = coord;
          targetVillageId = villageId;
        } else {
          attackerText = txt;
          attackerCoord = coord;
        }
      });

      var arrivalDate = null;
      jQuery("td", this).each(function () {
        if (arrivalDate) return;
        var txt = jQuery(this).text().trim();
        if (/\d{2}:\d{2}:\d{2}/.test(txt)) {
          var parsed = parseArrivalDate(txt);
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

  // Correção: paginação busca <select> E links <a> com page=
  async function fetchAllIncomings(myCoordSet) {
    var attacks = parseIncomingsPage(document, myCoordSet);
    var urls = new Set();

    // Paginação via <select>
    jQuery("#incomings_table")
      .closest(".vis")
      .find("select option")
      .each(function () {
        var value = jQuery(this).val();
        if (value && !window.location.href.includes(value)) {
          urls.add(value);
        }
      });

    // Paginação via links <a>
    jQuery('a[href*="mode=incomings"][href*="page="]').each(function () {
      var href = jQuery(this).attr("href");
      if (href && !window.location.href.includes(href)) {
        urls.add(href);
      }
    });

    for (var url of urls) {
      try {
        var html = await jQuery.get(url);
        var doc = new DOMParser().parseFromString(html, "text/html");
        attacks = attacks.concat(parseIncomingsPage(doc, myCoordSet));
      } catch (e) {
        console.warn("[SupportMap] Erro ao processar página:", url, e);
      }
    }

    return attacks;
  }

  // ═══════════════════════════════════════════════════════
  //  AMEAÇA
  // ═══════════════════════════════════════════════════════
  function attackerKey(atk) {
    return atk.attackerCoord || atk.attackerText;
  }

  function buildThreatMap(attacks) {
    var map = {};

    attacks.forEach(function (atk) {
      var key = attackerKey(atk);
      if (!map[key]) map[key] = { targets: {} };
      map[key].targets[atk.targetCoord] = true;
    });

    Object.keys(map).forEach(function (key) {
      var count = Object.keys(map[key].targets).length;
      map[key].count = count;

      /*
       * Lógica de ameaça:
       *   1 alvo  → ataque concentrado, possivelmente real        → 🔴 Perigo
       *   2 alvos → atenção moderada                              → 🟡 Atenção
       *   3+ alvos → muitos alvos, provável fake/sondagem         → 🟢 Seguro
       */
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

  // ═══════════════════════════════════════════════════════
  //  LÓGICA DE APOIO
  //  Correção: freeAt só é atualizado quando a vila chega a tempo
  // ═══════════════════════════════════════════════════════
  function buildSupportMap(attacks, villages) {
    if (!attacks.length || !villages.length) return [];

    var threatMap = buildThreatMap(attacks);
    var freeAt = {};
    villages.forEach(function (v) {
      freeAt[v.coord] = new Date(0);
    });

    var sorted = attacks.slice().sort(function (a, b) {
      return a.arrivalDate - b.arrivalDate;
    });
    var result = [];

    sorted.forEach(function (atk) {
      var arrival = atk.arrivalDate;
      var targetCoord = atk.targetCoord;

      var candidates = villages
        .filter(function (v) {
          return v.coord !== targetCoord;
        })
        .map(function (v) {
          return Object.assign({}, v, {
            dist: getDistance(targetCoord, v.coord),
          });
        })
        .sort(function (a, b) {
          return a.dist - b.dist;
        });

      var defender = null,
        defForced = false,
        latestDefSend = null;

      for (var i = 0; i < candidates.length; i++) {
        var v = candidates[i];
        var travel = tripMs(v.dist);
        var latest = arrival.getTime() - travel;
        if (freeAt[v.coord].getTime() <= latest) {
          defender = v;
          latestDefSend = new Date(latest);
          break;
        }
      }

      if (!defender && candidates.length) {
        defender = candidates[0];
        defForced = true;
        latestDefSend = new Date(
          arrival.getTime() - tripMs(candidates[0].dist),
        );
      }

      if (!defender) return;

      var defenderFreeAt = new Date(
        arrival.getTime() + roundTripMs(defender.dist),
      );

      // Correção: só bloqueia freeAt se a defensora chega a tempo
      if (!defForced) {
        freeAt[defender.coord] = defenderFreeAt;
      }

      // ── Apoio ──────────────────────────────────────────
      var supportCandidates = villages
        .filter(function (v) {
          return v.coord !== targetCoord && v.coord !== defender.coord;
        })
        .map(function (v) {
          return Object.assign({}, v, {
            dist: getDistance(defender.coord, v.coord),
          });
        })
        .sort(function (a, b) {
          return a.dist - b.dist;
        });

      var support = null,
        suppForced = false,
        latestSuppSend = null,
        supportFreeAt = null;

      for (var j = 0; j < supportCandidates.length; j++) {
        var sv = supportCandidates[j];
        var stravel = tripMs(sv.dist);
        var slatest = arrival.getTime() - stravel;
        if (freeAt[sv.coord].getTime() <= slatest) {
          support = sv;
          latestSuppSend = new Date(slatest);
          break;
        }
      }

      if (!support && supportCandidates.length) {
        support = supportCandidates[0];
        suppForced = true;
        latestSuppSend = new Date(
          arrival.getTime() - tripMs(supportCandidates[0].dist),
        );
      }

      if (support) {
        supportFreeAt = new Date(arrival.getTime() + roundTripMs(support.dist));
        // Correção: só bloqueia freeAt se o apoio chega a tempo
        if (!suppForced) {
          freeAt[support.coord] = supportFreeAt;
        }
      }

      result.push({
        atk,
        defender,
        support,
        defForced,
        suppForced,
        defFreeAt: defenderFreeAt,
        suppFreeAt: supportFreeAt,
        latestDefSend,
        latestSuppSend,
        threat: threatMap[attackerKey(atk)],
      });
    });

    return result;
  }

  // ═══════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════
  function lateBadge() {
    return (
      '<span style="display:inline-block;background:#fdecea;color:#922b21;' +
      'border-radius:3px;padding:1px 5px;font-size:11px;margin-left:4px;">' +
      tt("Late") +
      "</span>"
    );
  }

  function renderTable(mapData) {
    if (!mapData.length) return "<p>" + tt("No attacks") + "</p>";

    var base = "https://" + location.host + "/game.php";

    var rows = mapData
      .map(function (e) {
        var atk = e.atk;
        var defender = e.defender;
        var support = e.support;
        var threat = e.threat;

        var placeUrl =
          base +
          "?village=" +
          defender.id +
          "&screen=place&target=" +
          atk.targetVillageId;

        // Coluna defensora
        var defCell =
          "<strong>" +
          defender.name +
          "</strong>" +
          "<br><small>(" +
          defender.coord +
          ")</small>" +
          (e.defForced ? lateBadge() : "") +
          '<br><small style="color:#888;">' +
          tt("SendUntil") +
          ": " +
          fmtDate(e.latestDefSend) +
          "</small>" +
          '<br><a href="' +
          placeUrl +
          '" target="_blank" class="btn-confirm-yes"' +
          ' style="margin-top:4px;display:inline-block;">' +
          tt("SendSupport") +
          "</a>";

        // Coluna apoio
        var suppCell;
        if (support) {
          suppCell =
            "<strong>" +
            support.name +
            "</strong>" +
            "<br><small>(" +
            support.coord +
            ")</small>" +
            (e.suppForced ? lateBadge() : "") +
            '<br><small style="color:#888;">' +
            tt("SendUntil") +
            ": " +
            fmtDate(e.latestSuppSend) +
            "</small>";
        } else {
          suppCell = "—";
        }

        return (
          "<tr>" +
          '<td class="ra-tal">' +
          "<strong>" +
          atk.targetText +
          "</strong>" +
          "<br><small>" +
          fmtDate(atk.arrivalDate) +
          "</small>" +
          '<br><div style="background:' +
          threat.bg +
          ";border-left:4px solid " +
          threat.border +
          ";padding:4px;margin-top:4px;color:" +
          threat.color +
          ';">' +
          threat.icon +
          " " +
          (atk.attackerText || atk.attackerCoord || "?") +
          "<br><small>" +
          threat.desc +
          " (" +
          threat.count +
          " alvo" +
          (threat.count > 1 ? "s" : "") +
          ")</small></div>" +
          "</td>" +
          '<td class="ra-tal">' +
          defCell +
          "</td>" +
          '<td class="ra-tal">' +
          suppCell +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      '<div class="ra-table-container">' +
      '<table class="ra-table ra-table-v2" width="100%">' +
      "<thead><tr>" +
      "<th>" +
      tt("Target") +
      "</th>" +
      "<th>" +
      tt("Defender") +
      "</th>" +
      "<th>" +
      tt("Support From") +
      "</th>" +
      "</tr></thead>" +
      "<tbody>" +
      rows +
      "</tbody>" +
      "</table></div>"
    );
  }

  function buildCopyText(mapData) {
    var lines = ["=== Mapa de Apoio ===", ""];
    mapData.forEach(function (e) {
      lines.push(
        e.threat.icon +
          " " +
          e.atk.targetText +
          " <- " +
          (e.atk.attackerText || e.atk.attackerCoord),
      );
      lines.push(
        "  DEF: " +
          e.defender.name +
          " (" +
          e.defender.coord +
          ")" +
          (e.defForced ? " [chegará tarde]" : "") +
          " — enviar até " +
          fmtDate(e.latestDefSend),
      );
      if (e.support) {
        lines.push(
          "  SUP: " +
            e.support.name +
            " (" +
            e.support.coord +
            ")" +
            (e.suppForced ? " [chegará tarde]" : "") +
            " — enviar até " +
            fmtDate(e.latestSuppSend),
        );
      }
      lines.push("");
    });
    return lines.join("\n");
  }

  // ═══════════════════════════════════════════════════════
  //  UI
  // ═══════════════════════════════════════════════════════
  function addGlobalStyle() {
    return (
      ".ra-table-container{overflow-y:auto;overflow-x:hidden;max-height:500px;}" +
      ".ra-table th{font-size:13px;}" +
      ".ra-table th,.ra-table td{padding:5px;text-align:center;}" +
      ".ra-table td a{word-break:break-all;}" +
      ".ra-table a:focus{color:blue;}" +
      ".ra-table tr:nth-of-type(2n) td{background-color:#f0e2be;}" +
      ".ra-table tr:nth-of-type(2n+1) td{background-color:#fff5da;}" +
      ".ra-table-v2 th,.ra-table-v2 td{text-align:left;}" +
      ".ra-tal{text-align:left!important;}"
    );
  }

  function renderBoxWidget(body) {
    var id = "supportMap";
    var cls = "sm";
    var sd = scriptConfig.scriptData;
    var gs = addGlobalStyle();

    var html =
      '<div class="' +
      cls +
      ' ra-box-widget" id="' +
      id +
      '">' +
      '<div class="' +
      cls +
      '-header"><h3>' +
      tt("Support Map") +
      "</h3></div>" +
      '<div class="' +
      cls +
      '-body">' +
      body +
      "</div>" +
      '<div class="' +
      cls +
      '-footer"><small>' +
      "<strong>" +
      tt("Support Map") +
      " " +
      sd.version +
      "</strong> - " +
      '<a href="' +
      sd.authorUrl +
      '" target="_blank" rel="noreferrer noopener">' +
      sd.author +
      "</a> - " +
      '<a href="' +
      sd.helpLink +
      '" target="_blank" rel="noreferrer noopener">' +
      tt("Help") +
      "</a>" +
      "</small></div></div>" +
      "<style>" +
      "." +
      cls +
      "{position:relative;display:block;width:100%;clear:both;margin:10px 0 15px;border:1px solid #603000;box-sizing:border-box;background:#f4e4bc;}" +
      "." +
      cls +
      " *{box-sizing:border-box;}" +
      "." +
      cls +
      ">div{padding:10px;}" +
      "." +
      cls +
      " .btn-confirm-yes{padding:3px;}" +
      "." +
      cls +
      "-header{display:flex;align-items:center;justify-content:space-between;background-color:#c1a264!important;background-image:url(/graphic/screen/tableheader_bg3.png);background-repeat:repeat-x;}" +
      "." +
      cls +
      "-header h3{margin:0;padding:0;line-height:1;}" +
      "." +
      cls +
      "-body p{font-size:14px;}" +
      "." +
      cls +
      "-body label{display:block;font-weight:600;margin-bottom:6px;}" +
      gs +
      "</style>";

    if (jQuery("#" + id).length < 1) {
      jQuery("#contentContainer").prepend(html);
      jQuery("#mobileContent").prepend(html);
    } else {
      jQuery("." + cls + "-body").html(body);
    }
  }

  function buildUI() {
    var body =
      '<div style="margin-bottom:10px;display:flex;gap:6px;">' +
      '<a href="#" id="sm-btn-gen"  class="btn-confirm-yes" style="flex:1;">' +
      tt("Generate") +
      "</a>" +
      '<a href="#" id="sm-btn-copy" class="btn-confirm-yes" style="display:none;">' +
      tt("Copy All") +
      "</a>" +
      "</div>" +
      '<div id="sm-status" style="margin-bottom:8px;"></div>' +
      '<div id="sm-result"></div>';

    renderBoxWidget(body);

    jQuery("#sm-btn-gen").on("click", async function (e) {
      e.preventDefault();
      jQuery("#sm-status").text(tt("Loading"));
      jQuery("#sm-result").html("");
      jQuery("#sm-btn-copy").hide();

      try {
        SM.myVillages = await fetchMyVillages();
        var myCoordSet = new Set(
          SM.myVillages.map(function (v) {
            return v.coord;
          }),
        );
        var attacks = await fetchAllIncomings(myCoordSet);
        SM.mapData = buildSupportMap(attacks, SM.myVillages);

        jQuery("#sm-result").html(renderTable(SM.mapData));
        jQuery("#sm-status").text(
          tt("Done") + " " + attacks.length + " ataque(s).",
        );
        if (SM.mapData.length) jQuery("#sm-btn-copy").show();
      } catch (err) {
        console.error("[SupportMap]", err);
        jQuery("#sm-status").text("Erro: " + err.message);
      }
    });

    jQuery("#sm-btn-copy").on("click", function (e) {
      e.preventDefault();
      navigator.clipboard
        .writeText(buildCopyText(SM.mapData))
        .then(function () {
          jQuery("#sm-status").text(tt("Copied"));
        });
    });
  }

  // ═══════════════════════════════════════════════════════
  //  ENTRY POINT
  // ═══════════════════════════════════════════════════════
  (async function main() {
    await loadUnitSpeeds();
    buildUI();
  })();
})();
