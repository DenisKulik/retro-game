import themes from './themes';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import PositionedCharacter from './PositionedCharacter';
import { generatePosition, generateTeam } from './generators';

const playerClass = [Bowman, Swordsman, Magician];
const opponentClass = [Vampire, Undead, Daemon];

const playersTeam = generateTeam(playerClass, 1, 2);
const opponentsTeam = generateTeam(opponentClass, 1, 2);

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    const playersTeamPosition = [
      new PositionedCharacter(
        playersTeam[0],
        generatePosition(playersTeam[0], 8)
      ),
      new PositionedCharacter(
        playersTeam[1],
        generatePosition(playersTeam[1], 8)
      ),
    ];

    const opponentsTeamPosition = [
      new PositionedCharacter(
        opponentsTeam[0],
        generatePosition(opponentsTeam[0], 8)
      ),
      new PositionedCharacter(
        opponentsTeam[1],
        generatePosition(opponentsTeam[1], 8)
      ),
    ];

    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions([
      ...playersTeamPosition,
      ...opponentsTeamPosition,
    ]);
  }

  // onCellClick(index) {}

  // onCellEnter(index) {}

  // onCellLeave(index) {}
}
