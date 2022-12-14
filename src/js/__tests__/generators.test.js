import { generateTeam, characterGenerator } from '../generators';
import Bowman from '../characters/Bowman';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';

test('should create a new character the 1st level', () => {
  const character = characterGenerator([Bowman], 1);
  expect(character.next().value).toEqual({
    attack: 34,
    defence: 23,
    health: 100,
    level: 1,
    type: 'bowman',
    moveDistance: 2,
    attackDistance: 2,
  });
});

test('should create two characters', () => {
  const characters = generateTeam([Bowman, Magician, Swordsman], 2, 2);
  expect(characters.length).toBe(2);
});
