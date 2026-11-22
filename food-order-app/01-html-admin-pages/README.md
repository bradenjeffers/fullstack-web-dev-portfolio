# Food Order App, Stage 1: HTML Admin Pages

Semantic, unstyled HTML for the admin side of a food-ordering app: a dashboard, four list pages and four "add" forms.

## Overview

This is the first stage of the Food Order App series, which was built up layer by layer through a Great Learning full-stack course (HTML, then CSS, then JavaScript, React, Node, SQL and NoSQL). Here the goal was structure only: correct elements, accessible forms and tables, no styling. The next stage, `../02-css-admin-dashboard`, uses the same pages with a stylesheet.

## Pages

| Page | Contents |
| --- | --- |
| `index.html` | Admin dashboard linking to every section |
| `pages/list_fooditems.html` | Table of food items (category, cuisine, availability, vegetarian) |
| `pages/list_cuisines.html`, `list_categories.html`, `list_restaurants.html` | Data tables |
| `pages/add_fooditem.html`, `add_cuisine.html`, `add_category.html`, `add_restaurant.html` | Forms |

## Getting started

Open `index.html` in a browser. There is nothing to install or build.

## What I practised

- Semantic structure: `<header>`, `<nav>`, `<main>`, `<fieldset>`/`<legend>`, `<table>` with `<thead>`/`<tbody>`/`<caption>`
- Choosing the right input types (`url`, `tel`, `checkbox`, `select`, `textarea`) and wiring every control to a `<label>`
- Writing accessible tables (`scope="col"`) and images (`alt`, `width`, `loading="lazy"`)

## Improvements over the original assessment version

- **Wrong headings fixed:** the "All Food Items" page used the headers "Cuisine Number" and "Cuisine Name"; it now lists the right columns (No., Name, Description, Available?, Vegetarian?, Category, Cuisine, Image).
- **Typos fixed:** "Restraunt", "Adress", "Kignston", "Vegeterian" and a stray page title of "Document".
- **Navigation:** every page has the same nav bar and the current page is marked with `aria-current`. The original pages had no links back to the dashboard.
- **Dashboard placeholders:** "View Orders" and "View Registered Users" linked to `href=""`, which just reloads the page; they are now plainly marked "coming soon".
- **Forms:** `required` on essential fields, `type="tel"` for phone numbers (one version used `type="number"`), `type="url"` for image links, grouped in a `<fieldset>`.
- **Consistent data:** list pages and form drop-downs use the same categories and cuisines, so the data is coherent across pages.
- Pages share one structure instead of nine slightly different ones.

## Limitations

These pages are static: forms don't save anything and the Edit buttons do nothing. Later stages in this series add behaviour (`../03-react-frontend` onward). Images are hotlinked from third-party sites. Unstyled, the widest table scrolls sideways on a phone.

## Status

All 9 pages load in headless Chromium, every internal link resolves, and every form control has a label. The HTML was not run through the W3C validator.
