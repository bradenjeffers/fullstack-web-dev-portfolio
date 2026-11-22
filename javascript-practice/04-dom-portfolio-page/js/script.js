'use strict';

// Inline SVG shown when a project image fails to load (no extra network request).
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="192" viewBox="0 0 240 192">' +
      '<rect width="240" height="192" fill="#d9d4cf"/>' +
      '<text x="120" y="102" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#6b625b">No image</text>' +
    '</svg>'
  );

const projectsContainer = document.getElementById('projects');
const form = document.getElementById('project-form');
const messageEl = document.getElementById('form-message');

/** Build one project card with DOM APIs (textContent, never innerHTML, so user input can't inject markup). */
function createProjectCard(project) {
  const card = document.createElement('article');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = project.image;
  img.alt = project.title;
  img.loading = 'lazy';
  img.addEventListener('error', () => { img.src = FALLBACK_IMAGE; }, { once: true });

  const title = document.createElement('h3');
  title.textContent = project.title;

  const description = document.createElement('p');
  description.textContent = project.description;

  card.append(img, title, description);
  return card;
}

/** Render every project in the `projects` array into the page. */
function loadProjects() {
  projectsContainer.replaceChildren(...projects.map(createProjectCard));
}

/** Next unused id (max existing id + 1, or 1 for an empty list). */
function newProjectId() {
  return projects.reduce((max, project) => Math.max(max, project.id), 0) + 1;
}

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.toggle('error', isError);
}

/** Only allow http(s) image URLs (blocks javascript: and data: URLs from the form). */
function isHttpUrl(value) {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function saveNewProject(event) {
  event.preventDefault();

  const title = form.elements.title.value.trim();
  const description = form.elements.desc.value.trim();
  const image = form.elements.image.value.trim();

  if (!title || !description || !image) {
    showMessage('Please fill in all fields.', true);
    return;
  }
  if (!isHttpUrl(image)) {
    showMessage('Image must be a valid http(s) URL.', true);
    return;
  }

  projects.push({ id: newProjectId(), title, description, image });
  loadProjects();
  form.reset();
  showMessage(`Added "${title}".`);
  form.elements.title.focus();
}

form.addEventListener('submit', saveNewProject);
loadProjects();
