// Emberfall — boot. Wires the duel, the renderer, the input and the
// rival together, and stages a screenshot scene when the URL asks for one.

import { makeRng } from './random.js';
import { CARD_BY_ID } from './cards.js';
import { newDuel, playCard, endTurn } from './state.js';
import { playRivalTurn } from './ai.js';
import { render, showScreen, showEnd, flashPlayedCard } from './render.js';
import { bindInput } from './input.js';
import { sounds } from './audio.js';
import { applyShot } from './shots.js';

let duel = null;
const ui = {
  selected: null,
  canAct: true,
  onCardClick(index) { handleCardClick(index); },
};

function seedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed'));
  return Number.isFinite(seed) && seed > 0 ? Math.floor(seed) : (Date.now() % 2147483647);
}

function blurFocusedButton() {
  // A clicked button keeps keyboard focus, and Enter would click it
  // again — re-starting the duel or ending the turn by accident.
  // Drop focus once the click has done its job.
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

function startDuel(seed) {
  blurFocusedButton();
  const rng = makeRng(seed);
  duel = newDuel(rng, seed);
  ui.selected = null;
  ui.canAct = true;
  showScreen('table');
  render(duel, ui);
  return duel;
}

function afterPlay(result, index) {
  if (!result) return;
  flashPlayedCard(index);
  if (result.surge > 0) sounds.surge();
  else sounds.play();
  render(duel, ui);
  if (duel.winner) {
    ui.canAct = false;
    setTimeout(() => {
      if (duel.winner === 'player') sounds.win();
      else sounds.lose();
      showEnd(duel);
    }, 650);
  }
}

function handleCardClick(index) {
  if (!duel || duel.winner || !ui.canAct) return;
  const cardId = duel.player.deck.hand[index];
  if (!cardId) return;
  if (ui.selected === index) {
    confirmSelection();
    return;
  }
  ui.selected = index;
  sounds.select();
  render(duel, ui);
}

function confirmSelection() {
  if (!duel || ui.selected === null || !ui.canAct) return;
  const index = ui.selected;
  const cardId = duel.player.deck.hand[index];
  if (!cardId) return;
  const card = CARD_BY_ID[cardId];
  if (card.cost > duel.mana) {
    ui.selected = null;
    render(duel, ui);
    return;
  }
  ui.selected = null;
  const result = playCard(duel, 'player', cardId);
  afterPlay(result, index);
}

async function handleEndTurn() {
  if (!duel || duel.winner || !ui.canAct) return;
  blurFocusedButton();
  ui.selected = null;
  ui.canAct = false;
  render(duel, ui);
  endTurn(duel);
  render(duel, ui);
  await playRivalTurn(duel, () => render(duel, ui));
  if (duel.winner) {
    render(duel, ui);
    setTimeout(() => {
      sounds.lose();
      showEnd(duel);
    }, 650);
    return;
  }
  endTurn(duel);
  ui.canAct = true;
  render(duel, ui);
}

function restart() {
  startDuel(seedFromUrl());
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(shot, seedFromUrl(), {
    ui,
    newDuel: (seed) => startDuel(seed),
    render: () => render(duel, ui),
  });
} else {
  showScreen('title');
  bindInput({
    onCardClick: handleCardClick,
    onConfirm: confirmSelection,
    onDeselect: () => { ui.selected = null; if (duel) render(duel, ui); },
    onEndTurn: handleEndTurn,
    onStart: () => startDuel(seedFromUrl()),
    onAgain: restart,
  });
  window.__emberfall = { startDuel, get duel() { return duel; } };
}
