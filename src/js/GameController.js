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

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.position = [];
  }

  init() {
    const playersTeam = generateTeam(playerClass, 1, 2);
    const opponentsTeam = generateTeam(opponentClass, 1, 2);

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

    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions([
      ...playersTeamPosition,
      ...opponentsTeamPosition,
    ]);
    this.position.push(...playersTeamPosition, ...opponentsTeamPosition);
  }

  showInfo() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  onCellEnter(cellIndex) {
    const characterInCell = this.position.find(
      (item) => item.position === cellIndex
    );

    if (characterInCell) {
      const { character } = characterInCell;
      const message = `${'\u{1F396}'} ${character.level} ${'\u{2694}'} 
      ${character.attack} ${'\u{1F6E1}'} ${character.defence} ${'\u{2764}'} 
      ${character.health}`;

      this.gamePlay.showCellTooltip(message, cellIndex);
    }
  }

  onCellLeave(cellIndex) {
    this.gamePlay.hideCellTooltip(cellIndex);
  }
}
