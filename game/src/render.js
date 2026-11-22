// Emberfall — everything the player sees: the table, the hands, the log
// and the end screen. Rendering is a full re-draw of the duel's state,
// so any state change is one render() call away from the screen.

import { CARD_BY_ID, WINDS, describeCard } from './cards.js';
import { MAX_LIFE, MAX_MANA } from './state.js';

const $ = (id) => document.getElementById(id);

function cardElement(card, index, { playable, selected, onClick } = {}) {
  const wind = WINDS[card.wind];
  const el = document.createElement('article');
  el.className = `card wind-${card.wind}${playable ? '' : ' unaffordable'}${selected ? ' selected' : ''}`;
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', `${card.name}, ${wind.label}, costs ${card.cost} mana. ${describeCard(card)} ${card.text}`);
  el.innerHTML = `
    <span class="cost" title="Mana cost">${card.cost}</span>
    <div class="wind-band">${wind.glyph} ${wind.label}</div>
    <div class="art" aria-hidden="true">${card.glyph}</div>
    <div class="name">${card.name}</div>
    <div class="power">${describeCard(card)}</div>
    <div class="effect">${card.text}</div>
    <span class="key-hint">${index + 1}</span>`;
  if (onClick) {
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    });
  }
  return el;
}

function cardBackElement() {
  const el = document.createElement('div');
  el.className = 'card-back';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = '✦';
  return el;
}

function lifeFill(fillEl, textEl, life) {
  fillEl.style.width = `${Math.max(0, (life / MAX_LIFE) * 100)}%`;
  textEl.textContent = String(life);
  textEl.classList.toggle('low', life <= 8);
}

function shieldBadge(badgeEl, shield) {
  badgeEl.classList.toggle('hidden', shield <= 0);
  badgeEl.textContent = `◆ ${shield}`;
}

// Draw the whole table from the duel. `ui` carries the transient bits:
// which card is selected, and whether the player may act right now.
export function render(duel, ui) {
  $('rival-life-fill');
  lifeFill($('rival-life-fill'), $('rival-life-text'), duel.rival.life);
  lifeFill($('player-life-fill'), $('player-life-text'), duel.player.life);
  shieldBadge($('rival-shield'), duel.rival.shield);
  shieldBadge($('player-shield'), duel.player.shield);
  $('rival-deck').textContent = `Deck ${duel.rival.deck.drawPile.length}`;
  $('player-deck').textContent = `Deck ${duel.player.deck.drawPile.length}`;
  $('turn-text').textContent = `Turn ${duel.turn}`;
  $('phase-text').textContent = duel.winner
    ? 'Duel over'
    : duel.phase === 'player' ? 'Your move' : 'Wren is thinking…';

  // Mana crystals.
  const crystals = $('mana-crystals');
  crystals.innerHTML = '';
  for (let i = 0; i < MAX_MANA; i += 1) {
    const dot = document.createElement('span');
    dot.className = `mana-dot${i < duel.mana ? ' full' : ''}`;
    dot.style.opacity = i < duel.manaMax ? '1' : '0.25';
    crystals.appendChild(dot);
  }
  $('mana-text').textContent = `${duel.mana} / ${duel.manaMax}`;

  // Rival hand: face-down backs, one per card.
  const rivalHand = $('rival-hand');
  rivalHand.innerHTML = '';
  duel.rival.deck.hand.forEach(() => rivalHand.appendChild(cardBackElement()));

  // Player hand: real cards, clickable on the player's turn.
  const playerHand = $('player-hand');
  playerHand.innerHTML = '';
  duel.player.deck.hand.forEach((cardId, index) => {
    const card = CARD_BY_ID[cardId];
    const playable = ui.canAct && card.cost <= duel.mana;
    playerHand.appendChild(cardElement(card, index, {
      playable,
      selected: ui.selected === index,
      onClick: () => ui.onCardClick(index),
    }));
  });

  // The last play, big in the middle of the table.
  const lastPlay = $('last-play');
  if (duel.lastPlay) {
    const { side, card, surge } = duel.lastPlay;
    const who = side === 'player' ? 'You played' : 'Wren played';
    lastPlay.innerHTML = `${who} <strong>${card.name}</strong> — ${describeCard(card)}${surge > 0 ? ' <span class="surge">Wind Surge +2!</span>' : ''}`;
  } else {
    lastPlay.textContent = 'The table waits for the first spirit…';
  }

  // The duel log, newest at the bottom.
  const log = $('duel-log');
  log.innerHTML = duel.log.map((line) => `<li>${line}</li>`).join('');
  log.scrollTop = log.scrollHeight;

  // End-turn button and the combo hint.
  $('end-turn-button').disabled = !ui.canAct;
  const surgeReady = ui.canAct && duel.playedWinds.length > 0;
  $('combo-note').classList.toggle('hidden', !surgeReady);
  if (surgeReady) {
    const winds = [...new Set(duel.playedWinds)].map((w) => WINDS[w].label).join(', ');
    $('combo-note').textContent = `Wind Surge ready: another ${winds} spirit this turn hits +2.`;
  }

  $('status').textContent = duel.winner
    ? (duel.winner === 'player' ? 'Victory. You won the duel.' : 'Defeat. Wren won the duel.')
    : `Turn ${duel.turn}. Your life ${duel.player.life}, Wren's life ${duel.rival.life}. ${duel.mana} mana.`;
}

export function showScreen(name) {
  $('title-screen').classList.toggle('hidden', name !== 'title');
  $('table').classList.toggle('hidden', name !== 'table');
  $('end-screen').classList.toggle('hidden', name !== 'end');
}

export function showEnd(duel) {
  const won = duel.winner === 'player';
  const screen = $('end-screen');
  screen.classList.toggle('win', won);
  screen.classList.toggle('loss', !won);
  $('end-title').textContent = won ? 'VICTORY' : 'DEFEAT';
  $('end-story').textContent = won
    ? 'The last ember fades from Wren\u2019s hand. She lays her cards down, smiles, and the four winds bow to the Ember Warden.'
    : 'Wren the Gale gathers her spirits and the lanterns dim. The winds keep their secrets — shuffle up and challenge her again.';
  const stats = $('end-stats');
  stats.innerHTML = `
    <div><dt>Turns</dt><dd>${duel.stats.turns}</dd></div>
    <div><dt>Spirits played</dt><dd>${duel.stats.cardsPlayed}</dd></div>
    <div><dt>Damage dealt</dt><dd>${duel.stats.damageDealt}</dd></div>
    <div><dt>Wind Surges</dt><dd>${duel.stats.surges}</dd></div>`;
  showScreen('end');
}

// A short flourish on the card just played, so a play lands with weight.
export function flashPlayedCard(index) {
  const hand = $('player-hand');
  const card = hand.children[index];
  if (card) card.classList.add('played-flash');
}
