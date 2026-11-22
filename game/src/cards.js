// Emberfall — the catalogue of wind-spirits. Every card is an original
// invention of this game: four winds (Flame, Tide, Leaf, Stone), each told
// apart by colour AND by its glyph, never by text alone.
//
// A card: { id, name, wind, cost, damage, shield, heal, draw, glyph, text }
//   damage — dealt to the rival (their shield soaks it first)
//   shield — ward gained by the player of the card
//   heal   — life restored, capped at 30
//   draw   — cards drawn right away
// Wind Surge: the second spirit of the same wind played in one turn
// deals +2 damage. It is the game's combo rule and the reason sequencing
// a hand matters more than dumping it.

export const WINDS = {
  flame: { label: 'Flame', glyph: '▲', colour: '#e4572e' },
  tide: { label: 'Tide', glyph: '≋', colour: '#3fa7d6' },
  leaf: { label: 'Leaf', glyph: '❖', colour: '#5fb878' },
  stone: { label: 'Stone', glyph: '◆', colour: '#d9a441' },
};

export const CARD_LIST = [
  { id: 'ember-imp', name: 'Ember Imp', wind: 'flame', cost: 1, damage: 2, shield: 0, heal: 0, draw: 0, glyph: '▲', text: 'A spark with teeth.' },
  { id: 'cinder-fox', name: 'Cinder Fox', wind: 'flame', cost: 2, damage: 3, shield: 0, heal: 0, draw: 0, glyph: '▲', text: 'It hunts where the fire ran.' },
  { id: 'flamecaller', name: 'Flamecaller', wind: 'flame', cost: 3, damage: 4, shield: 0, heal: 0, draw: 0, glyph: '▲', text: 'Her song is a struck match.' },
  { id: 'phoenix-ash', name: 'Phoenix Ash', wind: 'flame', cost: 5, damage: 7, shield: 0, heal: 0, draw: 0, glyph: '▲', text: 'Burns once, burns bright.' },
  { id: 'tide-sprite', name: 'Tide Sprite', wind: 'tide', cost: 1, damage: 1, shield: 0, heal: 0, draw: 1, glyph: '≋', text: 'Draw a card. The river gives.' },
  { id: 'river-serpent', name: 'River Serpent', wind: 'tide', cost: 2, damage: 3, shield: 0, heal: 0, draw: 0, glyph: '≋', text: 'It coils under the current.' },
  { id: 'deep-current', name: 'Deep Current', wind: 'tide', cost: 3, damage: 2, shield: 0, heal: 0, draw: 1, glyph: '≋', text: 'Draw a card. Pulls you under.' },
  { id: 'storm-herald', name: 'Storm Herald', wind: 'tide', cost: 4, damage: 5, shield: 0, heal: 0, draw: 1, glyph: '≋', text: 'Draw a card. Rain with a grudge.' },
  { id: 'sproutling', name: 'Sproutling', wind: 'leaf', cost: 1, damage: 1, shield: 0, heal: 2, draw: 0, glyph: '❖', text: 'Heal 2. Small, stubborn, alive.' },
  { id: 'thorn-vine', name: 'Thorn Vine', wind: 'leaf', cost: 2, damage: 3, shield: 0, heal: 0, draw: 0, glyph: '❖', text: 'The garden bites back.' },
  { id: 'grove-keeper', name: 'Grove Keeper', wind: 'leaf', cost: 3, damage: 2, shield: 0, heal: 4, draw: 0, glyph: '❖', text: 'Heal 4. Old roots, soft hands.' },
  { id: 'ancient-oak', name: 'Ancient Oak', wind: 'leaf', cost: 4, damage: 3, shield: 0, heal: 6, draw: 0, glyph: '❖', text: 'Heal 6. It has outlived storms.' },
  { id: 'pebble-guard', name: 'Pebble Guard', wind: 'stone', cost: 1, damage: 0, shield: 3, draw: 0, heal: 0, glyph: '◆', text: 'Gain 3 ward. Small stone, firm stand.' },
  { id: 'stone-warden', name: 'Stone Warden', wind: 'stone', cost: 2, damage: 1, shield: 4, draw: 0, heal: 0, glyph: '◆', text: 'Gain 4 ward. The wall walks.' },
  { id: 'granite-golem', name: 'Granite Golem', wind: 'stone', cost: 4, damage: 4, shield: 4, draw: 0, heal: 0, glyph: '◆', text: 'Gain 4 ward. Patience, in bulk.' },
  { id: 'mountains-heart', name: "Mountain's Heart", wind: 'stone', cost: 5, damage: 2, shield: 8, draw: 0, heal: 0, glyph: '◆', text: 'Gain 8 ward. The mountain notices you.' },
];

export const CARD_BY_ID = Object.fromEntries(CARD_LIST.map((card) => [card.id, card]));

// The 30-card duel deck: two copies of every spirit. Both duelists draw
// from an identical list, so no duel is ever decided by the shuffle alone.
export const DECK_LIST = [
  'ember-imp', 'ember-imp',
  'cinder-fox', 'cinder-fox',
  'flamecaller', 'flamecaller',
  'phoenix-ash', 'phoenix-ash',
  'tide-sprite', 'tide-sprite',
  'river-serpent', 'river-serpent',
  'deep-current', 'deep-current',
  'storm-herald', 'storm-herald',
  'sproutling', 'sproutling',
  'thorn-vine', 'thorn-vine',
  'grove-keeper', 'grove-keeper',
  'ancient-oak',
  'pebble-guard', 'pebble-guard',
  'stone-warden', 'stone-warden',
  'granite-golem', 'granite-golem',
  "mountains-heart",
];

export function describeCard(card) {
  const parts = [];
  if (card.damage > 0) parts.push(`Deal ${card.damage}`);
  if (card.shield > 0) parts.push(`Gain ${card.shield} ward`);
  if (card.heal > 0) parts.push(`Heal ${card.heal}`);
  if (card.draw > 0) parts.push(`Draw ${card.draw}`);
  return parts.join(' · ') || 'A quiet spirit.';
}
