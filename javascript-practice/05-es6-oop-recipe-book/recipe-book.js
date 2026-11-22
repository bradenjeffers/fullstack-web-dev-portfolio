'use strict';

/** A single recipe. Ingredients are stored as a trimmed array. */
class Recipe {
  constructor({ title, ingredients, instructions }) {
    this.title = String(title).trim();
    this.ingredients = Array.isArray(ingredients)
      ? ingredients.map((i) => String(i).trim()).filter(Boolean)
      : String(ingredients).split(',').map((i) => i.trim()).filter(Boolean);
    this.instructions = String(instructions).trim();

    if (!this.title || this.ingredients.length === 0 || !this.instructions) {
      throw new Error('A recipe needs a title, at least one ingredient and instructions.');
    }
  }
}

/**
 * In-memory collection of recipes with CRUD operations.
 * Kept free of any DOM code so it can be unit-tested in Node.
 */
class RecipeBook {
  constructor(initialRecipes = []) {
    this.recipes = initialRecipes.map((r) => new Recipe(r));
  }

  get size() {
    return this.recipes.length;
  }

  add(data) {
    const recipe = new Recipe(data);
    this.recipes.push(recipe);
    return recipe;
  }

  update(index, data) {
    this.#assertIndex(index);
    this.recipes[index] = new Recipe(data);
    return this.recipes[index];
  }

  remove(index) {
    this.#assertIndex(index);
    return this.recipes.splice(index, 1)[0];
  }

  get(index) {
    this.#assertIndex(index);
    return this.recipes[index];
  }

  toJSON() {
    return this.recipes;
  }

  #assertIndex(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.recipes.length) {
      throw new RangeError(`No recipe at index ${index}`);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Recipe, RecipeBook };
}
