# Cloudflare Pages

## Deployment

1. Push this project to a GitHub repository.
2. Open Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages.
3. Select "Import from an existing Git repository" and choose the repository.
4. Use these build settings:

```
Build command: npm run build
Build output directory: dist
Root directory: /
```

5. Click "Save and Deploy".

After deployment, the site will be available at:

```
https://PROJECT_NAME.pages.dev
```

## Local Check

Run this before pushing changes:

```
npm run build
```

The file `public/_redirects` is copied into `dist` during the Vite build and lets Cloudflare serve the React app from `index.html` for direct page reloads.
