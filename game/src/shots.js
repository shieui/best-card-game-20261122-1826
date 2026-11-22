// Emberfall — screenshot scenes. `?shot=title|play|win|loss&seed=N` stages
// one deterministic scene of the game itself, using the same state,
// cards and renderer as live play, so a screenshot is a real render
// of the game's own code — never a mock-up.

import { CARD_BY_ID } from './cards.js';
import { playCard, endTurn, pushLog } from './state.js';
import { rivalNextMove } from './ai.js';
import { render, showScreen, showEnd } from './render.js';

// Play the first affordable card in the player's hand, then a second
// card of the same wind when one is affordable — a Wind Surge on camera.
function playOpeningPair(duel) {
  const hand = duel.player.deck.hand;
  const first = hand.find((id) => CARD_BY_ID[id].cost <= duel.mana);
  if (!first) return;
  playCard(duel, 'player', first);
  const wind = CARD_BY_ID[first].wind;
  const second = duel.player.deck.hand.find(
    (id) => CARD_BY_ID[id].wind === wind && CARD_BY_ID[id].cost <= duel.mana,
  ) ?? duel.player.deck.hand.find((id) => CARD_BY_ID[id].cost <= duel.mana);
  if (second) playCard(duel, 'player', second);
}

function runRivalTurnInstantly(duel) {
  let guard = 0;
  while (!duel.winner && guard < 12) {
    guard += 1;
    const move = rivalNextMove(duel);
    if (!move) break;
    playCard(duel, 'rival', move);
  }
}

// A mid-duel table — three of the player's turns in, cards played, a
// surge fired — shared by the play scene and the end scenes, so the
// win/loss screens carry a duel that really happened behind them.
function playMidGame(duel) {
  for (let round = 0; round < 3; round += 1) {
    playOpeningPair(duel);
    if (duel.winner) return;
    if (round === 2) return; // stop on the player's third turn, mid-thought
    endTurn(duel);
    runRivalTurnInstantly(duel);
    if (duel.winner) return;
    endTurn(duel);
  }
}

export function applyShot(kind, seed, driver) {
  document.body.classList.add('shot-mode');
  if (kind === 'title') {
    showScreen('title');
    window.__shotReady = true;
    return;
  }

  const duel = driver.newDuel(seed);

  if (kind === 'win' || kind === 'loss') {
    playMidGame(duel);
    if (!duel.winner && kind === 'win') {
      duel.rival.life = 0;
      duel.winner = 'player';
      pushLog(duel, '<b>Victory!</b> Wren the Gale bows out — the court is yours.');
    } else if (!duel.winner) {
      duel.player.life = 0;
      duel.winner = 'rival';
      pushLog(duel, '<b>Defeat.</b> The winds turn against you this time.');
    }
    duel.phase = 'over';
    render(duel, driver.ui);
    showEnd(duel);
    window.__shotReady = true;
    return;
  }

  // 'play': a mid-duel table.
  playMidGame(duel);
  // Highlight one affordable card, as if the player is weighing it.
  const selected = duel.player.deck.hand.findIndex((id) => CARD_BY_ID[id].cost <= duel.mana);
  driver.ui.selected = selected === -1 ? null : selected;
  driver.ui.canAct = true;
  render(duel, driver.ui);
  window.__shotReady = true;
}
