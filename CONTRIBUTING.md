# Editing your profile

Edit `data/profile.json` for your name, headline, About text, checklist, social links, skill names/icons, `layout.projectsPerRow` (1–4). Edit `data/projects.json` to add or reorder projects. Set `featured` to `true` to display a project. One JSON object plus regeneration is enough; do not edit the generated README or SVGs by hand.

Requires Node.js 22.6 or newer. No `npm install` or external runtime dependencies are needed.

```bash
npm run build    # regenerate README and SVGs; remove obsolete generated files
npm run test     # validate config, featured selection, links, and rows with 3–6 projects
npm run check    # verify all generated files, including removal of obsolete ones
npm run preview  # render the actual generated markup in .profile-preview/index.html
```

Project icons: `bot`, `bolt`, `layers`, `flask` (other values use the default icon). All text in the designed sections is generated from JSON as vector glyphs using the locally included Silkscreen font, under the SIL Open Font License (see `assets/fonts/OFL.txt`). The font outlines are committed in `scripts/pixel-glyphs.ts` so generation requires no font tooling or external resources. For best results use Latin letters, digits and common punctuation; unsupported characters appear as `?` in artwork, though their original wording remains in image alt text. The scene remains a separate WebP asset. `avatar-circle.png` is the transparent portrait embedded by the generator into desktop identity SVGs; `avatar.webp` preserves the original portrait.

Each project image is one link to its repository. Optional `docs` and `demo` URLs are validated in JSON but are not shown within the linked card; include those links in the project repository when needed. Social links with empty URLs are hidden. Keep URLs real and `https://` only.

## GitHub rendering

The README displays all projects marked `featured: true` on one page, in JSON order. The three selected showcase projects are Agent Playbook, Claude Backstage, and System One Harness. Other project entries remain available in JSON but are hidden with `featured: false`; the top **All projects** link opens the repository list.

`projectsPerRow` controls the maximum number of cards per row. Fixed-width linked cards wrap on narrow screens, keeping descriptions and tags readable. There are no paging controls or additional project pages. Narrow screens select an identity without the portrait and a stacked About → checklist → Tech & Tools illustration. Wider screens put the portrait beside the name and Tech & Tools to the right of About. The light and dark text assets use `<picture>` and `prefers-color-scheme`. The local preview displays the generated markup; inspect GitHub for final rendering.

SVG outline lettering stays visually consistent on different machines. Its letters are not selectable like ordinary HTML text; the README supplies descriptive `alt` text and meaningful link labels for accessibility and its source retains the searchable wording. The optional project links are not interactive inside a card image; the whole image navigates to the repository.

The repo must be public and named exactly like the username before its `main` README appears on the GitHub profile. Keep this PR open for review until the profile is visually approved.
