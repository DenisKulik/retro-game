import themes from './themes';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
  }

  // onCellClick(index) {}

  // onCellEnter(index) {}

  // onCellLeave(index) {}
}
