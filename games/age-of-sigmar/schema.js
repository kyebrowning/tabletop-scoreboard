// Age of Sigmar tournament match schema.
// Sent to clients as plain JSON (via Socket.IO).

const AosFactions = require('./factions.js');
const factionValues = [''].concat(AosFactions.map((f) => f.name));

const tacticValues = [
  '',
  'Blazing Onslaught',
  'Siege of Ashes',
  'Flanking Firestorm',
  'Smokescreen',
  'Burning for Vengeance',
  'Legend of the Parch',
];

const battleplanValues = [
  '',
  'Into the Fire',
  'Bloodstained Coasts',
  'Avalanche of Ash',
  'Caverns of Slaughter',
  "What's Yours is Ours",
  'Hidden Under Ash-Clouds',
  'Warped Ruins',
  'Curse of the Gnaw',
  'Seize the Embers',
  'Treacherous Ground',
  'Escape from the Coast',
  'Power of the Realms',
];

const roundValues = [
  'Round 1',
  'Round 2',
  'Round 3',
  'Round 4',
  'Round 5',
];

const tacticFields = {
  name: { type: 'enum', label: 'Tactic Name', values: tacticValues, playerEditable: true, default: '' },
  progress: { type: 'bool[3]', label: 'Tactic Progress', playerEditable: true, default: [false, false, false] },
};

const sharedFields = {
  battleplan: {
    type: 'enum',
    label: 'Battleplan',
    values: battleplanValues,
    playerEditable: false,
    default: '',
  },
  round: { 
    type: 'enum', 
    label: 'Round', 
    values: roundValues, 
    playerEditable: false, 
    default: 'Round 1' 
  },
  topOrBottom: {
    type: 'enum',
    label: 'Top or Bottom of Round',
    values: ['Top', 'Bottom'],
    playerEditable: false,
    default: 'Top',
  },
};

const playerFields = {
  name: { type: 'string', label: 'Player Name', playerEditable: true, default: '' },
  faction: { type: 'enum', label: 'Faction', values: factionValues, typeahead: true, playerEditable: true, default: '' },
  vp: { type: 'number', label: 'Victory Points', playerEditable: true, default: 0 },
  cp: { type: 'number', label: 'Command Points', playerEditable: true, default: 0 },
  tactic1: tacticFields,
  tactic2: tacticFields,
};

module.exports = {
  id: 'age-of-sigmar',
  label: 'Age of Sigmar',
  sharedFields,
  playerFields,
};
