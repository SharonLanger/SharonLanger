# Editing your profile

The profile is code-generated, not a single flattened screenshot.

## Quick start

Requires Node.js 22 or newer. No npm install or external dependencies are needed.

```bash
npm run build    # generate README and SVG assets
npm run check    # fail if generated files are out of sync
npm run test     # validate configuration and 3/4/5-card layouts
npm run preview  # write .profile-preview/index.html for a local visual check
```

Edit `data/profile.json` for your name, headline, About text, checkmarks, links, skills, and `layout.projectsPerRow` (1-4). Edit `data/projects.json` for project cards (title, icon, description, up to three tags, repo/docs/demo URLs, featured flag). Order in the array is display order.

Supported project card icons: `bot`, `bolt`, `layers`, `flask` (other values use the default icon). All cards and skills are generated as local SVGs. No scripts run in GitHub's README viewer.

A project must have a real `https://` repository link. Optional docs/demo URLs can be empty and are then hidden. Social URLs are also hidden when empty: update LinkedIn and Hashnode URLs when available. Please do **not** add placeholder links or fabricated popularity numbers.

The original pixel-art **hero, avatar and footer** are stored as optimized WebP assets under `assets/`; they preserve the approved illustrated look. Replacing or modifying the scenery requires editing those image assets. All project cards and skill badges are generated deterministically as local SVGs by `scripts/art.ts`, so adding a new project does not change the scenery. No font files, third-party tracking, hosted badge generators, or npm runtime dependencies.

## Limitations

GitHub sanitizes custom CSS and JavaScript; a real interactive carousel won't work. The README uses a fixed-column HTML table with rows of SVG cards and clickable links. On narrower screens GitHub may permit horizontal table scrolling. The local preview approximates GitHub's renderer; use the pull-request README view to verify the final layout, particularly dark/light themes and mobile.

This repository must stay public and named exactly like the owner's username for GitHub's special profile README behavior.
