const socket = io({ query: { role: 'overlay' } });

const FACTION_ICON = AosFactions.reduce((map, f) => {
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

function renderTactic(el, tactic) {
    const circles = document.createElement('div');
    circles.className = 'circleContainer';
    tactic.progress.forEach((active) => {
        const circle = document.createElement('div');
        circle.className = 'circles';
        if (active) circle.classList.add('active');
        circles.append(circle);
    });

    const name = document.createElement('span');
    name.className = 'tacticName';
    name.textContent = tactic.name;

    el.replaceChildren(circles, name);
    shrinkToFit(name, 14);
}

function renderPlayer(prefix, fallbackName, player) {
    const nameEl = document.getElementById(prefix + 'Name');
    nameEl.textContent = player.name || fallbackName;
    shrinkToFit(nameEl, 42);

    document.getElementById(prefix + 'VP').textContent = player.vp;
    document.getElementById(prefix + 'CP').textContent = player.cp;

    const icon = FACTION_ICON[player.faction];
    const iconEl = document.getElementById(prefix + 'Faction');
    iconEl.replaceChildren();
    if (icon) {
        const img = document.createElement('img');
        img.src = `../assets/faction_icons/${icon}.png`;
        img.alt = player.faction;
        iconEl.append(img);
    }

    renderTactic(document.getElementById(prefix + 'Tactic1'), player.tactic1);
    renderTactic(document.getElementById(prefix + 'Tactic2'), player.tactic2);
}

function render(payload) {
    const { data } = payload;

    document.getElementById('roundCount').textContent = data.shared.round;
    document.getElementById('battlePlanName').textContent = data.shared.battleplan;
    document.getElementById('topOrBottom').className =
        data.shared.topOrBottom === 'Top' ? 'priority-top' : 'priority-bottom';

    renderPlayer('p1', 'Player 1', data.players.p1);
    renderPlayer('p2', 'Player 2', data.players.p2);
}

socket.on('state:sync', render);
