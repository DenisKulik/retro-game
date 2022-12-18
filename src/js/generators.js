export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const characterIndex = Math.floor(Math.random() * allowedTypes.length);
    const level = Math.floor(1 + Math.random() * maxLevel);
    yield new allowedTypes[characterIndex](level);
  }
}

export function generatePosition(character, boardSize) {
  const coordinates = [];

  if (['bowman', 'swordsman', 'magician'].includes(character.type)) {
    for (let i = 0; i < boardSize ** 2; i += 1) {
      // eslint-disable-next-line no-continue
      if (i > 0 && i % boardSize !== 0) continue;

      coordinates.push(i);
      coordinates.push(i + 1);
    }
  }

  if (['vampire', 'undead', 'daemon'].includes(character.type)) {
    for (let i = 1; i < boardSize ** 2; i += 1) {
      // eslint-disable-next-line no-continue
      if (i > 0 && (i + 1) % boardSize !== 0) continue;

      coordinates.push(i);
      coordinates.push(i - 1);
    }
  }

  return coordinates[Math.floor(Math.random() * coordinates.length)];
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  const character = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i += 1) {
    team.push(character.next().value);
  }

  return team;
}
