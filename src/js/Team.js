import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import PositionedCharacter from './PositionedCharacter';
import { generatePosition, generateTeam } from './generators';

export default class Team {
  constructor(characters) {
    this.characters = characters;
  }
}

export function createTeamOnBoard(level) {
  const playerClass = [Bowman, Swordsman, Magician];
  const opponentClass = [Vampire, Undead, Daemon];

  const playersTeam = generateTeam(playerClass, level, 2);
  const opponentsTeam = generateTeam(opponentClass, level, 2);

  const firstPlayerPosition = generatePosition(playersTeam[0], 8);
  let secondPlayerPosition = generatePosition(playersTeam[1], 8);

  while (firstPlayerPosition === secondPlayerPosition) {
    secondPlayerPosition = generatePosition(playersTeam[0], 8);
  }

  const playersTeamPosition = [
    new PositionedCharacter(playersTeam[0], firstPlayerPosition),
    new PositionedCharacter(playersTeam[1], secondPlayerPosition),
  ];

  const firstOpponentPosition = generatePosition(opponentsTeam[0], 8);
  let secondOpponentPosition = generatePosition(opponentsTeam[1], 8);

  while (firstOpponentPosition === secondOpponentPosition) {
    secondOpponentPosition = generatePosition(opponentsTeam[0], 8);
  }

  const opponentsTeamPosition = [
    new PositionedCharacter(opponentsTeam[0], firstOpponentPosition),
    new PositionedCharacter(opponentsTeam[1], secondOpponentPosition),
  ];

  return [...playersTeamPosition, ...opponentsTeamPosition];
}
