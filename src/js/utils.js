export function calcTileType(index, boardSize) {
  let position;

  if (index < boardSize) position = 'top';
  if (index >= boardSize * (boardSize - 1)) position = 'bottom';

  if (index === 0 || index === boardSize * (boardSize - 1)) {
    position += '-left';
  } else if (index === boardSize - 1 || index === boardSize ** 2 - 1) {
    position += '-right';
  }

  if (!position && index % boardSize === 0) position = 'left';
  if (!position && (index + 1) % boardSize === 0) position = 'right';
  if (!position) position = 'center';

  return position;
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
