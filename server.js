const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const schemaUtils = require('./lib/schemaUtils.js');
const gameRegistry = require('./games/index.js');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const VALID_ROLES = ['admin', 'p1', 'p2', 'overlay'];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/games', express.static(path.join(__dirname, 'games')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));

app.get('/overlay', (req, res) => res.sendFile(path.join(__dirname, 'public', 'overlay.html')));
// Redirect (not sendFile) so the browser's URL matches the file's real static path —
// overlay2.html's relative asset references (overlay2.css, ../affiliations.js, etc.)
// only resolve correctly when loaded from that path.
app.get('/overlay2', (req, res) => res.redirect('/games/marvel-crisis-protocol/overlay/overlay2.html'));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/player1', (req, res) => res.sendFile(path.join(__dirname, 'public', 'player.html')));
app.get('/player2', (req, res) => res.sendFile(path.join(__dirname, 'public', 'player.html')));

app.get('/api/games', (req, res) => res.json(gameRegistry.listGames()));

// --- state load/persist ---

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      if (parsed && parsed.activeGame && gameRegistry.getGame(parsed.activeGame) && parsed.data) {
        return parsed;
      }
    } catch (err) {
      console.error('Failed to read data/state.json, falling back to defaults:', err.message);
    }
  }
  const defaultGame = gameRegistry.getDefaultGame();
  return {
    activeGame: defaultGame.id,
    data: schemaUtils.buildDefaultState(defaultGame),
  };
}

function persistState() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), (err) => {
    if (err) console.error('Failed to persist state:', err.message);
  });
}

let state = loadState();

function currentSchema() {
  return gameRegistry.getGame(state.activeGame);
}

function syncPayload() {
  const schema = currentSchema();
  return {
    activeGame: schema.id,
    label: schema.label,
    schema: { sharedFields: schema.sharedFields, playerFields: schema.playerFields },
    data: state.data,
  };
}

// --- socket handling ---

// Resolves + permission-checks + type-validates a single { path, value } change against
// the currently active schema. Returns { path, value } on success or throws with a message.
function resolveChange(role, fieldPath, value) {
  const schema = currentSchema();
  const fieldDef = typeof fieldPath === 'string' ? schemaUtils.getFieldDef(schema, fieldPath) : null;

  if (!fieldDef) {
    throw new Error(`Unknown field path: ${fieldPath}`);
  }

  const allowed =
    role === 'admin' ||
    ((role === 'p1' || role === 'p2') &&
      schemaUtils.isOwnSlotPath(fieldPath, role) &&
      fieldDef.playerEditable === true);

  if (!allowed) {
    throw new Error(`Not permitted to edit: ${fieldPath}`);
  }

  return { path: fieldPath, value: schemaUtils.validateValue(fieldDef, value) };
}

io.on('connection', (socket) => {
  const role = socket.handshake.query.role;
  if (VALID_ROLES.indexOf(role) === -1) {
    socket.disconnect(true);
    return;
  }
  socket.data.role = role;

  socket.emit('state:sync', syncPayload());

  socket.on('game:select', ({ gameId } = {}) => {
    if (socket.data.role !== 'admin') {
      socket.emit('state:error', { message: 'Only admin can switch games' });
      return;
    }
    const game = gameRegistry.getGame(gameId);
    if (!game) {
      socket.emit('state:error', { message: `Unknown game id: ${gameId}` });
      return;
    }
    state = {
      activeGame: game.id,
      data: schemaUtils.buildDefaultState(game),
    };
    persistState();
    io.emit('state:sync', syncPayload());
  });

  socket.on('state:update', ({ path: fieldPath, value } = {}) => {
    let resolved;
    try {
      resolved = resolveChange(socket.data.role, fieldPath, value);
    } catch (err) {
      socket.emit('state:error', { message: err.message });
      return;
    }
    schemaUtils.setAtPath(state.data, resolved.path, resolved.value);
    persistState();
    io.emit('state:sync', syncPayload());
  });

  // Applies a batch of changes as a single atomic write: either every change is valid and
  // permitted and they're all applied together with one broadcast, or none are applied.
  // This is what lets the admin/player pages stage several edits and push them to the
  // overlay in one clean update instead of the overlay flickering through each field
  // as it's edited.
  socket.on('state:updateBatch', ({ changes } = {}, ack) => {
    const respond = typeof ack === 'function' ? ack : () => {};

    if (!Array.isArray(changes) || changes.length === 0) {
      respond({ ok: false, message: 'No changes provided' });
      return;
    }

    let resolved;
    try {
      resolved = changes.map((change) => resolveChange(socket.data.role, change && change.path, change && change.value));
    } catch (err) {
      respond({ ok: false, message: err.message });
      return;
    }

    resolved.forEach(({ path: fieldPath, value }) => {
      schemaUtils.setAtPath(state.data, fieldPath, value);
    });
    persistState();
    io.emit('state:sync', syncPayload());
    respond({ ok: true });
  });
});

function lanAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}

httpServer.listen(PORT, '0.0.0.0', () => {
  const lan = lanAddress();
  console.log(`Tabletop scoreboard server listening on port ${PORT}`);
  console.log('');
  console.log('  On this machine:');
  console.log(`    Admin panel:   http://localhost:${PORT}/admin`);
  console.log(`    Overlay (OBS): http://localhost:${PORT}/overlay`);
  console.log(`    Player 1/2:    http://localhost:${PORT}/player1  http://localhost:${PORT}/player2`);
  if (lan) {
    console.log('');
    console.log('  From other devices on this network:');
    console.log(`    Admin panel:   http://${lan}:${PORT}/admin`);
    console.log(`    Overlay (OBS): http://${lan}:${PORT}/overlay`);
    console.log(`    Player 1/2:    http://${lan}:${PORT}/player1  http://${lan}:${PORT}/player2`);
  }
});
