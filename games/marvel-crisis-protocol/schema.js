// Marvel Crisis Protocol tournament match schema.
// Sent to clients as plain JSON (via Socket.IO).

const affiliations = require('./affiliations.js');
const objectives = require('./objectives.js');
const teamTactics = require('./teamTactics.js');

const affiliationValues = [''].concat(affiliations.map((f) => f.name));
const objectiveValues = [''].concat(objectives.map((o) => (o.threat === '' ? o.name : `(${o.threat}) ${o.name}`)));
const teamTacticValues = [''].concat(teamTactics.map((t) => t.name));

const roundValues = [
  'Round 1',
  'Round 2',
  'Round 3',
  'Round 4',
  'Round 5',
  'Round 6',
  'Round 7',
  'Round 8',
  'Round 9',
  'Round 10',
  'Round 11',
  'Round 12',
];

const sharedFields = {
  round: { 
    type: 'enum', 
    label: 'Round', 
    values: roundValues, 
    playerEditable: false, 
    default: 'Round 1' 
  }
};

const objectivesInfo = {
  allObjectives: { type: 'enum', label: 'Objective', values: objectiveValues, playerEditable: true, default: '' },
  selectedThreat: { type: 'bool', label: 'Selected Threat?', playerEditable: true, default: false }
};

const teamTacticFields = {
  name: { type: 'enum', label: 'Team Tactic', values: teamTacticValues, typeahead: true, playerEditable: true, default: '' },
  used: { type: 'bool', label: 'Used', playerEditable: true, default: false }
};

const playerFields = {
  name: { type: 'string', label: 'Player Name', playerEditable: true, default: '' },
  affiliation: { type: 'enum', label: 'Affiliation', values: affiliationValues, typeahead: false, playerEditable: true, default: '' },
  vp: { type: 'number', label: 'Victory Points', playerEditable: true, default: 0 },
  ojbectiveInfo: objectivesInfo,
  teamTactic1: teamTacticFields,
  teamTactic2: teamTacticFields,
  teamTactic3: teamTacticFields,
  teamTactic4: teamTacticFields,
  teamTactic5: teamTacticFields
};

module.exports = {
  id: 'marvel-crisis-protocol',
  label: 'Marvel Crisis Protocol',
  sharedFields,
  playerFields,
};
