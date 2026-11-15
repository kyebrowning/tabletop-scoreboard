// Faction display names paired with their icon file (games/blood-bowl/assets/faction_icons/<icon>.svg).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.bloodBowlFactions = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    { name: 'Amazon', icon: 'amazon' },
    { name: 'Black Orc', icon: 'blackorc' },
    { name: 'Bretonnian', icon: 'bretonnian' },
    { name: 'Chaos Chosen', icon: 'chaoschosen' },
    { name: 'Chaos Dwarf', icon: 'chaosdwarf' },
    { name: 'Chaos Renegade', icon: 'chaosrenegade' },
    { name: 'Dark Elf', icon: 'darkelf' },
    { name: 'Dwarf', icon: 'dwarf' },
    { name: 'Elven Union', icon: 'elvenunion' },
    { name: 'Gnome', icon: 'gnome' },
    { name: 'Goblin', icon: 'goblin' },
    { name: 'Halfling', icon: 'halfling' },
    { name: 'High Elf', icon: 'highelf' },
    { name: 'Human', icon: 'human' },
    { name: 'Imperial Nobility', icon: 'imperialnobility' },
    { name: 'Khorne', icon: 'khorne' },
    { name: 'Lizardmen', icon: 'lizardmen' },
    { name: 'Necromantic Horror', icon: 'necromantichorror' },
    { name: 'Norse', icon: 'norse' },
    { name: 'Nurgle', icon: 'nurgle' },
    { name: 'Ogre', icon: 'ogre' },
    { name: 'Old World Alliance', icon: 'oldworldalliance' },
    { name: 'Orc', icon: 'orc' },
    { name: 'Shambling Undead', icon: 'shamblingundead' },
    { name: 'Skaven', icon: 'skaven' },
    { name: 'Slann', icon: 'slann' },
    { name: 'Snotling', icon: 'snotling' },
    { name: 'Tomb Kings', icon: 'tombkings' },
    { name: 'Underworld Denizens', icon: 'underworlddenizens' },
    { name: 'Vampire', icon: 'vampire' },
    { name: 'Wood Elf', icon: 'woodelf' },
  ];
}));
