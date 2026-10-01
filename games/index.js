// Registry of available game types. Add a new game by creating games/<id>/schema.js
// (+ games/<id>/overlay/) and registering it here - no other files need to change.

const ageOfSigmar = require('./age-of-sigmar/schema.js');
const marvelCrisisProtocol = require('./marvel-crisis-protocol/schema.js');

const games = [ageOfSigmar, marvelCrisisProtocol];

function listGames() {
  return games.map((g) => ({ id: g.id, label: g.label }));
}

function getGame(id) {
  return games.find((g) => g.id === id) || null;
}

function getDefaultGame() {
  return games[0];
}

module.exports = { listGames, getGame, getDefaultGame };
