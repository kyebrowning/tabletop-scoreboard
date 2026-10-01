// Faction display names paired with their icon file (games/age-of-sigmar/assets/faction_icons/<icon>.png).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AosFactions = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    { name: 'Beasts of Chaos', icon: 'beasts' },
    { name: 'Blades of Khorne', icon: 'blades' },
    { name: 'Cities of Sigmar', icon: 'cities' },
    { name: 'Daughters of Khaine', icon: 'daughters' },
    { name: 'Disciples of Tzeentch', icon: 'disciples' },
    { name: 'Flesh-Eater Courts', icon: 'flesh-eater' },
    { name: 'Fyreslayers', icon: 'fyreslayers' },
    { name: 'Gloomspite Gitz', icon: 'gloomspite' },
    { name: 'Hedonites of Slaanesh', icon: 'hedonites' },
    { name: 'Helmsmiths of Hashut', icon: 'helmsmiths' },
    { name: 'Idoneth Deepkin', icon: 'idoneth' },
    { name: 'Kharadron Overlords', icon: 'kharadron' },
    { name: 'Lumineth Realm-Lords', icon: 'lumineth' },
    { name: 'Maggotkin of Nurgle', icon: 'maggotkin' },
    { name: 'Nighthaunt', icon: 'nighthaunt' },
    { name: 'Ogor Mawtribes', icon: 'ogor' },
    { name: 'Orruk Warclans', icon: 'orruk' },
    { name: 'Ossiarch Bonereapers', icon: 'ossiarch' },
    { name: 'Seraphon', icon: 'seraphon' },
    { name: 'Skaven', icon: 'skaven' },
    { name: 'Slaves to Darkness', icon: 'slaves' },
    { name: 'Sons of Behemat', icon: 'sons' },
    { name: 'Soulblight Gravelords', icon: 'soulblight' },
    { name: 'Stormcast Eternals', icon: 'stormcast' },
    { name: 'Sylvaneth', icon: 'sylvaneth' },
  ];
}));
