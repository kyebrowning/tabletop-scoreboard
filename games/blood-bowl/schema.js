// Blood Bowl tournament match schema.
// Sent to clients as plain JSON (via Socket.IO).

const BloodBowlFactions = require('./factions.js');
const factionValues = [''].concat(BloodBowlFactions.map((f) => f.name));

const weatherValues = [
  '',
  'Sweltering Heat',
  'Very Sunny',
  'Perfect Conditions',
  'Pouring Rain',
  'Blizzard'
];

const turnValues = [
  'Turn 1',
  'Turn 2',
  'Turn 3',
  'Turn 4',
  'Turn 5',
  'Turn 6',
  'Turn 7',
  'Turn 8'
];

const sharedFields = {
  weather: {
    type: 'enum',
    label: 'Weather Condition',
    values: weatherValues,
    playerEditable: true,
    default: '',
  },
  turn: { 
    type: 'enum', 
    label: 'Turn', 
    values: turnValues, 
    playerEditable: true, 
    default: 'Turn 1' 
  },
  halfValue: {
    type: 'enum',
    label: 'First or Second Half?',
    values: ['First', 'Second'],
    playerEditable: true,
    default: 'First',
  },
};

const playerFields = {
  name: { type: 'string', label: 'Player Name', playerEditable: true, default: '' },
  faction: { type: 'enum', label: 'Faction', values: factionValues, typeahead: true, playerEditable: true, default: '' },
  rerolls: { type: 'number', label: 'Rerolls', playerEditable: true, default: 0 },
  touchdowns: { type: 'number', label: 'Touchdowns', playerEditable: true, default: 0 },
};

module.exports = {
  id: 'blood-bowl',
  label: 'Blood Bowl',
  sharedFields,
  playerFields,
};
