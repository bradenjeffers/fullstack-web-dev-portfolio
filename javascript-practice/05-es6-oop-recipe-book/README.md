# Recipe Book (ES6 Classes)

Add, edit and delete recipes in the browser. Recipes are saved in `localStorage`.

## Overview

Originally "JavaScript ES6 and OOP, Part 1" from a Great Learning full-stack course, where the task was to fill in five functions in a procedural script. I rebuilt the data handling as ES6 classes (`Recipe`, `RecipeBook`) so it can be unit-tested, and kept the UI in a separate file.

## Features

- Add, edit (with a Cancel button) and delete recipes
- Comma-separated ingredients are parsed into a clean array
- Validation messages in the page (no `alert`)
- Recipes persist across reloads (best effort; the app works without storage)

## Getting started

Open `index.html` in a browser. Tests need Node.js 18+:

```bash
node --test
```

## Project structure

```
index.html
style.css
recipe-book.js        Recipe and RecipeBook classes (no DOM code)
script.js             UI: rendering, events, localStorage
recipe-book.test.js   unit tests for the classes
```

## What I practised

- ES6 classes, private methods (`#assertIndex`), getters, and `toJSON`
- Separating data logic from DOM code so the logic can be tested in Node
- Event handling without inline attributes, and DOM updates without `innerHTML`
- `localStorage` with `try/catch` for when storage is blocked or the saved data is corrupt

## Improvements over the original assessment version

- **XSS fix:** the original built each card with an `innerHTML` template string containing the user's text, so a title like `<img onerror=...>` would execute. Cards now use `textContent`.
- **No inline handlers:** `onclick="editRecipe(3)"` attributes replaced with real listeners, and Edit/Delete are `<button type="button">`s.
- **Edit mode:** in the original, deleting any recipe silently cancelled an edit in progress and wiped the form, and there was no way to cancel an edit. The edit index is now kept consistent when other recipes are deleted, and there is a Cancel button.
- **Validation lives in the class:** a recipe without a title, ingredients or instructions can't be created, and a failed update leaves the existing recipe untouched (tested).
- **Broken background fixed:** the original CSS used an expiring stock-photo URL (the link carried an expiry timestamp); replaced by a CSS gradient.
- CSS cleaned up (duplicated rules and comments removed), accessible labels, visible focus, `aria-live` messages, an empty-state message.

## Limitations

Ingredients are a flat list (no quantities or units). Data lives only in this browser's `localStorage`.

## Status

6 unit tests pass on Node 22. In headless Chromium (Playwright) I checked add, edit, delete, persistence across reload, validation, and that markup in a title is rendered as text. There are no automated browser tests in the repo.
