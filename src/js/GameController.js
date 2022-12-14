import themes from './themes';
import cursors from './cursors';
import GamePlay from './GamePlay';
import { createTeamOnBoard } from './Team';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.position = [];
    this.availableMoveCells = undefined;
    this.availableAttackCells = undefined;
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
    const currentCharacter = this.position.find(
      (item) => item.position === cellIndex
    );

    if (currentCharacter) {
      const { character } = currentCharacter;
      const message = `${'\u{1F396}'} ${character.level} ${'\u{2694}'} 
      ${character.attack} ${'\u{1F6E1}'} ${character.defence} ${'\u{2764}'} 
      ${character.health}`;

      if (
        ['bowman', 'swordsman', 'magician'].includes(
          currentCharacter.character.type
        )
      ) {
        this.gamePlay.setCursor(cursors.pointer);
      } else if (
        this.selected &&
        this.availableAttackCells.includes(cellIndex)
      ) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(cellIndex, 'red');
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }

      this.gamePlay.showCellTooltip(message, cellIndex);
    }

    if (
      this.selected &&
      !currentCharacter &&
      this.availableMoveCells.includes(cellIndex)
    ) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(cellIndex, 'green');
    }
  }

  onCellLeave(cellIndex) {
    this.gamePlay.hideCellTooltip(cellIndex);
    this.gamePlay.setCursor(cursors.auto);

    if (this.selected && this.selected.position !== cellIndex) {
      this.gamePlay.deselectCell(cellIndex);
    }
  }

  onCellClick(cellIndex) {
    const currentCharacter = this.position.find(
      (item) => item.position === cellIndex
    );

    if (currentCharacter) {
      const { character } = currentCharacter;
      if (['bowman', 'swordsman', 'magician'].includes(character.type)) {
        if (this.selected) {
          this.gamePlay.deselectCell(this.selected.position);
        }

        this.gamePlay.selectCell(cellIndex);
        this.selected = currentCharacter;
        this.availableMoveCells = this.calcMoveCharacter(
          this.selected.position,
          this.selected.character.moveDistance
        );
        this.availableAttackCells = this.calcAttackCharacter(
          this.selected.position,
          this.selected.character.attackDistance
        );
      } else if (
        this.selected &&
        this.availableAttackCells.includes(cellIndex)
      ) {
        const target = currentCharacter;
        const damage = this.calcDamage(
          this.selected.character,
          target.character
        );
        this.gamePlay.deselectCell(cellIndex);
        this.gamePlay.showDamage(cellIndex, damage).then(() => {
          this.gamePlay.redrawPositions(this.position);
        });
      } else if (!this.selected) {
        GamePlay.showError('Please choose your character');
      }
    } else if (this.selected && this.availableMoveCells.includes(cellIndex)) {
      this.gamePlay.deselectCell(this.selected.position);
      this.gamePlay.deselectCell(cellIndex);
      this.selected.position = cellIndex;
      this.gamePlay.redrawPositions(this.position);
      this.selected = undefined;
    }
  }

  calcMoveCharacter(characterPosition, distance) {
    const { boardSize } = this.gamePlay;
    const colIndex = characterPosition % boardSize;
    const rowIndex = Math.floor(characterPosition / boardSize);
    const availabelCells = [];

    for (let i = 1; i <= distance; i += 1) {
      // move right
      if (colIndex + i < boardSize) {
        availabelCells.push(boardSize * rowIndex + (colIndex + i));
      }
      // move down
      if (rowIndex + i < boardSize) {
        availabelCells.push(boardSize * (rowIndex + i) + colIndex);
      }
      // move down right
      if (rowIndex + i < boardSize && colIndex + i < boardSize) {
        availabelCells.push(boardSize * (rowIndex + i) + (colIndex + i));
      }
      // move left
      if (colIndex - i >= 0) {
        availabelCells.push(boardSize * rowIndex + (colIndex - i));
      }
      // move down left
      if (rowIndex + i < boardSize && colIndex - i >= 0) {
        availabelCells.push(boardSize * (rowIndex + i) + (colIndex - i));
      }
      // move up
      if (rowIndex - i >= 0) {
        availabelCells.push(boardSize * (rowIndex - i) + colIndex);
      }
      // move up left
      if (rowIndex - i >= 0 && colIndex - i >= 0) {
        availabelCells.push(boardSize * (rowIndex - i) + (colIndex - i));
      }
      // move up right
      if (rowIndex - i >= 0 && colIndex + i < boardSize) {
        availabelCells.push(boardSize * (rowIndex - i) + (colIndex + i));
      }
    }

    return availabelCells;
  }

  calcAttackCharacter(characterPosition, distance) {
    const { boardSize } = this.gamePlay;
    const colIndex = characterPosition % boardSize;
    const rowIndex = Math.floor(characterPosition / boardSize);

    let availableCellsUp = rowIndex - distance;
    let availableCellsDown = rowIndex + distance;
    let availableCellsLeft = colIndex - distance;
    let availableCellsRight = colIndex + distance;

    if (availableCellsUp < 0) availableCellsUp = 0;
    if (availableCellsDown > boardSize - 1) availableCellsDown = boardSize - 1;
    if (availableCellsLeft < 0) availableCellsLeft = 0;
    if (availableCellsRight > boardSize - 1) availableCellsRight = boardSize - 1;

    const allAvailableCells = [];
    for (let i = availableCellsUp; i <= availableCellsDown; i += 1) {
      for (let j = availableCellsLeft; j <= availableCellsRight; j += 1) {
        allAvailableCells.push(boardSize * i + j);
      }
    }

    const availableCells = allAvailableCells.filter(
      (i) => i >= 0 && i !== characterPosition && i <= 63
    );
    return availableCells;
  }

  calcDamage(activeChar, target) {
    const damage = Math.floor(
      Math.max(activeChar.attack - target.defence, activeChar.attack * 0.1)
    );
    // eslint-disable-next-line no-param-reassign
    target.health -= damage;

    if (target.health <= 0) {
      // eslint-disable-next-line no-param-reassign
      target.health = 0;
      this.selected = null;
    }

    return damage;
  }
}
