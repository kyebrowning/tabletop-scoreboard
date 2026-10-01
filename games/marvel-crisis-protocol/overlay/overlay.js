const socket = io({ query: { role: 'overlay' } });

const AFFILIATION_ICON = affiliations.reduce((map, a) => {
    map[a.name] = a.icon;
    return map;
}, {});

// Keyed by the same display string schema.js stores in the enum (e.g. "(17) Alien Ship ...").
const OBJECTIVE = objectives.reduce((map, o) => {
    map[o.threat === '' ? o.name : `(${o.threat}) ${o.name}`] = o;
    return map;
}, {});

const TACTIC_KEYS = ['teamTactic1', 'teamTactic2', 'teamTactic3', 'teamTactic4', 'teamTactic5'];

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

function renderObjective(el, info) {
    el.className = 'objective';
    el.replaceChildren();

    const objective = OBJECTIVE[info.allObjectives];
    if (!objective || objective.threat === '') return;

    el.classList.add(objective.type.trim());

    const threat = document.createElement('div');
    threat.className = 'objectiveThreat';
    threat.textContent = objective.threat;

    const name = document.createElement('div');
    name.className = 'objectiveName';
    name.textContent = objective.name + (info.selectedThreat ? ' *' : '');

    el.append(threat, name);
}

function renderTactics(el, player) {
    el.replaceChildren(
        ...TACTIC_KEYS
            .map((key) => player[key])
            .filter((tactic) => tactic && tactic.name)
            .map((tactic) => {
                const li = document.createElement('li');
                li.textContent = tactic.name;
                if (tactic.used) li.classList.add('used');
                return li;
            })
    );
}

function renderPlayer(prefix, fallbackName, player) {
    const nameEl = document.getElementById(prefix + 'Name');
    nameEl.textContent = player.name || fallbackName;
    shrinkToFit(nameEl, 42);

    document.getElementById(prefix + 'VP').textContent = player.vp;
    document.getElementById(prefix + 'Affiliation').textContent = player.affiliation;

    const icon = AFFILIATION_ICON[player.affiliation];
    const iconEl = document.getElementById(prefix + 'Icon');
    iconEl.replaceChildren();
    if (icon) {
        const img = document.createElement('img');
        img.src = `../assets/affiliation_icons/${icon}.png`;
        img.alt = player.affiliation;
        iconEl.append(img);
    }

    renderTactics(document.getElementById(prefix + 'Tactics'), player);
    renderObjective(document.getElementById(prefix + 'Objective'), player.ojbectiveInfo || {});
}

function render(payload) {
    const { data } = payload;
    renderPlayer('p1', 'Player 1', data.players.p1);
    renderPlayer('p2', 'Player 2', data.players.p2);
}

socket.on('state:sync', render);
