const slot = location.pathname.indexOf('player2') !== -1 ? 'p2' : 'p1';
const slotNumber = slot === 'p1' ? 1 : 2;
const opponentSlot = slot === 'p1' ? 'p2' : 'p1';

const socket = io({ query: { role: slot } });

const title = document.getElementById('title');
const formRoot = document.getElementById('formRoot');
const updateBtn = document.getElementById('updateBtn');
const updateStatus = document.getElementById('updateStatus');

let latestPayload = null;
let renderedGame = null;
let pending = {}; // path -> staged value, not yet sent to the server

function setPendingCount() {
    const count = Object.keys(pending).length;
    updateBtn.disabled = count === 0;
    updateBtn.textContent = count > 0 ? `Update (${count} change${count === 1 ? '' : 's'})` : 'Update';
}

function markDirty(path) {
    formRoot.querySelectorAll(`[data-path="${path}"]`).forEach((el) => {
        const row = el.closest('.field');
        if (row) row.classList.add('dirty');
    });
}

function clearDirty() {
    formRoot.querySelectorAll('.field.dirty').forEach((el) => el.classList.remove('dirty'));
}

// Staged edits aren't sent until "Update" is clicked, so the overlay only ever
// sees one complete, coherent state instead of flickering through each field
// as it's edited.
function stageChange(path, value) {
    pending[path] = value;
    setPendingCount();
    updateStatus.textContent = '';
    markDirty(path);
}

function currentValueFor(path) {
    if (Object.prototype.hasOwnProperty.call(pending, path)) return pending[path];
    return latestPayload ? SchemaUtils.getAtPath(latestPayload.data, path) : undefined;
}

function setBoolToggleState(button, on) {
    button.dataset.on = String(on);
    button.classList.toggle('on', on);
    button.textContent = on ? button.dataset.onLabel || 'Yes' : button.dataset.offLabel || 'No';
}

function setBoolArrayToggleState(button, on) {
    button.dataset.on = String(on);
    button.classList.toggle('on', on);
}

function buildField(path, def, value) {
    const row = document.createElement('label');
    row.className = 'field';

    const span = document.createElement('span');
    span.className = 'field-label';
    span.textContent = SchemaUtils.fieldLabel(path, def);
    row.appendChild(span);

    if (def.type === 'string') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value || '';
        input.dataset.path = path;
        input.addEventListener('change', () => stageChange(path, input.value));
        row.appendChild(input);
    } else if (def.type === 'number') {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.dataset.path = path;
        input.addEventListener('change', () => stageChange(path, Number(input.value)));
        row.appendChild(input);
    } else if (def.type === 'enum' && def.typeahead) {
        const listId = `dl-${path.replace(/\./g, '-')}`;
        const input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('list', listId);
        input.dataset.path = path;
        input.value = value || '';
        if (def.values.indexOf('') !== -1) input.placeholder = '— Select —';
        input.addEventListener('change', () => {
            if (def.values.indexOf(input.value) === -1) {
                input.classList.add('invalid');
                return;
            }
            input.classList.remove('invalid');
            stageChange(path, input.value);
        });
        row.appendChild(input);

        const datalist = document.createElement('datalist');
        datalist.id = listId;
        def.values.forEach((v) => {
            if (v === '') return;
            const opt = document.createElement('option');
            opt.value = v;
            datalist.appendChild(opt);
        });
        row.appendChild(datalist);
    } else if (def.type === 'enum') {
        const select = document.createElement('select');
        select.dataset.path = path;
        def.values.forEach((v) => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v === '' ? '— Select —' : v;
            select.appendChild(opt);
        });
        select.value = value;
        select.addEventListener('change', () => stageChange(path, select.value));
        row.appendChild(select);
    } else if (def.type === 'bool') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'bool-toggle';
        button.dataset.path = path;
        button.dataset.onLabel = def.onLabel || 'Yes';
        button.dataset.offLabel = def.offLabel || 'No';
        setBoolToggleState(button, !!value);
        button.addEventListener('click', () => {
            const next = button.dataset.on !== 'true';
            setBoolToggleState(button, next);
            stageChange(path, next);
        });
        row.appendChild(button);
    } else if (/^bool\[\d+\]$/.test(def.type)) {
        const group = document.createElement('span');
        group.className = 'bool-array';
        (value || []).forEach((v, i) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'bool-toggle bool-array-toggle';
            button.dataset.path = path;
            button.dataset.index = String(i);
            button.textContent = String(i + 1);
            setBoolArrayToggleState(button, !!v);
            button.addEventListener('click', () => {
                const current = (currentValueFor(path) || []).slice();
                const next = button.dataset.on !== 'true';
                current[i] = next;
                setBoolArrayToggleState(button, next);
                stageChange(path, current);
            });
            group.appendChild(button);
        });
        row.appendChild(group);
    }

    return row;
}

function formatReadOnlyValue(def, value) {
    if (def.type === 'bool') return value ? def.onLabel || 'Yes' : def.offLabel || 'No';
    if (/^bool\[\d+\]$/.test(def.type)) return (value || []).map((v) => (v ? '●' : '○')).join(' ');
    return value === '' || value == null ? '—' : String(value);
}

// Plain-text row for the opponent section. Uses data-readonly-path (not data-path) so
// refreshValues() updates its text instead of treating it as an editable control.
function buildReadOnlyField(path, def, value) {
    const row = document.createElement('div');
    row.className = 'field readonly-field';

    const span = document.createElement('span');
    span.className = 'field-label';
    span.textContent = SchemaUtils.fieldLabel(path, def);
    row.appendChild(span);

    const valueEl = document.createElement('span');
    valueEl.className = 'readonly-value';
    valueEl.dataset.readonlyPath = path;
    valueEl.textContent = formatReadOnlyValue(def, value);
    row.appendChild(valueEl);

    return row;
}

// Editable mode only renders fields flagged playerEditable; read-only mode renders every field.
// Either way, groups left with no children are skipped.
function renderFieldTree(container, node, prefix, data, readOnly) {
    Object.keys(node).forEach((key) => {
        const child = node[key];
        const fullPath = `${prefix}.${key}`;
        if (child && typeof child.type === 'string') {
            const value = SchemaUtils.getAtPath(data, fullPath);
            if (readOnly) {
                container.appendChild(buildReadOnlyField(fullPath, child, value));
            } else if (child.playerEditable) {
                container.appendChild(buildField(fullPath, child, value));
            }
        } else {
            const group = document.createElement('fieldset');
            group.className = 'group';
            const legend = document.createElement('legend');
            legend.textContent = SchemaUtils.fieldLabel(fullPath, null);
            group.appendChild(legend);
            renderFieldTree(group, child, fullPath, data, readOnly);
            if (group.children.length > 1) container.appendChild(group);
        }
    });
}

function fullRender(payload) {
    pending = {};
    setPendingCount();
    updateStatus.textContent = '';
    formRoot.innerHTML = '';
    // Shared match fields both players can edit, so a table without an admin can still keep them current.
    const matchSection = buildSection('Match Info', payload.schema.sharedFields, 'shared', payload.data);
    if (matchSection.children.length > 1) formRoot.appendChild(matchSection);
    formRoot.appendChild(buildSection('Your Info', payload.schema.playerFields, `players.${slot}`, payload.data));
    // The opponent's info, read-only, so each player can see the full game position.
    const opponentSection = buildSection('Opponent', payload.schema.playerFields, `players.${opponentSlot}`, payload.data, true);
    opponentSection.classList.add('opponent-section');
    formRoot.appendChild(opponentSection);
}

function buildSection(title, node, prefix, data, readOnly) {
    const section = document.createElement('fieldset');
    section.className = 'section';
    const legend = document.createElement('legend');
    legend.textContent = title;
    section.appendChild(legend);
    renderFieldTree(section, node, prefix, data, readOnly);
    return section;
}

function refreshValues(payload) {
    formRoot.querySelectorAll('[data-readonly-path]').forEach((el) => {
        const path = el.dataset.readonlyPath;
        const def = SchemaUtils.getFieldDef(payload.schema, path);
        if (def) el.textContent = formatReadOnlyValue(def, SchemaUtils.getAtPath(payload.data, path));
    });

    formRoot.querySelectorAll('[data-path]').forEach((el) => {
        if (el === document.activeElement) return;
        const path = el.dataset.path;
        if (Object.prototype.hasOwnProperty.call(pending, path)) return; // don't clobber a staged, unsent edit
        const value = SchemaUtils.getAtPath(payload.data, path);
        if (el.type === 'checkbox') {
            const idx = Number(el.dataset.index);
            el.checked = Array.isArray(value) ? !!value[idx] : false;
        } else if (el.tagName === 'BUTTON' && el.classList.contains('bool-array-toggle')) {
            const idx = Number(el.dataset.index);
            setBoolArrayToggleState(el, Array.isArray(value) ? !!value[idx] : false);
        } else if (el.tagName === 'BUTTON' && el.classList.contains('bool-toggle')) {
            setBoolToggleState(el, !!value);
        } else {
            el.value = value == null ? '' : value;
        }
    });
}

updateBtn.addEventListener('click', () => {
    const changes = Object.keys(pending).map((path) => ({ path, value: pending[path] }));
    if (changes.length === 0) return;
    updateBtn.disabled = true;
    updateStatus.textContent = 'Updating…';
    socket.emit('state:updateBatch', { changes }, (response) => {
        if (response && response.ok) {
            pending = {};
            clearDirty();
            setPendingCount();
            updateStatus.textContent = 'Updated';
            setTimeout(() => {
                if (updateStatus.textContent === 'Updated') updateStatus.textContent = '';
            }, 2000);
        } else {
            updateBtn.disabled = false;
            updateStatus.textContent = (response && response.message) || 'Update failed';
        }
    });
});

socket.on('state:sync', (payload) => {
    latestPayload = payload;
    title.textContent = `${payload.label} — Player ${slotNumber}`;

    if (payload.activeGame !== renderedGame) {
        renderedGame = payload.activeGame;
        fullRender(payload);
    } else {
        refreshValues(payload);
    }
});

socket.on('state:error', (err) => {
    console.error('state:error', err && err.message);
});
