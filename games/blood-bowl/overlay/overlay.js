const socket = io({ query: { role: 'overlay' } });

const FACTION_ICON = bloodBowlFactions.reduce((map, f) => {
    map[f.name] = f.icon;
    return map;
}, {});

function shrinkToFit(el, startSize) {
    let fontSize = startSize;
    el.style.fontSize = fontSize + 'px';
    let guard = 0;
    while (el.scrollWidth > el.offsetWidth && fontSize > 8 && guard < 100) {
        fontSize *= 0.95;
        el.style.fontSize = fontSize + 'px';
        guard++;
    }
}


function renderPlayer(prefix, fallbackName, player) {
    const nameEl = document.getElementById(prefix + 'Name');
    nameEl.textContent = player.name || fallbackName;
    shrinkToFit(nameEl, 42);

    document.getElementById(prefix + 'VP').textContent = player.touchdowns;
    document.getElementById(prefix + 'CP').textContent = player.rerolls;

    const icon = FACTION_ICON[player.faction];
    const iconEl = document.getElementById(prefix + 'Faction');
    iconEl.replaceChildren();
    if (icon) {
        const glyph = document.createElement('div');
        const url = `url(../assets/faction_icons/${icon}.svg)`;
        glyph.className = 'factionIcon';
        glyph.style.webkitMaskImage = url;
        glyph.style.maskImage = url;
        iconEl.append(glyph);
    }

}

function render(payload) {
    const { data } = payload;

    document.getElementById('roundCount').textContent = data.shared.turn;
    document.getElementById('battlePlanName').textContent = data.shared.weather;
    document.getElementById('topOrBottom').className =
        data.shared.halfValue === 'First' ? 'priority-top' : 'priority-bottom';

    renderPlayer('p1', 'Player 1', data.players.p1);
    renderPlayer('p2', 'Player 2', data.players.p2);
}

socket.on('state:sync', render);
