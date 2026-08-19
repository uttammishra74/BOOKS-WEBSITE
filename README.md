# Freebookleaf

A static book discovery site powered by Open Library.

## Files

- `index.html` - main app entry point
- `Freebookleaf.css` - styles
- `Freebookleaf.js` - app logic

## Deploying

### GitHub Pages

1. Create a GitHub repository and add these files.
2. Commit and push to the `main` branch.
3. In the GitHub repository settings, enable GitHub Pages from the `main` branch.
4. Visit the provided URL.

If you want the site at the repository root, use `index.html` directly.

### Netlify

1. Create an account at netlify.com.
2. Drag and drop the project folder onto Netlify, or connect the repository.
3. Netlify will publish a live URL.

### Surge

1. Install Surge: `npm install -g surge`
2. From the project folder: `surge .`

### Local preview

Run a simple local server and open the site:

- Python: `python -m http.server 8000`
- Node: `npx http-server .`
