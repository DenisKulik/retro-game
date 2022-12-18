import Character from '../Character';

export default class Bowman extends Character {
  constructor(level) {
    super(level, 'bowman');
    this.attack = Math.floor(25 * (1 + level * 0.15));
    this.defence = Math.floor(25 * (1 + level * 0.15));
    this.moveDistance = 2;
    this.attackDistance = 2;
  }
}
