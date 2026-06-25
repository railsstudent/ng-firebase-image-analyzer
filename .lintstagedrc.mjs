export default {
  // Lint and format JavaScript, TypeScript, and JSX files
  '*.{ts,js}': ['prettier --write', 'eslint --fix'],

  // Format CSS, SCSS, HTML, and mjs files
  '*.{css,scss,html,mjs,json}': ['prettier --write'],
};
