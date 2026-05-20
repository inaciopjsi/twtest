/*
    NAME: Support Map
    DESCRIPTION: Gera mapa de apoio inteligente na tela de ataques recebidos.
                 Lê os ataques da tela overview_villages?mode=incomings,
                 e com base nos tempos de chegada + coordenadas das suas vilas,
                 sugere: qual vila sua deve enviar defesa para qual vila atacada,
                 e de quem ela recebe apoio de volta.
    VERSION: 1.0.0
    AUTHOR: inaciopjsi
    SCREEN: overview_villages&mode=incomings
*/

// ═══════════════════════════════════════════════════════
//  scriptConfig
// ═══════════════════════════════════════════════════════
var scriptConfig = {
    scriptData: {
        name:      'Support Map',
        version:   'v1.0.0',
        author:    'inaciopjsi',
        authorUrl: 'https://github.com/inaciopjsi',
        helpLink:  'https://github.com/inaciopjsi/twtest',
    },
    translations: {
        'en_DK': {
            'Support Map':     'Support Map',
            'Help':            'Help',
            'Generate':        'Generate Map',
            'Copy All':        'Copy All',
            'Attacker':        'Attacker',
            'Target':          'Target',
            'Arrives':         'Arrives',
            'Defender':        'Defender',
            'Support From':    'Support From',
            'No attacks':      'No incoming attacks found.',
            'Loading':         'Loading...',
            'Pages':           'pages found',
            'Done':            'Done!',
            'Copied':          'Copied to clipboard!',
        },
        'pt_BR': {
            'Support Map':     'Mapa de Apoio',
            'Help':            'Ajuda',
            'Generate':        '🗺 Gerar Mapa',
            'Copy All':        '📋 Copiar Tudo',
            'Attacker':        'Atacante',
            'Target':          'Alvo (sua vila)',
            'Arrives':         'Chegada',
            'Defender':        'Defende',
            'Support From':    'Apoio de',
            'No attacks':      'Nenhum ataque recebido encontrado.',
            'Loading':         'Carregando...',
            'Pages':           'páginas encontradas',
            'Done':            'Concluído!',
            'Copied':          'Copiado!',
        },
    },
    allowedMarkets: ['br'],
    allowedScreens: ['overview_villages'],
    allowedModes:   ['incomings'],
    isDebug:        false,
    enableCountApi: false,
};

// ═══════════════════════════════════════════════════════
//  twSDK — versão embutida (mesma base do barbarian_farmer)
// ═══════════════════════════════════════════════════════
window.twSDK = window.twSDK || {};
Object.assign(window.twSDK, {
    scriptData:           {},
    translations:         {},
    allowedMarkets:       [],
    allowedScreens:       [],
    allowedModes:         [],
    enableCountApi:       false,
    isDebug:              false,
    isMobile:             jQuery('#mobileHeader').length > 0,
    delayBetweenRequests: 200,
    market:               game_data.market,
    units:                game_data.units,
    village:              game_data.village,
    coordsRegex:          /\d{1,3}\|\d{1,3}/g,

    tt: function (str) {
        const loc = this.translations[game_data.locale];
        if (loc && loc[str] !== undefined) return loc[str];
        const en = this.translations['en_DK'];
        return (en && en[str] !== undefined) ? en[str] : str;
    },

    calculateDistance: function (from, to) {
        const [x1, y1] = from.split('|').map(Number);
        const [x2, y2] = to.split('|').map(Number);
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    },

    zeroPad: function (num, count) {
        let s = String(num);
        while (s.length < count) s = '0' + s;
        return s;
    },

    getParameterByName: function (name, url = window.location.href) {
        return new URL(url).searchParams.get(name);
    },

    secondsToHms: function (ts) {
        const h = Math.floor(ts / 3600);
        const m = Math.floor((ts % 3600) / 60);
        const s = ts % 60;
        return `${this.zeroPad(h,2)}:${this.zeroPad(m,2)}:${this.zeroPad(s,2)}`;
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
                        <a href="${this.scriptData.helpLink}" target="_blank" rel="noreferrer noopener">${this.tt('Help')}</a>
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
                ${customStyle || ''}
            </style>`;

        if (jQuery(`#${id}`).length < 1) {
            jQuery('#contentContainer').prepend(html);
            jQuery('#mobileContent').prepend(html);
        } else {
            jQuery(`.${cls}-body`).html(body);
        }
    },

    init: async function (cfg) {
        Object.assign(this, {
            scriptData:    cfg.scriptData,
            translations:  cfg.translations,
            allowedMarkets:cfg.allowedMarkets,
            allowedScreens:cfg.allowedScreens,
            allowedModes:  cfg.allowedModes,
            enableCountApi:cfg.enableCountApi,
            isDebug:       cfg.isDebug,
        });
        if (cfg.isDebug) console.debug(`[${cfg.scriptData.name}] init OK`);
    },
});

// ═══════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ═══════════════════════════════════════════════════════
let smAttacks   = [];   // todos os ataques parseados
let smMyVillages= [];   // suas vilas com coords

// ═══════════════════════════════════════════════════════
//  HELPERS DE TEMPO
// ═══════════════════════════════════════════════════════

/** Retorna o horário do servidor como Date */
function getServerNow() {
    const timeText = jQuery('#serverTime').text().trim();  // "HH:MM:SS"
    const dateText = jQuery('#serverDate').text().trim();  // "DD/MM/YYYY"
    const [d, m, y] = dateText.split('/');
    return new Date(`${y}-${m}-${d}T${timeText}`);
}

/**
 * Converte a string de chegada da tabela em um objeto Date.
 * Formatos observados:
 *   "em 21.05. às 08:13:57"  (mesmo dia)
 *   "amanhã às 08:13:57"
 *   Ou o campo pode já estar no formato "DD.MM. às HH:MM:SS"
 */
function parseArrivalDate(text) {
    text = text.trim();
    const serverNow = getServerNow();
    const year = serverNow.getFullYear();

    // Tenta: "em DD.MM. às HH:MM:SS" ou "DD.MM. às HH:MM:SS"
    const mFull = text.match(/(\d{1,2})\.(\d{1,2})\.\s+(?:às\s+)?(\d{2}):(\d{2}):(\d{2})/);
    if (mFull) {
        const [, dd, mm, hh, mi, ss] = mFull;
        return new Date(`${year}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${hh}:${mi}:${ss}`);
    }

    // Tenta: "hoje às HH:MM:SS" / "today at HH:MM:SS"
    const mToday = text.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (mToday) {
        const [, hh, mi, ss] = mToday;
        const d = new Date(serverNow);
        d.setHours(Number(hh), Number(mi), Number(ss), 0);
        return d;
    }

    return null;
}

/**
 * Extrai coord "XXX|YYY" de uma string
 */
function extractCoord(text) {
    const m = text.match(/\((\d{1,3})\|(\d{1,3})\)/);
    if (m) return `${m[1]}|${m[2]}`;
    const m2 = text.match(/(\d{1,3})\|(\d{1,3})/);
    return m2 ? `${m2[1]}|${m2[2]}` : null;
}

// ═══════════════════════════════════════════════════════
//  PARSEAR UMA PÁGINA DE INCOMINGS
// ═══════════════════════════════════════════════════════
function parseIncomingsPage(doc) {
    const rows = [];
    jQuery('#incomings_table tbody tr', doc).each(function () {
        const cells = jQuery('td', this);
        if (cells.length < 5) return;

        // Coluna 0: ícone + tipo (Ataque, Apoio…)
        const typeCell = cells.eq(0).text().trim();
        const isAttack = /ataque|attack/i.test(typeCell);
        if (!isAttack) return; // ignora apoios

        // Coluna 1: vila atacante (inimigo) — ex: "Rolo Compressor !!! (594|215) K25"
        // A estrutura real: célula com link da vila
        // Coluna 2: vila alvo (sua vila)
        // Algumas versões têm cols diferentes — vamos pegar pelos links
        const links = jQuery('a', this);

        // Monta texto de cada célula para extração
        const cellTexts = [];
        cells.each(function () { cellTexts.push(jQuery(this).text().trim()); });

        // Tentamos extrair: alvo = sua vila, atacante = origem
        // Na tela de incomings a estrutura é:
        // [checkbox][tipo] [ORIGEM (atacante)] [ALVO (sua vila)] [pontos] [chegada] [tempo restante]
        // Às vezes tem colunas extras

        let targetText    = '';
        let attackerText  = '';
        let arrivalText   = '';
        let targetVillageId = null;

        // Pega links: geralmente o 1º link é o atacante, 2º é o alvo (sua vila)
        const linkEls = jQuery('a[href*="village="]', this);
        if (linkEls.length >= 2) {
            // Pode estar invertido — o alvo é a SUA vila (tem village= no href)
            attackerText = linkEls.eq(0).text().trim();
            targetText   = linkEls.eq(1).text().trim();

            // Extrai village id do link do alvo
            const href = linkEls.eq(1).attr('href') || '';
            const vm = href.match(/village=(\d+)/);
            if (vm) targetVillageId = parseInt(vm[1]);
        } else if (linkEls.length === 1) {
            targetText = linkEls.eq(0).text().trim();
            const href = linkEls.eq(0).attr('href') || '';
            const vm = href.match(/village=(\d+)/);
            if (vm) targetVillageId = parseInt(vm[1]);
        }

        // Tempo de chegada — procura célula com padrão de data
        let arrivalDate = null;
        cells.each(function () {
            const t = jQuery(this).text().trim();
            if (!arrivalDate && /\d{2}:\d{2}:\d{2}/.test(t) && /\d{1,2}\.\d{1,2}|hoje|amanhã|today|tomorrow/i.test(t)) {
                arrivalText = t;
                arrivalDate = parseArrivalDate(t);
            }
        });

        // Se não achou data completa, tenta só horário
        if (!arrivalDate) {
            cells.each(function () {
                const t = jQuery(this).text().trim();
                if (!arrivalDate && /^\d{2}:\d{2}:\d{2}$/.test(t)) {
                    arrivalText = t;
                    arrivalDate = parseArrivalDate(t);
                }
            });
        }

        const targetCoord   = extractCoord(targetText);
        const attackerCoord = extractCoord(attackerText);

        if (!targetCoord || !arrivalDate) return;

        rows.push({
            attackerName:    attackerText,
            attackerCoord:   attackerCoord,
            targetName:      targetText,
            targetCoord:     targetCoord,
            targetVillageId: targetVillageId,
            arrivalDate:     arrivalDate,
            arrivalText:     arrivalText,
        });
    });
    return rows;
}

// ═══════════════════════════════════════════════════════
//  COLETAR PÁGINAS DE INCOMINGS
// ═══════════════════════════════════════════════════════
async function fetchAllIncomings() {
    updateStatus(twSDK.tt('Loading'));
    const attacks = [];

    // Página atual (já carregada)
    const currentDoc = document;
    attacks.push(...parseIncomingsPage(currentDoc));

    // Detecta paginação
    const pageLinks = [];
    jQuery('#incomings_table').closest('.vis').find('select option').each(function () {
        const val = jQuery(this).val();
        if (val && val !== window.location.href) pageLinks.push(val);
    });
    // Remove a primeira (já carregada)
    if (pageLinks.length > 0) pageLinks.shift();

    updateStatus(`${pageLinks.length} ${twSDK.tt('Pages')}`);

    for (const url of pageLinks) {
        await sleep(twSDK.delayBetweenRequests + 200);
        try {
            const html = await jQuery.get(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            attacks.push(...parseIncomingsPage(doc));
        } catch (e) {
            console.warn('[SupportMap] Erro ao carregar página:', url, e);
        }
    }

    return attacks;
}

// ═══════════════════════════════════════════════════════
//  COLETAR SUAS VILAS
// ═══════════════════════════════════════════════════════
async function fetchMyVillages() {
    const villages = [];

    try {
        // A tela de overview já tem os dados das suas vilas no DOM global
        // game_data.player.id é seu ID — buscamos na listagem do mundo
        const response = await jQuery.get('/map/village.txt');
        const lines = response.trim().split('\n');
        const playerId = parseInt(game_data.player.id);

        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 5 && parseInt(parts[4]) === playerId) {
                villages.push({
                    id:     parseInt(parts[0]),
                    name:   decodeURIComponent(parts[1].replace(/\+/g, ' ')),
                    x:      parseInt(parts[2]),
                    y:      parseInt(parts[3]),
                    coord:  `${parts[2]}|${parts[3]}`,
                    points: parseInt(parts[5]) || 0,
                });
            }
        });
    } catch (e) {
        console.warn('[SupportMap] Erro ao buscar vilas:', e);
        // Fallback: usa só a vila atual
        villages.push({
            id:    parseInt(game_data.village.id),
            name:  game_data.village.name,
            x:     parseInt(game_data.village.x),
            y:     parseInt(game_data.village.y),
            coord: `${game_data.village.x}|${game_data.village.y}`,
            points: 0,
        });
    }

    return villages;
}

// ═══════════════════════════════════════════════════════
//  LÓGICA DO MAPA DE APOIO
//
//  Para cada vila atacada (alvo), encontramos:
//  1. "Defender": qual vila SUA mais próxima (que NÃO seja ela mesma)
//     deve enviar defesa para ela.
//  2. "Apoio de": qual vila SUA mais próxima da DEFENSORA
//     deve apoiar a defensora enquanto ela está fora defendendo.
//
//  Leva em conta ataques espaçados: vilas com ataques próximos no tempo
//  (< TEMPO_BUFFER segundos) recebem o mesmo bloco de defesa.
// ═══════════════════════════════════════════════════════
const TEMPO_BUFFER_SEG = 5 * 60; // 5 min — ataques dentro desse intervalo são "simultâneos"

function buildSupportMap(attacks, myVillages) {
    if (!attacks.length || !myVillages.length) return [];

    const serverNow = getServerNow();

    // Agrupa ataques por vila alvo
    const byTarget = {};
    attacks.forEach(atk => {
        const key = atk.targetCoord;
        if (!byTarget[key]) byTarget[key] = { attacks: [], info: atk };
        byTarget[key].attacks.push(atk);
    });

    // Ordena ataques por tempo de chegada dentro de cada grupo
    Object.values(byTarget).forEach(g => {
        g.attacks.sort((a, b) => a.arrivalDate - b.arrivalDate);
    });

    // Monta mapa de coordenada → objeto de vila
    const villageByCoord = {};
    myVillages.forEach(v => { villageByCoord[v.coord] = v; });

    const result = [];

    // Para cada vila atacada
    const targetCoords = Object.keys(byTarget);
    targetCoords.forEach(targetCoord => {
        const group = byTarget[targetCoord];
        const targetVillage = villageByCoord[targetCoord];

        // Vilas minhas ordenadas por distância ao alvo
        const sorted = myVillages
            .map(v => ({
                ...v,
                dist: twSDK.calculateDistance(targetCoord, v.coord),
            }))
            .sort((a, b) => a.dist - b.dist);

        // Defensora principal = minha vila mais próxima que NÃO seja o próprio alvo
        const defender = sorted.find(v => v.coord !== targetCoord) || sorted[0];

        // Apoio para a defensora = minha vila mais próxima da defensora
        // (exceto a própria alvo e a própria defensora)
        const sortedForDefender = myVillages
            .map(v => ({
                ...v,
                dist: twSDK.calculateDistance(defender.coord, v.coord),
            }))
            .sort((a, b) => a.dist - b.dist)
            .filter(v => v.coord !== defender.coord && v.coord !== targetCoord);

        const supportForDefender = sortedForDefender[0] || null;

        // Ataques agrupados por janela de tempo
        const windows = [];
        let currentWindow = null;
        group.attacks.forEach(atk => {
            if (!currentWindow) {
                currentWindow = { attacks: [atk], firstArrival: atk.arrivalDate };
            } else {
                const diffSec = (atk.arrivalDate - currentWindow.firstArrival) / 1000;
                if (diffSec <= TEMPO_BUFFER_SEG) {
                    currentWindow.attacks.push(atk);
                } else {
                    windows.push(currentWindow);
                    currentWindow = { attacks: [atk], firstArrival: atk.arrivalDate };
                }
            }
        });
        if (currentWindow) windows.push(currentWindow);

        result.push({
            targetCoord,
            targetName:   targetVillage ? targetVillage.name : group.info.targetName,
            targetId:     targetVillage ? targetVillage.id : group.info.targetVillageId,
            defender,
            supportForDefender,
            windows,
            totalAttacks: group.attacks.length,
        });
    });

    // Ordena resultado por chegada do primeiro ataque
    result.sort((a, b) => {
        const aFirst = a.windows[0]?.firstArrival || 0;
        const bFirst = b.windows[0]?.firstArrival || 0;
        return aFirst - bFirst;
    });

    return result;
}

// ═══════════════════════════════════════════════════════
//  RENDERIZA A TABELA
// ═══════════════════════════════════════════════════════
function renderTable(mapData) {
    if (!mapData.length) {
        return `<p style="color:#8a1010; font-weight:bold;">${twSDK.tt('No attacks')}</p>`;
    }

    const base = `https://${window.location.host}/game.php`;

    let rows = '';
    mapData.forEach(entry => {
        const targetUrl    = `${base}?village=${entry.targetId || ''}&screen=overview`;
        const defenderUrl  = `${base}?village=${entry.defender.id}&screen=overview`;
        const supportUrl   = entry.supportForDefender
            ? `${base}?village=${entry.supportForDefender.id}&screen=overview`
            : null;

        // Janelas de ataques
        const windowsHtml = entry.windows.map(w => {
            const t = w.firstArrival;
            const dateStr = t
                ? `${twSDK.zeroPad(t.getDate(),2)}/${twSDK.zeroPad(t.getMonth()+1,2)} ${twSDK.zeroPad(t.getHours(),2)}:${twSDK.zeroPad(t.getMinutes(),2)}:${twSDK.zeroPad(t.getSeconds(),2)}`
                : '?';
            const qtd = w.attacks.length > 1 ? ` <span class="sm-badge">${w.attacks.length} ataques</span>` : '';
            return `<div class="sm-window">🕐 ${dateStr}${qtd}</div>`;
        }).join('');

        const defDist = entry.defender.dist
            ? entry.defender.dist.toFixed(1)
            : twSDK.calculateDistance(entry.targetCoord, entry.defender.coord).toFixed(1);

        const suppDist = entry.supportForDefender
            ? twSDK.calculateDistance(entry.defender.coord, entry.supportForDefender.coord).toFixed(1)
            : '—';

        const sameVillageBadge = entry.defender.coord === entry.targetCoord
            ? '<span class="sm-self-badge">auto-defesa</span>' : '';

        rows += `
        <tr>
            <td class="ra-tal">
                <a href="${targetUrl}" target="_blank">
                    <strong>${entry.targetName}</strong><br>
                    <small style="color:#7a5020;">(${entry.targetCoord})</small>
                </a>
                <div class="sm-atk-count">⚔ ${entry.totalAttacks} ataque(s)</div>
                ${windowsHtml}
            </td>
            <td class="ra-tal">
                <a href="${defenderUrl}" target="_blank">
                    <strong>${entry.defender.name}</strong><br>
                    <small style="color:#7a5020;">(${entry.defender.coord})</small>
                </a>
                ${sameVillageBadge}
                <div class="sm-dist">📏 ${defDist} campos</div>
            </td>
            <td class="ra-tal">
                ${entry.supportForDefender
                    ? `<a href="${supportUrl}" target="_blank">
                        <strong>${entry.supportForDefender.name}</strong><br>
                        <small style="color:#7a5020;">(${entry.supportForDefender.coord})</small>
                       </a>
                       <div class="sm-dist">📏 ${suppDist} campos</div>`
                    : '<em style="color:#999">—</em>'
                }
            </td>
        </tr>`;
    });

    return `
        <div class="ra-table-container">
            <table class="ra-table ra-table-v2 sm-table" width="100%" cellspacing="1" cellpadding="3">
                <thead>
                    <tr>
                        <th class="ra-tal">${twSDK.tt('Target')}</th>
                        <th class="ra-tal">${twSDK.tt('Defender')}</th>
                        <th class="ra-tal">${twSDK.tt('Support From')}</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

// ═══════════════════════════════════════════════════════
//  GERA TEXTO PARA COPIAR (formato wiki/forum TW)
// ═══════════════════════════════════════════════════════
function buildCopyText(mapData) {
    const base = `https://${window.location.host}/game.php`;
    const lines = ['=== Mapa de Apoio ===', ''];

    mapData.forEach(entry => {
        const targetUrl   = `${base}?village=${entry.targetId || ''}&screen=overview`;
        const defenderUrl = `${base}?village=${entry.defender.id}&screen=overview`;

        const firstArrival = entry.windows[0]?.firstArrival;
        const arrStr = firstArrival
            ? `${twSDK.zeroPad(firstArrival.getDate(),2)}/${twSDK.zeroPad(firstArrival.getMonth()+1,2)} ${twSDK.zeroPad(firstArrival.getHours(),2)}:${twSDK.zeroPad(firstArrival.getMinutes(),2)}:${twSDK.zeroPad(firstArrival.getSeconds(),2)}`
            : '?';

        lines.push(`[${entry.targetName} (${entry.targetCoord})](${targetUrl}) ← recebe ataque(s) às ${arrStr}`);
        lines.push(`  ↳ [${entry.defender.name} (${entry.defender.coord})](${defenderUrl}) DEFENDE`);

        if (entry.supportForDefender) {
            const suppUrl = `${base}?village=${entry.supportForDefender.id}&screen=overview`;
            lines.push(`  ↳ [${entry.supportForDefender.name} (${entry.supportForDefender.coord})](${suppUrl}) apoia ${entry.defender.name}`);
        }
        lines.push('');
    });

    return lines.join('\n');
}

// ═══════════════════════════════════════════════════════
//  UTILITÁRIOS DE UI
// ═══════════════════════════════════════════════════════
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function updateStatus(msg) {
    jQuery('#sm-status').text(msg);
}

// ═══════════════════════════════════════════════════════
//  INTERFACE
// ═══════════════════════════════════════════════════════
function buildUI() {
    const customStyle = `
        .sm-controls { display:flex; gap:6px; margin-bottom:10px; }
        .sm-controls .btn-confirm-yes { flex:1; text-align:center; padding:5px 0; font-weight:bold; }
        .sm-status { font-size:12px; color:#7a5020; margin-bottom:8px; min-height:16px; }
        .sm-table td { vertical-align:top !important; }
        .sm-window { font-size:11px; color:#305070; background:#e8f0ff; border-left:2px solid #5080aa;
                     padding:2px 5px; margin-top:3px; border-radius:2px; }
        .sm-badge { background:#cc3020; color:#fff; font-size:10px; padding:1px 5px;
                    border-radius:8px; margin-left:4px; vertical-align:middle; }
        .sm-atk-count { font-size:11px; color:#8a3010; margin-top:3px; }
        .sm-dist { font-size:11px; color:#7a5020; margin-top:3px; }
        .sm-self-badge { background:#5a9a10; color:#fff; font-size:10px; padding:1px 5px;
                         border-radius:8px; display:inline-block; margin-top:2px; }
        .sm-section-title { font-weight:700; font-size:11px; color:#7a5020; margin-bottom:6px;
                            text-transform:uppercase; letter-spacing:0.5px; }
        .sm-info-box { background:#fff8e8; border:1px solid #bd9c5a; border-radius:4px;
                       padding:8px; font-size:12px; margin-bottom:10px; }
    `;

    const body = `
        <div class="sm-info-box">
            ℹ️ Analisa <strong>todos os ataques recebidos</strong> e sugere qual vila sua deve
            defender cada alvo, e de quem a defensora recebe apoio — considerando
            proximidade e ataques espaçados no tempo.
        </div>

        <div class="sm-controls">
            <a href="#" class="btn-confirm-yes" id="sm-btn-generate">${twSDK.tt('Generate')}</a>
            <a href="#" class="btn-confirm-yes" id="sm-btn-copy" style="display:none;">${twSDK.tt('Copy All')}</a>
        </div>

        <div class="sm-status" id="sm-status"></div>
        <div id="sm-result"></div>
    `;

    twSDK.renderBoxWidget(body, 'supportMap', 'sm', customStyle);

    // ── Gerar Mapa
    jQuery('#sm-btn-generate').on('click', async function (e) {
        e.preventDefault();
        jQuery('#sm-result').html('');
        jQuery('#sm-btn-copy').hide();
        updateStatus(twSDK.tt('Loading'));

        try {
            const [attacks, myVillages] = await Promise.all([
                fetchAllIncomings(),
                fetchMyVillages(),
            ]);

            smAttacks    = attacks;
            smMyVillages = myVillages;

            if (!attacks.length) {
                jQuery('#sm-result').html(`<p>${twSDK.tt('No attacks')}</p>`);
                updateStatus('');
                return;
            }

            const mapData = buildSupportMap(attacks, myVillages);
            jQuery('#sm-result').html(renderTable(mapData));

            // Armazena para o botão copiar
            jQuery('#sm-btn-generate').data('mapData', mapData);
            jQuery('#sm-btn-copy').show();

            updateStatus(`${twSDK.tt('Done')} ${attacks.length} ataque(s) em ${myVillages.length} vila(s) suas.`);
        } catch (err) {
            updateStatus('Erro: ' + err.message);
            console.error('[SupportMap]', err);
        }
    });

    // ── Copiar Tudo
    jQuery('#sm-btn-copy').on('click', function (e) {
        e.preventDefault();
        const mapData = jQuery('#sm-btn-generate').data('mapData');
        if (!mapData) return;
        const text = buildCopyText(mapData);
        navigator.clipboard.writeText(text).then(() => {
            updateStatus(twSDK.tt('Copied'));
            setTimeout(() => updateStatus(''), 2000);
        });
    });
}

// ═══════════════════════════════════════════════════════
//  ENTRY POINT
// ═══════════════════════════════════════════════════════
(async function () {
    await twSDK.init(scriptConfig);

    // Validação de tela
    const screen = twSDK.getParameterByName('screen');
    const mode   = twSDK.getParameterByName('mode');
    if (screen !== 'overview_villages' || mode !== 'incomings') {
        UI.ErrorMessage('Execute este script na tela de Ataques Recebidos (overview_villages&mode=incomings)');
        return;
    }

    buildUI();

    if (scriptConfig.isDebug) {
        console.debug('[SupportMap] Script carregado.');
    }
})();