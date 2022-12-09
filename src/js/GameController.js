import themes from './themes';
import GamePlay from './GamePlay';
import { createTeamOnBoard } from './Team';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.position = [];
    this.selected = undefined;
  }

  init() {
    this.team = createTeamOnBoard();
    this.gamePlay.drawUi(themes.prairie);
    this.gamePlay.redrawPositions(this.team);
    this.position.push(...this.team);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
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

  onCellClick(cellIndex) {
    const characterInCell = this.position.find(
      (item) => item.position === cellIndex
    );

    if (characterInCell) {
      const { character } = characterInCell;
      if (['bowman', 'swordsman', 'magician'].includes(character.type)) {
        if (this.selected) {
          this.gamePlay.deselectCell(this.selected);
        }

        this.gamePlay.selectCell(cellIndex);
        this.selected = cellIndex;
      } else {
        GamePlay.showError('Please choose your character');
      }
    }
  }
}
