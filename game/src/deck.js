// Emberfall — a duelist's deck: draw pile, hand, discard pile.
// When the draw pile runs out, the discard pile is shuffled back in,
// so a duel can never stall on an empty deck.

import { shuffleInPlace } from './random.js';
import { DECK_LIST } from './cards.js';

export function buildDeck(rng) {
  const pile = DECK_LIST.slice();
  shuffleInPlace(rng, pile);
  return { drawPile: pile, hand: [], discard: [] };
}

export function drawCards(deck, rng, count) {
  const drawn = [];
  for (let i = 0; i < count; i += 1) {
    if (deck.drawPile.length === 0) {
      if (deck.discard.length === 0) break;
      deck.drawPile = shuffleInPlace(rng, deck.discard.splice(0));
    }
    drawn.push(deck.drawPile.pop());
  }
  deck.hand.push(...drawn);
  return drawn;
}

export function removeFromHand(deck, cardId) {
  const index = deck.hand.indexOf(cardId);
  if (index === -1) return false;
  deck.hand.splice(index, 1);
  deck.discard.push(cardId);
  return true;
}
