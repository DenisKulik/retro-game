import themes from './themes';
import cursors from './cursors';
import GamePlay from './GamePlay';
import GameState from './GameState';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import PositionedCharacter from './PositionedCharacter';
import { generatePosition, generateTeam } from './generators';

const themesLevel = {
  1: themes.prairie,
  2: themes.desert,
  3: themes.arctic,
  4: themes.mountain,
};

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.position = [];
    this.availableMoveCells = null;
    this.availableAttackCells = null;
    this.selected = null;
    this.level = 1;
    this.score = 0;
  }

  init() {
    if (this.stateService.load()) {
      this.onLoadGame();
    } else {
      this.team = this.createTeamOnBoard();
      this.gamePlay.drawUi(themesLevel[this.level]);
      this.gamePlay.redrawPositions(this.team);
      this.position.push(...this.team);
    }

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  createTeamOnBoard() {
    this.playerClass = [Bowman, Swordsman, Magician];
    this.opponentClass = [Vampire, Undead, Daemon];

    this.playersTeam = generateTeam(this.playerClass, this.level, 2);
    this.opponentsTeam = generateTeam(this.opponentClass, this.level, 2);

    const firstPlayerPosition = generatePosition(this.playersTeam[0], 8);
    let secondPlayerPosition = generatePosition(this.playersTeam[1], 8);

    while (firstPlayerPosition === secondPlayerPosition) {
      secondPlayerPosition = generatePosition(this.playersTeam[0], 8);
    }

    const playersTeamPosition = [
      new PositionedCharacter(this.playersTeam[0], firstPlayerPosition),
      new PositionedCharacter(this.playersTeam[1], secondPlayerPosition),
    ];

    const firstOpponentPosition = generatePosition(this.opponentsTeam[0], 8);
    let secondOpponentPosition = generatePosition(this.opponentsTeam[1], 8);

    while (firstOpponentPosition === secondOpponentPosition) {
      secondOpponentPosition = generatePosition(this.opponentsTeam[0], 8);
    }

    const opponentsTeamPosition = [
      new PositionedCharacter(this.opponentsTeam[0], firstOpponentPosition),
      new PositionedCharacter(this.opponentsTeam[1], secondOpponentPosition),
    ];

    return [...playersTeamPosition, ...opponentsTeamPosition];
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
          cellIndex,
          this.selected.character,
          target.character
        );
        this.score += damage;
        this.gamePlay.deselectCell(this.selected.position);
        this.gamePlay.deselectCell(cellIndex);
        this.gamePlay.showDamage(cellIndex, damage).then(() => {
          this.checkGameStatus();
          this.gamePlay.redrawPositions(this.position);
        });
        this.selected = null;
        this.timeout = setTimeout(this.actionOpponent.bind(this), 500);
      } else if (!this.selected) {
        GamePlay.showError('Please choose your character');
      }
    } else if (this.selected && this.availableMoveCells.includes(cellIndex)) {
      this.gamePlay.deselectCell(this.selected.position);
      this.gamePlay.deselectCell(cellIndex);
      this.selected.position = cellIndex;
      this.gamePlay.redrawPositions(this.position);
      this.selected = null;
      this.timeout = setTimeout(this.actionOpponent.bind(this), 200);
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

    const occupiedPositions = [];
    for (const char of this.position) {
      occupiedPositions.push(char.position);
    }

    return availabelCells.filter((item) => !occupiedPositions.includes(item));
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

  calcDamage(cellIndex, activeChar, target) {
    const damage = Math.floor(
      Math.max(activeChar.attack - target.defence, activeChar.attack * 0.1)
    );
    // eslint-disable-next-line no-param-reassign
    target.health -= damage;

    if (target.health <= 0) {
      // eslint-disable-next-line no-param-reassign
      target.health = 0;
      this.position = this.position.filter(
        (char) => char.position !== cellIndex
      );
    }

    return damage;
  }

  actionOpponent() {
    this.selected = null;
    // eslint-disable-next-line arrow-body-style
    this.playerTeam = this.position.filter((item) => {
      return ['bowman', 'swordsman', 'magician'].includes(item.character.type);
    });
    // eslint-disable-next-line arrow-body-style
    this.opponentTeam = this.position.filter((item) => {
      return ['vampire', 'undead', 'daemon'].includes(item.character.type);
    });

    const randomIndex = Math.floor(Math.random() * this.opponentTeam.length);
    const randomOpponentChar = this.opponentTeam[randomIndex];

    if (randomOpponentChar) {
      const moveDistOpponent = randomOpponentChar.character.moveDistance;
      const attackDistOpponent = randomOpponentChar.character.attackDistance;
      const opponentPosition = randomOpponentChar.position;

      this.availableMoveCells = this.calcMoveCharacter(
        opponentPosition,
        moveDistOpponent
      );
      this.availableAttackCells = this.calcAttackCharacter(
        opponentPosition,
        attackDistOpponent
      );
    }

    let damageDone = false;

    for (const player of this.playerTeam) {
      if (this.availableAttackCells.includes(player.position)) {
        const damage = this.calcDamage(
          player.position,
          randomOpponentChar.character,
          player.character
        );
        this.gamePlay.showDamage(player.position, damage).then(() => {
          this.checkGameStatus();
          this.gamePlay.redrawPositions(this.position);
        });

        damageDone = true;
        break;
      }
    }

    if (!damageDone && randomOpponentChar) {
      randomOpponentChar.position =
        this.availableMoveCells[
          Math.floor(Math.random() * this.availableMoveCells.length)
        ];
      this.gamePlay.redrawPositions(this.position);
    }
  }

  checkGameStatus() {
    // eslint-disable-next-line arrow-body-style
    this.playerTeam = this.position.filter((item) => {
      return ['bowman', 'swordsman', 'magician'].includes(item.character.type);
    });
    // eslint-disable-next-line arrow-body-style
    this.opponentTeam = this.position.filter((item) => {
      return ['vampire', 'undead', 'daemon'].includes(item.character.type);
    });

    if (this.playerTeam.length === 0) {
      GamePlay.showMessage('Game over');
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
      this.gamePlay.setCursor(cursors.auto);
    }

    if (this.level >= 4 && this.opponentTeam.length === 0) {
      GamePlay.showMessage('Congrats! You`re win!');
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
      this.gamePlay.setCursor(cursors.auto);
    }

    if (this.opponentTeam.length === 0) {
      this.level += 1;

      for (const player of this.playerTeam) {
        player.character.level += 1;

        player.character.attack = Math.floor(
          Math.max(
            player.character.attack,
            (player.character.attack * (60 + player.character.health)) / 100
          )
        );
        player.character.defence = Math.floor(
          Math.max(
            player.character.defence,
            (player.character.defence * (60 + player.character.health)) / 100
          )
        );

        player.character.health = 100;
      }

      if (this.level <= 4) {
        this.upLevel();
      }
    }
  }

  upLevel() {
    const playerCharacters = this.position;

    this.newTeam = this.createTeamOnBoard();
    this.gamePlay.drawUi(themesLevel[this.level]);
    this.newTeam.splice(0, playerCharacters.length);
    this.gamePlay.redrawPositions(this.newTeam);
    this.position.push(...this.newTeam);
  }

  onNewGameClick() {
    this.level = 1;
    this.score = 0;
    this.position = [];

    this.team = this.createTeamOnBoard();
    this.gamePlay.drawUi(themesLevel[this.level]);
    this.gamePlay.redrawPositions(this.team);
    this.position.push(...this.team);

    if (this.gamePlay.cellClickListeners.length === 0) {
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    }
  }

  onSaveGameClick() {
    const savedGame = {
      level: this.level,
      position: this.position,
      score: this.score,
    };

    const gameState = GameState.from(savedGame);
    this.stateService.save(gameState);
    GamePlay.showMessage('The game is saved!');
  }

  onLoadGame() {
    const loadedGame = this.stateService.load();
    if (!loadedGame) GamePlay.showError('Error! Update the page!');

    this.level = loadedGame.level;
    this.position = loadedGame.position;
    this.score = loadedGame.score;
    this.gamePlay.drawUi(themesLevel[this.level]);
    this.gamePlay.redrawPositions(this.position);
  }
}
