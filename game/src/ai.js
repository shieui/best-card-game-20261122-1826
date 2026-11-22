// Emberfall — Wren the Gale, the rival. She reads the table the way a
// player would: strike when she can finish the duel, guard when her life
// is thin, and spend her mana on the card that buys the most.
// Her choices are deliberate enough to be read — and countered.

import { CARD_BY_ID } from './cards.js';
import { playCard } from './state.js';

function scoreCard(duel, card) {
  let score = 0;
  const rival = duel.rival;
  const player = duel.player;

  // Damage is worth more when it can finish the player.
  if (card.damage > 0) {
    const surge = duel.playedWinds.includes(card.wind) ? 2 : 0;
    const total = card.damage + surge;
    score += total * 2;
    if (total >= player.life + player.shield) score += 50; // lethal
    if (player.life <= 8) score += 3;
  }
  // Ward and healing matter most when she is hurting.
  if (card.shield > 0) score += card.shield * (rival.life <= 12 ? 2.2 : 0.9);
  if (card.heal > 0) score += card.heal * (rival.life <= 15 ? 2.0 : 0.5);
  // Drawing keeps her options open.
  if (card.draw > 0) score += 2.5;
  // Cheap cards are efficient; she hates wasting mana.
  score -= card.cost * 0.4;
  return score;
}

// One rival move: her best affordable card, or null when she is done.
export function rivalNextMove(duel) {
  const hand = duel.rival.deck.hand;
  let best = null;
  let bestScore = 0.5; // never play a card that buys nothing
  for (const cardId of hand) {
    const card = CARD_BY_ID[cardId];
    if (card.cost > duel.mana) continue;
    const score = scoreCard(duel, card);
    if (score > bestScore) {
      bestScore = score;
      best = cardId;
    }
  }
  return best;
}

// Play out the rival's whole turn, one card at a time, with a pause
// between cards so the player can watch her hand shrink. `onStep` runs
// after every card (the renderer), and the returned promise resolves
// when she ends her turn. In shot mode the pauses are skipped.
export async function playRivalTurn(duel, onStep, instant = false) {
  const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, instant ? 0 : ms); });
  await wait(650);
  for (;;) {
    if (duel.winner) return;
    const move = rivalNextMove(duel);
    if (!move) break;
    playCard(duel, 'rival', move);
    onStep(move);
    await wait(850);
  }
  await wait(500);
}
