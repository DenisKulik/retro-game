export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const characterIndex = Math.floor(Math.random() * allowedTypes.length);
    const level = Math.floor(1 + Math.random() * maxLevel);
    yield new allowedTypes[characterIndex](level);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  const character = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i += 1) {
    team.push(character.next().value);
  }

  return team;
}
