# Tabletop Scoreboard

A real-time scoreboard and stream overlay for tabletop tournaments, run on your local network. A single server keeps four pages in sync:

- **Overlay** (`/overlay`): a transparent page for an OBS Browser Source.
- **Admin** (`/admin`): full control over the match and which game type is live.
- **Player 1 / Player 2** (`/player1`, `/player2`): self-report pages players use on their own devices.

Each game type is defined by a schema. The admin and player forms are generated from that schema, so adding fields or new games doesn't require touching the UI code.

## Running locally

Requires Node.js 18+ and npm.

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # same, restarts on file changes
PORT=4000 npm start  # use a different port
```

On startup the server prints the URLs for each page, both for `localhost` and for your LAN address. Other devices (player tablets, a separate OBS machine) need to use the LAN address and be on the same network.

### OBS

Add a **Browser Source** pointing at `http://<server-address>:3000/overlay`, sized `1920x1080`. Leave "Shutdown source when not visible" unchecked. The background is transparent.

### Running a match

1. Open `/admin` and pick the game type. Switching games resets the match.
2. Send `/player1` and `/player2` to the players.
3. Edits are staged locally until you click **Update**, which sends them all at once. If any staged change is invalid, none are applied.
4. The admin can correct any value at any time.

Match state is saved to `data/state.json`, so it survives a server restart.

## Defining a game type

Each game lives in its own folder:

```
games/<game-id>/
  schema.js        # required: fields for the game
  overlay/         # required: overlay.html, overlay.css, overlay.js
  assets/          # optional: images used by the overlay
  <data>.js        # optional: static lookup data (e.g. factions.js)
```

Register it in `games/index.js`:

```js
const myGame = require('./my-game/schema.js');
const games = [ageOfSigmar, myGame];
```

The first game in the list is the default. `games/age-of-sigmar/` is a complete example to copy from.

### `schema.js`

Export an object with these keys (all required):

| Key | Type | Description |
|---|---|---|
| `id` | string | Unique id. Should match the folder name. |
| `label` | string | Display name shown in the admin game picker. |
| `sharedFields` | field tree | Match-level fields such as round or mission. Edited from admin. |
| `playerFields` | field tree | Per-player fields. Each player gets their own copy. |

```js
module.exports = {
  id: 'my-game',
  label: 'My Game',
  sharedFields: { /* ... */ },
  playerFields: { /* ... */ },
};
```

### Field trees

A field tree is a plain object. Each value is either a **field** (an object with a `type` key) or a **group** (a plain object of more fields or groups). Groups can be nested and reused:

```js
const tacticFields = {
  name:     { type: 'enum', values: ['', 'Tactic A', 'Tactic B'], playerEditable: true, default: '' },
  progress: { type: 'bool[3]', playerEditable: true, default: [false, false, false] },
};

const playerFields = {
  name:    { type: 'string', label: 'Player Name', playerEditable: true, default: '' },
  vp:      { type: 'number', label: 'Victory Points', playerEditable: true, default: 0 },
  tactic1: tacticFields,
  tactic2: tacticFields,
};
```

Values are addressed by dot paths, e.g. `shared.round` or `players.p1.tactic1.progress`.

### Field properties

| Property | Required | Description |
|---|---|---|
| `type` | Yes | One of the types below. |
| `default` | Yes | Starting value. Must match the type. |
| `playerEditable` | No | `true` lets a player edit this field on their own page. If left out, only the admin can edit it. Has no effect on shared fields, since players can never edit those or the other player's fields. |
| `values` | Yes for `enum` | Array of allowed strings. Include `''` if the field can be left blank. |
| `label` | No | Form label. Defaults to the key name in title case (`topOrBottom` → "Top Or Bottom"). |
| `typeahead` | No | `enum` only. Renders a searchable text box instead of a dropdown. Useful for long lists. |

### Field types

| Type | Value | Form control |
|---|---|---|
| `string` | text | text input |
| `number` | number | number input |
| `enum` | one of `values` | dropdown (or typeahead) |
| `bool` | `true` / `false` | toggle button |
| `bool[N]` | array of exactly N booleans, e.g. `bool[3]` | row of N toggles |

### Static data files

When a list needs more than a name (an icon, a point value), put it in a separate data file and derive the `enum` values from it. Wrap it so it works in both Node and the browser:

```js
// games/my-game/factions.js
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MyGameFactions = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    { name: 'Faction One', icon: 'one' },
    { name: 'Faction Two', icon: 'two' },
  ];
}));
```

```js
// schema.js
const factions = require('./factions.js');
const factionValues = [''].concat(factions.map((f) => f.name));
```

The overlay can load the same file with a `<script>` tag and look up the extra data by name.

### Overlay

The overlay is the one part that's custom per game. `overlay/overlay.html` is served from `/games/<game-id>/overlay/`, so relative paths like `../assets/...` and `../factions.js` work. Copy `games/age-of-sigmar/overlay/` to start; it shows how to connect to the server and render the live state.

To check that a schema loads without errors:

```bash
node -e "require('./games/index.js')"
```

## Troubleshooting

- **"address already in use"**: port 3000 is taken. Stop the other process or use `PORT=4000 npm start`.
- **Another device can't connect**: make sure it's on the same network and using the LAN address, not `localhost`. On macOS, check that the firewall allows incoming connections to Node.
- **Overlay is blank in OBS**: open the URL in a normal browser tab to confirm it renders, then check the Browser Source size and address.
