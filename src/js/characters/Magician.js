import Character from '../Character';

export default class Magician extends Character {
  constructor(level) {
    super(level, 'magician');
    this.attack = Math.floor(10 * (1 + level * 0.15));
    this.defence = Math.floor(40 * (1 + level * 0.15));
    this.moveDistance = 4;
    this.attackDistance = 4;
  }
}
