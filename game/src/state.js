// Emberfall — the duel itself: whose turn it is, life, ward, mana,
// and what a played card does. The state is plain data; rendering and
// input live in their own files, and the AI reads this same state.

import { CARD_BY_ID } from './cards.js';
import { buildDeck, drawCards, removeFromHand } from './deck.js';

export const MAX_LIFE = 30;
export const MAX_MANA = 10;
export const OPENING_HAND = 4;

export function newDuel(rng, seed) {
  const duel = {
    seed,
    rng,
    turn: 1,
    phase: 'player', // 'player' | 'rival' | 'over'
    player: freshDuelist(rng),
    rival: freshDuelist(rng),
    mana: 1,
    manaMax: 1,
    playedWinds: [], // winds played this turn, for the Wind Surge combo
    log: [],
    lastPlay: null,
    winner: null,
    stats: { turns: 0, cardsPlayed: 0, damageDealt: 0, damageTaken: 0, surges: 0 },
  };
  drawCards(duel.player.deck, rng, OPENING_HAND);
  drawCards(duel.rival.deck, rng, OPENING_HAND);
  pushLog(duel, '<b>The duel begins.</b> Both duelists draw 4 spirits.');
  return duel;
}

function freshDuelist(rng) {
  return { life: MAX_LIFE, shield: 0, deck: buildDeck(rng) };
}

export function pushLog(duel, html) {
  duel.log.push(html);
  if (duel.log.length > 40) duel.log.shift();
}

function otherSide(duel, side) {
  return side === 'player' ? duel.rival : duel.player;
}

function surgeBonus(duel, card) {
  return duel.playedWinds.includes(card.wind) ? 2 : 0;
}

export function canPlay(duel, side, cardId) {
  if (duel.phase !== side || duel.winner) return false;
  const duelist = side === 'player' ? duel.player : duel.rival;
  if (!duelist.deck.hand.includes(cardId)) return false;
  return CARD_BY_ID[cardId].cost <= duel.mana;
}

// Playing a card: pay its mana, resolve its effects, record the combo.
// Returns a description of what happened, or null when the play is illegal.
export function playCard(duel, side, cardId) {
  const card = CARD_BY_ID[cardId];
  if (!card) return null;
  const duelist = side === 'player' ? duel.player : duel.rival;
  const foe = otherSide(duel, side);
  if (duel.phase !== side || duel.winner) return null;
  if (!duelist.deck.hand.includes(cardId)) return null;
  if (side === 'player' && card.cost > duel.mana) return null;
  if (side === 'rival' && card.cost > duel.mana) return null;

  removeFromHand(duelist.deck, cardId);
  duel.mana -= card.cost;
  duel.stats.cardsPlayed += 1;

  const surge = surgeBonus(duel, card);
  duel.playedWinds.push(card.wind);
  if (surge > 0) duel.stats.surges += 1;

  const damage = card.damage + surge;
  const lines = [];
  const who = side === 'player' ? '<b>You</b>' : '<b>Wren</b>';

  if (card.shield > 0) {
    duelist.shield += card.shield;
    lines.push(`gain <span class="shield">+${card.shield} ward</span>`);
  }
  if (card.heal > 0) {
    const healed = Math.min(card.heal, MAX_LIFE - duelist.life);
    duelist.life += healed;
    lines.push(`restore <span class="heal">+${healed} life</span>`);
  }
  if (card.draw > 0) {
    const drawn = drawCards(duelist.deck, duel.rng, card.draw);
    lines.push(`draw ${drawn.length} card${drawn.length === 1 ? '' : 's'}`);
  }
  if (damage > 0) {
    let left = damage;
    if (foe.shield > 0) {
      const soaked = Math.min(foe.shield, left);
      foe.shield -= soaked;
      left -= soaked;
      lines.push(`shatter ${soaked} ward`);
    }
    if (left > 0) {
      foe.life = Math.max(0, foe.life - left);
      lines.push(`deal <span class="dmg">${left} damage</span>`);
      if (side === 'player') duel.stats.damageDealt += left;
      else duel.stats.damageTaken += left;
    }
  }

  const surgeNote = surge > 0 ? ' <span class="dmg">Wind Surge +2!</span>' : '';
  pushLog(duel, `${who} played <b>${card.name}</b>${surgeNote} — ${lines.join(', ') || 'a quiet spirit'}.`);
  duel.lastPlay = { side, card, surge, lines };

  if (foe.life <= 0) {
    duel.winner = side;
    duel.phase = 'over';
    pushLog(duel, side === 'player'
      ? '<b>Victory!</b> Wren the Gale bows out — the court is yours.'
      : '<b>Defeat.</b> The winds turn against you this time.');
  }
  return { card, surge, lines };
}

// Ending a turn hands the table over; the new side gains mana and draws.
export function endTurn(duel) {
  if (duel.winner) return;
  if (duel.phase === 'player') {
    duel.phase = 'rival';
    duel.turn += 1;
    duel.stats.turns = duel.turn;
    duel.manaMax = Math.min(MAX_MANA, duel.turn);
    duel.mana = duel.manaMax;
    duel.playedWinds = [];
    drawCards(duel.rival.deck, duel.rng, 1);
    pushLog(duel, `<b>Turn ${duel.turn}.</b> Wren draws and takes the table.`);
  } else {
    duel.phase = 'player';
    duel.turn += 1;
    duel.stats.turns = duel.turn;
    duel.manaMax = Math.min(MAX_MANA, duel.turn);
    duel.mana = duel.manaMax;
    duel.playedWinds = [];
    drawCards(duel.player.deck, duel.rng, 1);
    pushLog(duel, `<b>Turn ${duel.turn}.</b> Your move — ${duel.mana} mana, a fresh card.`);
  }
}
