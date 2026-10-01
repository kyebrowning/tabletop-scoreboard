// Faction display names paired with their icon file (games/marvel-crisis-protocol/assets/affiliation_icons/<icon>.png).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.affiliations = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    { name: 'A-Force', icon: 'aforce'},
    { name: 'Asgard', icon: 'asgard'},
    { name: 'Avengers', icon: 'avengers'},
    { name: 'Black Order', icon: 'blackorder'},
    { name: 'Brotherhood', icon: 'brotherhood'},
    { name: 'Cabal', icon: 'cabal'},
    { name: 'Convocation', icon: 'convocation'},
    { name: 'Criminal Syndicate', icon: 'criminalsyndicate'},
    { name: 'Dark Dimension', icon: 'darkdimension'},
    { name: 'Defenders', icon: 'defenders'},
    { name: 'Guardians of the Galaxy', icon: 'guardians'},
    { name: 'Hell Fire Club', icon: 'hellfireclub'},
    { name: 'Hydra', icon: 'hydra'},
    { name: 'Inhumans', icon: 'inhumans'},
    { name: 'Legion of the Lost', icon: 'legionlost'},
    { name: 'Midnight Sons', icon: 'midnightsons'},
    { name: 'Mighty Avengers', icon: 'mightyavengers'},
    { name: 'New Mutants', icon: 'newmutants'},
    { name: "Onslaught's Grip", icon: 'onslaughtsgrip'},
    { name: 'Sentinels', icon: 'sentinels'},
    { name: 'Servants of the Apocalypse', icon: 'servantsapocalypse'},
    { name: 'S.H.I.E.L.D.', icon: 'shield'},
    { name: 'Spider-Foes', icon: 'spiderfoes'},
    { name: 'Thralls of Dracula', icon: 'thrallsdracula'},
    { name: 'Uncanny X-Men', icon: 'xmen'},
    { name: 'Wakanda', icon: 'wakanda'},
    { name: 'Weapon X', icon: 'weaponx'},
    { name: 'Web Warriors', icon: 'webwarriors'},
    { name: 'Winter Guard', icon: 'winterguard'},
    { name: 'X-Force', icon: 'xforce'},
    { name: 'Unaffiliated', icon: 'unaffiliated'}
  ];
}));
