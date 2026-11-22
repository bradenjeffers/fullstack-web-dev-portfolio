'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Recipe, RecipeBook } = require('./recipe-book');

const pancakes = { title: 'Pancakes', ingredients: 'flour, eggs, milk', instructions: 'Mix and fry.' };

test('Recipe parses comma-separated ingredients and trims whitespace', () => {
  const r = new Recipe({ ...pancakes, title: '  Pancakes ', ingredients: ' flour ,eggs,, milk ' });
  assert.equal(r.title, 'Pancakes');
  assert.deepEqual(r.ingredients, ['flour', 'eggs', 'milk']);
});

test('Recipe rejects missing fields', () => {
  assert.throws(() => new Recipe({ ...pancakes, title: '   ' }));
  assert.throws(() => new Recipe({ ...pancakes, ingredients: ' , ' }));
  assert.throws(() => new Recipe({ ...pancakes, instructions: '' }));
});

test('RecipeBook add / get / update / remove', () => {
  const book = new RecipeBook();
  book.add(pancakes);
  book.add({ title: 'Toast', ingredients: 'bread', instructions: 'Toast it.' });
  assert.equal(book.size, 2);
  assert.equal(book.get(1).title, 'Toast');

  book.update(0, { ...pancakes, title: 'Crepes' });
  assert.equal(book.get(0).title, 'Crepes');

  const removed = book.remove(0);
  assert.equal(removed.title, 'Crepes');
  assert.equal(book.size, 1);
  assert.equal(book.get(0).title, 'Toast');
});

test('RecipeBook rejects bad indexes', () => {
  const book = new RecipeBook();
  assert.throws(() => book.get(0), RangeError);
  assert.throws(() => book.remove(-1), RangeError);
  assert.throws(() => book.update(1.5, pancakes), RangeError);
});

test('RecipeBook round-trips through JSON (used for localStorage)', () => {
  const book = new RecipeBook();
  book.add(pancakes);
  const restored = new RecipeBook(JSON.parse(JSON.stringify(book)));
  assert.deepEqual(restored.recipes, book.recipes);
});

test('a failed update leaves the existing recipe untouched', () => {
  const book = new RecipeBook([pancakes]);
  assert.throws(() => book.update(0, { ...pancakes, title: '' }));
  assert.equal(book.get(0).title, 'Pancakes');
});
