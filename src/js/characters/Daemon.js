import Character from '../Character';

export default class Daemon extends Character {
  constructor(level) {
    super(level, 'daemon');
    this.attack = Math.floor(15 * (1 + level * 0.15));
    this.defence = Math.floor(35 * (1 + level * 0.15));
    this.moveDistance = 1;
    this.attackDistance = 4;
  }
}
