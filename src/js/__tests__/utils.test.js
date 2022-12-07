import { calcTileType } from '../utils';

describe('should be a correct position', () => {
  test('should be a top-left', () => {
    expect(calcTileType(0, 5)).toBe('top-left');
  });
  test('should be a top-right', () => {
    expect(calcTileType(4, 5)).toBe('top-right');
  });
  test('should be a center', () => {
    expect(calcTileType(30, 8)).toBe('center');
  });
  test('should be a top', () => {
    expect(calcTileType(4, 6)).toBe('top');
  });
  test('should be a bottom-right', () => {
    expect(calcTileType(99, 10)).toBe('bottom-right');
  });
  test('should be a left', () => {
    expect(calcTileType(10, 5)).toBe('left');
  });
  test('should be a right', () => {
    expect(calcTileType(20, 7)).toBe('right');
  });
});
