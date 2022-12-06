import Character from '../Character';

test('should throw an error when creating new Character', () => {
  expect(() => new Character(1)).toThrow(
    'This is the base class. Choose your character'
  );
});
