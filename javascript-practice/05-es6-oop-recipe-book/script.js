'use strict';

const STORAGE_KEY = 'recipe-book.v1';

const form = document.getElementById('recipe-form');
const titleInput = document.getElementById('title');
const ingredientsInput = document.getElementById('ingredients');
const instructionsInput = document.getElementById('instructions');
const submitButton = document.getElementById('add-recipe-btn');
const cancelButton = document.getElementById('cancel-edit-btn');
const messageEl = document.getElementById('form-message');
const recipeListEl = document.getElementById('recipes');

// Index of the recipe currently being edited, or null when adding a new one.
let editIndex = null;

/* ---------- persistence (best effort: storage can be blocked or full) ---------- */

function loadSavedRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecipes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
  } catch {
    /* ignore: the app still works for this session */
  }
}

let book;
try {
  book = new RecipeBook(loadSavedRecipes());
} catch {
  book = new RecipeBook(); // corrupt saved data: start fresh
}

/* ---------- rendering ---------- */

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.toggle('error', isError);
}

function labelledParagraph(label, value) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = `${label}: `;
  p.append(strong, document.createTextNode(value));
  return p;
}

function actionButton(text, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.addEventListener('click', handler);
  return button;
}

/** Build the card for one recipe. Only textContent is used, so user input can never inject HTML. */
function createRecipeItem(recipe, index) {
  const li = document.createElement('li');

  const heading = document.createElement('h3');
  heading.textContent = recipe.title;

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(
    actionButton('Edit', () => startEdit(index)),
    actionButton('Delete', () => deleteRecipe(index))
  );

  li.append(
    heading,
    labelledParagraph('Ingredients', recipe.ingredients.join(', ')),
    labelledParagraph('Instructions', recipe.instructions),
    actions
  );
  return li;
}

function displayRecipes() {
  if (book.size === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No recipes yet. Add your first one above.';
    recipeListEl.replaceChildren(empty);
    return;
  }
  recipeListEl.replaceChildren(...book.recipes.map(createRecipeItem));
}

/* ---------- form state ---------- */

function clearInputFields() {
  form.reset();
}

function setEditMode(index) {
  editIndex = index;
  const editing = index !== null;
  submitButton.textContent = editing ? 'Save Changes' : 'Add Recipe';
  cancelButton.hidden = !editing;
}

function startEdit(index) {
  const recipe = book.get(index);
  titleInput.value = recipe.title;
  ingredientsInput.value = recipe.ingredients.join(', ');
  instructionsInput.value = recipe.instructions;
  setEditMode(index);
  showMessage(`Editing "${recipe.title}".`);
  titleInput.focus();
}

function deleteRecipe(index) {
  const removed = book.remove(index);
  // Keep the edit state consistent if the list shifted under it.
  if (editIndex === index) {
    clearInputFields();
    setEditMode(null);
  } else if (editIndex !== null && index < editIndex) {
    setEditMode(editIndex - 1);
  }
  saveRecipes();
  displayRecipes();
  showMessage(`Deleted "${removed.title}".`);
}

/* ---------- events ---------- */

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = {
    title: titleInput.value,
    ingredients: ingredientsInput.value,
    instructions: instructionsInput.value,
  };

  try {
    if (editIndex === null) {
      book.add(data);
      showMessage('Recipe added.');
    } else {
      book.update(editIndex, data);
      showMessage('Recipe updated.');
    }
  } catch (err) {
    showMessage(err.message, true);
    return;
  }

  setEditMode(null);
  clearInputFields();
  saveRecipes();
  displayRecipes();
});

cancelButton.addEventListener('click', () => {
  setEditMode(null);
  clearInputFields();
  showMessage('Edit cancelled.');
});

displayRecipes();
