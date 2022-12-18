export default class GameState {
  static from(object) {
    return typeof object === 'object' ? object : null;
  }
}
