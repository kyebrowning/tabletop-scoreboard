// Objective display names paired with their threat value and objective type.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.objectives = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    {name: '---EXTRACTION OBJECTIVES---', threat: '', type: 'extraction'},
    {name: 'Surprise Assault! Mutant Homes Destroyed', threat: 16 , type: 'extraction'},
    {name: 'Alien Ship Crashes in Downtown!', threat: 17, type: 'extraction'},
    {name: 'Scientific Samples Found in Discovered Universe', threat: 17, type: 'extraction'},
    {name: 'Sentinel Schematics Sabotaged', threat: 17, type: 'extraction'},
    {name: 'Spider-Infected Invade Manhattan', threat: 17, type: 'extraction'},
    {name: 'Unexpected Guests Crash Royal Wedding', threat: 17, type: 'extraction'},
    {name: 'Inhumans Deploy Advanced Weaponry', threat: 18, type: 'extraction'},
    {name: 'Salvaged Supplies Fuel Resistance Efforts', threat: 18, type: 'extraction'},
    {name: 'Evidence of Experimental Soldiers Exposed!', threat: 19, type: 'extraction'},
    {name: 'Mutant Extremists Target U.S. Senators!', threat: 19, type: 'extraction'},
    {name: 'Jailbreak Leads to Mass Mutant Escape!', threat: 20, type: 'extraction'},
    {name: 'Skrulls Infiltrate World Leadership', threat: 20, type: 'extraction'},
    {name: '---SECURE OBJECTIVES---', threat: '', type: 'secure'},
    {name: 'Assault Ships Make Sweeping Search!', threat: 16, type: 'secure'},
    {name: 'Deadly Meteors Mutate Civilians', threat: 17, type: 'secure'},
    {name: "Guardians Save Shi'ar Empress in Style", threat: 17, type: 'secure'},
    {name: 'Infinity Formula Goes Missing!', threat: 17, type: 'secure'},
    {name: 'Strike Team Secures Shield Relay!', threat: 17, type: 'secure'},
    {name: 'X-Men Infiltrate Secret Weapon Facility!', threat: 17, type: 'secure'},
    {name: 'Lockdown! Security Systems Stymie Breakout', threat: 18, type: 'secure'},
    {name: 'Mutant Madman Turns City Into Lethal Amusement Park', threat: 18, type: 'secure'},
    {name: 'Power Overload! Factory Goes Up in Flames!', threat: 19, type: 'secure'},
    {name: 'Super-Powered Scoundrels From Sinister Syndicate', threat:20, type: 'secure'},
    {name: 'Survivors Search for Safe Shelters', threat: 20, type: 'secure'},
    {name: 'Wedding Party Targeted in Terrible Attack!', threat: 20, type: 'secure'},
  ];
}));
