// Emberfall — keyboard and mouse. Clicking a card selects it; clicking it
// again (or Enter) plays it. Keys 1–7 select, Enter plays, E ends the
// turn, Esc clears the selection, R restarts from an end screen.

export function bindInput(handlers) {
  const { onCardClick, onEndTurn, onStart, onAgain } = handlers;

  document.getElementById('start-button').addEventListener('click', onStart);
  document.getElementById('again-button').addEventListener('click', onAgain);
  document.getElementById('end-turn-button').addEventListener('click', onEndTurn);

  document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const titleVisible = !document.getElementById('title-screen').classList.contains('hidden');
    const endVisible = !document.getElementById('end-screen').classList.contains('hidden');

    if (titleVisible && (key === 'enter' || key === ' ')) {
      event.preventDefault();
      onStart();
      return;
    }
    if (endVisible && (key === 'r' || key === 'enter')) {
      event.preventDefault();
      onAgain();
      return;
    }
    if (titleVisible || endVisible) return;

    if (key >= '1' && key <= '7') {
      onCardClick(Number(key) - 1);
    } else if (key === 'enter' || key === ' ') {
      event.preventDefault();
      handlers.onConfirm();
    } else if (key === 'e') {
      onEndTurn();
    } else if (key === 'escape') {
      handlers.onDeselect();
    }
  });
}
