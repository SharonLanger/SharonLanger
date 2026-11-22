# Editing your profile

Edit `data/profile.json` for your name, headline, About text, checklist, social links, skill names/icons, and `layout.projectsPerRow` (1–4). Edit `data/projects.json` to add or reorder projects. Set `featured` to `true` to display a project. One JSON object plus regeneration is enough; do not edit the generated README or SVGs by hand.

Requires Node.js 22.6 or newer. No `npm install` or external runtime dependencies are needed.

```bash
npm run build    # regenerate README and SVGs; remove obsolete generated SVGs
npm run test     # validate the config and rows with 3, 4, 5, and 6 projects
npm run check    # verify all generated files, including removal of obsolete ones
npm run preview  # render the actual generated markup in .profile-preview/index.html
```

Project icons: `bot`, `bolt`, `layers`, `flask` (other values use the default icon). All text in the designed sections is generated from JSON as vector glyphs using the locally included Silkscreen font, under the SIL Open Font License (see `assets/fonts/OFL.txt`). The font outlines are committed in `scripts/pixel-glyphs.ts` so generation requires no font tooling or external resources. For best results use Latin letters, digits and common punctuation; unsupported characters appear as `?` in artwork, though their original wording remains in image alt text. The scene remains a separate WebP asset. `avatar-circle.png` is the transparent portrait embedded by the generator into desktop identity SVGs; `avatar.webp` preserves the original portrait.

Each project image is one link to its repository. Optional `docs` and `demo` URLs are validated in JSON but are not shown within the linked card; include those links in the project repository when needed. Social links with empty URLs are hidden. Keep URLs real and `https://` only.

## GitHub rendering

GitHub sanitizes CSS and JavaScript, so layout uses linked images in borderless paragraphs. The default is two cards per group. Desktop shows full cards and a portrait to the left of the name; on narrow screens GitHub selects compact cards and an identity without the portrait. Remaining pairs unfold through native `<details>` controls labeled “Next projects.” GitHub cannot run a real side-arrow carousel or swipe-to-next JavaScript in a README. The light and dark text assets use `<picture>` and `prefers-color-scheme`. Exact breakpoints still depend on the viewer viewport. The local preview displays the generated markup but is not a replacement for the GitHub-rendered PR README.

SVG outline lettering stays visually consistent on different machines. Its letters are not selectable like ordinary HTML text; the README supplies descriptive `alt` text and meaningful link labels for accessibility and its source retains the searchable wording. The optional project links are not interactive inside a card image; the whole image navigates to the repository.

The repo must be public and named exactly like the username before its `main` README appears on the GitHub profile. Keep this PR open for review until the profile is visually approved.
